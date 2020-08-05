import * as accountService from '../services/accountService';

export const getOrCreateAccount = async (req, res) => {
    try {
        let response = await accountService.getOrCreateAccount(req.body);
        res.send(response);
    } catch (e) {
        console.log(`ERROR IN getOrCreateAccount API`, e);
        res.send(e).status(400);
    }
};

export const getOrCreateUser = async (req, res) => {
    try {
        let response = await accountService.getOrCreateUser(req.body);
        res.send(response);
    } catch (e) {
        console.log(`ERROR IN getOrCreateUser API`, e);
        res.send(e).status(400);
    }
};
