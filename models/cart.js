const mongoose = require('mongoose');
const {addressSchema} = require("./address");
const {productSchema} = require('./product')
const Schema = mongoose.Schema;
const CartItemSchema = new Schema({
    puid: {
        type: String,
        trim: true,
        required: true,
        // unique: true,
    },
    skuid: {
        type: String,
        trim: true,
        required: true,
        // unique: true,
    },
    quantity: {
        type: Number,
        trim: true,
        required: false,
    },
    product: {
        type: productSchema
    }
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
        default: configs.currency
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
    notes: {
        type: String,
        trim: true,
    },
    shippingAddress: {type: addressSchema, required: true, default: {}},

});
module.exports = mongoose.model('Cart', CartSchema);

