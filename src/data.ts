/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Goal, Task, JournalLog, CompanionMessage, Settings } from './types';

export const INITIAL_GOALS: Goal[] = [
  {
    id: 'g-1',
    title: 'Launch SaaS Alpha Product',
    description: 'Get first 50 signups for our productivity tool.',
    deadline: '2026-07-15',
    status: 'active',
    milestones: [
      { id: 'm-1-1', title: 'Complete core onboarding flow', completed: true, dueDate: '2026-06-25' },
      { id: 'm-1-2', title: 'Deploy landing page with subscription widget', completed: false, dueDate: '2026-07-02' },
      { id: 'm-1-3', title: 'Publish Product Hunt pre-launch page', completed: false, dueDate: '2026-07-10' }
    ]
  },
  {
    id: 'g-2',
    title: 'Pass Advanced Algorithms Course',
    description: 'Maintain an A- grade for final assignment and examinations.',
    deadline: '2026-08-01',
    status: 'active',
    milestones: [
      { id: 'm-2-1', title: 'Submit Homework Assignment 4', completed: true, dueDate: '2026-06-20' },
      { id: 'm-2-2', title: 'Finish Dynamic Programming recap', completed: false, dueDate: '2026-07-05' },
      { id: 'm-2-3', title: 'Complete Final Exam revision session', completed: false, dueDate: '2026-07-28' }
    ]
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 't-1',
    title: 'Polish landing page copy & layout',
    deadline: '2026-06-29',
    priority: 'high',
    status: 'pending',
    linkedGoalId: 'g-1',
    notificationLevel: 3,
    burnoutRisk: 'medium',
    createdAt: '2026-06-25'
  },
  {
    id: 't-2',
    title: 'Revise Homework 5 - Graph Solutions',
    deadline: '2026-07-03',
    priority: 'medium',
    status: 'pending',
    linkedGoalId: 'g-2',
    notificationLevel: 1,
    burnoutRisk: 'low',
    createdAt: '2026-06-27'
  },
  {
    id: 't-3',
    title: 'Pay server hosting annual renewal bill',
    deadline: '2026-06-30',
    priority: 'high',
    status: 'pending',
    notificationLevel: 3,
    burnoutRisk: 'high',
    createdAt: '2026-06-26'
  },
  {
    id: 't-4',
    title: 'Draft cold emails for initial mentors',
    deadline: '2026-07-08',
    priority: 'low',
    status: 'completed',
    linkedGoalId: 'g-1',
    notificationLevel: 1,
    burnoutRisk: 'low',
    createdAt: '2026-06-24'
  }
];

export const INITIAL_JOURNAL: JournalLog[] = [
  {
    id: 'j-1',
    date: '2026-06-27',
    mood: 'Focused but tired',
    energy: 3,
    focus: 4,
    whatGotDone: 'Finished coding the memory graph and tested responsiveness across mobile.',
    whatGotDelayed: 'Postponed review of the graph theory algorithms midterm paper.',
    tomorrowPlan: 'Revise Homework 5 and write draft landing page elements.'
  },
  {
    id: 'j-2',
    date: '2026-06-26',
    mood: 'Energetic and creative',
    energy: 5,
    focus: 5,
    whatGotDone: 'Deployed setup server. Setup dynamic route bindings and verified connection.',
    whatGotDelayed: 'None! Great progress day.',
    tomorrowPlan: 'Continue refining calendar integration widgets.'
  }
];

export const INITIAL_MESSAGES: CompanionMessage[] = [
  {
    id: 'm-1',
    text: "Hello! I am your Fluon companion. I am here to help you navigate deadlines, sort priorities, recover when you miss a milestone, and manage burnout. How are you holding up today?",
    sender: 'assistant',
    timestamp: '10:00 AM'
  }
];

export const DEFAULT_SETTINGS: Settings = {
  displayName: 'Alex Mercer',
  aboutMe: 'Final-year computer science student & bootstrap indie-hacker. Overwhelmed but excited.',
  aiBehavior: 'Empathetic and Action-Oriented',
  personality: 'friendly',
  notificationLevel1: true,
  notificationLevel3: true,
  breakReminders: true,
  theme: 'dark',
  accessibilityLargeText: false,
  accessibilityScreenReader: false,
  googleSignIn: true,
  googleCalendarSync: true,
  locationAccess: false
};

// Memory graph nodes representing items and their relations
export interface GraphNode {
  id: string;
  label: string;
  type: 'goal' | 'task' | 'event' | 'file' | 'link';
  group: string;
  x: number;
  y: number;
  details?: string;
}

export interface GraphLink {
  source: string;
  target: string;
}

export const MEMORY_GRAPH_NODES: GraphNode[] = [
  { id: 'g1', label: 'Goal: SaaS Launch', type: 'goal', group: 'SaaS', x: 200, y: 150, details: 'Target Date: 2026-07-15. Objective is 50 users.' },
  { id: 'g2', label: 'Goal: Pass Algorithms', type: 'goal', group: 'School', x: 500, y: 150, details: 'Target Date: 2026-08-01. Maintain A- Grade.' },
  { id: 't1', label: 'Task: Polish landing copy', type: 'task', group: 'SaaS', x: 150, y: 250, details: 'Deadline: 2026-06-29. High Priority.' },
  { id: 't2', label: 'Task: Revise Homework 5', type: 'task', group: 'School', x: 450, y: 280, details: 'Deadline: 2026-07-03. Medium Priority.' },
  { id: 't3', label: 'Task: Pay Hosting Bill', type: 'task', group: 'SaaS', x: 300, y: 80, details: 'Deadline: 2026-06-30. Direct risk item.' },
  { id: 'e1', label: 'Event: DP Exam Review', type: 'event', group: 'School', x: 600, y: 220, details: 'Scheduled on 2026-07-05.' },
  { id: 'f1', label: 'File: pitch_deck.pdf', type: 'file', group: 'SaaS', x: 100, y: 80, details: 'Pitch document for local accelerators.' },
  { id: 'l1', label: 'Link: Stripe Dashboard', type: 'link', group: 'SaaS', x: 320, y: 220, details: 'Payment processor setup links.' }
];

export const MEMORY_GRAPH_LINKS: GraphLink[] = [
  { source: 'g1', target: 't1' },
  { source: 'g1', target: 't3' },
  { source: 'g1', target: 'f1' },
  { source: 'g1', target: 'l1' },
  { source: 'g2', target: 't2' },
  { source: 'g2', target: 'e1' },
  { source: 't1', target: 'l1' }
];
