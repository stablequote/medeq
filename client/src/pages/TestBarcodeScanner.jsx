import { useState, useEffect } from "react";
import axios from "axios";
import { showNotification } from "@mantine/notifications";

const BASE_URL = import.meta.env.VITE_URL;

export default function TestBarcodeScanner({ setCart, cart }) {
  const [barcode, setBarcode] = useState("");
  const [buffer, setBuffer] = useState("");

  // 🔄 Function to handle barcode fetch & cart update
  const handleBarcode = async (data) => {
    setBarcode(data);
    try {
      const baseUrl = `${BASE_URL}/inventory/search`;
      const response = await axios.get(`${baseUrl}/${data}`);
      console.log("Response:", response);

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

  // 📦 Global key listener (buffer scanner)
  useEffect(() => {
    let timeout;

    const handleKeyDown = (e) => {
      if (timeout) clearTimeout(timeout);

      // Skip typing in real input fields
      const tag = document.activeElement.tagName;
      if (["INPUT", "TEXTAREA"].includes(tag) || document.activeElement.isContentEditable) {
        return;
      }

      if (e.key === "Enter") {
        const scanned = buffer.trim();
        if (scanned.length > 0) {
          handleBarcode(scanned);
        }
        setBuffer("");
      } else {
        setBuffer((prev) => prev + e.key);
        timeout = setTimeout(() => setBuffer(""), 100); // Clear after short idle
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [buffer]);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Barcode Scanner Listener</h2>
      <p>Scan a barcode using a scanner — product will be added to the cart automatically.</p>
      <div style={{ marginTop: "2rem" }}>
        <strong>Last Scanned:</strong> {barcode}
      </div>
    </div>
  );
}
