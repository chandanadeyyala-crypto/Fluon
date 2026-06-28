/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Task, Goal, Settings } from '../types';
import { ChevronLeft, ChevronRight, Calendar, AlertTriangle, Target, CheckCircle2, Circle, Sparkles } from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
  goals: Goal[];
  settings: Settings;
  dailyPlan?: any[];
  generatingDailyPlan?: boolean;
  onGenerateDailyPlan?: () => void;
  onCancelDailyPlan?: () => void;
}

export default function CalendarView({ 
  tasks, 
  goals, 
  settings,
  dailyPlan = [],
  generatingDailyPlan = false,
  onGenerateDailyPlan,
  onCancelDailyPlan
}: CalendarViewProps) {
  const isDark = settings.theme === 'dark';

  // State for selected date in calendar
  const [selectedDate, setSelectedDate] = useState<string>('2026-06-29');

  // Let's focus our calendar on June 2026
  const monthName = "June 2026";
  const daysInMonth = 30;
  const startDayOffset = 1; // June 1st, 2026 is a Monday (0=Sun, 1=Mon, ...)

  // Generate calendar days
  const calendarCells = [];
  for (let i = 0; i < startDayOffset; i++) {
    calendarCells.push(null); // Empty padding cells for preceding month
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  // Helper to format date key: YYYY-MM-DD
  const formatDateKey = (dayNum: number) => {
    const pad = (n: number) => n < 10 ? '0' + n : n;
    return `2026-06-${pad(dayNum)}`;
  };

  // Find all items on a specific date (June 2026)
  const getItemsForDate = (dateStr: string) => {
    const dateTasks = tasks.filter(t => t.deadline === dateStr);
    
    // Find goal milestones on this date
    const dateMilestones: Array<{ goalTitle: string; title: string; completed: boolean }> = [];
    goals.forEach(goal => {
      goal.milestones.forEach(ms => {
        if (ms.dueDate === dateStr) {
          dateMilestones.push({
            goalTitle: goal.title,
            title: ms.title,
            completed: ms.completed
          });
        }
      });
    });

    return { tasks: dateTasks, milestones: dateMilestones };
  };

  // Calculate items for the selected day
  const selectedDayItems = getItemsForDate(selectedDate);
  const totalSelectedItemsCount = selectedDayItems.tasks.length + selectedDayItems.milestones.length;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs opacity-50 uppercase tracking-widest mb-1 font-semibold font-mono">DEADLINE CHRONOLOGY</p>
          <h1 className="text-2xl font-light tracking-tight">
            Interactive <span className="font-semibold">Calendar</span>
          </h1>
        </div>
        <div className="flex items-center space-x-3 text-[10px] font-bold uppercase tracking-wider">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span className="opacity-80">Task Deadline</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 inline-block" />
            <span className="opacity-80">Goal Milestone</span>
          </span>
        </div>
      </header>

      {/* Gemini AI Daily Focus Order & Plan */}
      <div className={`p-6 rounded-xl border ${
        isDark ? 'bg-[#0a0524] border-indigo-500/20 text-white' : 'bg-indigo-50/50 border-indigo-100 text-black'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-indigo-400 shrink-0" />
            <h3 className="font-bold text-sm tracking-tight">Gemini Stress-Aware Daily Plan</h3>
          </div>
          <div className="flex items-center space-x-2">
            {generatingDailyPlan && onCancelDailyPlan && (
              <button
                onClick={onCancelDailyPlan}
                className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all bg-red-500/10 hover:bg-red-500/20 text-red-400"
              >
                Cancel
              </button>
            )}
            <button
              onClick={onGenerateDailyPlan}
              disabled={generatingDailyPlan || tasks.length === 0}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                isDark 
                  ? 'bg-white text-black hover:opacity-90' 
                  : 'bg-black text-white hover:opacity-90'
              } disabled:opacity-50`}
            >
              {generatingDailyPlan ? 'Structuring Focus...' : "Generate Today's Plan"}
            </button>
          </div>
        </div>

        {dailyPlan && dailyPlan.length > 0 ? (
          <div className="space-y-3 text-xs">
            <p className="leading-relaxed opacity-90 font-medium">Here is your estimated stress-aware schedule optimized for highest focus efficiency:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {dailyPlan.map((block, idx) => (
                <div 
                  key={idx} 
                  className={`p-3.5 rounded-lg border ${
                    isDark ? 'bg-white/5 border-white/5' : 'bg-white border-black/5'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-wider font-bold text-indigo-400 mb-1.5">
                    <span>{block.timeSlot}</span>
                    <span>Focus Rank #{idx + 1}</span>
                  </div>
                  <h4 className="font-bold text-xs leading-tight mb-1">{block.taskTitle}</h4>
                  <p className="opacity-75 leading-normal text-[11px]">{block.whyOrder}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-[11px] opacity-75 leading-relaxed">
            {tasks.length === 0 
              ? "Add some tasks on the Tasks page to unlock today's AI-curated daily schedule, complete with timebox estimations and optimized focus order."
              : "Let Gemini build today's smart daily plan. It analyzes your tasks, deadlines, energy reserves, and priority constraints to sequence a balanced day. Click the button above to begin."
            }
          </p>
        )}
      </div>

      {/* Main Grid: Left is Calendar Grid, Right is Selected Day Detail Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Monthly Grid Column */}
        <div className="lg:col-span-8">
          <div className={`p-6 rounded-xl border ${
            isDark ? 'bg-[#000000] border-white/10 text-white' : 'bg-white border-[#00000008] text-black'
          }`}>
            {/* Header controls */}
            <div className="flex items-center justify-between mb-4 border-b border-[#00000008] dark:border-white/5 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-indigo-400" />
                <span>{monthName}</span>
              </span>
              <div className="flex items-center space-x-1 text-[9px] uppercase font-mono tracking-widest opacity-50">
                <span>Month lock (Demo mode)</span>
              </div>
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs">
              
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-1 font-bold uppercase opacity-50 text-[10px]">
                  {day}
                </div>
              ))}

              {/* Day cells */}
              {calendarCells.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="p-3 opacity-20 font-mono">·</div>;
                }

                const dateStr = formatDateKey(day);
                const items = getItemsForDate(dateStr);
                const isSelected = selectedDate === dateStr;
                const hasTask = items.tasks.length > 0;
                const hasMilestone = items.milestones.length > 0;

                return (
                  <button
                    type="button"
                    key={`day-${day}`}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`p-2.5 rounded-lg min-h-[55px] flex flex-col justify-between transition-all border text-left ${
                      isSelected
                        ? isDark
                          ? 'bg-white text-black border-white font-bold shadow-sm'
                          : 'bg-black text-white border-black font-bold shadow-sm'
                        : isDark
                          ? 'bg-white/5 border-white/5 hover:bg-white/10 text-white'
                          : 'bg-slate-50 border-black/5 hover:bg-slate-100 text-black'
                    }`}
                  >
                    <span className="text-[10px] font-mono">{day}</span>
                    
                    {/* Compact Indicators below the day number (prevents cramped cells) */}
                    <div className="flex items-center space-x-1 mt-1.5">
                      {hasTask && (
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? (isDark ? 'bg-black' : 'bg-white') : 'bg-rose-500'}`} title="Task Deadline" />
                      )}
                      {hasMilestone && (
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? (isDark ? 'bg-black' : 'bg-white') : 'bg-indigo-400'}`} title="Goal Milestone" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Day Agenda Side Panel */}
        <div className="lg:col-span-4">
          <div className={`p-6 rounded-xl border sticky top-4 ${
            isDark ? 'bg-[#000000] border-white/10 text-white' : 'bg-white border-[#00000008] text-black'
          }`}>
            <h2 className="text-xs uppercase tracking-wider font-bold mb-4 pb-2 border-b border-[#00000008] dark:border-white/5">
              Agenda: {selectedDate}
            </h2>

            {totalSelectedItemsCount === 0 ? (
              <div className="py-12 text-center text-xs opacity-50">
                <Circle className="h-8 w-8 mx-auto opacity-30 mb-2" />
                <p className="font-mono uppercase text-[9px] tracking-wider">No active commitments</p>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Section: Tasks */}
                {selectedDayItems.tasks.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold opacity-50 block">Tasks ({selectedDayItems.tasks.length})</span>
                    {selectedDayItems.tasks.map(task => (
                      <div 
                        key={task.id} 
                        className={`p-3 rounded-lg text-xs border ${
                          isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-black/5'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold ${task.status === 'completed' ? 'line-through opacity-55' : ''}`}>{task.title}</span>
                          <span className={`font-semibold uppercase tracking-wider text-[9px] px-1.5 py-0.5 rounded-md ${
                            task.priority === 'high' ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-500/10 text-slate-400'
                          }`}>{task.priority}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[9px] opacity-70 font-mono uppercase font-bold">
                          <span>Burnout: {task.burnoutRisk}</span>
                          <span>Lvl {task.notificationLevel} Alert</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Section: Milestones */}
                {selectedDayItems.milestones.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold opacity-50 block">Milestones ({selectedDayItems.milestones.length})</span>
                    {selectedDayItems.milestones.map((ms, idx) => (
                      <div 
                        key={idx} 
                        className={`p-3 rounded-lg text-xs border ${
                          isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-black/5'
                        }`}
                      >
                        <div className="flex items-start space-x-1.5">
                          <Target className="h-3.5 w-3.5 text-indigo-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-semibold">{ms.title}</p>
                            <span className="text-[9px] opacity-60 block">↳ Part of Goal: {ms.goalTitle}</span>
                          </div>
                        </div>
                        <div className="mt-2 flex justify-end">
                          <span className={`font-semibold uppercase tracking-wider text-[9px] px-1.5 rounded-md ${
                            ms.completed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {ms.completed ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
