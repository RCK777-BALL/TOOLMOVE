export interface LookupEntity {
  id: string;
  name: string;
  description?: string | null;
  status?: string | null;
}

export interface Department extends LookupEntity {}

export interface Line extends LookupEntity {
  departments?: Pick<Department, 'name'> | null;
}

export interface Station extends LookupEntity {
  lines?: Pick<Line, 'name'> | null;
}

export interface Reason extends LookupEntity {}

export interface ToolMove {
  id: string;
  department_id?: string | null;
  line_id?: string | null;
  station_id?: string | null;
  reason_id?: string | null;
  notes?: string | null;
  moved_by: string;
  requires_weld_touchup?: boolean | null;
  weld_touchup_completed?: boolean | null;
  photo_url?: string | null;
  created_at: string;
  departments?: Pick<Department, 'name'> | null;
  lines?: Pick<Line, 'name'> | null;
  stations?: Pick<Station, 'name'> | null;
  reasons?: Pick<Reason, 'name'> | null;
}

export interface WeldTouchup {
  id: string;
  part_number: string;
  department_id?: string | null;
  line_id?: string | null;
  station_id?: string | null;
  weld_type: string;
  reason: string;
  notes?: string | null;
  completed_by: string;
  status: string;
  photo_url?: string | null;
  created_at: string;
  departments?: Pick<Department, 'name'> | null;
  lines?: Pick<Line, 'name'> | null;
  stations?: Pick<Station, 'name'> | null;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string | null;
  role?: string | null;
}
