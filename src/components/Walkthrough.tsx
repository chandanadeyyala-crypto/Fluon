/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings, Task } from '../types';
import { Sparkles, ArrowRight, CheckCircle2, ChevronRight, RefreshCcw } from 'lucide-react';

interface WalkthroughProps {
  settings: Settings;
  tasks: Task[];
  onCompleteWalkthrough: () => void;
  onNavigate: (pageId: string) => void;
}

export default function Walkthrough({ settings, tasks, onCompleteWalkthrough, onNavigate }: WalkthroughProps) {
  const isDark = settings.theme === 'dark';
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const pendingCount = tasks.filter(t => t.status === 'pending').length;

  const stepsContent = [
    {
      title: "Meet Fluon: Adaptive Focus Companion",
      desc: "Fluon is engineered for students and professionals who struggle with overwhelming deadlines. It doesn't just passively alert you—it active-plans around your burnout capacity.",
    },
    {
      title: "Stress-Aware Notification Filters",
      desc: "Level 1 notifications trigger standard dismissible cues, while Level 3 warnings persist dynamically for severe risk items (like paying crucial hosting bills or exam reviews) to guarantee action.",
    },
    {
      title: "Restore & Recover Gracefully",
      desc: "Missed a milestone? No guilt. Fluon provides 'Recovery Mode' checklists to quickly adjust dates, manage stakeholder contacts, and adjust schedules to prevent burnout slip.",
    }
  ];

  return (
    <div className={`p-6 rounded-xl border relative overflow-hidden ${
      isDark 
        ? 'bg-[#000000] border-white/10 text-white' 
        : 'bg-white border-[#00000008] text-black'
    }`}>
      
      {/* Onboarding Flow wrapper */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-400">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>System Walkthrough • Step {step} of {totalSteps}</span>
          </div>
          <button 
            onClick={onCompleteWalkthrough}
            className="text-[10px] font-bold uppercase tracking-wider hover:opacity-75 opacity-50"
          >
            Skip Intro
          </button>
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg font-light tracking-tight">
            {stepsContent[step - 1].title}
          </h2>
          <p className="text-xs leading-relaxed opacity-75 font-medium">
            {stepsContent[step - 1].desc}
          </p>
        </div>

        {/* Step dots & buttons */}
        <div className="flex items-center justify-between pt-2">
          {/* Progress Dots */}
          <div className="flex space-x-1.5">
            {[1, 2, 3].map(i => (
              <span 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step === i ? 'bg-indigo-500 w-4' : 'bg-slate-500/30 w-1.5'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center space-x-2">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="text-[10px] font-bold uppercase tracking-wider py-1 px-2.5 hover:opacity-75 opacity-50"
              >
                Back
              </button>
            )}

            {step < totalSteps ? (
              <button
                onClick={() => setStep(step + 1)}
                className={`flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider py-1.5 px-3.5 rounded-lg transition-all ${
                  isDark ? 'bg-[#FFFFFF] text-[#000000] hover:opacity-90' : 'bg-[#000000] text-[#FFFFFF] hover:opacity-90'
                }`}
              >
                <span>Next</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                onClick={onCompleteWalkthrough}
                className="flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider py-1.5 px-3.5 bg-emerald-500 text-white rounded-lg hover:opacity-90 transition-all"
              >
                <span>Get Started</span>
                <CheckCircle2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
