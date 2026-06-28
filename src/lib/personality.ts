export interface PersonalityContent {
  greeting: string;
  taskPlaceholder: string;
  reminderTone: string;
  suggestionIntro: string;
  notificationTone: string;
  goalPlaceholder: string;
  journalPlaceholder: string;
}

export const PERSONALITIES: Record<string, PersonalityContent> = {
  friendly: {
    greeting: "Hey! Ready to finish today's tasks?",
    taskPlaceholder: "What exciting thing are we doing today?",
    reminderTone: "Just a gentle nudge! You've got this!",
    suggestionIntro: "Here are some friendly tips I custom-built for you:",
    notificationTone: "Positive vibe alert! Check out your new friendly suggestions!",
    goalPlaceholder: "Describe a dream or vision you want us to accomplish...",
    journalPlaceholder: "How did your day feel? Share your thoughts, successes, or rests with me..."
  },
  professional: {
    greeting: "Welcome back. Here are today's priorities.",
    taskPlaceholder: "Enter a high-impact commitment for tracking...",
    reminderTone: "Action required. Please review your pending task timeline.",
    suggestionIntro: "Please review the following structured performance optimization analysis:",
    notificationTone: "System update. Your daily productivity suggestions are ready.",
    goalPlaceholder: "Specify a formal business, educational, or project objective...",
    journalPlaceholder: "Document your progress, obstacles, and tomorrow's targets..."
  },
  motivational: {
    greeting: "Let's go! What major victory are we claiming today?! 🔥",
    taskPlaceholder: "Name your next massive achievement!",
    reminderTone: "Do not quit! Push through and check this item off right now! ⚡",
    suggestionIntro: "CRUSH YOUR LIMITS! Here is your power strategy:",
    notificationTone: "UNSTOPPABLE! Open your mind to these suggestions!",
    goalPlaceholder: "What legendary objective are we going to dominate next?!",
    journalPlaceholder: "Write down your wins, what tried to slow you down, and how you will conquer tomorrow!"
  },
  calm: {
    greeting: "Take one task at a time. You've got this.",
    taskPlaceholder: "What gentle step would you like to take next?",
    reminderTone: "Whenever you are ready, let's take a calm look at this task.",
    suggestionIntro: "Take a moment to read these mindful pacing ideas:",
    notificationTone: "Mindfulness reminder. Soft ideas to simplify your day are here.",
    goalPlaceholder: "What steady, long-term journey are you embarking on...",
    journalPlaceholder: "Take a peaceful moment to write how your energy felt and how you rested today..."
  },
  strict: {
    greeting: "You still have unfinished tasks. Let's complete them.",
    taskPlaceholder: "Enter a concrete, non-negotiable commitment.",
    reminderTone: "Overdue risk is high. Stop stalling. Execute this task immediately.",
    suggestionIntro: "No excuses. Here are your strict corrective recommendations:",
    notificationTone: "Accountability notice. Action is required on your pending tasks.",
    goalPlaceholder: "Define an exact milestone target with hard constraints...",
    journalPlaceholder: "Account for your exact performance: what was done, what was delayed, and why..."
  },
  student: {
    greeting: "Hey study buddy! Let's smash these assignments and pass the semester! 🎓",
    taskPlaceholder: "Homework name, exam prep topic, assignment, etc...",
    reminderTone: "Study warning! Let's get this coursework done!",
    suggestionIntro: "Here's your custom study session layout:",
    notificationTone: "Cram session alert! Check these helpful study suggestions.",
    goalPlaceholder: "Course passing grade, project completion, or learning goal...",
    journalPlaceholder: "How did studying go? What lectures did you recap? Outline tomorrow's study..."
  },
  minimal: {
    greeting: "Active.",
    taskPlaceholder: "Task.",
    reminderTone: "Pending.",
    suggestionIntro: "Advice:",
    notificationTone: "Ready.",
    goalPlaceholder: "Goal.",
    journalPlaceholder: "Logs."
  }
};

export function getPersonalityContent(personalityName: string): PersonalityContent {
  const name = (personalityName || "friendly").toLowerCase();
  return PERSONALITIES[name] || PERSONALITIES.friendly;
}
