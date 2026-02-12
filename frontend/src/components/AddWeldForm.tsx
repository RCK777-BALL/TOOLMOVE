import { useEffect, useState } from 'react';
import { X, QrCode } from 'lucide-react';
import { QRScanner } from './QRScanner';
import { api } from '../lib/api';

interface AddWeldFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddWeldForm({ onSuccess, onCancel }: AddWeldFormProps) {
  const [partNumber, setPartNumber] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [lineId, setLineId] = useState('');
  const [stationId, setStationId] = useState('');
  const [weldType, setWeldType] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [completedBy, setCompletedBy] = useState(localStorage.getItem('tm_user_email') || '');
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  const [reasons, setReasons] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [lines, setLines] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);

  useEffect(() => {
    loadReasons();
    loadLocations();
  }, []);

  // reset line/station when parent changes
  useEffect(() => {
    setLineId('');
    setStationId('');
  }, [departmentId]);

  useEffect(() => {
    setStationId('');
  }, [lineId]);

  const loadReasons = async () => {
    try {
      const data = await api.getReasons();
      setReasons((data || []).map((r: any) => ({ id: r._id || r.id, name: r.name })));
    } catch (err) {
      console.error('Error fetching reasons', err);
    }
  };

  const loadLocations = async () => {
    try {
      const data = await api.getLocations();
      setDepartments((data || []).map((d: any) => ({ id: d._id || d.id, name: d.name })));
      setLines(
        (data || []).flatMap((d: any) =>
          (d.lines || []).map((l: any) => ({
            id: l._id || l.id,
            name: l.name,
            department_id: d._id || d.id,
          }))
        )
      );
      setStations(
        (data || []).flatMap((d: any) =>
          (d.lines || []).flatMap((l: any) =>
            (l.stations || []).map((s: any) => ({
              id: s._id || s.id,
              name: s.name,
              line_id: l._id || l.id,
            }))
          )
        )
      );
    } catch (err) {
      console.error('Error fetching locations', err);
    }
  };

  const handleQRScan = (data: { departmentId?: string; lineId?: string; stationId?: string; note?: string }) => {
    if (data.departmentId) setDepartmentId(data.departmentId);
    if (data.lineId) setLineId(data.lineId);
    if (data.stationId) setStationId(data.stationId);
    if (data.note) setNotes(data.note);
    setShowScanner(false);
  };

  const filteredLines = departmentId ? lines.filter((l) => l.department_id === departmentId) : [];
  const filteredStations = lineId ? stations.filter((s) => s.line_id === lineId) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.createWeld({
        partNumber,
        weldType,
        reason,
        department: departmentId || null,
        line: lineId || null,
        station: stationId || null,
        notes,
        completedBy: completedBy || localStorage.getItem('tm_user_email'),
        status,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Add New Weld Touch Up</h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="h-5 w-5" />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      {showScanner && (
        <QRScanner onScan={handleQRScan} onClose={() => setShowScanner(false)} />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={() => setShowScanner(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <QrCode className="h-4 w-4" />
            Scan QR Code
          </button>
        </div>

        <div>
          <label htmlFor="partNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Part Number
          </label>
          <input
            id="partNumber"
            type="text"
            value={partNumber}
            onChange={(e) => setPartNumber(e.target.value)}
            required
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., PN-12345"
          />
        </div>

        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
            Department
          </label>
          <select
            id="department"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a department (optional)</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="line" className="block text-sm font-medium text-gray-700 mb-1">
            Line
          </label>
          <select
            id="line"
            value={lineId}
            onChange={(e) => setLineId(e.target.value)}
            disabled={!departmentId}
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a line (optional)</option>
            {filteredLines.map((line) => (
              <option key={line.id} value={line.id}>
                {line.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="station" className="block text-sm font-medium text-gray-700 mb-1">
            Station
          </label>
          <select
            id="station"
            value={stationId}
            onChange={(e) => setStationId(e.target.value)}
            disabled={!lineId}
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a station (optional)</option>
            {filteredStations.map((station) => (
              <option key={station.id} value={station.id}>
                {station.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="weldType" className="block text-sm font-medium text-gray-700 mb-1">
            Weld Type
          </label>
          <input
            id="weldType"
            type="text"
            value={weldType}
            onChange={(e) => setWeldType(e.target.value)}
            required
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., MIG, TIG, Spot"
          />
        </div>

        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
            Reason
          </label>
          <select
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a reason</option>
            {reasons.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Any additional notes or information"
          />
        </div>

        <div>
          <label htmlFor="completedBy" className="block text-sm font-medium text-gray-700 mb-1">
            Completed By
          </label>
          <input
            id="completedBy"
            type="text"
            value={completedBy}
            readOnly
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md bg-gray-50 text-gray-600"
          />
        </div>

        <div className="flex items-center">
          <input
            id="status"
            type="checkbox"
            checked={status === 'completed'}
            onChange={(e) => setStatus(e.target.checked ? 'completed' : 'pending')}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="status" className="ml-2 block text-sm text-gray-700">
            Mark as completed
          </label>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base font-medium"
          >
            {loading ? 'Saving...' : 'Save Weld Touch Up'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm sm:text-base"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
