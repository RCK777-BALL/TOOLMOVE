import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, QrCode, Camera } from 'lucide-react';
import { QRScanner } from './QRScanner';
import { CameraCapture } from './CameraCapture';
import { getErrorMessage } from '../lib/errors';
import type { Department, Line, Reason, Station } from '../types/domain';

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
  const [movedBy, setMovedBy] = useState('');
  const [requiresWeldTouchup, setRequiresWeldTouchup] = useState(false);
  const [weldTouchupNotes, setWeldTouchupNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [reasons, setReasons] = useState<Reason[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    fetchReasons();
    fetchDepartments();
    fetchLines();
    fetchStations();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setMovedBy(user.email);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchReasons = async () => {
    try {
      const { data, error } = await supabase
        .from('reasons')
        .select('id, name, description')
        .eq('status', 'active')
        .order('name');
      if (error) throw error;
      setReasons(data || []);
    } catch (error) {
      console.error('Error fetching reasons:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name')
        .eq('status', 'active')
        .order('name');
      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchLines = async () => {
    try {
      const { data, error } = await supabase
        .from('lines')
        .select('id, name')
        .eq('status', 'active')
        .order('name');
      if (error) throw error;
      setLines(data || []);
    } catch (error) {
      console.error('Error fetching lines:', error);
    }
  };

  const fetchStations = async () => {
    try {
      const { data, error } = await supabase
        .from('stations')
        .select('id, name')
        .eq('status', 'active')
        .order('name');
      if (error) throw error;
      setStations(data || []);
    } catch (error) {
      console.error('Error fetching stations:', error);
    }
  };


  const handleQRScan = (data: { departmentId?: string; lineId?: string; stationId?: string; note?: string }) => {
    if (data.departmentId) setDepartmentId(data.departmentId);
    if (data.lineId) setLineId(data.lineId);
    if (data.stationId) setStationId(data.stationId);
    if (data.note) setNotes(data.note);
    setShowScanner(false);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5242880) {
        setError('Photo size must be less than 5MB');
        return;
      }
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (file: File) => {
    setPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setShowCamera(false);
  };

  const uploadPhoto = async (userId: string): Promise<string | null> => {
    if (!photo) return null;

    try {
      const fileExt = photo.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(fileName, photo);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let photoUrl = null;
      if (photo) {
        photoUrl = await uploadPhoto(user.id);
      }

      const { error } = await supabase
        .from('tool_moves')
        .insert([
          {
            reason_id: reasonId,
            department_id: departmentId || null,
            line_id: lineId || null,
            station_id: stationId || null,
            notes,
            moved_by: movedBy,
            user_id: user?.id,
            requires_weld_touchup: requiresWeldTouchup,
            weld_touchup_notes: requiresWeldTouchup ? weldTouchupNotes : null,
            photo_url: photoUrl,
          },
        ]);

      if (error) throw error;
      onSuccess();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Record Tool Move</h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
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

      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onCancel={() => setShowCamera(false)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={() => setShowScanner(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <QrCode className="h-4 w-4" />
            <span className="hidden sm:inline">Scan QR Code</span>
            <span className="sm:hidden">Scan QR</span>
          </button>
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
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a line (optional)</option>
            {lines.map((line) => (
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
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a station (optional)</option>
            {stations.map((station) => (
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Photo (Optional)
          </label>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => setShowCamera(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              <Camera className="h-4 w-4" />
              <span>Take Photo</span>
            </button>
            <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 cursor-pointer transition-colors text-sm">
              <Camera className="h-4 w-4" />
              <span>Choose Photo</span>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
            {photo && (
              <span className="text-sm text-gray-600">{photo.name}</span>
            )}
          </div>
          {photoPreview && (
            <div className="mt-3">
              <img
                src={photoPreview}
                alt="Preview"
                className="max-w-full h-48 object-contain border border-gray-300 rounded"
              />
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">Max size: 5MB. Formats: JPG, PNG, WebP</p>
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
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base font-medium"
          >
            {loading ? 'Recording...' : 'Record Move'}
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
