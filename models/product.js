const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ImageSchema = new Schema({
    uuid: {
        type: String,
        trim: true,
        required: true,
    },
    puid: {
        type: String,
        trim: true,
        required: true,
    },
    fieldName: {
        type: String,
        trim: true,
        required: true,
    },
    originalName: {
        type: String,
        trim: true,
        required: true,
    },
    encoding: {
        type: String,
        trim: true,
        required: true,
    },
    mimetype: {
        type: String,
        trim: true,
        required: true,
    },
    destination: {
        type: String,
        trim: true,
        required: true,
    },
    fileName: {
        type: String,
        trim: true,
        required: true,
    },
    filePath: {
        type: String,
        trim: true,
        required: true,
    },
    size: {
        type: String,
        trim: true,
        required: true,
    },

});
mongoose.model('Image', ImageSchema);
const MediaSchema = new Schema({
    images: [{
        ref: ImageSchema
    }],
});
mongoose.model('Media', MediaSchema);
const ProductSchema = new Schema({
    puid: {
        type: mongoose.Schema.Types.ObjectId,
        trim: true,
        required: true,
        unique: true,
        index: true,
        auto: true,
    },
    name: {
        type: String,
        trim: true,
        required: true,
    },
    category: {
        type: String,
        trim: true,
        required: true,
    },
    originalPrice: {
        type: String,
        trim: true,
        required: true,
    },
    salePrice: {
        type: String,
        trim: true,
        required: false,
    },
    discount: {
        type: String,
        trim: true,
        required: false,
    },
    currency: {
        type: String,
        trim: true,
        required: true,
    },
    quantity: {
        type: Number,
        trim: true,
        required: true
    },
    media: {
        type: MediaSchema
    }
});
module.exports = mongoose.model('Product', ProductSchema);