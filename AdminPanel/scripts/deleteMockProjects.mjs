import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file into process.env if available
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const trimmedKey = key.trim();
      const val = valueParts.join('=').trim();
      if (trimmedKey && !trimmedKey.startsWith('#') && !process.env[trimmedKey]) {
        process.env[trimmedKey] = val;
      }
    }
  });
}

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deleteMockProjects() {
  console.log('--- Deleting Mock Projects from Firestore ---');
  const colRef = collection(db, 'projects');
  const snapshot = await getDocs(colRef);
  
  console.log(`Found ${snapshot.docs.length} projects in Firestore collection 'projects'.`);
  for (const d of snapshot.docs) {
    console.log(`Deleting project document: ${d.id} (${d.data().title || 'Untitled'})...`);
    await deleteDoc(doc(db, 'projects', d.id));
  }
  
  console.log('=== All mock projects deleted from Firestore successfully! ===');
  process.exit(0);
}

deleteMockProjects().catch((err) => {
  console.error('Error deleting mock projects from Firestore:', err);
  process.exit(1);
});
