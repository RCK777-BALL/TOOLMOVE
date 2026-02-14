import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { Button } from '@radix-ui/themes';

interface Line {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
  departments?: {
    name: string;
  };
}

export function LineList() {
  const [lines, setLines] = useState<Line[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLines();
  }, []);

  const fetchLines = async () => {
    try {
      const data = await api.getLocations();
      const flattened = (data || []).flatMap((dept: any) =>
        (dept.lines || []).map((l: any) => ({
          id: l._id || l.id,
          name: l.name,
          description: l.description,
          status: l.status,
          created_at: l.createdAt || l.created_at || '',
          departments: { name: dept.name },
        }))
      );
      setLines(flattened);
    } catch (error) {
      console.error('Error fetching lines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this line?')) return;

    try {
      await api.deleteLine(id);
      setLines(lines.filter(line => line.id !== id));
    } catch (error) {
      console.error('Error deleting line:', error);
      alert('Failed to delete line');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-600">No lines yet. Add your first line to get started!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Department
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
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
          {lines.map((line) => (
            <tr key={line.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {line.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {line.departments?.name || '-'}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {line.description || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  line.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {line.status}
                </span>
              </td>
              <td>
                <Button
                  onClick={() => handleDelete(line.id)}
                  variant="ghost"
                  color="red"
                  className="ml-4 text-red-600 hover:text-red-900"
                >
                  <Trash2 size={16} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
