// src/utilities/firebase.ts
import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { initializeApp, type FirebaseApp } from 'firebase/app';



import {
  getDatabase,
  onValue,
  ref,
  set,
  push,
  update,
  type Database,
} from 'firebase/database';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { Sighting } from '../types/Sighting';
import type { User } from '../types/User';

// --- Your project config (use the same values you already posted) ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// --- Initialize core Firebase objects and export them ---
export const app: FirebaseApp = initializeApp(firebaseConfig);
export const database: Database = getDatabase(app); // <== exported as "database"
const auth = getAuth(app);
const storage = getStorage(app);

// --- Simple auth actions ---
export const signInWithGoogle = () => signInWithPopup(auth, new GoogleAuthProvider());
export const signOut = () => firebaseSignOut(auth);

// --- Auth hook ---
export interface AuthState {
  user: FirebaseUser | null;
  isAuthenticated: boolean;
  isInitialLoading: boolean;
}

export const useAuthState = (): AuthState => {
  const [user, setUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    // subscribe to auth changes
    const unsub = onAuthStateChanged(auth, (u) => {
      // ensure React updates synchronously so the UI reflects auth ASAP
      flushSync(() => {
        setUser(u);
        setIsInitialLoading(false);
      });
      // Create or update user in database
      if (u) {
        const userRef = ref(database, `users/${u.uid}`);
        onValue(userRef, (snapshot) => {
          if (!snapshot.exists()) {
            set(userRef, {
              id: u.uid,
              username: u.displayName || 'Anonymous',
              email: u.email || '',
              corroborations: []
            });
          }
        }, { onlyOnce: true } as any);
      }
    });
    return unsub;
  }, []);

  return { user, isAuthenticated: !!user, isInitialLoading };
};

// --- Realtime Database hook ---
export const useDataQuery = (
  path: string
): [unknown, boolean, Error | undefined] => {
  const [data, setData] = useState<unknown>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    setLoading(true);
    setError(undefined);
    setData(undefined);

    const r = ref(database, path);
    const unsub = onValue(
      r,
      (snap) => {
        setData(snap.val());
        setLoading(false);
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
      }
    );

    return unsub; // cleanup listener
  }, [path]);

  return [data, loading, error];
};

// --- Hook to listen to all sightings ---
export const useSightings = (): [Sighting[], boolean, Error | undefined] => {
  const [data, loading, error] = useDataQuery('sightings');
  const [sightings, setSightings] = useState<Sighting[]>([]);

  useEffect(() => {
    if (data && typeof data === 'object') {
      const sightingsArray = Object.entries(data).map(([id, sightingData]: [string, any]) => ({
        id,
        title: sightingData.title,
        location: sightingData.location,
        zipCode: sightingData.zipCode,
        time: new Date(sightingData.time),
        description: sightingData.description,
        imageUrls: sightingData.imageUrls,
        corroborationCount: sightingData.corroborationCount || 0,
      }));
      setSightings(sightingsArray);
    } else {
      setSightings([]);
    }
  }, [data]);

  return [sightings, loading, error];
};

// --- Function to add a new sighting ---
export const addSighting = async (
  sightingData: Omit<Sighting, 'id' | 'imageUrls' | 'corroborationCount'>,
  imageFiles?: File[]
): Promise<string> => {
  const sightingsRef = ref(database, 'sightings');
  const newSightingRef = push(sightingsRef);
  const sightingId = newSightingRef.key!;

  let imageUrls: string[] = [];

  // Upload images if provided
  if (imageFiles && imageFiles.length > 0) {
    const uploadPromises = imageFiles.map(async (file, index) => {
      const imageRef = storageRef(storage, `sightings/${sightingId}/image_${index}`);
      await uploadBytes(imageRef, file);
      return getDownloadURL(imageRef);
    });
    imageUrls = await Promise.all(uploadPromises);
  }

  // Save sighting to database
  await set(newSightingRef, {
    title: sightingData.title,
    location: sightingData.location,
    zipCode: sightingData.zipCode,
    time: sightingData.time.toISOString(),
    description: sightingData.description,
    imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
    corroborationCount: 0,
  });

  return sightingId;
};

// --- Function to corroborate a sighting ---
export const corroborateSighting = async (
  sightingId: string,
  userId: string
): Promise<void> => {
  // Update sighting corroboration count
  const sightingRef = ref(database, `sightings/${sightingId}/corroborationCount`);
  const userRef = ref(database, `users/${userId}/corroborations`);
  
  // Get current corroboration count
  const [sightingData] = await Promise.all([
    new Promise((resolve) => {
      onValue(ref(database, `sightings/${sightingId}`), (snap) => {
        resolve(snap.val());
      }, { onlyOnce: true } as any);
    }),
  ]);

  const currentCount = (sightingData as any)?.corroborationCount || 0;
  
  // Update both the sighting and user records
  await Promise.all([
    set(sightingRef, currentCount + 1),
    update(userRef, { [sightingId]: true })
  ]);
};
