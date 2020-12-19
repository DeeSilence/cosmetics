const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;//Define a schema
const Schema = mongoose.Schema;
const UserSchema = new Schema({
    uuid: {
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
    dataOfBirth: {
        type: String,
        trim: true,
        required: true,
    },
    gender: {
        type: String,
        trim: true,
        required: true,
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
    },
    phoneNumber: {
        type: String,
        trim: true,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        trim: true,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
});// hash user password before saving into database
UserSchema.pre('save', function (next) {
    this.password = bcrypt.hashSync(this.password, saltRounds);
    next();
});
module.exports = mongoose.model('User', UserSchema);