import { useEffect, useState } from 'react';
import { ToolMoveWeldModal } from './ToolMoveWeldModal';
import { WeldTouchupModal } from './WeldTouchupModal';
import { api } from '../lib/api';
import { CheckCircle } from 'lucide-react';

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
  reason?: { name: string };
  department?: { name: string };
  line?: { name: string };
  station?: { name: string };
}

interface WeldListProps {
  refresh?: number;
}

export function WeldList({ refresh = 0 }: WeldListProps) {
  const [welds, setWelds] = useState<WeldTouchup[]>([]);
  const [toolMoves, setToolMoves] = useState<ToolMoveWithWeld[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedToolMove, setSelectedToolMove] = useState<ToolMoveWithWeld | null>(null);
  const [selectedWeld, setSelectedWeld] = useState<WeldTouchup | null>(null);

  useEffect(() => {
    fetchData();
  }, [refresh]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [weldData, moveData] = await Promise.all([api.getWelds(), api.getToolMoves()]);

      setWelds(
        (weldData || []).map((w: any) => ({
          id: w._id || w.id,
          part_number: w.partNumber,
          weld_type: w.weldType,
          reason: w.reason,
          completed_by: w.completedBy,
          status: w.status,
          created_at: w.created_at || w.createdAt,
        }))
      );

      setToolMoves(
        (moveData || [])
          .filter((m: any) => m.requiresWeldTouchup && !m.weldTouchupCompleted)
          .map((m: any) => ({
            id: m._id || m.id,
            notes: m.notes,
            weld_touchup_notes: m.weldTouchupNotes,
            moved_by: m.movedBy,
            created_at: m.created_at || m.createdAt,
            requires_weld_touchup: m.requiresWeldTouchup,
            weld_touchup_completed: m.weldTouchupCompleted,
            reason: m.reason ? { name: m.reason.name || m.reason } : undefined,
            department: m.department ? { name: m.department.name || m.department } : undefined,
            line: m.line ? { name: m.line.name || m.line } : undefined,
            station: m.station ? { name: m.station.name || m.station } : undefined,
          }))
      );
    } catch (err) {
      console.error('Error fetching weld data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tool Moves requiring weld touch up */}
      {toolMoves.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-orange-50 border-b border-orange-200 px-4 sm:px-6 py-3">
            <h3 className="text-sm font-semibold text-orange-900">
              Tool Moves Requiring Weld Touch Up
            </h3>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden divide-y">
            {toolMoves.map((move) => (
              <div
                key={move.id}
                className="bg-orange-50 px-4 py-3 space-y-2"
                onClick={() => setSelectedToolMove(move)}
              >
                <div className="flex justify-between text-sm font-semibold text-gray-900">
                  <span>{move.reason?.name || '-'}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(move.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-xs text-gray-700">
                  {[move.department?.name, move.line?.name, move.station?.name].filter(Boolean).join(' / ') || '—'}
                </div>
                <div className="text-xs text-gray-700">
                  {move.weld_touchup_notes || move.notes || 'No notes'}
                </div>
                <div className="text-xs text-gray-600">Moved by: {move.moved_by || '—'}</div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <table className="hidden sm:table min-w-full divide-y divide-gray-200">
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
                    {move.reason?.name || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex flex-col gap-1">
                      {move.department?.name && (
                        <span className="text-xs">Dept: {move.department.name}</span>
                      )}
                      {move.line?.name && (
                        <span className="text-xs">Line: {move.line.name}</span>
                      )}
                      {move.station?.name && (
                        <span className="text-xs">Station: {move.station.name}</span>
                      )}
                      {!move.department && !move.line && !move.station && '-'}
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
                    <CheckCircle className="h-5 w-5 text-gray-400" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Weld touchup records */}
      {welds.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-4 sm:px-6 py-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Weld Touch Up Records
            </h3>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden divide-y">
            {welds.map((weld) => (
              <div
                key={weld.id}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedWeld(weld)}
              >
                <div className="flex justify-between text-sm font-semibold text-gray-900">
                  <span>{weld.part_number}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(weld.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-xs text-gray-700 mt-1">Type: {weld.weld_type}</div>
                <div className="text-xs text-gray-700">Reason: {weld.reason}</div>
                <div className="text-xs text-gray-600">Completed By: {weld.completed_by || '—'}</div>
                <div className="text-xs text-gray-600 capitalize">Status: {weld.status}</div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <table className="hidden sm:table min-w-full divide-y divide-gray-200">
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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completed By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {welds.map((weld) => (
                <tr key={weld.id} onClick={() => setSelectedWeld(weld)} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {weld.part_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {weld.weld_type}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {weld.reason}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      weld.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {weld.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {weld.completed_by || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(weld.created_at).toLocaleDateString()}
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
          onClose={() => {
            setSelectedToolMove(null);
            fetchData();
          }}
        />
      )}

      {selectedWeld && (
        <WeldTouchupModal
          weld={selectedWeld}
          onClose={() => {
            setSelectedWeld(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
