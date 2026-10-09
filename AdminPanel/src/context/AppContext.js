import React, { createContext, useContext, useState, useEffect } from 'react';
import { exportToXLS, exportToPDF } from '../utils/exportUtils';
import {
  initialEnquiries,
  initialProjects,
  initialExpenses,
  initialPurchases,
  initialPayments,
  initialAppointments,
  monthlyFinancialOverview,
  initialUsers,
  initialDropdownMasters,
  masterCategoriesMeta,
  initialContactEnquiries,
  initialSites,
  SITE_COLUMNS_SPEC,
  initialCompanySettings,
  DEFAULT_PAYMENT_BREAKUP_STAGES,
  PAYMENT_BREAKUP_COLUMNS_SPEC,
  DEFAULT_MONTHLY_BILLING_AREAS,
  DEFAULT_MONTHLY_BILLING_AMENITIES
} from '../data/initialData';
import {
  COLLECTIONS,
  seedCollectionIfEmpty,
  seedSettingsIfEmpty,
  subscribeToCollection,
  addFirestoreDoc,
  updateFirestoreDoc,
  deleteFirestoreDoc,
  syncToRealtimeDatabase,
  uploadFileToStorage
} from '../services/firebaseService';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('yeloline_admin_auth') === 'true';
  });
  const [activeTab, setActiveTabState] = useState(() => {
    return localStorage.getItem('yeloline_admin_tab') || 'dashboard';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [theme] = useState('light'); // Website default light theme
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 1024);
  const [isSplashLoading, setIsSplashLoading] = useState(true);

  const triggerSplashLoader = () => {
    setIsSplashLoading(true);
  };

  const handleSplashComplete = () => {
    setIsSplashLoading(false);
  };

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    localStorage.setItem('yeloline_admin_tab', tab);
  };

  const login = (email, password) => {
    if (email === 'admin@yeloline.com' && password === 'admin@123') {
      localStorage.setItem('yeloline_admin_auth', 'true');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('yeloline_admin_auth');
    localStorage.removeItem('yeloline_admin_tab');
    setIsAuthenticated(false);
  };
  const [notifications, setNotifications] = useState([]);

  // Synchronize authentication & active tab state across multiple browser tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'yeloline_admin_auth') {
        setIsAuthenticated(e.newValue === 'true');
      }
      if (e.key === 'yeloline_admin_tab' && e.newValue) {
        setActiveTabState(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Handle responsive sidebar collapse on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Module Data States (synced real-time from Firebase)
  const [enquiries, setEnquiries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [masterHighlights, setMasterHighlights] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [payments, setPayments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [sites, setSites] = useState([]);
  const [additionalBillings, setAdditionalBillings] = useState([]);
  const [paymentBreakups, setPaymentBreakups] = useState([]);
  const [monthlyBillings, setMonthlyBillings] = useState([]);
  const [contactEnquiries, setContactEnquiries] = useState([]);
  const [users, setUsers] = useState([]);
  const [dropdownMasters, setDropdownMasters] = useState(initialDropdownMasters);
  const [adminMasterGroupFilter, setAdminMasterGroupFilter] = useState('All');

  // Company Settings State
  const [companySettings, setCompanySettingsState] = useState(() => {
    const saved = localStorage.getItem('yeloline_company_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialCompanySettings;
      }
    }
    return initialCompanySettings;
  });

  // ----------------- FIREBASE REAL-TIME SYNC & AUTO SEEDING -----------------
  useEffect(() => {
    let isMounted = true;

    // 1. Seed initial data into Firebase Firestore if collections are empty
    const seedFirebaseData = async () => {
      try {
        await seedCollectionIfEmpty(COLLECTIONS.ENQUIRIES, initialEnquiries, 'enquiry_id');
        await seedCollectionIfEmpty(COLLECTIONS.PROJECTS, initialProjects, 'project_id');
        await seedCollectionIfEmpty(COLLECTIONS.SITES, initialSites, 'site_id');
        await seedCollectionIfEmpty(COLLECTIONS.EXPENSES, initialExpenses, 'expense_id');
        await seedCollectionIfEmpty(COLLECTIONS.PURCHASES, initialPurchases, 'purchase_id');
        await seedCollectionIfEmpty(COLLECTIONS.PAYMENTS, initialPayments, 'payment_id');
        await seedCollectionIfEmpty(COLLECTIONS.APPOINTMENTS, initialAppointments, 'appointment_id');
        await seedCollectionIfEmpty(COLLECTIONS.CONTACT_ENQUIRIES, initialContactEnquiries, 'contact_id');
        await seedCollectionIfEmpty(COLLECTIONS.USERS, initialUsers, 'user_id');
        await seedCollectionIfEmpty(COLLECTIONS.DROPDOWN_MASTERS, initialDropdownMasters, 'id');
        await seedSettingsIfEmpty();
      } catch (err) {
        console.warn('[Firebase Seed] Notice:', err.message);
      }
    };
    seedFirebaseData();

    // 2. Real-time Firestore Subscriptions
    const unsubEnquiries = subscribeToCollection(COLLECTIONS.ENQUIRIES, (data) => {
      if (isMounted && data && data.length > 0) setEnquiries(data);
    });

    const unsubProjects = subscribeToCollection(COLLECTIONS.PROJECTS, (data) => {
      if (isMounted && data && data.length > 0) {
        const normalized = data.map(p => {
          const rawGallery = p.gallery_images || p.galleryImages || [];
          const normalizedGallery = rawGallery.map((img, i) => {
            if (typeof img === 'string') return { id: `img-${i}`, url: img, tag: 'Elevation' };
            return { id: img.id || `img-${i}`, url: img.url || '', tag: img.tag || 'Elevation' };
          });
          const cover = p.cover_image || p.heroImageUrl || (normalizedGallery[0]?.url) || '';

          return {
            ...p,
            project_id: p.project_id || p.id,
            cover_image: cover,
            heroImageUrl: cover,
            overview: p.overview || p.description || '',
            description: p.description || p.overview || '',
            gallery_images: normalizedGallery,
            galleryImages: normalizedGallery.map(g => g.url)
          };
        });
        setProjects(normalized);
      }
    });

    const unsubSites = subscribeToCollection(COLLECTIONS.SITES, (data) => {
      if (isMounted && Array.isArray(data)) setSites(data);
    });

    const unsubExpenses = subscribeToCollection(COLLECTIONS.EXPENSES, (data) => {
      if (isMounted && Array.isArray(data)) setExpenses(data);
    });

    const unsubPurchases = subscribeToCollection(COLLECTIONS.PURCHASES, (data) => {
      if (isMounted && Array.isArray(data)) setPurchases(data);
    });

    const unsubPayments = subscribeToCollection(COLLECTIONS.PAYMENTS, (data) => {
      if (isMounted && Array.isArray(data)) setPayments(data);
    });

    const unsubAdditionalBilling = subscribeToCollection(COLLECTIONS.ADDITIONAL_BILLING, (data) => {
      if (isMounted && Array.isArray(data)) setAdditionalBillings(data);
    });

    const unsubPaymentBreakups = subscribeToCollection(COLLECTIONS.PAYMENT_BREAKUPS, (data) => {
      if (isMounted && Array.isArray(data)) setPaymentBreakups(data);
    });

    const unsubMonthlyBillings = subscribeToCollection(COLLECTIONS.MONTHLY_BILLINGS, (data) => {
      if (isMounted && Array.isArray(data)) setMonthlyBillings(data);
    });

    const unsubAppointments = subscribeToCollection(COLLECTIONS.APPOINTMENTS, (data) => {
      if (isMounted && Array.isArray(data)) setAppointments(data);
    });

    const unsubContactEnquiries = subscribeToCollection(COLLECTIONS.CONTACT_ENQUIRIES, (data) => {
      if (isMounted && Array.isArray(data)) setContactEnquiries(data);
    });

    const unsubUsers = subscribeToCollection(COLLECTIONS.USERS, (data) => {
      if (isMounted && Array.isArray(data)) setUsers(data);
    });

    const unsubDropdownMasters = subscribeToCollection(COLLECTIONS.DROPDOWN_MASTERS, (data) => {
      if (isMounted && Array.isArray(data) && data.length > 0) setDropdownMasters(data);
    });

    const unsubSettings = subscribeToCollection(COLLECTIONS.SETTINGS, (data) => {
      if (isMounted && data) {
        const companyDoc = data.find(d => d.id === 'company');
        if (companyDoc) {
          setCompanySettingsState(companyDoc);
          localStorage.setItem('yeloline_company_settings', JSON.stringify(companyDoc));
        }
      }
    });

    return () => {
      isMounted = false;
      unsubEnquiries && unsubEnquiries();
      unsubProjects && unsubProjects();
      unsubSites && unsubSites();
      unsubExpenses && unsubExpenses();
      unsubPurchases && unsubPurchases();
      unsubPayments && unsubPayments();
      unsubAdditionalBilling && unsubAdditionalBilling();
      unsubPaymentBreakups && unsubPaymentBreakups();
      unsubMonthlyBillings && unsubMonthlyBillings();
      unsubAppointments && unsubAppointments();
      unsubContactEnquiries && unsubContactEnquiries();
      unsubUsers && unsubUsers();
      unsubDropdownMasters && unsubDropdownMasters();
      unsubSettings && unsubSettings();
    };
  }, []);

  // Settings State & Handlers
  const updateCompanySettings = async (newSettings) => {
    setCompanySettingsState(newSettings);
    localStorage.setItem('yeloline_company_settings', JSON.stringify(newSettings));
    addNotification('Company contact numbers & WhatsApp settings updated successfully!');
    try {
      await addFirestoreDoc(COLLECTIONS.SETTINGS, newSettings, 'company');
      await syncToRealtimeDatabase('company_settings', newSettings);
    } catch (e) {
      console.warn('Firebase settings update notice:', e);
    }
  };

  // User / Customer Master Handlers (Firestore Sync)
  const addUser = async (userData) => {
    const uId = userData.user_id || userData.id || `CUST-${Date.now()}`;
    const newUser = {
      ...userData,
      user_id: uId,
      id: uId,
      name: userData.name || userData.full_name || 'Unnamed Customer',
      full_name: userData.full_name || userData.name || 'Unnamed Customer',
      phone: userData.phone || '',
      email: userData.email || '',
      location: userData.location || 'Erode, TN',
      source: userData.source || 'Direct Contact',
      status: userData.status || 'Active',
      avatar_color: userData.avatar_color || '#8B5CF6',
      created_at: new Date().toISOString()
    };
    setUsers(prev => [newUser, ...prev]);
    addNotification(`Added customer: ${newUser.name}`);
    try {
      await addFirestoreDoc(COLLECTIONS.USERS, newUser, uId);
    } catch (e) {
      console.error('Firebase addUser error:', e);
    }
  };

  const updateUser = async (user_id, updatedData) => {
    const uId = typeof user_id === 'string' ? user_id : (user_id.user_id || user_id.id);
    const dataToUpdate = typeof user_id === 'string' ? updatedData : user_id;
    const formatted = {
      ...dataToUpdate,
      name: dataToUpdate.name || dataToUpdate.full_name,
      full_name: dataToUpdate.full_name || dataToUpdate.name,
      updated_at: new Date().toISOString()
    };
    setUsers(prev => prev.map(u => (u.user_id === uId || u.id === uId) ? { ...u, ...formatted } : u));
    addNotification(`Updated customer: ${formatted.name || uId}`);
    try {
      await updateFirestoreDoc(COLLECTIONS.USERS, uId, formatted);
    } catch (e) {
      console.error('Firebase updateUser error:', e);
    }
  };

  const deleteUser = async (user_id) => {
    setUsers(prev => prev.filter(u => u.user_id !== user_id && u.id !== user_id));
    addNotification(`Deleted customer record ${user_id}`);
    try {
      await deleteFirestoreDoc(COLLECTIONS.USERS, user_id);
    } catch (e) {
      console.error('Firebase deleteUser error:', e);
    }
  };

  const importUsers = async (importedArray) => {
    const formatted = importedArray.map((r, idx) => ({
      ...r,
      user_id: r.user_id || r.id || `CUST-IMP-${Date.now()}-${idx}`,
      id: r.user_id || r.id || `CUST-IMP-${Date.now()}-${idx}`,
      name: r.name || r.full_name || 'Customer',
      full_name: r.full_name || r.name || 'Customer',
      phone: r.phone || '',
      email: r.email || '',
      location: r.location || 'Erode, TN',
      source: r.source || 'CSV Import',
      status: r.status || 'Active',
      avatar_color: '#EC4899',
      created_at: new Date().toISOString()
    }));
    setUsers(prev => [...formatted, ...prev]);
    addNotification(`Successfully imported ${formatted.length} customers from CSV`);
    for (const cust of formatted) {
      try {
        await addFirestoreDoc(COLLECTIONS.USERS, cust, cust.user_id);
      } catch (e) { }
    }
  };

  const toggleUserStatus = async (user_id) => {
    const target = users.find(u => u.user_id === user_id || u.id === user_id);
    if (!target) return;
    const newStatus = target.status === 'Active' ? 'Inactive' : 'Active';
    setUsers(prev => prev.map(u => (u.user_id === user_id || u.id === user_id) ? { ...u, status: newStatus } : u));
    addNotification(`Changed user status of ${target.name || target.full_name} to ${newStatus}`);
    try {
      await updateFirestoreDoc(COLLECTIONS.USERS, user_id, { status: newStatus });
    } catch (e) {
      console.error('Firebase toggleUserStatus error:', e);
    }
  };

  // Dropdown Master States & Handlers
  const selectAdminMasterGroup = (groupKey) => {
    setAdminMasterGroupFilter(groupKey || 'All');
    setActiveTab('admin_master');
  };

  const addDropdownOption = async (optionData) => {
    const newOption = {
      ...optionData,
      id: optionData.id || `DM-${1300 + dropdownMasters.length}`,
      status: optionData.status || 'Active',
      sort_order: Number(optionData.sort_order) || (dropdownMasters.length + 1)
    };
    setDropdownMasters(prev => [...prev, newOption]);
    addNotification(`Added new dropdown option "${newOption.label}" under category "${newOption.category}"`);
    try {
      await addFirestoreDoc(COLLECTIONS.DROPDOWN_MASTERS, newOption, newOption.id);
    } catch (e) {
      console.error('Firebase addDropdownOption error:', e);
    }
  };

  const updateDropdownOption = async (updatedOption) => {
    setDropdownMasters(prev => prev.map(item => item.id === updatedOption.id ? updatedOption : item));
    addNotification(`Updated dropdown option: "${updatedOption.label}"`);
    try {
      await updateFirestoreDoc(COLLECTIONS.DROPDOWN_MASTERS, updatedOption.id, updatedOption);
    } catch (e) {
      console.error('Firebase updateDropdownOption error:', e);
    }
  };

  const deleteDropdownOption = async (id) => {
    const target = dropdownMasters.find(item => item.id === id);
    setDropdownMasters(prev => prev.filter(item => item.id !== id));
    if (target) {
      addNotification(`Deleted dropdown option "${target.label}"`);
    }
    try {
      await deleteFirestoreDoc(COLLECTIONS.DROPDOWN_MASTERS, id);
    } catch (e) {
      console.error('Firebase deleteDropdownOption error:', e);
    }
  };

  const toggleDropdownOptionStatus = async (id) => {
    const target = dropdownMasters.find(item => item.id === id);
    if (!target) return;
    const newStatus = target.status === 'Active' ? 'Inactive' : 'Active';
    setDropdownMasters(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
    addNotification(`Toggled status of option "${target.label}" to ${newStatus}`);
    try {
      await updateFirestoreDoc(COLLECTIONS.DROPDOWN_MASTERS, id, { status: newStatus });
    } catch (e) {
      console.error('Firebase toggleDropdownOptionStatus error:', e);
    }
  };

  const resetDropdownMastersToDefault = async () => {
    setDropdownMasters(initialDropdownMasters);
    addNotification(`Reset all master dropdown options to system defaults`);
    for (const item of initialDropdownMasters) {
      try {
        await addFirestoreDoc(COLLECTIONS.DROPDOWN_MASTERS, item, item.id);
      } catch (e) {
        // Continue
      }
    }
  };

  const getDropdownOptionsByCategory = (categoryKey) => {
    return dropdownMasters
      .filter(item => item.category === categoryKey && item.status === 'Active')
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(item => item.label);
  };

  const addMasterHighlight = (newHighlight) => {
    if (!newHighlight || !newHighlight.trim()) return;
    const trimmed = newHighlight.trim();
    if (!masterHighlights.includes(trimmed)) {
      setMasterHighlights(prev => [...prev, trimmed]);
      addNotification(`Added new architectural highlight option: "${trimmed}"`);
    }
  };

  // Apply theme to document root attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  const addNotification = (text) => {
    const newNotif = {
      id: Date.now(),
      text,
      time: "Just now",
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Enquiries Handlers (CUSTOMER UPDATES)
  const addEnquiry = async (enquiryData) => {
    const newEnquiry = {
      ...enquiryData,
      enquiry_id: enquiryData.enquiry_id || `ENQ-2026-00${enquiries.length + 1}`,
      enquiry_date: enquiryData.enquiry_date || new Date().toISOString().split('T')[0]
    };
    setEnquiries(prev => [newEnquiry, ...prev]);
    addNotification(`Created new lead: ${newEnquiry.client_name}`);
    try {
      await addFirestoreDoc(COLLECTIONS.ENQUIRIES, newEnquiry, newEnquiry.enquiry_id);
    } catch (e) {
      console.error('Firebase addEnquiry error:', e);
    }
  };

  const updateEnquiryStage = async (enquiry_id, newStage) => {
    setEnquiries(prev => prev.map(e => e.enquiry_id === enquiry_id ? { ...e, lead_stage: newStage } : e));
    addNotification(`Updated lead stage for ${enquiry_id} to ${newStage}`);
    try {
      await updateFirestoreDoc(COLLECTIONS.ENQUIRIES, enquiry_id, { lead_stage: newStage });
    } catch (e) {
      console.error('Firebase updateEnquiryStage error:', e);
    }
  };

  const deleteEnquiry = async (enquiry_id) => {
    setEnquiries(prev => prev.filter(e => e.enquiry_id !== enquiry_id));
    addNotification(`Deleted enquiry ${enquiry_id}`);
    try {
      await deleteFirestoreDoc(COLLECTIONS.ENQUIRIES, enquiry_id);
    } catch (e) {
      console.error('Firebase deleteEnquiry error:', e);
    }
  };

  // Projects Handlers (CUSTOMER UPDATES -> Reflects in Flutter Mobile App)
  const addProject = async (projectData) => {
    const pId = projectData.project_id || `PRJ-${101 + projects.length}`;
    const firstGalleryUrl = (projectData.gallery_images && projectData.gallery_images[0])
      ? (typeof projectData.gallery_images[0] === 'string' ? projectData.gallery_images[0] : (projectData.gallery_images[0].url || ''))
      : '';
    const cover = projectData.cover_image || projectData.heroImageUrl || firstGalleryUrl || '';

    const newProject = {
      ...projectData,
      project_id: pId,
      id: pId,
      title: projectData.title || 'New Project',
      category: projectData.category || 'Villa',
      status: projectData.status || 'Ongoing',
      location: projectData.location || 'Erode, Tamil Nadu',
      cover_image: cover,
      heroImageUrl: cover,
      gallery_images: projectData.gallery_images || [],
      galleryImages: (projectData.gallery_images || []).map(img => typeof img === 'string' ? img : (img.url || '')),
      highlights: projectData.highlights || [],
      quality_standards: projectData.quality_standards || [],
      features: projectData.quality_standards || [],
      materials: projectData.quality_standards || [],
      overview: projectData.overview || projectData.description || '',
      description: projectData.overview || projectData.description || '',
      featured: projectData.featured || false
    };
    setProjects(prev => [newProject, ...prev]);
    addNotification(`Added new portfolio project: ${newProject.title}`);
    try {
      await addFirestoreDoc(COLLECTIONS.PROJECTS, newProject, pId);
      await syncToRealtimeDatabase(`projects/${pId}`, newProject);
    } catch (e) {
      console.error('Firebase addProject error:', e);
    }
  };

  const editProject = async (updatedProject) => {
    const pId = updatedProject.project_id || updatedProject.id;
    const firstGalleryUrl = (updatedProject.gallery_images && updatedProject.gallery_images[0])
      ? (typeof updatedProject.gallery_images[0] === 'string' ? updatedProject.gallery_images[0] : (updatedProject.gallery_images[0].url || ''))
      : '';
    const cover = updatedProject.cover_image || updatedProject.heroImageUrl || firstGalleryUrl || '';

    const projectWithAliases = {
      ...updatedProject,
      project_id: pId,
      id: pId,
      heroImageUrl: cover,
      cover_image: cover,
      overview: updatedProject.overview || updatedProject.description || '',
      description: updatedProject.overview || updatedProject.description || '',
      galleryImages: (updatedProject.gallery_images || []).map(img => typeof img === 'string' ? img : (img.url || '')),
      features: updatedProject.quality_standards || updatedProject.features || [],
      materials: updatedProject.quality_standards || updatedProject.materials || []
    };
    setProjects(prev => prev.map(p => (p.project_id === pId || p.id === pId) ? projectWithAliases : p));
    addNotification(`Updated project details for ${updatedProject.title}`);
    try {
      await updateFirestoreDoc(COLLECTIONS.PROJECTS, pId, projectWithAliases);
      await syncToRealtimeDatabase(`projects/${pId}`, projectWithAliases);
    } catch (e) {
      console.error('Firebase editProject error:', e);
    }
  };

  const deleteProject = async (project_id) => {
    setProjects(prev => prev.filter(p => p.project_id !== project_id && p.id !== project_id));
    addNotification(`Deleted project ${project_id}`);
    try {
      await deleteFirestoreDoc(COLLECTIONS.PROJECTS, project_id);
    } catch (e) {
      console.error('Firebase deleteProject error:', e);
    }
  };

  const toggleFeaturedProject = async (project_id) => {
    const target = projects.find(p => p.project_id === project_id || p.id === project_id);
    const newFeatured = target ? !target.featured : true;
    setProjects(prev => prev.map(p => (p.project_id === project_id || p.id === project_id) ? { ...p, featured: newFeatured } : p));
    try {
      await updateFirestoreDoc(COLLECTIONS.PROJECTS, project_id, { featured: newFeatured });
    } catch (e) {
      console.error('Firebase toggleFeaturedProject error:', e);
    }
  };

  // Sites Handlers (ADMIN MASTER)
  const addSite = async (siteData) => {
    const newSite = {
      ...siteData,
      site_id: siteData.site_id || `SITE-${101 + sites.length}`,
      progress_percentage: Number(siteData.progress_percentage) || 0,
      builtup_area_sqft: Number(siteData.builtup_area_sqft) || 0,
      estimated_budget: Number(siteData.estimated_budget) || 0,
      status: siteData.status || 'Planning'
    };
    setSites(prev => [newSite, ...prev]);
    addNotification(`Created new site record: ${newSite.site_name} (${newSite.site_id})`);
    try {
      await addFirestoreDoc(COLLECTIONS.SITES, newSite, newSite.site_id);
      await syncToRealtimeDatabase(`sites/${newSite.site_id}`, newSite);
    } catch (e) {
      console.error('Firebase addSite error:', e);
    }
  };

  const updateSite = async (updatedSite) => {
    const sId = updatedSite.site_id || updatedSite.id;
    const formatted = {
      ...updatedSite,
      progress_percentage: Number(updatedSite.progress_percentage) || 0,
      builtup_area_sqft: Number(updatedSite.builtup_area_sqft) || 0,
      estimated_budget: Number(updatedSite.estimated_budget) || 0
    };
    setSites(prev => prev.map(s => (s.site_id === sId || s.id === sId) ? formatted : s));
    addNotification(`Updated site details for ${updatedSite.site_name}`);
    try {
      await updateFirestoreDoc(COLLECTIONS.SITES, sId, formatted);
      await syncToRealtimeDatabase(`sites/${sId}`, formatted);
    } catch (e) {
      console.error('Firebase updateSite error:', e);
    }
  };

  const deleteSite = async (site_id) => {
    const siteToDelete = sites.find(s => s.site_id === site_id || s.id === site_id);
    setSites(prev => prev.filter(s => s.site_id !== site_id && s.id !== site_id));
    if (siteToDelete) {
      addNotification(`Deleted site record ${siteToDelete.site_name}`);
    }
    try {
      await deleteFirestoreDoc(COLLECTIONS.SITES, site_id);
    } catch (e) {
      console.error('Firebase deleteSite error:', e);
    }
  };

  const importSites = async (importedArray) => {
    const formatted = importedArray.map((r, idx) => ({
      ...r,
      site_id: r.site_id || `SITE-IMP${idx + 1}`,
      builtup_area_sqft: Number(r.builtup_area_sqft || 0),
      estimated_budget: Number(r.estimated_budget || 0),
      progress_percentage: Number(r.progress_percentage || 0),
      status: r.status || "Planning"
    }));
    setSites(prev => [...formatted, ...prev]);
    addNotification(`Successfully imported ${formatted.length} construction site records from CSV`);
    for (const site of formatted) {
      try {
        await addFirestoreDoc(COLLECTIONS.SITES, site, site.site_id);
      } catch (e) { }
    }
  };

  // Expenses Handlers (ADMIN MASTER)
  const addExpense = async (expenseData) => {
    const newExpense = {
      ...expenseData,
      expense_id: expenseData.expense_id || `EXP-${801 + expenses.length}`,
      date: expenseData.date || new Date().toISOString().split('T')[0]
    };
    setExpenses(prev => [newExpense, ...prev]);
    addNotification(`Logged ₹${newExpense.amount} site expense for ${newExpense.site_name}`);
    try {
      await addFirestoreDoc(COLLECTIONS.EXPENSES, newExpense, newExpense.expense_id);
    } catch (e) {
      console.error('Firebase addExpense error:', e);
    }
  };

  const deleteExpense = async (expense_id) => {
    setExpenses(prev => prev.filter(e => e.expense_id !== expense_id && e.id !== expense_id));
    try {
      await deleteFirestoreDoc(COLLECTIONS.EXPENSES, expense_id);
    } catch (e) {
      console.error('Firebase deleteExpense error:', e);
    }
  };

  // Purchases Handlers (ADMIN MASTER)
  const addPurchase = async (purchaseData) => {
    const total = Number(purchaseData.total_amount || 0);
    const paid = Number(purchaseData.amount_paid || 0);
    let payStatus = "Unpaid";
    if (paid >= total && total > 0) {
      payStatus = "Paid";
    } else if (paid > 0) {
      payStatus = "Partially Paid";
    }

    const newPO = {
      purchase_id: purchaseData.purchase_id || `PO-${301 + purchases.length}`,
      site_name: purchaseData.site_name || "",
      department: purchaseData.department || "",
      vendor_name: purchaseData.vendor_name || "",
      material_category: purchaseData.material_category || "",
      order_date: purchaseData.order_date || new Date().toISOString().split('T')[0],
      total_amount: total,
      amount_paid: paid,
      entered_by: purchaseData.entered_by || "Suriya prakash",
      delivery_status: purchaseData.delivery_status || "Ordered",
      payment_status: payStatus,
      invoice_number: purchaseData.invoice_number || `INV-PO-${301 + purchases.length}`
    };
    setPurchases(prev => [newPO, ...prev]);
    addNotification(`Created material purchase order ${newPO.purchase_id} for ${newPO.site_name}`);
    try {
      await addFirestoreDoc(COLLECTIONS.PURCHASES, newPO, newPO.purchase_id);
    } catch (e) {
      console.error('Firebase addPurchase error:', e);
    }
  };

  const deletePurchase = async (purchase_id, docId = null) => {
    const targetId = docId || purchase_id;
    setPurchases(prev => prev.filter(p => p.purchase_id !== purchase_id && p.id !== purchase_id && p.id !== targetId));
    try {
      await deleteFirestoreDoc(COLLECTIONS.PURCHASES, targetId);
    } catch (e) {
      console.error('Firebase deletePurchase error:', e);
    }
  };

  const updatePurchaseDeliveryStatus = async (purchase_id, status) => {
    setPurchases(prev => prev.map(p => (p.purchase_id === purchase_id || p.id === purchase_id) ? { ...p, delivery_status: status } : p));
    try {
      await updateFirestoreDoc(COLLECTIONS.PURCHASES, purchase_id, { delivery_status: status });
    } catch (e) {
      console.error('Firebase updatePurchaseDeliveryStatus error:', e);
    }
  };

  const updatePurchasePaymentStatus = async (purchase_id, status) => {
    setPurchases(prev => prev.map(p => (p.purchase_id === purchase_id || p.id === purchase_id) ? { ...p, payment_status: status } : p));
    try {
      await updateFirestoreDoc(COLLECTIONS.PURCHASES, purchase_id, { payment_status: status });
    } catch (e) {
      console.error('Firebase updatePurchasePaymentStatus error:', e);
    }
  };

  // Payments Handlers (ADMIN MASTER)
  const addPayment = async (paymentData) => {
    const newPayment = {
      ...paymentData,
      payment_id: paymentData.payment_id || `PAY-${701 + payments.length}`,
      payment_date: paymentData.payment_date || new Date().toISOString().split('T')[0]
    };
    setPayments(prev => [newPayment, ...prev]);
    addNotification(`Recorded client payment ₹${newPayment.amount_received} for ${newPayment.site_name || newPayment.client_name}`);
    try {
      await addFirestoreDoc(COLLECTIONS.PAYMENTS, newPayment, newPayment.payment_id);
    } catch (e) {
      console.error('Firebase addPayment error:', e);
    }
  };

  const deletePayment = async (payment_id) => {
    setPayments(prev => prev.filter(p => p.payment_id !== payment_id && p.id !== payment_id));
    try {
      await deleteFirestoreDoc(COLLECTIONS.PAYMENTS, payment_id);
    } catch (e) {
      console.error('Firebase deletePayment error:', e);
    }
  };

  // Additional Billing Handlers
  const addAdditionalBilling = async (billingData) => {
    const newBill = {
      ...billingData,
      bill_id: billingData.bill_id || `ADD-BILL-${101 + additionalBillings.length}`,
      created_at: new Date().toISOString()
    };
    setAdditionalBillings(prev => [newBill, ...prev]);
    addNotification(`Created Additional Billing ${newBill.bill_id} for ${newBill.site_name || newBill.client_name}`);
    try {
      await addFirestoreDoc(COLLECTIONS.ADDITIONAL_BILLING, newBill, newBill.bill_id);
    } catch (e) {
      console.error('Firebase addAdditionalBilling error:', e);
    }
  };

  const updateAdditionalBilling = async (bill_id, updatedData) => {
    const existing = additionalBillings.find(b => b.bill_id === bill_id || b.id === bill_id);
    const targetDocId = existing?.id || bill_id;
    setAdditionalBillings(prev => prev.map(b => (b.bill_id === bill_id || b.id === bill_id || b.bill_id === targetDocId || b.id === targetDocId) ? { ...b, ...updatedData, id: targetDocId } : b));
    addNotification(`Updated Additional Work for ${updatedData.site_name || existing?.site_name || 'Client'}`);
    try {
      await updateFirestoreDoc(COLLECTIONS.ADDITIONAL_BILLING, targetDocId, updatedData);
      if (existing?.bill_id && existing.bill_id !== targetDocId) {
        await updateFirestoreDoc(COLLECTIONS.ADDITIONAL_BILLING, existing.bill_id, updatedData);
      }
    } catch (e) {
      console.error('Firebase updateAdditionalBilling error:', e);
    }
  };

  const deleteAdditionalBilling = async (bill_id) => {
    setAdditionalBillings(prev => prev.filter(b => b.bill_id !== bill_id && b.id !== bill_id));
    try {
      await deleteFirestoreDoc(COLLECTIONS.ADDITIONAL_BILLING, bill_id);
    } catch (e) {
      console.error('Firebase deleteAdditionalBilling error:', e);
    }
  };

  // Payment Breakup Handlers
  const savePaymentBreakup = async (breakupRecord) => {
    const docId = String(breakupRecord.id || breakupRecord.site_name || `breakup_${Date.now()}`);
    const payload = {
      ...breakupRecord,
      id: docId,
      updated_at: new Date().toISOString()
    };
    setPaymentBreakups(prev => {
      const index = prev.findIndex(b => (b.id === docId || b.site_name === breakupRecord.site_name));
      if (index >= 0) {
        const next = [...prev];
        next[index] = payload;
        return next;
      }
      return [payload, ...prev];
    });
    try {
      await addFirestoreDoc(COLLECTIONS.PAYMENT_BREAKUPS, payload, docId);
    } catch (e) {
      console.error('Firebase savePaymentBreakup error:', e);
    }
  };

  const deletePaymentBreakup = async (docId) => {
    setPaymentBreakups(prev => prev.filter(b => b.id !== docId && b.site_name !== docId));
    try {
      await deleteFirestoreDoc(COLLECTIONS.PAYMENT_BREAKUPS, String(docId));
    } catch (e) {
      console.error('Firebase deletePaymentBreakup error:', e);
    }
  };

  // Monthly Billing Handlers (CUSTOMERS UPDATES -> Monthly Billing)
  const saveMonthlyBilling = async (billingRecord) => {
    const docId = String(billingRecord.id || billingRecord.bill_id || `monthly_${Date.now()}`);
    const payload = {
      ...billingRecord,
      id: docId,
      bill_id: billingRecord.bill_id || docId,
      updated_at: new Date().toISOString()
    };
    setMonthlyBillings(prev => {
      const index = prev.findIndex(b => (b.id === docId || (billingRecord.bill_id && b.bill_id === billingRecord.bill_id)));
      if (index >= 0) {
        const next = [...prev];
        next[index] = payload;
        return next;
      }
      return [payload, ...prev];
    });
    try {
      await addFirestoreDoc(COLLECTIONS.MONTHLY_BILLINGS, payload, docId);
      addNotification(`Monthly billing statement saved successfully.`);
    } catch (e) {
      console.error('Firebase saveMonthlyBilling error:', e);
    }
  };

  const deleteMonthlyBilling = async (docId) => {
    setMonthlyBillings(prev => prev.filter(b => b.id !== docId && b.bill_id !== docId));
    try {
      await deleteFirestoreDoc(COLLECTIONS.MONTHLY_BILLINGS, String(docId));
      addNotification('Monthly billing statement deleted.');
    } catch (e) {
      console.error('Firebase deleteMonthlyBilling error:', e);
    }
  };

  // Appointments Handlers (CUSTOMER UPDATES -> Renovation Van Bookings)
  const addAppointment = async (appointmentData) => {
    const newAppointment = {
      ...appointmentData,
      appointment_id: appointmentData.appointment_id || `APT-${501 + appointments.length}`,
      status: appointmentData.status || "Scheduled",
      technician_name: appointmentData.technician_name || "Unassigned"
    };
    setAppointments(prev => [newAppointment, ...prev]);
    addNotification(`Scheduled renovation appointment for ${newAppointment.customer_name}`);
    try {
      await addFirestoreDoc(COLLECTIONS.APPOINTMENTS, newAppointment, newAppointment.appointment_id);
      await syncToRealtimeDatabase(`appointments/${newAppointment.appointment_id}`, newAppointment);
    } catch (e) {
      console.error('Firebase addAppointment error:', e);
    }
  };

  const updateAppointmentStatus = async (appointment_id, status) => {
    setAppointments(prev => prev.map(a => (a.appointment_id === appointment_id || a.id === appointment_id) ? { ...a, status } : a));
    try {
      await updateFirestoreDoc(COLLECTIONS.APPOINTMENTS, appointment_id, { status });
    } catch (e) {
      console.error('Firebase updateAppointmentStatus error:', e);
    }
  };

  const assignTechnician = async (appointment_id, techName) => {
    setAppointments(prev => prev.map(a => (a.appointment_id === appointment_id || a.id === appointment_id) ? { ...a, technician_name: techName, status: "Technician Assigned" } : a));
    addNotification(`Assigned technician ${techName} to appointment ${appointment_id}`);
    try {
      await updateFirestoreDoc(COLLECTIONS.APPOINTMENTS, appointment_id, { technician_name: techName, status: "Technician Assigned" });
    } catch (e) {
      console.error('Firebase assignTechnician error:', e);
    }
  };

  // Contact Enquiries Handlers (CUSTOMER UPDATES -> Contact Form Submissions)
  const addContactEnquiry = async (enquiryData) => {
    const newEntry = {
      contact_id: enquiryData.contact_id || `CNT-${new Date().getFullYear()}-${String(contactEnquiries.length + 1).padStart(3, '0')}`,
      submission_date: enquiryData.submission_date || new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      status: enquiryData.status || 'New',
      ...enquiryData
    };
    setContactEnquiries(prev => [newEntry, ...prev]);
    try {
      await addFirestoreDoc(COLLECTIONS.CONTACT_ENQUIRIES, newEntry, newEntry.contact_id);
    } catch (e) {
      console.error('Firebase addContactEnquiry error:', e);
    }
  };

  const updateContactEnquiryStatus = async (contact_id, newStatus) => {
    setContactEnquiries(prev => prev.map(item => (item.contact_id === contact_id || item.id === contact_id) ? { ...item, status: newStatus } : item));
    try {
      await updateFirestoreDoc(COLLECTIONS.CONTACT_ENQUIRIES, contact_id, { status: newStatus });
    } catch (e) {
      console.error('Firebase updateContactEnquiryStatus error:', e);
    }
  };

  const deleteContactEnquiry = async (contact_id) => {
    setContactEnquiries(prev => prev.filter(item => item.contact_id !== contact_id && item.id !== contact_id));
    try {
      await deleteFirestoreDoc(COLLECTIONS.CONTACT_ENQUIRIES, contact_id);
    } catch (e) {
      console.error('Firebase deleteContactEnquiry error:', e);
    }
  };



  // CSV Exporter Helper
  const exportToCSV = (dataArray, filename) => {
    if (!dataArray || !dataArray.length) return;
    const keys = Object.keys(dataArray[0]).filter(k => typeof dataArray[0][k] !== 'object');
    const csvRows = [];
    csvRows.push(keys.join(','));

    for (const row of dataArray) {
      const values = keys.map(k => {
        const escaped = ('' + (row[k] ?? '')).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `${filename}.csv`);
    a.click();
  };

  // CSV Importer Helpers with Firebase sync
  const importEnquiries = async (importedArray) => {
    const formatted = importedArray.map((r, idx) => ({
      ...r,
      enquiry_id: r.enquiry_id || `ENQ-2026-IMP${idx + 1}`,
      enquiry_date: r.enquiry_date || new Date().toISOString().split('T')[0],
      lead_stage: r.lead_stage || "New Enquiry"
    }));
    setEnquiries(prev => [...formatted, ...prev]);
    addNotification(`Successfully imported ${formatted.length} lead enquiries from CSV`);
    for (const enq of formatted) {
      try {
        await addFirestoreDoc(COLLECTIONS.ENQUIRIES, enq, enq.enquiry_id);
      } catch (e) { }
    }
  };

  const importExpenses = async (importedArray) => {
    const formatted = importedArray.map((r, idx) => ({
      ...r,
      expense_id: r.expense_id || `EXP-IMP${idx + 1}`,
      date: r.date || new Date().toISOString().split('T')[0],
      amount: Number(r.amount || 0)
    }));
    setExpenses(prev => [...formatted, ...prev]);
    addNotification(`Successfully imported ${formatted.length} site expense records from CSV`);
    for (const exp of formatted) {
      try {
        await addFirestoreDoc(COLLECTIONS.EXPENSES, exp, exp.expense_id);
      } catch (e) { }
    }
  };

  const importPurchases = async (importedArray) => {
    const formatted = importedArray.map((r, idx) => ({
      ...r,
      purchase_id: r.purchase_id || `PO-IMP${idx + 1}`,
      order_date: r.order_date || new Date().toISOString().split('T')[0],
      quantity: Number(r.quantity || 1),
      unit_price: Number(r.unit_price || 0),
      total_amount: Number(r.total_amount || 0),
      delivery_status: r.delivery_status || "Ordered",
      payment_status: r.payment_status || "Unpaid"
    }));
    setPurchases(prev => [...formatted, ...prev]);
    addNotification(`Successfully imported ${formatted.length} material purchase orders from CSV`);
    for (const pur of formatted) {
      try {
        await addFirestoreDoc(COLLECTIONS.PURCHASES, pur, pur.purchase_id);
      } catch (e) { }
    }
  };

  const importPayments = async (importedArray) => {
    const formatted = importedArray.map((r, idx) => ({
      ...r,
      payment_id: r.payment_id || `PAY-IMP${idx + 1}`,
      payment_date: r.payment_date || new Date().toISOString().split('T')[0],
      amount_received: Number(r.amount_received || 0)
    }));
    setPayments(prev => [...formatted, ...prev]);
    addNotification(`Successfully imported ${formatted.length} client milestone payments from CSV`);
    for (const pay of formatted) {
      try {
        await addFirestoreDoc(COLLECTIONS.PAYMENTS, pay, pay.payment_id);
      } catch (e) { }
    }
  };

  const importAppointments = async (importedArray) => {
    const formatted = importedArray.map((r, idx) => ({
      ...r,
      appointment_id: r.appointment_id || `APT-IMP${idx + 1}`,
      appointment_date: r.appointment_date || new Date().toISOString().split('T')[0],
      status: r.status || "Scheduled",
      technician_name: r.technician_name || "Unassigned"
    }));
    setAppointments(prev => [...formatted, ...prev]);
    addNotification(`Successfully imported ${formatted.length} renovation appointments from CSV`);
    for (const apt of formatted) {
      try {
        await addFirestoreDoc(COLLECTIONS.APPOINTMENTS, apt, apt.appointment_id);
      } catch (e) { }
    }
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        activeTab,
        setActiveTab,
        isSplashLoading,
        triggerSplashLoader,
        handleSplashComplete,
        searchQuery,
        setSearchQuery,
        theme,
        isSidebarCollapsed,
        toggleSidebar,
        notifications,
        markAllNotificationsRead,
        // Data & Handlers - CUSTOMERS UPDATES
        enquiries,
        addEnquiry,
        updateEnquiryStage,
        deleteEnquiry,
        importEnquiries,
        projects,
        addProject,
        editProject,
        deleteProject,
        toggleFeaturedProject,
        masterHighlights,
        addMasterHighlight,
        appointments,
        addAppointment,
        updateAppointmentStatus,
        assignTechnician,
        importAppointments,
        contactEnquiries,
        addContactEnquiry,
        updateContactEnquiryStatus,
        deleteContactEnquiry,
        companySettings,
        updateCompanySettings,
        // Data & Handlers - ADMIN MASTER (ADMIN UPDATES)
        sites,
        addSite,
        updateSite,
        deleteSite,
        importSites,
        SITE_COLUMNS_SPEC,
        additionalBillings,
        addAdditionalBilling,
        updateAdditionalBilling,
        deleteAdditionalBilling,
        paymentBreakups,
        savePaymentBreakup,
        deletePaymentBreakup,
        DEFAULT_PAYMENT_BREAKUP_STAGES,
        PAYMENT_BREAKUP_COLUMNS_SPEC,
        monthlyBillings,
        saveMonthlyBilling,
        deleteMonthlyBilling,
        DEFAULT_MONTHLY_BILLING_AREAS,
        DEFAULT_MONTHLY_BILLING_AMENITIES,
        expenses,
        addExpense,
        deleteExpense,
        importExpenses,
        purchases,
        addPurchase,
        deletePurchase,
        updatePurchaseDeliveryStatus,
        updatePurchasePaymentStatus,
        importPurchases,
        payments,
        addPayment,
        deletePayment,
        importPayments,
        monthlyFinancialOverview,
        exportToCSV,
        exportToXLS,
        exportToPDF,
        // User Master
        users,
        addUser,
        updateUser,
        deleteUser,
        importUsers,
        toggleUserStatus,
        // Admin Dropdown Master
        dropdownMasters,
        masterCategoriesMeta,
        addDropdownOption,
        updateDropdownOption,
        deleteDropdownOption,
        toggleDropdownOptionStatus,
        resetDropdownMastersToDefault,
        getDropdownOptionsByCategory,
        adminMasterGroupFilter,
        setAdminMasterGroupFilter,
        selectAdminMasterGroup,
        // Firebase Storage helper
        uploadFileToStorage
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
