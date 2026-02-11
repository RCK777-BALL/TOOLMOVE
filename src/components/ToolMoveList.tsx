import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Trash2 } from 'lucide-react';

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
}

interface ToolMoveListProps {
  userId: string;
  refresh?: number;
}

export function ToolMoveList({ userId, refresh }: ToolMoveListProps) {
  const [toolMoves, setToolMoves] = useState<ToolMove[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchToolMoves();
  }, [userId, refresh]);

  const fetchToolMoves = async () => {
    try {
      const { data, error } = await supabase
        .from('tool_moves')
        .select('*, reasons(name), departments(name), lines(name), stations(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setToolMoves(data || []);
    } catch (error) {
      console.error('Error fetching tool moves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tool move record?')) return;

    try {
      const { error } = await supabase
        .from('tool_moves')
        .delete()
        .eq('id', id);

      if (error) throw error;
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
      <table className="min-w-full divide-y divide-gray-200">
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
            <tr key={move.id} className="hover:bg-gray-50">
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
                <button
                  onClick={() => handleDelete(move.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
