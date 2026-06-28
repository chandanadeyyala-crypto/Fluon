/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Settings } from '../types';
import { User, ShieldCheck, Sparkles, BellRing, Eye, RefreshCw, Settings as GearIcon, Check } from 'lucide-react';

interface SettingsViewProps {
  settings: Settings;
  onUpdateSettings: (newSettings: Partial<Settings>) => void;
  userEmail: string;
  onLogout?: () => void;
}

export default function SettingsView({ settings, onUpdateSettings, userEmail, onLogout }: SettingsViewProps) {
  const isDark = settings.theme === 'dark';

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs opacity-50 uppercase tracking-widest mb-1 font-semibold font-mono">SYSTEM PARAMETERS</p>
          <h1 className="text-2xl font-light tracking-tight">
            System &amp; <span className="font-semibold">Preferences</span>
          </h1>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        
        {/* 1. Google Account Connection Profile */}
        <div className={`p-6 rounded-xl border ${
          isDark ? 'bg-[#000000] border-white/10 text-[#F2FFFF]' : 'bg-white border-[#00000008] text-black'
        }`}>
          <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-[#00000008] dark:border-white/5">
            <User className="h-4 w-4 text-sky-400" />
            <h2 className="text-xs uppercase tracking-wider font-bold">Google Account Connection</h2>
          </div>
          <div className="space-y-4">
            <div className={`p-3 rounded-lg flex items-center justify-between ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
              <div>
                <p className="font-semibold uppercase tracking-wider text-[9px] opacity-60">Linked Email</p>
                <p className="font-mono text-[11px] opacity-75 mt-0.5">{userEmail || 'chandanasravyasrideyyala@gmail.com'}</p>
              </div>
              <span className="bg-emerald-500/10 text-emerald-500 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">
                CONNECTED
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block mb-1 font-semibold uppercase tracking-wider text-[10px] opacity-60">Display Name</label>
                <input
                  type="text"
                  value={settings.displayName}
                  onChange={(e) => onUpdateSettings({ displayName: e.target.value })}
                  className={`w-full p-2.5 rounded-lg border focus:outline-none focus:ring-1 ${
                    isDark 
                      ? 'bg-white/5 border-white/10 text-white focus:ring-white' 
                      : 'bg-slate-50 border-black/10 text-black focus:ring-black'
                  }`}
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold uppercase tracking-wider text-[10px] opacity-60">Personal Profile / About Me</label>
                <textarea
                  value={settings.aboutMe}
                  onChange={(e) => onUpdateSettings({ aboutMe: e.target.value })}
                  rows={2}
                  className={`w-full p-2.5 rounded-lg border focus:outline-none focus:ring-1 ${
                    isDark 
                      ? 'bg-white/5 border-white/10 text-white focus:ring-white' 
                      : 'bg-slate-50 border-black/10 text-black focus:ring-black'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. AI Companion Preferences */}
        <div className={`p-6 rounded-xl border ${
          isDark ? 'bg-[#000000] border-white/10 text-[#F2FFFF]' : 'bg-white border-[#00000008] text-black'
        }`}>
          <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-[#00000008] dark:border-white/5">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <h2 className="text-xs uppercase tracking-wider font-bold">AI Companion Preferences</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block mb-1 font-semibold uppercase tracking-wider text-[10px] opacity-60">System Personality Profile</label>
              <select
                value={settings.personality || 'friendly'}
                onChange={(e) => onUpdateSettings({ personality: e.target.value })}
                className={`w-full p-2.5 rounded-lg border focus:outline-none ${
                  isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-black/10 text-black'
                }`}
              >
                <option value="friendly">Friendly (Warm, Supportive)</option>
                <option value="professional">Professional (Formal, Structured)</option>
                <option value="motivational">Motivational (High Energy, Passionate)</option>
                <option value="calm">Calm (Mindful, Serene)</option>
                <option value="strict">Strict (Discipline, Accountability)</option>
                <option value="student">Student (Peer Study Buddy)</option>
                <option value="minimal">Minimal (Concise, Direct)</option>
              </select>
              <p className="text-[10px] opacity-65 mt-2 leading-relaxed">
                Adapts greetings, reminder tones, notification layouts, and AI feedback across the entire system.
              </p>
            </div>

            <div>
              <label className="block mb-1 font-semibold uppercase tracking-wider text-[10px] opacity-60">Behavior Pattern Tone</label>
              <select
                value={settings.aiBehavior}
                onChange={(e) => onUpdateSettings({ aiBehavior: e.target.value })}
                className={`w-full p-2.5 rounded-lg border focus:outline-none ${
                  isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-black/10 text-black'
                }`}
              >
                <option value="Empathetic and Action-Oriented">Empathetic and Action-Oriented (Calm, Supportive)</option>
                <option value="Direct and Structured">Direct and Structured (Precise, Bulletpoints)</option>
                <option value="Strict Accountability Coach">Strict Accountability Coach (High Pressure, Honest)</option>
                <option value="Gentle/Mindfulness Guide">Gentle/Mindfulness Guide (Deep Breathing, Breaks First)</option>
              </select>
              <p className="text-[10px] opacity-65 mt-2.5 leading-relaxed">
                Tones adapt the AI companion chat messages. "Empathetic" stabilizes anxiety, while "Strict" checks delayed milestones directly.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Customizable Notification Filters */}
        <div className={`p-6 rounded-xl border ${
          isDark ? 'bg-[#000000] border-white/10 text-[#F2FFFF]' : 'bg-white border-[#00000008] text-black'
        }`}>
          <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-[#00000008] dark:border-white/5">
            <BellRing className="h-4 w-4 text-emerald-400" />
            <h2 className="text-xs uppercase tracking-wider font-bold">Notification Controls</h2>
          </div>
          <div className="space-y-3 font-semibold uppercase tracking-wider text-[10px]">
            
            <label className="flex items-start space-x-3 cursor-pointer py-1">
              <input
                type="checkbox"
                checked={settings.notificationLevel1}
                onChange={(e) => onUpdateSettings({ notificationLevel1: e.target.checked })}
                className="mt-0.5 rounded accent-black h-4 w-4"
              />
              <div>
                <span className="font-bold block text-[11px]">Enable Level 1 Notifications</span>
                <span className="opacity-50 text-[10px] font-medium lowercase tracking-normal block mt-0.5">Standard warnings. Dismissible with a single action.</span>
              </div>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer py-1">
              <input
                type="checkbox"
                checked={settings.notificationLevel3}
                onChange={(e) => onUpdateSettings({ notificationLevel3: e.target.checked })}
                className="mt-0.5 rounded accent-black h-4 w-4"
              />
              <div>
                <span className="font-bold block text-[11px] text-rose-500">Enable Level 3 Warning Alerts</span>
                <span className="opacity-50 text-[10px] font-medium lowercase tracking-normal block mt-0.5">Critical risk warnings. Persistent repeated reminders for urgent commitments.</span>
              </div>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer py-1">
              <input
                type="checkbox"
                checked={settings.breakReminders}
                onChange={(e) => onUpdateSettings({ breakReminders: e.target.checked })}
                className="mt-0.5 rounded accent-black h-4 w-4"
              />
              <div>
                <span className="font-bold block text-[11px]">Enable Burnout Break Reminders</span>
                <span className="opacity-50 text-[10px] font-medium lowercase tracking-normal block mt-0.5">Prompts you to take short mental breaks after 2 hours of active screen time.</span>
              </div>
            </label>

          </div>
        </div>

        {/* 4. Display, Theme & Accessibility */}
        <div className={`p-6 rounded-xl border ${
          isDark ? 'bg-[#000000] border-white/10 text-[#F2FFFF]' : 'bg-white border-[#00000008] text-black'
        }`}>
          <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-[#00000008] dark:border-white/5">
            <Eye className="h-4 w-4 text-violet-400" />
            <h2 className="text-xs uppercase tracking-wider font-bold">Theme &amp; Accessibility</h2>
          </div>
          <div className="space-y-4 font-bold uppercase tracking-wider text-[10px]">
            
            {/* Theme Toggle Button */}
            <div>
              <span className="block mb-2 font-bold text-[10px] opacity-65">System Display Mode</span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ theme: 'dark' })}
                  className={`flex-1 py-2 rounded-lg text-center border font-bold text-xs uppercase tracking-wider transition-all ${
                    settings.theme === 'dark'
                      ? 'bg-white text-black border-white'
                      : 'bg-white border-black/10 text-black hover:bg-black/5'
                  }`}
                >
                  Dark Mode
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ theme: 'light' })}
                  className={`flex-1 py-2 rounded-lg text-center border font-bold text-xs uppercase tracking-wider transition-all ${
                    settings.theme === 'light'
                      ? 'bg-black text-white border-black'
                      : 'bg-black/20 border-white/10 text-white hover:bg-white/5'
                  }`}
                >
                  Light Mode
                </button>
              </div>
            </div>

            {/* Accessibility checkboxes */}
            <div className="space-y-2.5 pt-1">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.accessibilityLargeText}
                  onChange={(e) => onUpdateSettings({ accessibilityLargeText: e.target.checked })}
                  className="rounded accent-black h-4 w-4"
                />
                <span className="text-[11px] font-bold">Standardized Accessible Font Scale</span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.accessibilityScreenReader}
                  onChange={(e) => onUpdateSettings({ accessibilityScreenReader: e.target.checked })}
                  className="rounded accent-black h-4 w-4"
                />
                <span className="text-[11px] font-bold">Optimize screen-reader tags (ARIA bindings)</span>
              </label>
            </div>

          </div>
        </div>

        {/* 5. Google Connected Services */}
        <div className={`p-6 rounded-xl border md:col-span-2 ${
          isDark ? 'bg-[#000000] border-white/10 text-[#F2FFFF]' : 'bg-white border-[#00000008] text-black'
        }`}>
          <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-[#00000008] dark:border-white/5">
            <RefreshCw className="h-4 w-4 text-emerald-400" />
            <h2 className="text-xs uppercase tracking-wider font-bold">Connected Services &amp; Permissions</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-bold uppercase tracking-wider text-[10px]">
            
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-black/5'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-[11px]">Google Calendar Sync</span>
                <input
                  type="checkbox"
                  checked={settings.googleCalendarSync}
                  onChange={(e) => onUpdateSettings({ googleCalendarSync: e.target.checked })}
                  className="rounded accent-black h-4 w-4"
                />
              </div>
              <p className="text-[10px] opacity-50 font-medium tracking-normal lowercase block mt-1">Syncs task deadlines with your standard calendar.</p>
            </div>

            <div className={`p-4 rounded-xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-black/5'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-[11px]">Location Services</span>
                <input
                  type="checkbox"
                  checked={settings.locationAccess}
                  onChange={(e) => onUpdateSettings({ locationAccess: e.target.checked })}
                  className="rounded accent-black h-4 w-4"
                />
              </div>
              <p className="text-[10px] opacity-50 font-medium tracking-normal lowercase block mt-1">Enables geo-aware notifications for critical tasks.</p>
            </div>

            <div className={`p-4 rounded-xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-black/5'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-[11px]">Google Sign-In Session</span>
                <input
                  type="checkbox"
                  checked={settings.googleSignIn}
                  onChange={(e) => onUpdateSettings({ googleSignIn: e.target.checked })}
                  className="rounded accent-black h-4 w-4"
                />
              </div>
              <p className="text-[10px] opacity-50 font-medium tracking-normal lowercase block mt-1">Authenticates identity on loading session data.</p>
            </div>

          </div>
        </div>

        {onLogout && (
          <div className="md:col-span-2 flex justify-end">
            <button
              onClick={onLogout}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-widest rounded-lg transition-all shadow-md hover:shadow-red-500/10"
            >
              Sign Out of Fluon
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
