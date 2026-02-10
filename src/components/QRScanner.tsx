import { X } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: { departmentId?: string; lineId?: string; stationId?: string; note?: string }) => void;
  onClose: () => void;
}

export function QRScanner({ onClose }: QRScannerProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">QR Scanner</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-gray-600 text-center">QR Scanner feature coming soon</p>
        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
