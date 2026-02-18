import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@radix-ui/themes';
import { api } from '../lib/api';
import { Dialog, DialogContent, DialogHeader } from './ui/dialog';

interface ToolMove {
  id: string;
  notes: string;
  moved_by: string;
  created_at: string;
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
  requires_weld_touchup?: boolean;
  weld_touchup_notes?: string;
}

interface ToolMoveListProps {
  refresh?: number;
}

export function ToolMoveList({ refresh }: ToolMoveListProps) {
  const [toolMoves, setToolMoves] = useState<ToolMove[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ToolMove | null>(null);

  useEffect(() => {
    fetchToolMoves();
  }, [refresh]);

  const fetchToolMoves = async () => {
    try {
      const data = await api.getToolMoves();
      setToolMoves(
        (data || []).map((m: any) => ({
          id: m._id || m.id,
          notes: m.notes,
          moved_by: m.movedBy,
          created_at: m.created_at || m.createdAt,
          requires_weld_touchup: m.requiresWeldTouchup,
          weld_touchup_notes: m.weldTouchupNotes,
          reasons: m.reason ? { name: m.reason.name || m.reason } : undefined,
          departments: m.department ? { name: m.department.name || m.department } : undefined,
          lines: m.line ? { name: m.line.name || m.line } : undefined,
          stations: m.station ? { name: m.station.name || m.station } : undefined,
        }))
      );
    } catch (error) {
      console.error('Error fetching tool moves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tool move record?')) return;

    try {
      await api.deleteToolMove(id);
      setToolMoves(toolMoves.filter(move => move.id !== id));
    } catch (error) {
      console.error('Error deleting tool move:', error);
      alert('Failed to delete tool move record');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (toolMoves.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-600">No tool moves yet. Record your first tool move to get started!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Mobile cards */}
      <div className="sm:hidden divide-y">
        {toolMoves.map((move) => (
          <div
            key={move.id}
            className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
            onClick={() => setSelected(move)}
          >
            <div className="flex justify-between items-start">
              <div className="text-sm font-semibold text-gray-900">
                {move.reasons?.name || '-'}
              </div>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(move.id);
                }}
                className="text-red-600 hover:text-red-900"
                aria-label="Delete"
                variant="ghost"
                color="red"
              >
                <Trash2 size={16} />
              </Button>
            </div>
            <div className="text-xs text-gray-700 mt-1">
              {[move.departments?.name, move.lines?.name, move.stations?.name].filter(Boolean).join(' / ') || '—'}
            </div>
            <div className="text-xs text-gray-700 mt-1">Moved by: {move.moved_by || '-'}</div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(move.created_at).toLocaleDateString()}
            </div>
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
              Dept/Line/Station
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
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => setSelected(move)}
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
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {move.moved_by}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {new Date(move.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Button
                  onClick={() => handleDelete(move.id)}
                  className="text-red-600 hover:text-red-900"
                  variant="ghost"
                  color="red"
                >
                  <Trash2 size={16} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          {selected && (
            <>
              <DialogHeader title="Tool Move Details" onClose={() => setSelected(null)} />
              <div className="p-4 space-y-2 text-sm text-gray-700">
                <div><span className="font-semibold">Reason:</span> {selected.reasons?.name || '-'}</div>
                <div>
                  <span className="font-semibold">Location:</span>{' '}
                  {[selected.departments?.name, selected.lines?.name, selected.stations?.name]
                    .filter(Boolean)
                    .join(' / ') || '-'}
                </div>
                <div><span className="font-semibold">Moved By:</span> {selected.moved_by || '-'}</div>
                <div><span className="font-semibold">Date:</span> {new Date(selected.created_at).toLocaleString()}</div>
                <div><span className="font-semibold">Notes:</span> {selected.notes || '-'}</div>
                <div>
                  <span className="font-semibold">Requires Weld Touch Up:</span>{' '}
                  {selected.requires_weld_touchup ? 'Yes' : 'No'}
                </div>
                {selected.requires_weld_touchup && (
                  <div>
                    <span className="font-semibold">Weld Touch Up Notes:</span>{' '}
                    {selected.weld_touchup_notes || '-'}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
