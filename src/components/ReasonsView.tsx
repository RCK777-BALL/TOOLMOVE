import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AlertCircle } from 'lucide-react';
import type { Reason } from '../types/domain';

export function ReasonsView() {
  const [reasons, setReasons] = useState<Reason[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReasons();
  }, []);

  const fetchReasons = async () => {
    try {
      const { data } = await supabase
        .from('reasons')
        .select('*')
        .order('name');

      setReasons((data as Reason[]) || []);
    } catch (error) {
      console.error('Error fetching reasons:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-gray-600">Loading reasons...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Reasons</h2>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Tool Move Reasons</h3>
          </div>
        </div>
        <div className="p-6">
          {reasons.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No reasons found</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reasons.map((reason) => (
                <div
                  key={reason.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{reason.name}</h4>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        reason.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {reason.status}
                    </span>
                  </div>
                  {reason.description && (
                    <p className="text-sm text-gray-600">{reason.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
