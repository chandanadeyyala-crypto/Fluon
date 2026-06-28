/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Task {
  id: string;
  title: string;
  deadline: string; // YYYY-MM-DD
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  linkedGoalId?: string;
  notificationLevel: 1 | 3;
  burnoutRisk: 'low' | 'medium' | 'high';
  createdAt: string;
  priorityExplanation?: string;
}

export interface RoadmapMilestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: 'active' | 'completed';
  milestones: RoadmapMilestone[];
}

export interface CompanionMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  mode?: string;
  role?: string;
  content?: string;
  createdAt?: string;
  userId?: string;
}

export interface JournalLog {
  id: string;
  date: string; // YYYY-MM-DD
  mood: string;
  energy: number; // 1 to 5
  focus: number; // 1 to 5
  whatGotDone: string;
  whatGotDelayed: string;
  tomorrowPlan: string;
}

export interface Settings {
  displayName: string;
  aboutMe: string;
  aiBehavior: string;
  personality?: string;
  notificationLevel1: boolean;
  notificationLevel3: boolean;
  breakReminders: boolean;
  theme: 'light' | 'dark';
  accessibilityLargeText: boolean;
  accessibilityScreenReader: boolean;
  googleSignIn: boolean;
  googleCalendarSync: boolean;
  locationAccess: boolean;
  demoMode?: boolean;
}
