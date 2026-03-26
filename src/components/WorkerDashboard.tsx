import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { MaintenanceTask } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar as CalendarIcon,
  Search,
  Wrench,
  Zap,
  Droplets,
  Brush,
  ShieldCheck,
  Settings,
  MapPin,
  Phone,
  Timer
} from 'lucide-react';
import { format, addDays, addWeeks, addMonths, addYears } from 'date-fns';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export const WorkerDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      const data = await api.tasks.list();
      // Only show pending or urgent tasks to workers
      setTasks(data.filter(t => t.status !== 'completed'));
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const toggleExpand = (taskId: string) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                         t.category.toLowerCase().includes(search.toLowerCase()) ||
                         (t.address?.toLowerCase() || '').includes(search.toLowerCase());
    return matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'structural': return <Wrench className="w-4 h-4" />;
      case 'electrical': return <Zap className="w-4 h-4" />;
      case 'plumbing': return <Droplets className="w-4 h-4" />;
      case 'cleaning': return <Brush className="w-4 h-4" />;
      case 'safety': return <ShieldCheck className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  if (loading) return <div className="p-8 text-center text-zinc-500">Loading assigned tasks...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Worker Dashboard</h2>
          <p className="text-zinc-500 text-sm">View and complete maintenance tasks.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search tasks or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
          />
        </div>
      </div>

      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {filteredTasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => task.id && toggleExpand(task.id)}
              className={cn(
                "group p-5 bg-white border border-zinc-200 rounded-3xl shadow-sm hover:shadow-md transition-all cursor-pointer",
                expandedTaskId === task.id && "ring-2 ring-zinc-900 border-transparent"
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className={cn(
                    "p-3.5 rounded-2xl shrink-0",
                    task.status === 'urgent' ? "bg-red-50 text-red-600" : "bg-zinc-50 text-zinc-500"
                  )}>
                    {getCategoryIcon(task.category)}
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-zinc-900 text-lg">{task.title}</h3>
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5",
                        task.status === 'urgent' ? "bg-red-100 text-red-700" : "bg-zinc-100 text-zinc-600"
                      )}>
                        {task.status === 'urgent' && <AlertCircle className="w-3 h-3" />}
                        {task.status === 'pending' && <Clock className="w-3 h-3" />}
                        {task.status}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500">{task.description || 'No description provided.'}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        Due: {format(new Date(task.nextDue), 'MMM d, yyyy')}
                      </span>
                      {task.expiryTime && (
                        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md flex items-center gap-1.5">
                          <Timer className="w-3.5 h-3.5" />
                          Expires: {task.expiryTime}
                        </span>
                      )}
                    </div>

                    <AnimatePresence>
                      {expandedTaskId === task.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden pt-4 mt-4 border-t border-zinc-100"
                        >
                          <div className="grid sm:grid-cols-2 gap-4">
                            {task.address && (
                              <div className="space-y-1.5">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Address</p>
                                <div className="flex items-start gap-2 text-sm text-zinc-900 font-medium">
                                  <MapPin className="w-4 h-4 text-zinc-400 mt-0.5" />
                                  {task.address}
                                </div>
                              </div>
                            )}
                            {task.contactDetails && (
                              <div className="space-y-1.5">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Contact Details</p>
                                <div className="flex items-start gap-2 text-sm text-zinc-900 font-medium">
                                  <Phone className="w-4 h-4 text-zinc-400 mt-0.5" />
                                  {task.contactDetails}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    className={cn(
                      "flex items-center justify-center gap-2 px-6 py-3 rounded-2xl transition-all text-sm font-bold shadow-lg",
                      expandedTaskId === task.id 
                        ? "bg-zinc-100 text-zinc-900 shadow-none" 
                        : "bg-zinc-900 text-white shadow-zinc-900/20"
                    )}
                  >
                    {expandedTaskId === task.id ? 'Hide Details' : 'View Details'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredTasks.length === 0 && (
          <div className="p-12 border-2 border-dashed border-zinc-200 rounded-3xl text-center">
            <div className="inline-flex p-4 bg-zinc-50 rounded-full mb-4">
              <CheckCircle2 className="w-8 h-8 text-zinc-300" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">All caught up!</h3>
            <p className="text-zinc-500 text-sm mt-1">There are no pending tasks at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};
