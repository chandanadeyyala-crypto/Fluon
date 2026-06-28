/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Task, Goal, JournalLog, CompanionMessage, Settings } from './types';
import { INITIAL_MESSAGES, DEFAULT_SETTINGS, INITIAL_TASKS, INITIAL_GOALS, INITIAL_JOURNAL } from './data';
import Sidebar from './components/Sidebar';
import HomeView from './components/HomeView';
import TasksView from './components/TasksView';
import GoalsView from './components/GoalsView';
import CompanionView from './components/CompanionView';
import AccountabilityView from './components/AccountabilityView';
import CalendarView from './components/CalendarView';
import MemoryGraphView from './components/MemoryGraphView';
import SettingsView from './components/SettingsView';
import Walkthrough from './components/Walkthrough';
import NotificationsPanel from './components/NotificationsPanel';
import AuthView from './components/AuthView';
import { auth, onAuthStateChanged, signOut } from './lib/firebase';
import { 
  fetchUserWorkspace, 
  syncTask, 
  unsyncTask, 
  syncGoal, 
  unsyncGoal, 
  syncLog, 
  syncMessage, 
  syncSettings,
  provisionStarterDataset
} from './lib/db';
import { AlertCircle, X, Loader2, Bell } from 'lucide-react';

export default function App() {
  // A. Firebase Auth States
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // B. Core App States
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [logs, setLogs] = useState<JournalLog[]>([]);
  const [messages, setMessages] = useState<CompanionMessage[]>(INITIAL_MESSAGES);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  // C. New AI-Driven Agentic States
  const [generatingRoadmapId, setGeneratingRoadmapId] = useState<string | null>(null);
  const [analyzingWorkload, setAnalyzingWorkload] = useState(false);
  const [burnoutRisk, setBurnoutRisk] = useState<'low' | 'medium' | 'high'>('low');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recoveryTips, setRecoveryTips] = useState<string[]>([]);
  const [companionLoading, setCompanionLoading] = useState(false);
  
  const [adaptiveProposals, setAdaptiveProposals] = useState<any[]>([]);
  const [checkingAdaptiveSchedule, setCheckingAdaptiveSchedule] = useState(false);
  
  const [dailyPlan, setDailyPlan] = useState<any[]>([]);
  const [generatingDailyPlan, setGeneratingDailyPlan] = useState(false);
  
  const [smartNotifications, setSmartNotifications] = useState<any[]>([]);
  const [loadingSmartNotifications, setLoadingSmartNotifications] = useState(false);
  
  const [activeSuggestedActions, setActiveSuggestedActions] = useState<any[]>([]);
  const [journalAnalysis, setJournalAnalysis] = useState<any>(null);
  const [analyzingJournal, setAnalyzingJournal] = useState(false);
  
  const [discoveredLinks, setDiscoveredLinks] = useState<any[]>([]);
  const [discoveringLinks, setDiscoveringLinks] = useState(false);

  const [activePage, setActivePage] = useState<string>(() => {
    const saved = localStorage.getItem('fluon_active_page');
    return saved || 'home';
  });

  const [showWalkthrough, setShowWalkthrough] = useState<boolean>(() => {
    const saved = localStorage.getItem('fluon_show_walkthrough');
    return saved === null ? true : JSON.parse(saved);
  });
  const [showNotifications, setShowNotifications] = useState(false);

  const [returningBannerVisible, setReturningBannerVisible] = useState(true);
  const [provisioning, setProvisioning] = useState(false);

  const handleProvisionStarter = async () => {
    if (!user) return;
    setProvisioning(true);
    try {
      const data = await provisionStarterDataset(user.uid);
      setTasks(data.tasks);
      setGoals(data.goals);
      setLogs(data.logs);
      setMessages(data.messages);
    } catch (err) {
      console.error("Failed to provision starter dataset:", err);
    } finally {
      setProvisioning(false);
    }
  };

  // central orchestrator for workload analysis, prioritization & burnout detection
  const recalculateAIAnalysis = async (currentTasks = tasks, currentGoals = goals, currentLogs = logs) => {
    if (currentTasks.length === 0) return;
    setAnalyzingWorkload(true);
    try {
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: currentTasks,
          goals: currentGoals,
          logs: currentLogs,
          personality: settings.personality
        })
      });
      const data = await response.json();
      if (data.burnoutRisk) {
        setBurnoutRisk(data.burnoutRisk as any);
      }
      if (data.suggestions) {
        setSuggestions(data.suggestions);
      }
      if (data.recoveryTips) {
        setRecoveryTips(data.recoveryTips);
      }

      // Update tasks priority & explanations if returned
      if (data.priorities) {
        setTasks(prev => {
          const updated = prev.map(t => {
            const calculated = data.priorities[t.id];
            if (calculated) {
              return {
                ...t,
                priority: calculated.priority as 'low' | 'medium' | 'high',
                priorityExplanation: calculated.explanation,
                burnoutRisk: data.burnoutRisk === 'high' ? 'high' : data.burnoutRisk === 'medium' ? 'medium' : 'low' as any
              };
            }
            return t;
          });
          // Also sync to DB if user is logged in
          if (user) {
            updated.forEach(async (u) => {
              await syncTask(user.uid, u);
            });
          }
          return updated;
        });
      }
    } catch (err) {
      console.error("Failed to run dynamic prioritization:", err);
    } finally {
      setAnalyzingWorkload(false);
    }
  };

  // Adaptive scheduling trigger for missed deadlines
  const checkAdaptiveScheduling = async (currentTasks = tasks, currentGoals = goals) => {
    const todayStr = '2026-06-28';
    const overduePending = currentTasks.filter(t => t.status === 'pending' && t.deadline < todayStr);
    if (overduePending.length === 0) {
      setAdaptiveProposals([]);
      return;
    }

    setCheckingAdaptiveSchedule(true);
    try {
      const response = await fetch('/api/gemini/adaptive-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: currentTasks, goals: currentGoals })
      });
      const data = await response.json();
      if (data.proposals) {
        setAdaptiveProposals(data.proposals);
      }
    } catch (err) {
      console.error("Adaptive Scheduling Error:", err);
    } finally {
      setCheckingAdaptiveSchedule(false);
    }
  };

  const handleApplyAdaptiveProposals = async () => {
    if (adaptiveProposals.length === 0) return;
    
    setTasks(prev => {
      const updated = prev.map(t => {
        const prop = adaptiveProposals.find(p => p.taskId === t.id);
        if (prop) {
          return {
            ...t,
            deadline: prop.proposedDeadline,
            priorityExplanation: `Adjusted schedule: ${prop.reason}`
          };
        }
        return t;
      });
      
      if (user) {
        updated.forEach(async (u) => {
          const prop = adaptiveProposals.find(p => p.taskId === u.id);
          if (prop) {
            await syncTask(user.uid, u);
          }
        });
      }
      return updated;
    });

    setAdaptiveProposals([]);
  };

  // Daily planning helper
  const handleGenerateDailyPlan = async () => {
    setGeneratingDailyPlan(true);
    try {
      const response = await fetch('/api/gemini/daily-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks, goals, logs })
      });
      const data = await response.json();
      if (data.plan) {
        setDailyPlan(data.plan);
      }
    } catch (err) {
      console.error("Daily Plan generation error:", err);
    } finally {
      setGeneratingDailyPlan(false);
    }
  };

  // Smart notification manager
  const fetchSmartNotifications = async () => {
    setLoadingSmartNotifications(true);
    try {
      const response = await fetch('/api/gemini/smart-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks, goals, settings })
      });
      const data = await response.json();
      if (data.notifications) {
        setSmartNotifications(data.notifications);
      }
    } catch (err) {
      console.error("Failed to fetch smart notifications:", err);
    } finally {
      setLoadingSmartNotifications(false);
    }
  };

  // Long-term journal intelligence analyzer
  const handleAnalyzeJournal = async () => {
    if (logs.length === 0) return;
    setAnalyzingJournal(true);
    try {
      const response = await fetch('/api/gemini/analyze-journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs })
      });
      const data = await response.json();
      setJournalAnalysis(data);
    } catch (err) {
      console.error("Failed to analyze journal logs:", err);
    } finally {
      setAnalyzingJournal(false);
    }
  };

  // Association graph connector
  const handleDiscoverLinks = async () => {
    setDiscoveringLinks(true);
    try {
      const response = await fetch('/api/gemini/discover-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks, goals })
      });
      const data = await response.json();
      if (data.suggestedLinks) {
        setDiscoveredLinks(data.suggestedLinks);
      }
    } catch (err) {
      console.error("Failed to discover links:", err);
    } finally {
      setDiscoveringLinks(false);
    }
  };

  const handleAcceptLink = (link: { source: string; target: string }) => {
    // Save locally or trigger association visual alerts
    setDiscoveredLinks(prev => prev.filter(l => !(l.source === link.source && l.target === link.target)));
  };

  const handleExecuteAction = async (action: { type: string; label: string; taskId?: string }) => {
    // Clear dynamic helper
    setActiveSuggestedActions([]);

    if (action.type === 'take_break') {
      alert(`Break mode activated: ${action.label}. Mindfully step away from the screen for 5-10 minutes.`);
    } else if (action.type === 'start_task' && action.taskId) {
      const task = tasks.find(t => t.id === action.taskId);
      if (task) {
        alert(`Starting Task: "${task.title}". Focusing entirely on this block.`);
      }
    } else if (action.type === 'finish_first') {
      const highestPriority = tasks.find(t => t.status === 'pending' && t.priority === 'high');
      if (highestPriority) {
        alert(`Next best task to focus: "${highestPriority.title}".`);
      }
    } else if (action.type === 'split_task' && action.taskId) {
      const parentTask = tasks.find(t => t.id === action.taskId);
      if (parentTask) {
        const subtask1: Task = {
          id: `task-split-1-${Date.now()}`,
          title: `[Split 1/2] ${parentTask.title} - Set Foundations`,
          deadline: parentTask.deadline,
          priority: 'medium',
          status: 'pending',
          linkedGoalId: parentTask.linkedGoalId,
          notificationLevel: parentTask.notificationLevel,
          burnoutRisk: 'low',
          createdAt: new Date().toISOString().split('T')[0],
          priorityExplanation: `Split from: ${parentTask.title}`
        };
        const subtask2: Task = {
          id: `task-split-2-${Date.now()}`,
          title: `[Split 2/2] ${parentTask.title} - Execute & Wrap`,
          deadline: parentTask.deadline,
          priority: 'medium',
          status: 'pending',
          linkedGoalId: parentTask.linkedGoalId,
          notificationLevel: parentTask.notificationLevel,
          burnoutRisk: 'low',
          createdAt: new Date().toISOString().split('T')[0],
          priorityExplanation: `Split from: ${parentTask.title}`
        };

        setTasks(prev => [subtask1, subtask2, ...prev.filter(t => t.id !== parentTask.id)]);
        if (user) {
          await unsyncTask(user.uid, parentTask.id);
          await syncTask(user.uid, subtask1);
          await syncTask(user.uid, subtask2);
        }
        alert(`Successfully split task "${parentTask.title}" into two separate, manageable portions!`);
      }
    } else if (action.type === 'move_deadline' && action.taskId) {
      setActivePage('tasks');
      alert(`Reviewing reschedule proposals for your commitments.`);
    } else if (action.type === 'task_suggestion') {
      alert(`Action Plan: "${action.label}". Let's take a progressive step towards this right now.`);
    }
  };

  // 1. Firebase Auth Listener & Workspace Loader
  useEffect(() => {
    if (isDemoMode) {
      setTasks(INITIAL_TASKS);
      setGoals(INITIAL_GOALS);
      setLogs(INITIAL_JOURNAL);
      setMessages(INITIAL_MESSAGES);
      setSettings(DEFAULT_SETTINGS);
      setAuthLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setAuthLoading(true);
      if (currentUser) {
        setUser(currentUser);
        try {
          const workspace = await fetchUserWorkspace(currentUser.uid);
          setSettings(workspace.settings);
          setTasks(workspace.tasks);
          setGoals(workspace.goals);
          setLogs(workspace.logs);
          setMessages(workspace.messages);
        } catch (err) {
          console.error("Failed to load user workspace data:", err);
        } finally {
          setAuthLoading(false);
        }
      } else {
        setUser(null);
        setTasks([]);
        setGoals([]);
        setLogs([]);
        setMessages(INITIAL_MESSAGES);
        setSettings(DEFAULT_SETTINGS);
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, [isDemoMode]);

  // Trigger automated AI updates when client telemetry state scales
  useEffect(() => {
    if (tasks.length > 0) {
      recalculateAIAnalysis(tasks, goals, logs);
      checkAdaptiveScheduling(tasks, goals);
      fetchSmartNotifications();
    }
  }, [tasks.length, goals.length, logs.length]);

  // 2. Local State fallbacks for page indexes & walkthroughs
  useEffect(() => {
    localStorage.setItem('fluon_active_page', activePage);
  }, [activePage]);

  useEffect(() => {
    localStorage.setItem('fluon_show_walkthrough', JSON.stringify(showWalkthrough));
  }, [showWalkthrough]);

  // Logout Handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign Out Error:", err);
    }
  };

  // 3. Task & Commitment Actions
  const handleAddTask = async (newTask: Omit<Task, 'id' | 'createdAt'>) => {
    const taskItem: Task = {
      ...newTask,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTasks(prev => [taskItem, ...prev]);
    if (user) {
      await syncTask(user.uid, taskItem);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (user) {
      await unsyncTask(user.uid, taskId);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    let updatedTask: Task | undefined;
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        updatedTask = { 
          ...t, 
          status: t.status === 'completed' ? 'pending' : 'completed' 
        };
        return updatedTask;
      }
      return t;
    }));
    if (user && updatedTask) {
      await syncTask(user.uid, updatedTask);
    }
  };

  // 4. Goal & Roadmap Actions
  const handleAddGoal = async (newGoal: Omit<Goal, 'id'>) => {
    const goalItem: Goal = {
      ...newGoal,
      id: `goal-${Date.now()}`
    };
    setGoals(prev => [goalItem, ...prev]);
    if (user) {
      await syncGoal(user.uid, goalItem);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
    // Remove linkages in tasks too
    setTasks(prev => prev.map(t => t.linkedGoalId === goalId ? { ...t, linkedGoalId: undefined } : t));
    if (user) {
      await unsyncGoal(user.uid, goalId);
      // Let's also sync updated tasks that had this goal ID link
      tasks.forEach(async (t) => {
        if (t.linkedGoalId === goalId) {
          await syncTask(user.uid, { ...t, linkedGoalId: undefined });
        }
      });
    }
  };

  const handleToggleMilestone = async (goalId: string, milestoneId: string) => {
    let updatedGoal: Goal | undefined;
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      updatedGoal = {
        ...g,
        milestones: g.milestones.map(m => m.id === milestoneId ? { ...m, completed: !m.completed } : m)
      };
      return updatedGoal;
    }));
    if (user && updatedGoal) {
      await syncGoal(user.uid, updatedGoal);
    }
  };

  const handleGenerateRoadmap = async (goalId: string) => {
    const targetGoal = goals.find(g => g.id === goalId);
    if (!targetGoal) return;

    setGeneratingRoadmapId(goalId);
    try {
      const response = await fetch('/api/gemini/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalTitle: targetGoal.title,
          goalDescription: targetGoal.description,
          goalDeadline: targetGoal.deadline,
          personality: settings.personality
        })
      });
      const data = await response.json();
      
      const milestonesWithIds = (data.milestones || []).map((m: any, idx: number) => ({
        id: `m-${goalId}-${idx}-${Date.now()}`,
        title: m.title,
        completed: false,
        dueDate: m.dueDate
      }));

      const finalGoal = { ...targetGoal, milestones: milestonesWithIds };
      setGoals(prev => prev.map(g => g.id === goalId ? finalGoal : g));
      if (user) {
        await syncGoal(user.uid, finalGoal);
      }

      // Add actionable tasks if any are generated!
      if (data.tasks && data.tasks.length > 0) {
        const addedTasks: Task[] = [];
        for (const t of data.tasks) {
          const taskItem: Task = {
            id: `task-roadmap-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            title: t.title,
            deadline: t.deadline,
            priority: t.priority as 'high' | 'medium' | 'low',
            status: 'pending',
            linkedGoalId: goalId,
            notificationLevel: 3,
            burnoutRisk: 'low',
            createdAt: new Date().toISOString().split('T')[0],
            priorityExplanation: `Generated by AI Roadmap for goal: "${targetGoal.title}"`
          };
          addedTasks.push(taskItem);
        }
        setTasks(prev => [...addedTasks, ...prev]);
        if (user) {
          for (const item of addedTasks) {
            await syncTask(user.uid, item);
          }
        }
      }
    } catch (err) {
      console.error("Failed to generate AI roadmap:", err);
    } finally {
      setGeneratingRoadmapId(null);
    }
  };

  // 5. Accountability / Journal Actions
  const handleAddLog = async (newLog: Omit<JournalLog, 'id'>) => {
    const logItem: JournalLog = {
      ...newLog,
      id: `log-${Date.now()}`
    };
    setLogs(prev => [logItem, ...prev]);
    if (user) {
      await syncLog(user.uid, logItem);
    }
  };

  // 6. Settings Actions
  const handleUpdateSettings = async (newSettings: Partial<Settings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      if (user) {
        syncSettings(user.uid, updated);
      }
      return updated;
    });
  };

  const handleToggleTheme = () => {
    setSettings(prev => {
      const updated = { ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' };
      if (user) {
        syncSettings(user.uid, updated);
      }
      return updated;
    });
  };

  // 7. Companion Chat Actions
  const handleSendMessage = async (text: string, mode?: string) => {
    const userMsg: CompanionMessage = {
      id: `msg-${Date.now()}`,
      text,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode
    };

    setMessages(prev => [...prev, userMsg]);
    if (user) {
      await syncMessage(user.uid, userMsg);
    }

    setCompanionLoading(true);

    try {
      const response = await fetch('/api/ai/companion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.map(m => ({
            sender: m.sender,
            text: m.text
          })),
          mode: mode || "chat",
          personality: settings.personality || 'friendly',
          userId: user?.uid || 'anonymous',
          context: {
            tasks,
            goals,
            logs: logs.slice(0, 5),
            settings
          }
        })
      });
      const data = await response.json();
      
      const assistantMsg: CompanionMessage = {
        id: `msg-${Date.now() + 1}`,
        text: data.reply || "I am right here with you. Let's take it one step at a time.",
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: mode || "chat"
      };

      setMessages(prev => [...prev, assistantMsg]);
      if (user) {
        await syncMessage(user.uid, assistantMsg);
      }

      let combinedActions = [...(data.suggestedActions || [])];
      if (data.taskSuggestions && data.taskSuggestions.length > 0) {
        data.taskSuggestions.forEach((suggestion: string) => {
          combinedActions.push({
            type: "task_suggestion",
            label: suggestion
          });
        });
      }

      setActiveSuggestedActions(combinedActions);
    } catch (err) {
      console.error("Gemini Companion API call failed:", err);
      const fallbackMsg: CompanionMessage = {
        id: `msg-${Date.now() + 1}`,
        text: "I'm having trouble replying right now. Try again in a moment.",
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setCompanionLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'msg-default',
        text: "Session reset. I am ready to help you navigate deadlines and manage burnout. What's on your mind?",
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setActiveSuggestedActions([]);
  };

  // 8. Dynamic Page Rendering Switch
  const renderActivePage = () => {
    switch (activePage) {
      case 'home':
        return (
          <HomeView 
            tasks={tasks} 
            goals={goals} 
            settings={settings} 
            onNavigate={setActivePage} 
            onToggleTask={handleToggleTask}
            onAddStarterTasks={handleProvisionStarter}
            isProvisioning={provisioning}
            burnoutRisk={burnoutRisk}
            suggestions={suggestions}
            recoveryTips={recoveryTips}
            analyzingWorkload={analyzingWorkload}
            onRecalculatePriorities={() => recalculateAIAnalysis()}
            smartNotifications={smartNotifications}
            loadingSmartNotifications={loadingSmartNotifications}
            onFetchSmartNotifications={fetchSmartNotifications}
            adaptiveProposals={adaptiveProposals}
            checkingAdaptiveSchedule={checkingAdaptiveSchedule}
            onApplyAdaptiveProposals={handleApplyAdaptiveProposals}
            onCheckAdaptiveScheduling={() => checkAdaptiveScheduling()}
            dailyPlan={dailyPlan}
            generatingDailyPlan={generatingDailyPlan}
            onGenerateDailyPlan={handleGenerateDailyPlan}
          />
        );
      case 'tasks':
        return (
          <TasksView 
            tasks={tasks} 
            goals={goals} 
            settings={settings} 
            onAddTask={handleAddTask} 
            onDeleteTask={handleDeleteTask} 
            onToggleTask={handleToggleTask}
            onAddStarterTasks={handleProvisionStarter}
            isProvisioning={provisioning}
            analyzingWorkload={analyzingWorkload}
            burnoutRisk={burnoutRisk}
            onRecalculatePriorities={() => recalculateAIAnalysis()}
            adaptiveProposals={adaptiveProposals}
            checkingAdaptiveSchedule={checkingAdaptiveSchedule}
            onApplyAdaptiveProposals={handleApplyAdaptiveProposals}
            onCheckAdaptiveScheduling={() => checkAdaptiveScheduling()}
          />
        );
      case 'goals':
        return (
          <GoalsView 
            goals={goals} 
            settings={settings} 
            onAddGoal={handleAddGoal} 
            onDeleteGoal={handleDeleteGoal} 
            onToggleMilestone={handleToggleMilestone} 
            onGenerateRoadmap={handleGenerateRoadmap}
            onAddStarterTasks={handleProvisionStarter}
            isProvisioning={provisioning}
            generatingRoadmapId={generatingRoadmapId}
          />
        );
      case 'companion':
        return (
          <CompanionView 
            messages={messages} 
            settings={settings} 
            tasks={tasks}
            onSendMessage={handleSendMessage} 
            onClearHistory={handleClearHistory}
            suggestedActions={activeSuggestedActions}
            onExecuteAction={handleExecuteAction}
            loading={companionLoading}
          />
        );
      case 'journal':
        return (
          <AccountabilityView 
            logs={logs} 
            settings={settings} 
            onAddLog={handleAddLog} 
            journalAnalysis={journalAnalysis}
            analyzingJournal={analyzingJournal}
            onAnalyzeJournal={handleAnalyzeJournal}
          />
        );
      case 'calendar':
        return (
          <CalendarView 
            tasks={tasks} 
            goals={goals} 
            settings={settings} 
            dailyPlan={dailyPlan}
            generatingDailyPlan={generatingDailyPlan}
            onGenerateDailyPlan={handleGenerateDailyPlan}
          />
        );
      case 'memory':
        return (
          <MemoryGraphView 
            settings={settings} 
            tasks={tasks}
            goals={goals}
            discoveredLinks={discoveredLinks}
            discoveringLinks={discoveringLinks}
            onDiscoverLinks={handleDiscoverLinks}
            onAcceptLink={handleAcceptLink}
          />
        );
      case 'settings':
        return (
          <SettingsView 
            settings={settings} 
            onUpdateSettings={handleUpdateSettings} 
            userEmail={user?.email || "chandanasravyasrideyyala@gmail.com"}
            onLogout={handleLogout}
          />
        );
      default:
        return <div className="text-xs font-mono opacity-60">Section not found.</div>;
    }
  };

  // Theme checking
  const isDark = settings.theme === 'dark';

  // Render Full Page Loading Shell
  if (authLoading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-200 ${
        isDark ? 'bg-[#000000] text-white' : 'bg-[#F2FFFF] text-black'
      }`}>
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-xs font-mono opacity-60 uppercase tracking-widest">LOADING SESSION...</p>
        </div>
      </div>
    );
  }

  // Render Auth View if unauthenticated
  if (!user && !isDemoMode) {
    return <AuthView isDark={isDark} onDemoBypass={() => setIsDemoMode(true)} />;
  }

  return (
    <div className={`min-h-screen font-sans flex flex-col lg:flex-row transition-colors duration-200 ${
      isDark 
        ? 'bg-[#000000] text-[#F2FFFF]' 
        : 'bg-[#F2FFFF] text-black'
    }`}>
      
      {/* Sidebar navigation shell */}
      <Sidebar 
        activePage={activePage} 
        onNavigate={setActivePage} 
        settings={settings} 
        onToggleTheme={handleToggleTheme}
        onLogout={() => {
          setIsDemoMode(false);
          handleLogout();
        }}
        isDemoMode={isDemoMode}
      />

      {/* Main Content Pane */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        
        <header className="flex justify-end items-center mb-2">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}>
            <Bell className="h-5 w-5 opacity-75" />
          </button>
          {showNotifications && <NotificationsPanel onClose={() => setShowNotifications(false)} isDark={isDark} />}
        </header>

        {/* Onboarding Walkthrough (Show on demand or on first load) */}
        {showWalkthrough && (
          <Walkthrough 
            settings={settings} 
            tasks={tasks} 
            onCompleteWalkthrough={() => setShowWalkthrough(false)}
            onNavigate={setActivePage}
          />
        )}

        {/* Friendly returning reminder banner (shown dynamically if walkthrough closed) */}
        {!showWalkthrough && returningBannerVisible && tasks.filter(t => t.status === 'pending').length > 0 && (
          <div className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
            isDark 
              ? 'bg-[#2E2757] border-white/10 text-white' 
              : 'bg-white border-black/10 text-black'
          }`}>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-indigo-400 shrink-0" />
              <span>
                <b>Welcome back.</b> You still have <b>{tasks.filter(t => t.status === 'pending').length} pending tasks</b>. Want to review them?
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => {
                  setActivePage('tasks');
                  setReturningBannerVisible(false);
                }}
                className="font-mono text-indigo-400 hover:underline font-semibold"
              >
                Review Tasks
              </button>
              <button 
                onClick={() => setReturningBannerVisible(false)}
                className="opacity-60 hover:opacity-100 p-0.5 rounded"
                aria-label="Dismiss banner"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Dynamic page render slot */}
        <div className="animate-fade-in">
          {renderActivePage()}
        </div>

      </main>
    </div>
  );
}
