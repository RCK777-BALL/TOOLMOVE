import { useState } from 'react';
import { Wrench } from 'lucide-react';
import { Button } from '@radix-ui/themes';
import { api } from '../lib/api';
import type { AppUser } from '../App';

interface AuthFormProps {
  onAuth: (user: AppUser) => void;
}

export function AuthForm({ onAuth }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.login(email, password);
      localStorage.setItem('tm_token', res.token);
      localStorage.setItem('tm_user_email', res.user.email || email);
      localStorage.setItem('tm_user_is_admin', String(!!res.user.isAdmin));
      onAuth({ ...res.user, token: res.token });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 px-4">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <Wrench className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 mr-2" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Tool Tracker</h1>
        </div>

        <h2 className="text-lg sm:text-xl font-semibold text-center mb-6 text-gray-800">
          Sign In
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full text-sm sm:text-base font-medium"
          >
            {loading ? 'Loading...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
}
