import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { UserProfile } from '../types';
import { LogIn, UserPlus, Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AuthProps {
  onUserChange: (user: UserProfile | null) => void;
  forcedRole?: 'admin' | 'worker';
}

export const Auth: React.FC<AuthProps> = ({ onUserChange, forcedRole }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'admin' | 'worker'>(forcedRole || 'admin');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (forcedRole) {
      setRole(forcedRole);
    }
  }, [forcedRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const user = await api.auth.login(email, password);
        onUserChange(user);
        toast.success('Welcome back!');
      } else {
        await api.auth.register(email, password, displayName, role);
        toast.success('Account created! Please log in.');
        setIsLogin(true);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="flex bg-zinc-100 p-1 rounded-xl">
        <button
          onClick={() => setIsLogin(true)}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
            isLogin ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'
          }`}
        >
          Login
        </button>
        <button
          onClick={() => setIsLogin(false)}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
            !isLogin ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'
          }`}
        >
          Register
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <UserIcon className="w-3 h-3" />
                Full Name
              </label>
              <input
                required
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                placeholder="John Doe"
              />
            </div>

            {!forcedRole && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <UserIcon className="w-3 h-3" />
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`py-3 px-4 rounded-xl text-sm font-bold border transition-all ${
                      role === 'admin' 
                        ? 'bg-zinc-900 text-white border-zinc-900' 
                        : 'bg-zinc-50 text-zinc-500 border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    Admin / Manager
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('worker')}
                    className={`py-3 px-4 rounded-xl text-sm font-bold border transition-all ${
                      role === 'worker' 
                        ? 'bg-zinc-900 text-white border-zinc-900' 
                        : 'bg-zinc-50 text-zinc-500 border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    Worker / Staff
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        <div className="space-y-1">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <Mail className="w-3 h-3" />
            Email Address
          </label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
            placeholder="john@example.com"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <Lock className="w-3 h-3" />
            Password
          </label>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
            placeholder="••••••••"
          />
        </div>

        <button
          disabled={loading}
          type="submit"
          className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isLogin ? (
            <>
              <LogIn className="w-5 h-5" />
              Sign In
            </>
          ) : (
            <>
              <UserPlus className="w-5 h-5" />
              Create Account
            </>
          )}
        </button>
      </form>
    </div>
  );
};
