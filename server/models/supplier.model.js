const mongoose = require('mongoose');

const supplierSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    supplierID: {
        type: String,
        unique: true,
    },
    contactDetails: {
        phone: {type: String},
        email: {type: String},
        location: {type: String},
    },
    orders: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order', // Relates to the Order Schema
        },
    ],
});

module.exports = mongoose.model('Supplier', supplierSchema);