import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Button, Flex, Heading, Text, TextField, Checkbox } from '@radix-ui/themes';

export function UserEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);
  const [form, setForm] = useState({ email: '', fullName: '', department: '', isAdmin: false, password: '' });

  useEffect(() => {
    if (!id) return;
    load();
    loadDepartments();
  }, [id]);

  const load = async () => {
    try {
      setLoading(true);
      const user = await api.getUser(id!);
      setForm({
        email: user.email || '',
        fullName: user.fullName || '',
        department: user.department || '',
        isAdmin: !!user.isAdmin,
        password: '',
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const data = await api.getLocations();
      setDepartments((data || []).map((d: any) => d.name).filter(Boolean));
    } catch (err) {
      console.error(err);
    }
  };

  const save = async () => {
    if (!id) return;
    try {
      setLoading(true);
      await api.updateUser(id, {
        email: form.email,
        fullName: form.fullName,
        department: form.department || '',
        isAdmin: form.isAdmin,
        ...(form.password ? { password: form.password } : {}),
      });
      navigate('/users');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <Heading size="5">Edit User</Heading>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      <div className="bg-white p-4 rounded-lg shadow space-y-3">
        <div className="space-y-1">
          <Text>Email</Text>
          <TextField.Root
            value={form.email}
            onChange={(e: any) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Text>Full Name</Text>
          <TextField.Root
            value={form.fullName}
            onChange={(e: any) => setForm({ ...form, fullName: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Text>Department</Text>
          <select
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Unassigned</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Text>New Password (optional)</Text>
          <TextField.Root
            type="password"
            value={form.password}
            onChange={(e: any) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={form.isAdmin}
            onCheckedChange={(v) => setForm({ ...form, isAdmin: v === true })}
          />
          <Text>Admin</Text>
        </label>
      </div>

      <Flex gap="3">
        <Button variant="soft" color="gray" onClick={() => navigate(-1)}>Cancel</Button>
        <Button onClick={save} disabled={loading}>Save</Button>
      </Flex>
    </div>
  );
}
