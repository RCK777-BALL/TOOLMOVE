import { Dialog, DialogContent, DialogHeader } from './ui/dialog';

interface ToolMoveWeldModalProps {
  toolMove: any;
  onClose: () => void;
  onUpdate?: () => void;
}

export function ToolMoveWeldModal({ toolMove, onClose }: ToolMoveWeldModalProps) {
  const isPending = !toolMove.weld_touchup_completed;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader title="Tool Move - Weld Touch Up Request" onClose={onClose} />

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
      </DialogContent>
    </Dialog>
  );
}
