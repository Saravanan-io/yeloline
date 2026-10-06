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
