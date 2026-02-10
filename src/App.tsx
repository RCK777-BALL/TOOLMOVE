import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Auth } from './components/Auth';
import { AddToolMoveForm } from './components/AddToolMoveForm';
import { AddWeldForm } from './components/AddWeldForm';
import { LogOut, User } from 'lucide-react';

function App() {
  const [showToolMoveForm, setShowToolMoveForm] = useState(false);
  const [showWeldForm, setShowWeldForm] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

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
      .select('*')
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
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tool Move Tracking System</h1>
          <div className="flex items-center gap-4">
            {userProfile && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <User className="h-4 w-4" />
                <span>{userProfile.full_name || userProfile.email}</span>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setShowToolMoveForm(true)}
            className="px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Record Tool Move
          </button>
          <button
            onClick={() => setShowWeldForm(true)}
            className="px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Add Weld Touch Up
          </button>
        </div>

        {showToolMoveForm && (
          <AddToolMoveForm
            onSuccess={() => setShowToolMoveForm(false)}
            onCancel={() => setShowToolMoveForm(false)}
          />
        )}

        {showWeldForm && (
          <AddWeldForm
            onSuccess={() => setShowWeldForm(false)}
            onCancel={() => setShowWeldForm(false)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
