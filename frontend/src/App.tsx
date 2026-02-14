import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthForm } from './components/AuthForm';
import { AppLayout } from './pages/AppLayout';
import { api } from './lib/api';
import { ActivityPage } from './pages/ActivityPage';
import { ToolMovesPage } from './pages/ToolMovesPage';
import { WeldsPage } from './pages/WeldsPage';
import { LocationsPage } from './pages/LocationsPage';
import { ReasonsPage } from './pages/ReasonsPage';
import { UsersPage } from './pages/UsersPage';
import { ToolMoveAddPage } from './pages/ToolMoveAddPage';
import { WeldAddPage } from './pages/WeldAddPage';
import { UsersAddPage } from './pages/UsersAddPage';
import { UserEditPage } from './pages/UserEditPage';

export interface AppUser {
  id: string;
  email: string;
  fullName?: string;
  isAdmin: boolean;
  token: string;
}

function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('tm_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then(userData => setUser({ ...userData, token }))
      .catch(() => localStorage.removeItem('tm_token'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onAuth={(u) => setUser(u)} />;
  }

  return (
    <AppLayout user={user} onSignOut={() => setUser(null)}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<ActivityPage />} />
        <Route path="/tool-moves" element={<ToolMovesPage />} />
        <Route path="/tool-moves/add" element={<ToolMoveAddPage />} />
        <Route path="/welds" element={<WeldsPage />} />
        <Route path="/welds/add" element={<WeldAddPage />} />
        <Route path="/locations" element={user.isAdmin ? <LocationsPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="/reasons" element={user.isAdmin ? <ReasonsPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="/users" element={user.isAdmin ? <UsersPage isAdmin /> : <Navigate to="/dashboard" replace />} />
        <Route path="/users/add" element={user.isAdmin ? <UsersAddPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="/users/:id" element={user.isAdmin ? <UserEditPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
