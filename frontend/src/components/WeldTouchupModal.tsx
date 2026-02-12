import { X } from 'lucide-react';

interface WeldTouchup {
  id: string;
  part_number: string;
  weld_type: string;
  reason: string;
  completed_by: string;
  status: string;
  created_at: string;
  notes?: string;
}

interface WeldTouchupModalProps {
  weld: WeldTouchup;
  onClose: () => void;
}

export function WeldTouchupModal({ weld, onClose }: WeldTouchupModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Weld Touch Up</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-3 text-sm text-gray-800">
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Part Number</span>
            <span>{weld.part_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Weld Type</span>
            <span>{weld.weld_type}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Reason</span>
            <span>{weld.reason}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Completed By</span>
            <span>{weld.completed_by || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Status</span>
            <span className="capitalize">{weld.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Created</span>
            <span>{new Date(weld.created_at).toLocaleString()}</span>
          </div>
          {weld.notes && (
            <div>
              <span className="font-medium text-gray-600">Notes</span>
              <div className="mt-1 bg-gray-50 border border-gray-200 rounded-md p-2">
                {weld.notes}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
