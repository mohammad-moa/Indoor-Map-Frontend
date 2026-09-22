"use client";

import { useEffect, useId } from "react";

import type { QRPayload } from "@/types/qr";

interface QRScannerProps {
  onScan: (payload: QRPayload) => void;
}

export const QRScanner = ({ onScan }: QRScannerProps) => {
  const scannerId = useId().replace(/:/g, "");

  useEffect(() => {
    let scanner: import("html5-qrcode").Html5Qrcode | null = null;

    async function startScanner() {
      const { Html5Qrcode } = await import("html5-qrcode");

      scanner = new Html5Qrcode(scannerId);

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: {
            width: 220,
            height: 200,
          },
        },
        (decodedText) => {
          try {
            const payload = JSON.parse(decodedText) as QRPayload;

            if (!payload.sourceId || !payload.destinationId) {
              return;
            }

            onScan(payload);

            scanner?.stop();
          } catch {
            // Invalid QR payload
          }
        },
        () => {
          // QR not detected yet
        },
      );
    }

    startScanner();

    return () => {
      scanner?.stop().catch(() => {});
    };
  }, [scannerId, onScan]);

  return (
    <div id={scannerId} className="w-full h-80 overflow-hidden rounded-xl" />
  );
};
