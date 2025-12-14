const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  method: { type: String, enum: ["Cash", "Bankak"]},
  date: { type: Date, default: Date.now },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const orderSchema = mongoose.Schema({
    orderID: {
        type: String,
        unique: true,
        required: true,
    },
    products: [{
        product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Inventory', // Links the order to a product in inventory
        required: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
        unit: {
            type: String,
            required: true,
        },
        unitPurchasePrice: {
            type: Number,
            required: true,
        },
        unitTotalPrice: {
            type: Number,
            required: true,
        },
    }],
    supplier: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true
    }, // Supplier per order
    totalOrderPrice: {
        type: Number,
        required: true,
    },
    paidAmount: {
        type: Number, 
        default: 0
    },
    remainingAmount: { 
        type: Number, 
        default: 0 
    },
    paymentMethod: {
        type: String,
        enum: ["Cash", "Bankak"],
    },
    isOrderPaid: {
        type: Boolean,
        default: false,
    },
    payments: [paymentSchema],
    orderDate: {
        type: Date,
        default: Date.now(),
        required: true,
    },
    deliveryDate: {
        type: Date,
        required: false,
    },
    // orderedBy: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User', // Links the order to a user
    //     // required: true,
    // },
    // branch: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Branch', // Links the order to a specific branch
    //     // required: true,
    // },
}, {timestamps: true});

orderSchema.pre("save", function (next) {
  // auto-update status and remaining balance
  this.paidAmount = this.payments.reduce((sum, p) => sum + p.amount, 0);
  this.remainingAmount = this.totalAmount - this.paidAmount;
  if (this.paidAmount === 0) this.status = "unpaid";
  else if (this.paidAmount < this.totalAmount) this.status = "partial";
  else this.status = "paid";
  next();
});

module.exports = mongoose.model('Order', orderSchema);