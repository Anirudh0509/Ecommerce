import {InventoryStockOperation} from "../constants/enum";
import inventoryModel from "../models/inventoryModel";
import {SampleInventory} from '../constants/sampleInventory';
import {redis} from '../utils/cache';

/** UPDATE THE INVENTORY ITEMS */
export const updateInventoryItemStock = async (cart, stockOperation) => {
    switch (stockOperation) {
        case InventoryStockOperation.DECREMENT:
            /**
             * REDUCING THE INVENTORY ITEM COUNT AS THE ITEM HAS BEEN PURCHASED
             * */
            await Promise.all(cart.items.map(async item => {
                let inventoryItem = await inventoryModel.findById(item.item);
                return inventoryModel.update({_id: inventoryItem._id}, {
                    stockCount: inventoryItem.stockCount - item.quantity,
                    outOfStock: ((inventoryItem.stockCount - item.quantity) === 0) ? true : false
                });
            }));
            break;

        case InventoryStockOperation.INCREMENT:
            /**
             * INCREASING THE STOCK COUNT AS THE ORDER PLACED HAS BEEN DECLINED/CANCELLED.
             * */
            await Promise.all(cart.items.map(async item => {
                let inventoryItem = await inventoryModel.findById(item.item);
                return inventoryModel.update({_id: inventoryItem._id}, {
                    stockCount: inventoryItem.stockCount + item.quantity,
                    outOfStock: ((inventoryItem.stockCount + item.quantity) > 0) ? false : true
                });
            }));
            break;

        default:
            break;
    }
    return ;
};

/** ADDING ITEMS TO THE INVENTORY */
export const createInventory = async (payload) => {
    /**
     * TODO -
     * INVENTORY CREATION WITH ALL THE CHECKS RELATED TO MERCHANT TYPES
     * PRODUCTS AND OTHER UTILITIES.
     * */
    return inventoryModel.create(payload);
};

/** SAMPLE INVENTORY UPLOADING SCRIPT ONCE THE SERVER STARTS */
export const inventoryUploadScript = async () => {
    /** Sample Inventory Data created in DB.*/
    return Promise.all(SampleInventory.map(async inventory => {
        let inventoryData = await inventoryModel.findOne({itemName: inventory.itemName});

        if (!inventoryData) {
            /** CREATING INVENTORY IN DB*/
            let item = await createInventory(inventory);

            /**
             * CACHING LAYER TO SET THE STOCK COUNT OF THE ITEM
             * */
            await redis.set(`${item._id}`, item.stockCount, 'EX', 10000000);
        }
        return ;
    }));
};