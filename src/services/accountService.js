import accountsModel from "../models/accountsModel";
import userModel from "../models/userModel";

/** CREATE A USER ACCOUNT*/
export const getOrCreateAccount = async (payload) => {
    /**
     * @params {object} with key AccountType (enum) => CUSTOMER/MERCHANT & a user ID.
     * @returns {AccountModel}.
     * Sample Payload - {
        "accountType": "CUSTOMER", (ENUM TYPE - CUSTOMER/MERCHANT)
        "user": "5f2a7800c1adc01d88619f0b" // User ID
    }
     * */
    try {
        let account = await accountsModel.findOne({
            user: payload.user
        });
        /** IF ACCOUNT DOES NOT EXITS CREATE ONE!*/
        if (!account) {
            /** CHECK IF USER EXISTS, IF NOT CREATE A USER*/
            const user = await userModel.findById(payload.user);
            if (!user) throw (`Kindly create a user first!`);

            account = await accountsModel.create(payload);
        }
        return account;

    } catch (e) {
        console.log(`ERROR IN getOrCreateAccount API`, e);
        throw e;
    }
};

/** CHECKS IF USER EXIST IF NOT, CREATE's NEW USER */
export const getOrCreateUser = async (payload) => {
    /** FIND A USER WITH THE SAME PHONE/EMAIL ID. */
    /**
     * Sample Payload - {
     *     name: "Anirudh,
     *     phone: "9897133782",
     *     email: "abc@gmail.com",
     *     address: "Random address!"
     * }
     * */
    let user = await userModel.findOne({
        $or: [{phone: payload.phone}, {email: payload.email}]
    });
    if (user) return user;

    /** CREATES A NEW USER */
    return userModel.create(payload);
};
