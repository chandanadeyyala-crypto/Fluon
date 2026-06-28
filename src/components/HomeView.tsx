/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Task, Goal, JournalLog, Settings } from '../types';
import { AlertCircle, Calendar, CheckSquare, Target, Flame, Lightbulb, ChevronRight, User, Sparkles } from 'lucide-react';
import { getPersonalityContent } from '../lib/personality';
import ThinkingCard from './ThinkingCard';

interface HomeViewProps {
  tasks: Task[];
  goals: Goal[];
  settings: Settings;
  onNavigate: (pageId: string) => void;
  onToggleTask: (taskId: string) => void;
  onAddStarterTasks?: () => void;
  isProvisioning?: boolean;
  burnoutRisk?: 'low' | 'medium' | 'high';
  suggestions?: string[];
  recoveryTips?: string[];
  analyzingWorkload?: boolean;
  onRecalculatePriorities?: () => void;
  smartNotifications?: any[];
  loadingSmartNotifications?: boolean;
  onFetchSmartNotifications?: () => void;
  adaptiveProposals?: any[];
  checkingAdaptiveSchedule?: boolean;
  onApplyAdaptiveProposals?: () => void;
  onCheckAdaptiveScheduling?: () => void;
  dailyPlan?: any[];
  generatingDailyPlan?: boolean;
  onGenerateDailyPlan?: () => void;
  onUpdateSettings?: (newSettings: Partial<Settings>) => void;
}

