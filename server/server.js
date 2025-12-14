const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const DB_URI = process.env.DB_URI;
const DB_LOCAL = process.env.DB_LOCAL;
const PORT = process.env.PORT || 5010;

const authRouter = require("./routes/user.route")
const inventoryRouter = require("./routes/inventory.route")
const orderRouter = require("./routes/order.route")
const salesRouter = require("./routes/sales.route")
const SupplierRouter = require("./routes/supplier.route")
const expenseRouter = require("./routes/expense.route")
const financeTransfer = require("./routes/financeTransfer.route")

const connectDB = async () => {
  try {
    await mongoose.connect(DB_LOCAL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to Database");
  } catch (error) {
    console.error("❌ Database Connection Error:", error.message);
    process.exit(1); // Exit process if DB connection fails
  }
};
connectDB();

// middlewares
app.use(cors({
  // origin: ["https://ismeq-sd.vercel.app/"],
  origin: "*",
  credentials: 'true',
}))
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}))

// routes
app.use("/auth", authRouter)
app.use("/inventory", inventoryRouter)
app.use('/orders', orderRouter);
app.use('/sales', salesRouter);
app.use('/supplier',  SupplierRouter)
app.use('/expenses', expenseRouter)
app.use('/supplier', SupplierRouter);
app.use('/transfer', financeTransfer);

app.get("/test", (req, res) => {
  res.send("server is working")
  console.log("test is working!!")
})

// running the server
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
})

process.stdin.resume(); // Keeps the process open