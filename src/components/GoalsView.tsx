/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Goal, RoadmapMilestone, Settings } from '../types';
import { Target, Sparkles, Plus, Trash2, Calendar, CheckSquare, CheckCircle } from 'lucide-react';
import { getPersonalityContent } from '../lib/personality';

interface GoalsViewProps {
  goals: Goal[];
  settings: Settings;
  onAddGoal: (goal: Omit<Goal, 'id'>) => void;
  onDeleteGoal: (goalId: string) => void;
  onToggleMilestone: (goalId: string, milestoneId: string) => void;
  onGenerateRoadmap: (goalId: string) => void;
  onCancelRoadmap?: () => void;
  onAddStarterTasks?: () => void;
  isProvisioning?: boolean;
  generatingRoadmapId?: string | null;
}

export default function GoalsView({ 
  goals, 
  settings, 
  onAddGoal, 
  onDeleteGoal, 
  onToggleMilestone, 
  onGenerateRoadmap,
  onCancelRoadmap,
  onAddStarterTasks,
  isProvisioning,
  generatingRoadmapId
}: GoalsViewProps) {
  const isDark = settings.theme === 'dark';

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('2026-07-31');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddGoal({
      title: title.trim(),
      description: description.trim(),
      deadline,
      status: 'active',
      milestones: [] // User can generate roadmap subsequently via AI generator button
    });

    setTitle('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs opacity-50 uppercase tracking-widest mb-1 font-semibold font-mono">ROADMAP &amp; GOALS</p>
          <h1 className="text-2xl font-light tracking-tight">
            Your <span className="font-semibold">Roadmap</span>
          </h1>
        </div>
      </header>

      {/* Grid containing Goal Form and Goals list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* New Goal Form Column */}
        <div className="lg:col-span-4">
          <div className={`p-6 rounded-xl border sticky top-4 ${
            isDark ? 'bg-[#000000] border-white/10 text-white' : 'bg-white border-[#00000008] text-black'
          }`}>
            <h2 className="text-xs uppercase tracking-wider font-bold mb-4 pb-2 border-b border-[#00000008] dark:border-white/5">New Goal</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block mb-1 font-semibold uppercase tracking-wider text-[10px] opacity-60">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pass Advanced Algorithms Course"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border focus:outline-none focus:ring-1 ${
                    isDark 
                      ? 'bg-white/5 border-white/10 text-white focus:ring-white' 
                      : 'bg-slate-50 border-black/10 text-black focus:ring-black'
                  }`}
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold uppercase tracking-wider text-[10px] opacity-60">Short Description</label>
                <textarea
                  placeholder={getPersonalityContent(settings.personality).goalPlaceholder}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className={`w-full p-2.5 rounded-lg border focus:outline-none focus:ring-1 ${
                    isDark 
                      ? 'bg-white/5 border-white/10 text-white focus:ring-white' 
                      : 'bg-slate-50 border-black/10 text-black focus:ring-black'
                  }`}
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold uppercase tracking-wider text-[10px] opacity-60">Target Deadline Date</label>
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

              <button
                type="submit"
                className={`w-full flex items-center justify-center space-x-1.5 py-2.5 rounded-lg font-bold uppercase tracking-wider text-xs transition-all ${
                  isDark ? 'bg-[#FFFFFF] text-[#000000] hover:opacity-90' : 'bg-[#000000] text-[#FFFFFF] hover:opacity-90'
                }`}
              >
                <Plus className="h-4 w-4" />
                <span>Initialize Goal</span>
              </button>
            </form>
          </div>
        </div>

        {/* Goals & Roadmap List Column */}
        <div className="lg:col-span-8 space-y-4">
          {goals.length === 0 ? (
            <div className={`p-12 text-center rounded-xl border space-y-4 ${
              isDark ? 'bg-[#000000] border-white/10 text-white' : 'bg-white border-[#00000008] text-black'
            }`}>
              <p className="text-xs font-mono opacity-60">No goals currently defined. Use the form to start.</p>
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
            goals.map(goal => {
              const totalMilestones = goal.milestones.length;
              const completedMilestones = goal.milestones.filter(m => m.completed).length;
              const percent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

              return (
                <div 
                  key={goal.id} 
                  className={`p-6 rounded-xl border ${
                    isDark ? 'bg-[#000000] border-white/10 text-[#F2FFFF]' : 'bg-white border-[#00000008] text-black'
                  } transition-colors`}
                >
                  {/* Top line metadata (compact 1-2 lines) */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-indigo-400 shrink-0" />
                        <h3 className="font-bold text-sm tracking-tight">{goal.title}</h3>
                      </div>
                      <p className={`text-[11px] mt-1 opacity-70`}>
                        {goal.description || 'No description provided.'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono opacity-80 flex items-center space-x-1 shrink-0 uppercase">
                        <Calendar className="h-3 w-3 inline opacity-60" />
                        <span>By {goal.deadline}</span>
                      </span>
                      <button
                        onClick={() => onDeleteGoal(goal.id)}
                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 p-1 rounded-md transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="mt-3 flex items-center space-x-3">
                    <div className={`h-1.5 flex-1 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-[#00000005]'}`}>
                      <div 
                        className={`h-full transition-all duration-300 ${isDark ? 'bg-[#F2FFFF]' : 'bg-[#000000]'}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="font-mono text-[10px] font-bold shrink-0">{percent}% Complete</span>
                  </div>

                  {/* Milestones list or AI roadmap generator */}
                  <div className="mt-4 pt-3 border-t border-[#00000008] dark:border-white/5 space-y-2">
                    {totalMilestones === 0 ? (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-2">
                        <span className="text-[11px] italic opacity-60">No milestones specified for this track.</span>
                        <div className="flex items-center space-x-2">
                          {generatingRoadmapId === goal.id && onCancelRoadmap && (
                            <button
                              onClick={onCancelRoadmap}
                              className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all bg-red-500/10 hover:bg-red-500/20 text-red-400"
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            onClick={() => onGenerateRoadmap(goal.id)}
                            disabled={generatingRoadmapId === goal.id}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider border transition-all ${
                              isDark 
                                ? 'bg-white text-black border-transparent hover:opacity-90' 
                                : 'bg-black text-white border-transparent hover:opacity-90'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            <Sparkles className={`h-3.5 w-3.5 ${generatingRoadmapId === goal.id ? 'animate-spin' : ''}`} />
                            <span>{generatingRoadmapId === goal.id ? 'Generating...' : 'Generate AI Roadmap'}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider opacity-60 pb-1">
                          <span>Roadmap Milestones</span>
                          <div className="flex items-center space-x-2">
                            {generatingRoadmapId === goal.id && onCancelRoadmap && (
                              <button
                                onClick={onCancelRoadmap}
                                className="text-[9px] text-red-400 hover:underline uppercase mr-1"
                              >
                                Cancel
                              </button>
                            )}
                            <button
                              onClick={() => onGenerateRoadmap(goal.id)}
                              disabled={generatingRoadmapId === goal.id}
                              className="text-indigo-500 hover:underline flex items-center space-x-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Sparkles className={`h-2.5 w-2.5 ${generatingRoadmapId === goal.id ? 'animate-spin' : ''}`} />
                              <span>{generatingRoadmapId === goal.id ? 'Generating...' : 'Regenerate Roadmap'}</span>
                            </button>
                          </div>
                        </div>
                        {goal.milestones.map(milestone => (
                          <div 
                            key={milestone.id} 
                            className={`flex items-center justify-between text-xs p-3 rounded-lg border ${
                              isDark ? 'bg-[#FFFFFF03] border-white/5' : 'bg-[#F2FFFF44] border-black/5'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={milestone.completed}
                                onChange={() => onToggleMilestone(goal.id, milestone.id)}
                                className="rounded cursor-pointer accent-black h-4 w-4"
                              />
                              <span className={milestone.completed ? 'line-through opacity-50 font-light' : 'font-semibold'}>
                                {milestone.title}
                              </span>
                            </div>
                            <span className="font-mono text-[9px] opacity-50 shrink-0 ml-2 uppercase">
                              Due {milestone.dueDate}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
