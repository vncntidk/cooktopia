/**
 * Support Tickets Service - Firestore v9 modular syntax
 * Handles support ticket creation (user side)
 * 
 * Collection: supportTickets
 * Document structure:
 *   - userId: uid of the user who created the ticket
 *   - type: 'feedback' | 'issue'
 *   - status: 'open' | 'in-progress' | 'resolved' | 'closed'
 *   - feedbackType: string (for feedback tickets: 'suggestion' | 'improvement' | 'compliment' | 'other')
 *   - issueType: string (for issue tickets: 'bug' | 'performance' | 'ui' | 'account' | 'recipe' | 'other')
 *   - message: string (for feedback tickets)
 *   - description: string (for issue tickets)
 *   - stepsToReproduce: string (optional, for issue tickets)
 *   - createdAt: serverTimestamp
 *   - updatedAt: serverTimestamp
 */

import {
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase-config';

const SUPPORT_TICKETS_COLLECTION = 'supportTickets';

/**
 * Create a feedback ticket
 * @param {string} userId - The user's UID
 * @param {string} feedbackType - 'suggestion' | 'improvement' | 'compliment' | 'other'
 * @param {string} message - The feedback message
 * @returns {Promise<string>} - Ticket document ID
 */
export const createFeedbackTicket = async (userId, feedbackType, message) => {
  try {
    if (!userId || !feedbackType || !message) {
      throw new Error('Missing required fields');
    }

    // Trim and validate message length
    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) {
      throw new Error('Feedback message cannot be empty');
    }
    if (trimmedMessage.length > 500) {
      throw new Error('Feedback message must be 500 characters or less');
    }

    const ticketData = {
      userId,
      type: 'feedback',
      status: 'open',
      feedbackType,
      message: trimmedMessage,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const ticketsRef = collection(db, SUPPORT_TICKETS_COLLECTION);
    const docRef = await addDoc(ticketsRef, ticketData);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating feedback ticket:', error);
    throw new Error(error.message || 'Failed to submit feedback. Please try again.');
  }
};

/**
 * Create an issue ticket
 * @param {string} userId - The user's UID
 * @param {string} issueType - 'bug' | 'performance' | 'ui' | 'account' | 'recipe' | 'other'
 * @param {string} description - The issue description
 * @param {string} stepsToReproduce - Optional steps to reproduce the issue
 * @returns {Promise<string>} - Ticket document ID
 */
export const createIssueTicket = async (userId, issueType, description, stepsToReproduce = '') => {
  try {
    if (!userId || !issueType || !description) {
      throw new Error('Missing required fields');
    }

    // Trim and validate description length
    const trimmedDescription = description.trim();
    if (trimmedDescription.length === 0) {
      throw new Error('Issue description cannot be empty');
    }
    if (trimmedDescription.length > 500) {
      throw new Error('Issue description must be 500 characters or less');
    }

    // Trim steps to reproduce if provided
    const trimmedSteps = stepsToReproduce ? stepsToReproduce.trim() : '';

    const ticketData = {
      userId,
      type: 'issue',
      status: 'open',
      issueType,
      description: trimmedDescription,
      stepsToReproduce: trimmedSteps,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const ticketsRef = collection(db, SUPPORT_TICKETS_COLLECTION);
    const docRef = await addDoc(ticketsRef, ticketData);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating issue ticket:', error);
    throw new Error(error.message || 'Failed to report issue. Please try again.');
  }
};
