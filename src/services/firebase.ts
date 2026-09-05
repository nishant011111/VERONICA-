import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  deleteUser,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { getFirestore, doc, deleteDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Google Sign-In helper
export const loginWithGoogle = async () => {
  try {
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};

// Logout helper
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout Error:', error);
    throw error;
  }
};

// Delete Cloud User Account & Firestore User Record
export const deleteUserCloudAccount = async () => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
        if (db && currentUser.uid) {
          await deleteDoc(doc(db, 'users', currentUser.uid)).catch((e) =>
            console.warn('Firestore doc delete notice:', e)
          );
        }
      } catch (e) {
        console.warn('Firestore not configured or error:', e);
      }
      await deleteUser(currentUser).catch((e) =>
        console.warn('Firebase auth deleteUser notice:', e)
      );
    }
  } catch (err) {
    console.warn('Error deleting cloud account:', err);
  }
};


export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Firebase Email Sign-In Error:', error);
    throw error;
  }
};

export const signUpWithEmail = async (email, password, displayName) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    return result.user;
  } catch (error) {
    console.error('Firebase Email Sign-Up Error:', error);
    throw error;
  }
};

export const resetPasswordForEmail = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Firebase Password Reset Error:', error);
    throw error;
  }
};

export { onAuthStateChanged };
export type { User };
