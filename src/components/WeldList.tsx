import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Trash2, CheckCircle } from 'lucide-react';
import { ToolMoveWeldModal } from './ToolMoveWeldModal';
import { WeldTouchupModal } from './WeldTouchupModal';

interface WeldTouchup {
  id: string;
  part_number: string;
  weld_type: string;
  reason: string;
  completed_by: string;
  status: string;
  created_at: string;
}

interface ToolMoveWithWeld {
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
}

interface WeldListProps {
  userId: string;
  refresh?: number;
}

export function WeldList({ userId, refresh }: WeldListProps) {
  const [welds, setWelds] = useState<WeldTouchup[]>([]);
  const [toolMoves, setToolMoves] = useState<ToolMoveWithWeld[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedToolMove, setSelectedToolMove] = useState<ToolMoveWithWeld | null>(null);
  const [selectedWeld, setSelectedWeld] = useState<WeldTouchup | null>(null);

  useEffect(() => {
    fetchWelds();
    fetchToolMovesWithWeld();
  }, [userId, refresh]);

  const fetchWelds = async () => {
    try {
      const { data, error } = await supabase
        .from('weld_touchups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWelds(data || []);
    } catch (error) {
      console.error('Error fetching weld touchups:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchToolMovesWithWeld = async () => {
    try {
      const { data, error } = await supabase
        .from('tool_moves')
        .select('*, reasons(name), departments(name), lines(name), stations(name)')
        .eq('requires_weld_touchup', true)
        .eq('weld_touchup_completed', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setToolMoves(data || []);
    } catch (error) {
      console.error('Error fetching tool moves with weld requirements:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this weld touchup record?')) return;

    try {
      const { error } = await supabase
        .from('weld_touchups')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setWelds(welds.filter(weld => weld.id !== id));
    } catch (error) {
      console.error('Error deleting weld touchup:', error);
      alert('Failed to delete weld touchup');
    }
  };

  const handleMarkComplete = async (toolMoveId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!confirm('Mark this weld touch up as completed?')) return;

    try {
      const { error } = await supabase
        .from('tool_moves')
        .update({ weld_touchup_completed: true })
        .eq('id', toolMoveId);

      if (error) throw error;
      setToolMoves(toolMoves.filter(move => move.id !== toolMoveId));
    } catch (error) {
      console.error('Error marking weld touchup as complete:', error);
      alert('Failed to mark weld touchup as complete');
    }
  };

  const handleModalUpdate = () => {
    fetchToolMovesWithWeld();
    fetchWelds();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (welds.length === 0 && toolMoves.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-600">No weld touchup records yet. Add your first record to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toolMoves.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-orange-50 border-b border-orange-200 px-6 py-3">
            <h3 className="text-sm font-semibold text-orange-900">
              Tool Moves Requiring Weld Touch Up
            </h3>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Moved By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {toolMoves.map((move) => (
                <tr
                  key={move.id}
                  onClick={() => setSelectedToolMove(move)}
                  className="bg-orange-50 hover:bg-orange-100 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {move.reasons?.name || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex flex-col gap-1">
                      {move.departments?.name && (
                        <span className="text-xs">Dept: {move.departments.name}</span>
                      )}
                      {move.lines?.name && (
                        <span className="text-xs">Line: {move.lines.name}</span>
                      )}
                      {move.stations?.name && (
                        <span className="text-xs">Station: {move.stations.name}</span>
                      )}
                      {!move.departments && !move.lines && !move.stations && '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {move.weld_touchup_notes || move.notes || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {move.moved_by}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(move.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => handleMarkComplete(move.id, e)}
                      className="text-green-600 hover:text-green-900"
                      title="Mark as complete"
                    >
                      <CheckCircle className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {welds.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Weld Touch Up Records
            </h3>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Part Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Weld Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completed By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {welds.map((weld) => (
                <tr
                  key={weld.id}
                  onClick={() => setSelectedWeld(weld)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {weld.part_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {weld.weld_type}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {weld.reason}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {weld.completed_by}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      weld.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : weld.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {weld.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(weld.id);
                      }}
                      className="text-red-600 hover:text-red-900 ml-4"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedToolMove && (
        <ToolMoveWeldModal
          toolMove={selectedToolMove}
          onClose={() => setSelectedToolMove(null)}
          onUpdate={handleModalUpdate}
        />
      )}

      {selectedWeld && (
        <WeldTouchupModal
          weldTouchup={selectedWeld}
          onClose={() => setSelectedWeld(null)}
          onUpdate={handleModalUpdate}
        />
      )}
    </div>
  );
}
