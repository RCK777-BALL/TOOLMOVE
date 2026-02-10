import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Filter, Wrench, Zap, ChevronDown } from 'lucide-react';

interface Activity {
  id: string;
  type: 'tool_move' | 'weld_touchup';
  department: string;
  line: string;
  station: string;
  description: string;
  performed_by: string;
  created_at: string;
}

export function ActivityView() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityType, setActivityType] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [lineFilter, setLineFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [departments, setDepartments] = useState<any[]>([]);
  const [lines, setLines] = useState<any[]>([]);

  useEffect(() => {
    fetchActivities();
    fetchDepartments();
    fetchLines();
  }, []);

  useEffect(() => {
    filterAndSortActivities();
  }, [activities, activityType, departmentFilter, lineFilter, sortBy, sortOrder]);

  const fetchDepartments = async () => {
    const { data } = await supabase
      .from('departments')
      .select('id, name')
      .eq('status', 'active')
      .order('name');
    setDepartments(data || []);
  };

  const fetchLines = async () => {
    const { data } = await supabase
      .from('lines')
      .select('id, name')
      .eq('status', 'active')
      .order('name');
    setLines(data || []);
  };

  const fetchActivities = async () => {
    try {
      const [toolMovesResult, weldTouchUpsResult] = await Promise.all([
        supabase
          .from('tool_moves')
          .select(`
            id,
            notes,
            moved_by,
            created_at,
            department_id,
            line_id,
            station_id,
            departments(name),
            lines(name),
            stations(name),
            reasons(name)
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('weld_touchups')
          .select(`
            id,
            part_number,
            weld_type,
            reason,
            notes,
            completed_by,
            created_at,
            department_id,
            line_id,
            station_id,
            departments(name),
            lines(name),
            stations(name)
          `)
          .order('created_at', { ascending: false }),
      ]);

      const toolMoves = (toolMovesResult.data || []).map((tm: any) => ({
        id: tm.id,
        type: 'tool_move' as const,
        department: tm.departments?.name || '-',
        line: tm.lines?.name || '-',
        station: tm.stations?.name || '-',
        description: `Reason: ${tm.reasons?.name || 'N/A'}\nNote: ${tm.notes || 'N/A'}`,
        performed_by: tm.moved_by,
        created_at: tm.created_at,
      }));

      const weldTouchUps = (weldTouchUpsResult.data || []).map((wt: any) => ({
        id: wt.id,
        type: 'weld_touchup' as const,
        department: wt.departments?.name || '-',
        line: wt.lines?.name || '-',
        station: wt.stations?.name || '-',
        description: `Part ${wt.part_number} - ${wt.weld_type}\nReason: ${wt.reason}\nNote: ${wt.notes || 'N/A'}`,
        performed_by: wt.completed_by,
        created_at: wt.created_at,
      }));

      const combined = [...toolMoves, ...weldTouchUps].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setActivities(combined);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortActivities = () => {
    let filtered = [...activities];

    if (activityType !== 'all') {
      filtered = filtered.filter((a) => a.type === activityType);
    }

    if (departmentFilter !== 'all') {
      filtered = filtered.filter((a) => a.department === departmentFilter);
    }

    if (lineFilter !== 'all') {
      filtered = filtered.filter((a) => a.line === lineFilter);
    }

    filtered.sort((a, b) => {
      const aValue = new Date(a.created_at).getTime();
      const bValue = new Date(b.created_at).getTime();
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });

    setFilteredActivities(filtered);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return <div className="text-gray-600">Loading activities...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Activity</h2>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters & Sort</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Activity Type</label>
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Types</option>
              <option value="tool_move">Tool Move</option>
              <option value="weld_touchup">Weld Touchup</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Line</label>
            <select
              value={lineFilter}
              onChange={(e) => setLineFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Lines</option>
              {lines.map((line) => (
                <option key={line.id} value={line.name}>
                  {line.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="date">Date</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
            {sortOrder === 'desc' ? 'Descending' : 'Ascending'}
          </button>
          <span className="text-sm text-gray-600">
            Showing {filteredActivities.length} of {activities.length} activities
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Line
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Station
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performed By
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No activities found
                  </td>
                </tr>
              ) : (
                filteredActivities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {activity.type === 'tool_move' ? (
                          <>
                            <Wrench className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-600">Tool Move</span>
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 text-orange-600" />
                            <span className="text-sm font-medium text-orange-600">Weld Touchup</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">{activity.department}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{activity.line}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{activity.station}</td>
                    <td className="px-4 py-4 text-sm text-gray-700 whitespace-pre-line max-w-md">
                      {activity.description}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">{activity.performed_by}</td>
                    <td className="px-4 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {formatDate(activity.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
