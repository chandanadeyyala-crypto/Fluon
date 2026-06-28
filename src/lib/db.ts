import { db, doc, setDoc, getDoc, collection, getDocs, deleteDoc, writeBatch } from "./firebase";
import { Task, Goal, JournalLog, CompanionMessage, Settings } from "../types";
import { INITIAL_TASKS, INITIAL_GOALS, INITIAL_JOURNAL, INITIAL_MESSAGES, DEFAULT_SETTINGS } from "../data";

// 1. Fetch entire user workspace data
export async function fetchUserWorkspace(uid: string): Promise<{
  settings: Settings;
  tasks: Task[];
  goals: Goal[];
  logs: JournalLog[];
  messages: CompanionMessage[];
}> {
  try {
    // A. Fetch Settings
    const userDocRef = doc(db, "users", uid);
    const userDocSnap = await getDoc(userDocRef);
    let settings = DEFAULT_SETTINGS;
    
    if (userDocSnap.exists() && userDocSnap.data().settings) {
      settings = { ...DEFAULT_SETTINGS, ...userDocSnap.data().settings };
    } else {
      // Initialize settings for new user
      await setDoc(userDocRef, { settings: DEFAULT_SETTINGS }, { merge: true });
    }

    // B. Fetch Tasks
    const tasksSnap = await getDocs(collection(db, "users", uid, "tasks"));
    let tasks: Task[] = [];
    if (!tasksSnap.empty) {
      tasksSnap.forEach((d) => tasks.push(d.data() as Task));
    }

    // C. Fetch Goals
    const goalsSnap = await getDocs(collection(db, "users", uid, "goals"));
    let goals: Goal[] = [];
    if (!goalsSnap.empty) {
      goalsSnap.forEach((d) => goals.push(d.data() as Goal));
    }

    // D. Fetch Accountability Logs
    const logsSnap = await getDocs(collection(db, "users", uid, "accountability_logs"));
    let logs: JournalLog[] = [];
    if (!logsSnap.empty) {
      logsSnap.forEach((d) => logs.push(d.data() as JournalLog));
    }

    // E. Fetch Messages
    let messages: CompanionMessage[] = [];
    const compMsgSnap = await getDocs(collection(db, "users", uid, "companion_messages"));
    if (!compMsgSnap.empty) {
      compMsgSnap.forEach((d) => {
        const data = d.data();
        messages.push({
          id: data.id,
          text: data.content || data.text || "",
          sender: data.role === "model" ? "assistant" : (data.role || data.sender || "assistant") as any,
          timestamp: data.createdAt ? new Date(data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (data.timestamp || ""),
          mode: data.mode || "chat",
          role: data.role,
          content: data.content,
          createdAt: data.createdAt,
          userId: data.userId
        });
      });
    } else {
      const messagesSnap = await getDocs(collection(db, "users", uid, "notifications"));
      if (!messagesSnap.empty) {
        messagesSnap.forEach((d) => {
          const data = d.data();
          messages.push({
            id: data.id,
            text: data.text || data.content || "",
            sender: (data.sender || (data.role === "model" ? "assistant" : "assistant")) as any,
            timestamp: data.timestamp || "",
            mode: data.mode || "chat"
          });
        });
      }
    }
    // Sort messages by ID to keep chronological order
    messages.sort((a, b) => a.id.localeCompare(b.id));

    // F. New User Provisioning (Removed automatic database writing as requested)
    return {
      settings,
      tasks,
      goals,
      logs,
      messages: messages.length > 0 ? messages : INITIAL_MESSAGES,
    };
  } catch (error) {
    console.error("Error fetching workspace data from Firestore:", error);
    return {
      settings: DEFAULT_SETTINGS,
      tasks: [],
      goals: [],
      logs: [],
      messages: INITIAL_MESSAGES,
    };
  }
}

// Helper to recursively sanitize objects, removing undefined values or replacing with null/defaults
export function sanitizeData<T>(obj: T): T {
  if (obj === undefined) return null as any;
  if (obj === null) return null as any;
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeData(item)) as any;
  }
  if (typeof obj === 'object') {
    const res: any = {};
    for (const key of Object.keys(obj as any)) {
      const val = (obj as any)[key];
      if (val === undefined) {
        res[key] = null;
      } else {
        res[key] = sanitizeData(val);
      }
    }
    return res;
  }
  return obj;
}

