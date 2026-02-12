import { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Activity } from '../components/Activity';
import { api } from '../lib/api';

export function ActivityPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [weldRequests, setWeldRequests] = useState<any[]>([]);

  useEffect(() => {
    fetchWeldRequests();
  }, [refreshKey]);

  const fetchWeldRequests = async () => {
    try {
      const data = await api.getToolMoves();
      const pending = (data || []).filter(
        (m: any) => m.requiresWeldTouchup && !m.weldTouchupCompleted
      );
      setWeldRequests(pending);
    } catch (err) {
      console.error('Error loading weld requests', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Overview</p>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h2>
        </div>
        <button
          onClick={() => setRefreshKey(prev => prev + 1)}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Activity refresh={refreshKey} />
        </div>
        <div className="bg-white rounded-lg shadow p-4 border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Weld Touch Up Requests</h3>
            <span className="text-xs text-gray-500">{weldRequests.length}</span>
          </div>
          {weldRequests.length === 0 ? (
            <p className="text-sm text-gray-500">No pending weld touch up requests.</p>
          ) : (
            <div className="space-y-2 max-h-[320px] overflow-y-auto">
              {weldRequests.map((req) => (
                <div key={req._id || req.id} className="border border-orange-100 rounded-md p-3 bg-orange-50">
                  <div className="text-sm font-semibold text-orange-800">
                    {req.reason?.name || req.reason || 'Weld Touch Up'}
                  </div>
                  <div className="text-xs text-gray-700 mt-1">
                    {[req.department?.name || req.department, req.line?.name || req.line, req.station?.name || req.station]
                      .filter(Boolean)
                      .join(' / ') || '—'}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {req.weldTouchupNotes || req.notes || 'No notes'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(req.created_at || req.createdAt || Date.now()).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
