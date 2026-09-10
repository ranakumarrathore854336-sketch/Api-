import React, { useState } from 'react';
import { Lock, User, AlertCircle, ShieldCheck, KeyRound } from 'lucide-react';

interface LoginCardProps {
  onLogin: (token: string, username: string) => void;
}

export const LoginCard: React.FC<LoginCardProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('Abhi');
  const [password, setPassword] = useState('Abhi123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid credentials');
      } else {
        onLogin(data.token, data.user?.username || username);
      }
    } catch {
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setUsername('Abhi');
    setPassword('Abhi123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#f2f4f7] flex items-center justify-center p-4 sm:p-6 text-gray-800">
      <div className="w-full max-w-sm bg-white border border-gray-300 rounded-lg p-8 shadow-xs relative">
        {/* Brand Icon */}
        <div className="w-14 h-14 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-xs">
          V
        </div>

        <h1 className="text-xl font-semibold text-center text-gray-900 mb-1">
          Admin Login
        </h1>
        <p className="text-xs text-gray-500 text-center mb-6">
          Sign in to manage the API system
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded text-xs mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <User className="w-4 h-4" />
              </span>
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700"
              />
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-gray-900 hover:bg-black text-white text-sm font-medium rounded transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
          >
            <Lock className="w-3.5 h-3.5" />
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <button
            type="button"
            onClick={handleFillDemo}
            className="text-gray-600 hover:text-black flex items-center gap-1 font-medium underline"
          >
            <KeyRound className="w-3 h-3" />
            Fill credentials
          </button>
          <span className="flex items-center gap-1 text-[11px] text-gray-400">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            Secure Session
          </span>
        </div>

        <div className="text-center text-[11px] text-gray-400 mt-5">
          Secure Administration Panel
        </div>
      </div>
    </div>
  );
};
