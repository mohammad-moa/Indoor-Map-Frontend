"use client";

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import type { QRPayload } from '@/types/qr';

interface QRScannerProps {
  onScan: (payload: QRPayload) => void;
}

export const QRScanner = ({ onScan }: QRScannerProps) => {
  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function startScanner() {
      try {
        setError(null);

        const { Html5Qrcode } = await import("html5-qrcode");

        if (cancelled) {
          return;
        }

        const scanner = new Html5Qrcode("qr-reader");

        scannerRef.current = scanner;

        await scanner.start(
          {
            facingMode: {
              exact: "environment",
            },
          },
          {
            fps: 10,
            qrbox: {
              width: 250,
              height: 250,
            },
            aspectRatio: 1,
          },
          async (decodedText) => {
            try {
              const payload = JSON.parse(decodedText) as QRPayload;

              if (!payload.sourceId || !payload.destinationId) {
                return;
              }

              onScan(payload);

              await scanner.stop();

              scanner.clear();

              scannerRef.current = null;

              setScanning(false);
            } catch {
              // QR content is not valid JSON
            }
          },
          () => {
            // QR not detected yet
          },
        );

        if (!cancelled) {
          setScanning(true);
        }
      } catch (err) {
        console.error("QR scanner error:", err);

        if (!cancelled) {
          setError("دسترسی به دوربین یا اسکن QR امکان‌پذیر نیست.");
        }
      }
    }

    startScanner();

    return () => {
      cancelled = true;

      const scanner = scannerRef.current;

      if (scanner) {
        scanner
          .stop()
          .catch(() => {})
          .finally(() => {
            scanner.clear();

            scannerRef.current = null;
          });
      }
    };
  }, [onScan]);

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-4 text-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-xl">
      {!scanning && (
        <div className="mb-3 text-center text-sm text-gray-500">
          در حال فعال‌سازی دوربین...
        </div>
      )}

      <div id="qr-reader" className="w-full" />
    </div>
  );
};
