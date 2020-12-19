const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CartItemSchema = new Schema({
    puid: {
        type: String,
        trim: true,
        required: true,
        unique: true,
    },
    price: {
        type: String,
        trim: true,
        required: true,
    },
    currency: {
        type: String,
        trim: true,
        required: true,
    },
    quantity: {
        type: String,
        trim: true,
        required: false,
    },

});
 mongoose.model('CartItem', CartItemSchema);
const CartSchema = new Schema({
    cuid: {
        type: mongoose.Schema.Types.ObjectId,
        trim: true,
        required: true,
        unique: true,
        index: true,
        auto: true,
    },
    uuid: {
        type: mongoose.Schema.Types.ObjectId,
        trim: true,
        required: true,
        unique: false,
    },
    total: {
        type: String,
        trim: true,
        required: true,
    },
    currency: {
        type: String,
        trim: true,
        required: false,
    },
    createDate: {
        type: String,
        trim: true,
        required: true,
    },
    checkoutDate: {
        type: String,
        trim: true,
        required: false,
    },
    dateOfDelivery: {
        type: String,
        trim: true,
        required: false,
    },
    status: {
        type: String,
        trim: true,
        required: false,
        default: configs.cartStatus.inProgress,
    },
    items: [CartItemSchema],

});
module.exports = mongoose.model('Cart', CartSchema);

