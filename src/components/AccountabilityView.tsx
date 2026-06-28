/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { JournalLog, Settings } from '../types';
import { BookOpen, Award, Sparkles, AlertTriangle, Calendar, Plus } from 'lucide-react';
import { getPersonalityContent } from '../lib/personality';

interface AccountabilityViewProps {
  logs: JournalLog[];
  settings: Settings;
  onAddLog: (log: Omit<JournalLog, 'id'>) => void;
  journalAnalysis?: any;
  analyzingJournal?: boolean;
  onAnalyzeJournal?: () => void;
}

export default function AccountabilityView({ 
  logs, 
  settings, 
  onAddLog,
  journalAnalysis,
  analyzingJournal,
  onAnalyzeJournal
}: AccountabilityViewProps) {
  const isDark = settings.theme === 'dark';

  // Form states
  const [mood, setMood] = useState('');
  const [energy, setEnergy] = useState<number>(3);
  const [focus, setFocus] = useState<number>(3);
  const [whatGotDone, setWhatGotDone] = useState('');
  const [whatGotDelayed, setWhatGotDelayed] = useState('');
  const [tomorrowPlan, setTomorrowPlan] = useState('');

  // File upload and progress states for demo / skip mode
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      simulateUpload(file);
    }
  };

  const simulateUpload = (file: File) => {
    setAttachedFile(file);
    setUploadProgress(10);
    
    const timer = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) {
          clearInterval(timer);
          return null;
        }
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 15;
      });
    }, 250);
  };

  const handleCancelUpload = () => {
    setAttachedFile(null);
    setUploadProgress(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Check if we already logged today
    if (logs.some(l => l.date === todayStr)) {
      alert("You have already logged your accountability statement for today. Keep focusing on your plans!");
      return;
    }

    onAddLog({
      date: todayStr,
      mood: mood.trim() || 'Stable',
      energy,
      focus,
      whatGotDone: whatGotDone.trim() || 'Reviewed goals',
      whatGotDelayed: whatGotDelayed.trim() || 'None',
      tomorrowPlan: tomorrowPlan.trim() || 'Stay consistent'
    });

    // Reset fields
    setMood('');
    setEnergy(3);
    setFocus(3);
    setWhatGotDone('');
    setWhatGotDelayed('');
    setTomorrowPlan('');
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs opacity-50 uppercase tracking-widest mb-1 font-semibold font-mono">DAILY RECORD</p>
          <h1 className="text-2xl font-light tracking-tight">
            Accountability <span className="font-semibold">Journal</span>
          </h1>
        </div>
      </header>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Log input Column */}
        <div className="lg:col-span-5">
          <div className={`p-6 rounded-xl border sticky top-4 ${
            isDark ? 'bg-[#000000] border-white/10 text-white' : 'bg-white border-[#00000008] text-black'
          }`}>
            <h2 className="text-xs uppercase tracking-wider font-bold mb-4 pb-2 border-b border-[#00000008] dark:border-white/5">Daily Log</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div>
                <label className="block mb-1 font-semibold uppercase tracking-wider text-[10px] opacity-60">Current Vibe / Mood</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Focused but slightly fatigued"
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border focus:outline-none focus:ring-1 ${
                    isDark 
                      ? 'bg-white/5 border-white/10 text-white focus:ring-white' 
                      : 'bg-slate-50 border-black/10 text-black focus:ring-black'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold uppercase tracking-wider text-[10px] opacity-60">Energy Level (1-5)</label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setEnergy(num)}
                        className={`flex-1 py-1.5 rounded-lg border text-center font-bold text-[11px] transition-all ${
                          energy === num
                            ? isDark
                              ? 'bg-white text-black border-white'
                              : 'bg-black text-white border-black'
                            : isDark 
                              ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' 
                              : 'bg-slate-50 border-black/10 hover:bg-slate-100'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-semibold uppercase tracking-wider text-[10px] opacity-60">Focus Level (1-5)</label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setFocus(num)}
                        className={`flex-1 py-1.5 rounded-lg border text-center font-bold text-[11px] transition-all ${
                          focus === num
                            ? isDark
                              ? 'bg-white text-black border-white'
                              : 'bg-black text-white border-black'
                            : isDark 
                              ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' 
                              : 'bg-slate-50 border-black/10 hover:bg-slate-100'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold uppercase tracking-wider text-[10px] opacity-60">What actually got done?</label>
                <textarea
                  required
                  placeholder="Specify primary completed tasks..."
                  value={whatGotDone}
                  onChange={(e) => setWhatGotDone(e.target.value)}
                  rows={2}
                  className={`w-full p-2.5 rounded-lg border focus:outline-none focus:ring-1 ${
                    isDark 
                      ? 'bg-white/5 border-white/10 text-white focus:ring-white' 
                      : 'bg-slate-50 border-black/10 text-black focus:ring-black'
                  }`}
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold uppercase tracking-wider text-[10px] opacity-60">What got delayed / postponed?</label>
                <textarea
                  placeholder="Be honest, no judgment. What was pushed?"
                  value={whatGotDelayed}
                  onChange={(e) => setWhatGotDelayed(e.target.value)}
                  rows={2}
                  className={`w-full p-2.5 rounded-lg border focus:outline-none focus:ring-1 ${
                    isDark 
                      ? 'bg-white/5 border-white/10 text-white focus:ring-white' 
                      : 'bg-slate-50 border-[#00000015] text-black focus:ring-black'
                  }`}
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold uppercase tracking-wider text-[10px] opacity-60">Tomorrow's core focus</label>
                <input
                  type="text"
                  placeholder={getPersonalityContent(settings.personality).journalPlaceholder}
                  value={tomorrowPlan}
                  onChange={(e) => setTomorrowPlan(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border focus:outline-none focus:ring-1 ${
                    isDark 
                      ? 'bg-white/5 border-white/10 text-white focus:ring-white' 
                      : 'bg-slate-50 border-black/10 text-black focus:ring-black'
                  }`}
                />
              </div>

              {/* Optional Proof / Document Attachment */}
              <div className="space-y-1.5 pt-1">
                <label className="block font-semibold uppercase tracking-wider text-[10px] opacity-60">
                  Attach Study Document / Work Proof (Optional)
                </label>
                
                {uploadProgress !== null ? (
                  <div className={`p-3 rounded-lg border flex flex-col space-y-2 text-xs ${
                    isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-black/10'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[10px] truncate max-w-[200px]">
                        📎 {attachedFile?.name || "document.pdf"}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={handleCancelUpload}
                          className="text-[9px] text-red-400 hover:underline uppercase font-bold"
                        >
                          Cancel
                        </button>
                        <span className="opacity-40">|</span>
                        <button
                          type="button"
                          onClick={handleCancelUpload}
                          className="text-[9px] text-indigo-400 hover:underline uppercase font-bold"
                        >
                          Skip
                        </button>
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-full transition-all duration-200" 
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between font-mono text-[9px] opacity-60">
                      <span>{uploadProgress < 100 ? "Uploading & Analyzing..." : "Analysis complete ✓"}</span>
                      <span>{uploadProgress}%</span>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) simulateUpload(file);
                    }}
                    className={`p-3 border border-dashed rounded-lg text-center cursor-pointer transition-all ${
                      isDragging 
                        ? 'border-indigo-500 bg-indigo-500/5' 
                        : isDark 
                          ? 'border-white/20 bg-white/5 hover:border-white/35' 
                          : 'border-black/20 bg-slate-50 hover:border-black/35'
                    }`}
                  >
                    <input 
                      type="file" 
                      id="file-upload-input" 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                    <label htmlFor="file-upload-input" className="cursor-pointer block text-[11px] opacity-75">
                      <span>Drag &amp; drop study files, or </span>
                      <span className="text-indigo-400 hover:underline font-semibold">browse files</span>
                    </label>
                    <p className="text-[9px] opacity-40 font-mono mt-0.5 uppercase">
                      Supports PDFs, code sheets, and textbook snapshots
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className={`w-full flex items-center justify-center space-x-1.5 py-2.5 rounded-lg font-bold uppercase tracking-wider text-xs transition-all ${
                  isDark ? 'bg-[#FFFFFF] text-[#000000] hover:opacity-90' : 'bg-[#000000] text-[#FFFFFF] hover:opacity-90'
                }`}
              >
                <Plus className="h-4 w-4" />
                <span>Save Entry &amp; Align</span>
              </button>
            </form>
          </div>
        </div>

        {/* Previous logs Column */}
        <div className="lg:col-span-7 space-y-4">
          {/* Gemini Journal Diagnostics Widget */}
          <div className={`p-6 rounded-xl border ${
            isDark ? 'bg-[#0a0524] border-indigo-500/20 text-white' : 'bg-indigo-50/50 border-indigo-100 text-black'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-indigo-400 shrink-0" />
                <h3 className="font-bold text-sm tracking-tight">AI Journal Intelligence</h3>
              </div>
              <button
                onClick={onAnalyzeJournal}
                disabled={analyzingJournal || logs.length === 0}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                  isDark 
                    ? 'bg-white text-black hover:opacity-90' 
                    : 'bg-black text-white hover:opacity-90'
                } disabled:opacity-50`}
              >
                {analyzingJournal ? 'Analyzing...' : 'Generate AI Review'}
              </button>
            </div>

            {journalAnalysis ? (
              <div className="space-y-3 text-xs">
                <p className="leading-relaxed opacity-90">{journalAnalysis.summary}</p>
                
                {journalAnalysis.recurringIssues && journalAnalysis.recurringIssues.length > 0 && (
                  <div className="pt-2">
                    <span className="font-mono text-[9px] uppercase tracking-wider font-bold opacity-60 text-indigo-400 block mb-1">
                      Detected Work Blockers & Tendencies:
                    </span>
                    <ul className="list-disc pl-4 space-y-1 opacity-80">
                      {journalAnalysis.recurringIssues.map((issue: string, idx: number) => (
                        <li key={idx}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {journalAnalysis.suggestions && journalAnalysis.suggestions.length > 0 && (
                  <div className="pt-2">
                    <span className="font-mono text-[9px] uppercase tracking-wider font-bold opacity-60 text-emerald-400 block mb-1">
                      Targeted Lifestyle Adjustments:
                    </span>
                    <ul className="list-disc pl-4 space-y-1 opacity-80">
                      {journalAnalysis.suggestions.map((sug: string, idx: number) => (
                        <li key={idx}>{sug}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[11px] opacity-75 leading-relaxed">
                {logs.length === 0 
                  ? "Add your first daily journal entry on the left, then click analyze to unlock diagnostic feedback on your energy, mood patterns, and work blockers."
                  : "Gemini can analyze your journal entries over time to diagnose recurring work blocks, emotional hurdles, and suggest targeted habit improvements. Click the button above to begin."
                }
              </p>
            )}
          </div>

          <div className={`p-6 rounded-xl border ${
            isDark ? 'bg-[#000000] border-white/10 text-[#F2FFFF]' : 'bg-white border-[#00000008] text-black'
          }`}>
            <h2 className="text-xs uppercase tracking-wider font-bold mb-4 pb-2 border-b border-[#00000008] dark:border-white/5">Reflections Log History</h2>
            
            {logs.length === 0 ? (
              <p className="text-xs py-12 text-center opacity-60 font-mono">No reflection entries yet.</p>
            ) : (
              <div className="space-y-4">
                {logs.map(log => (
                  <div 
                    key={log.id} 
                    className={`p-4 rounded-xl border ${
                      isDark ? 'bg-white/5 border-white/5' : 'bg-[#F2FFFF44] border-black/5'
                    }`}
                  >
                    {/* Header bar of the log item */}
                    <div className="flex items-center justify-between border-b border-[#00000008] dark:border-white/5 pb-2 mb-2 text-xs">
                      <span className="font-bold flex items-center space-x-1 font-mono uppercase text-[10px]">
                        <Calendar className="h-3 w-3 text-indigo-400" />
                        <span>{log.date}</span>
                      </span>
                      <span className="opacity-75 italic font-medium pr-1">" {log.mood} "</span>
                      <div className="flex space-x-2 font-mono text-[9px] uppercase font-bold">
                        <span>Energy: <b className="text-amber-500">{log.energy}/5</b></span>
                        <span>Focus: <b className="text-sky-400">{log.focus}/5</b></span>
                      </div>
                    </div>

                    {/* Content lists */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] leading-tight pt-1">
                      <div>
                        <span className="text-[9px] uppercase tracking-widest opacity-60 block mb-1 font-bold text-emerald-500">
                          ✓ Completed
                        </span>
                        <p className="opacity-80 font-medium">{log.whatGotDone}</p>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-widest opacity-60 block mb-1 font-bold text-rose-500">
                          ⚠ Postponed
                        </span>
                        <p className="opacity-80 font-medium">{log.whatGotDelayed || 'None'}</p>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-widest opacity-60 block mb-1 font-bold text-indigo-500">
                          ↳ Next Day Plan
                        </span>
                        <p className="opacity-80 font-medium">{log.tomorrowPlan}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
