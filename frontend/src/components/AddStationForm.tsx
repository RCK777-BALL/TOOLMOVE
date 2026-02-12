import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { api } from '../lib/api';

interface AddStationFormProps {
  lineId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface Line {
  id: string;
  name: string;
}

export function AddStationForm({ lineId: propLineId, onSuccess, onCancel }: AddStationFormProps) {
  const [bulkMode, setBulkMode] = useState(false);
  const [name, setName] = useState('');
  const [bulkNames, setBulkNames] = useState('');
  const [lineId, setLineId] = useState(propLineId || '');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lines, setLines] = useState<Line[]>([]);

  useEffect(() => {
    if (!propLineId) {
      fetchLines();
    }
  }, [propLineId]);

  const fetchLines = async () => {
    try {
      const data = await api.getLocations();
      const extractedLines = (data || []).flatMap((d: any) =>
        (d.lines || []).map((l: any) => ({ id: l._id || l.id, name: l.name }))
      );
      setLines(extractedLines);
    } catch (error) {
      console.error('Error fetching lines:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (bulkMode) {
        const stationNames = bulkNames
          .split(',')
          .map(n => n.trim())
          .filter(n => n.length > 0);

        if (stationNames.length === 0) {
          throw new Error('Please enter at least one station name');
        }

        const stationsToInsert = stationNames.map(stationName => ({
          name: stationName,
          line: lineId,
          description,
          status,
        }));

        await Promise.all(stationsToInsert.map(s => api.addStation(s)));
      } else {
        await api.addStation({
          name,
          line: lineId,
          description,
          status,
        });
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {bulkMode ? 'Add Multiple Stations' : 'Add New Station'}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={!bulkMode}
              onChange={() => setBulkMode(false)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm font-medium text-gray-700">Single Station</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={bulkMode}
              onChange={() => setBulkMode(true)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm font-medium text-gray-700">Bulk Add (Array)</span>
          </label>
        </div>

        {bulkMode ? (
          <div>
            <label htmlFor="bulkNames" className="block text-sm font-medium text-gray-700 mb-1">
              Station Names (comma-separated)
            </label>
            <textarea
              id="bulkNames"
              value={bulkNames}
              onChange={(e) => setBulkNames(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 1, 2, 3, 4, 5 or Station A, Station B, Station C"
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter multiple station names separated by commas. Each will be created as a separate station.
            </p>
          </div>
        ) : (
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Station Number
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Station 1, Station A"
            />
          </div>
        )}

        {!propLineId && (
          <div>
            <label htmlFor="line" className="block text-sm font-medium text-gray-700 mb-1">
              Line
            </label>
            <select
              id="line"
              value={lineId}
              onChange={(e) => setLineId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a line</option>
              {lines.map((line) => (
                <option key={line.id} value={line.id}>
                  {line.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description {bulkMode && '(applies to all stations)'}
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={bulkMode ? "Optional description for all stations" : "Brief description of the station"}
            rows={3}
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status {bulkMode && '(applies to all stations)'}
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : bulkMode ? 'Add Stations' : 'Add Station'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
