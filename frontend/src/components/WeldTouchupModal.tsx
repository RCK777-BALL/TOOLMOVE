import { Dialog, DialogContent, DialogHeader } from './ui/dialog';

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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader title="Weld Touch Up" onClose={onClose} />

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
      </DialogContent>
    </Dialog>
  );
}
