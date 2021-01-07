const AddressSchema = new Schema({
    auid: {
        type: mongoose.Schema.Types.ObjectId,
        trim: true,
        required: true,
        unique: true,
        index: true,
        auto: true,
    },
    latitude: {
        type: String,
        trim: true,
        required: false,
    },
    longitude: {
        type: String,
        trim: true,
        required: false,
    },
    addressDescription: {
        type: String,
        trim: true,
        required: true,
    },
});

module.exports = {addressModel: mongoose.model('Address', AddressSchema), addressSchema: AddressSchema};