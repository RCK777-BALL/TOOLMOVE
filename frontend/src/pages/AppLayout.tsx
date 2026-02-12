import { useMemo, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Activity as ActivityIcon,
  BadgeCheck,
  Hammer,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  Settings2,
  Users,
} from 'lucide-react';
import { ActivityPage } from './ActivityPage';
import { ToolMovesPage } from './ToolMovesPage';
import { WeldsPage } from './WeldsPage';
import { LocationsPage } from './LocationsPage';
import { ReasonsPage } from './ReasonsPage';
import { UsersPage } from './UsersPage';
import type { AppUser } from '../App';

interface AppLayoutProps {
  user: AppUser;
  onSignOut: () => void;
  children: React.ReactNode;
}

type TabType = 'activity' | 'toolMoves' | 'welds' | 'locations' | 'reasons' | 'users';

export function AppLayout({ user, onSignOut, children }: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user.isAdmin;

  const navItems = useMemo(
    () =>
      [
        { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false, path: '/dashboard' },
        { key: 'toolMoves', label: 'Tool Moves', icon: Hammer, adminOnly: false, path: '/tool-moves' },
        { key: 'welds', label: 'Weld Touch Ups', icon: ActivityIcon, adminOnly: false, path: '/welds' },
        { key: 'locations', label: 'Locations', icon: Map, adminOnly: true, path: '/locations' },
        { key: 'reasons', label: 'Reason List', icon: Settings2, adminOnly: true, path: '/reasons' },
        { key: 'users', label: 'Users', icon: Users, adminOnly: true, path: '/users' },
      ] as const,
    []
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        <aside
          className={`bg-white border-r transition-all duration-200 ease-in-out ${
            sidebarCollapsed ? 'w-16' : 'w-64'
          } ${mobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col fixed md:static inset-y-0 z-30`}
        >
          <div className="flex items-center justify-between px-4 py-4 border-b">
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-blue-600" />
              {!sidebarCollapsed && (
                <span className="font-semibold text-gray-900">Tool Move</span>
              )}
            </div>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-md"
              aria-label={sidebarCollapsed ? 'Expand menu' : 'Collapse menu'}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            <div className="px-2 space-y-1">
              {navItems
                .filter(item => (item.adminOnly ? isAdmin : true))
                .map(item => {
                  const Icon = item.icon;
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <NavLink
                      key={item.key}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive: active }) =>
                        `w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          active
                            ? 'bg-blue-50 text-blue-700 border border-blue-100'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`
                      }
                    >
                      <Icon className="h-5 w-5" />
                      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </NavLink>
                  );
                })}
            </div>
          </nav>

          <div className="border-t px-4 py-4 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              {!sidebarCollapsed && (
                <>
                  <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                  <p className="text-xs text-gray-500 truncate">{isAdmin ? 'Admin' : 'User'}</p>
                </>
              )}
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('tm_token');
                onSignOut();
              }}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-md transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </aside>

        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-25 z-20 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <div className="flex-1 flex flex-col">
          {/* <header className="bg-white border-b px-4 md:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                className="md:hidden p-2 rounded-md border text-gray-600"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Overview</p>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-sm text-gray-600 truncate max-w-[200px]">
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-md hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </header> */}

          <main className="flex-1 overflow-y-auto px-4 md:px-6 py-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
