/**
 * Messaging Service - Firestore v9 modular syntax
 * Handles conversations and messages
 * 
 * Collection: conversations
 * Document structure:
 *   - participants: [userId1, userId2] (sorted alphabetically)
 *   - createdAt: serverTimestamp
 *   - lastMessage: string
 *   - lastMessageTime: serverTimestamp
 *   - updatedAt: serverTimestamp
 * 
 * Collection: messages (subcollection of conversations)
 * Document structure:
 *   - senderId: uid of the sender
 *   - text: string
 *   - attachments: array
 *   - createdAt: serverTimestamp
 *   - reactions: object
 *   - status: 'sent' | 'delivered' | 'read'
 *   - deletedBy: array of user IDs
 */

import {
  collection,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  orderBy,
  limit,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase-config';
import { getUserProfile } from './users';
import { isFollowing } from './followService';
import { createNotification } from './notifications';

const CONVERSATIONS_COLLECTION = 'conversations';
const MESSAGES_COLLECTION = 'messages';

/**
 * Check if two users follow each other mutually
 * @param {string} userId1 - First user's UID
 * @param {string} userId2 - Second user's UID
 * @returns {Promise<boolean>} - True if both users follow each other
 */
const checkMutualFollow = async (userId1, userId2) => {
  try {
    const user1FollowsUser2 = await isFollowing(userId1, userId2);
    const user2FollowsUser1 = await isFollowing(userId2, userId1);
    return user1FollowsUser2 && user2FollowsUser1;
  } catch (error) {
    console.error('Error checking mutual follow:', error);
    return false;
  }
};

/**
 * Ensure a conversation exists between two users
 * Creates it if it doesn't exist, returns the conversation ID
 * @param {string} userId1 - First user's UID
 * @param {string} userId2 - Second user's UID
 * @returns {Promise<string>} - Conversation document ID
 */
export const ensureConversation = async (userId1, userId2) => {
  try {
    if (!userId1 || !userId2 || userId1 === userId2) {
      throw new Error('Invalid user IDs');
    }

    // Sort participant IDs to ensure consistent querying
    const participants = [userId1, userId2].sort();

    // Check if conversation already exists
    // Query for conversations where first participant is in the array, then filter for exact match
    const conversationsRef = collection(db, CONVERSATIONS_COLLECTION);
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', participants[0]),
      limit(50) // Get more results to filter in memory
    );

    const querySnapshot = await getDocs(q);
    
    // Filter to find exact match (both participants must match, order doesn't matter)
    const existingConv = querySnapshot.docs.find((doc) => {
      const data = doc.data();
      const convParticipants = Array.isArray(data.participants) ? [...data.participants].sort() : [];
      return convParticipants.length === participants.length &&
             convParticipants[0] === participants[0] &&
             convParticipants[1] === participants[1];
    });

    if (existingConv) {
      // Conversation exists, check if we need to update isRequest status
      const existingData = existingConv.data();
      const isMutualFollow = await checkMutualFollow(userId1, userId2);
      const user1FollowsUser2 = await isFollowing(userId1, userId2);
      const user2FollowsUser1 = await isFollowing(userId2, userId1);
      
      // Update isRequest if follow relationships have changed
      // Rule: If a user follows the other, they see it as normal Messages (isRequest: false)
      // Rule: If a user does NOT follow the other, they see it as Request (isRequest: true)
      // Exception: Once a user has engaged (isRequest was false), preserve that status
      const isRequest = existingData.isRequest || {};
      const user1WasEngaged = isRequest[userId1] === false;
      const user2WasEngaged = isRequest[userId2] === false;
      
      // Only update if user hasn't engaged yet, or if they now follow the other user
      const newIsRequest1 = user1WasEngaged ? false : !user1FollowsUser2;
      const newIsRequest2 = user2WasEngaged ? false : !user2FollowsUser1;
      
      const needsUpdate = 
        (isRequest[userId1] !== newIsRequest1) ||
        (isRequest[userId2] !== newIsRequest2);
      
      if (needsUpdate) {
        isRequest[userId1] = newIsRequest1;
        isRequest[userId2] = newIsRequest2;
        
        await updateDoc(doc(db, CONVERSATIONS_COLLECTION, existingConv.id), {
          isRequest,
          updatedAt: serverTimestamp(),
        });
      }
      
      return existingConv.id;
    }

    // Determine isRequest status for each user based on follow relationships
    // Rule: If a user follows the other, they see it as normal Messages (isRequest: false)
    // Rule: If a user does NOT follow the other, they see it as Request (isRequest: true)
    const user1FollowsUser2 = await isFollowing(userId1, userId2);
    const user2FollowsUser1 = await isFollowing(userId2, userId1);
    
    const isRequest = {};
    // userId1 sees it as normal Messages if they follow userId2, otherwise as Request
    isRequest[userId1] = !user1FollowsUser2;
    // userId2 sees it as normal Messages if they follow userId1, otherwise as Request
    isRequest[userId2] = !user2FollowsUser1;

    // Create new conversation
    const newConversation = {
      participants,
      isRequest,
      createdAt: serverTimestamp(),
      lastMessage: '',
      lastMessageTime: null,
      updatedAt: serverTimestamp(),
      lastSeenTimestamp: {}, // Track when each user last saw the conversation
      unreadCount: { [userId1]: 0, [userId2]: 0 }, // Initialize unread counts
    };

    const docRef = await addDoc(conversationsRef, newConversation);
    return docRef.id;
  } catch (error) {
    console.error('Error ensuring conversation:', error);
    throw new Error(`Failed to ensure conversation: ${error.message}`);
  }
};

