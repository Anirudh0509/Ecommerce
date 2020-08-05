export const ModelNames = {
    Order: 'Order',
    User: 'User',
    Cart: 'Cart',
    Account: 'Account',
    Inventory: 'Inventory',
    Merchant: 'Merchant'
};

export const OrderTypes = {
    PREPAID: 'PREPAID',
    POSTPAID:  'POSTPAID'
};

export const ItemsCategory = {
    BEVERAGES: 'BEVERAGES',
    SNACKS: 'SNACKS',
    DAL_AND_PULSES: 'DAL_AND_PULSES',
    DAIRY: 'DAIRY',
    STATIONARY: 'STATIONARY',
    APPARELS: 'APPARELS',
    SHOES: 'SHOES',
    ELECTRONICS: 'ELECTRONICS',
    COSMETICS: 'COSMETICS'
};

export const AccountTypes = {
    MERCHANT: 'MERCHANT',
    CUSTOMER: 'CUSTOMER'
};

export const OrderStatus = {
    CREATED: 'CREATED',
    ACCEPTED: 'ACCEPTED',
    SUCCESS: 'SUCCESS',
    PENDING: 'PENDING',
    OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
    CANCELLED: 'CANCELLED'
};

export const CartRules = {
    ITEM_OUT_OF_STOCK_RULE: 'ITEM_OUT_OF_STOCK_RULE',
    CART_ORDER_VALUE_RULE: 'CART_ORDER_VALUE_RULE',
};

export const InventoryStockOperation = {
    DECREMENT: 'DECREMENT',
    INCREMENT: 'INCREMENT'
}