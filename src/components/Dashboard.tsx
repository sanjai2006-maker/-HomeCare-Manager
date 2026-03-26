import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { MaintenanceTask, MaintenanceHistory } from '../types';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Calendar as CalendarIcon, 
  Plus, 
  History as HistoryIcon,
  LayoutDashboard,
  Settings,
  ChevronRight,
  Wrench,
  Droplets,
  Zap,
  Brush,
  ShieldCheck,
  Timer,
  MapPin,
  Phone
} from 'lucide-react';
import { cn } from '../lib/utils';
import { format, isBefore, addDays, startOfToday } from 'date-fns';
import { motion } from 'motion/react';

export const Dashboard: React.FC<{ onAddTask: () => void; onShowHistory: () => void }> = ({ onAddTask, onShowHistory }) => {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [recentHistory, setRecentHistory] = useState<MaintenanceHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksData, historyData] = await Promise.all([
          api.tasks.list(),
          api.history.list()
        ]);
        setTasks(tasksData);
        setRecentHistory(historyData.slice(0, 5));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const urgentTasks = tasks.filter(t => t.status === 'urgent' || isBefore(new Date(t.nextDue), addDays(startOfToday(), 3)));
  const pendingTasks = tasks.filter(t => t.status === 'pending' && !urgentTasks.includes(t));
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const stats = [
    { label: 'Urgent', value: urgentTasks.length, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Pending', value: pendingTasks.length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Completed', value: completedTasks.length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total', value: tasks.length, icon: LayoutDashboard, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  if (loading) return <div className="p-8 text-center text-zinc-500">Loading your dashboard...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <motion.div 
            key={stat.label}
            whileHover={{ y: -2 }}
            className="p-4 bg-white border border-zinc-200 rounded-2xl shadow-sm flex items-center gap-4"
          >
            <div className={cn("p-2.5 rounded-xl", stat.bg)}>
              <stat.icon className={cn("w-5 h-5", stat.color)} />
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold text-zinc-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Task List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-zinc-400" />
              Upcoming Maintenance
            </h2>
            <button 
              onClick={onAddTask}
              className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-all text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              New Task
            </button>
          </div>

          <div className="space-y-3">
            {urgentTasks.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-red-600 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                  Urgent Attention Required
                </p>
                {urgentTasks.map(task => (
                  <TaskCard key={task.id} task={task} isUrgent />
                ))}
              </div>
            )}

            <div className="space-y-3 pt-4">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Scheduled Tasks</p>
              {pendingTasks.length > 0 ? (
                pendingTasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))
              ) : (
                <div className="p-8 border-2 border-dashed border-zinc-200 rounded-2xl text-center">
                  <p className="text-zinc-400 text-sm">No pending tasks. You're all caught up!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: Recent History & Tips */}
        <div className="space-y-8">
          <div className="p-5 bg-white border border-zinc-200 rounded-2xl">
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              How Scheduling Works
            </h3>
            <ul className="space-y-2 text-xs text-zinc-500">
              <li className="flex gap-2">
                <span className="font-bold text-zinc-900">1.</span>
                Tasks are scheduled based on your chosen frequency (Daily, Weekly, etc).
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-zinc-900">2.</span>
                When you mark a task as "Done", the system automatically calculates the next due date.
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-zinc-900">3.</span>
                The backend scheduler runs daily to flag tasks due within 3 days as "Urgent".
              </li>
            </ul>
          </div>

          <div className="p-6 bg-zinc-900 text-white rounded-3xl shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2">Maintenance Tip</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Regularly checking your HVAC filters every 3 months can reduce energy consumption by up to 15% and extend the life of your unit.
              </p>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap className="w-24 h-24" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                <HistoryIcon className="w-4 h-4 text-zinc-400" />
                Recent Activity
              </h3>
              <button onClick={onShowHistory} className="text-xs text-zinc-500 hover:text-zinc-900 font-medium">View All</button>
            </div>
            <div className="space-y-3">
              {recentHistory.map(item => (
                <div key={item.id} className="flex items-start gap-3 p-3 bg-white border border-zinc-100 rounded-xl">
                  <div className="p-2 bg-zinc-50 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{item.taskTitle}</p>
                    <p className="text-xs text-zinc-500">{format(new Date(item.completedAt), 'MMM d, yyyy')}</p>
                  </div>
                </div>
              ))}
              {recentHistory.length === 0 && (
                <p className="text-xs text-zinc-400 text-center py-4 italic">No history recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TaskCard: React.FC<{ task: MaintenanceTask; isUrgent?: boolean }> = ({ task, isUrgent }) => {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group p-4 bg-white border rounded-2xl transition-all hover:shadow-md flex items-center justify-between gap-4",
        isUrgent ? "border-red-200 bg-red-50/30" : "border-zinc-200"
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "p-3 rounded-xl",
          isUrgent ? "bg-red-100 text-red-600" : "bg-zinc-100 text-zinc-500"
        )}>
          {task.category === 'structural' && <Wrench className="w-5 h-5" />}
          {task.category === 'electrical' && <Zap className="w-5 h-5" />}
          {task.category === 'plumbing' && <Droplets className="w-5 h-5" />}
          {task.category === 'cleaning' && <Brush className="w-5 h-5" />}
          {task.category === 'safety' && <ShieldCheck className="w-5 h-5" />}
          {task.category === 'other' && <Settings className="w-5 h-5" />}
        </div>
        <div>
          <h4 className="font-bold text-zinc-900 group-hover:text-zinc-600 transition-colors">{task.title}</h4>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs font-medium text-zinc-500 flex items-center gap-1">
              <CalendarIcon className="w-3 h-3" />
              Due {format(new Date(task.nextDue), 'MMM d')}
            </span>
            <span className="text-xs font-medium text-zinc-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {task.frequency}
            </span>
            {task.expiryTime && (
              <span className="text-xs font-medium text-amber-600 flex items-center gap-1">
                <Timer className="w-3 h-3" />
                {task.expiryTime}
              </span>
            )}
          </div>
          {(task.address || task.contactDetails) && (
            <div className="flex items-center gap-3 mt-1.5 opacity-60">
              {task.address && (
                <span className="text-[10px] font-medium text-zinc-500 flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5" />
                  {task.address}
                </span>
              )}
              {task.contactDetails && (
                <span className="text-[10px] font-medium text-zinc-500 flex items-center gap-1">
                  <Phone className="w-2.5 h-2.5" />
                  {task.contactDetails}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      <button className="p-2 text-zinc-300 hover:text-zinc-900 transition-colors">
        <ChevronRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
};
