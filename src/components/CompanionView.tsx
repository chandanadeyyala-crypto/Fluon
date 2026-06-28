/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { CompanionMessage, Settings, Task } from '../types';
import { Send, Sparkles, Heart, Brain, Calendar, ShieldAlert, Coffee } from 'lucide-react';
import ThinkingCard from './ThinkingCard';

interface CompanionViewProps {
  messages: CompanionMessage[];
  settings: Settings;
  tasks: Task[];
  onSendMessage: (text: string, mode?: string) => void;
  onClearHistory: () => void;
  suggestedActions?: { type: string; label: string; taskId?: string }[];
  onExecuteAction?: (action: { type: string; label: string; taskId?: string }) => void;
  loading?: boolean;
}

export default function CompanionView({ 
  messages, 
  settings, 
  tasks, 
  onSendMessage, 
  onClearHistory,
  suggestedActions = [],
  onExecuteAction,
  loading = false
}: CompanionViewProps) {
  const isDark = settings.theme === 'dark';
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  // Canned mode responses (calm, empathetic, action-oriented)
  const quickModes = [
    { 
      label: 'Pep talk', 
      icon: Heart, 
      color: 'text-rose-400',
      prompt: "Give me a quick pep talk. I am feeling discouraged about my deadlines." 
    },
    { 
      label: 'Clear my mind', 
      icon: Brain, 
      color: 'text-teal-400',
      prompt: "Help me clear my mind. I feel scattered and do not know where to look." 
    },
    { 
      label: 'Plan my day', 
      icon: Calendar, 
      color: 'text-indigo-400',
      prompt: "Help me plan my day around my active commitments." 
    },
    { 
      label: 'Recovery mode', 
      icon: ShieldAlert, 
      color: 'text-amber-400',
      prompt: "I missed a task/deadline. How do I recover without slipping into burnout?" 
    },
    { 
      label: 'I feel overwhelmed', 
      icon: Coffee, 
      color: 'text-sky-400',
      prompt: "I feel completely overwhelmed. What is the emergency reset?" 
    },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[480px]">
      {/* View Header */}
      <header className="mb-6 flex justify-between items-end">
        <div>
          <p className="text-xs opacity-50 uppercase tracking-widest mb-1 font-semibold font-mono">ASSISTANT</p>
          <h1 className="text-2xl font-light tracking-tight">
            AI <span className="font-semibold">Assistant</span>
          </h1>
        </div>
        <button 
          onClick={onClearHistory}
          className="text-[10px] font-mono opacity-50 hover:opacity-100 uppercase tracking-wider underline"
        >
          Reset Session
        </button>
      </header>

      {/* Quick Interactive Modes (Compact Pills) */}
      <div className="flex flex-wrap gap-2 mb-4">
        {quickModes.map(mode => {
          const Icon = mode.icon;
          return (
            <button
              key={mode.label}
              onClick={() => onSendMessage(mode.prompt, mode.label)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                isDark 
                  ? 'bg-black border-white/10 text-white hover:bg-white/5' 
                  : 'bg-white border-[#00000010] text-black hover:bg-[#F2FFFF]'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${mode.color}`} />
              <span>{mode.label}</span>
            </button>
          );
        })}
      </div>

      {/* Chat Messages Log */}
      <div 
        className={`flex-1 overflow-y-auto p-6 rounded-xl border mb-4 space-y-4 ${
          isDark ? 'bg-[#000000] border-white/10 text-white' : 'bg-white border-[#00000008] text-black'
        }`}
      >
        {messages.map(msg => {
          const isUser = msg.sender === 'user';
          return (
            <div 
              key={msg.id} 
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-xl p-4 text-xs leading-relaxed space-y-1.5 ${
                  isUser 
                    ? isDark 
                      ? 'bg-[#FFFFFF] text-[#000000] font-semibold' 
                      : 'bg-[#000000] text-[#FFFFFF]'
                    : isDark 
                      ? 'bg-[#FFFFFF10] text-[#F2FFFF] border border-white/5' 
                      : 'bg-[#F2FFFF] text-[#000000] border border-[#00000005]'
                }`}
              >
                {msg.mode && (
                  <span className={`block font-mono text-[9px] uppercase tracking-widest opacity-60 font-bold mb-1 ${
                    isUser ? 'text-[#00000099]' : 'text-[#00000088] dark:text-[#F2FFFF88]'
                  }`}>
                    ✦ Mode: {msg.mode}
                  </span>
                )}
                <p className="whitespace-pre-wrap">{stripHtml(msg.text)}</p>
                <span className="block text-[8px] font-mono opacity-40 text-right uppercase">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex justify-start">
            <ThinkingCard isDark={isDark} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Proactive Action Suggestions */}
      {suggestedActions && suggestedActions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 animate-fade-in items-center">
          <span className="text-[10px] uppercase tracking-wider opacity-50 font-semibold mr-1">Suggestions:</span>
          {suggestedActions.map((action, idx) => (
            <button
              key={`${action.type}-${idx}`}
              onClick={() => onExecuteAction && onExecuteAction(action)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                isDark
                  ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20'
                  : 'bg-indigo-50 border-indigo-100 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              ✦ {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSend} className="flex items-center space-x-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask how to tackle a task, plan a timeline, or find focus..."
          className={`flex-1 p-3 rounded-xl border text-xs focus:outline-none focus:ring-1 ${
            isDark 
              ? 'bg-[#000000] border-white/10 text-[#F2FFFF] focus:ring-white' 
              : 'bg-white border-[#00000015] text-black focus:ring-black'
          }`}
        />
        <button
          type="submit"
          className={`p-3 rounded-xl transition-all ${
            isDark ? 'bg-white text-black hover:opacity-90' : 'bg-black text-white hover:opacity-90'
          }`}
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
