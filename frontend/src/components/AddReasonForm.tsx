import { useState } from 'react';
import { X } from 'lucide-react';
import { Button, Flex, Select, Text, TextArea, TextField, Heading } from '@radix-ui/themes';
import { api } from '../lib/api';

interface AddReasonFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddReasonForm({ onSuccess, onCancel }: AddReasonFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.createReason({ name, description, status });
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
      <Flex justify="between" align="center" mb="3">
        <Heading size="4">Add New Reason</Heading>
        <Button variant="ghost" color="gray" onClick={onCancel} size="1" aria-label="Close">
          <X className="h-4 w-4" />
        </Button>
      </Flex>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <Text as="label" htmlFor="name" size="2" weight="medium">Reason Name</Text>
          <TextField.Root
            id="name"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            required
            placeholder="e.g., gap, part, fitup"
          />
        </div>

        <div className="space-y-1">
          <Text as="label" htmlFor="description" size="2" weight="medium">Description</Text>
          <TextArea
            id="description"
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            placeholder="Brief description of this reason"
            rows={3}
          />
        </div>

        <div className="space-y-1">
          <Text as="label" htmlFor="status" size="2" weight="medium">Status</Text>
          <Select.Root value={status} onValueChange={setStatus}>
            <Select.Trigger />
            <Select.Content>
              <Select.Item value="active">Active</Select.Item>
              <Select.Item value="inactive">Inactive</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>

        <Flex gap="3" direction={{ initial: 'column', sm: 'row' }}>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Adding...' : 'Add Reason'}
          </Button>
          <Button type="button" variant="soft" color="gray" onClick={onCancel}>
            Cancel
          </Button>
        </Flex>
      </form>
    </div>
  );
}
