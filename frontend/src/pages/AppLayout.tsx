import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
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
import type { AppUser } from '../App';
import { NotificationBell } from '../components/NotificationBell';

interface AppLayoutProps {
  user: AppUser;
  onSignOut: () => void;
  children: React.ReactNode;
}

export function AppLayout({ user, onSignOut, children }: AppLayoutProps) {
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
      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 inset-x-0 z-30 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-md hover:bg-gray-100 text-gray-700"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-gray-900">Tool Move</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <span className="text-sm text-gray-700 truncate max-w-[140px]">{user.email}</span>
          </div>
        </div>
      </header>

      <div className="flex h-screen overflow-hidden">
        <aside
          className={`bg-white border-r transition-all duration-200 ease-in-out w-50 sm:w-20 md:w-20 lg:w-64 ${
            mobileMenuOpen ? 'flex' : 'hidden'
          } md:flex flex-col fixed md:static inset-y-0 z-30`}
        >
          <div className="flex items-center justify-between px-4 py-4 border-b">
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-gray-900 hidden lg:inline">Tool Move</span>
            </div>
            <div className="flex items-center gap-2">
              
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-md md:hidden"
                aria-label="Toggle menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            <div className="px-2 space-y-1">
              {navItems
                .filter(item => (item.adminOnly ? isAdmin : true))
                .map(item => {
                  const Icon = item.icon;
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
                      <span className="truncate inline sm:hidden lg:inline">{item.label}</span>
                    </NavLink>
                  );
                })}
            </div>
          </nav>

          <div className="border-t px-4 py-4 flex items-center gap-3">
            <NotificationBell />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate hidden md:block">{user.email}</p>
              <p className="text-xs text-gray-500 truncate hidden md:block">{isAdmin ? 'Admin' : 'User'}</p>
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
          <div className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-white sticky top-0 z-20">
          <button onClick={() => setMobileMenuOpen(true)}
          className="p-2 rounded-md border text-gray-600"
          aria-label="Open menu">
          <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm text-gray-700 truncate">{user.email}</span>
          <div className="w-9" />
          </div>
          <main className="flex-1 overflow-y-auto px-4 md:px-6 py-6 pt-16 md:pt-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
