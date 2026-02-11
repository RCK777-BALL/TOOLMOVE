import { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { Auth } from './components/Auth';
import { Navigation } from './components/Navigation';
import { ActivityView } from './components/ActivityView';
import { ToolMovesView } from './components/ToolMovesView';
import { WeldTouchUpsView } from './components/WeldTouchUpsView';
import { LocationsView } from './components/LocationsView';
import { ReasonsView } from './components/ReasonsView';
import { UsersView } from './components/UsersView';
import { LogOut } from 'lucide-react';
import type { Profile } from './types/domain';

function App() {
  const [activeTab, setActiveTab] = useState('activity');
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('id', userId)
      .maybeSingle();
    setUserProfile(data);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return <Auth onSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">Tool Move Tracking System</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {userProfile?.email || session.user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'activity' && <ActivityView />}
        {activeTab === 'tool-moves' && <ToolMovesView />}
        {activeTab === 'weld-touch-ups' && <WeldTouchUpsView />}
        {activeTab === 'locations' && <LocationsView />}
        {activeTab === 'reasons' && <ReasonsView />}
        {activeTab === 'users' && session?.user?.id && <UsersView currentUserId={session.user.id} />}
      </div>
    </div>
  );
}

export default App;
