import orderModel from "../models/orderModel";
import accountsModel from "../models/accountsModel";
import {nanoid} from 'nanoid';
import {OrderStatus, OrderTypes, InventoryStockOperation} from "../constants/enum";
import {orderItemsRuleEngine, computeOrderStateAndOperations, orderValueValidation, updateItemCacheStockCount} from '../utils/helper';
import {updateInventoryItemStock} from '../services/inventoryService';

/**
 * NOTE: TO PREVENT RACE CONDITIONS ON STOCK COUNT FOR INVENTORY ITEMS WE ARE STORING THE ITEM COUNT IN CACHE.
 * TODO - IN CASE THE ORDER IS SUCCESSFULLY PLACED THE STOCK COUNT IS UPDATED IN THE DB ACCORDINGLY
 * TODO - IN CASE THE ORDER IS NOT SUCCESSFULLY PLACES THE STOCK COUNT IN THE CACHE IS INCREMENTED.
 *
 * TO AVOID RACE CONDITIONS - WE ARE USING REDIS TRANSACTIONS TO MAINTAIN ATOMICITY IN THE STOCK COUNT ON AN ITEM!
 * */

export const createOrder = async (payload) => {
    try {
        /** CHECK IF USER ACCOUNT IS CREATED, IF NOT CREATE USER ACCOUNT BEFORE PLACING AN ORDER! */
        const accountDetails = await accountsModel.findOne({
            user: payload.user
        });
        if (!accountDetails) {
            throw new Error(`Kindly create the user account first!`);
        }

        /**
         * Validates if the cart prices and quantity are correct.
         * Validates if the cart item is in stock!
         * Validates if the cart item price matches the inventory pricing.
         * @params {array} contains order cart items with price and quantity.
         * @return {void}
         */
        await orderItemsRuleEngine(payload.cart);

        /**
         * @params {object} order value validation wrt cart value and other service and delivery charges.
         * */
        orderValueValidation(payload);

        /**
         * @params Order Payload & Operation on stock count!
         * RUNS REDIS TRANSACTIONS TO ATOMICALLY REDUCE THE STOCK COUNT PREVENTING RACE CONDITIONS.
         * */
        await updateItemCacheStockCount(payload, InventoryStockOperation.DECREMENT);

        /** Determines the current state of order.*/
        let status = computeOrderStateAndOperations(payload);

        if (status === OrderStatus.ACCEPTED) {
            /**
             * REDUCE THE STOCK COUNT FROM INVENTORY AND UPDATE THE outOfStock BOOLEAN FLAG TO TRUE IF THE stockCount = 0
             * */
            await updateInventoryItemStock(payload.cart, InventoryStockOperation.DECREMENT);
        }

        /** PLACE THE ORDER AFTER ALL THE CHECKS */
        return orderModel.create({
            orderId: (nanoid(10)).toUpperCase(), /** Creates a unique orderId of 10 characters for each order */
            orderType: payload.orderType || OrderTypes.POSTPAID, /** Determines if the order payment should be made in advance or at the time of delivery*/
            orderValue: payload.orderValue,
            status,
            account: accountDetails._id,
            cart: payload.cart /** array of cart items, prices and quantity. */,
            serviceCharge: payload.serviceCharge || 0 /** Extra taxes and service/delivery charges on order */
        });

    } catch (e) {
        console.log(`ERROR IN createOrder API`, e);
        /**
         * @params Order Payload & Operation on stock count!
         * RUNS REDIS TRANSACTIONS TO ATOMICALLY INCREASE THE STOCK COUNT BACK PREVENTING RACE CONDITIONS.
         * */
        await updateItemCacheStockCount(payload, InventoryStockOperation.INCREMENT);
        throw e;
    }
};
