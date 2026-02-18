import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@radix-ui/themes';
import { api } from '../lib/api';

interface Reason {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
}

export function ReasonList() {
  const [reasons, setReasons] = useState<Reason[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReasons();
  }, []);

  const fetchReasons = async () => {
    try {
      const data = await api.getReasons();
      setReasons((data || []).map((r: any) => ({
        id: r._id || r.id,
        name: r.name,
        description: r.description || '',
        status: r.status || 'active',
        created_at: r.createdAt || ''
      })));
    } catch (error) {
      console.error('Error fetching reasons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reason?')) return;

    try {
      await api.deleteReason(id);
      setReasons(reasons.filter(reason => reason.id !== id));
    } catch (error) {
      console.error('Error deleting reason:', error);
      alert('Failed to delete reason');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (reasons.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-600">No reasons available. Add your first reason to get started!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Mobile cards */}
      <div className="sm:hidden divide-y">
        {reasons.map((reason) => (
          <div key={reason.id} className="px-4 py-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-gray-900">{reason.name}</p>
                <p className="text-xs text-gray-600 mt-1">{reason.description || '-'}</p>
                <span className={`inline-flex mt-2 px-2 py-1 text-xs font-semibold rounded-full ${
                  reason.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {reason.status}
                </span>
              </div>
              <Button
                onClick={() => handleDelete(reason.id)}
                className="text-red-600 hover:text-red-900 ml-4"
                aria-label="Delete reason"
                variant="ghost"
                color="red"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <table className="hidden sm:table min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
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
          {reasons.map((reason) => (
            <tr key={reason.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {reason.name}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {reason.description || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  reason.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {reason.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Button
                  onClick={() => handleDelete(reason.id)}
                  className="text-red-600 hover:text-red-900 ml-4"
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
    </div>
  );
}
