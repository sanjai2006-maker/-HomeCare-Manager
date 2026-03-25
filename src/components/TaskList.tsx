import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { MaintenanceTask, TaskStatus } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Trash2, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Filter,
  Search,
  MoreVertical,
  Wrench,
  Zap,
  Droplets,
  Brush,
  ShieldCheck,
  Settings
} from 'lucide-react';
import { format, addDays, addWeeks, addMonths, addYears } from 'date-fns';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const TaskList: React.FC = () => {
  const [user] = useAuthState(auth);
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'tasks'),
      where('uid', '==', user.uid),
      orderBy('nextDue', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MaintenanceTask)));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleComplete = async (task: MaintenanceTask) => {
    if (!task.id || !user) return;

    const now = new Date();
    let nextDue = new Date(task.nextDue);

    // Calculate next due date based on frequency
    switch (task.frequency) {
      case 'daily': nextDue = addDays(now, 1); break;
      case 'weekly': nextDue = addWeeks(now, 1); break;
      case 'monthly': nextDue = addMonths(now, 1); break;
      case 'yearly': nextDue = addYears(now, 1); break;
      case 'one-time': 
        await updateDoc(doc(db, 'tasks', task.id), { status: 'completed' });
        break;
    }

    if (task.frequency !== 'one-time') {
      await updateDoc(doc(db, 'tasks', task.id), {
        lastDone: now.toISOString(),
        nextDue: nextDue.toISOString(),
        status: 'pending'
      });
    }

    // Add to history
    await addDoc(collection(db, 'history'), {
      uid: user.uid,
      taskId: task.id,
      taskTitle: task.title,
      completedAt: now.toISOString(),
      notes: `Completed as scheduled (${task.frequency})`
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteDoc(doc(db, 'tasks', id));
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesFilter = filter === 'all' || t.status === filter;
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                         t.category.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
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

  if (loading) return <div className="p-8 text-center text-zinc-500">Loading tasks...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-zinc-900">Maintenance Tasks</h2>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none font-medium"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="urgent">Urgent</option>
            <option value="completed">Completed</option>
          </select>
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
              className="group p-5 bg-white border border-zinc-200 rounded-3xl shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "p-3.5 rounded-2xl",
                    task.status === 'urgent' ? "bg-red-50 text-red-600" : "bg-zinc-50 text-zinc-500"
                  )}>
                    {getCategoryIcon(task.category)}
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 text-lg">{task.title}</h3>
                    <p className="text-sm text-zinc-500 mt-0.5">{task.description || 'No description provided.'}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5",
                        task.status === 'urgent' ? "bg-red-100 text-red-700" : 
                        task.status === 'completed' ? "bg-emerald-100 text-emerald-700" : 
                        "bg-zinc-100 text-zinc-600"
                      )}>
                        {task.status === 'urgent' && <AlertCircle className="w-3 h-3" />}
                        {task.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                        {task.status === 'pending' && <Clock className="w-3 h-3" />}
                        {task.status}
                      </span>
                      <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        Next: {format(new Date(task.nextDue), 'MMM d, yyyy')}
                      </span>
                      <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {task.frequency}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {task.status !== 'completed' && (
                    <button
                      onClick={() => handleComplete(task)}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all text-sm font-bold"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Mark Done
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(task.id!)}
                    className="p-2.5 text-zinc-300 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredTasks.length === 0 && (
          <div className="p-12 border-2 border-dashed border-zinc-200 rounded-3xl text-center">
            <div className="inline-flex p-4 bg-zinc-50 rounded-full mb-4">
              <Search className="w-8 h-8 text-zinc-300" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">No tasks found</h3>
            <p className="text-zinc-500 text-sm mt-1">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
};
