import { useState, useEffect, useRef, useMemo } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
  Card,
  Group,
  Text,
  Button,
  Table,
  Title,
  Modal,
  Paper,
  Notification,
  Grid,
  Col,
  Box,
  Divider,
  NumberInput,
  Select,
  Center,
  Container,
  Flex,
  TextInput,
} from "@mantine/core";
import { useMediaQuery } from '@mantine/hooks';
import { showNotification } from "@mantine/notifications";
import CartOverview from "../components/CartOverview";
import CartPaymentSection from "../components/CartPaymentSection";
import BarcodeScan from "../components/BarcodeScan";
import axios from 'axios'
import { jsPDF } from "jspdf";
import { IconCamera, IconMedicalCross, IconSearch } from "@tabler/icons-react";
import { useTranslation } from 'react-i18next';
import ProductCard from "../components/ProductCard";

// Sample product database
const products = [
  { _id: "679b92a0633d92d38e46c275",
    product: "Digestive Enzymes",
    quantity: 3,
    unit: "stripe",
    expiryDate: "2026-11-08T22:00:00.000Z",
    unitPurchasePrice: 900,
    unitSalePrice: 1300,
    shelf: "A1",
    barcodeID: "6154840000000",
    "createdAt": "2025-01-30T14:54:24.234Z",
    "updatedAt": "2025-01-31T14:48:28.414Z",},
  { _id: "5678", product: "Pain Relief Cream", quantity: 1, unit: "lotion", unitPurchasePrice: 1100, unitSalePrice: 1900, barcodeID: "9268839786736" },
];