// 1.5. Explicit Starter Dataset Provisioning (only on user request)
export async function provisionStarterDataset(uid: string): Promise<{
  tasks: Task[];
  goals: Goal[];
  logs: JournalLog[];
  messages: CompanionMessage[];
}> {
  try {
    const batch = writeBatch(db);

    // Populate tasks
    INITIAL_TASKS.forEach((t) => {
      const dRef = doc(collection(db, "users", uid, "tasks"), t.id);
      batch.set(dRef, sanitizeData(t));
    });

    // Populate goals
    INITIAL_GOALS.forEach((g) => {
      const dRef = doc(collection(db, "users", uid, "goals"), g.id);
      batch.set(dRef, sanitizeData(g));
    });

    // Populate logs
    INITIAL_JOURNAL.forEach((l) => {
      const dRef = doc(collection(db, "users", uid, "accountability_logs"), l.id);
      batch.set(dRef, sanitizeData(l));
    });

    // Populate messages
    INITIAL_MESSAGES.forEach((m) => {
      const dRef = doc(collection(db, "users", uid, "notifications"), m.id);
      const sanitizedMsg = {
        ...m,
        mode: m.mode || "general"
      };
      batch.set(dRef, sanitizeData(sanitizedMsg));
    });

    await batch.commit();

    return {
      tasks: INITIAL_TASKS,
      goals: INITIAL_GOALS,
      logs: INITIAL_JOURNAL,
      messages: INITIAL_MESSAGES,
    };
  } catch (error) {
    console.error("Error provisioning starter dataset:", error);
    throw error;
  }
}

// 2. Task Synchronization Helpers
export async function syncTask(uid: string, task: Task) {
  try {
    const docRef = doc(db, "users", uid, "tasks", task.id);
    await setDoc(docRef, sanitizeData(task));
  } catch (err) {
    console.error("Firestore syncTask Error:", err);
  }
}

export async function unsyncTask(uid: string, taskId: string) {
  try {
    const docRef = doc(db, "users", uid, "tasks", taskId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error("Firestore unsyncTask Error:", err);
  }
}

// 3. Goal Synchronization Helpers
export async function syncGoal(uid: string, goal: Goal) {
  try {
    const docRef = doc(db, "users", uid, "goals", goal.id);
    await setDoc(docRef, sanitizeData(goal));
  } catch (err) {
    console.error("Firestore syncGoal Error:", err);
  }
}

export async function unsyncGoal(uid: string, goalId: string) {
  try {
    const docRef = doc(db, "users", uid, "goals", goalId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error("Firestore unsyncGoal Error:", err);
  }
}

// 4. Accountability Log Synchronization Helpers
export async function syncLog(uid: string, log: JournalLog) {
  try {
    const docRef = doc(db, "users", uid, "accountability_logs", log.id);
    await setDoc(docRef, sanitizeData(log));
  } catch (err) {
    console.error("Firestore syncLog Error:", err);
  }
}

// 5. Message Synchronization Helpers
export async function syncMessage(uid: string, msg: CompanionMessage) {
  try {
    // Sync to the new companion_messages collection with the specific structure
    const companionDocRef = doc(db, "users", uid, "companion_messages", msg.id);
    const companionData = {
      id: msg.id,
      role: msg.role || (msg.sender === "assistant" ? "model" : "user"),
      content: msg.content || msg.text || "",
      createdAt: msg.createdAt || new Date().toISOString(),
      mode: msg.mode || "chat",
      userId: uid
    };
    await setDoc(companionDocRef, sanitizeData(companionData));

    // Also sync to notifications collection for backward compatibility
    const legacyDocRef = doc(db, "users", uid, "notifications", msg.id);
    const legacyData = {
      ...msg,
      mode: msg.mode || "general"
    };
    await setDoc(legacyDocRef, sanitizeData(legacyData));
  } catch (err) {
    console.error("Firestore syncMessage Error:", err);
  }
}

export async function clearMessagesCollection(uid: string, messageIds: string[]) {
  try {
    const batch = writeBatch(db);
    messageIds.forEach((id) => {
      const companionDocRef = doc(db, "users", uid, "companion_messages", id);
      batch.delete(companionDocRef);
      const legacyDocRef = doc(db, "users", uid, "notifications", id);
      batch.delete(legacyDocRef);
    });
    await batch.commit();
  } catch (err) {
    console.error("Firestore clearMessages Error:", err);
  }
}

// 6. Settings Synchronization Helpers
export async function syncSettings(uid: string, settings: Settings) {
  try {
    const docRef = doc(db, "users", uid);
    await setDoc(docRef, sanitizeData({ settings }), { merge: true });
  } catch (err) {
    console.error("Firestore syncSettings Error:", err);
  }
}
