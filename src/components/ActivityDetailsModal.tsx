import { X, Package, Wrench, MapPin, Calendar, User, FileText } from 'lucide-react';

interface ToolMoveDetails {
  id: string;
  type: 'tool_move';
  reason: string;
  department: string | null;
  line: string | null;
  station: string | null;
  notes: string | null;
  moved_by: string;
  created_at: string;
  requires_weld_touchup: boolean;
  weld_touchup_completed: boolean;
  weld_touchup_notes: string | null;
}

interface WeldTouchupDetails {
  id: string;
  type: 'weld_touchup';
  part_number: string;
  weld_type: string;
  reason: string;
  department: string | null;
  line: string | null;
  station: string | null;
  notes: string | null;
  completed_by: string;
  status: string;
  created_at: string;
}

type ActivityDetails = ToolMoveDetails | WeldTouchupDetails;

interface ActivityDetailsModalProps {
  activity: ActivityDetails | null;
  onClose: () => void;
}

export function ActivityDetailsModal({ activity, onClose }: ActivityDetailsModalProps) {
  if (!activity) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {activity.type === 'tool_move' ? (
              <>
                <Package className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Tool Move Details</h2>
              </>
            ) : (
              <>
                <Wrench className="h-6 w-6 text-orange-600" />
                <h2 className="text-xl font-semibold text-gray-900">Weld Touchup Details</h2>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                  <MapPin className="h-4 w-4" />
                  Location
                </div>
                <div className="ml-6 space-y-1">
                  <div className="text-sm">
                    <span className="font-medium">Department:</span>{' '}
                    <span className="text-gray-900">{activity.department || 'Not specified'}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Line:</span>{' '}
                    <span className="text-gray-900">{activity.line || 'Not specified'}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Station:</span>{' '}
                    <span className="text-gray-900">{activity.station || 'Not specified'}</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                  <Calendar className="h-4 w-4" />
                  Date & Time
                </div>
                <div className="ml-6 text-sm text-gray-900">
                  {new Date(activity.created_at).toLocaleString()}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                  <User className="h-4 w-4" />
                  Performed By
                </div>
                <div className="ml-6 text-sm text-gray-900">
                  {activity.type === 'tool_move' ? activity.moved_by : activity.completed_by}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {activity.type === 'tool_move' ? (
                <>
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Reason</div>
                    <div className="text-sm text-gray-900">{activity.reason}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">
                      Weld Touchup Required
                    </div>
                    <div className="text-sm">
                      {activity.requires_weld_touchup ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          No
                        </span>
                      )}
                    </div>
                  </div>

                  {activity.requires_weld_touchup && (
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">
                        Weld Touchup Status
                      </div>
                      <div className="text-sm">
                        {activity.weld_touchup_completed ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Part Number</div>
                    <div className="text-sm text-gray-900">{activity.part_number}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Weld Type</div>
                    <div className="text-sm text-gray-900">{activity.weld_type}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Reason</div>
                    <div className="text-sm text-gray-900">{activity.reason}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Status</div>
                    <div className="text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          activity.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : activity.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {activity.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {(activity.notes || (activity.type === 'tool_move' && activity.weld_touchup_notes)) && (
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                <FileText className="h-4 w-4" />
                Notes
              </div>
              <div className="ml-6 space-y-2">
                {activity.notes && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs font-medium text-gray-500 mb-1">
                      {activity.type === 'tool_move' ? 'Tool Move Notes' : 'Notes'}
                    </div>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                      {activity.notes}
                    </div>
                  </div>
                )}
                {activity.type === 'tool_move' && activity.weld_touchup_notes && (
                  <div className="bg-orange-50 rounded-lg p-3">
                    <div className="text-xs font-medium text-orange-700 mb-1">
                      Weld Touchup Notes
                    </div>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                      {activity.weld_touchup_notes}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
