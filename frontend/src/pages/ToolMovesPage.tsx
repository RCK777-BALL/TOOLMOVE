import { useState } from 'react';
import { Plus, RotateCcw } from 'lucide-react';
import { Button } from '@radix-ui/themes';

import { ToolMoveList } from '../components/ToolMoveList';
import { useNavigate } from 'react-router-dom';

interface ToolMovesPageProps {
  refresh?: number;
}

export function ToolMovesPage({ refresh }: ToolMovesPageProps = {}) {
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {/* <p className="text-xs uppercase tracking-wide text-gray-500">Records</p> */}
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Tool Moves</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button
            onClick={() => navigate('/tool-moves/add')}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add <span className="hidden sm:inline">Tool Move</span>
          </Button>
        </div>
      </div>

      <ToolMoveList refresh={refreshKey + (refresh || 0)} />
    </div>
  );
}
