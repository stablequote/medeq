const Sales = require('../models/sales.model');
const Inventory = require('../models/inventory.model');
const financeTransferModel = require('../models/financeTransfer.model');

// Make a sale
exports.makeSale = async (req, res) => {
  try {
    const {
      items,
      soldBy,
      modeOfPayment,
      branch,
      cashAmount = cash,
      bankakAmount = bankak,
      cashoutAmount,
      totalAfterDiscount,
    } = req.body;
  
    // validate if not item is selected
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items provided for the sale.' });
    }
    console.log("Total after discount: ", totalAfterDiscount)
  
    // Calculate total cart amount
    const totalCartAmount = items.reduce((acc, item) => {
      return acc + item.unitSalePrice * item.quantity;
    }, 0);
    console.log("Total cart amount: ", totalCartAmount)
    
    console.log("Cashout values: ", cashoutAmount, totalAfterDiscount)

  
    // Calculate total paid amount (from partial or full)
    let totalPaidAmount;
    if(modeOfPayment === 'Cash + Bankak' ) {
      totalPaidAmount = cashAmount + bankakAmount;
      console.log("Cash + Bankak summ: ", totalPaidAmount)

      // validate if paid amount does not match cash + bankak sum
      if(totalPaidAmount < totalAfterDiscount) {
        res.status(403).json({ message: "Total of entered Cash and Bankak is less than cart total" })
      }
    } else if(modeOfPayment === 'Cashout') {
      totalPaidAmount = totalAfterDiscount || totalCartAmount
      console.log("Cashout values: ", cashoutAmount, totalAfterDiscount, totalPaidAmount)
      // create transfer record. Amount equals to (totalAfterDiscount || totalPaidAmount) - bankakAmount
      const newTransfer = await financeTransferModel.create({
        amount: cashoutAmount - (totalAfterDiscount || totalPaidAmount),
        from: "Cash",
        to: "Bankak",
        description: "Automatic Cashout Record",
      });
    } else {
      totalPaidAmount = totalAfterDiscount || totalCartAmount
    }
    // const totalPaidAmount = modeOfPayment === 'Cash + Bankak' ? cashAmount + bankakAmount : (modeOfPayment === 'Cash' ? totalAfterDiscount || totalCartAmount : totalAfterDiscount || totalCartAmount);
    console.log("Cash:", cashAmount, "Bankak", bankakAmount)
  
    // Calculate cart revenue
    const cartRevenue = items.reduce((acc, item) => {
      return acc + (item.unitSalePrice - item.unitPurchasePrice) * item.quantity;
    }, 0);
  
    // Format items for database
    const formattedItems = items.map((item) => ({
      product: item.product,
      quantity: item.quantity,
      unit: item.unit,
      unitSalePrice: item.unitSalePrice,
      unitPurchasePrice: item.unitPurchasePrice,
      barcodeID: item.barcodeID,
    }));
  
    // Generate sequential billID and receiptNumber
    // const latestSale = await Sales.findOne().sort({ billID: -1 });
    const latestSale = 1;
    const billID = latestSale ? latestSale.billID + 1: 1;
    const receiptNumber = latestSale ? latestSale.receiptNumber + 1 : 1;
  
    // Create and save sale
    const newSale = new Sales({
      billID,
      receiptNumber,
      date: Date.now(),
      modeOfPayment,
      soldBy,
      branch,
      totalCartAmount,
      totalPaidAmount,
      cartRevenue,
      items: formattedItems,
      // +
      cashAmount: modeOfPayment === 'Cash' ? totalAfterDiscount || totalPaidAmount : modeOfPayment === 'Cash + Bankak' ? cashAmount : 0,
      bankakAmount: modeOfPayment === 'Bankak' ? totalAfterDiscount || totalPaidAmount : modeOfPayment === 'Cash + Bankak' ? bankakAmount : modeOfPayment === 'Cashout' ? totalAfterDiscount || totalPaidAmount : modeOfPayment === 'Cash' ? 0 : totalAfterDiscount || totalPaidAmount,
    });
    await newSale.save()
    return res.status(201).json(newSale);
  } catch (error) {
    res.status(500).json({ message: error })
  }
};

