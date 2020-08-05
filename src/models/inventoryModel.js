import mongoose, {Schema} from 'mongoose';
import {ItemsCategory} from '../constants/enum';

const inventorySchema = new Schema({
    itemName: {
        type: String,
        required: true
    },
    itemDescription: {
        type: String
    },
    itemCategory: {
        type: String,
        enum: Object.keys(ItemsCategory),
        required: true
    },
    outOfStock: {
        type: Boolean,
        required: true,
        default: false
    },
    stockCount: {
        type: Number,
        required: true
    },
    itemMrp: {
        type: Number
    },
    itemSellingPrice: {
        type: Number
    },
    itemImage: [{
        link: {
            type: String
        },
        name: {
            type: String
        }
    }],
    brandName: {
        type: String
    },
    brandDescription: {
        type: String
    },
    brandImage: {
        type: String
    }
});

export default mongoose.model('inventoryModel', inventorySchema);