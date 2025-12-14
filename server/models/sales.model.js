const mongoose = require('mongoose');

const salesSchema = mongoose.Schema({
    // name: {
    //     // type: mongoose.Schema.Types.ObjectId,
    //     // ref: 'Inventory', // Links the sale to a product in inventory
    //     type: String,
    //     // required: true,
    // },
    items: [
        {
          product: { type: String, required: true },
          quantity: { type: Number, required: true },
          unit: { type: String, required: true },
          unitSalePrice: { type: Number, required: true },
          unitPurchasePrice: { type: Number, required: true },
        //   totalUnitAmount: { type: Number, required: true }, // unitSalePrice * quantity
        //   unitRevenue: { type: Number, required: true },
        }
    ],
    totalCartAmount: { // Sum of all totalUnitAmount
        type: Number, required: true 
    }, 
    cartRevenue: {  // Sum of all unitRevenue
        type: Number, required: true 
    },
    modeOfPayment: {
        type: String,
        enum: ['Cash', 'Bankak', 'Fawry', 'Cash + Bankak', 'Cashout'], // Example payment methods
        // required: true,
    },
    transactionID: {
        type: String,
    },
    cashAmount: {
        type: Number,
        default: 0
    },
    bankakAmount: {
        type: Number, 
        default: 0
    },
    // unitSalePrice: {
    //     type: Number,
    //     // required: true,
    // },
    unitPurchasePrice: {
        type: Number,
        // required: true,
    },
    totalAmount: {
        type: Number,
        // required: true,
    },
    totalPaidAmount: {
        type: Number,
    },
    barcodeID: {
        type: String,
        // required: true,
    },
    // quantity: {
    //     type: Number,
    //     // required: true,
    // },
    billID: {
        type: String,
        // unique: true,
        // required: true,
    },
    receiptNumber: {
        type: String,
        uique: false,
    },
   
    soldBy: {
        // type: mongoose.Schema.Types.ObjectId,
        // ref: 'User', // Links the sale to the staff who made it
        type: String,
        // required: true,
    },
    branch: {
        // type: mongoose.Schema.Types.ObjectId,
        // ref: 'Branch', // Links the sale to a specific branch
        type: String,
        // required: true,
    },
    paymentVerified: {
        type: Boolean,
        default: true,
    },
}, {timestamps: true});

module.exports = mongoose.model('Sales', salesSchema);