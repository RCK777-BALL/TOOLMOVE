import { useState, useEffect } from 'react';
import { Trash2, Shield, Pencil } from 'lucide-react';
import { Button, TextField, Flex, Checkbox, Text } from '@radix-ui/themes';
import { api } from '../lib/api';
import { Dialog, DialogContent, DialogHeader } from './ui/dialog';

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
  onSelect?: (id: string) => void;
}

export function UserProfiles({ isAdmin, onSelect }: UserProfilesProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Profile | null>(null);
  const [editForm, setEditForm] = useState({ email: '', fullName: '', department: '', isAdmin: false, password: '' });
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    fetchProfiles();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const data = await api.getLocations();
      const names = (data || []).map((d: any) => d.name).filter(Boolean);
      setDepartments(names);
    } catch (err) {
      console.error('Failed to load departments', err);
    }
  };

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

  const openEdit = (profile: Profile) => {
    setEditing(profile);
    setEditForm({
      email: profile.email,
      fullName: profile.full_name || '',
      department: profile.department || '',
      isAdmin: profile.is_admin,
      password: '',
    });
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      await api.updateUser(editing.id, {
        email: editForm.email,
        fullName: editForm.fullName,
        department: editForm.department,
        isAdmin: editForm.isAdmin,
        ...(editForm.password ? { password: editForm.password } : {}),
      });
      setEditing(null);
      fetchProfiles();
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
              <tr
                key={profile.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => (onSelect ? onSelect(profile.id) : openEdit(profile))}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{profile.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{profile.full_name || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{profile.department || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                    profile.is_admin ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    <Shield className="h-4 w-4" />
                    {profile.is_admin ? 'Admin' : 'User'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(profile.created_at).toLocaleDateString()}
                </td>
                <td>
                  <Flex gap="3" justify="center" align="center" pr="3">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect ? onSelect(profile.id) : openEdit(profile);
                      }}
                      variant="ghost"
                      color="gray"
                      title="Edit profile"
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProfile(profile.id);
                      }}
                      variant="ghost"
                      color="red"
                      className="text-red-600 hover:text-red-900 transition-colors"
                      title="Delete profile"
                      
                    >
                      <Trash2 size={16} />
                    </Button>
                  </Flex>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-4">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className="bg-white rounded-lg shadow p-4 space-y-3 cursor-pointer"
            onClick={() => (onSelect ? onSelect(profile.id) : openEdit(profile))}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{profile.email}</p>
                {profile.full_name && (
                  <p className="text-sm text-gray-600 mt-1">{profile.full_name}</p>
                )}
              </div>
              <Flex gap="1">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    openEdit(profile);
                  }}
                  variant="ghost"
                  color="gray"
                  title="Edit profile"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteProfile(profile.id);
                  }}
                  variant="ghost"
                  color="red"
                  className="ml-1 text-red-600 hover:text-red-900 transition-colors"
                  title="Delete profile"
                >
                  <Trash2 size={16} />
                </Button>
              </Flex>
            </div>

            {profile.department && (
              <div className="text-sm">
                <span className="text-gray-500">Department:</span>
                <span className="ml-2 text-gray-900">{profile.department}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                  profile.is_admin ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}
              >
                <Shield className="h-4 w-4" />
                {profile.is_admin ? 'Admin' : 'User'}
              </span>
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
      
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-lg">
          {editing && (
            <>
              <DialogHeader title="Edit User" onClose={() => setEditing(null)} />
              <div className="p-4 space-y-3">
                <div className="space-y-1">
                  <Text size="2">Email</Text>
                  <TextField.Root
                    value={editForm.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Text size="2">Full Name</Text>
                  <TextField.Root
                    value={editForm.fullName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditForm({ ...editForm, fullName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Text size="2">Department</Text>
                  <select
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">Unassigned</option>
                    {departments.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Text size="2">New Password (optional)</Text>
                  <TextField.Root
                    type="password"
                    value={editForm.password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditForm({ ...editForm, password: e.target.value })
                    }
                  />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={editForm.isAdmin}
                    onCheckedChange={(v) => setEditForm({ ...editForm, isAdmin: v === true })}
                  />
                  <Text size="2">Admin</Text>
                </label>
                <Flex gap="2" justify="end" pt="2">
                  <Button variant="soft" color="gray" onClick={() => setEditing(null)}>
                    Cancel
                  </Button>
                  <Button onClick={saveEdit}>Save</Button>
                </Flex>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
