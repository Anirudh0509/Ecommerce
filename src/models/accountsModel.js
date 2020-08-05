import mongoose, {Schema} from 'mongoose';
import {AccountTypes, ModelNames} from '../constants/enum';

const accountSchema = new Schema({
    accountType: {
        type: String,
        enum: Object.keys(AccountTypes)
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: ModelNames.User
    }
});

export default mongoose.model('accountsModel', accountSchema);