/**
 * Listen to user's conversations in real-time
 * @param {string} currentUserId - The current user's UID
 * @param {Function} callback - Callback function that receives formatted conversations array
 * @returns {Function} - Unsubscribe function
 */
export const listenToUserConversations = (currentUserId, callback) => {
  if (!currentUserId) {
    return () => {};
  }

  try {
    const conversationsRef = collection(db, CONVERSATIONS_COLLECTION);
    // Note: We can't use orderBy with array-contains, so we'll sort in memory
    // Also, orderBy on lastMessageTime might fail if it's null, so we query without it
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', currentUserId)
    );

    const unsubscribe = onSnapshot(
      q,
      async (querySnapshot) => {
        const conversations = [];

        // Process each conversation
        for (const docSnap of querySnapshot.docs) {
          const data = docSnap.data();
          
          // Get the other user's ID
          const otherUserId = data.participants.find((id) => id !== currentUserId);
          
          if (!otherUserId) continue;

          try {
            // Fetch other user's profile data
            const otherUserProfile = await getUserProfile(otherUserId);
            
            conversations.push({
              id: docSnap.id,
              participants: data.participants,
              lastMessage: data.lastMessage || '',
              lastMessageTime: data.lastMessageTime,
              updatedAt: data.updatedAt,
              createdAt: data.createdAt,
              isRequest: data.isRequest || {},
              requestStatus: data.requestStatus || 'pending', // 'pending' | 'accepted' | 'ignored'
              requestTo: data.requestTo, // Who the request is directed to
              lastSeenTimestamp: data.lastSeenTimestamp || {},
              otherUser: {
                userId: otherUserId,
                displayName: otherUserProfile.displayName || otherUserProfile.name || 'Unknown User',
                name: otherUserProfile.name || otherUserProfile.displayName || 'Unknown User',
                profileImage: otherUserProfile.profileImage || null,
                bio: otherUserProfile.bio || '',
              },
              unreadCount: data.unreadCount || {},
            });
          } catch (error) {
            console.error(`Error fetching user profile for ${otherUserId}:`, error);
            // Add conversation with minimal data if profile fetch fails
            conversations.push({
              id: docSnap.id,
              participants: data.participants,
              lastMessage: data.lastMessage || '',
              lastMessageTime: data.lastMessageTime,
              updatedAt: data.updatedAt,
              createdAt: data.createdAt,
              isRequest: data.isRequest || {},
              requestStatus: data.requestStatus || 'pending',
              requestTo: data.requestTo,
              lastSeenTimestamp: data.lastSeenTimestamp || {},
              otherUser: {
                userId: otherUserId,
                displayName: 'Unknown User',
                name: 'Unknown User',
                profileImage: null,
                bio: '',
              },
              unreadCount: data.unreadCount || {},
            });
          }
        }

        // Sort conversations by lastMessageTime (most recent first)
        conversations.sort((a, b) => {
          const timeA = a.lastMessageTime?.toDate ? a.lastMessageTime.toDate().getTime() : (a.updatedAt?.toDate ? a.updatedAt.toDate().getTime() : 0);
          const timeB = b.lastMessageTime?.toDate ? b.lastMessageTime.toDate().getTime() : (b.updatedAt?.toDate ? b.updatedAt.toDate().getTime() : 0);
          return timeB - timeA;
        });

        callback(conversations);
      },
      (error) => {
        console.error('Error in conversations listener:', error);
        callback([]);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up conversations listener:', error);
    return () => {};
  }
};

/**
 * Send a message in a conversation
 * @param {string} conversationId - The conversation document ID
 * @param {string} senderId - The sender's UID
 * @param {Object} messageData - { text: string, attachments: array }
 * @returns {Promise<string>} - Message document ID
 */
export const sendMessage = async (conversationId, senderId, messageData) => {
  try {
    if (!conversationId || !senderId) {
      throw new Error('Conversation ID and sender ID are required');
    }

    const messagesRef = collection(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_COLLECTION);
    
    const message = {
      senderId,
      text: messageData.text || '',
      attachments: messageData.attachments || [],
      createdAt: serverTimestamp(),
      reactions: {},
      status: 'sent',
      deletedBy: [],
      seenBy: [], // Track which users have seen this message
    };

    const docRef = await addDoc(messagesRef, message);

    // Get conversation data to update isRequest status and unread counts
    const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    const convDoc = await getDoc(conversationRef);
    const convData = convDoc.data();
    
    if (convData) {
      const participants = convData.participants || [];
      const otherUserId = participants.find((id) => id !== senderId);
      
      if (otherUserId) {
        // Update isRequest status based on current follow relationships
        // Rule: If a user follows the other, they see it as normal Messages (isRequest: false)
        // Rule: If a user does NOT follow the other, they see it as Request (isRequest: true)
        // Exception: When a user sends a message (replies), they are engaging, so it should move to normal Messages for them
        // Exception: Once a user has engaged (isRequest was false), it should stay in normal Messages
        const senderFollowsOther = await isFollowing(senderId, otherUserId);
        const otherFollowsSender = await isFollowing(otherUserId, senderId);
        
        const isRequest = convData.isRequest || {};
        
        // When sender sends a message, they are engaging, so move to normal Messages for them
        // (regardless of follow status - replying means they want to continue the conversation)
        isRequest[senderId] = false;
        
        // Other user: If they've already engaged (isRequest was false), keep it as normal Messages
        // Otherwise, check follow status
        const otherUserWasEngaged = isRequest[otherUserId] === false;
        if (otherUserWasEngaged) {
          // User has already engaged, keep it in normal Messages
          isRequest[otherUserId] = false;
        } else {
          // User hasn't engaged yet, check follow status
          isRequest[otherUserId] = !otherFollowsSender;
        }
        
        // Update unread count for the other user
        const unreadCount = convData.unreadCount || {};
        unreadCount[otherUserId] = (unreadCount[otherUserId] || 0) + 1;
        
        // Create notification for message request if the recipient sees it as a request
        // (i.e., they don't follow the sender and haven't engaged yet)
        if (isRequest[otherUserId] === true) {
          try {
            await createNotification(otherUserId, senderId, 'message_request', {
              messageThreadId: conversationId,
            });
          } catch (error) {
            console.error('Error creating message request notification:', error);
            // Don't throw - notification failure shouldn't break the message sending
          }
        }
        
        // Update conversation
        await updateDoc(conversationRef, {
          lastMessage: messageData.text || (messageData.attachments?.length > 0 ? 'Sent an image' : ''),
          lastMessageTime: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isRequest,
          unreadCount,
          requestTo: !otherFollowsSender ? otherUserId : null,
        });
      } else {
        // Fallback if we can't find other user
        await updateDoc(conversationRef, {
          lastMessage: messageData.text || (messageData.attachments?.length > 0 ? 'Sent an image' : ''),
          lastMessageTime: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } else {
      // Fallback if conversation doesn't exist
      await updateDoc(conversationRef, {
        lastMessage: messageData.text || (messageData.attachments?.length > 0 ? 'Sent an image' : ''),
        lastMessageTime: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    return docRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error(`Failed to send message: ${error.message}`);
  }
};

/**
 * Listen to messages in a conversation
 * @param {string} conversationId - The conversation document ID
 * @param {Function} callback - Callback function that receives messages array
 * @returns {Function} - Unsubscribe function
 */
export const listenToMessages = (conversationId, callback) => {
  if (!conversationId) {
    return () => {};
  }

  try {
    const messagesRef = collection(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_COLLECTION);
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const messages = querySnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        callback(messages);
      },
      (error) => {
        console.error('Error in messages listener:', error);
        callback([]);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up messages listener:', error);
    return () => {};
  }
};

/**
 * Get users that the current user can message (users they follow)
 * @param {string} currentUserId - The current user's UID
 * @returns {Promise<Array>} - Array of user objects
 */
export const getMessageableUsers = async (currentUserId) => {
  try {
    if (!currentUserId) {
      return [];
    }

    // Get users that current user follows
    const followsRef = collection(db, 'follows');
    const q = query(followsRef, where('followerId', '==', currentUserId));
    const followsSnapshot = await getDocs(q);

    const messageableUsers = [];

    for (const followDoc of followsSnapshot.docs) {
      const followingId = followDoc.data().followingId;
      try {
        const profile = await getUserProfile(followingId);
        messageableUsers.push({
          userId: followingId,
          displayName: profile.displayName || profile.name || 'Unknown User',
          name: profile.name || profile.displayName || 'Unknown User',
          profileImage: profile.profileImage || null,
          bio: profile.bio || '',
        });
      } catch (error) {
        console.error(`Error fetching profile for ${followingId}:`, error);
      }
    }

    return messageableUsers;
  } catch (error) {
    console.error('Error getting messageable users:', error);
    return [];
  }
};

/**
 * Start a new conversation with a user
 * @param {string} currentUserId - The current user's UID
 * @param {string} targetUserId - The target user's UID
 * @returns {Promise<string>} - Conversation document ID
 */
export const startConversation = async (currentUserId, targetUserId) => {
  try {
    return await ensureConversation(currentUserId, targetUserId);
  } catch (error) {
    console.error('Error starting conversation:', error);
    throw error;
  }
};

/**
 * Delete a conversation and all its messages
 * @param {string} conversationId - The conversation document ID
 * @returns {Promise<void>}
 */
export const deleteConversation = async (conversationId) => {
  try {
    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }

    // Get all messages in the conversation
    const messagesRef = collection(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_COLLECTION);
    const messagesSnapshot = await getDocs(messagesRef);

    // Firestore batch operations are limited to 500 operations
    // If we have more than 500 messages, we need to delete in multiple batches
    const MAX_BATCH_SIZE = 500;
    const messageDocs = messagesSnapshot.docs;
    
    // Delete messages in batches if needed
    for (let i = 0; i < messageDocs.length; i += MAX_BATCH_SIZE) {
      const batch = writeBatch(db);
      const batchDocs = messageDocs.slice(i, i + MAX_BATCH_SIZE);
      
      // Delete messages in this batch
      batchDocs.forEach((messageDoc) => {
        batch.delete(messageDoc.ref);
      });
      
      // Commit this batch
      await batch.commit();
    }

    // Delete the conversation document (separate operation)
    const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    await deleteDoc(conversationRef);
    
    console.log(`Successfully deleted conversation ${conversationId} and ${messageDocs.length} messages`);
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw new Error(`Failed to delete conversation: ${error.message}`);
  }
};

/**
 * Edit a message
 * @param {string} messageId - The message document ID
 * @param {string} conversationId - The conversation document ID
 * @param {string} newText - The new message text
 * @returns {Promise<void>}
 */
export const editMessage = async (messageId, conversationId, newText) => {
  try {
    if (!messageId || !conversationId || !newText?.trim()) {
      throw new Error('Message ID, conversation ID, and text are required');
    }

    // Update the message
    const messageRef = doc(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_COLLECTION, messageId);
    await updateDoc(messageRef, {
      text: newText.trim(),
      edited: true,
      editedAt: serverTimestamp(),
    });

    // Check if this is the last message in the conversation
    const messagesRef = collection(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_COLLECTION);
    const lastMessageQuery = query(messagesRef, orderBy('createdAt', 'desc'), limit(1));
    const lastMessageSnapshot = await getDocs(lastMessageQuery);

    if (!lastMessageSnapshot.empty) {
      const lastMessage = lastMessageSnapshot.docs[0];
      const lastMessageData = lastMessage.data();
      
      // If this is the last message, update conversation's lastMessage
      if (lastMessage.id === messageId) {
        const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
        await updateDoc(conversationRef, {
          lastMessage: newText.trim(),
          updatedAt: serverTimestamp(),
        });
      }
    }
  } catch (error) {
    console.error('Error editing message:', error);
    throw new Error(`Failed to edit message: ${error.message}`);
  }
};

/**
 * Update message reactions
 * @param {string} messageId - The message document ID
 * @param {string} conversationId - The conversation document ID
 * @param {Object} reactions - The reactions object (e.g., { heart: 2, like: 1 })
 * @returns {Promise<void>}
 */
export const updateMessageReactions = async (messageId, conversationId, reactions) => {
  try {
    if (!messageId || !conversationId) {
      throw new Error('Message ID and conversation ID are required');
    }

    if (!reactions || typeof reactions !== 'object') {
      throw new Error('Reactions must be an object');
    }

    // Update the message's reactions field
    const messageRef = doc(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_COLLECTION, messageId);
    await updateDoc(messageRef, {
      reactions: reactions,
    });

    console.log(`Successfully updated reactions for message ${messageId}`);
  } catch (error) {
    console.error('Error updating message reactions:', error);
    throw new Error(`Failed to update message reactions: ${error.message}`);
  }
};

/**
 * Accept a message request (convert request to normal chat)
 * @param {string} conversationId - The conversation document ID
 * @param {string} currentUserId - The user accepting the request
 * @returns {Promise<void>}
 */
export const acceptMessageRequest = async (conversationId, currentUserId) => {
  try {
    if (!conversationId || !currentUserId) {
      throw new Error('Conversation ID and user ID are required');
    }

    const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    const convDoc = await getDoc(conversationRef);
    const convData = convDoc.data();

    if (!convData) {
      throw new Error('Conversation not found');
    }

    const participants = convData.participants || [];
    const otherUserId = participants.find((id) => id !== currentUserId);
    
    if (!otherUserId) {
      throw new Error('Other participant not found');
    }

    // Check current follow relationships to set isRequest correctly
    const currentFollowsOther = await isFollowing(currentUserId, otherUserId);
    const otherFollowsCurrent = await isFollowing(otherUserId, currentUserId);
    
    // Update isRequest status based on follow relationships
    // Rule: If a user follows the other, they see it as normal Messages (isRequest: false)
    // When accepting a request, the accepting user should see it as normal Messages (isRequest: false)
    const isRequest = convData.isRequest || {};
    // Accepting user always sees it as normal Messages after accepting
    isRequest[currentUserId] = false;
    // Other user sees it as normal Messages if they follow the accepting user, otherwise as Request
    isRequest[otherUserId] = !otherFollowsCurrent;

    // Update request status
    await updateDoc(conversationRef, {
      isRequest,
      requestStatus: 'accepted',
      requestTo: !otherFollowsCurrent ? otherUserId : null,
      updatedAt: serverTimestamp(),
    });

    console.log(`Message request accepted for conversation ${conversationId}`);
  } catch (error) {
    console.error('Error accepting message request:', error);
    throw new Error(`Failed to accept message request: ${error.message}`);
  }
};

/**
 * Ignore a message request (mark as ignored, but keep in requests)
 * @param {string} conversationId - The conversation document ID
 * @param {string} currentUserId - The user ignoring the request
 * @returns {Promise<void>}
 */
export const ignoreMessageRequest = async (conversationId, currentUserId) => {
  try {
    if (!conversationId || !currentUserId) {
      throw new Error('Conversation ID and user ID are required');
    }

    const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    
    await updateDoc(conversationRef, {
      requestStatus: 'ignored',
      updatedAt: serverTimestamp(),
    });

    console.log(`Message request ignored for conversation ${conversationId}`);
  } catch (error) {
    console.error('Error ignoring message request:', error);
    throw new Error(`Failed to ignore message request: ${error.message}`);
  }
};

/**
 * Mark messages as seen for a user in a conversation
 * @param {string} conversationId - The conversation document ID
 * @param {string} userId - The user who is viewing the messages
 * @returns {Promise<void>}
 */
export const markMessagesAsSeen = async (conversationId, userId) => {
  try {
    if (!conversationId || !userId) {
      throw new Error('Conversation ID and user ID are required');
    }

    // Get all messages in the conversation that haven't been seen by this user
    const messagesRef = collection(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_COLLECTION);
    const messagesSnapshot = await getDocs(messagesRef);

    const batch = writeBatch(db);
    let hasUpdates = false;

    // Update messages that haven't been seen by this user
    messagesSnapshot.docs.forEach((messageDoc) => {
      const messageData = messageDoc.data();
      const seenBy = messageData.seenBy || [];
      
      // Only update if this user hasn't seen it and they're not the sender
      if (!seenBy.includes(userId) && messageData.senderId !== userId) {
        const messageRef = doc(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_COLLECTION, messageDoc.id);
        batch.update(messageRef, {
          seenBy: [...seenBy, userId],
        });
        hasUpdates = true;
      }
    });

    if (hasUpdates) {
      await batch.commit();
    }

    // Update conversation's lastSeenTimestamp for this user
    const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    const lastSeenTimestamp = {};
    const convDoc = await getDoc(conversationRef);
    const convData = convDoc.data();
    
    if (convData) {
      const existingLastSeen = convData.lastSeenTimestamp || {};
      lastSeenTimestamp[userId] = serverTimestamp();
      
      // Reset unread count for this user
      const unreadCount = convData.unreadCount || {};
      unreadCount[userId] = 0;

      await updateDoc(conversationRef, {
        lastSeenTimestamp: { ...existingLastSeen, ...lastSeenTimestamp },
        unreadCount,
        updatedAt: serverTimestamp(),
      });
    }

    console.log(`Messages marked as seen for user ${userId} in conversation ${conversationId}`);
  } catch (error) {
    console.error('Error marking messages as seen:', error);
    throw new Error(`Failed to mark messages as seen: ${error.message}`);
  }
};

/**
 * Listen to total unread conversations count for a user
 * @param {string} currentUserId - The current user's UID
 * @param {Function} callback - Callback function that receives the count
 * @returns {Function} - Unsubscribe function
 */
export const listenToUnreadCount = (currentUserId, callback) => {
  if (!currentUserId) {
    return () => {};
  }

  try {
    const conversationsRef = collection(db, CONVERSATIONS_COLLECTION);
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', currentUserId)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        let unreadCount = 0;
        
        querySnapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          const userUnreadCount = data.unreadCount?.[currentUserId] || 0;
          if (userUnreadCount > 0) {
            unreadCount++;
          }
        });

        callback(unreadCount);
      },
      (error) => {
        console.error('Error in unread count listener:', error);
        callback(0);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up unread count listener:', error);
    return () => {};
  }
};

/**
 * Delete a message
 * @param {string} messageId - The message document ID
 * @param {string} conversationId - The conversation document ID
 * @returns {Promise<void>}
 */
export const deleteMessage = async (messageId, conversationId) => {
  try {
    if (!messageId || !conversationId) {
      throw new Error('Message ID and conversation ID are required');
    }

    // Delete the message document from Firestore
    const messageRef = doc(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_COLLECTION, messageId);
    await deleteDoc(messageRef);
    
    console.log(`Successfully deleted message ${messageId} from conversation ${conversationId}`);

    // Get the new most recent message (if any)
    const messagesRef = collection(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_COLLECTION);
    const lastMessageQuery = query(messagesRef, orderBy('createdAt', 'desc'), limit(1));
    const lastMessageSnapshot = await getDocs(lastMessageQuery);

    const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);

    if (lastMessageSnapshot.empty) {
      // No messages remain, clear lastMessage
      await updateDoc(conversationRef, {
        lastMessage: '',
        lastMessageTime: null,
        updatedAt: serverTimestamp(),
      });
    } else {
      // Update with the new most recent message
      const lastMessage = lastMessageSnapshot.docs[0];
      const lastMessageData = lastMessage.data();
      const lastMessageText = lastMessageData.text || (lastMessageData.attachments?.length > 0 ? 'Sent an image' : '');
      
      await updateDoc(conversationRef, {
        lastMessage: lastMessageText,
        lastMessageTime: lastMessageData.createdAt,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error deleting message:', error);
    throw new Error(`Failed to delete message: ${error.message}`);
  }
};

