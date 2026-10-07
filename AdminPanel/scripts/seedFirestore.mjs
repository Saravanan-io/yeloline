import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import {
  initialEnquiries,
  initialProjects,
  initialExpenses,
  initialPurchases,
  initialPayments,
  initialAppointments,
  initialUsers,
  initialDropdownMasters,
  initialContactEnquiries,
  initialSites,
  initialCompanySettings
} from '../src/data/initialData.js';

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

async function seed() {
  console.log('--- Starting Firestore Migration & Seeding ---');

  // 1. Projects
  console.log(`Seeding ${initialProjects.length} projects...`);
  for (const p of initialProjects) {
    const id = p.project_id || p.id;
    await setDoc(doc(db, 'projects', id), {
      ...p,
      id: id,
      project_id: id,
      heroImageUrl: p.cover_image || p.heroImageUrl || '',
      cover_image: p.cover_image || p.heroImageUrl || '',
      overview: p.overview || p.description || '',
      description: p.overview || p.description || '',
      galleryImages: (p.gallery_images || []).map(img => typeof img === 'string' ? img : (img.url || '')),
      features: p.quality_standards || p.features || [],
      materials: p.quality_standards || p.materials || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  // 2. Enquiries / Leads
  console.log(`Seeding ${initialEnquiries.length} enquiries...`);
  for (const e of initialEnquiries) {
    await setDoc(doc(db, 'enquiries', e.enquiry_id), {
      ...e,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  // 3. Sites
  console.log(`Seeding ${initialSites.length} sites...`);
  for (const s of initialSites) {
    await setDoc(doc(db, 'sites', s.site_id), {
      ...s,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  // 4. Expenses
  console.log(`Seeding ${initialExpenses.length} expenses...`);
  for (const exp of initialExpenses) {
    await setDoc(doc(db, 'expenses', exp.expense_id), {
      ...exp,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  // 5. Purchases
  console.log(`Seeding ${initialPurchases.length} purchases...`);
  for (const pur of initialPurchases) {
    await setDoc(doc(db, 'purchases', pur.purchase_id), {
      ...pur,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  // 6. Payments
  console.log(`Seeding ${initialPayments.length} payments...`);
  for (const pay of initialPayments) {
    await setDoc(doc(db, 'payments', pay.payment_id), {
      ...pay,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  // 7. Appointments
  console.log(`Seeding ${initialAppointments.length} appointments...`);
  for (const apt of initialAppointments) {
    await setDoc(doc(db, 'appointments', apt.appointment_id), {
      ...apt,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  // 8. Contact Enquiries
  console.log(`Seeding ${initialContactEnquiries.length} contact enquiries...`);
  for (const cnt of initialContactEnquiries) {
    await setDoc(doc(db, 'contact_enquiries', cnt.contact_id), {
      ...cnt,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  // 9. Users
  console.log(`Seeding ${initialUsers.length} users...`);
  for (const u of initialUsers) {
    await setDoc(doc(db, 'users', u.user_id), {
      ...u,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  // 10. Dropdown Masters
  console.log(`Seeding ${initialDropdownMasters.length} dropdown options...`);
  for (const dm of initialDropdownMasters) {
    await setDoc(doc(db, 'dropdown_masters', dm.id), {
      ...dm,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  // 11. Company Settings
  console.log('Seeding company settings...');
  await setDoc(doc(db, 'settings', 'company'), {
    ...initialCompanySettings,
    updated_at: new Date().toISOString()
  });

  console.log('=== ALL COLLECTIONS AND DOCUMENTS SUCCESSFULLY SEEDED TO FIRESTORE! ===');
  process.exit(0);
}

seed().catch((err) => {
  console.error('ERROR SEEDING TO FIRESTORE:', err);
  process.exit(1);
});
