import React from 'react';
import { loginWithGoogle, logout, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { LogIn, LogOut, Home } from 'lucide-react';

export const Auth: React.FC = () => {
  const [user, loading] = useAuthState(auth);

  if (loading) return <div className="animate-pulse">Loading...</div>;

  return (
    <div className="flex items-center gap-4">
      {user ? (
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-zinc-900">{user.displayName}</p>
            <p className="text-xs text-zinc-500">{user.email}</p>
          </div>
          <img 
            src={user.photoURL || ''} 
            alt={user.displayName || 'User'} 
            className="w-8 h-8 rounded-full border border-zinc-200"
            referrerPolicy="no-referrer"
          />
          <button
            onClick={logout}
            className="p-2 text-zinc-500 hover:text-red-600 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <button
          onClick={loginWithGoogle}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-all text-sm font-medium"
        >
          <LogIn className="w-4 h-4" />
          Sign In with Google
        </button>
      )}
    </div>
  );
};
