const Inventory = require('../models/inventory.model');
// const Barcode = require('barcode-generator'); // For barcode generation

// Add a product
exports.addProduct = async (req, res) => {
    try {
        const { product, quantity, unit, expiryDate, price, salePrice, supplier, location, branch } = req.body;

        const newProduct = new Inventory({
            product,
            quantity,
            unit,
            expiryDate,
            price,
            salePrice,
            supplier,
            location,
            branch,
        });

        await newProduct.save();
        res.status(201).json({ message: 'Product added successfully.', product: newProduct });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add product.' });
    }
};

// Search product by barcode
exports.searchByBarcode = async (req, res) => {
    try {
        const { barcodeID } = req.params;

        const product = await Inventory.findOne({ barcodeID });
        if (!product) return res.status(404).json({ message: 'Product not found.' });

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to search product.' });
    }
};

// Generate barcode for a product
// exports.generateBarcode = async (req, res) => {
//     try {
//         const { productID } = req.params;

//         const product = await Inventory.findById(productID);
//         if (!product) return res.status(404).json({ message: 'Product not found.' });

//         const barcodeID = Barcode.generate(); // Generate a unique barcode
//         product.barcodeID = barcodeID;

//         await product.save();
//         res.status(200).json({ message: 'Barcode generated.', barcodeID });
//     } catch (error) {
//         res.status(500).json({ error: 'Failed to generate barcode.' });
//     }
// };

// Update a product
exports.updateProduct = async (req, res) => {
    try {
        const { productID } = req.params;
        const updates = req.body;

        const updatedProduct = await Inventory.findByIdAndUpdate(productID, updates, { new: true });
        if (!updatedProduct) return res.status(404).json({ message: 'Product not found.' });

        res.status(200).json({ message: 'Product updated successfully.', product: updatedProduct });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update product.' });
    }
};

// Delete a single product
exports.deleteSingleProduct = async (req, res) => {
    try {
        const { productID } = req.params;

        const deletedProduct = await Inventory.findByIdAndDelete(productID);
        if (!deletedProduct) return res.status(404).json({ message: 'Product not found.' });

        res.status(200).json({ message: 'Product deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete product.' });
    }
};

// Delete multiple products
exports.deleteMultipleProducts = async (req, res) => {
    try {
        const { productIDs } = req.body; // Array of product IDs to delete

        const result = await Inventory.deleteMany({ _id: { $in: productIDs } });
        res.status(200).json({ message: `${result.deletedCount} products deleted successfully.` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete products.' });
    }
};

// List all products
exports.listAllProducts = async (req, res) => {
    try {
        const products = await Inventory.find({});
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to list products.' });
    }
};
