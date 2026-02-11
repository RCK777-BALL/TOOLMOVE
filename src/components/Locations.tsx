import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Building2, GitBranch, MapPin, Plus, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { AddDepartmentForm } from './AddDepartmentForm';
import { AddLineForm } from './AddLineForm';
import { AddStationForm } from './AddStationForm';

interface Department {
  id: string;
  name: string;
  description: string;
  status: string;
  lines: Line[];
}

interface Line {
  id: string;
  name: string;
  description: string;
  status: string;
  department_id: string;
  stations: Station[];
}

interface Station {
  id: string;
  name: string;
  description: string;
  status: string;
  line_id: string;
}

interface LocationsProps {
  userId: string;
  refresh?: number;
}

export function Locations({ userId, refresh }: LocationsProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(new Set());
  const [expandedLines, setExpandedLines] = useState<Set<string>>(new Set());
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [showAddLine, setShowAddLine] = useState<string | null>(null);
  const [showAddStation, setShowAddStation] = useState<string | null>(null);

  useEffect(() => {
    fetchLocations();
  }, [userId, refresh]);

  const fetchLocations = async () => {
    try {
      const { data: departmentsData, error: deptError } = await supabase
        .from('departments')
        .select('*')
        .order('name');

      if (deptError) throw deptError;

      const { data: linesData, error: linesError } = await supabase
        .from('lines')
        .select('*')
        .order('name');

      if (linesError) throw linesError;

      const { data: stationsData, error: stationsError } = await supabase
        .from('stations')
        .select('*')
        .order('name');

      if (stationsError) throw stationsError;

      const departmentsWithHierarchy: Department[] = (departmentsData || []).map(dept => ({
        ...dept,
        lines: (linesData || [])
          .filter(line => line.department_id === dept.id)
          .map(line => ({
            ...line,
            stations: (stationsData || []).filter(station => station.line_id === line.id),
          })),
      }));

      setDepartments(departmentsWithHierarchy);
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDepartment = (deptId: string) => {
    const newExpanded = new Set(expandedDepartments);
    if (newExpanded.has(deptId)) {
      newExpanded.delete(deptId);
    } else {
      newExpanded.add(deptId);
    }
    setExpandedDepartments(newExpanded);
  };

  const toggleLine = (lineId: string) => {
    const newExpanded = new Set(expandedLines);
    if (newExpanded.has(lineId)) {
      newExpanded.delete(lineId);
    } else {
      newExpanded.add(lineId);
    }
    setExpandedLines(newExpanded);
  };

  const handleDelete = async (type: 'department' | 'line' | 'station', id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}? This will also delete all child items.`)) {
      return;
    }

    try {
      const { error } = await supabase.from(`${type}s`).delete().eq('id', id);
      if (error) throw error;
      fetchLocations();
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      alert(`Failed to delete ${type}`);
    }
  };

  const handleSuccess = () => {
    setShowAddDepartment(false);
    setShowAddLine(null);
    setShowAddStation(null);
    fetchLocations();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowAddDepartment(!showAddDepartment)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Department
        </button>
      </div>

      {showAddDepartment && (
        <div className="bg-white rounded-lg shadow p-6">
          <AddDepartmentForm onSuccess={handleSuccess} onCancel={() => setShowAddDepartment(false)} />
        </div>
      )}

      {departments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No departments yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {departments.map(dept => (
            <div key={dept.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="flex items-center justify-between p-4 hover:bg-gray-50">
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => toggleDepartment(dept.id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {expandedDepartments.has(dept.id) ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                  </button>
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{dept.name}</h3>
                    {dept.description && (
                      <p className="text-sm text-gray-600">{dept.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {dept.lines.length} {dept.lines.length === 1 ? 'line' : 'lines'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddLine(showAddLine === dept.id ? null : dept.id)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                    title="Add line"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete('department', dept.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete department"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {showAddLine === dept.id && (
                <div className="px-4 pb-4 border-t bg-gray-50">
                  <div className="mt-4">
                    <AddLineForm
                      departmentId={dept.id}
                      onSuccess={handleSuccess}
                      onCancel={() => setShowAddLine(null)}
                    />
                  </div>
                </div>
              )}

              {expandedDepartments.has(dept.id) && (
                <div className="pl-12 pr-4 pb-4 border-t bg-gray-50">
                  {dept.lines.length === 0 ? (
                    <p className="text-sm text-gray-500 py-4">No lines yet</p>
                  ) : (
                    <div className="space-y-2 mt-4">
                      {dept.lines.map(line => (
                        <div key={line.id} className="bg-white rounded-md shadow-sm">
                          <div className="flex items-center justify-between p-3 hover:bg-gray-50">
                            <div className="flex items-center gap-3 flex-1">
                              <button
                                onClick={() => toggleLine(line.id)}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                {expandedLines.has(line.id) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </button>
                              <GitBranch className="h-4 w-4 text-green-600" />
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 text-sm">{line.name}</h4>
                                {line.description && (
                                  <p className="text-xs text-gray-600">{line.description}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                  {line.stations.length} {line.stations.length === 1 ? 'station' : 'stations'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setShowAddStation(showAddStation === line.id ? null : line.id)}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                title="Add station"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete('line', line.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                title="Delete line"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {showAddStation === line.id && (
                            <div className="px-3 pb-3 border-t bg-gray-50">
                              <div className="mt-3">
                                <AddStationForm
                                  lineId={line.id}
                                  onSuccess={handleSuccess}
                                  onCancel={() => setShowAddStation(null)}
                                />
                              </div>
                            </div>
                          )}

                          {expandedLines.has(line.id) && (
                            <div className="pl-10 pr-3 pb-3 border-t bg-gray-50">
                              {line.stations.length === 0 ? (
                                <p className="text-xs text-gray-500 py-3">No stations yet</p>
                              ) : (
                                <div className="space-y-1 mt-3">
                                  {line.stations.map(station => (
                                    <div
                                      key={station.id}
                                      className="flex items-center justify-between p-2 bg-white rounded-md hover:bg-gray-50"
                                    >
                                      <div className="flex items-center gap-2">
                                        <MapPin className="h-3.5 w-3.5 text-orange-600" />
                                        <div>
                                          <p className="text-sm font-medium text-gray-900">{station.name}</p>
                                          {station.description && (
                                            <p className="text-xs text-gray-600">{station.description}</p>
                                          )}
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => handleDelete('station', station.id)}
                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                        title="Delete station"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
