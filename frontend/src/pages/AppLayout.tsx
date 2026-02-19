import { useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Activity as ActivityIcon,
  BadgeCheck,
  ChevronRight,
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
import { Button, DropdownMenu, Flex, Section } from '@radix-ui/themes';

interface AppLayoutProps {
  user: AppUser;
  onSignOut: () => void;
  children: React.ReactNode;
}

export function AppLayout({ user, onSignOut, children }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

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

  const breadcrumbLabels: Record<string, string> = {
    'dashboard': 'Dashboard',
    'tool-moves': 'Tool Moves',
    'tool-moves/add': 'Add Tool Move',
    'welds': 'Weld Touch Ups',
    'welds/add': 'Add Weld Touch Up',
    'locations': 'Locations',
    'reasons': 'Reason List',
    'users': 'Users',
    'users/add': 'Add User',
  };

  const segments = location.pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  const breadcrumbItems =
    segments.length === 0
      ? [{ label: 'Dashboard', path: '/dashboard', isLast: true }]
      : segments.map((seg, idx) => {
          const path = '/' + segments.slice(0, idx + 1).join('/');
          const key = segments.slice(0, idx + 1).join('/');
          return {
            label: breadcrumbLabels[key] || seg.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            path,
            isLast: idx === segments.length - 1,
          };
        });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile top bar */}
      
  

      <Flex className="flex h-screen">
        <aside
          // width={{ lg: '200px' }}
          hidden={mobileMenuOpen}
          className={`bg-white border-r transition-all duration-200 ease-in-out  ${
            mobileMenuOpen ? 'flex' : 'hidden'
          } md:flex flex-col fixed md:static inset-y-0 z-30`}
        >
          <Flex align="center" gap="2" justify={{initial:"start", sm:"center", md:"start"}} className="flex items-center justify-between px-4 py-4 border-b">
            <Flex gap="2" align="center" >
              <BadgeCheck size={18} />
              <span className="font-semibold text-gray-900 md:hidden lg:inline">Tool Moves</span>
            </Flex>
       
          </Flex>

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
                      <span className="truncate inline md:hidden lg:inline">{item.label}</span>
                    </NavLink>
                  );
                })}
            </div>
          </nav>

          <div className="border-t px-4 py-4 flex gap-3 sm:hidden">
            {/* <NotificationBell />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate max-w-[140px] hidden md:block">3{user.email}</p>
              <p className="text-xs text-gray-500 truncate hidden md:block">{isAdmin ? 'Admin' : 'User'}</p>
            </div> */}
            <Button
              onClick={() => {
                localStorage.removeItem('tm_token');
                onSignOut();
              }}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-md transition-colors"
              aria-label="Sign out"
              variant='ghost'
            >
              <LogOut className="h-5 w-5" /> Sign out
            </Button>
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
            <Button variant='ghost' onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-md border text-gray-600"
            aria-label="Open menu">
            <Menu className="h-5 w-5" />
            </Button>
            <Flex gap="3" align="center">
              <NotificationBell />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[140px] md:hidden">{user.email}</p>
                <p className="text-xs text-gray-500 truncate hidden md:block">{isAdmin ? 'Admin' : 'User'}</p>
              </div>
              {/* <Button
                variant='ghost'
                onClick={() => {
                  localStorage.removeItem('tm_token');
                  onSignOut();
                }}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-md transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </Button> */}
            </Flex>
          </div>
          
          <header>
            <Flex justify="between" px={{ initial: "3", md: "4" }} py={{ initial: "2", md: "3" }}>
              <nav className="flex items-center text-sm text-gray-500 " aria-label="Breadcrumb">
                {breadcrumbItems.map((item, idx) => (
                  <div key={item.path} className="flex items-center gap-1">
                    {idx > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
                    {item.isLast ? (
                      <span className="font-semibold text-gray-800">{item.label}</span>
                    ) : (
                      <NavLink to={item.path} className="hover:text-gray-800">
                        {item.label}
                      </NavLink>
                    )}
                  </div>
                ))}
              </nav>
              
              <div className="hidden md:flex items-center justify-between">
                <div className="flex items-center gap-3">
                  
                  
                </div>
                <div className="flex items-center gap-3">
                  <Flex align="center" gap="2">
                    <NotificationBell />
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger>
                        <Button variant="ghost">
                          {/* <User2 size={18} /> */}
                          <span className="text-sm text-gray-700 truncate max-w-[240px]">{user.email}</span>
                          <DropdownMenu.TriggerIcon />
                        </Button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Content align='end'>
                        <DropdownMenu.Item onClick={() => {
                            localStorage.removeItem('tm_token');
                            onSignOut();
                          }}>
                            Sign out
                        </DropdownMenu.Item>
                        
                      </DropdownMenu.Content>
                    </DropdownMenu.Root>

                  </Flex>
                  
                  
                </div>
              </div>
    

            </Flex>
          </header>
          <main>
          <Section px={{ initial: "4" }} py={{ initial: "2", md: "3" }}>
          {/* <main className="flex-1 overflow-y-auto px-4 md:px-6 py-6" > */}
            {children}
          {/* </main> */}
          </Section>
          </main>
        </div>
      </Flex>
    </div>
  );
}
