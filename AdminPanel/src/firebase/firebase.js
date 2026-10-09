import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

// Firebase configuration strictly loaded from environment variables (.env) with project fallbacks
export const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyBRrE-sUvcblUvDUAxAxM4KxUfzhl-TIi8',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'yeloline-project.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'yeloline-project',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'yeloline-project.firebasestorage.app',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '396416197162',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:396416197162:web:78bdfa96b9637342ad5953',
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL || 'https://yeloline-project-default-rtdb.firebaseio.com'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Realtime Database and get a reference to the service
export const rtdb = getDatabase(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

export default app;
