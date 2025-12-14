import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Text, Title } from "@mantine/core";

const BarcodeScanner = () => {
  const [barcode, setBarcode] = useState("");
  const scannerRef = useRef(null);

  useEffect(() => {
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

    return () => {
      scannerRef.current.clear();
    };
  }, []);

  return (
    <div>
        <Text fz={24}>Scan barcode</Text>
      <div id="reader" style={{ width: "300px", margin: "auto" }}></div>
      <p>Scanned Code: {barcode}</p>
    </div>
  );
};

export default BarcodeScanner;