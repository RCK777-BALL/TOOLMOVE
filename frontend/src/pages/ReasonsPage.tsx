import { useState } from 'react';
import { Plus, RotateCcw } from 'lucide-react';
import { ReasonList } from '../components/ReasonList';
import { AddReasonForm } from '../components/AddReasonForm';

import { Button } from '@radix-ui/themes';
import { Dialog, DialogContent, DialogHeader } from '../components/ui/dialog';

interface ReasonsPageProps {
  refresh?: number;
}

export function ReasonsPage({ refresh }: ReasonsPageProps = {}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAdded = () => {
    setShowAddForm(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {/* <p className="text-xs uppercase tracking-wide text-gray-500">Admin</p> */}
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Reason List</h2>
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
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add <span className="hidden sm:inline">Reason</span>
          </Button>
        </div>
      </div>

      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent>
          <DialogHeader title="Add Reason" onClose={() => setShowAddForm(false)} />
          <div className="p-4">
            <AddReasonForm onSuccess={handleAdded} onCancel={() => setShowAddForm(false)} />
          </div>
        </DialogContent>
      </Dialog>

      <ReasonList key={`reasons-${refreshKey + (refresh || 0)}`} />
    </div>
  );
}
