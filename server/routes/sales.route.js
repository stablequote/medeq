const express = require('express');
const router = express.Router();
const salesController = require('../controllers/sales.controller');
const requireShift = require("../middlewares/requireShift")

// Sales routes
router.post('/make-sale', salesController.makeSale);
router.get('/receipt/:billID', salesController.generateReceipt);
router.get('/list-sales', salesController.listSales)
router.get('/get-today-sales', salesController.getTotalNumberOfSalesToday)
router.get('/get-week-sales', salesController.getTotalSalesThisWeek)
router.get('/get-month-sales', salesController.getTotalSalesThisMonth)

router.get('/total-sales-revenue-today', salesController.getTotalSalesRevenueToday)
router.delete('/delete/:id', salesController.deleteSingleSale)
module.exports = router;