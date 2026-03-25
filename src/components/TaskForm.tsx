import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { TaskCategory, TaskFrequency, TaskStatus } from '../types';
import { X, Calendar as CalendarIcon, Tag, Clock, FileText, Check } from 'lucide-react';
import { format, addDays, addWeeks, addMonths, addYears } from 'date-fns';

export const TaskForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [user] = useAuthState(auth);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('other');
  const [frequency, setFrequency] = useState<TaskFrequency>('monthly');
  const [nextDue, setNextDue] = useState(format(addDays(new Date(), 7), 'yyyy-MM-dd'));
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'tasks'), {
        uid: user.uid,
        title,
        description,
        category,
        frequency,
        nextDue: new Date(nextDue).toISOString(),
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      onClose();
    } catch (error) {
      console.error("Error adding task:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <h2 className="text-xl font-bold text-zinc-900">Add New Task</h2>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-3 h-3" />
              Task Title
            </label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Check Smoke Detectors"
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Tag className="w-3 h-3" />
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all appearance-none"
              >
                <option value="structural">Structural</option>
                <option value="electrical">Electrical</option>
                <option value="plumbing">Plumbing</option>
                <option value="cleaning">Cleaning</option>
                <option value="safety">Safety</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-3 h-3" />
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as TaskFrequency)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all appearance-none"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="one-time">One-time</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <CalendarIcon className="w-3 h-3" />
              Next Due Date
            </label>
            <input
              required
              type="date"
              value={nextDue}
              onChange={(e) => setNextDue(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-3 h-3" />
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any specific details or tools needed..."
              rows={3}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all resize-none"
            />
          </div>

          <div className="pt-4">
            <button
              disabled={submitting}
              type="submit"
              className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : (
                <>
                  <Check className="w-5 h-5" />
                  Create Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
