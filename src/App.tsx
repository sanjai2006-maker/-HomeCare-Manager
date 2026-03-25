import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { History } from './components/History';
import { 
  Home, 
  LayoutDashboard, 
  ListTodo, 
  History as HistoryIcon, 
  Plus,
  Wrench,
  ShieldCheck,
  Zap,
  Droplets,
  Brush,
  Menu,
  X,
  Bell
} from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';

type View = 'dashboard' | 'tasks' | 'history';

export default function App() {
  const [user, loading] = useAuthState(auth);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Maintenance Tasks', icon: ListTodo },
    { id: 'history', label: 'History Log', icon: HistoryIcon },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
          <p className="text-zinc-500 font-medium animate-pulse">Initializing System...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="inline-flex p-4 bg-white rounded-3xl shadow-xl border border-zinc-100 mb-4">
            <Wrench className="w-12 h-12 text-zinc-900" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-zinc-900 tracking-tight">HomeKeep</h1>
            <p className="text-zinc-500 text-lg">Smart maintenance management for modern homeowners.</p>
          </div>
          <div className="p-8 bg-white rounded-3xl shadow-xl border border-zinc-100 space-y-6">
            <div className="grid grid-cols-3 gap-4 pb-4 border-b border-zinc-100">
              <div className="flex flex-col items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Zap className="w-5 h-5" /></div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Electrical</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Droplets className="w-5 h-5" /></div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Plumbing</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><ShieldCheck className="w-5 h-5" /></div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Safety</span>
              </div>
            </div>
            <Auth />
            <p className="text-xs text-zinc-400">Secure access via Google Authentication</p>
          </div>
        </div>
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
            <Auth />
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
    </div>
  );
}

