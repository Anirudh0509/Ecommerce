import mongoose, {Schema} from 'mongoose';
import {OrderStatus, OrderTypes, ModelNames} from "../constants/enum";

const orderSchema = new Schema({
    orderId: {
        type: String,
        required: true
    },
    orderType: {
        type: String,
        enum: Object.keys(OrderTypes),
        required: true,
        default: OrderTypes.POSTPAID
    },
    orderValue: {
        type: Number,
        required: true
    },
    amountPaid: {
        type: Number,
        required: true,
        default: 0
    },
    status: {
        type: String,
        enum: Object.keys(OrderStatus)
    },
    account: {
        type: Schema.Types.ObjectId,
        ref: ModelNames.Account
    },
    cart: {
        merchant: {
            type: Schema.Types.ObjectId,
            ref: ModelNames.Merchant
        },
        cartValue: {
            type: Number,
            required: true
        },
        items: [{
            item: {
                type: Schema.Types.ObjectId,
                ref: ModelNames.Inventory,
                required: true
            },
            quantity: {
                type: Number,
                default: 1
            },
            price: {
                type: Number,
                required: true
            }
        }]
    },
    serviceCharge: {
        type: Number,
        default: 0
    }
});

export default mongoose.model('orderModel', orderSchema);