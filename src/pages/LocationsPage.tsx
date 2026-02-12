import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Locations } from '../components/Locations';

interface LocationsPageProps {
  userId: string;
}

export function LocationsPage({ userId }: LocationsPageProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Admin</p>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Locations</h2>
        </div>
        <button
          onClick={() => setRefreshKey(prev => prev + 1)}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <Locations userId={userId} refresh={refreshKey} />
    </div>
  );
}
