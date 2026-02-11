import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { LogOut, Plus } from 'lucide-react';
import { Activity } from './Activity';
import { ToolMoveList } from './ToolMoveList';
import { AddToolMoveForm } from './AddToolMoveForm';
import { WeldList } from './WeldList';
import { AddWeldForm } from './AddWeldForm';
import { Locations } from './Locations';
import { ReasonList } from './ReasonList';
import { AddReasonForm } from './AddReasonForm';
import { WeldNotification } from './WeldNotification';
import { UserProfiles } from './UserProfiles';
import { AddUserForm } from './AddUserForm';

interface DashboardProps {
  user: User;
}

type TabType = 'activity' | 'toolMoves' | 'welds' | 'locations' | 'reasons' | 'users';

export function Dashboard({ user }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('activity');
  const [showAddForm, setShowAddForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

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

  const handleItemAdded = () => {
    setShowAddForm(false);
    setRefreshKey(prev => prev + 1);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setShowAddForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <WeldNotification />
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Tool Move Tracking</h1>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="hidden sm:block text-sm text-gray-600 truncate max-w-[150px] md:max-w-none">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="border-b border-gray-200 -mx-4 sm:mx-0">
            <nav className="flex gap-4 sm:gap-8 overflow-x-auto px-4 sm:px-0 scrollbar-hide">
              <button
                onClick={() => handleTabChange('activity')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === 'activity'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Activity
              </button>
              <button
                onClick={() => handleTabChange('toolMoves')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === 'toolMoves'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Tool Moves
              </button>
              <button
                onClick={() => handleTabChange('welds')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === 'welds'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Weld Touch Ups
              </button>
              {isAdmin && (
                <button
                  onClick={() => handleTabChange('locations')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === 'locations'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Locations
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={() => handleTabChange('reasons')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === 'reasons'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Reasons
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={() => handleTabChange('users')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === 'users'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Users
                </button>
              )}
            </nav>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            {activeTab === 'activity' && 'Activity'}
            {activeTab === 'toolMoves' && 'Tool Moves'}
            {activeTab === 'welds' && 'Weld Touch Ups'}
            {activeTab === 'locations' && 'Locations'}
            {activeTab === 'reasons' && 'Reasons for Tool Moves'}
            {activeTab === 'users' && 'User Profiles'}
          </h2>
          {activeTab !== 'activity' && activeTab !== 'locations' && activeTab !== 'users' && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              <Plus className="h-5 w-5" />
              <span className="sm:inline">
                {activeTab === 'toolMoves' && 'Record Tool Move'}
                {activeTab === 'welds' && 'Add Weld Touch Up'}
                {activeTab === 'reasons' && 'Add Reason'}
              </span>
            </button>
          )}
          {activeTab === 'users' && isAdmin && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              <Plus className="h-5 w-5" />
              Add User
            </button>
          )}
        </div>

        {showAddForm && (
          <div className="mb-6">
            {activeTab === 'toolMoves' && (
              <AddToolMoveForm onSuccess={handleItemAdded} onCancel={() => setShowAddForm(false)} />
            )}
            {activeTab === 'welds' && (
              <AddWeldForm onSuccess={handleItemAdded} onCancel={() => setShowAddForm(false)} />
            )}
            {activeTab === 'reasons' && (
              <AddReasonForm onSuccess={handleItemAdded} onCancel={() => setShowAddForm(false)} />
            )}
            {activeTab === 'users' && (
              <AddUserForm onSuccess={handleItemAdded} onCancel={() => setShowAddForm(false)} />
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <Activity key={`activity-${refreshKey}`} userId={user.id} refresh={refreshKey} />
        )}
        {activeTab === 'toolMoves' && (
          <ToolMoveList key={`toolMoves-${refreshKey}`} userId={user.id} refresh={refreshKey} />
        )}
        {activeTab === 'welds' && (
          <WeldList key={`welds-${refreshKey}`} userId={user.id} refresh={refreshKey} />
        )}
        {activeTab === 'locations' && (
          <Locations key={`locations-${refreshKey}`} userId={user.id} refresh={refreshKey} />
        )}
        {activeTab === 'reasons' && (
          <ReasonList key={`reasons-${refreshKey}`} userId={user.id} />
        )}
        {activeTab === 'users' && (
          <UserProfiles key={`users-${refreshKey}`} userId={user.id} />
        )}
      </main>
    </div>
  );
}
