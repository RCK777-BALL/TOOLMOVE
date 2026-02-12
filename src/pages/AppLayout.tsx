import { useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
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
import { supabase } from '../lib/supabase';
import { WeldNotification } from '../components/WeldNotification';
import { ActivityPage } from './ActivityPage';
import { ToolMovesPage } from './ToolMovesPage';
import { WeldsPage } from './WeldsPage';
import { LocationsPage } from './LocationsPage';
import { ReasonsPage } from './ReasonsPage';
import { UsersPage } from './UsersPage';

interface AppLayoutProps {
  user: User;
}

type TabType = 'activity' | 'toolMoves' | 'welds' | 'locations' | 'reasons' | 'users';

export function AppLayout({ user }: AppLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabType>('activity');
  const [isAdmin, setIsAdmin] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, [user.id]);

  const checkAdminStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking admin status:', error);
        throw error;
      }
      console.log('Admin check result:', data);
      setIsAdmin(data?.is_admin ?? false);
    } catch (err) {
      console.error('Admin status check failed:', err);
      setIsAdmin(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const navItems = useMemo(
    () =>
      [
        { key: 'activity', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
        { key: 'toolMoves', label: 'Tool Moves', icon: Hammer, adminOnly: false },
        { key: 'welds', label: 'Weld Touch Ups', icon: ActivityIcon, adminOnly: false },
        { key: 'locations', label: 'Locations (admin)', icon: Map, adminOnly: true },
        { key: 'reasons', label: 'Reason List (admin)', icon: Settings2, adminOnly: true },
        { key: 'users', label: 'Users (admin)', icon: Users, adminOnly: false },
      ] as const,
    []
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <WeldNotification />
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
                  const isActive = activeTab === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => handleTabChange(item.key)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border border-blue-100'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </button>
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
              onClick={handleSignOut}
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
            {activeTab === 'activity' && <ActivityPage userId={user.id} />}
            {activeTab === 'toolMoves' && <ToolMovesPage userId={user.id} />}
            {activeTab === 'welds' && <WeldsPage userId={user.id} />}
            {activeTab === 'locations' && isAdmin && <LocationsPage userId={user.id} />}
            {activeTab === 'reasons' && isAdmin && <ReasonsPage userId={user.id} />}
            {activeTab === 'users' && <UsersPage userId={user.id} />}

            {!isAdmin && ['locations', 'reasons', 'users'].includes(activeTab) && (
              <div className="bg-white border rounded-lg p-6 shadow-sm">
                <p className="text-gray-800 font-semibold">You do not have access to this page.</p>
                <p className="text-sm text-gray-600 mt-1">Please contact an administrator.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
