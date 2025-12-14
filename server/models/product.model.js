const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    barcodeID: {
        type: String,
        unique: true,
        required: true,
    },
    manufacturer: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    dose: {
        type: String, // e.g., "500mg" or "1 tablet"
        required: true,
    },
    description: {
        type: String,
        // required: false,
    },
    prescription: {
        type: Boolean, // Whether a prescription is required
        // required: true,
    },
    image: {
        type: String, // URL of the product image
        required: false,
    },
}, {timestamps: true});

module.exports = mongoose.model('Product', productSchema);