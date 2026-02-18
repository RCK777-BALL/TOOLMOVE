import { useEffect, useState } from 'react';
import { Pencil, Trash2, Users, X, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/domain';

interface UsersViewProps {
  currentUserId: string;
}

interface EditState {
  full_name: string;
  role: string;
}

export function UsersView({ currentUserId }: UsersViewProps) {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({ full_name: '', role: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .order('email');

      if (error) {
        throw error;
      }

      setUsers((data as Profile[]) || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const beginEdit = (user: Profile) => {
    setEditingId(user.id);
    setEditState({
      full_name: user.full_name || '',
      role: user.role || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditState({ full_name: '', role: '' });
  };

  const saveUser = async (userId: string) => {
    setSavingId(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editState.full_name.trim() || null,
          role: editState.role.trim() || null,
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? {
                ...user,
                full_name: editState.full_name.trim() || null,
                role: editState.role.trim() || null,
              }
            : user,
        ),
      );

      cancelEdit();
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setSavingId(null);
    }
  };

  const deleteUser = async (userId: string) => {
    if (userId === currentUserId) {
      window.alert('You cannot delete your own user profile.');
      return;
    }

    const confirmed = window.confirm('Delete this user profile? This cannot be undone.');
    if (!confirmed) {
      return;
    }

    setDeletingId(userId);
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (error) {
        throw error;
      }

      setUsers((prev) => prev.filter((user) => user.id !== userId));
      if (editingId === userId) {
        cancelEdit();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <div className="text-gray-600">Loading users...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Users</h2>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Manage User Profiles</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isEditing = editingId === user.id;
                  return (
                    <tr key={user.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {isEditing ? (
                          <input
                            value={editState.full_name}
                            onChange={(e) => setEditState((prev) => ({ ...prev, full_name: e.target.value }))}
                            className="w-full border border-gray-300 rounded px-2 py-1"
                            placeholder="Enter full name"
                          />
                        ) : (
                          user.full_name || '—'
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {isEditing ? (
                          <input
                            value={editState.role}
                            onChange={(e) => setEditState((prev) => ({ ...prev, role: e.target.value }))}
                            className="w-full border border-gray-300 rounded px-2 py-1"
                            placeholder="Enter role"
                          />
                        ) : (
                          user.role || '—'
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => saveUser(user.id)}
                                disabled={savingId === user.id}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-60"
                              >
                                <Check className="h-4 w-4" />
                                Save
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                              >
                                <X className="h-4 w-4" />
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => beginEdit(user)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                              >
                                <Pencil className="h-4 w-4" />
                                Edit
                              </button>
                              <button
                                onClick={() => deleteUser(user.id)}
                                disabled={deletingId === user.id || user.id === currentUserId}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-60"
                                title={user.id === currentUserId ? 'Cannot delete your own profile' : undefined}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
