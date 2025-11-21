import { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getDatabase, push as pushToDb, ref as dbReference, serverTimestamp, set, get, onValue, off } from 'firebase/database';
import type { User } from 'firebase/auth';
import type { User as AppUser } from '../types/User';

// Configure Firebase via Vite env variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const realtimeDb = getDatabase(app);
export const storage =getStorage(app);

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

export const signInWithGoogle = () => signInWithPopup(auth, provider);
export const signOutUser = () => signOut(auth);
export const dbRef = dbReference;
export const dbPush = pushToDb;
export const dbServerTimestamp = serverTimestamp;

// User management functions
export const checkUserExists = async (uid: string): Promise<boolean> => {
  try {
    const userRef = dbRef(realtimeDb, `users/${uid}`);
    const snapshot = await get(userRef);
    return snapshot.exists();
  } catch (error) {
    console.error('Error checking user exists:', error);
    return false;
  }
};

export const createUserInDatabase = async (firebaseUser: User): Promise<void> => {
  try {
    const userRef = dbRef(realtimeDb, `users/${firebaseUser.uid}`);
    const userData: AppUser = {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
    };
    
    await set(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });
    
    console.log('User created in database:', firebaseUser.uid, firebaseUser.email);
  } catch (error) {
    console.error('Error creating user in database:', error);
    throw error;
  }
};

export const updateUserLastLogin = async (uid: string): Promise<void> => {
  try {
    const userRef = dbRef(realtimeDb, `users/${uid}/lastLoginAt`);
    await set(userRef, serverTimestamp());
    console.log('User last login updated:', uid);
  } catch (error) {
    console.error('Error updating user last login:', error);
  }
};

export const getUserFromDatabase = async (uid: string): Promise<AppUser | null> => {
  try {
    const userRef = dbRef(realtimeDb, `users/${uid}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return {
        id: data.id,
        email: data.email,
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting user from database:', error);
    return null;
  }
};

// Real-time sightings listener
export const listenToSightings = (callback: (sightings: any[]) => void) => {
  const sightingsRef = dbRef(realtimeDb, 'sightings');
  
  const unsubscribe = onValue(sightingsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      // Convert Firebase object to array
      const sightingsArray = Object.entries(data).map(([key, value]: [string, any]) => ({
        firebaseKey: key,
        ...value,
      }));
      callback(sightingsArray);
    } else {
      callback([]);
    }
  });

  // Return unsubscribe function
  return () => off(sightingsRef, 'value', unsubscribe);
};

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      
      if (nextUser) {
        try {
          // Check if this is a first-time user
          const userExists = await checkUserExists(nextUser.uid);
          
          if (!userExists) {
            // First-time user - create user record in database
            await createUserInDatabase(nextUser);
            console.log('New user registered:', nextUser.email);
          } else {
            // Existing user - update last login time
            await updateUserLastLogin(nextUser.uid);
            console.log('User logged in:', nextUser.email);
          }
        } catch (error) {
          console.error('Error handling user authentication:', error);
        }
      }
      
      setIsInitialLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isInitialLoading,
  };
};

// Check if user is logging in for the first time
export const useCheckFirstTimeUser = (uid: string) => {
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!uid) {
      setIsChecking(false);
      setIsFirstTime(false);
      return;
    }

    const checkFirstTime = async () => {
      try {
        const userExists = await checkUserExists(uid);
        setIsFirstTime(!userExists);
      } catch (error) {
        console.error('Error checking first-time user:', error);
        setIsFirstTime(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkFirstTime();
  }, [uid]);

  return { isFirstTime, isChecking };
};

export const uploadImage = async (file: File, sightingId: string): Promise<string> => {
  try {
    // Create a unique filename using timestamp and original filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    
    // Create a reference to the file location in Firebase Storage
    const imageRef = storageRef(storage, `sightings/${sightingId}/${filename}`);
    
    // Upload the file
    const snapshot = await uploadBytes(imageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log('Image uploaded successfully:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};