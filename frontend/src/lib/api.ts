const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const getToken = () => localStorage.getItem("tm_token");

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || res.statusText);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  login: (email: string, password: string) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  me: () => request("/auth/me"),

  getActivity: () => request("/activity"),

  getToolMoves: () => request("/tool-moves"),
  createToolMove: (data: any) => request("/tool-moves", { method: "POST", body: JSON.stringify(data) }),
  deleteToolMove: (id: string) => request(`/tool-moves/${id}`, { method: "DELETE" }),

  getWelds: () => request("/welds"),
  createWeld: (data: any) => request("/welds", { method: "POST", body: JSON.stringify(data) }),

  getLocations: () => request("/locations"),
  addDepartment: (data: any) => request("/locations/departments", { method: "POST", body: JSON.stringify(data) }),
  addLine: (data: any) => request("/locations/lines", { method: "POST", body: JSON.stringify(data) }),
  addStation: (data: any) => request("/locations/stations", { method: "POST", body: JSON.stringify(data) }),
  deleteDepartment: (id: string) => request(`/locations/departments/${id}`, { method: "DELETE" }),
  deleteLine: (id: string) => request(`/locations/lines/${id}`, { method: "DELETE" }),
  deleteStation: (id: string) => request(`/locations/stations/${id}`, { method: "DELETE" }),

  getReasons: () => request("/reasons"),
  createReason: (data: any) => request("/reasons", { method: "POST", body: JSON.stringify(data) }),
  deleteReason: (id: string) => request(`/reasons/${id}`, { method: "DELETE" }),

  getUsers: () => request("/users"),
  createUser: (data: any) => request("/users", { method: "POST", body: JSON.stringify(data) }),
  deleteUser: (id: string) => request(`/users/${id}`, { method: "DELETE" }),

  getNotifications: () => request("/notifications"),
  markNotificationRead: (id: string) => request(`/notifications/${id}/read`, { method: "POST" }),
};
