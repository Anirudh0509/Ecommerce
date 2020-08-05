import * as orderService from '../services/orderService';

export const createOrder = async (req, res) => {
    try {
        let response = await orderService.createOrder(req.body);
        res.send(response);
    } catch (e) {
        console.log(`ERROR IN getOrCreateAccount API`, e);
        res.send(e).status(400);
    }
};

