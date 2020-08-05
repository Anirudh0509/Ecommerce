import express from 'express';
import {createOrder} from "../controllers/orderController";

let router = express.Router();

router.post('/create',createOrder);

module.exports = router;