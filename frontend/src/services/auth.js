import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';
import { auth } from '../config/firebase-config.js';

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

//signup
export const signUp = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (displayName) {
      await updateProfile(user, { displayName });
    }

    await sendEmailVerification(user);
    
    return user;
  } catch (error) {
    const errorMessage = getAuthErrorMessage(error.code);
    throw new Error(errorMessage);
  }
};

//signin
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    const errorMessage = getAuthErrorMessage(error.code);
    throw new Error(errorMessage);
  }
};

//signin Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    const errorMessage = getAuthErrorMessage(error.code);
    throw new Error(errorMessage);
  }
};

//logout
export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw new Error('Failed to log out. Please try again.');
  }
};

//reset
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    const errorMessage = getAuthErrorMessage(error.code);
    throw new Error(errorMessage);
  }
};

//verification after signing up
export const sendVerificationEmail = async () => {
  try {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    } else {
      throw new Error('No user is currently signed in.');
    }
  } catch (error) {
    const errorMessage = getAuthErrorMessage(error.code);
    throw new Error(errorMessage);
  }
};

//checking the state 
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

// generated error msg
const getAuthErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/email-already-in-use': 'This email is already registered. Please use a different email or sign in.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/operation-not-allowed': 'Email/password accounts are not enabled. Please contact support.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled.',
    'auth/popup-blocked': 'Popup was blocked. Please allow popups for this site.',
    'auth/requires-recent-login': 'Please sign in again to perform this action.'
  };

  return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
};