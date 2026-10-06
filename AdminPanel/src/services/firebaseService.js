import {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { ref as rtdbRef, set as rtdbSet, onValue } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, rtdb, storage } from '../firebase/firebase';
import { initialCompanySettings } from '../data/initialData';

// Firestore Collection Names
export const COLLECTIONS = {
  PROJECTS: 'projects',
  ENQUIRIES: 'enquiries',
  APPOINTMENTS: 'appointments',
  CONTACT_ENQUIRIES: 'contact_enquiries',
  SITES: 'sites',
  EXPENSES: 'expenses',
  PURCHASES: 'purchases',
  PAYMENTS: 'payments',
  USERS: 'users',
  DROPDOWN_MASTERS: 'dropdown_masters',
  SETTINGS: 'settings',
  ADDITIONAL_BILLING: 'additional_billing'
};

/**
 * Seed Firestore with mock data if the collection is empty.
 * This automatically migrates mock data to real-time Firebase data!
 */
export async function seedCollectionIfEmpty(collectionName, initialData, idField) {
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty && initialData && initialData.length > 0) {
      console.log(`[Firebase] Seeding ${collectionName} with ${initialData.length} records...`);
      for (const item of initialData) {
        const docId = String(item[idField] || item.id || `doc_${Date.now()}_${Math.random()}`);
        await setDoc(doc(db, collectionName, docId), {
          ...item,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      console.log(`[Firebase] Successfully seeded ${collectionName}.`);
    }
  } catch (error) {
    console.warn(`[Firebase] Seeding ${collectionName} notice:`, error.message);
  }
}

/**
 * Seed company settings document if missing
 */
export async function seedSettingsIfEmpty() {
  try {
    const docRef = doc(db, COLLECTIONS.SETTINGS, 'company');
    const snapshot = await getDocs(collection(db, COLLECTIONS.SETTINGS));
    if (snapshot.empty) {
      await setDoc(docRef, {
        ...initialCompanySettings,
        updated_at: new Date().toISOString()
      });
      // Also mirror to RTDB
      try {
        await rtdbSet(rtdbRef(rtdb, 'company_settings'), initialCompanySettings);
      } catch (e) {
        // RTDB optional mirror
      }
    }
  } catch (error) {
    console.warn('[Firebase] Settings seed notice:', error.message);
  }
}

/**
 * Compress an image file using Canvas to a lightweight Data URL (max width 1200px, 80% JPEG)
 */
export function compressImageToDataUrl(file, maxWidth = 1200, quality = 0.8) {
  return new Promise((resolve) => {
    if (!file || !(file instanceof File || file instanceof Blob)) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

/**
 * Upload a file to Firebase Storage and get download URL.
 * Falls back to compressed Base64 Data URL if storage is unauthorized/offline/failing.
 */
export async function uploadFileToStorage(file, folder = 'uploads') {
  if (!file) return null;
  try {
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const fileRef = storageRef(storage, `${folder}/${fileName}`);
    const snapshot = await uploadBytes(fileRef, file);
    return await getDownloadURL(snapshot.ref);
  } catch (err) {
    console.warn('[Firebase Storage] Notice (converting to compressed Data URL):', err.message);
    return await compressImageToDataUrl(file);
  }
}

// ----------------- GENERIC REAL-TIME CRUD HELPERS -----------------

export function subscribeToCollection(collectionName, callback, orderField = null) {
  try {
    let q = collection(db, collectionName);
    if (orderField) {
      q = query(q, orderBy(orderField, 'desc'));
    }
    return onSnapshot(q, (snapshot) => {
      const items = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      callback(items);
    }, (error) => {
      console.warn(`[Firebase] Listener error for ${collectionName}:`, error.message);
    });
  } catch (err) {
    console.warn(`[Firebase] Subscribe error for ${collectionName}:`, err.message);
    return () => {};
  }
}

export async function addFirestoreDoc(collectionName, data, customId = null) {
  try {
    const payload = {
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    if (customId) {
      await setDoc(doc(db, collectionName, String(customId)), payload);
      return customId;
    } else {
      const docRef = await addDoc(collection(db, collectionName), payload);
      return docRef.id;
    }
  } catch (error) {
    console.error(`[Firebase] Error adding doc to ${collectionName}:`, error);
    throw error;
  }
}

export async function updateFirestoreDoc(collectionName, docId, updates) {
  try {
    const docRef = doc(db, collectionName, String(docId));
    await updateDoc(docRef, {
      ...updates,
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error(`[Firebase] Error updating doc in ${collectionName}:`, error);
    throw error;
  }
}

export async function deleteFirestoreDoc(collectionName, docId) {
  try {
    await deleteDoc(doc(db, collectionName, String(docId)));
  } catch (error) {
    console.error(`[Firebase] Error deleting doc from ${collectionName}:`, error);
    throw error;
  }
}

// ----------------- REALTIME DATABASE SYNC -----------------

export async function syncToRealtimeDatabase(path, data) {
  try {
    await rtdbSet(rtdbRef(rtdb, path), data);
  } catch (err) {
    console.warn(`[Firebase RTDB] Notice syncing to ${path}:`, err.message);
  }
}

export function subscribeToRealtimeDatabase(path, callback) {
  try {
    const dbRef = rtdbRef(rtdb, path);
    return onValue(dbRef, (snapshot) => {
      callback(snapshot.val());
    });
  } catch (err) {
    console.warn(`[Firebase RTDB] Listen error for ${path}:`, err.message);
    return () => {};
  }
}
