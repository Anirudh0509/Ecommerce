import {getOrCreateAccount, getOrCreateUser} from '../controllers/accountController';
import express from 'express';

const router = express.Router();

router.post('/getOrCreateAccount', getOrCreateAccount);
router.post('/getOrCreateUser', getOrCreateUser);

module.exports = router;