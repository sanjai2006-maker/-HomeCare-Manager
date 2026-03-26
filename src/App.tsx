import React, { useState, useEffect } from 'react';
import { api } from './api';
import { UserProfile } from './types';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { History } from './components/History';
import { WorkerDashboard } from './components/WorkerDashboard';
import { Toaster, toast } from 'sonner';
import { 
  LayoutDashboard, 
  ListTodo, 
  History as HistoryIcon, 
  Plus,
  Wrench,
  ShieldCheck,
  Zap,
  Droplets,
  Menu,
  X,
  Bell,
  LogOut,
  Loader2,
  HardHat,
  User as UserIcon,
  Home
} from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';

type View = 'dashboard' | 'tasks' | 'history';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'admin' | 'worker' | null>(null);

  useEffect(() => {
    api.auth.me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try {
      await api.auth.logout();
      setUser(null);
      setAuthMode(null);
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Maintenance Tasks', icon: ListTodo },
    { id: 'history', label: 'History Log', icon: HistoryIcon },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-zinc-900 animate-spin" />
          <p className="text-zinc-500 font-medium animate-pulse">Initializing System...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-4xl space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-flex p-4 bg-white rounded-3xl shadow-xl border border-zinc-100 mb-2">
              <Wrench className="w-12 h-12 text-zinc-900" />
            </div>
            <h1 className="text-5xl font-black text-zinc-900 tracking-tight">HomeKeep</h1>
            <p className="text-zinc-500 text-xl max-w-md mx-auto">Smart maintenance management for modern homes and professional staff.</p>
          </div>

          {!authMode ? (
            <div className="grid md:grid-cols-2 gap-8">
              <motion.button
                whileHover={{ y: -5 }}
                onClick={() => setAuthMode('admin')}
                className="p-10 bg-white rounded-[40px] shadow-xl border border-zinc-100 text-left space-y-6 group transition-all hover:border-zinc-900 hover:ring-4 hover:ring-zinc-900/5"
              >
                <div className="w-16 h-16 bg-zinc-900 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Home className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-zinc-900">Homeowner Portal</h2>
                  <p className="text-zinc-500 mt-2 font-medium">Manage your home, schedule tasks, and track maintenance history.</p>
                </div>
                <div className="pt-4 flex items-center gap-2 text-zinc-900 font-bold">
                  Get Started <Plus className="w-4 h-4" />
                </div>
              </motion.button>

              <motion.button
                whileHover={{ y: -5 }}
                onClick={() => setAuthMode('worker')}
                className="p-10 bg-white rounded-[40px] shadow-xl border border-zinc-100 text-left space-y-6 group transition-all hover:border-zinc-900 hover:ring-4 hover:ring-zinc-900/5"
              >
                <div className="w-16 h-16 bg-zinc-100 text-zinc-900 rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-zinc-900 group-hover:text-white transition-all">
                  <HardHat className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-zinc-900">Worker Portal</h2>
                  <p className="text-zinc-500 mt-2 font-medium">Access assigned tasks, mark completions, and view job details.</p>
                </div>
                <div className="pt-4 flex items-center gap-2 text-zinc-900 font-bold">
                  Staff Login <Plus className="w-4 h-4" />
                </div>
              </motion.button>
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              <button 
                onClick={() => setAuthMode(null)}
                className="mb-6 flex items-center gap-2 text-zinc-400 hover:text-zinc-900 font-bold transition-colors"
              >
                <X className="w-4 h-4" /> Back to selection
              </button>
              <div className="p-8 bg-white rounded-[40px] shadow-2xl border border-zinc-100 space-y-6">
                <div className="text-center space-y-1">
                  <h2 className="text-2xl font-black text-zinc-900">
                    {authMode === 'admin' ? 'Homeowner Access' : 'Worker Access'}
                  </h2>
                  <p className="text-zinc-500 text-sm font-medium">Please sign in to your account</p>
                </div>
                <Auth onUserChange={setUser} forcedRole={authMode} />
              </div>
            </div>
          )}

          <div className="flex justify-center gap-8 text-zinc-400">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Efficiency</span>
            </div>
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Reliability</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Security</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Worker View
  if (user.role === 'worker') {
    return (
      <div className="min-h-screen bg-zinc-50">
        <nav className="bg-white border-b border-zinc-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-900 rounded-xl">
                  <HardHat className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-zinc-900 tracking-tight">HomeKeep</h1>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Worker Portal</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-zinc-50 rounded-xl border border-zinc-100">
                  <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-zinc-900">{user.displayName || user.email}</p>
                    <p className="text-[10px] text-zinc-400 font-medium">Staff Member</p>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2.5 text-zinc-400 hover:text-red-600 transition-colors rounded-xl hover:bg-red-50"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <WorkerDashboard />
        </main>
        <Toaster position="top-right" expand={false} richColors />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-zinc-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Wrench className="w-6 h-6 text-zinc-900" />
          <span className="font-black text-lg tracking-tight">HomeKeep</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-zinc-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col p-6">
          <div className="hidden lg:flex items-center gap-3 mb-10 px-2">
            <div className="p-2 bg-zinc-900 text-white rounded-xl shadow-lg">
              <Wrench className="w-6 h-6" />
            </div>
            <span className="font-black text-2xl tracking-tight text-zinc-900">HomeKeep</span>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id as View);
                  setIsSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                  currentView === item.id 
                    ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/20" 
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-zinc-100">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-zinc-900 truncate">{user.displayName}</p>
                <p className="text-xs text-zinc-500 truncate">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-zinc-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 lg:p-10 max-w-6xl mx-auto w-full">
        <header className="hidden lg:flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight">
              {navItems.find(i => i.id === currentView)?.label}
            </h1>
            <p className="text-zinc-500 font-medium">Welcome back, {user.displayName?.split(' ')[0]}</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-3 bg-white border border-zinc-200 rounded-2xl text-zinc-400 hover:text-zinc-900 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <button 
              onClick={() => setIsTaskFormOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/20"
            >
              <Plus className="w-5 h-5" />
              Add Task
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentView === 'dashboard' && (
              <Dashboard 
                onAddTask={() => setIsTaskFormOpen(true)} 
                onShowHistory={() => setCurrentView('history')}
              />
            )}
            {currentView === 'tasks' && <TaskList />}
            {currentView === 'history' && <History onBack={() => setCurrentView('dashboard')} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Task Form Modal */}
      <AnimatePresence>
        {isTaskFormOpen && (
          <TaskForm onClose={() => setIsTaskFormOpen(false)} />
        )}
      </AnimatePresence>

      {/* Mobile Add Button */}
      <button 
        onClick={() => setIsTaskFormOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-zinc-900 text-white rounded-full shadow-2xl flex items-center justify-center z-40 hover:scale-110 active:scale-95 transition-all"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <Toaster position="top-right" expand={false} richColors />
    </div>
  );
}
