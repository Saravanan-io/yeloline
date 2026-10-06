import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

// Firebase configuration from google-services.json
export const firebaseConfig = {
  apiKey: "AIzaSyBRrE-sUvcblUvDUAxAxM4KxUfzhl-TIi8",
  authDomain: "yeloline-project.firebaseapp.com",
  projectId: "yeloline-project",
  storageBucket: "yeloline-project.firebasestorage.app",
  messagingSenderId: "396416197162",
  appId: "1:396416197162:web:78bdfa96b9637342ad5953",
  databaseURL: "https://yeloline-project-default-rtdb.firebaseio.com"
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