exports.listSales = async (req, res) => {
  try {
    const sales = await Sales.find({})
    return res.status(200).json({message: 'sales fetched successfully', sales})
  } catch (error) {
    console.log(error)
  }
}

// Generate receipt
exports.generateReceipt = async (req, res) => {
  try {
    const { billID } = req.params;
    const sale = await Sales.findOne({ billID }).populate('product soldBy branch');
    if (!sale) return res.status(404).json({ message: 'Sale not found.' });
    const receipt = {
        billID: sale.billID,
        date: sale.dateTime,
        product: sale.product.product,
        quantity: sale.quantity,
        totalAmount: sale.totalAmount,
        soldBy: sale.soldBy.name,
        branch: sale.branch.name,
    };
    res.status(200).json(receipt);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate receipt.' });
  }
};

// Helper function to get the start and end of the day
const getStartAndEndOfDay = () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0); // Start of the day
    const end = new Date();
    end.setHours(23, 59, 59, 999); // End of the day
    return { start, end };
};
  
// Helper function to get the start and end of the week
const getStartAndEndOfWeek = () => {
    const start = new Date();
    start.setDate(start.getDate() - start.getDay()); // Start of the week (Sunday)
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setDate(end.getDate() + (6 - end.getDay())); // End of the week (Saturday)
    end.setHours(23, 59, 59, 999);
    return { start, end };
};
  
// Helper function to get the start and end of the month
const getStartAndEndOfMonth = () => {
    const start = new Date();
    start.setDate(1); // Start of the month
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setMonth(end.getMonth() + 1, 0); // End of the month
    end.setHours(23, 59, 59, 999);
    return { start, end };
};

// Calculate total sales for today
exports.getTotalNumberOfSalesToday = async (req, res) => {
  try {
    const { start, end } = getStartAndEndOfDay();
    const totalSalesCount = await Sales.countDocuments({
      createdAt: { $gte: start, $lte: end } // Count sales created today
    });
    res.status(200).json({ totalSalesCount });
  } catch (error) {
    console.error("Error fetching total number of sales for today:", error);
    res.status(500).json({ message: "Error fetching total number of sales for today" });
  }
};

// Calculate total sales for this week
exports.getTotalSalesThisWeek = async (req, res) => {
  try {
    const { start, end } = getStartAndEndOfWeek();
    const totalSales = await Sales.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);
    res.status(200).json({ totalSales: totalSales[0]?.total || 0 });
  } catch (error) {
    res.status(500).json({ message: "Error fetching total sales for this week" });
  }
};

// Calculate total sales for this month
exports.getTotalSalesThisMonth = async (req, res) => {
  try {
    const { start, end } = getStartAndEndOfMonth();
    const totalSales = await Sales.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);
    res.status(200).json({ totalSales: totalSales[0]?.total || 0 });
  } catch (error) {
    res.status(500).json({ message: "Error fetching total sales for this month" });
  }
};

// Calculate total sales for today
exports.getTotalSalesRevenueToday = async (req, res) => {
  try {
    const { start, end } = getStartAndEndOfDay();
    const totalSalesRevenueToday = await Sales.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$cartRevenue" }, // Replace "totalAmount" with your sales amount field
        },
      },
    ]);
    res.status(200).json({ totalSalesRevenueToday: totalSalesRevenueToday[0]?.total || 0 });
  } catch (error) {
    res.status(500).json({ message: "Error fetching total sales revenue for today" });
  }
};

// Delete a single sale
exports.deleteSingleSale = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(req.params)
    const deletedSale = await Sales.findByIdAndDelete(id);
    if (!deletedSale) return res.status(404).json({ message: 'Sale not found.' });
    res.status(200).json({ message: 'Sale record deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete sale.' });
  }
};