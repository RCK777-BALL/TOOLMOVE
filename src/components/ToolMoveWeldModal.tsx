import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, CheckCircle } from 'lucide-react';

interface ToolMoveWeldModalProps {
  toolMove: {
    id: string;
    notes: string;
    weld_touchup_notes: string;
    moved_by: string;
    created_at: string;
    requires_weld_touchup: boolean;
    weld_touchup_completed: boolean;
    reasons?: {
      name: string;
    };
    departments?: {
      name: string;
    };
    lines?: {
      name: string;
    };
    stations?: {
      name: string;
    };
  };
  onClose: () => void;
  onUpdate: () => void;
}

export function ToolMoveWeldModal({ toolMove, onClose, onUpdate }: ToolMoveWeldModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [weldTouchupNotes, setWeldTouchupNotes] = useState(toolMove.weld_touchup_notes || '');
  const [saving, setSaving] = useState(false);

  const isPending = !toolMove.weld_touchup_completed;

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('tool_moves')
        .update({ weld_touchup_notes: weldTouchupNotes })
        .eq('id', toolMove.id);

      if (error) throw error;
      onUpdate();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating tool move:', error);
      alert('Failed to update tool move');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!confirm('Mark this weld touch up as completed?')) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('tool_moves')
        .update({ weld_touchup_completed: true })
        .eq('id', toolMove.id);

      if (error) throw error;
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error marking as complete:', error);
      alert('Failed to mark as complete');
    } finally {
      setSaving(false);
    }
  };

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
                {toolMove.reasons?.name || '-'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Moved By
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                {toolMove.moved_by}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {toolMove.departments && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                  {toolMove.departments.name}
                </div>
              </div>
            )}

            {toolMove.lines && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Line
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                  {toolMove.lines.name}
                </div>
              </div>
            )}

            {toolMove.stations && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Station
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                  {toolMove.stations.name}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Recorded
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
              {new Date(toolMove.created_at).toLocaleString()}
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

          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-start mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Weld Touch Up Details
              </label>
              {isPending && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Edit Details
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={weldTouchupNotes}
                  onChange={(e) => setWeldTouchupNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the weld touch up requirements"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setWeldTouchupNotes(toolMove.weld_touchup_notes || '');
                      setIsEditing(false);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 whitespace-pre-wrap">
                {toolMove.weld_touchup_notes || 'No details provided'}
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          {isPending && !isEditing && (
            <button
              onClick={handleMarkComplete}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              {saving ? 'Processing...' : 'Mark as Complete'}
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
