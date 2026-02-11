import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Package, Wrench, ArrowUpDown, Filter } from 'lucide-react';
import { ActivityDetailsModal } from './ActivityDetailsModal';

interface ActivityItem {
  id: string;
  type: 'tool_move' | 'weld_touchup';
  date: string;
  departmentName: string | null;
  lineName: string | null;
  stationName: string | null;
  description: string;
  performedBy: string;
  notes?: string;
}

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

interface ActivityProps {
  userId: string;
  refresh?: number;
}

export function Activity({ userId, refresh }: ActivityProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<ActivityDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [sortBy, setSortBy] = useState<'date' | 'department' | 'type' | 'line' | 'description'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<'all' | 'tool_move' | 'weld_touchup'>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterLine, setFilterLine] = useState<string>('all');
  const [departments, setDepartments] = useState<string[]>([]);
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    fetchActivities();
  }, [userId, refresh]);

  const fetchActivities = async () => {
    try {
      const [toolMovesResult, weldTouchupsResult] = await Promise.all([
        supabase
          .from('tool_moves')
          .select('*, reasons(name), departments(name), lines(name), stations(name)')
          .order('created_at', { ascending: false }),
        supabase
          .from('weld_touchups')
          .select('*, departments(name), lines(name), stations(name)')
          .order('created_at', { ascending: false }),
      ]);

      if (toolMovesResult.error) throw toolMovesResult.error;
      if (weldTouchupsResult.error) throw weldTouchupsResult.error;

      const toolMoveActivities: ActivityItem[] = (toolMovesResult.data || []).map(move => ({
        id: move.id,
        type: 'tool_move' as const,
        date: move.created_at,
        departmentName: move.departments?.name || null,
        lineName: move.lines?.name || null,
        stationName: move.stations?.name || null,
        description: `Reason: ${move.reasons?.name || 'Unknown'}`,
        performedBy: move.moved_by,
        notes: move.notes,
      }));

      const weldTouchupActivities: ActivityItem[] = (weldTouchupsResult.data || []).map(weld => ({
        id: weld.id,
        type: 'weld_touchup' as const,
        date: weld.created_at,
        departmentName: weld.departments?.name || null,
        lineName: weld.lines?.name || null,
        stationName: weld.stations?.name || null,
        description: `Part ${weld.part_number} - ${weld.weld_type} (${weld.reason})`,
        performedBy: weld.completed_by,
        notes: weld.notes,
      }));

      const combined = [...toolMoveActivities, ...weldTouchupActivities];

      const uniqueDepartments = Array.from(
        new Set(combined.map(a => a.departmentName).filter(Boolean))
      ).sort() as string[];
      const uniqueLines = Array.from(
        new Set(combined.map(a => a.lineName).filter(Boolean))
      ).sort() as string[];

      setDepartments(uniqueDepartments);
      setLines(uniqueLines);
      setActivities(combined);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAndSortedActivities = () => {
    let filtered = [...activities];

    if (filterType !== 'all') {
      filtered = filtered.filter(a => a.type === filterType);
    }

    if (filterDepartment !== 'all') {
      filtered = filtered.filter(a => a.departmentName === filterDepartment);
    }

    if (filterLine !== 'all') {
      filtered = filtered.filter(a => a.lineName === filterLine);
    }

    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'department':
          if (!a.departmentName && !b.departmentName) comparison = 0;
          else if (!a.departmentName) comparison = 1;
          else if (!b.departmentName) comparison = -1;
          else comparison = a.departmentName.localeCompare(b.departmentName);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'line':
          if (!a.lineName && !b.lineName) comparison = 0;
          else if (!a.lineName) comparison = 1;
          else if (!b.lineName) comparison = -1;
          else comparison = a.lineName.localeCompare(b.lineName);
          break;
        case 'description':
          comparison = a.description.localeCompare(b.description);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const fetchActivityDetails = async (activity: ActivityItem) => {
    setLoadingDetails(true);
    try {
      if (activity.type === 'tool_move') {
        const { data, error } = await supabase
          .from('tool_moves')
          .select('*, reasons(name), departments(name), lines(name), stations(name)')
          .eq('id', activity.id)
          .maybeSingle();

        if (error) throw error;
        if (!data) return;

        const details: ToolMoveDetails = {
          id: data.id,
          type: 'tool_move',
          reason: data.reasons?.name || 'Unknown',
          department: data.departments?.name || null,
          line: data.lines?.name || null,
          station: data.stations?.name || null,
          notes: data.notes,
          moved_by: data.moved_by,
          created_at: data.created_at,
          requires_weld_touchup: data.requires_weld_touchup || false,
          weld_touchup_completed: data.weld_touchup_completed || false,
          weld_touchup_notes: data.weld_touchup_notes,
        };

        setSelectedActivity(details);
      } else {
        const { data, error } = await supabase
          .from('weld_touchups')
          .select('*, departments(name), lines(name), stations(name)')
          .eq('id', activity.id)
          .maybeSingle();

        if (error) throw error;
        if (!data) return;

        const details: WeldTouchupDetails = {
          id: data.id,
          type: 'weld_touchup',
          part_number: data.part_number,
          weld_type: data.weld_type,
          reason: data.reason,
          department: data.departments?.name || null,
          line: data.lines?.name || null,
          station: data.stations?.name || null,
          notes: data.notes,
          completed_by: data.completed_by,
          status: data.status,
          created_at: data.created_at,
        };

        setSelectedActivity(details);
      }
    } catch (error) {
      console.error('Error fetching activity details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filteredActivities = getFilteredAndSortedActivities();

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-600">No activity yet. Start tracking tool moves and weld touch ups!</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow mb-4 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-700">Filters & Sort</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Activity Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="tool_move">Tool Move</option>
              <option value="weld_touchup">Weld Touchup</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Line
            </label>
            <select
              value={filterLine}
              onChange={(e) => setFilterLine(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Lines</option>
              {lines.map(line => (
                <option key={line} value={line}>{line}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Date</option>
              <option value="department">Department</option>
              <option value="type">Type</option>
              <option value="line">Line</option>
              <option value="description">Description</option>
            </select>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowUpDown className="h-4 w-4" />
            <span>{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
          </button>

          <div className="text-sm text-gray-600">
            Showing {filteredActivities.length} of {activities.length} activities
          </div>
        </div>
      </div>

      {filteredActivities.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600">No activities match the selected filters.</p>
          <button
            onClick={() => {
              setFilterType('all');
              setFilterDepartment('all');
              setFilterLine('all');
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  onClick={() => toggleSort('type')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Type
                    {sortBy === 'type' && <ArrowUpDown className="h-3 w-3" />}
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('department')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Department
                    {sortBy === 'department' && <ArrowUpDown className="h-3 w-3" />}
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('line')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Line
                    {sortBy === 'line' && <ArrowUpDown className="h-3 w-3" />}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Station
                </th>
                <th
                  onClick={() => toggleSort('description')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Description
                    {sortBy === 'description' && <ArrowUpDown className="h-3 w-3" />}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performed By
                </th>
                <th
                  onClick={() => toggleSort('date')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Date
                    {sortBy === 'date' && <ArrowUpDown className="h-3 w-3" />}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredActivities.map((activity) => (
                <tr
                  key={`${activity.type}-${activity.id}`}
                  onClick={() => fetchActivityDetails(activity)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      {activity.type === 'tool_move' ? (
                        <>
                          <Package className="h-4 w-4 text-blue-600" />
                          <span className="text-blue-600 font-medium">Tool Move</span>
                        </>
                      ) : (
                        <>
                          <Wrench className="h-4 w-4 text-orange-600" />
                          <span className="text-orange-600 font-medium">Weld Touchup</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {activity.departmentName || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {activity.lineName || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {activity.stationName || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-md">
                      <div>{activity.description}</div>
                      {activity.notes && (
                        <div className="text-xs text-gray-500 mt-1">Note: {activity.notes}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {activity.performedBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(activity.date).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {loadingDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading details...</p>
          </div>
        </div>
      )}

      <ActivityDetailsModal
        activity={selectedActivity}
        onClose={() => setSelectedActivity(null)}
      />
    </>
  );
}
