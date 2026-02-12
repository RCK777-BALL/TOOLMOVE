import { useState } from 'react';
import { Plus, RotateCcw } from 'lucide-react';
import { UserProfiles } from '../components/UserProfiles';
import { useNavigate } from 'react-router-dom';

interface UsersPageProps {
  isAdmin: boolean;
}

export function UsersPage({ isAdmin }: UsersPageProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  const handleAdded = () => {
    setShowAddForm(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Admin</p>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Users</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setRefreshKey(prev => prev + 1)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Refresh
            </button>
            <button
              onClick={() => navigate('/users/add')}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add User
            </button>
          </div>
        </div>

      <UserProfiles isAdmin={isAdmin} key={`users-${refreshKey}`} />
    </div>
  );
}
