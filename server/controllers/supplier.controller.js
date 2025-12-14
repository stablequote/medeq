const Supplier = require("../models/supplier.model");


exports.addSupplier = async (req, res) => {
    try {
        const { name, supplierID, contactDetails } = req.body;

        const newSupplier = new Supplier({
            name, 
            supplierID, 
            contactDetails
        });

        await newSupplier.save();
        res.status(201).json({ message: 'Supplier added successfully.', supplier: newSupplier });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add supplier.' });
    }
};

// list all suppliers
exports.listSuppliers = async (req, res) => {
    try {
        const supplier = await Supplier.find({}).populate({
            path: 'orders', // First populate orders
            populate: { path: 'products.product', select: 'product' } // Then populate product details
          })
          .lean(); // Converts Mongoose documents into plain JSON objects for efficiency
    
        if(supplier) {
            res.status(200).json({ message: 'Suppliers fetched successfully.', supplier: supplier });
        } else {
            res.status(404).json({ message: 'No supplier found on the database.' });
        }
    } catch (error) {
        res.send(error)
    }
}

// list a single supplier
exports.listSingleSupplier = async (req, res) => {
    try {
        const { name } = req.body;
        const supplier = await Supplier.findOne({name})
        if(supplier) {
            res.status(200).json({ message: 'Supplier fetched successfully.', supplier: supplier });
        } else {
            res.status(404).json({ message: 'No supplier found' });
        }
    } catch (error) {
        res.send(error)
    }
}

// list all orders by a suppliers
exports.listSupplierOrders = async (req, res) => {
  try {
    const { supplierId } = req.query; // Extract supplierId from query parameters

    if (!supplierId) {
      return res.status(400).json({ message: 'Supplier ID is required' });
    }

    // Find the supplier and populate its orders
    const supplier = await Supplier.findById(supplierId)
      .populate({
        path: "orders",
        populate: [
          {
            path: "products.product",
            select: "product unitPurchasePrice",
          },
          {
            path: "supplier", // populate supplier inside each order
            // select: "name email phone", // optional: choose fields
          },
        ],
      })
      .lean();

  
    supplier.orders = supplier.orders.map(order => ({
      ...order,
      products: order.products.map(p => ({
        ...p,
        product: p.product.product, // Extract actual product name
      })),
    }));

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.status(200).json({
      message: 'Orders fetched successfully',
      supplier: {
        _id: supplier._id,
        name: supplier.name,
        supplierID: supplier.supplierID,
        orders: supplier.orders, // List of orders belonging to the supplier
      },
    });
  } catch (error) {
    console.error('Error fetching supplier orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}