const PosPage = () => {
  const [scannedItem, setScannedItem] = useState(null); // Currently scanned item
  const [cart, setCart] = useState([]); // Cart items
  const [scannerModalOpened, setScannerModalOpened] = useState(false); // Scanner modal state
  const [receiptVisible, setReceiptVisible] = useState(false); // Receipt modal visibility
  const [barcode, setBarcode] = useState("");
  const [scanner, setScanner] = useState(false);
  const [payment, setPayment] = useState({
    netTotal: 0,
    discount: 0,
    previous: 0,
    paidAmount: 0,
    dueAmount: 0,
    paymentType: "",
    transactionID: "",
    cashAmount: 0,
    bankakAmount: 0,
    cashoutAmount: 0,
  });
  const [discountPercentage, setDiscountPercentage] = useState(0);
  // const [discountByAmount, setDiscountByAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0)
  const [discountType, setDiscountType] = useState("percent"); // "percent" or "amount"
  const [paymentResponse, setPaymentResponse] = useState(null)
  const [value, setValue] = useState(null)
  const [inventoryData, setInventoryData] = useState([])
  const [selectedProductId, setSelectedProductId] = useState(""); // Track selected product ID
  const [searchValue, onSearchChange] = useState('');

  const BASE_URL = import.meta.env.VITE_URL;
  const { t } = useTranslation();
  const inputRef = useRef();
  const scannerRef = useRef(null);
  const receiptRef = useRef(null);
  const barcodeBufferRef = useRef("");
  const lastKeyTimeRef = useRef(Date.now());
  const html5QrCodeRef = useRef(null); // Reference for the barcode scanner
  const lastScannedRef = useRef(null); // To track the last scanned barcode
  const userJson = localStorage.getItem("user")
  const user = JSON.parse(userJson)

  const fetchInventoryData = async (url) => {
    try {
      const res = await axios.get(url);
      console.log(res);
      setInventoryData(res.data);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      setInventoryData([]); // Set to empty array in case of error
    }
  };

  useEffect(() => {
    const url = `${BASE_URL}/inventory/list-all`
    fetchInventoryData(url)
    console.log(url) // "123"

    console.log(inventoryData)
  }, [])

  // Transform the data for the Select component
  const selectData = inventoryData.map((item) => ({
    value: item._id,
    label: item.product,
  })); 

  useEffect(() => {
    if (scannerModalOpened) {
      startScanner();
    } else {
      stopScanner();
    }
    console.log(cart)
  }, [scannerModalOpened]);

  // listening for Enter key down
  useEffect(() => {
    const handleGlobalKeyDown = async (e) => {
      const now = Date.now();
      if (now - lastKeyTimeRef.current > 100) {
        barcodeBufferRef.current = ""; // reset buffer if time gap is too large
      }
      lastKeyTimeRef.current = now;

      if (e.key === "Enter") {
        const barcode = barcodeBufferRef.current.trim();
        if (barcode.length > 0) {
          await handleBarcode(barcode);
          barcodeBufferRef.current = ""; // reset buffer
        }
      } else {
        barcodeBufferRef.current += e.key;
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const startScanner = async () => {
    if (!html5QrCodeRef.current) {
      const readerElement = document.getElementById("reader");
      if (!readerElement) {
        showNotification({
          title: "Scanner Error",
          message: "Scanner container element not found.",
          color: "red",
        });
        return;
      }

      try {
        scannerRef.current = new Html5QrcodeScanner("reader", {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        });

        scannerRef.current.render(
          (decodedText) => {
            setBarcode(decodedText);
            console.log("Decoded barcode:", decodedText);
          },
          (error) => {
            console.warn("Scan error:", error);
          }
        );
      } catch (err) {
        console.error("Failed to start scanner:", err);
        showNotification({
          title: "Camera Error",
          message: "Unable to access the camera. Please check permissions.",
          color: "red",
        });
      }
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      await html5QrCodeRef.current.stop();
      html5QrCodeRef.current.clear();
      html5QrCodeRef.current = null;
    }
    setScannerModalOpened(false);
  };

  const handleScanSuccess = (barcode) => {
    const now = Date.now();
    if (lastScannedRef.current && now - lastScannedRef.current < 2000) {
      return; // Ignore duplicate scan
    }
    lastScannedRef.current = now;

    const product = products.find((p) => p.id === barcode);

    if (product) {
      setScannedItem(product);
      addToCart(product);
      showNotification({
        title: "Item Added",
        message: `${product.name} was added to the cart.`,
        color: "green",
      });
    } else {
      showNotification({
        title: "Invalid Barcode",
        message: `No product found for barcode: ${barcode}`,
        color: "red",
      });
    }
  };

  const addToCart = (product) => {
    console.log(product)
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item._id === product._id);
      if (existingProduct) {
        return prevCart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const calculateNetTotal = () => {
    return cart.reduce((total, item) => total + item.quantity * item.unitSalePrice, 0);
  };
  
  const updateQuantity = (id, action) => {
    setCart((prev) =>
      prev.map((item) =>
        item._id === id
          ? {
              ...item,
              quantity: action === "increment" ? item.quantity + 1 : item.quantity - 1,
            }
          : item
      ).filter((item) => item.quantity > 0)
    );
    console.log(id)
  };

  const finishTransaction = () => {
    stopScanner();
    setReceiptVisible(true);
  };

  const resetProcess = () => {
    setScannedItem(null);
    setCart([]);
    setDiscountPercentage(0)
    setDiscountAmount(0)
    setReceiptVisible(false);
  };

  const handleBarcode = async (data) => {
    try {
      const baseUrl = `${BASE_URL}/inventory/search`;
      const response = await axios.get(`${baseUrl}/${data}`);

      if (response.status === 200) {
        const product = response.data;
        setCart((prevCart) => {
          const existingProduct = prevCart.find(
            (item) => item.barcodeID === product.barcodeID
          );
          if (existingProduct) {
            return prevCart.map((item) =>
              item.barcodeID === product.barcodeID
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
          }
          return [...prevCart, { ...product, quantity: 1 }];
        });

        showNotification({
          title: "Item Added",
          message: `${product.product} was added to the cart.`,
          color: "green",
        });
      } else {
        showNotification({
          title: "Product Not Found",
          message: "No product found for this barcode.",
          color: "red",
        });
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  const resetCart = async () => {
    console.log(cart)
    setCart([])
    setPayment({
      netTotal: 0,
      discount: 0,
      previous: 0,
      paidAmount: 0,
      dueAmount: 0,
      paymentType: "",
      transactionID: "",
      cashAmount: 0,
      bankakAmount: 0,
      cashoutAmount: 0,
    })
    setDiscountPercentage(0)
    setDiscountByAmount(0)
    console.log(cart)
  }

  const handlePrint = () => {
    if (receiptRef.current) {
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h2 { text-align: center; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid black; padding: 10px; text-align: left; }
              th { background-color: #f2f2f2; }
              .total { font-weight: bold; }
            </style>
          </head>
          <body>
            <h2>أعمال الأسرة للإستيراد والتصدير</h2>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                ${cart
                  .map(
                    (item) => `
                    <tr>
                      <td>${item.product}</td>
                      <td>${item.quantity}</td>
                      <td>SDG ${item.unitSalePrice}</td>
                    </tr>
                  `
                  )
                  .join("")}
                <tr class="total">
                  <td colspan="2">Total</td>
                  <td>SDG ${calculateNetTotal()}</td>
                </tr>
              </tbody>
            </table>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handlePrintThermal = async () => {
    try {
      // Request access to the thermal printer
      const device = await navigator.usb.requestDevice({
        filters: [{ vendorId: 0x0416 }], // Replace with your printer's vendor ID
      });
  
      await device.open();
      if (device.configuration === null) {
        await device.selectConfiguration(1);
      }
      await device.claimInterface(0);
  
      // ESC/POS Command Generator
      const encoder = new TextEncoder();
      const ESC = "\x1B"; // ESC command
      const LF = "\x0A"; // Line feed (new line)
      const CUT = ESC + "m"; // Cut command
  
      let receipt = ESC + "a1"; // Align center
      receipt += "XYZ Pharmacy" + LF;
      receipt += "1234 Main Street" + LF;
      receipt += "City, Country" + LF;
      receipt += "--------------------------------" + LF;
      receipt += `Receipt No: INV-${Date.now()}` + LF;
      receipt += `Date: ${new Date().toLocaleString()}` + LF;
      receipt += "--------------------------------" + LF;
  
      // Add cart items
      cart.forEach((item) => {
        receipt += `${item.product} x${item.quantity}  $${(item.unitSalePrice * item.quantity).toFixed(2)}` + LF;
      });
  
      receipt += "--------------------------------" + LF;
      receipt += `Total: $${calculateNetTotal().toFixed(2)}` + LF;
      receipt += "--------------------------------" + LF;
      receipt += "Thank you for shopping with us!" + LF;
      receipt += "Visit again!" + LF;
      receipt += CUT; // Cut the paper
  
      // Convert text to bytes
      const receiptBytes = encoder.encode(receipt);
  
      // Send data to the printer
      await device.transferOut(1, receiptBytes);
  
      showNotification({
        title: "Printing",
        message: "Receipt is being printed...",
        color: "green",
      });
  
      await device.close();
    } catch (error) {
      console.error("Print error:", error);
      showNotification({
        title: "Print Error",
        message: "Could not print the receipt. Please check printer connection.",
        color: "red",
      });
    }
  };

const autoPrintPDF = () => {
  const doc = new jsPDF();
  doc.text("Your Receipt Here", 10, 10);
  
  // Auto-save the PDF
  doc.autoPrint();
  window.open(doc.output("bloburl"), "_blank");
};

// ########### discount logic ###########
const roundToNearestHundred = (number) => {
  return Math.ceil(number / 100) * 100;
}
// const totalAfterDiscount = useMemo(() => 
//   cart.reduce((total, item) => roundToNearestHundred(total + item.totalPrice), 0),
//   [cart]
// );

const totalAfterDiscount = useMemo(() => {
  const total = cart.reduce((sum, item) => roundToNearestHundred(sum + item.totalPrice), 0);
  let discountedTotal = total;

  if (discountType === "percent" && discountPercentage > 0) {
    discountedTotal -= (total * discountPercentage) / 100;
  } else if (discountType === "amount" && discountAmount > 0) {
    discountedTotal -= discountAmount;
  }

  // Prevent going below 0 and round
  return roundToNearestHundred(Math.max(discountedTotal, 0));
}, [cart, discountType, discountPercentage, discountAmount]);


const preparePaymentData = (cart) => {
  // console.log(user.firstname)
  return {
    modeOfPayment: payment.paymentType,
    soldBy: user?.firstname || "Unknown", // Safe access  
    branch: "Thawra 30",
    items: cart.map(item => ({
      product: item.product,
      quantity: item.quantity,
      unit: item.unit,
      unitSalePrice: item.unitSalePrice,
      unitPurchasePrice: item.unitPurchasePrice,
      barcodeID: item.barcodeID
      // totalPrice: item.quantity * item.unitSalePrice // Optional, if needed by server
    })),
    cashAmount: payment.cashAmount,
    bankakAmount: payment.bankakAmount,
    cashoutAmount: payment.cashoutAmount,
    totalAfterDiscount: totalAfterDiscount || 0,
    billID: `BILL - ${Date.now()}`,
  };
};

const paymentPayload = preparePaymentData(cart);
console.log(paymentPayload); 

const handlePayment = async () => {
  try {
    const url = `${BASE_URL}/sales/make-sale`
    console.log(paymentPayload)
    if(cart.length <= 0) {
      showNotification({
        title: "No item!",
        message: "At least one item should be added",
        color: "red",
      })
      return;
    }
    
    const result = await axios.post(url, paymentPayload, {
      // headers: {
      //   'Content-Type': 'application/json',
      // },
    });
    console.log(result)

    setPaymentResponse(result.data); // Handle the response from the server
    if(result.status === 201) {
      showNotification({
        title: "Successful",
        message: "Payment was successfully made",
        color: "green",
      })
      setReceiptVisible(!receiptVisible)
      console.log("successful", result)
    } else {
      showNotification({
        title: "server error",
        message: "maybe check again!",
        color: "red",
      })
    }
  } catch (err) {
    console.log(err.response.status)

    if (err.response.status === 400) {
      console.log(err.response.data.message)
      showNotification({
        title: err.response.data.message,
        message: err.response.data.errors.map((err) => err),
        color: "orange",
    })
  } else {
    showNotification({
      title: "Payment error",
      message: "Error while making payment. Please try again",
      color: "red",
    })
  }
  }
}

const handleChange = (e) => {
  setValue(e.target.value);
  console.log(value)
}

const handleProductSearch = async () => {
  const url = `${BASE_URL}/inventory/search-by-name`;

  try {
    const response = await axios.post(url, { name: searchValue });
    console.log(response.data);
    setValue(response.data);
    console.log(value)
  } catch (error) {
    showNotification({
      title: "Error",
      message: "Product not found",
      color: "red"
    })
    console.error("Error:", error.response?.data || error.message);
  }
};

// Handle product selection from the dropdown
const handleProductSelection = (selectedProductId) => {
  setSelectedProductId(selectedProductId); // Update the selected product ID
};

  // Handle adding the selected product to the cart
  const handleAddToCart = () => {
    if (!selectedProductId) {
      showNotification({
        title: "No Product Selected",
        message: "Please select a product from the dropdown.",
        color: "red",
      });
    return;
  }

  const selectedProduct = inventoryData.find((item) => item._id === selectedProductId);
    if (selectedProduct) {
      addToCart(selectedProduct); // Add the selected product to the cart
      setSelectedProductId(""); // Clear the selected product ID
      onSearchChange(''); // Clear the search value
    }
  };

  const calculateDiscountedTotal = () => {
    const netTotal = calculateNetTotal();
    const discountAmount = (netTotal * discountPercentage) / 100;
    return netTotal - discountAmount;
  };

  // ############# APPLYING A DISCOUNT LOGIC #############
  const applyDiscount = () => {
    if (!cart.length) return; // Prevent errors if cart is empty
    const discountFactor = discountPercentage / 100;
    
    const updatedCart = cart.map((item) => {
      const discountAmount = item.unitSalePrice * discountFactor;
      const discountedPrice = item.unitSalePrice - discountAmount;
      return {
        ...item,
        discountAmount: discountAmount * item.quantity, // Total discount for the item
        discountedPrice: discountedPrice, // New price per item after discount
        totalPrice: discountedPrice * item.quantity, // Updated total price per item
      };
    });
    setCart(updatedCart); // Update the cart with new discounted prices
  };

  const applyDiscountAmount = () => {
    const discountFactor =  - discountPercentage 
    const netTotal = calculateNetTotal();
    const discount = netTotal - discountAmount;
    alert(discount)
    // return netTotal - discountAmount;

    if (!cart.length) return; // Prevent errors if cart is empty
    const updatedCart = cart.map((item) => {
      const discountAmount = item?.unitSalePrice - discountAmount;
      const discountedPrice = item?.unitSalePrice - discountAmount;
      return {
        ...item,
        discountAmount: discountAmount * item.quantity, // Total discount for the item
        discountedPrice: discountedPrice, // New price per item after discount
        totalPrice: discountedPrice * item.quantity, // Updated total price per item
      };
    });
    setCart(updatedCart); // Update the cart with new discounted prices
  };

  return (
    <div style={{ padding: "20px", overflow: "hidden !important" }}>
      <Grid gutter="lg">
        {/* Left Side: Scanned Item */}
        <Col xs={12} md={8}>
          <Group position="apart" mb="md">
            {/* <Title order={3}>Scanned Item</Title> */}
            <Button variant="outline" leftIcon={<IconCamera size={24} />} onClick={() => setScanner(!scanner)}>{scanner === true? t("Stop-Scanner") : t("Start-Scanner")}</Button>
            {/* manually search product */}
            <Grid align="flex-end">
              <Grid.Col span={8} className="no-focus-lock">
                <Select
                  placeholder={t("Type-Product-Name")}
                  searchable
                  nothingFound="No product found"
                  maxDropdownHeight={280}
                  name="name"
                  data={selectData}
                  value={selectedProductId}
                  onChange={handleProductSelection} // Update selected product ID
                  onSearchChange={onSearchChange}
                  searchValue={searchValue}
                  sx={{width: "480px !important"}}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <Button variant="filled" ml={-20} leftIcon={<IconMedicalCross size={25} />} onClick={handleAddToCart}>{t("Add-to-Cart")}</Button>
              </Grid.Col>
            </Grid>
          </Group>

          {/* hidden input field to listen for barcode scanner and Enter key */}
          {/* <input
            ref={inputRef}
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            style={{ opacity: 0, position: "absolute" }}
          /> */}

          {
            value ?
            <Center size="xs">
             <ProductCard product={value} addToCart={addToCart} />
            </Center>
            : null
          }

          {/* Modal for Scanner */}
          <Container py="lg" >
            {scanner && <BarcodeScan barcode={barcode} handleBarcode={handleBarcode} /> }
          </Container>
        </Col>

        {/* Right Side: Cart Overview */}
        <Col xs={12} md={4}>
            {/* Overview Section */}
            <CartOverview 
              cart={cart}
              updateQuantity={updateQuantity}
            />
      
            {/* Payment Section */}
            <CartPaymentSection
              calculateNetTotal={calculateNetTotal}
              payment={payment}
              setPayment={setPayment}
              setReceiptVisible={setReceiptVisible}
              receiptVisible={receiptVisible}
              resetCart={resetCart}
              cart={cart}
              setCart={setCart}
              handlePayment={handlePayment}
              discountPercentage={discountPercentage}
              setDiscountPercentage={setDiscountPercentage}
              calculateDiscountedTotal={calculateDiscountedTotal}
              applyDiscount={applyDiscount}
              totalAfterDiscount={totalAfterDiscount}
              roundToNearestHundred={roundToNearestHundred}
              // discountByAmount={discountByAmount}
              // setDiscountByAmoun={setDiscountByAmount}
              applyDiscountAmount={applyDiscountAmount}
              discountAmount={discountAmount}
              setDiscountAmount={setDiscountAmount}
              discountType={discountType}
              setDiscountType={setDiscountType}
            />
        </Col>
      </Grid>

      {/* Modal for Receipt */}
      <Modal
        opened={receiptVisible}
        onClose={() => setReceiptVisible(!receiptVisible)}
        title="Receipt"
        centered
      >
        <Paper ref={receiptRef}>
          <Title order={4}>Customer Receipt</Title>
          <Table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, i) => (
                <tr key={i}>
                  <td>{item.product}</td>
                  <td>{item.quantity}</td>
                  <td>SDG {item.unitSalePrice * item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Text mt="md" weight={700}>
            Total Amount Paid: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; SDG {totalAfterDiscount > 0 ? totalAfterDiscount : calculateNetTotal()}
          </Text>
        </Paper>
        <Flex justify="space-between"  >
          <Button mt="md" color="blue" onClick={resetProcess}>New Transaction</Button>
          <Button mt="md" color="gray" onClick={() => handlePrint()}>Print</Button>
        </Flex>
      </Modal>
    </div>
  );
};

export default PosPage;
