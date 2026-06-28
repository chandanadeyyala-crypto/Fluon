/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Task, Goal, Settings } from '../types';
import { Mic, Volume2, Plus, Trash2, ShieldAlert, Sparkles, AlertTriangle, Link, Bell } from 'lucide-react';
import { getPersonalityContent } from '../lib/personality';

interface TasksViewProps {
  tasks: Task[];
  goals: Goal[];
  settings: Settings;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleTask: (taskId: string) => void;
  onAddStarterTasks?: () => void;
  isProvisioning?: boolean;
  analyzingWorkload?: boolean;
  burnoutRisk?: 'low' | 'medium' | 'high';
  onRecalculatePriorities?: () => void;
  adaptiveProposals?: any[];
  checkingAdaptiveSchedule?: boolean;
  onApplyAdaptiveProposals?: () => void;
  onCheckAdaptiveScheduling?: () => void;
}

export default function TasksView({ 
  tasks, 
  goals, 
  settings, 
  onAddTask, 
  onDeleteTask, 
  onToggleTask,
  onAddStarterTasks,
  isProvisioning,
  analyzingWorkload = false,
  burnoutRisk = 'low',
  onRecalculatePriorities,
  adaptiveProposals = [],
  checkingAdaptiveSchedule = false,
  onApplyAdaptiveProposals,
  onCheckAdaptiveScheduling
}: TasksViewProps) {
  const isDark = settings.theme === 'dark';

  // Form states
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('2026-06-29');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [notificationLevel, setNotificationLevel] = useState<1 | 3>(1);
  const [formBurnoutRisk, setFormBurnoutRisk] = useState<'low' | 'medium' | 'high'>('low');
  const [linkedGoalId, setLinkedGoalId] = useState('');

  // Voice Simulation state
  const [isListening, setIsListening] = useState(false);
  const [speechText, setSpeechText] = useState('');

  // Simulated Voice phrases to make it interactive and super polished
  const MOCK_TRANSCRIPTIONS = [
    "Finish study group presentation by tomorrow",
    "Pay internet subscription bill before Friday",
    "Complete product design brief high priority linked to SaaS goal",
    "Schedule advisor review session next Monday"
  ];

  const handleSimulateVoice = () => {
    setIsListening(true);
    setSpeechText("Listening...");
    
    setTimeout(() => {
      const randomPhrase = MOCK_TRANSCRIPTIONS[Math.floor(Math.random() * MOCK_TRANSCRIPTIONS.length)];
      setSpeechText(`"${randomPhrase}"`);
      setTitle(randomPhrase);
      setIsListening(false);
    }, 1500);
  };

  const handleReadAloud = () => {
    const pending = tasks.filter(t => t.status === 'pending');
    if (pending.length === 0) {
      speak("You have no pending tasks. Great job staying on top of your commitments!");
      return;
    }

    const text = `You have ${pending.length} pending tasks. First is ${pending[0].title}, due on ${pending[0].deadline}. Second is ${
      pending[1] ? pending[1].title : 'nothing else urgent'
    }. Keep going, you are doing great!`;
    speak(text);
  };

  const speak = (phrase: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.rate = 1.0;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Speech synthesis not supported in this browser tab.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      deadline,
      priority,
      status: 'pending',
      linkedGoalId: linkedGoalId || undefined,
      notificationLevel,
      burnoutRisk: formBurnoutRisk
    });

    setTitle('');
    setLinkedGoalId('');
  };

  return (
    <div className="space-y-6">
      {/* Header with quick stats & Voice actions */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs opacity-50 uppercase tracking-widest mb-1 font-semibold font-mono">TASK TRACKER</p>
          <h1 className="text-2xl font-light tracking-tight">
            Manage <span className="font-semibold">Tasks</span>
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          {/* Real Speech Read Aloud Button */}
          <button
            onClick={handleReadAloud}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider border transition-all ${
              isDark 
                ? 'bg-black border-white/10 text-white hover:bg-white/5' 
                : 'bg-white border-black/10 text-black hover:bg-black/5'
            }`}
            title="Read out active priorities using voice synthesizer"
          >
            <Volume2 className="h-3.5 w-3.5" />
            <span>Read Aloud</span>
          </button>

          {/* Voice Input Trigger */}
          <button
            onClick={handleSimulateVoice}
            disabled={isListening}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider border transition-all ${
              isListening
                ? 'bg-rose-500/10 border-rose-500 text-rose-500 animate-pulse'
                : isDark 
                  ? 'bg-black border-white/10 text-white hover:bg-white/5' 
                  : 'bg-white border-black/10 text-black hover:bg-black/5'
            }`}
          >
            <Mic className="h-3.5 w-3.5 text-amber-500" />
            <span>{isListening ? 'Listening...' : 'Voice Input'}</span>
          </button>
        </div>
      </header>

      {/* Voice Status Alert if active */}
      {speechText && (
        <div className={`p-3 rounded-xl text-xs flex items-center justify-between border ${
          isDark ? 'bg-[#FFFFFF05] border-white/10 text-white' : 'bg-[#F2FFFF] border-[#00000010] text-black'
        }`}>
          <span>Voice Recognized: <span className="font-mono font-bold">{speechText}</span></span>
          <button onClick={() => setSpeechText('')} className="font-mono underline text-[10px] uppercase opacity-60 hover:opacity-100">clear</button>
        </div>
      )}

      {/* Grid: Create Task + Task List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Task Form Column */}
        <div className="lg:col-span-4">
          <div className={`p-6 rounded-xl border sticky top-4 ${
            isDark ? 'bg-[#000000] border-white/10 text-white' : 'bg-white border-[#00000008] text-black'
          }`}>
            <h2 className="text-xs uppercase tracking-wider font-bold mb-4 pb-2 border-b border-[#00000008] dark:border-white/5">New Task</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block mb-1 font-semibold uppercase tracking-wider text-[10px] opacity-60">Title / Task Description</label>
                <input
                  type="text"
                  required
                  placeholder={getPersonalityContent(settings.personality).taskPlaceholder}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border focus:outline-none focus:ring-1 ${
                    isDark 
                      ? 'bg-white/5 border-white/10 text-white focus:ring-white' 
                      : 'bg-slate-50 border-black/10 text-black focus:ring-black'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold uppercase tracking-wider text-[10px] opacity-60">Deadline Date</label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border focus:outline-none ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-black/10 text-black'
                    }`}
                  />
                </div>

                <div>
                  <label className="block mb-1 font-semibold uppercase tracking-wider text-[10px] opacity-60">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className={`w-full p-2.5 rounded-lg border focus:outline-none ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-black/10 text-black'
                    }`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold uppercase tracking-wider text-[10px] opacity-60">Notify Mode</label>
                  <select
                    value={notificationLevel}
                    onChange={(e) => setNotificationLevel(parseInt(e.target.value) as any)}
                    className={`w-full p-2.5 rounded-lg border focus:outline-none ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-black/10 text-black'
                    }`}
                  >
                    <option value={1}>Lvl 1: Dismiss Once</option>
                    <option value={3}>Lvl 3: Repeat Warn</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-semibold uppercase tracking-wider text-[10px] opacity-60">Burnout Risk</label>
                  <select
                    value={formBurnoutRisk}
                    onChange={(e) => setFormBurnoutRisk(e.target.value as any)}
                    className={`w-full p-2.5 rounded-lg border focus:outline-none ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-black/10 text-black'
                    }`}
                  >
                    <option value="low">Low Risk</option>
                    <option value="medium">Medium Strain</option>
                    <option value="high">Overload Alert</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold uppercase tracking-wider text-[10px] opacity-60 flex items-center space-x-1">
                  <Link className="h-3 w-3" />
                  <span>Link to Roadmap Goal</span>
                </label>
                <select
                  value={linkedGoalId}
                  onChange={(e) => setLinkedGoalId(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border focus:outline-none ${
                    isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-black/10 text-black'
                  }`}
                >
                  <option value="">-- No Linked Goal (Independent) --</option>
                  {goals.map(goal => (
                    <option key={goal.id} value={goal.id}>{goal.title}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className={`w-full flex items-center justify-center space-x-1.5 py-2.5 rounded-lg font-bold uppercase tracking-wider text-xs transition-all ${
                  isDark ? 'bg-[#FFFFFF] text-[#000000] hover:opacity-90' : 'bg-[#000000] text-[#FFFFFF] hover:opacity-90'
                }`}
              >
                <Plus className="h-4 w-4" />
                <span>Add Commitment</span>
              </button>
            </form>
          </div>
        </div>

        {/* Compact Table / List Column */}
        <div className="lg:col-span-8 space-y-4">
          <div className={`p-6 rounded-xl border ${
            isDark ? 'bg-[#000000] border-white/10 text-white' : 'bg-white border-[#00000008] text-black'
          }`}>
            <h2 className="text-xs uppercase tracking-wider font-bold mb-4 pb-2 border-b border-[#00000008] dark:border-white/5">
              Current Commitments Stack
            </h2>

            {tasks.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <p className="text-xs opacity-60 font-mono">No tasks recorded yet.</p>
                {onAddStarterTasks && (
                  <button
                    type="button"
                    onClick={onAddStarterTasks}
                    disabled={isProvisioning}
                    className="px-4 py-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                  >
                    {isProvisioning ? "Loading..." : "Add Starter Tasks"}
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#00000008] dark:border-white/5 opacity-60 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2 pr-2">Status</th>
                      <th className="py-2 pr-2">Task / Commitment</th>
                      <th className="py-2 pr-2">Deadline</th>
                      <th className="py-2 pr-2">Priority</th>
                      <th className="py-2 pr-2">Notify</th>
                      <th className="py-2 pr-2">Burnout</th>
                      <th className="py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#00000004] dark:divide-white/5">
                    {tasks.map(task => {
                      const linkedGoal = goals.find(g => g.id === task.linkedGoalId);
                      return (
                        <tr key={task.id} className="hover:bg-slate-500/5 transition-all">
                          <td className="py-3 pr-2">
                            <input
                              type="checkbox"
                              checked={task.status === 'completed'}
                              onChange={() => onToggleTask(task.id)}
                              className="rounded cursor-pointer accent-black h-4 w-4"
                            />
                          </td>
                          <td className="py-3 pr-2 font-medium">
                            <div className="max-w-[200px] truncate sm:max-w-xs">
                              <span className={task.status === 'completed' ? 'line-through opacity-50 font-light' : 'font-semibold'}>
                                {task.title}
                              </span>
                              {linkedGoal && (
                                <span className={`block text-[10px] opacity-50 font-mono mt-0.5`}>
                                  ↳ {linkedGoal.title}
                                </span>
                              )}
                              {task.priorityExplanation && (
                                <p className="text-[10px] text-indigo-400 mt-1 max-w-[280px] leading-snug whitespace-pre-wrap italic">
                                  ✦ Gemini: {task.priorityExplanation}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 pr-2 font-mono text-[10px] opacity-80">
                            {task.deadline}
                          </td>
                          <td className="py-3 pr-2">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                              task.priority === 'high' 
                                ? 'bg-rose-500/10 text-rose-500' 
                                : task.priority === 'medium'
                                  ? 'bg-amber-500/10 text-amber-500'
                                  : 'bg-slate-500/10 text-slate-400'
                            }`}>
                              {task.priority}
                            </span>
                          </td>
                          <td className="py-3 pr-2">
                            <span className="flex items-center space-x-1 text-[10px] font-mono opacity-80">
                              <Bell className="h-3 w-3 inline opacity-60" />
                              <span>Lvl {task.notificationLevel}</span>
                            </span>
                          </td>
                          <td className="py-3 pr-2">
                            <span className={`flex items-center space-x-1 text-[10px] font-mono uppercase font-bold ${
                              task.burnoutRisk === 'high' ? 'text-rose-500' : 'opacity-80'
                            }`}>
                              {task.burnoutRisk === 'high' && <ShieldAlert className="h-3 w-3 text-rose-500 shrink-0" />}
                              {task.burnoutRisk === 'medium' && <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />}
                              <span>{task.burnoutRisk}</span>
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => onDeleteTask(task.id)}
                              className="text-rose-500 hover:text-rose-600 p-1 rounded hover:bg-rose-500/10 transition-all inline-block"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
