import {CartRules, InventoryStockOperation, OrderStatus, OrderTypes} from "../constants/enum";
import inventoryModel from '../models/inventoryModel';
import {redis} from '../utils/cache';

const validateItemsForOrder = {
    [CartRules.CART_ORDER_VALUE_RULE]: {
        service: (cart) => {
            if (+cart.cartValue !==
                +(cart.items.reduce((totalValue, item) => totalValue + (item.quantity * item.price), 0))) {
                throw (`The Cart value does not match the items prices!`);
            }
        }
    },
    [CartRules.ITEM_OUT_OF_STOCK_RULE]: {
        service: async (cart) => {
            return Promise.all(cart.items.map(async item => {
                let inventoryItem = await inventoryModel.findById(item.item);
                /**
                 * CHECKING IF THE ITEM IS NOT OUT OF STOCK FROM REDIS CACHE!
                 * */
                let itemStockCache = await getOrSetItemStockCache(inventoryItem);
                if (+itemStockCache < +item.quantity) {
                    throw new Error(`Item ${inventoryItem.itemName} is not in stock!`);
                }

                /** CHECKING ITEM STOCK COUNT FROM DB */
                if (inventoryItem.outOfStock || inventoryItem.stockCount < item.quantity) {
                    throw new Error(`Item ${inventoryItem.itemName} is out of stock!`);
                }
                if (+inventoryItem.itemSellingPrice !== +item.price) {
                    throw new Error(`Item Price mismatch!`);
                }
            }));
        }
    }
};

/** Order Cart Validation engine */
export const orderItemsRuleEngine = async (orderItems) => {
    return Promise.all(Object.keys(validateItemsForOrder).map(async rule => {
        let {service} = await validateItemsForOrder[rule];
        return service(orderItems);
    }));
};

/** Determine Order State and its operations */
export const computeOrderStateAndOperations = (payLoad) => {
    let orderStatus;
    console.log("INSIDE ORDER CHECK");
    switch (payLoad.orderType) {
        case OrderTypes.PREPAID:  /** ORDER PAYMENT MUST BE MADE BEFORE PLACING THE ORDER */
            /**
             *  TODO - CHECK THE STATUS OF THE PAYMENT - (Payment Model)
             * IF THE PAYMENT IS NOT YET PAID, ORDER STATE IS IN PENDING STATE. NOTIFY THE USER TO COMPLETE PAYMENT
             * IF PAYMENT IS PAID ORDER IS ACCEPTED
             */
            /** TODO - orderStatus = OrderStatus.PENDING;
             * In case of no payment made */

            orderStatus = OrderStatus.ACCEPTED;
            break;

        case OrderTypes.POSTPAID: /** ORDER PAYMENT CAN BE MADE DURING THE DELIVERY */
            orderStatus = OrderStatus.ACCEPTED;
            break;

        default:
            break;
    }
    console.log("order status", orderStatus);
    return orderStatus;
};

export const orderValueValidation = (payload) => {
    if (payload.orderValue !== (payload.cart.cartValue + (payload.serviceCharge || 0))) {
        throw new Error(`The order value for this cart is not correct!`);
    }
};

/** FETCHING THE STOCK COUNT FROM REDIS, IF NOT PRESENT SETTING THE ITEM CACHE! */
export const getOrSetItemStockCache = async (item) => {
    let itemCache = await redis.get(`${item._id}`);
    if (!itemCache) {
        itemCache = await redis.set(`${item._id}`, item.stockCount, 'EX', 10000000);
    }
    return itemCache;
};

/**
 * @params Order Payload & Operation on stock count!
 * INCREMENTS/DECREMENTS THE STOCK COUNT THE PRICE USING REDIS TRANSACTIONS.
 * PREVENTS RACE CONDITIONS.
 * */
export const updateItemCacheStockCount = async (payload, stockOperation) => {
    switch (stockOperation) {
        case InventoryStockOperation.INCREMENT:
            await Promise.all(payload.cart.items.map(async item => {
                await increaseStockCountCache(item);
            }));
            break;

        case InventoryStockOperation.DECREMENT:
            await Promise.all(payload.cart.items.map(async item => {
                await decreaseStockCountCache(item);
            }));
            break;

        default:
            break;
    }
    return ;
};

/** INCREASES THE STOCK COUNT MAINTAINING THE ATOMICITY IN THE CACHE */
const increaseStockCountCache = async (item) => {
    await redis.watch(`${item._id}`);
    return redis.multi()
        .get(`${item._id}`)
        .incrby(`${item._id}`, item.quantity)
        .exec((e, result) => {
            if (!e && !result) {
                throw new Error(`Conflict detected in stock count increment update!`);
            }
        });
};

/** DECREASES THE STOCK COUNT MAINTAINING THE ATOMICITY IN THE CACHE */
const decreaseStockCountCache = async (item) => {
    await redis.watch(`${item._id}`);
    return redis.multi()
        .get(`${item._id}`)
        .decrby(`${item._id}`, item.quantity)
        .exec((e, result) => {
            if (!e && !result) {
                throw new Error(`Conflict detected in stock count decrement update!`);
            }
        });
};