import { X } from 'lucide-react';

interface ToolMoveWeldModalProps {
  toolMove: any;
  onClose: () => void;
  onUpdate?: () => void;
}

export function ToolMoveWeldModal({ toolMove, onClose }: ToolMoveWeldModalProps) {
  const isPending = !toolMove.weld_touchup_completed;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            Tool Move - Weld Touch Up Request
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                isPending
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {isPending ? 'Pending Weld Touch Up' : 'Weld Touch Up Completed'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                {toolMove.reason?.name || toolMove.reasons?.name || '-'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Moved By
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                {toolMove.moved_by || toolMove.movedBy || '-'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                {toolMove.department?.name || toolMove.departments?.name || '-'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Line
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                {toolMove.line?.name || toolMove.lines?.name || '-'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Station
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                {toolMove.station?.name || toolMove.stations?.name || '-'}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Recorded
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
              {new Date(toolMove.created_at || toolMove.createdAt || Date.now()).toLocaleString()}
            </div>
          </div>

          {toolMove.notes && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tool Move Notes
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 whitespace-pre-wrap">
                {toolMove.notes}
              </div>
            </div>
          )}

          {toolMove.weld_touchup_notes && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weld Touch Up Notes
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 whitespace-pre-wrap">
                {toolMove.weld_touchup_notes}
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
