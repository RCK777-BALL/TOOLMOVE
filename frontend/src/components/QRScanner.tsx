import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';
import { Button } from '@radix-ui/themes';0

interface QRScannerProps {
  onScan: (data: {
    departmentId?: string;
    lineId?: string;
    stationId?: string;
    note?: string;
  }) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const startScanner = async () => {
      try {
        const scanner = new Html5Qrcode('qr-reader');
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            try {
              const data = JSON.parse(decodedText);
              onScan({
                departmentId: data.department_id,
                lineId: data.line_id,
                stationId: data.station_id,
                note: data.note,
              });
              stopScanner();
            } catch (err) {
              setError('Invalid QR code format. Expected JSON data.');
            }
          },
          () => {
          }
        );

        setIsScanning(true);
      } catch (err: any) {
        setError(err.message || 'Failed to start camera');
      }
    };

    startScanner();

    return () => {
      stopScanner();
    };
  }, []);

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  const handleClose = async () => {
    await stopScanner();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Scan QR Code</h3>
          </div>
          <Button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <div id="qr-reader" className="w-full rounded-lg overflow-hidden"></div>
        </div>

        <p className="text-sm text-gray-600 text-center mb-4">
          Position the QR code within the frame to scan
        </p>

        <Button
          onClick={handleClose}
          className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}