import { db } from "../config/firebase-config";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { auth } from "../config/firebase-config";

// Get or create a session ID for tracking
const getSessionId = () => {
  let sessionId = localStorage.getItem("cooktopia_sessionId");
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("cooktopia_sessionId", sessionId);
  }
  return sessionId;
};

// Log a page visit (once per session per page)
export const logPageVisit = async (pageName) => {
  try {
    const sessionId = getSessionId();
    const userId = auth.currentUser?.uid || null;

    // Check if this session already visited this page today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const q = query(
      collection(db, "pageVisits"),
      where("sessionId", "==", sessionId),
      where("page", "==", pageName),
      where("timestamp", ">=", today),
      where("timestamp", "<", tomorrow)
    );

    const existingVisits = await getDocs(q);

    // Only log if this is the first visit to this page today
    if (existingVisits.empty) {
      await addDoc(collection(db, "pageVisits"), {
        sessionId: sessionId,
        userId: userId,
        timestamp: new Date(),
        page: pageName,
      });
    }
  } catch (error) {
    console.error("Error logging page visit:", error);
  }
};

// Count unique site visits today
export const countTodayVisits = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const q = query(
      collection(db, "pageVisits"),
      where("timestamp", ">=", today),
      where("timestamp", "<", tomorrow)
    );

    const visits = await getDocs(q);
    const uniqueSessions = new Set();

    visits.forEach((doc) => {
      uniqueSessions.add(doc.data().sessionId);
    });

    return uniqueSessions.size;
  } catch (error) {
    console.error("Error counting visits:", error);
    return 0;
  }
};
