const Inventory = require('../models/inventory.model');
const Sales = require('../models/sales.model');
// const Barcode = require('barcode-generator'); // For barcode generation

// Add a product
exports.addProduct = async (req, res) => {
    try {
        const { product, quantity, unit, expiryDate, unitPurchasePrice, unitSalePrice, supplier, shelf, branch, barcodeID } = req.body;

        const newProduct = new Inventory({
            product,
            quantity,
            unit,
            expiryDate,
            unitPurchasePrice,
            unitSalePrice,
            supplier,
            shelf,
            branch,
            barcodeID,
        });

        await newProduct.save();
        res.status(201).json({ message: 'Product added successfully.', product: newProduct });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add product.' });
        console.log(error)
    }
};

// Controller to handle bulk data import for inventory
exports.imporFromExcel = async (req, res) => {
    console.log(req.body)
    try {
      const inventoryData = req.body; // Assumed to be an array of objects from the client
  
      if (!Array.isArray(inventoryData) || inventoryData.length === 0) {
        return res.status(400).json({ message: 'Invalid data format' });
      }
  
      // Map the incoming data to t schema
      const mappedData = inventoryData.map((item) => {
        return {
          product: item.product,
          quantity: item.quantity,
          unit: item.unit,
          unitPurchasePrice: item.unitPurchasePrice,
          unitSalePrice: item.unitSalePrice,
          expiryDate: item.expiryDate,
          barcodeID: item.barcodeID,
          shelf: item.shelf,
        };
      });

      console.log(mappedData)
  
      // Bulk insert the data into MongoDB
      const result = await Inventory.insertMany(mappedData);
  
      return res.status(201).json({
        message: `${result.length} inventory items imported successfully`,
        data: result,
      });
    } catch (error) {
      console.error('Error importing inventory data:', error);
      return res.status(500).json({ message: 'Error processing inventory data' });
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

// Search product by barcode ==> list single product
exports.searchByBarcode = async (req, res) => {
    try {
        const { barcodeID } = req.params;
        console.log(barcodeID)

        const productItem = await Inventory.findOne({ barcodeID: barcodeID });
        if (!productItem) return res.status(404).json({ message: 'Product not found.' });

        res.status(200).json(productItem);
    } catch (error) {
        res.status(500).json({ error: 'Failed to search product.' });
        console.log(error)
    }
};

// Search product by name ==> list single product
exports.searchByName = async (req, res) => {
    try {
        const { name } = req.body;
        console.log(name)

        const productItem = await Inventory.findOne({ product: name });
        if (!productItem) return res.status(404).json({ message: 'Product not found.' });

        res.status(200).json(productItem);
    } catch (error) {
        res.status(500).json({ error: 'Failed to search product.' });
        console.log(error)
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

// return a product
exports.returnProduct = async (req, res) => {
    try {
        const { _id: saleId, items } = req.body;

        for (const item of items) {
            const { product: productName, quantity, unit, unitSalePrice, unitPurchasePrice, totalUnitAmount, unitRevenue } = item;

            // Find the product in the inventory by name
            let existingProduct = await Inventory.findOne({ product: productName });

            if (existingProduct) {
                // Update stock quantity
                existingProduct.quantity += quantity;
                await existingProduct.save();
            } else {
                // Create a new inventory entry if product does not exist
                const newProduct = new Inventory({
                    product: productName,
                    quantity,
                    unit,
                    unitSalePrice,
                    unitPurchasePrice,
                    totalUnitAmount,
                    unitRevenue,
                });
                await newProduct.save();
            }
        }

        // Delete the sale from the database
        const deletedSale = await Sales.findByIdAndDelete(saleId);

        if (!deletedSale) {
            return res.status(404).json({ error: 'Sale not found' });
        }

        // Fetch the updated sales list
        const sales = await Sales.find({});

        return res.status(200).json({
            message: 'Return processed successfully and sale removed from database',
            sales,
        });

    } catch (error) {
        console.error('Error returning product:', error);
        return res.status(500).json({ error: 'Failed to return product.', details: error.message });
    }
};

// Delete a single product
exports.deleteSingleProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedProduct = await Inventory.findByIdAndDelete(id);
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