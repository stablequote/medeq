import { useEffect, useState } from "react";

const useBarcodeScanner = (onScanned) => {
  const [barcode, setBarcode] = useState("");

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "Enter") {
        if (barcode) {
          onScanned(barcode); // Send barcode to handler
          setBarcode(""); // Reset for next scan
        }
      } else {
        setBarcode((prev) => prev + event.key); // Append scanned character
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [barcode, onScanned]);

  return barcode;
};

export default useBarcodeScanner;