import { useState, useEffect } from 'react';
import { X, QrCode } from 'lucide-react';
import { Button } from '@radix-ui/themes';
import { QRScanner } from './QRScanner';
import { api } from '../lib/api';

interface AddToolMoveFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddToolMoveForm({ onSuccess, onCancel }: AddToolMoveFormProps) {
  const [reasonId, setReasonId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [lineId, setLineId] = useState('');
  const [stationId, setStationId] = useState('');
  const [notes, setNotes] = useState('');
  const [movedBy] = useState(localStorage.getItem('tm_user_email') || '');
  const [requiresWeldTouchup, setRequiresWeldTouchup] = useState(false);
  const [weldTouchupNotes, setWeldTouchupNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [reasons, setReasons] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [lines, setLines] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);

  useEffect(() => {
    fetchReasons();
    fetchDepartments();
    fetchLines();
    fetchStations();
  }, []);

  const fetchReasons = async () => {
    try {
      const data = await api.getReasons();
      setReasons((data || []).map((r: any) => ({ ...r, id: r._id || r.id })));
    } catch (error) {
      console.error('Error fetching reasons:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await api.getLocations();
      setDepartments((data || []).map((d: any) => ({ ...d, id: d._id || d.id })));
      setLines(
        (data || [])
          .flatMap((d: any) =>
            (d.lines || []).map((l: any) => ({
              ...l,
              id: l._id || l.id,
              department_id: d._id || d.id,
            }))
          )
      );
      setStations(
        (data || [])
          .flatMap((d: any) =>
            (d.lines || []).flatMap((l: any) =>
              (l.stations || []).map((s: any) => ({ ...s, id: s._id || s.id, line_id: l._id }))
            )
          )
      );
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchLines = async () => {};
  const fetchStations = async () => {};

  const filteredLines = departmentId
    ? lines.filter((l) => l.department_id === departmentId)
    : [];

  const filteredStations = lineId
    ? stations.filter((s) => s.line_id === lineId)
    : [];

  // reset children when parent changes
  useEffect(() => {
    setLineId('');
    setStationId('');
  }, [departmentId]);

  useEffect(() => {
    setStationId('');
  }, [lineId]);

  const handleQRScan = (data: { departmentId?: string; lineId?: string; stationId?: string; note?: string }) => {
    if (data.departmentId) setDepartmentId(data.departmentId);
    if (data.lineId) setLineId(data.lineId);
    if (data.stationId) setStationId(data.stationId);
    if (data.note) setNotes(data.note);
    setShowScanner(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.createToolMove({
        reason: reasonId,
        department: departmentId || null,
        line: lineId || null,
        station: stationId || null,
        notes,
        movedBy: movedBy || localStorage.getItem('tm_user_email'),
        requiresWeldTouchup,
        weldTouchupNotes: requiresWeldTouchup ? weldTouchupNotes : null,
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
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Record Tool Move</h3>
        <Button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      {showScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-end mb-2">
          <Button
            type="button"
            onClick={() => setShowScanner(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <QrCode className="h-4 w-4" />
            <span className="hidden sm:inline">Scan QR Code</span>
            <span className="sm:hidden">Scan QR</span>
          </Button>
        </div>

        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
            Reason for Move
          </label>
          <select
            id="reason"
            value={reasonId}
            onChange={(e) => setReasonId(e.target.value)}
            required
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a reason</option>
            {reasons.map((reason) => (
              <option key={reason.id} value={reason.id}>
                {reason.name} {reason.description && `- ${reason.description}`}
              </option>
            ))}
          </select>
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
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Any additional notes about the move"
          />
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <input
              id="requiresWeldTouchup"
              type="checkbox"
              checked={requiresWeldTouchup}
              onChange={(e) => setRequiresWeldTouchup(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="requiresWeldTouchup" className="text-sm font-medium text-gray-700">
              Requires Weld Touch Up
            </label>
          </div>

          {requiresWeldTouchup && (
            <div>
              <label htmlFor="weldTouchupNotes" className="block text-sm font-medium text-gray-700 mb-1">
                Weld Touch Up Details
              </label>
              <textarea
                id="weldTouchupNotes"
                value={weldTouchupNotes}
                onChange={(e) => setWeldTouchupNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the weld touch up requirements"
              />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="movedBy" className="block text-sm font-medium text-gray-700 mb-1">
            Moved By
          </label>
          <input
            id="movedBy"
            type="text"
            value={movedBy}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base font-medium"
          >
            {loading ? 'Recording...' : 'Record Move'}
          </Button>
          <Button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm sm:text-base"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
