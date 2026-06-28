import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

const thinkingMessages = [
  "Understanding your situation...",
  "Looking at your goals...",
  "Reviewing your schedule...",
  "Preparing your plan...",
  "Thinking carefully..."
];

export default function ThinkingCard({ isDark }: { isDark: boolean }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % thinkingMessages.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-xs font-mono animate-pulse ${
      isDark ? 'bg-indigo-950/30 border-indigo-500/20 text-indigo-200' : 'bg-indigo-50 border-indigo-200 text-indigo-800'
    }`}>
      <Sparkles className="h-4 w-4 shrink-0 text-indigo-400" />
      <span className="animate-fade-in">{thinkingMessages[index]}</span>
    </div>
  );
}
