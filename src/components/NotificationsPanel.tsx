import React from 'react';
import { X, Sparkles, Target, Zap } from 'lucide-react';

interface NotificationsPanelProps {
  onClose: () => void;
  isDark: boolean;
}

export default function NotificationsPanel({ onClose, isDark }: NotificationsPanelProps) {
  const notifications = [
    { id: 1, type: 'ai', title: 'AI Productivity Insight', message: 'You are most productive in the mornings. Try scheduling high-risk tasks before 10 AM.', icon: <Sparkles className="h-4 w-4 text-indigo-400" /> },
    { id: 2, type: 'goal', title: 'Goal Milestone', message: 'You have completed 80% of your "Hackathon MVP" goal. Keep pushing!', icon: <Target className="h-4 w-4 text-emerald-400" /> },
    { id: 3, type: 'streak', title: 'Streak Alert', message: 'You are on a 5-day streak of completing all daily tasks. Amazing!', icon: <Zap className="h-4 w-4 text-amber-400" /> },
  ];

  return (
    <div className={`absolute right-4 top-16 w-80 rounded-xl shadow-2xl z-50 border ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-black/10'}`}>
      <div className="flex justify-between items-center p-4 border-b border-inherit">
        <h3 className="text-sm font-bold uppercase tracking-wider">AI Insights & Updates</h3>
        <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-full"><X className="h-4 w-4" /></button>
      </div>
      <div className="p-4 space-y-4">
        {notifications.map(n => (
          <div key={n.id} className="flex gap-3 items-start">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
              {n.icon}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider opacity-75">{n.title}</p>
              <p className="text-xs mt-1 leading-relaxed opacity-90">{n.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
