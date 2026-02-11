import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, CheckCircle } from 'lucide-react';

interface WeldTouchup {
  id: string;
  part_number: string;
  weld_type: string;
  reason: string;
  completed_by: string;
  status: string;
  created_at: string;
}

interface WeldTouchupModalProps {
  weldTouchup: WeldTouchup;
  onClose: () => void;
  onUpdate: () => void;
}

export function WeldTouchupModal({ weldTouchup, onClose, onUpdate }: WeldTouchupModalProps) {
  const [status, setStatus] = useState(weldTouchup.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('weld_touchups')
        .update({ status })
        .eq('id', weldTouchup.id);

      if (error) throw error;

      onUpdate();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('weld_touchups')
        .update({ status: 'completed' })
        .eq('id', weldTouchup.id);

      if (error) throw error;

      onUpdate();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Update Weld Touchup</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Part Number:</span>
              <span className="text-sm text-gray-900">{weldTouchup.part_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Weld Type:</span>
              <span className="text-sm text-gray-900">{weldTouchup.weld_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Reason:</span>
              <span className="text-sm text-gray-900">{weldTouchup.reason}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Completed By:</span>
              <span className="text-sm text-gray-900">{weldTouchup.completed_by}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Date:</span>
              <span className="text-sm text-gray-900">
                {new Date(weldTouchup.created_at).toLocaleString()}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Update Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleMarkComplete}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <CheckCircle className="h-5 w-5" />
                Mark Complete
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </form>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
