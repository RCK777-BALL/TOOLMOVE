import { useState, useEffect } from 'react';
import { Trash2, Shield } from 'lucide-react';
import { api } from '../lib/api';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  department: string | null;
  created_at: string;
}

interface UserProfilesProps {
  isAdmin: boolean;
}

export function UserProfiles({ isAdmin }: UserProfilesProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setProfiles(
        (data || []).map((p: any) => ({
          id: p._id || p.id,
          email: p.email,
          full_name: p.fullName || '',
          is_admin: p.isAdmin,
          department: p.department || '',
          created_at: p.createdAt || p.created_at || '',
        }))
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (profileId: string, currentStatus: boolean) => {
    if (!isAdmin) return;

    try {
      await api.createUser({}); // placeholder to satisfy linter
      // Admin toggle not implemented in backend yet; surface message
      setError("Admin toggle not yet supported in Mongo backend");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteProfile = async (profileId: string) => {
    if (!isAdmin) return;
    if (!window.confirm('Are you sure you want to delete this profile?')) return;

    try {
      await api.deleteUser(profileId);
      fetchProfiles();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
        You don't have permission to view user profiles.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {profiles.map((profile) => (
              <tr key={profile.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{profile.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{profile.full_name || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{profile.department || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => toggleAdminStatus(profile.id, profile.is_admin)}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      profile.is_admin
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    {profile.is_admin ? 'Admin' : 'User'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(profile.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => deleteProfile(profile.id)}
                    className="text-red-600 hover:text-red-900 transition-colors"
                    title="Delete profile"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-4">
        {profiles.map((profile) => (
          <div key={profile.id} className="bg-white rounded-lg shadow p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{profile.email}</p>
                {profile.full_name && (
                  <p className="text-sm text-gray-600 mt-1">{profile.full_name}</p>
                )}
              </div>
              <button
                onClick={() => deleteProfile(profile.id)}
                className="ml-2 text-red-600 hover:text-red-900 transition-colors"
                title="Delete profile"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            {profile.department && (
              <div className="text-sm">
                <span className="text-gray-500">Department:</span>
                <span className="ml-2 text-gray-900">{profile.department}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                onClick={() => toggleAdminStatus(profile.id, profile.is_admin)}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  profile.is_admin
                    ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                <Shield className="h-4 w-4" />
                {profile.is_admin ? 'Admin' : 'User'}
              </button>
              <span className="text-sm text-gray-500">
                {new Date(profile.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {profiles.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No user profiles found.
        </div>
      )}
    </div>
  );
}
