import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Eye } from 'lucide-react';
import { AddWeldForm } from './AddWeldForm';

export function WeldTouchUpsView() {
  const [weldTouchups, setWeldTouchups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTouchup, setSelectedTouchup] = useState<any>(null);

  useEffect(() => {
    fetchWeldTouchups();
  }, []);

  const fetchWeldTouchups = async () => {
    try {
      const { data } = await supabase
        .from('weld_touchups')
        .select(`
          *,
          departments(name),
          lines(name),
          stations(name)
        `)
        .order('created_at', { ascending: false });

      setWeldTouchups(data || []);
    } catch (error) {
      console.error('Error fetching weld touchups:', error);
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
    fetchWeldTouchups();
  };

  if (showAddForm) {
    return (
      <div>
        <AddWeldForm onSuccess={handleSuccess} onCancel={() => setShowAddForm(false)} />
      </div>
    );
  }

  if (selectedTouchup) {
    return (
      <div>
        <button
          onClick={() => setSelectedTouchup(null)}
          className="mb-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          ← Back to Weld Touch Ups
        </button>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Weld Touch Up Details</h3>
          <div className="space-y-3">
            <div>
              <span className="font-medium text-gray-700">Part Number:</span>{' '}
              <span className="text-gray-900">{selectedTouchup.part_number}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Department:</span>{' '}
              <span className="text-gray-900">{selectedTouchup.departments?.name || '-'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Line:</span>{' '}
              <span className="text-gray-900">{selectedTouchup.lines?.name || '-'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Station:</span>{' '}
              <span className="text-gray-900">{selectedTouchup.stations?.name || '-'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Weld Type:</span>{' '}
              <span className="text-gray-900">{selectedTouchup.weld_type}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Reason:</span>{' '}
              <span className="text-gray-900">{selectedTouchup.reason}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Completed By:</span>{' '}
              <span className="text-gray-900">{selectedTouchup.completed_by}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Status:</span>{' '}
              <span
                className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                  selectedTouchup.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : selectedTouchup.status === 'in_progress'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {selectedTouchup.status}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Notes:</span>{' '}
              <span className="text-gray-900">{selectedTouchup.notes || '-'}</span>
            </div>
            {selectedTouchup.photo_url && (
              <div>
                <span className="font-medium text-gray-700">Photo:</span>
                <img
                  src={selectedTouchup.photo_url}
                  alt="Weld touchup"
                  className="mt-2 max-w-md rounded border border-gray-300"
                />
              </div>
            )}
            <div>
              <span className="font-medium text-gray-700">Created At:</span>{' '}
              <span className="text-gray-900">{formatDate(selectedTouchup.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Weld Touch Ups</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Weld Touch Up
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
                    Part Number
                  </th>
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
                    Weld Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
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
                {weldTouchups.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      No weld touch ups recorded
                    </td>
                  </tr>
                ) : (
                  weldTouchups.map((touchup) => (
                    <tr key={touchup.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm text-gray-900">{touchup.part_number}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{touchup.departments?.name || '-'}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{touchup.lines?.name || '-'}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{touchup.stations?.name || '-'}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{touchup.weld_type}</td>
                      <td className="px-4 py-4 text-sm">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            touchup.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : touchup.status === 'in_progress'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {touchup.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {formatDate(touchup.created_at)}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <button
                          onClick={() => setSelectedTouchup(touchup)}
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
