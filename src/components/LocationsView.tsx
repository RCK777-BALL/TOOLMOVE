import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Building2, ChevronRight, Factory, MapPin } from 'lucide-react';

export function LocationsView() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [lines, setLines] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const [deptResult, linesResult, stationsResult] = await Promise.all([
        supabase.from('departments').select('*').order('name'),
        supabase.from('lines').select('*, departments(name)').order('name'),
        supabase.from('stations').select('*, lines(name)').order('name'),
      ]);

      setDepartments(deptResult.data || []);
      setLines(linesResult.data || []);
      setStations(stationsResult.data || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-gray-600">Loading locations...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Locations</h2>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Departments</h3>
            </div>
          </div>
          <div className="p-6">
            {departments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No departments found</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {departments.map((dept) => (
                  <div
                    key={dept.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{dept.name}</h4>
                        {dept.description && (
                          <p className="text-sm text-gray-600 mt-1">{dept.description}</p>
                        )}
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          dept.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {dept.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Factory className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Lines</h3>
            </div>
          </div>
          <div className="p-6">
            {lines.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No lines found</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lines.map((line) => (
                  <div
                    key={line.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{line.name}</h4>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          line.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {line.status}
                      </span>
                    </div>
                    {line.departments && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <ChevronRight className="h-3 w-3" />
                        <span>{line.departments.name}</span>
                      </div>
                    )}
                    {line.description && <p className="text-sm text-gray-600 mt-1">{line.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Stations</h3>
            </div>
          </div>
          <div className="p-6">
            {stations.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No stations found</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stations.map((station) => (
                  <div
                    key={station.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{station.name}</h4>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          station.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {station.status}
                      </span>
                    </div>
                    {station.lines && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <ChevronRight className="h-3 w-3" />
                        <span>{station.lines.name}</span>
                      </div>
                    )}
                    {station.description && <p className="text-sm text-gray-600 mt-1">{station.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
