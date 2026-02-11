import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Trash2 } from 'lucide-react';

interface Reason {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
}

interface ReasonListProps {
  userId: string;
}

export function ReasonList({ userId }: ReasonListProps) {
  const [reasons, setReasons] = useState<Reason[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReasons();
  }, [userId]);

  const fetchReasons = async () => {
    try {
      const { data, error } = await supabase
        .from('reasons')
        .select('*')
        .order('name');

      if (error) throw error;
      setReasons(data || []);
    } catch (error) {
      console.error('Error fetching reasons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reason?')) return;

    try {
      const { error } = await supabase
        .from('reasons')
        .delete()
        .eq('id', id);

      if (error) throw error;
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
      <table className="min-w-full divide-y divide-gray-200">
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
                <button
                  onClick={() => handleDelete(reason.id)}
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
  );
}
