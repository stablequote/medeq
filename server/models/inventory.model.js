const mongoose = require('mongoose');

const inventorySchema = mongoose.Schema({
    product: {
        // type: mongoose.Schema.Types.ObjectId,
        // ref: 'Product', // Links each product to inventory
        required: true,
        type: String,
    },
    quantity: {
        type: Number,
        required: true,
    },
    unit: {
        type: String, // Smallest measurable unit (e.g., tablet, ml)
        required: true,
    },
    expiryDate: {
        type: Date,
        required: true,
    },
    unitPurchasePrice: {
        type: Number,
        required: true,
    },
    unitSalePrice: {
        type: Number,
        required: true,
    },
    // supplier: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Supplier', // Links each product to its supplier
    //     // required: true,
    // },
    shelf: {
        type: String, // Specifies where the product is stored
        // required: true,
        
    },
    barcodeID: {
      type: String,
      required: true,
      // unique: true,
    }
    // branch: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Branch', // Links the inventory to a specific branch
    //     required: true,
    // },
}, {timestamps: true});

// Example query

/* const inventory = await Inventory.find()
  .populate("product") // Fetch related product details
  .populate("supplier") // Fetch related supplier details
  .exec();

console.log(inventory);
*/

// Result output

/*

[
  {
    "_id": "65f2c7...",
    "product": {
      "_id": "65f1b4...",
      "name": "Paracetamol",
      "barcode": "123456789",
      "dosage": "500mg",
      "manufacturer": "ABC Pharma",
      "category": "Pain Relief",
      "image": "paracetamol.jpg"
    },
    "supplier": {
      "_id": "65f2d5...",
      "name": "MedSupply Ltd",
      "contact": "info@medsupply.com",
      "address": "123 Street, City"
    },
    "quantity": 100,
    "unit": "Box",
    "expiryDate": "2025-12-31",
    "dateAdded": "2024-01-29",
    "shelf": "A3"
  }
]

*/

module.exports = mongoose.model('Inventory', inventorySchema);