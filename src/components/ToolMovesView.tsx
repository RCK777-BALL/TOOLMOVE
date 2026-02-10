import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Eye } from 'lucide-react';
import { AddToolMoveForm } from './AddToolMoveForm';

export function ToolMovesView() {
  const [toolMoves, setToolMoves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMove, setSelectedMove] = useState<any>(null);

  useEffect(() => {
    fetchToolMoves();
  }, []);

  const fetchToolMoves = async () => {
    try {
      const { data } = await supabase
        .from('tool_moves')
        .select(`
          *,
          departments(name),
          lines(name),
          stations(name),
          reasons(name)
        `)
        .order('created_at', { ascending: false });

      setToolMoves(data || []);
    } catch (error) {
      console.error('Error fetching tool moves:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleSuccess = () => {
    setShowAddForm(false);
    fetchToolMoves();
  };

  if (showAddForm) {
    return (
      <div>
        <AddToolMoveForm onSuccess={handleSuccess} onCancel={() => setShowAddForm(false)} />
      </div>
    );
  }

  if (selectedMove) {
    return (
      <div>
        <button
          onClick={() => setSelectedMove(null)}
          className="mb-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          ← Back to Tool Moves
        </button>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Tool Move Details</h3>
          <div className="space-y-3">
            <div>
              <span className="font-medium text-gray-700">Department:</span>{' '}
              <span className="text-gray-900">{selectedMove.departments?.name || '-'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Line:</span>{' '}
              <span className="text-gray-900">{selectedMove.lines?.name || '-'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Station:</span>{' '}
              <span className="text-gray-900">{selectedMove.stations?.name || '-'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Reason:</span>{' '}
              <span className="text-gray-900">{selectedMove.reasons?.name || '-'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Moved By:</span>{' '}
              <span className="text-gray-900">{selectedMove.moved_by}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Notes:</span>{' '}
              <span className="text-gray-900">{selectedMove.notes || '-'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Requires Weld Touchup:</span>{' '}
              <span className="text-gray-900">{selectedMove.requires_weld_touchup ? 'Yes' : 'No'}</span>
            </div>
            {selectedMove.requires_weld_touchup && (
              <div>
                <span className="font-medium text-gray-700">Weld Touchup Completed:</span>{' '}
                <span className="text-gray-900">{selectedMove.weld_touchup_completed ? 'Yes' : 'No'}</span>
              </div>
            )}
            {selectedMove.photo_url && (
              <div>
                <span className="font-medium text-gray-700">Photo:</span>
                <img
                  src={selectedMove.photo_url}
                  alt="Tool move"
                  className="mt-2 max-w-md rounded border border-gray-300"
                />
              </div>
            )}
            <div>
              <span className="font-medium text-gray-700">Created At:</span>{' '}
              <span className="text-gray-900">{formatDate(selectedMove.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Tool Moves</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Tool Move
        </button>
      </div>

      {loading ? (
        <div className="text-gray-600">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Line
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Station
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Moved By
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {toolMoves.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No tool moves recorded
                    </td>
                  </tr>
                ) : (
                  toolMoves.map((move) => (
                    <tr key={move.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm text-gray-900">{move.departments?.name || '-'}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{move.lines?.name || '-'}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{move.stations?.name || '-'}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{move.reasons?.name || '-'}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{move.moved_by}</td>
                      <td className="px-4 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {formatDate(move.created_at)}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <button
                          onClick={() => setSelectedMove(move)}
                          className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
