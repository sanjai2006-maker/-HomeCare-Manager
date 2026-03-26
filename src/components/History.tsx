import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { MaintenanceHistory } from '../types';
import { 
  History as HistoryIcon, 
  CheckCircle2, 
  Calendar as CalendarIcon, 
  DollarSign, 
  FileText,
  Search,
  ArrowLeft,
  User as UserIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

export const History: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [history, setHistory] = useState<MaintenanceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await api.history.list();
        setHistory(data);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const filteredHistory = history.filter(h => 
    h.taskTitle.toLowerCase().includes(search.toLowerCase()) || 
    h.notes?.toLowerCase().includes(search.toLowerCase()) ||
    (h.completedBy?.toLowerCase() || '').includes(search.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center text-zinc-500">Loading history...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors rounded-xl hover:bg-zinc-100"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-3">
            <HistoryIcon className="w-6 h-6 text-zinc-400" />
            Maintenance History
          </h2>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search history or staff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
          />
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredHistory.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group p-6 bg-white border border-zinc-200 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-5">
                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-zinc-900 text-lg">{item.taskTitle}</h3>
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      Completed {format(new Date(item.completedAt), 'MMM d, yyyy')}
                    </span>
                    {item.completedBy && (
                      <span className="text-xs font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-md flex items-center gap-1.5">
                        <UserIcon className="w-3.5 h-3.5 text-zinc-400" />
                        By: {item.completedBy}
                      </span>
                    )}
                    {item.cost && (
                      <span className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5" />
                        Cost: ${item.cost.toFixed(2)}
                      </span>
                    )}
                  </div>
                  {item.notes && (
                    <p className="text-sm text-zinc-500 mt-2 italic flex items-start gap-2">
                      <FileText className="w-4 h-4 mt-0.5 text-zinc-300" />
                      {item.notes}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right self-end sm:self-center">
                <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Reference ID</p>
                <p className="text-xs font-mono text-zinc-400">{item.id?.substring(0, 8)}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredHistory.length === 0 && (
          <div className="p-16 border-2 border-dashed border-zinc-200 rounded-3xl text-center">
            <HistoryIcon className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-zinc-900">No records found</h3>
            <p className="text-zinc-500 text-sm mt-1">Completed tasks will appear here for your records.</p>
          </div>
        )}
      </div>
    </div>
  );
};
