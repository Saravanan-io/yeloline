import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBRrE-sUvcblUvDUAxAxM4KxUfzhl-TIi8",
  authDomain: "yeloline-project.firebaseapp.com",
  projectId: "yeloline-project",
  storageBucket: "yeloline-project.firebasestorage.app",
  messagingSenderId: "396416197162",
  appId: "1:396416197162:web:78bdfa96b9637342ad5953"
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
