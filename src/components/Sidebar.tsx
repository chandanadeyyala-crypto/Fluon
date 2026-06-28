/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings } from '../types';
import { 
  Home, CheckSquare, Target, Sparkles, BookOpen, 
  Calendar, Share2, Settings as GearIcon, Menu, X, ChevronLeft, ChevronRight, Moon, Sun, LogOut 
} from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onNavigate: (pageId: string) => void;
  settings: Settings;
  onToggleTheme: () => void;
  onLogout?: () => void;
  isDemoMode?: boolean;
}

export default function Sidebar({ activePage, onNavigate, settings, onToggleTheme, onLogout, isDemoMode }: SidebarProps) {
  const isDark = settings.theme === 'dark';
  
  // Collapse sidebar on desktop
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Hamburger drawer for mobile
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'goals', label: 'Roadmap', icon: Target },
    { id: 'companion', label: 'Assistant', icon: Sparkles },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'memory', label: 'Memory Graph', icon: Share2 },
    { id: 'settings', label: 'Settings', icon: GearIcon },
  ];

  const handleMenuClick = (id: string) => {
    onNavigate(id);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* 1. Mobile Header bar */}
      <header className={`lg:hidden flex items-center justify-between p-3 border-b ${
        isDark ? 'bg-[#000000] border-white/10 text-white' : 'bg-[#FFFFFF] border-[#00000015] text-black'
      } sticky top-0 z-50`}>
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isDark ? 'bg-[#FFFFFF]' : 'bg-[#000000]'
          }`}>
            <div className={`w-3 h-3 border-2 rotate-45 ${
              isDark ? 'border-[#000000]' : 'border-[#F2FFFF]'
            }`}></div>
          </div>
          <span className="font-bold text-lg tracking-tight uppercase">Fluon</span>
          {isDemoMode && (
            <span className="ml-2 text-[8px] uppercase tracking-wider font-bold bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded">
              Demo
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={onToggleTheme}
            className="p-1.5 rounded hover:bg-slate-500/10 transition-all"
            title="Toggle Theme"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-800" />}
          </button>
          <button 
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-1.5 rounded hover:bg-slate-500/10 transition-all"
            aria-label="Toggle navigation menu"
          >
            {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* 2. Mobile Nav Drawer Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* 3. Navigation Drawer (Mobile sliding & Desktop fixed) */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 lg:sticky lg:top-0 lg:h-screen transition-all duration-300 border-r
        ${isDark ? 'bg-[#000000] border-white/10 text-[#F2FFFF]' : 'bg-[#FFFFFF] border-[#00000015] text-black'}
        ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-16' : 'lg:w-60'}
      `}>
        <div className="flex flex-col h-full justify-between">
          
          <div>
            {/* Sidebar Logo Header (only visible on desktop) */}
            <div className="hidden lg:flex items-center justify-between p-6">
              {!isCollapsed ? (
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isDark ? 'bg-[#FFFFFF]' : 'bg-[#000000]'
                  }`}>
                    <div className={`w-3 h-3 border-2 rotate-45 ${
                      isDark ? 'border-[#000000]' : 'border-[#F2FFFF]'
                    }`}></div>
                  </div>
                  <span className="font-bold text-xl tracking-tight uppercase">Fluon</span>
                  {isDemoMode && (
                    <span className="ml-2 text-[8px] uppercase tracking-wider font-bold bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded">
                      Demo
                    </span>
                  )}
                </div>
              ) : (
                <div className={`w-8 h-8 mx-auto rounded-lg flex items-center justify-center ${
                  isDark ? 'bg-[#FFFFFF]' : 'bg-[#000000]'
                }`}>
                  <div className={`w-3 h-3 border-2 rotate-45 ${
                    isDark ? 'border-[#000000]' : 'border-[#F2FFFF]'
                  }`}></div>
                </div>
              )}

              {/* Desktop Collapse Toggle */}
              {!isCollapsed ? (
                <button 
                  onClick={() => setIsCollapsed(true)}
                  className="p-1 rounded hover:bg-slate-500/10 transition-all opacity-40 hover:opacity-100"
                  title="Collapse Menu"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              ) : (
                <button 
                  onClick={() => setIsCollapsed(false)}
                  className="p-1 mx-auto rounded hover:bg-slate-500/10 transition-all opacity-40 hover:opacity-100"
                  title="Expand Menu"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Menu Items Link list */}
            <nav className="flex-1 px-4 py-2 space-y-1">
              {menuItems.map(item => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs transition-all font-medium border-l-2 ${
                      isActive 
                        ? isDark 
                          ? 'bg-[#FFFFFF] text-[#000000] font-bold border-[#F2FFFF]' 
                          : 'bg-[#F2FFFF] text-[#000000] font-bold border-[#000000]' 
                        : isDark
                          ? 'border-transparent text-[#F2FFFF] opacity-60 hover:opacity-100'
                          : 'border-transparent text-black opacity-60 hover:opacity-100'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                    title={item.label}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {(!isCollapsed || isMobileOpen) && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom controls / profile section */}
          <div className="p-4 border-t border-[#00000010] space-y-2">
            {/* Quick theme toggle (desktop only) */}
            <button 
              onClick={onToggleTheme}
              className={`hidden lg:flex items-center gap-3 w-full px-3 py-2 rounded-md text-xs transition-all opacity-60 hover:opacity-100 ${
                isDark ? 'text-[#F2FFFF]' : 'text-black'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              {isDark ? (
                <>
                  <Sun className="h-4 w-4 text-amber-400 shrink-0" />
                  {!isCollapsed && <span>Light Mode</span>}
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-slate-800 shrink-0" />
                  {!isCollapsed && <span>Dark Mode</span>}
                </>
              )}
            </button>

            {/* User Profile quick summary at the bottom */}
            <div className={`flex items-center justify-between gap-2 px-1 py-2 ${isCollapsed ? 'flex-col items-center' : ''}`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-xs shrink-0 text-white border border-indigo-600/20">
                  {settings.displayName?.charAt(0) || 'A'}
                </div>
                {(!isCollapsed || isMobileOpen) && (
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider truncate">{settings.displayName || 'Alex Rivera'}</p>
                    <span className="text-[9px] font-mono opacity-50 truncate block uppercase">Stable state</span>
                  </div>
                )}
              </div>
              {onLogout && (!isCollapsed || isMobileOpen) && (
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-500 transition-all shrink-0"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

        </div>
      </aside>
    </>
  );
}