export default function HomeView({ 
  tasks, 
  goals, 
  settings, 
  onNavigate, 
  onToggleTask,
  onAddStarterTasks,
  isProvisioning,
  burnoutRisk = 'low',
  suggestions = [],
  recoveryTips = [],
  analyzingWorkload = false,
  onRecalculatePriorities,
  smartNotifications = [],
  loadingSmartNotifications = false,
  onFetchSmartNotifications,
  adaptiveProposals = [],
  checkingAdaptiveSchedule = false,
  onApplyAdaptiveProposals,
  onCheckAdaptiveScheduling,
  dailyPlan = [],
  generatingDailyPlan = false,
  onGenerateDailyPlan,
  onUpdateSettings
}: HomeViewProps) {
  const isDark = settings.theme === 'dark';
  const [dashboardInsights, setDashboardInsights] = React.useState<any>(null);
  const [loadingInsights, setLoadingInsights] = React.useState(false);
  const [greeting, setGreeting] = React.useState("");
  const [celebration, setCelebration] = React.useState<string | null>(null);

  const triggerCelebration = async (eventType: string) => {
    try {
      const res = await fetch('/api/gemini/celebration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType })
      });
      const data = await res.json();
      setCelebration(data.message);
      setTimeout(() => setCelebration(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const [aiCooldown, setAiCooldown] = React.useState(false);

  const fetchDashboardInsights = async (isDemo = false) => {
    if (aiCooldown && !isDemo) return;
    setLoadingInsights(true);
    try {
      if (isDemo) {
        setDashboardInsights({
            todayFocus: "Focus on task 1.",
            biggestRisk: "None in demo.",
            bestTimeToWork: "Now",
            quickWin: "Check sample task.",
            energyInsight: "Demo mode balance.",
            encouragingMessage: "This is a demo dashboard."
        });
        setGreeting("Good day! Ready to explore Fluon?");
        setLoadingInsights(false);
        return;
      }

      // Fetch Insights
      const insightRes = await fetch('/api/gemini/dashboard-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks, goals })
      });
      
      if (insightRes.status === 429) {
        setAiCooldown(true);
        setTimeout(() => setAiCooldown(false), 60000); // 1 minute cooldown
        setDashboardInsights({
            todayFocus: "AI is taking a break right now.",
            biggestRisk: "None detected.",
            bestTimeToWork: "Check your calendar.",
            quickWin: "Check pending tasks.",
            energyInsight: "AI is taking a break.",
            encouragingMessage: "AI is taking a break right now. You can still use your tasks, goals, journal, and calendar."
        });
        setLoadingInsights(false);
        return;
      }

      const insightData = await insightRes.json();
      setDashboardInsights(insightData);

      // Fetch Greeting
      const greetingRes = await fetch('/api/gemini/greeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          time: new Date().toLocaleTimeString(),
          personality: settings.personality,
          workload: tasks.length,
          burnout: burnoutRisk,
          completedTasks: completedTasksCount
        })
      });
      
      if (greetingRes.status !== 429) {
          const greetingData = await greetingRes.json();
          setGreeting(greetingData.greeting);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoadingInsights(false);
    }
  };

  React.useEffect(() => {
    // Only fetch once on mount or when demo mode changes
    fetchDashboardInsights(settings.demoMode);
  }, []);

  // State calculations
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasksCount = tasks.filter(t => t.status === 'completed').length;
  const isWorkspaceEmpty = tasks.length === 0 && goals.length === 0;
  
  // Important / urgent tasks
  const importantTasks = [...pendingTasks]
    .sort((a, b) => {
      const pMap = { high: 3, medium: 2, low: 1 };
      return pMap[b.priority] - pMap[a.priority];
    })
    .slice(0, 3);

  // Upcoming deadlines (next 7 days)
  const upcomingDeadlines = [...pendingTasks]
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 3);

  // Goal progress
  const activeGoals = goals.filter(g => g.status === 'active');

  // Risk & Burnout indicator
  const highRiskTasks = pendingTasks.filter(t => t.priority === 'high' || t.burnoutRisk === 'high');
  const overallRiskLevel = highRiskTasks.length > 2 ? 'High Burnout Risk' : highRiskTasks.length > 0 ? 'Medium Burnout Risk' : 'Low/Stable';

  return (
    <div className="space-y-6">
      {/* Sleek Header block */}
      <header className="flex justify-between items-end mb-8">
        <div>
          <p className="text-xs opacity-50 uppercase tracking-widest mb-1 font-semibold font-mono">WORKSPACE HOME</p>
          <h1 className="text-2xl font-light tracking-tight">
            {greeting}
          </h1>
        </div>
        {celebration && (
          <div className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-bold animate-fade-in shadow-lg">
            {celebration}
          </div>
        )}
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1 border rounded text-xs uppercase tracking-wider font-mono ${
            isDark ? 'bg-[#000000] border-white/10 text-white/75' : 'bg-white border-black/10 text-black/75'
          }`}>
            Sync Status: <span className="text-emerald-500 font-bold">Active</span>
          </div>
          <div className={`w-10 h-10 rounded-full border flex items-center justify-center ${
            isDark ? 'border-white/10 text-[#F2FFFF]' : 'border-[#00000015] text-black'
          }`}>
            <User className="w-5 h-5" />
          </div>
        </div>
      </header>

      {isWorkspaceEmpty ? (
        <div className={`p-8 rounded-xl border text-center max-w-2xl mx-auto space-y-6 ${
          isDark ? 'bg-[#000000] border-white/10 text-white' : 'bg-white border-[#00000008] text-black'
        }`}>
          <div className="mx-auto w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Target className="w-6 h-6 animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-light tracking-tight">Your Focus Slate is Completely <span className="font-semibold">Clear</span></h2>
            <p className="text-xs opacity-60 max-w-md mx-auto leading-relaxed">
              No active commitments, daily records, or roadmap targets are configured. Begin drafting your objectives or load the interactive starter blueprint below.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('goals')}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${
                isDark ? 'border-white/20 hover:bg-white/5 text-white' : 'border-black/10 hover:bg-black/5 text-black'
              }`}
            >
              Establish a Goal
            </button>
            <button
              onClick={() => onNavigate('tasks')}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${
                isDark ? 'border-white/20 hover:bg-white/5 text-white' : 'border-black/10 hover:bg-black/5 text-black'
              }`}
            >
              Draft a Task
            </button>
            {onAddStarterTasks && (
              <button
                onClick={onAddStarterTasks}
                disabled={isProvisioning}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50`}
              >
                {isProvisioning ? "Loading..." : "Add Starter Tasks"}
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Adaptive Rescheduling Proposals Banner */}
          {adaptiveProposals && adaptiveProposals.length > 0 && (
            <section className={`p-5 rounded-xl border animate-fade-in ${
              isDark ? 'bg-[#1e0a14] border-rose-500/30 text-white' : 'bg-rose-50/70 border-rose-100 text-black'
            }`}>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0 text-rose-400">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider font-bold text-rose-500 block mb-1">
                      Adaptive Scheduling Proposal
                    </span>
                    <h3 className="text-sm font-bold leading-snug">
                      Missed task deadlines detected. Gemini proposes a revised schedule:
                    </h3>
                    <div className="mt-2 space-y-1 text-xs">
                      {adaptiveProposals.map((prop: any, idx: number) => (
                        <div key={idx} className="opacity-90">
                          ✦ <b>{prop.taskTitle}</b> deadline pushed to <b>{prop.proposedDeadline}</b> — <span className="italic">{prop.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <button
                    onClick={onApplyAdaptiveProposals}
                    className="flex-1 md:flex-none px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all"
                  >
                    Accept &amp; Apply
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Quick Setup Checklist (Optional) */}
          <section className={`p-5 rounded-xl border animate-fade-in ${
            isDark ? 'bg-[#0b0a1d] border-indigo-500/20 text-white' : 'bg-slate-50 border-black/5 text-black'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-[9px] uppercase tracking-wider font-bold text-indigo-400 mb-1">
                  Optional Setup checklist
                </p>
                <h3 className="text-sm font-bold leading-tight">
                  Connect your devices to unleash full Gemini integration:
                </h3>
                <div className="mt-3 flex flex-wrap gap-4 text-xs">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={settings.googleCalendarSync}
                      onChange={(e) => onUpdateSettings && onUpdateSettings({ googleCalendarSync: e.target.checked })}
                      className="rounded cursor-pointer accent-black h-3.5 w-3.5"
                    />
                    <span className="opacity-80">Link Google Calendar (Optional)</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={settings.locationAccess}
                      onChange={(e) => onUpdateSettings && onUpdateSettings({ locationAccess: e.target.checked })}
                      className="rounded cursor-pointer accent-black h-3.5 w-3.5"
                    />
                    <span className="opacity-80">Authorize Location Services (Optional)</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={settings.breakReminders}
                      onChange={(e) => onUpdateSettings && onUpdateSettings({ breakReminders: e.target.checked })}
                      className="rounded cursor-pointer accent-black h-3.5 w-3.5"
                    />
                    <span className="opacity-80">Enable Smart Safeguard Alerts</span>
                  </label>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-[10px] uppercase font-mono shrink-0">
                <button
                  type="button"
                  onClick={() => onUpdateSettings && onUpdateSettings({ googleCalendarSync: true, locationAccess: true, breakReminders: true })}
                  className="text-indigo-400 font-bold hover:underline"
                >
                  Enable All
                </button>
                <span className="opacity-35">|</span>
                <button
                  type="button"
                  onClick={() => alert("Setup checklist skipped. You can configure these anytime in Settings.")}
                  className="text-slate-400 hover:underline"
                >
                  Skip for now
                </button>
              </div>
            </div>
          </section>


          {/* Widgets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1. Today's Important Tasks */}
            <div 
              className={`rounded-xl p-6 border flex flex-col justify-between ${
                isDark 
                  ? 'bg-[#000000] border-white/10 text-white' 
                  : 'bg-white border-[#00000008] text-black'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xs font-bold uppercase tracking-wider">Important Tasks</h2>
                  <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-mono ${
                    isDark ? 'bg-white/10 text-[#F2FFFF]' : 'bg-[#00000008] text-black'
                  }`}>{importantTasks.length} High</span>
                </div>
                {importantTasks.length === 0 ? (
                  <p className="text-xs opacity-60 py-6 text-center font-mono">No pending high-priority tasks.</p>
                ) : (
                  <div className="space-y-3">
                    {importantTasks.map(task => (
                      <div key={task.id} className="flex items-start justify-between p-3 border border-[#00000005] bg-[#F2FFFF44] rounded-lg">
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox" 
                            checked={task.status === 'completed'}
                            onChange={() => {
                              onToggleTask(task.id);
                              if (task.status !== 'completed') triggerCelebration('task_completion');
                            }}
                            className="rounded cursor-pointer accent-black h-4 w-4"
                          />
                          <span className={`text-sm ${task.status === 'completed' ? 'line-through opacity-50' : 'font-light'}`}>
                            {task.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono opacity-50 uppercase">{task.priority}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button 
                onClick={() => onNavigate('tasks')}
                className={`w-full mt-4 py-2 border rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                  isDark ? 'border-white/10 hover:bg-white/5 text-white' : 'border-black/10 hover:bg-black/5 text-black'
                }`}
              >
                Review Stack
              </button>
            </div>

            {/* 2. Upcoming Deadlines */}
            <div 
              className={`rounded-xl p-6 border flex flex-col justify-between ${
                isDark 
                  ? 'bg-[#000000] border-white/10 text-white' 
                  : 'bg-white border-[#00000008] text-black'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xs font-bold uppercase tracking-wider">Upcoming Deadlines</h2>
                  <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-mono ${
                    isDark ? 'bg-white/10' : 'bg-[#00000008]'
                  }`}>Imminent</span>
                </div>
                {upcomingDeadlines.length === 0 ? (
                  <p className="text-xs opacity-60 py-6 text-center font-mono">No imminent deadlines.</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingDeadlines.map(task => {
                      const daysLeft = Math.ceil((new Date(task.deadline).getTime() - new Date('2026-06-28').getTime()) / (1000 * 3600 * 24));
                      return (
                        <div key={task.id} className="flex gap-4">
                          <div className={`w-1 rounded-full shrink-0 ${daysLeft <= 1 ? 'bg-rose-500' : isDark ? 'bg-white/40' : 'bg-[#00000040]'}`}></div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold truncate">{task.title}</p>
                            <p className="text-[10px] opacity-50 uppercase font-mono mt-0.5">
                              {daysLeft <= 0 ? 'Today/Overdue' : daysLeft === 1 ? 'Tomorrow' : `In ${daysLeft} days`} • {task.deadline}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <button 
                onClick={() => onNavigate('calendar')}
                className={`w-full mt-4 py-2 border rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                  isDark ? 'border-white/10 hover:bg-white/5 text-white' : 'border-black/10 hover:bg-black/5 text-black'
                }`}
              >
                View Calendar
              </button>
            </div>

            {/* 3. Goal Progress */}
            <div 
              className={`rounded-xl p-6 border flex flex-col justify-between ${
                isDark 
                  ? 'bg-[#000000] border-white/10 text-white' 
                  : 'bg-white border-[#00000008] text-black'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xs font-bold uppercase tracking-wider">Goal Progress</h2>
                  <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-mono ${
                    isDark ? 'bg-white/10' : 'bg-[#00000008]'
                  }`}>Active Track</span>
                </div>
                {activeGoals.length === 0 ? (
                  <p className="text-xs opacity-60 py-6 text-center font-mono">No active goal tracks.</p>
                ) : (
                  <div className="space-y-4">
                    {activeGoals.slice(0, 2).map(goal => {
                      const totalMilestones = goal.milestones.length;
                      const completed = goal.milestones.filter(m => m.completed).length;
                      const percent = totalMilestones > 0 ? Math.round((completed / totalMilestones) * 100) : 0;
                      return (
                        <div key={goal.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="truncate text-sm font-semibold">{goal.title}</span>
                            <span className="font-mono text-xs font-bold">{percent}%</span>
                          </div>
                          <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-[#00000005]'}`}>
                            <div 
                              className={`h-full transition-all duration-300 ${isDark ? 'bg-[#F2FFFF]' : 'bg-[#000000]'}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <button 
                onClick={() => onNavigate('goals')}
                className={`w-full mt-4 py-2 border rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                  isDark ? 'border-white/10 hover:bg-white/5 text-white' : 'border-black/10 hover:bg-black/5 text-black'
                }`}
              >
                Review Roadmap
              </button>
            </div>

            {/* 4. Accountability Pulse / Burnout Summary */}
            <div 
              className={`rounded-xl p-6 border flex flex-col justify-between ${
                isDark 
                  ? 'bg-[#000000] border-white/10 text-white' 
                  : 'bg-white border-[#00000008] text-black'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xs font-bold uppercase tracking-wider">Accountability Pulse</h2>
                  <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-mono ${
                    isDark ? 'bg-white/10' : 'bg-[#00000008]'
                  }`}>Strain Indicator</span>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="32" cy="32" r="26" stroke={isDark ? "rgba(255,255,255,0.1)" : "#F2FFFF"} strokeWidth="4.5" fill="none"/>
                      <circle cx="32" cy="32" r="26" stroke={isDark ? "#F2FFFF" : "#000000"} strokeWidth="4.5" strokeDasharray="163" strokeDashoffset={163 - (163 * (tasks.length > 0 ? (completedTasksCount / tasks.length) : 1))} fill="none" className="transition-all"/>
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-xs font-bold">{tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 100}%</span>
                      <span className="text-[6px] uppercase tracking-tighter opacity-50 font-semibold font-mono">Done</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] opacity-60 uppercase font-mono">Burnout State:</span>
                      <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                        burnoutRisk === 'high' 
                          ? 'bg-rose-500/15 text-rose-500' 
                          : burnoutRisk === 'medium'
                            ? 'bg-amber-500/15 text-amber-500'
                            : 'bg-emerald-500/15 text-emerald-500'
                      }`}>{burnoutRisk} RISK</span>
                    </div>
                    <p className="text-[11px] leading-tight opacity-70">
                      {burnoutRisk === 'high' 
                        ? "Critical stress levels. Heavy workloads or missed deadlines detected."
                        : burnoutRisk === 'medium'
                          ? "Moderate strain. Some overdue tasks or tight milestones are active."
                          : "Pacing is excellent. Workload is balanced and stable."}
                    </p>
                  </div>
                </div>

                {/* Gemini Recovery Tips */}
                {suggestions && suggestions.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[#00000005] dark:border-white/5 text-[10px] leading-relaxed space-y-1">
                    <span className="text-[8px] font-mono uppercase tracking-widest font-bold text-amber-500 block mb-1">AI Coping Advice:</span>
                    {suggestions.slice(0, 2).map((s, idx) => (
                      <div key={idx} className="flex gap-1 opacity-80">
                        <span className="text-amber-500">•</span>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button 
                onClick={() => onNavigate('journal')}
                className={`w-full mt-4 py-2 border rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                  isDark ? 'border-white/10 hover:bg-white/5 text-white' : 'border-black/10 hover:bg-black/5 text-black'
                }`}
              >
                Review Logs
              </button>
            </div>

            {/* 5. AI Focus Insights */}
            <div 
              className={`rounded-xl p-6 border flex flex-col justify-between relative overflow-hidden ${
                isDark 
                  ? 'bg-[#0f0a2e] border-indigo-500/30 text-white' 
                  : 'bg-indigo-50/50 border-indigo-100 text-black'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="h-4 w-4 text-indigo-400" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400">AI Daily Overview</h2>
                  </div>
                  <button onClick={() => fetchDashboardInsights(settings.demoMode)} className="text-[9px] font-mono opacity-60 underline uppercase hover:opacity-100">Refresh</button>
                </div>
                
                {loadingInsights ? (
                  <ThinkingCard isDark={isDark} />
                ) : dashboardInsights ? (
                  <div className="space-y-3 text-xs">
                    <p><strong>Today's Focus:</strong> {dashboardInsights.todayFocus}</p>
                    <p><strong>Biggest Risk:</strong> {dashboardInsights.biggestRisk}</p>
                    <p><strong>Best Time to Work:</strong> {dashboardInsights.bestTimeToWork}</p>
                    <p><strong>Quick Win:</strong> {dashboardInsights.quickWin}</p>
                    <p className="italic opacity-80 pt-2">"{dashboardInsights.encouragingMessage}"</p>
                  </div>
                ) : null}
              </div>
            </div>

            {/* 6. Active Notifications & Status */}
            <div 
              className={`rounded-xl p-6 border flex flex-col justify-between ${
                isDark 
                  ? 'bg-[#000000] border-white/10 text-white' 
                  : 'bg-white border-[#00000008] text-black'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xs font-bold uppercase tracking-wider">Active Safeguards</h2>
                  <span className="text-[10px] px-2 py-0.5 rounded uppercase font-mono bg-indigo-500/10 text-indigo-500 font-bold">
                    Level 3 Filter
                  </span>
                </div>

                <div className="space-y-2">
                  {smartNotifications && smartNotifications.length > 0 ? (
                    smartNotifications.map((notif: any, idx: number) => {
                      const isHigh = notif.severity === 'high';
                      return (
                        <div 
                          key={idx} 
                          className={`p-2.5 rounded-lg border text-xs ${
                            isHigh
                              ? 'border-rose-500/10 bg-rose-500/5 text-rose-500'
                              : isDark ? 'bg-[#FFFFFF05] border-white/5 text-white' : 'bg-[#F2FFFF44] border-black/5 text-slate-800'
                          }`}
                        >
                          <p className={`font-semibold uppercase tracking-wider text-[9px] ${isHigh ? 'text-rose-500' : 'text-indigo-500'}`}>
                            ✦ {notif.type} Reminder
                          </p>
                          <p className="text-[11px] leading-tight mt-1 opacity-95">{notif.message}</p>
                        </div>
                      );
                    })
                  ) : (
                    <>
                      <div className={`p-2.5 rounded-lg border text-xs ${
                        isDark ? 'bg-[#FFFFFF05] border-white/5' : 'bg-[#F2FFFF44] border-black/5'
                      }`}>
                        <p className="font-semibold uppercase tracking-wider text-[9px] text-indigo-500">Focus Safeguard</p>
                        <p className="text-[11px] leading-tight mt-1 opacity-80">You have been active for 2 hours. Consult AI to avoid overload accumulation.</p>
                      </div>
                      <div className="p-2.5 rounded-lg border border-rose-500/10 bg-rose-500/5 text-xs">
                        <p className="font-semibold uppercase tracking-wider text-[9px] text-rose-500">Critical Commitment Alert</p>
                        <p className="text-[11px] leading-tight mt-1 text-rose-500/95">Server renewal check due in 48 hours. Safeguard override blocked.</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <button 
                onClick={() => onNavigate('companion')}
                className={`w-full mt-4 py-2 border rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                  isDark ? 'border-white/10 hover:bg-white/5 text-white' : 'border-black/10 hover:bg-black/5 text-black'
                }`}
              >
                Launch Companion
              </button>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
