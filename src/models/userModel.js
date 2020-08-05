import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String
    },
    phone: {
        type: String
    },
    address: {
        type: String
    },
    email: {
        type: String
    }
});

export default mongoose.model('userModel', userSchema);