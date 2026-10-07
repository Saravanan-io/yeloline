import React, { useState, useMemo } from 'react';
import {
  Building2,
  Plus,
  Search,
  Filter,
  MapPin,
  Calendar,
  User,
  DollarSign,
  Layers,
  Edit3,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Grid,
  List,
  AlertCircle,
  FileSpreadsheet,
  FileText,
  ArrowRight,
  ArrowLeft,
  Phone,
  Lock,
  EyeOff,
  Copy,
  CheckCheck,
  Share2,
  ShieldCheck,
  Calculator,
  ExternalLink,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import DataTable from '../../components/common/DataTable/DataTable';
import Modal from '../../components/common/Modal/Modal';
import CustomSelect from '../../components/common/CustomSelect/CustomSelect';
import CSVImportModal from '../../components/common/CSVImportModal/CSVImportModal';
import '../new_site/NewSiteModule.css';
import './CreateSiteModule.css';

const STRUCTURE_TYPES = [
  "Villa",
  "Residential House",
  "Commercial Building",
  "Renovation & Remodeling",
  "Industrial Warehouse",
  "Apartment Block"
];

const FLOOR_OPTIONS = [
  "G Floor",
  "G + 1 Floor",
  "G + 2 Floors",
  "G + 3 Floors",
  "G + 4 Floors",
  "Basement + G + 2 Floors"
];

const STATUS_OPTIONS = [
  "Planning",
  "Foundation Phase",
  "Structure Phase",
  "Finishing Phase",
  "In Progress",
  "On Hold",
  "Completed"
];

const FALLBACK_SITE_IMAGE = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%231e293b'/%3E%3Cstop offset='100%25' stop-color='%230f172a'/%3E%3C/linearGradient%3E%3ClinearGradient id='accent' x1='0%25' y1='0%25' x2='100%25' y2='0%25'%3E%3Cstop offset='0%25' stop-color='%23f59e0b'/%3E%3Cstop offset='100%25' stop-color='%23d97706'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23bg)'/%3E%3Cpath d='M200,350 L200,120 L320,120 L320,350 Z M340,350 L340,160 L440,160 L440,350 Z M460,350 L460,200 L580,200 L580,350 Z' fill='none' stroke='rgba(255,255,255,0.15)' stroke-width='4'/%3E%3Crect x='220' y='140' width='30' height='40' fill='rgba(245,158,11,0.3)'/%3E%3Crect x='265' y='140' width='30' height='40' fill='rgba(245,158,11,0.3)'/%3E%3Crect x='360' y='180' width='25' height='35' fill='rgba(245,158,11,0.3)'/%3E%3Crect x='400' y='180' width='25' height='35' fill='rgba(245,158,11,0.3)'/%3E%3Ctext x='400' y='270' font-family='sans-serif' font-size='22' font-weight='bold' fill='url(%23accent)' text-anchor='middle'%3EYELOLINE CONSTRUCTION SITE%3C/text%3E%3C/svg%3E";

const handleImgError = (e) => {
  e.target.onerror = null;
  e.target.src = FALLBACK_SITE_IMAGE;
};

// Predefined 10 Work Categories matching the registered wizard
const DEFAULT_BUDGET_ROWS = [
  { sno: 1, description: 'Masonry work expenses', estimated_amount: '', expense_amount: '' },
  { sno: 2, description: 'Shuttering work expenses', estimated_amount: '', expense_amount: '' },
  { sno: 3, description: 'Tiles work expenses', estimated_amount: '', expense_amount: '' },
  { sno: 4, description: 'Painting work expenses', estimated_amount: '', expense_amount: '' },
  { sno: 5, description: 'Doors and windows', estimated_amount: '', expense_amount: '' },
  { sno: 6, description: 'Lathe Work expenses', estimated_amount: '', expense_amount: '' },
  { sno: 7, description: 'Electrical work expenses', estimated_amount: '', expense_amount: '' },
  { sno: 8, description: 'Plumbing work expenses', estimated_amount: '', expense_amount: '' },
  { sno: 9, description: "Engineer's Misc.", estimated_amount: '', expense_amount: '' },
  { sno: 10, description: 'Additional Work', estimated_amount: '', expense_amount: '' }
];

const getInitialFloorStages = (floorTitle = 'GROUND FLOOR') => [
  { sno: 1, stage_name: 'MOBILIZATION ADVANCE (16%)', amount: '', work_schedule: '' },
  { sno: 2, stage_name: 'ON COMPLETION OF BASEMENT', amount: '', work_schedule: '' },
  { sno: 3, stage_name: "ON COMPLETION OF 7' LINTEL LEVEL RCC WORK", amount: '', work_schedule: '' },
  { sno: 4, stage_name: `ON COMPLETION OF ${floorTitle} ROOF CONCRETE`, amount: '', work_schedule: '' },
  { sno: 5, stage_name: 'ON COMPLETION OF MEP CONCEALED WORK', amount: '', work_schedule: '' },
  { sno: 6, stage_name: 'ON COMPLETION OF WALL PLASTERING', amount: '', work_schedule: '' },
  { sno: 7, stage_name: 'ON COMPLETION OF TILE LAYING', amount: '', work_schedule: '' },
  { sno: 8, stage_name: 'ON COMPLETION OF UPVC WINDOW & DOOR FIXING', amount: '', work_schedule: '' },
  { sno: 9, stage_name: 'ON COMPLETION OF INTERIOR WALL PAINTING', amount: '', work_schedule: '' },
  { sno: 10, stage_name: 'ON COMPLETION OF ALL FINISHING WORKS', amount: '', work_schedule: '' }
];


const getAvailableFloorTitles = (numFloorsSetting = 'G + 1 Floor', totalSectionsCount = 1, currentTitle = '') => {
  let countFromSetting = 2;
  let hasBasement = false;
  if (numFloorsSetting === 'G Floor') countFromSetting = 1;
  else if (numFloorsSetting === 'G + 1 Floor') countFromSetting = 2;
  else if (numFloorsSetting === 'G + 2 Floors') countFromSetting = 3;
  else if (numFloorsSetting === 'G + 3 Floors') countFromSetting = 4;
  else if (numFloorsSetting === 'G + 4 Floors') countFromSetting = 5;
  else if (numFloorsSetting === 'Basement + G + 2 Floors') {
    countFromSetting = 3;
    hasBasement = true;
  }

  const effectiveCount = Math.max(countFromSetting, totalSectionsCount || 1, 3);

  const titles = [];
  if (hasBasement) {
    titles.push('BASEMENT FLOOR');
  }
  titles.push('GROUND FLOOR');
  titles.push('FIRST FLOOR');
  if (effectiveCount >= 3) titles.push('SECOND FLOOR');
  if (effectiveCount >= 4) titles.push('THIRD FLOOR');
  if (!hasBasement) titles.push('BASEMENT FLOOR');
  titles.push('TERRACE FLOOR');

  if (currentTitle && !titles.includes(currentTitle)) {
    titles.push(currentTitle);
  }

  return Array.from(new Set(titles));
};

export default function CreateSiteModule() {
  const {
    sites,
    updateSite,
    deleteSite,
    importSites,
    SITE_COLUMNS_SPEC,
    exportToXLS,
    exportToPDF,
    setActiveTab,
    paymentBreakups,
    savePaymentBreakup,
    users,
    updateUser,
    addUser
  } = useApp();

  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStructureFilter, setSelectedStructureFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  const [viewingDetailSite, setViewingDetailSite] = useState(null);
  const [detailActiveTab, setDetailActiveTab] = useState(1);
  const [showDetailPassword, setShowDetailPassword] = useState(false);
  const [copiedCreds, setCopiedCreds] = useState(false);

  // Edit Wizard State (Matching 4 Registered Menus)
  const [editStep, setEditStep] = useState(1);
  const [editSiteName, setEditSiteName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editStructureType, setEditStructureType] = useState('Villa');
  const [editSupervisor, setEditSupervisor] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editTargetDate, setEditTargetDate] = useState('');
  const [editStatus, setEditStatus] = useState('In Progress');
  const [editProgress, setEditProgress] = useState(0);

  // Step 1: Budget Rows
  const [editBudgetRows, setEditBudgetRows] = useState([]);

  // Step 2: Payment Breakup Floors
  const [editFloorSections, setEditFloorSections] = useState([]);
  const [editSelectedFloorFilter, setEditSelectedFloorFilter] = useState('ALL');

  const effectiveEditFloorFilter = useMemo(() => {
    if (editSelectedFloorFilter === 'ALL') return 'ALL';
    const idx = parseInt(editSelectedFloorFilter, 10);
    if (!isNaN(idx) && idx >= 0 && idx < editFloorSections.length) {
      return String(idx);
    }
    return 'ALL';
  }, [editSelectedFloorFilter, editFloorSections.length]);

  // Step 3: Client Credentials
  const [editClientName, setEditClientName] = useState('');
  const [editClientPhone, setEditClientPhone] = useState('');
  const [editClientPassword, setEditClientPassword] = useState('');
  const [editClientEmail, setEditClientEmail] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Specs & Media
  const [editBuiltupArea, setEditBuiltupArea] = useState('');
  const [editFloors, setEditFloors] = useState('G + 1 Floor');
  const [editCoverImage, setEditCoverImage] = useState('');
  const [editGalleryImages, setEditGalleryImages] = useState([]);
  const [editDescription, setEditDescription] = useState('');

  const [editErrors, setEditErrors] = useState({});
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Helper Currency Formatter
  const formatINR = (val) => {
    const num = parseFloat(val) || 0;
    return num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  // Memos for Edit Calculations
  const editBudgetTotals = useMemo(() => {
    const totalEstimated = editBudgetRows.reduce((acc, row) => acc + (parseFloat(row.estimated_amount) || 0), 0);
    const totalExpense = editBudgetRows.reduce((acc, row) => acc + (parseFloat(row.expense_amount) || 0), 0);
    const totalBalance = totalEstimated - totalExpense;
    return { totalEstimated, totalExpense, totalBalance };
  }, [editBudgetRows]);

  const editPaymentTotals = useMemo(() => {
    let totalAmount = 0;
    (editFloorSections || []).forEach(f => {
      (f.milestones || []).forEach(m => {
        totalAmount += parseFloat(m.amount) || 0;
      });
    });
    return { totalAmount };
  }, [editFloorSections]);

  const handleOpenSiteDetail = (site) => {
    setViewingDetailSite(site);
    setDetailActiveTab(1);
    setShowDetailPassword(false);
    setCopiedCreds(false);
  };

  const handleCopyDetailCredentials = (site, clientUser) => {
    if (!site) return;
    const phone = site.client_phone || clientUser?.phone || '';
    const pass = site.client_password || clientUser?.password || '';
    const text = `*Yeloline Construction - Client Portal Access*\n` +
      `Project: ${site.site_name}\n` +
      `Site ID: ${site.site_id}\n` +
      `Registered Mobile: ${phone}\n` +
      `Password: ${pass}\n\n` +
      `Login to your Client Portal to track construction stages, payment breakups and bills.`;

    navigator.clipboard.writeText(text);
    setCopiedCreds(true);
    setTimeout(() => setCopiedCreds(false), 3000);
  };

  const handleShareDetailWhatsApp = (site, clientUser) => {
    if (!site) return;
    const phone = site.client_phone || clientUser?.phone || '';
    const pass = site.client_password || clientUser?.password || '';
    const text = `*Yeloline Construction - Client Portal Access*\n` +
      `Project: ${site.site_name}\n` +
      `Site ID: ${site.site_id}\n` +
      `Registered Mobile: ${phone}\n` +
      `Password: ${pass}\n\n` +
      `Login to your Client Portal to track construction stages, payment breakups and bills.`;

    const clean = phone.replace(/\D/g, '');
    const url = `https://wa.me/91${clean}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Filter logic
  const filteredSites = sites.filter(site => {
    const matchesSearch =
      site.site_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.site_id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStructure =
      selectedStructureFilter === 'ALL' || site.structure_type === selectedStructureFilter;

    const matchesStatus =
      selectedStatusFilter === 'ALL' || site.status === selectedStatusFilter;

    return matchesSearch && matchesStructure && matchesStatus;
  });

  // Calculate high-level stats
  const totalSitesCount = sites.length;
  const totalAreaSqft = sites.reduce((sum, s) => sum + Number(s.builtup_area_sqft || 0), 0);
  const totalBudgetVal = sites.reduce((sum, s) => sum + Number(s.estimated_budget || 0), 0);
  const activeOngoingCount = sites.filter(s => s.status !== 'Completed').length;

  // Open Edit Modal with 4 Registered Menus pre-filled
  const openEditModal = (site) => {
    setEditingSite(site);
    setEditStep(1);
    setEditErrors({});

    setEditSiteName(site.site_name || '');
    setEditLocation(site.location || '');
    setEditStructureType(site.structure_type || 'Villa');
    setEditSupervisor(site.supervisor_in_charge || 'Er. S. Prakash');
    setEditStartDate(site.start_date || '');
    setEditTargetDate(site.target_completion_date || '');
    setEditStatus(site.status || 'In Progress');
    setEditProgress(site.progress_percentage || 0);

    // Budget rows
    if (Array.isArray(site.budget_items) && site.budget_items.length > 0) {
      setEditBudgetRows(site.budget_items.map((item, idx) => ({
        sno: item.sno || idx + 1,
        description: item.work_item || item.description || `Work Item #${idx + 1}`,
        estimated_amount: item.estimated_amount !== undefined && item.estimated_amount !== null ? String(item.estimated_amount) : '',
        expense_amount: item.expense_amount !== undefined && item.expense_amount !== null ? String(item.expense_amount) : ''
      })));
    } else {
      setEditBudgetRows(DEFAULT_BUDGET_ROWS.map(r => ({ ...r })));
    }

    // Payment breakup floors
    const existingBreakup = (paymentBreakups || []).find(b => 
      (b.site_id && (b.site_id === site.site_id || String(b.site_id).toLowerCase() === String(site.site_id).toLowerCase())) ||
      (b.id && (b.id === site.site_id || String(b.id).toLowerCase() === String(site.site_id).toLowerCase())) ||
      (b.site_name && site.site_name && b.site_name.toLowerCase() === site.site_name.toLowerCase())
    );

    setEditSelectedFloorFilter('ALL');
    if (existingBreakup && Array.isArray(existingBreakup.floors) && existingBreakup.floors.length > 0) {
      setEditFloorSections(existingBreakup.floors.map((f, idx) => ({
        id: f.id || `floor_${idx + 1}`,
        floorTitle: f.floorTitle || f.floor_title || `FLOOR ${idx + 1}`,
        milestones: Array.isArray(f.milestones) ? f.milestones.map((m, mIdx) => ({
          sno: m.sno || mIdx + 1,
          stage_name: m.stage_name || '',
          amount: m.amount !== undefined && m.amount !== null ? String(m.amount) : '',
          work_schedule: m.work_schedule || m.target_date || ''
        })) : getInitialFloorStages(`FLOOR ${idx + 1}`)
      })));
    } else if (existingBreakup && Array.isArray(existingBreakup.milestones) && existingBreakup.milestones.length > 0) {
      setEditFloorSections([
        {
          id: 'floor_1',
          floorTitle: existingBreakup.floor_title || 'GROUND FLOOR',
          milestones: existingBreakup.milestones.map((m, mIdx) => ({
            sno: m.sno || mIdx + 1,
            stage_name: m.stage_name || '',
            amount: m.amount !== undefined && m.amount !== null ? String(m.amount) : '',
            work_schedule: m.work_schedule || m.target_date || ''
          }))
        }
      ]);
    } else {
      setEditFloorSections([
        {
          id: 'floor_1',
          floorTitle: 'GROUND FLOOR',
          milestones: getInitialFloorStages('GROUND FLOOR')
        }
      ]);
    }

    // Client user
    const clientUser = (users || []).find(u => 
      (u.site_id && (u.site_id === site.site_id || String(u.site_id).toLowerCase() === String(site.site_id).toLowerCase())) ||
      (u.phone && site.client_phone && (u.phone === site.client_phone || u.phone.replace(/\D/g, '') === site.client_phone.replace(/\D/g, '')))
    );

    setEditClientName(site.client_name || clientUser?.name || clientUser?.full_name || '');
    setEditClientPhone(site.client_phone || clientUser?.phone || '');
    setEditClientPassword(site.client_password || clientUser?.password || '');
    setEditClientEmail(site.client_email || clientUser?.email || '');
    setShowEditPassword(false);

    // Specs & Media
    setEditBuiltupArea(site.builtup_area_sqft || '');
    setEditFloors(site.number_of_floors || 'G + 1 Floor');
    setEditCoverImage(site.cover_image || '');
    setEditGalleryImages(Array.isArray(site.gallery_images) ? site.gallery_images : []);
    setEditDescription(site.description || '');

    setIsModalOpen(true);
  };

  // Step 1: Budget row helpers
  const handleBudgetCellChange = (index, field, value) => {
    setEditBudgetRows(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddBudgetRow = () => {
    setEditBudgetRows(prev => [
      ...prev,
      {
        sno: prev.length + 1,
        description: '',
        estimated_amount: '',
        expense_amount: ''
      }
    ]);
  };

  const handleRemoveBudgetRow = (index) => {
    setEditBudgetRows(prev => {
      const filtered = prev.filter((_, idx) => idx !== index);
      return filtered.map((row, i) => ({ ...row, sno: i + 1 }));
    });
  };

  const handleResetBudgetRows = () => {
    setEditBudgetRows(DEFAULT_BUDGET_ROWS.map(r => ({ ...r })));
  };

  // Step 2: Payment Breakup helpers
  const handleAddFloor = () => {
    const nextIdx = editFloorSections.length;
    const available = getAvailableFloorTitles(editFloors, editFloorSections.length + 1);
    const title = available[nextIdx] || (nextIdx === 1 ? 'FIRST FLOOR' : nextIdx === 2 ? 'SECOND FLOOR' : `FLOOR ${nextIdx + 1}`);
    setEditFloorSections(prev => [
      ...prev,
      {
        id: `floor_${Date.now()}`,
        floorTitle: title,
        milestones: getInitialFloorStages(title)
      }
    ]);

    if (editSelectedFloorFilter !== 'ALL') {
      setEditSelectedFloorFilter(String(nextIdx));
    }
  };

  const handleRemoveFloor = (fIdx) => {
    if (editFloorSections.length <= 1) return;
    setEditFloorSections(prev => prev.filter((_, idx) => idx !== fIdx));
    setEditSelectedFloorFilter('ALL');
  };

  const handleFloorTitleChange = (fIdx, val) => {
    setEditFloorSections(prev => {
      const updated = [...prev];
      const upper = (val || '').toUpperCase();
      const updatedMilestones = (updated[fIdx].milestones || []).map(m => {
        if (m.sno === 4 && (m.stage_name?.includes('ROOF CONCRETE') || m.stage_name === 'ON COMPLETION OF ROOF CONCRETE')) {
          if (upper.includes('GROUND')) {
            return { ...m, stage_name: 'ON COMPLETION OF ROOF CONCRETE' };
          } else {
            return { ...m, stage_name: `ON COMPLETION OF ${upper} ROOF CONCRETE` };
          }
        }
        return m;
      });

      updated[fIdx] = { ...updated[fIdx], floorTitle: val, milestones: updatedMilestones };
      return updated;
    });
  };

  const handleResetFloorMilestones = (fIdx) => {
    setEditFloorSections(prev => {
      const updated = [...prev];
      const title = updated[fIdx].floorTitle || `FLOOR ${fIdx + 1}`;
      updated[fIdx] = {
        ...updated[fIdx],
        milestones: getInitialFloorStages(title)
      };
      return updated;
    });
  };

  const handleMilestoneChange = (fIdx, mIdx, field, val) => {
    setEditFloorSections(prev => {
      const updated = [...prev];
      const milestones = [...updated[fIdx].milestones];
      milestones[mIdx] = { ...milestones[mIdx], [field]: val };
      updated[fIdx] = { ...updated[fIdx], milestones };
      return updated;
    });
  };

  const handleAddMilestone = (fIdx) => {
    setEditFloorSections(prev => {
      const updated = [...prev];
      const currentList = updated[fIdx].milestones || [];
      const newSno = currentList.length + 1;
      updated[fIdx] = {
        ...updated[fIdx],
        milestones: [
          ...currentList,
          {
            sno: newSno,
            stage_name: `Stage ${newSno}`,
            amount: '',
            work_schedule: ''
          }
        ]
      };
      return updated;
    });
  };

  const handleRemoveMilestone = (fIdx, mIdx) => {
    setEditFloorSections(prev => {
      const updated = [...prev];
      const filtered = (updated[fIdx].milestones || []).filter((_, i) => i !== mIdx);
      updated[fIdx] = {
        ...updated[fIdx],
        milestones: filtered.map((m, i) => ({ ...m, sno: i + 1 }))
      };
      return updated;
    });
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pass = '';
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setEditClientPassword(pass);
  };

  // Final Submit Handler for Edit Wizard
  const handleSaveEditedSite = async () => {
    const errors = {};
    if (!editSiteName.trim()) errors.siteName = 'Site Name is required';
    if (!editLocation.trim()) errors.location = 'Site Location is required';
    if (!editClientName.trim()) errors.clientName = 'Client Name is required';
    if (!editClientPhone.trim()) errors.clientPhone = 'Client Mobile Number is required';

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      if (errors.siteName || errors.location) setEditStep(1);
      else if (errors.clientName || errors.clientPhone) setEditStep(3);
      return;
    }

    setIsEditSubmitting(true);
    try {
      const siteId = editingSite.site_id || editingSite.id;
      const cleanPhone = editClientPhone.replace(/\D/g, '');

      // Format budget items
      const formattedBudgetItems = editBudgetRows.map((r, idx) => {
        const est = parseFloat(r.estimated_amount) || 0;
        const exp = parseFloat(r.expense_amount) || 0;
        return {
          sno: r.sno || idx + 1,
          work_item: (r.description || '').trim(),
          description: (r.description || '').trim(),
          estimated_amount: est,
          expense_amount: exp,
          balance: est - exp
        };
      });

      // Format floors
      const formattedFloors = editFloorSections.map((floor, fIdx) => ({
        id: floor.id || `floor_${fIdx + 1}`,
        floor_title: (floor.floorTitle || `FLOOR ${fIdx + 1}`).trim().toUpperCase(),
        floorTitle: (floor.floorTitle || `FLOOR ${fIdx + 1}`).trim().toUpperCase(),
        milestones: (floor.milestones || []).map((m, mIdx) => ({
          sno: m.sno || mIdx + 1,
          stage_name: (m.stage_name || '').trim(),
          amount: parseFloat(m.amount) || 0,
          work_schedule: (m.work_schedule || '').trim()
        }))
      }));
      const allMilestones = formattedFloors.flatMap(f => f.milestones);

      const totalEstimated = editBudgetTotals.totalEstimated > 0 ? editBudgetTotals.totalEstimated : editPaymentTotals.totalAmount;

      const updatedSitePayload = {
        ...editingSite,
        site_id: siteId,
        site_name: editSiteName.trim(),
        location: editLocation.trim(),
        structure_type: editStructureType,
        builtup_area_sqft: parseFloat(editBuiltupArea) || 0,
        number_of_floors: editFloors,
        estimated_budget: totalEstimated,
        total_expense: editBudgetTotals.totalExpense,
        balance: editBudgetTotals.totalBalance,
        budget_items: formattedBudgetItems,
        supervisor_in_charge: editSupervisor.trim() || 'Er. S. Prakash',
        start_date: editStartDate,
        target_completion_date: editTargetDate,
        status: editStatus,
        progress_percentage: Number(editProgress) || 0,
        cement_brand: editingSite?.cement_brand || '',
        steel_brand: editingSite?.steel_brand || '',
        bricks_spec: editingSite?.bricks_spec || '',
        flooring_spec: editingSite?.flooring_spec || '',
        description: editDescription,
        cover_image: editCoverImage || '',
        gallery_images: editGalleryImages || [],
        client_name: editClientName.trim(),
        client_phone: cleanPhone,
        client_password: editClientPassword.trim(),
        client_email: editClientEmail.trim()
      };

      const breakupPayload = {
        id: siteId,
        site_id: siteId,
        site_name: editSiteName.trim(),
        client_name: editClientName.trim(),
        floor_title: formattedFloors[0]?.floor_title || 'GROUND FLOOR',
        floors: formattedFloors,
        total_amount: editPaymentTotals.totalAmount > 0 ? editPaymentTotals.totalAmount : totalEstimated,
        milestones: allMilestones,
        updated_at: new Date().toISOString()
      };

      // 1. Update site
      await updateSite(updatedSitePayload);

      // 2. Save payment breakup
      if (savePaymentBreakup) {
        await savePaymentBreakup(breakupPayload);
      }

      // 3. Update client user
      const existingUser = (users || []).find(u => 
        (u.site_id && (u.site_id === siteId || String(u.site_id).toLowerCase() === String(siteId).toLowerCase())) ||
        (u.phone && (u.phone === cleanPhone || u.phone.replace(/\D/g, '') === cleanPhone))
      );

      const userPayload = {
        user_id: existingUser?.user_id || `CLIENT-${cleanPhone.slice(-6) || Date.now()}`,
        name: editClientName.trim(),
        full_name: editClientName.trim(),
        phone: cleanPhone,
        password: editClientPassword.trim(),
        email: editClientEmail.trim(),
        role: 'client',
        site_name: editSiteName.trim(),
        site_id: siteId,
        location: editLocation.trim(),
        status: 'Active',
        updated_at: new Date().toISOString()
      };

      if (existingUser && updateUser) {
        await updateUser(existingUser.user_id || existingUser.id, userPayload);
      } else if (addUser) {
        await addUser(userPayload);
      }

      setIsModalOpen(false);
      setEditingSite(null);
    } catch (err) {
      console.error('Error saving edited site:', err);
      alert('An error occurred while saving: ' + err.message);
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleDelete = (site_id, site_name) => {
    if (window.confirm(`Are you sure you want to delete site "${site_name}" (${site_id})?`)) {
      deleteSite(site_id);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Completed':
        return 'status-badge-completed';
      case 'In Progress':
        return 'status-badge-progress';
      case 'Structure Phase':
        return 'status-badge-structure';
      case 'Foundation Phase':
        return 'status-badge-foundation';
      case 'Finishing Phase':
        return 'status-badge-finishing';
      case 'On Hold':
        return 'status-badge-hold';
      default:
        return 'status-badge-planning';
    }
  };

  // DataTable columns setup
  const columns = [
    {
      header: "Site ID",
      key: "site_id",
      render: (r) => <span className="site-id-pill">{r.site_id}</span>
    },
    {
      header: "Site & Location",
      key: "site_name",
      render: (r) => (
        <div>
          <div className="site-table-title">{r.site_name}</div>
          <div className="site-table-sub">
            <MapPin size={12} style={{ marginRight: '4px' }} />
            {r.location}
          </div>
        </div>
      )
    },
    {
      header: "Client Info",
      key: "client_name",
      render: (r) => (
        <div>
          <div className="site-table-client">{r.client_name}</div>
          <div className="site-table-phone">{r.client_phone}</div>
        </div>
      )
    },
    {
      header: "Type & Area",
      key: "structure_type",
      render: (r) => (
        <div>
          <span className="site-type-tag">{r.structure_type}</span>
          <div className="site-table-area">{Number(r.builtup_area_sqft).toLocaleString()} sq. ft.</div>
        </div>
      )
    },
    {
      header: "Budget (₹)",
      key: "estimated_budget",
      render: (r) => (
        <span className="site-table-budget">₹{Number(r.estimated_budget).toLocaleString('en-IN')}</span>
      )
    },
    {
      header: "Supervisor",
      key: "supervisor_in_charge",
      render: (r) => <span className="site-table-supervisor">{r.supervisor_in_charge}</span>
    },
    {
      header: "Status & Progress",
      key: "status",
      render: (r) => (
        <div>
          <span className={`site-status-badge ${getStatusBadgeClass(r.status)}`}>{r.status}</span>
          <div className="progress-bar-container" style={{ marginTop: '6px' }}>
            <div
              className="progress-bar-fill"
              style={{ width: `${r.progress_percentage || 0}%` }}
            />
          </div>
        </div>
      )
    },
    {
      header: "Actions",
      key: "actions",
      render: (r) => (
        <div className="action-buttons-group">
          <button
            className="action-btn action-btn-view"
            title="View Details (All 4 Tabs)"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenSiteDetail(r);
            }}
          >
            <Eye size={15} />
          </button>
          <button
            className="action-btn action-btn-edit"
            title="Edit Site"
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(r);
            }}
          >
            <Edit3 size={15} />
          </button>
          <button
            className="action-btn action-btn-delete"
            title="Delete Site"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(r.site_id, r.site_name);
            }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="create-site-module">
      {/* Header Banner */}
      <div className="create-site-header">
        <div>
          <div className="module-title-row">
            <Building2 className="module-header-icon" size={28} />
            <h1 className="module-title">Construction Site Management</h1>
          </div>
          <p className="module-subtitle">
            Create, configure and manage construction sites with exact required parameters, specs, budget & engineering timelines.
          </p>
        </div>
        <div className="module-header-actions">
          <button
            className="btn btn-secondary"
            onClick={() => exportToXLS(filteredSites, 'Yeloline_Construction_Sites', 'Construction Site Management', SITE_COLUMNS_SPEC)}
          >
            <FileSpreadsheet size={16} />
            <span>Export XLS</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => exportToPDF(filteredSites, 'Yeloline_Construction_Sites', 'Construction Site Management', SITE_COLUMNS_SPEC)}
          >
            <FileText size={16} />
            <span>Export PDF</span>
          </button>

          <button className="btn btn-primary" onClick={() => setActiveTab('new_site')}>
            <Plus size={18} />
            <span>Create New Site</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="site-metrics-grid">
        <div className="site-metric-card">
          <div className="metric-icon-wrapper yellow">
            <Building2 size={22} />
          </div>
          <div>
            <div className="metric-value">{totalSitesCount}</div>
            <div className="metric-label">Total Sites Registered</div>
          </div>
        </div>

        <div className="site-metric-card">
          <div className="metric-icon-wrapper blue">
            <Layers size={22} />
          </div>
          <div>
            <div className="metric-value">{totalAreaSqft.toLocaleString()} <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>sq ft</span></div>
            <div className="metric-label">Total Built-Up Area</div>
          </div>
        </div>

        <div className="site-metric-card">
          <div className="metric-icon-wrapper green">
            <DollarSign size={22} />
          </div>
          <div>
            <div className="metric-value">₹{(totalBudgetVal / 10000000).toFixed(2)} Cr</div>
            <div className="metric-label">Total Project Budget</div>
          </div>
        </div>

        <div className="site-metric-card">
          <div className="metric-icon-wrapper purple">
            <Clock size={22} />
          </div>
          <div>
            <div className="metric-value">{activeOngoingCount}</div>
            <div className="metric-label">Active Construction Sites</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="site-toolbar">
        <div className="search-box-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search site name, client, location, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="toolbar-filters">
          <CustomSelect
            icon={Filter}
            value={selectedStructureFilter}
            onChange={(val) => setSelectedStructureFilter(val)}
            options={[
              { value: "ALL", label: "All Structure Types" },
              ...STRUCTURE_TYPES.map(type => ({ value: type, label: type }))
            ]}
          />

          <CustomSelect
            value={selectedStatusFilter}
            onChange={(val) => setSelectedStatusFilter(val)}
            options={[
              { value: "ALL", label: "All Statuses" },
              ...STATUS_OPTIONS.map(status => ({ value: status, label: status }))
            ]}
          />

          <div className="view-mode-toggle">
            <button
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <Grid size={18} />
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area: Grid or Table */}
      {viewMode === 'grid' ? (
        <div className="site-cards-grid">
          {filteredSites.length > 0 ? (
            filteredSites.map(site => (
              <div
                key={site.site_id}
                className="site-card"
                onClick={() => handleOpenSiteDetail(site)}
                style={{ cursor: 'pointer' }}
                title={`Click to view all 4 menu details for ${site.site_name}`}
              >
                {/* Cover Image Banner */}
                {site.cover_image ? (
                  <div className="site-card-cover-container">
                    <img
                      src={site.cover_image}
                      alt={site.site_name}
                      className="site-card-cover-img"
                      onError={handleImgError}
                    />
                    {site.gallery_images && site.gallery_images.length > 0 && (
                      <span className="site-card-photo-count">
                        📷 {site.gallery_images.length} photo{site.gallery_images.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="site-card-cover-placeholder">
                    <Building2 size={24} />
                    <span>No Cover Photo Uploaded</span>
                  </div>
                )}

                <div className="site-card-header">
                  <div>
                    <span className="site-card-id">{site.site_id}</span>
                    <h3 className="site-card-title">{site.site_name}</h3>
                  </div>
                  <span className={`site-status-badge ${getStatusBadgeClass(site.status)}`}>
                    {site.status}
                  </span>
                </div>

                <div className="site-card-location">
                  <MapPin size={15} />
                  <span>{site.location}</span>
                </div>

                <div className="site-card-progress">
                  <div className="progress-label-row">
                    <span>Construction Progress</span>
                    <span>{site.progress_percentage || 0}%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${site.progress_percentage || 0}%` }}
                    />
                  </div>
                </div>

                <div className="site-card-details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Client Name</span>
                    <span className="detail-val">{site.client_name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Built-up Area</span>
                    <span className="detail-val">{Number(site.builtup_area_sqft).toLocaleString()} sq ft</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Estimated Budget</span>
                    <span className="detail-val highlight">₹{Number(site.estimated_budget).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Structure Type</span>
                    <span className="detail-val">{site.structure_type}</span>
                  </div>
                </div>

                <div className="site-card-specs-pills">
                  <span className="spec-pill">{site.structure_type || 'Residential'}</span>
                  <span className="spec-pill">{site.number_of_floors}</span>
                  {site.builtup_area_sqft ? <span className="spec-pill">{site.builtup_area_sqft} sq ft</span> : null}
                </div>

                <div className="site-card-footer">
                  <div className="supervisor-info">
                    <User size={14} />
                    <span>{site.supervisor_in_charge}</span>
                  </div>
                  <div className="site-card-actions">
                    <button
                      className="btn-icon btn-icon-view"
                      title="View Full Details (All 4 Tabs)"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenSiteDetail(site);
                      }}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="btn-icon btn-icon-edit"
                      title="Edit Site"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(site);
                      }}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      className="btn-icon btn-icon-delete"
                      title="Delete Site"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(site.site_id, site.site_name);
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state-card">
              <Building2 size={42} />
              <h3>No Construction Sites Found</h3>
              <p>Try adjusting your search query or filters, or click "Create New Site" to add a new project site.</p>
              <button className="btn btn-primary" onClick={() => setActiveTab('new_site')}>
                <Plus size={16} />
                <span>Create New Site</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="site-table-wrapper">
          <DataTable
            columns={columns}
            data={filteredSites}
            showSearch={false}
            pageSize={10}
            onRowClick={(row) => handleOpenSiteDetail(row)}
          />
        </div>
      )}

      {/* EDIT SITE MODAL WITH 4 REGISTERED MENUS (WIZARD STEPPER) */}
      {editingSite && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingSite(null);
          }}
          title={`Edit Site Details: ${editingSite.site_name} (${editingSite.site_id})`}
          maxWidth="1020px"
        >
          <div className="site-detail-modal-body">
            {/* 4-STEP WIZARD TABS STEPPER (MATCHING REGISTERED MENUS) */}
            <div className="site-detail-stepper-card">
              <div className="site-detail-stepper-container">
                {/* Step 1 */}
                <div
                  className={`site-detail-step-item ${editStep === 1 ? 'active' : ''}`}
                  onClick={() => setEditStep(1)}
                  title="Project & Budget Table"
                >
                  <div className="detail-step-circle">
                    <span>1</span>
                  </div>
                  <div className="detail-step-info">
                    <span className="detail-step-name">Project & Budget Table</span>
                  </div>
                </div>

                <div className="detail-step-connector" />

                {/* Step 2 */}
                <div
                  className={`site-detail-step-item ${editStep === 2 ? 'active' : ''}`}
                  onClick={() => setEditStep(2)}
                  title="Payment Breakup"
                >
                  <div className="detail-step-circle">
                    <span>2</span>
                  </div>
                  <div className="detail-step-info">
                    <span className="detail-step-name">Payment Breakup</span>
                  </div>
                </div>

                <div className="detail-step-connector" />

                {/* Step 3 */}
                <div
                  className={`site-detail-step-item ${editStep === 3 ? 'active' : ''}`}
                  onClick={() => setEditStep(3)}
                  title="Client Login Register"
                >
                  <div className="detail-step-circle">
                    <span>3</span>
                  </div>
                  <div className="detail-step-info">
                    <span className="detail-step-name">Client Login Register</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================
                STEP 1: PROJECT & BUDGET TABLE
               ======================================================== */}
            {editStep === 1 && (
              <div className="wizard-step-card animate-fade-in" style={{ padding: '20px' }}>
                <div className="step-card-header" style={{ marginBottom: '18px' }}>
                  <div className="step-header-left">
                    <h2>Project Information & Budget Estimation Form</h2>
                    <p>Edit the basic project credentials and specify the itemized budget & expense table below.</p>
                  </div>
                </div>

                {/* Project Fields */}
                <div className="step-form-grid">
                  <div className="form-group">
                    <label className="input-label required">
                      Name of the Project <span className="req-star">*</span>
                    </label>
                    <div className="input-wrapper">
                      <Building2 className="input-icon" size={18} />
                      <input
                        type="text"
                        className={`styled-input ${editErrors.siteName ? 'has-error' : ''}`}
                        placeholder="e.g. Modern Minimalist Villa - Perundurai"
                        value={editSiteName}
                        onChange={(e) => setEditSiteName(e.target.value)}
                      />
                    </div>
                    {editErrors.siteName && (
                      <span className="error-hint" style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '4px' }}>
                        <AlertCircle size={14} /> {editErrors.siteName}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="input-label required">
                      Location of the Project <span className="req-star">*</span>
                    </label>
                    <div className="input-wrapper">
                      <MapPin className="input-icon" size={18} />
                      <input
                        type="text"
                        className={`styled-input ${editErrors.location ? 'has-error' : ''}`}
                        placeholder="e.g. Perundurai Road, Near Golden City, Erode"
                        value={editLocation}
                        onChange={(e) => setEditLocation(e.target.value)}
                      />
                    </div>
                    {editErrors.location && (
                      <span className="error-hint" style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '4px' }}>
                        <AlertCircle size={14} /> {editErrors.location}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="input-label">Project / Structure Type</label>
                    <select
                      className="styled-select"
                      value={editStructureType}
                      onChange={(e) => setEditStructureType(e.target.value)}
                    >
                      {STRUCTURE_TYPES.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="input-label">Site Supervisor / Lead Engineer</label>
                    <div className="input-wrapper">
                      <User className="input-icon" size={18} />
                      <input
                        type="text"
                        className="styled-input"
                        placeholder="e.g. Er. S. Prakash"
                        value={editSupervisor}
                        onChange={(e) => setEditSupervisor(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="input-label">Construction Start Date</label>
                    <div className="input-wrapper">
                      <Calendar className="input-icon" size={18} />
                      <input
                        type="date"
                        className="styled-input"
                        value={editStartDate}
                        onChange={(e) => setEditStartDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="input-label">Target Completion Date</label>
                    <div className="input-wrapper">
                      <Calendar className="input-icon" size={18} />
                      <input
                        type="date"
                        className="styled-input"
                        value={editTargetDate}
                        onChange={(e) => setEditTargetDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="input-label">Current Project Status</label>
                    <select
                      className="styled-select"
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                    >
                      {STATUS_OPTIONS.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="input-label">Construction Progress (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="styled-input"
                      value={editProgress}
                      onChange={(e) => setEditProgress(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="input-label">Built-up Area (sq. ft.)</label>
                    <input
                      type="number"
                      className="styled-input"
                      placeholder="e.g. 3200"
                      value={editBuiltupArea}
                      onChange={(e) => setEditBuiltupArea(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="input-label">Number of Floors</label>
                    <select
                      className="styled-select"
                      value={editFloors}
                      onChange={(e) => setEditFloors(e.target.value)}
                    >
                      {FLOOR_OPTIONS.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                </div>



                {/* BUDGET TABLE INPUT FORM */}
                <div className="budget-table-section">
                  <div className="budget-table-header-row">
                    <div>
                      <h3 className="section-title">
                        <Calculator size={20} className="title-icon" />
                        Budget & Expense Estimation Table
                      </h3>
                      <p className="section-desc">
                        Edit estimated and expense amounts for each work category. Balance is automatically calculated (<strong>Balance = Estimated Amount - Expense Amount</strong>).
                      </p>
                    </div>

                    <div className="budget-table-actions">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        onClick={handleResetBudgetRows}
                        title="Reset to 10 standard rows"
                      >
                        <RotateCcw size={14} />
                        <span>Reset Default Rows</span>
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={handleAddBudgetRow}
                      >
                        <Plus size={14} />
                        <span>Add Work Item</span>
                      </button>
                    </div>
                  </div>

                  {/* SPREADSHEET TABLE */}
                  <div className="table-responsive-container">
                    <table className="spreadsheet-table">
                      <thead>
                        <tr>
                          <th className="col-sno">S.No</th>
                          <th className="col-desc">Work Item / Work Description</th>
                          <th className="col-amt">Estimated Amount (₹)</th>
                          <th className="col-amt">Expense Amount (₹)</th>
                          <th className="col-amt">Balance (₹)</th>
                          <th className="col-action">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {editBudgetRows.map((row, index) => {
                          const est = parseFloat(row.estimated_amount) || 0;
                          const exp = parseFloat(row.expense_amount) || 0;
                          const balance = est - exp;

                          return (
                            <tr key={row.sno || index}>
                              <td className="cell-sno">{row.sno || index + 1}</td>
                              <td className="cell-desc">
                                <input
                                  type="text"
                                  className="spreadsheet-input"
                                  placeholder="Enter work item description..."
                                  value={row.description}
                                  onChange={(e) => handleBudgetCellChange(index, 'description', e.target.value)}
                                />
                              </td>
                              <td className="cell-amt">
                                <div className="currency-input-wrapper">
                                  <span className="currency-symbol">₹</span>
                                  <input
                                    type="number"
                                    min="0"
                                    className="spreadsheet-input currency-input"
                                    placeholder="0"
                                    value={row.estimated_amount}
                                    onChange={(e) => handleBudgetCellChange(index, 'estimated_amount', e.target.value)}
                                  />
                                </div>
                              </td>
                              <td className="cell-amt">
                                <div className="currency-input-wrapper">
                                  <span className="currency-symbol">₹</span>
                                  <input
                                    type="number"
                                    min="0"
                                    className="spreadsheet-input currency-input"
                                    placeholder="0"
                                    value={row.expense_amount}
                                    onChange={(e) => handleBudgetCellChange(index, 'expense_amount', e.target.value)}
                                  />
                                </div>
                              </td>
                              <td className={`cell-amt cell-balance ${balance < 0 ? 'negative' : ''}`}>
                                <div className="balance-display-wrapper">
                                  <span>₹</span>
                                  <span>{formatINR(balance)}</span>
                                </div>
                              </td>
                              <td className="cell-action">
                                <button
                                  type="button"
                                  className="btn-row-action btn-row-delete"
                                  onClick={() => handleRemoveBudgetRow(index)}
                                  title="Delete this row"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="spreadsheet-total-row">
                          <td colSpan={2} className="total-label-cell">TOTAL</td>
                          <td className="total-amount-cell">
                            <div className="total-val-wrapper">
                              <span>₹</span>
                              <span>{formatINR(editBudgetTotals.totalEstimated)}</span>
                            </div>
                          </td>
                          <td className="total-amount-cell">
                            <div className="total-val-wrapper">
                              <span>₹</span>
                              <span>{formatINR(editBudgetTotals.totalExpense)}</span>
                            </div>
                          </td>
                          <td className={`total-balance-cell ${editBudgetTotals.totalBalance < 0 ? 'negative' : ''}`}>
                            <div className="total-val-wrapper">
                              <span>₹</span>
                              <span>{formatINR(editBudgetTotals.totalBalance)}</span>
                            </div>
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Highlights Strip */}
                  <div className="budget-metrics-strip">
                    <div className="budget-metric-pill">
                      <span className="pill-lbl">Total Estimated:</span>
                      <span className="pill-val">₹{formatINR(editBudgetTotals.totalEstimated)}</span>
                    </div>
                    <div className="budget-metric-pill">
                      <span className="pill-lbl">Total Expenses:</span>
                      <span className="pill-val">₹{formatINR(editBudgetTotals.totalExpense)}</span>
                    </div>
                    <div className={`budget-metric-pill ${editBudgetTotals.totalBalance < 0 ? 'pill-alert' : 'pill-success'}`}>
                      <span className="pill-lbl">Net Balance:</span>
                      <span className="pill-val">₹{formatINR(editBudgetTotals.totalBalance)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Nav */}
                <div className="wizard-card-footer" style={{ marginTop: '20px' }}>
                  <div></div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setEditStep(2)}
                  >
                    <span>Next: Payment Breakup</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================
                STEP 2: PAYMENT BREAKUP
               ======================================================== */}
            {editStep === 2 && (
              <div className="wizard-step-card animate-fade-in" style={{ padding: '20px' }}>
                <div className="step-card-header" style={{ marginBottom: '18px' }}>
                  <div className="step-header-left">
                    <h2>Construction Payment Breakup & Stage Schedules</h2>
                    <p>Configure stage-by-stage milestone percentages and scheduled payment amounts for each floor of this site.</p>
                  </div>
                </div>

                {/* Floor Filter Bar */}
                <div className="floor-filter-menu-bar">
                  <div className="floor-filter-left">
                    <span className="floor-filter-label">
                      <Filter size={15} />
                      <span>Filter Floor:</span>
                    </span>
                    <div className="floor-filter-dropdown-wrapper">
                      <select
                        className="floor-filter-dropdown"
                        value={effectiveEditFloorFilter}
                        onChange={(e) => setEditSelectedFloorFilter(e.target.value)}
                      >
                        <option value="ALL">All Floors ({editFloorSections.length})</option>
                        {editFloorSections.map((fl, idx) => (
                          <option key={fl.id || idx} value={String(idx)}>
                            Section #{idx + 1} - {fl.floorTitle || `FLOOR ${idx + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="floor-filter-right">
                    {effectiveEditFloorFilter !== 'ALL' ? (
                      <div className="floor-filter-active-pill">
                        <span>
                          Showing <strong>Section #{parseInt(effectiveEditFloorFilter, 10) + 1}</strong> (1 of {editFloorSections.length} floors)
                        </span>
                        <button
                          type="button"
                          className="btn-link-reset-filter"
                          onClick={() => setEditSelectedFloorFilter('ALL')}
                        >
                          View All Floors
                        </button>
                      </div>
                    ) : (
                      <span className="floor-filter-count-badge">
                        Showing all {editFloorSections.length} floors
                      </span>
                    )}

                    <button
                      type="button"
                      className="btn btn-warning btn-sm"
                      onClick={handleAddFloor}
                      title="Add another floor section"
                      style={{
                        backgroundColor: '#f59e0b',
                        color: '#fff',
                        border: 'none',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 16px',
                        borderRadius: '8px',
                        boxShadow: '0 1px 3px rgba(245, 158, 11, 0.3)'
                      }}
                    >
                      <Plus size={15} />
                      <span>+ Add Floor</span>
                    </button>
                  </div>
                </div>

                <div className="payment-breakup-wrapper">
                  {editFloorSections.map((floor, floorIndex) => {
                    if (effectiveEditFloorFilter !== 'ALL' && effectiveEditFloorFilter !== String(floorIndex)) {
                      return null;
                    }
                    const floorSubtotal = (floor.milestones || []).reduce(
                      (acc, curr) => acc + (parseFloat(curr.amount) || 0),
                      0
                    );

                    return (
                      <div key={floor.id || floorIndex} className="floor-breakup-section-card">
                        {/* Prominent Floor Name at the top of each form */}
                        <div className="floor-section-header-bar">
                          <div className="floor-title-header-group">
                            <div className="floor-pill-badge">
                              <Layers size={13} />
                              <span>SECTION #{floorIndex + 1}</span>
                            </div>
                            <h3 className="floor-prominent-name">
                              {floor.floorTitle || `FLOOR ${floorIndex + 1}`}
                            </h3>
                          </div>

                          <div className="floor-subtotal-info">
                            <span>Subtotal: </span>
                            <strong>₹{formatINR(floorSubtotal)}</strong>
                            {editPaymentTotals.totalAmount > 0 && floorSubtotal > 0 && (
                              <span className="floor-subtotal-pct">
                                ({((floorSubtotal / editPaymentTotals.totalAmount) * 100).toFixed(1)}% of total)
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="breakup-config-row">
                          <div className="form-group flex-1">
                            <label className="input-label required">Floor / Section Title</label>
                            <input
                              type="text"
                              className="styled-input"
                              placeholder="e.g. GROUND FLOOR or FIRST FLOOR"
                              value={floor.floorTitle}
                              onChange={(e) => handleFloorTitleChange(floorIndex, e.target.value)}
                            />
                          </div>

                          <div className="breakup-config-actions">
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              onClick={() => handleResetFloorMilestones(floorIndex)}
                              title="Reset this floor back to default 10 stages"
                            >
                              <RotateCcw size={14} />
                              <span>Reset 10 Stages</span>
                            </button>

                            {editFloorSections.length > 1 && (
                              <button
                                type="button"
                                className="btn-danger-outline btn-sm"
                                onClick={() => handleRemoveFloor(floorIndex)}
                                title={`Delete ${floor.floorTitle || `Floor #${floorIndex + 1}`}`}
                              >
                                <Trash2 size={14} />
                                <span>Remove Floor</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Milestones Spreadsheet Table */}
                        <div className="table-responsive-container">
                          <table className="spreadsheet-table">
                            <thead>
                              <tr>
                                <th className="col-sno">S.No</th>
                                <th className="col-desc">Milestone / Construction Stage</th>
                                <th className="col-amt">Scheduled Payment Amount (₹)</th>
                                <th className="col-date">Work Schedule / Timeline</th>
                                <th className="col-action">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(floor.milestones || []).map((milestone, milestoneIndex) => {
                                return (
                                  <tr key={milestone.id || milestoneIndex}>
                                    <td className="cell-sno">{milestone.sno || milestoneIndex + 1}</td>
                                    <td className="cell-desc">
                                      <input
                                        type="text"
                                        className="spreadsheet-input"
                                        placeholder="e.g. On Completion of Basement"
                                        value={milestone.stage_name}
                                        onChange={(e) => handleMilestoneChange(floorIndex, milestoneIndex, 'stage_name', e.target.value)}
                                      />
                                    </td>
                                    <td className="cell-amt">
                                      <div className="currency-input-wrapper">
                                        <span className="currency-symbol">₹</span>
                                        <input
                                          type="number"
                                          min="0"
                                          className="spreadsheet-input currency-input"
                                          placeholder="0"
                                          value={milestone.amount}
                                          onChange={(e) => handleMilestoneChange(floorIndex, milestoneIndex, 'amount', e.target.value)}
                                        />
                                      </div>
                                    </td>
                                    <td className="cell-date">
                                      <input
                                        type="text"
                                        className="spreadsheet-input text-left"
                                        placeholder="Enter month (e.g. Month 1)..."
                                        value={milestone.work_schedule}
                                        onChange={(e) => handleMilestoneChange(floorIndex, milestoneIndex, 'work_schedule', e.target.value)}
                                      />
                                    </td>
                                    <td className="cell-action">
                                      <button
                                        type="button"
                                        className="btn-row-action btn-row-delete"
                                        onClick={() => handleRemoveMilestone(floorIndex, milestoneIndex)}
                                        title="Delete this milestone"
                                      >
                                        <Trash2 size={15} />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                              {/* Last row of the form: Add Row */}
                              <tr className="table-add-row-tr">
                                <td colSpan={5} style={{ padding: '8px 14px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', textAlign: 'left' }}>
                                  <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => handleAddMilestone(floorIndex)}
                                    title="Add a new row to this floor"
                                  >
                                    <Plus size={14} />
                                    <span>Add Row</span>
                                  </button>
                                </td>
                              </tr>
                            </tbody>
                            <tfoot>
                              <tr className="spreadsheet-total-row">
                                <td colSpan={2} className="total-label-cell">
                                  SUBTOTAL ({floor.floorTitle || `SECTION #${floorIndex + 1}`})
                                </td>
                                <td className="total-amount-cell">
                                  <div className="total-val-wrapper">
                                    <span>₹</span>
                                    <span>{formatINR(floorSubtotal)}</span>
                                  </div>
                                </td>
                                <td colSpan={2}></td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Total Contract Metric Strip */}
                <div className="budget-metrics-strip" style={{ marginTop: '16px' }}>
                  <div className="budget-metric-pill">
                    <span className="pill-lbl">Total Milestone Value:</span>
                    <span className="pill-val highlight">₹{formatINR(editPaymentTotals.totalAmount)}</span>
                  </div>
                  <div className="budget-metric-pill">
                    <span className="pill-lbl">Floor Sections Count:</span>
                    <span className="pill-val">{editFloorSections.length} Floor Section{editFloorSections.length > 1 ? 's' : ''}</span>
                  </div>
                  <div className="budget-metric-pill">
                    <span className="pill-lbl">Total Milestones:</span>
                    <span className="pill-val">
                      {editFloorSections.reduce((acc, f) => acc + (f.milestones?.length || 0), 0)} Stages
                    </span>
                  </div>
                </div>

                {/* Footer Nav */}
                <div className="wizard-card-footer" style={{ marginTop: '20px' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setEditStep(1)}
                  >
                    <ArrowLeft size={18} />
                    <span>Previous: Project Info</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setEditStep(3)}
                  >
                    <span>Next: Client Login Register</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================
                STEP 3: CLIENT LOGIN REGISTER
               ======================================================== */}
            {editStep === 3 && (
              <div className="wizard-step-card animate-fade-in" style={{ padding: '20px' }}>
                <div className="step-card-header" style={{ marginBottom: '18px' }}>
                  <div className="step-header-left">
                    <h2>Client Portal Account Registration</h2>
                    <p>Update registered client credentials for authentication in the mobile client app and web portal.</p>
                  </div>
                </div>

                <div className="client-register-layout">
                  <div className="client-register-form">
                    {/* Client Name */}
                    <div className="form-group">
                      <label className="input-label required">
                        Client / Owner Full Name <span className="req-star">*</span>
                      </label>
                      <div className="input-wrapper">
                        <User className="input-icon" size={18} />
                        <input
                          type="text"
                          className={`styled-input ${editErrors.clientName ? 'has-error' : ''}`}
                          placeholder="e.g. Ramesh Sundaram"
                          value={editClientName}
                          onChange={(e) => setEditClientName(e.target.value)}
                        />
                      </div>
                      {editErrors.clientName && (
                        <span className="error-hint" style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '4px' }}>
                          <AlertCircle size={14} /> {editErrors.clientName}
                        </span>
                      )}
                    </div>

                    {/* Client Phone Number */}
                    <div className="form-group">
                      <label className="input-label required">
                        Client Mobile Number (Login Username) <span className="req-star">*</span>
                      </label>
                      <div className="input-wrapper">
                        <Phone className="input-icon" size={18} />
                        <input
                          type="tel"
                          maxLength={10}
                          className={`styled-input ${editErrors.clientPhone ? 'has-error' : ''}`}
                          placeholder="e.g. 9842188321 (10 digits)"
                          value={editClientPhone}
                          onChange={(e) => setEditClientPhone(e.target.value.replace(/\D/g, ''))}
                        />
                      </div>
                      {editErrors.clientPhone ? (
                        <span className="error-hint" style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '4px' }}>
                          <AlertCircle size={14} /> {editErrors.clientPhone}
                        </span>
                      ) : (
                        <span className="field-note" style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                          The client logs in using this 10-digit mobile number.
                        </span>
                      )}
                    </div>

                    {/* Client Password */}
                    <div className="form-group">
                      <div className="label-with-action" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label className="input-label required" style={{ margin: 0 }}>
                          Client Login Password <span className="req-star">*</span>
                        </label>
                        <button
                          type="button"
                          className="btn-link-action"
                          onClick={generateRandomPassword}
                          style={{ background: 'none', border: 'none', color: '#d97706', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Sparkles size={13} />
                          <span>Auto-generate Password</span>
                        </button>
                      </div>
                      <div className="input-wrapper">
                        <Lock className="input-icon" size={18} />
                        <input
                          type={showEditPassword ? 'text' : 'password'}
                          className="styled-input"
                          placeholder="Enter client password (min. 6 characters)"
                          value={editClientPassword}
                          onChange={(e) => setEditClientPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowEditPassword(!showEditPassword)}
                          style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                          tabIndex={-1}
                        >
                          {showEditPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* Client Email */}
                    <div className="form-group">
                      <label className="input-label">Client Email Address (Optional)</label>
                      <input
                        type="email"
                        className="styled-input"
                        placeholder="e.g. ramesh.s@gmail.com"
                        value={editClientEmail}
                        onChange={(e) => setEditClientEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* LIVE CLIENT CREDENTIALS PREVIEW CARD */}
                  <div className="client-credentials-card">
                    <div className="card-top-badge">
                      <ShieldCheck size={18} />
                      <span>Client Portal Access Pass</span>
                    </div>

                    <div className="preview-avatar-circle">
                      <User size={32} />
                    </div>

                    <h3 className="preview-client-name">
                      {editClientName || 'Client Full Name'}
                    </h3>
                    <p className="preview-project-name">
                      Site: {editSiteName || 'Project Name'}
                    </p>

                    <div className="credentials-grid">
                      <div className="cred-row">
                        <span className="cred-lbl">Login Phone:</span>
                        <span className="cred-val highlight">{editClientPhone || 'Not entered yet'}</span>
                      </div>
                      <div className="cred-row">
                        <span className="cred-lbl">Password:</span>
                        <span className="cred-val highlight">
                          {editClientPassword ? (showEditPassword ? editClientPassword : '••••••••') : 'Not entered yet'}
                        </span>
                      </div>
                      <div className="cred-row">
                        <span className="cred-lbl">Site Location:</span>
                        <span className="cred-val">{editLocation || 'Site Location'}</span>
                      </div>
                    </div>

                    <div className="cred-security-box">
                      <ShieldCheck size={16} className="sec-icon" />
                      <span>
                        The client uses this registered Phone Number & Password combination to log in to the Yeloline Client App.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Nav */}
                <div className="wizard-card-footer" style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setEditStep(2)}
                  >
                    <ArrowLeft size={18} />
                    <span>Previous: Payment Breakup</span>
                  </button>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setIsModalOpen(false);
                        setEditingSite(null);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSaveEditedSite}
                      disabled={isEditSubmitting}
                      style={{ padding: '10px 24px' }}
                    >
                      <CheckCircle2 size={18} />
                      <span>{isEditSubmitting ? 'Saving Changes...' : 'Save & Update Site'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </Modal>
      )}

      {/* VIEW SITE DETAIL MODAL WITH 4-STEP WIZARD TABS */}
      <Modal
        isOpen={!!viewingDetailSite}
        onClose={() => setViewingDetailSite(null)}
        title={`Site Details: ${viewingDetailSite?.site_name || ''}`}
        maxWidth="1020px"
      >
        {viewingDetailSite && (() => {
          // Find payment breakup for this site
          const siteBreakup = (paymentBreakups || []).find(b => 
            (b.site_id && (b.site_id === viewingDetailSite.site_id || String(b.site_id).toLowerCase() === String(viewingDetailSite.site_id).toLowerCase())) ||
            (b.id && (b.id === viewingDetailSite.site_id || String(b.id).toLowerCase() === String(viewingDetailSite.site_id).toLowerCase())) ||
            (b.site_name && viewingDetailSite.site_name && b.site_name.toLowerCase() === viewingDetailSite.site_name.toLowerCase())
          );

          // Find client user account
          const clientUser = (users || []).find(u => 
            (u.site_id && (u.site_id === viewingDetailSite.site_id || String(u.site_id).toLowerCase() === String(viewingDetailSite.site_id).toLowerCase())) ||
            (u.phone && viewingDetailSite.client_phone && (u.phone === viewingDetailSite.client_phone || u.phone.replace(/\D/g, '') === viewingDetailSite.client_phone.replace(/\D/g, '')))
          );

          const clientName = viewingDetailSite.client_name || clientUser?.name || clientUser?.full_name || 'N/A';
          const clientPhone = viewingDetailSite.client_phone || clientUser?.phone || 'N/A';
          const clientPassword = viewingDetailSite.client_password || clientUser?.password || 'Pass@123';
          const clientEmail = viewingDetailSite.client_email || clientUser?.email || 'N/A';

          // Budget Items to render
          const budgetRows = (Array.isArray(viewingDetailSite.budget_items) && viewingDetailSite.budget_items.length > 0)
            ? viewingDetailSite.budget_items
            : [
                { sno: 1, work_item: "Civil & Structural Foundation Work", estimated_amount: Math.round((viewingDetailSite.estimated_budget || 0) * 0.25), expense_amount: Math.round((viewingDetailSite.total_expense || 0) * 0.3) },
                { sno: 2, work_item: "Brickwork & Superstructure Masonry", estimated_amount: Math.round((viewingDetailSite.estimated_budget || 0) * 0.20), expense_amount: Math.round((viewingDetailSite.total_expense || 0) * 0.25) },
                { sno: 3, work_item: "Roof RCC Concrete & Shuttering", estimated_amount: Math.round((viewingDetailSite.estimated_budget || 0) * 0.18), expense_amount: Math.round((viewingDetailSite.total_expense || 0) * 0.20) },
                { sno: 4, work_item: "Plastering (Internal & External)", estimated_amount: Math.round((viewingDetailSite.estimated_budget || 0) * 0.12), expense_amount: Math.round((viewingDetailSite.total_expense || 0) * 0.10) },
                { sno: 5, work_item: "Electrical & MEP Concealed Plumbing", estimated_amount: Math.round((viewingDetailSite.estimated_budget || 0) * 0.10), expense_amount: Math.round((viewingDetailSite.total_expense || 0) * 0.08) },
                { sno: 6, work_item: "Flooring, Wall Tiles & Finishing", estimated_amount: Math.round((viewingDetailSite.estimated_budget || 0) * 0.15), expense_amount: Math.round((viewingDetailSite.total_expense || 0) * 0.07) }
              ].map(r => ({
                ...r,
                balance: (parseFloat(r.estimated_amount) || 0) - (parseFloat(r.expense_amount) || 0)
              }));

          const totalEstimated = budgetRows.reduce((s, r) => s + (parseFloat(r.estimated_amount) || 0), 0) || (parseFloat(viewingDetailSite.estimated_budget) || 0);
          const totalExpense = budgetRows.reduce((s, r) => s + (parseFloat(r.expense_amount) || 0), 0) || (parseFloat(viewingDetailSite.total_expense) || 0);
          const totalBalance = totalEstimated - totalExpense;

          // Breakup floors
          let floorsList = [];
          if (siteBreakup && Array.isArray(siteBreakup.floors) && siteBreakup.floors.length > 0) {
            floorsList = siteBreakup.floors;
          } else if (siteBreakup && Array.isArray(siteBreakup.milestones) && siteBreakup.milestones.length > 0) {
            floorsList = [{
              id: 'floor_1',
              floor_title: siteBreakup.floor_title || 'GROUND FLOOR',
              milestones: siteBreakup.milestones
            }];
          }

          const grandTotalBreakup = floorsList.reduce((sum, f) => 
            sum + (f.milestones || []).reduce((fSum, m) => fSum + (parseFloat(m.amount) || 0), 0)
          , 0);

          return (
            <div className="site-detail-modal-body">
              {/* Optional Cover Banner */}
              {viewingDetailSite.cover_image && (
                <div className="detail-modal-cover-banner">
                  <img src={viewingDetailSite.cover_image} alt={viewingDetailSite.site_name} onError={handleImgError} />
                </div>
              )}

              {/* Site Header Strip */}
              <div className="detail-modal-header-strip">
                <div>
                  <span className="site-id-pill large">{viewingDetailSite.site_id}</span>
                  <h2 className="detail-modal-title">{viewingDetailSite.site_name}</h2>
                  <div className="detail-modal-sub">
                    <MapPin size={14} />
                    <span>{viewingDetailSite.location}</span>
                  </div>
                </div>
                <span className={`site-status-badge large ${getStatusBadgeClass(viewingDetailSite.status)}`}>
                  {viewingDetailSite.status}
                </span>
              </div>

              {/* 4-STEP WIZARD TABS STEPPER (MATCHING SCREENSHOT) */}
              <div className="site-detail-stepper-card">
                <div className="site-detail-stepper-container">
                  {/* Step 1 */}
                  <div
                    className={`site-detail-step-item ${detailActiveTab === 1 ? 'active' : ''}`}
                    onClick={() => setDetailActiveTab(1)}
                    title="Project & Budget Table"
                  >
                    <div className="detail-step-circle">
                      <span>1</span>
                    </div>
                    <div className="detail-step-info">
                      <span className="detail-step-name">Project & Budget Table</span>
                    </div>
                  </div>

                  <div className="detail-step-connector" />

                  {/* Step 2 */}
                  <div
                    className={`site-detail-step-item ${detailActiveTab === 2 ? 'active' : ''}`}
                    onClick={() => setDetailActiveTab(2)}
                    title="Payment Breakup"
                  >
                    <div className="detail-step-circle">
                      <span>2</span>
                    </div>
                    <div className="detail-step-info">
                      <span className="detail-step-name">Payment Breakup</span>
                    </div>
                  </div>

                  <div className="detail-step-connector" />

                  {/* Step 3 */}
                  <div
                    className={`site-detail-step-item ${detailActiveTab === 3 ? 'active' : ''}`}
                    onClick={() => setDetailActiveTab(3)}
                    title="Client Login Register"
                  >
                    <div className="detail-step-circle">
                      <span>3</span>
                    </div>
                    <div className="detail-step-info">
                      <span className="detail-step-name">Client Login Register</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ========================================================
                  TAB 1: PROJECT & BUDGET TABLE
                 ======================================================== */}
              {detailActiveTab === 1 && (
                <div className="detail-tab-card">
                  <div className="detail-tab-header">
                    <div className="detail-tab-header-left">
                      <span className="detail-tab-pill">
                        <Building2 size={13} /> Project & Budget
                      </span>
                      <h3 className="detail-tab-title">Project Parameters & Itemized Budget Table</h3>
                      <p className="detail-tab-desc">
                        Engineering credentials, site supervisor, and complete itemized budget & expense allocations.
                      </p>
                    </div>
                  </div>

                  {/* Project Metadata Grid */}
                  <div className="detail-meta-grid">
                    <div className="detail-meta-item">
                      <span className="detail-meta-label">Project Name</span>
                      <span className="detail-meta-value">{viewingDetailSite.site_name}</span>
                    </div>
                    <div className="detail-meta-item">
                      <span className="detail-meta-label">Site ID</span>
                      <span className="detail-meta-value highlight">{viewingDetailSite.site_id}</span>
                    </div>
                    <div className="detail-meta-item">
                      <span className="detail-meta-label">Structure Type</span>
                      <span className="detail-meta-value">{viewingDetailSite.structure_type}</span>
                    </div>
                    <div className="detail-meta-item">
                      <span className="detail-meta-label">Built-up Area</span>
                      <span className="detail-meta-value">{Number(viewingDetailSite.builtup_area_sqft || 0).toLocaleString()} sq ft</span>
                    </div>
                    <div className="detail-meta-item">
                      <span className="detail-meta-label">Floors</span>
                      <span className="detail-meta-value">{viewingDetailSite.number_of_floors}</span>
                    </div>
                    <div className="detail-meta-item">
                      <span className="detail-meta-label">Site Supervisor</span>
                      <span className="detail-meta-value">{viewingDetailSite.supervisor_in_charge || 'Er. S. Prakash'}</span>
                    </div>
                    <div className="detail-meta-item">
                      <span className="detail-meta-label">Start Date</span>
                      <span className="detail-meta-value">{viewingDetailSite.start_date || 'N/A'}</span>
                    </div>
                    <div className="detail-meta-item">
                      <span className="detail-meta-label">Target Completion</span>
                      <span className="detail-meta-value">{viewingDetailSite.target_completion_date || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Construction Progress Bar */}
                  <div className="detail-progress-card">
                    <div className="detail-progress-head">
                      <span>Construction Execution Progress</span>
                      <span>{viewingDetailSite.progress_percentage || 0}% Complete</span>
                    </div>
                    <div className="detail-progress-bar-bg">
                      <div
                        className="detail-progress-bar-fill"
                        style={{ width: `${viewingDetailSite.progress_percentage || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Budget & Expense Spreadsheet Table */}
                  <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calculator size={18} style={{ color: '#d97706' }} />
                    Itemized Budget & Expense Breakdown
                  </h4>

                  <div className="detail-spreadsheet-container">
                    <table className="detail-spreadsheet-table">
                      <thead>
                        <tr>
                          <th className="cell-sno">S.No</th>
                          <th>Work Item / Category Description</th>
                          <th style={{ textAlign: 'right' }}>Estimated Amount (₹)</th>
                          <th style={{ textAlign: 'right' }}>Expense Amount (₹)</th>
                          <th style={{ textAlign: 'right' }}>Balance (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {budgetRows.map((row, idx) => {
                          const est = parseFloat(row.estimated_amount) || 0;
                          const exp = parseFloat(row.expense_amount) || 0;
                          const bal = est - exp;
                          return (
                            <tr key={row.sno || idx}>
                              <td className="cell-sno">{row.sno || idx + 1}</td>
                              <td className="cell-name">{row.work_item}</td>
                              <td className="cell-currency">₹{formatINR(est)}</td>
                              <td className="cell-currency">₹{formatINR(exp)}</td>
                              <td className={`cell-currency ${bal < 0 ? 'balance-neg' : 'balance-pos'}`}>
                                ₹{formatINR(bal)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="detail-spreadsheet-total-row">
                          <td colSpan={2} className="total-lbl">TOTAL:</td>
                          <td className="cell-currency">₹{formatINR(totalEstimated)}</td>
                          <td className="cell-currency">₹{formatINR(totalExpense)}</td>
                          <td className={`cell-currency ${totalBalance < 0 ? 'balance-neg' : 'balance-pos'}`}>
                            ₹{formatINR(totalBalance)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Summary Metric Strip */}
                  <div className="detail-metrics-strip">
                    <div className="detail-metric-pill">
                      <span className="lbl">Total Estimated:</span>
                      <span className="val">₹{formatINR(totalEstimated)}</span>
                    </div>
                    <div className="detail-metric-pill">
                      <span className="lbl">Total Expenses:</span>
                      <span className="val">₹{formatINR(totalExpense)}</span>
                    </div>
                    <div className={`detail-metric-pill ${totalBalance < 0 ? 'pill-alert' : 'pill-success'}`}>
                      <span className="lbl">Net Balance:</span>
                      <span className="val">₹{formatINR(totalBalance)}</span>
                    </div>
                  </div>

                  {/* Material & Construction Specs */}
                  <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', marginTop: '20px', marginBottom: '10px' }}>
                    Engineering & Material Specifications
                  </h4>
                  <div className="specs-list-grid" style={{ marginBottom: '20px' }}>
                    <div className="spec-card">
                      <span className="spec-card-title">Built-up Area</span>
                      <span className="spec-card-val">{Number(viewingDetailSite.builtup_area_sqft || 0).toLocaleString()} sq ft</span>
                    </div>
                    <div className="spec-card">
                      <span className="spec-card-title">Floor Levels</span>
                      <span className="spec-card-val">{viewingDetailSite.number_of_floors || 'G + 1 Floor'}</span>
                    </div>
                  </div>

                  {/* Gallery Photos */}
                  {viewingDetailSite.gallery_images && viewingDetailSite.gallery_images.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                        Project Gallery Photos ({viewingDetailSite.gallery_images.length})
                      </h4>
                      <div className="detail-modal-gallery-grid">
                        {viewingDetailSite.gallery_images.map((img, i) => (
                          <div key={img.id || i} className="detail-gallery-thumb-card">
                            <img src={img.url} alt={`Gallery ${i}`} onError={handleImgError} />
                            {img.tag && <span className="detail-gallery-tag">{img.tag}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Architectural Description */}
                  {viewingDetailSite.description && (
                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                        Architectural Notes & Description
                      </h4>
                      <p className="detail-description-text">{viewingDetailSite.description}</p>
                    </div>
                  )}

                  {/* Tab Navigation Footer */}
                  <div className="detail-tab-footer-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setViewingDetailSite(null)}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="btn-tab-nav next"
                      onClick={() => setDetailActiveTab(2)}
                    >
                      <span>Next: Payment Breakup</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* ========================================================
                  TAB 2: PAYMENT BREAKUP
                 ======================================================== */}
              {detailActiveTab === 2 && (
                <div className="detail-tab-card">
                  <div className="detail-tab-header">
                    <div className="detail-tab-header-left">
                      <span className="detail-tab-pill">
                        <Layers size={13} /> Payment Breakup
                      </span>
                      <h3 className="detail-tab-title">Construction Payment Breakup & Milestones</h3>
                      <p className="detail-tab-desc">
                        Floor-by-floor contractual milestone schedules, stage amounts, and payment percentages.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      onClick={() => {
                        setViewingDetailSite(null);
                        setActiveTab('payment_breakup');
                      }}
                    >
                      <ExternalLink size={14} />
                      <span>Open in Payment Breakup</span>
                    </button>
                  </div>

                  {floorsList.length === 0 ? (
                    <div style={{ padding: '30px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <AlertCircle size={32} style={{ color: '#d97706', marginBottom: '8px' }} />
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                        No Custom Payment Breakup Configured Yet
                      </h4>
                      <p style={{ fontSize: '0.86rem', color: '#64748b', maxWidth: '520px', margin: '0 auto 16px auto' }}>
                        This site currently does not have custom floor milestones saved. You can configure multi-floor stages and amounts in the Payment Breakup module.
                      </p>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          setViewingDetailSite(null);
                          setActiveTab('payment_breakup');
                        }}
                      >
                        <Plus size={14} />
                        <span>Configure Payment Breakup Now</span>
                      </button>
                    </div>
                  ) : (
                    <div>
                      {floorsList.map((floor, fIndex) => {
                        const floorSubtotal = (floor.milestones || []).reduce(
                          (acc, m) => acc + (parseFloat(m.amount) || 0),
                          0
                        );
                        return (
                          <div key={floor.id || fIndex} className="detail-floor-card">
                            <div className="detail-floor-header-bar">
                              <span className="detail-floor-badge">
                                <Layers size={14} />
                                {floor.floor_title || floor.floorTitle || `FLOOR ${fIndex + 1}`}
                              </span>
                              <div className="detail-floor-subtotal-info">
                                <span>Floor Subtotal:</span>
                                <strong>₹{formatINR(floorSubtotal)}</strong>
                                {grandTotalBreakup > 0 && floorSubtotal > 0 && (
                                  <span className="detail-floor-subtotal-pct">
                                    {((floorSubtotal / grandTotalBreakup) * 100).toFixed(1)}% of total
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="detail-spreadsheet-container" style={{ margin: 0, border: 'none' }}>
                              <table className="detail-spreadsheet-table">
                                <thead>
                                  <tr>
                                    <th className="cell-sno">S.No</th>
                                    <th>Milestone / Construction Stage</th>
                                    <th style={{ textAlign: 'right' }}>Scheduled Amount (₹)</th>
                                    <th>Work Schedule / Timeline</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(floor.milestones || []).map((m, mIdx) => {
                                    const amt = parseFloat(m.amount) || 0;
                                    return (
                                      <tr key={m.id || mIdx}>
                                        <td className="cell-sno">{m.sno || mIdx + 1}</td>
                                        <td className="cell-name">{m.stage_name}</td>
                                        <td className="cell-currency">₹{formatINR(amt)}</td>
                                        <td>{m.work_schedule || m.target_date || 'Stage Completion'}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                                <tfoot>
                                  <tr className="detail-spreadsheet-total-row">
                                    <td colSpan={2} className="total-lbl">SUBTOTAL ({floor.floor_title || floor.floorTitle}):</td>
                                    <td className="cell-currency">₹{formatINR(floorSubtotal)}</td>
                                    <td></td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          </div>
                        );
                      })}

                      {/* Grand Total Strip */}
                      <div className="detail-metrics-strip">
                        <div className="detail-metric-pill">
                          <span className="lbl">Total Milestone Value:</span>
                          <span className="val highlight">₹{formatINR(grandTotalBreakup)}</span>
                        </div>
                        <div className="detail-metric-pill">
                          <span className="lbl">Floor Sections Count:</span>
                          <span className="val">{floorsList.length} Floor{floorsList.length > 1 ? 's' : ''}</span>
                        </div>
                        <div className="detail-metric-pill">
                          <span className="lbl">Total Milestones:</span>
                          <span className="val">
                            {floorsList.reduce((acc, f) => acc + (f.milestones?.length || 0), 0)} Stages
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab Navigation Footer */}
                  <div className="detail-tab-footer-actions">
                    <button
                      type="button"
                      className="btn-tab-nav prev"
                      onClick={() => setDetailActiveTab(1)}
                    >
                      <ArrowLeft size={16} />
                      <span>Previous: Project & Budget</span>
                    </button>
                    <button
                      type="button"
                      className="btn-tab-nav next"
                      onClick={() => setDetailActiveTab(3)}
                    >
                      <span>Next: Client Login Register</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* ========================================================
                  TAB 3: CLIENT LOGIN REGISTER
                 ======================================================== */}
              {detailActiveTab === 3 && (
                <div className="detail-tab-card">
                  <div className="detail-tab-header">
                    <div className="detail-tab-header-left">
                      <span className="detail-tab-pill">
                        <User size={13} /> Client Portal
                      </span>
                      <h3 className="detail-tab-title">Client Portal Login Credentials & Access</h3>
                      <p className="detail-tab-desc">
                        Registered client credentials required to log in to the Yeloline Client App and Web Portal.
                      </p>
                    </div>
                  </div>

                  <div className="detail-client-layout">
                    {/* Left: Credentials Info Card */}
                    <div className="detail-client-info-box">
                      <div className="detail-client-info-row">
                        <span className="lbl">Client / Owner Full Name</span>
                        <span className="val">{clientName}</span>
                      </div>

                      <div className="detail-client-info-row">
                        <span className="lbl">Registered Mobile (Login Username)</span>
                        <span className="val highlight" style={{ fontSize: '1.05rem', color: '#0f172a' }}>
                          <Phone size={15} style={{ display: 'inline', marginRight: '6px', color: '#d97706' }} />
                          {clientPhone}
                        </span>
                      </div>

                      <div className="detail-client-info-row">
                        <span className="lbl">Client Login Password</span>
                        <div className="detail-password-box">
                          <Lock size={15} style={{ color: '#64748b' }} />
                          <span className="detail-password-val">
                            {showDetailPassword ? clientPassword : '••••••••'}
                          </span>
                          <button
                            type="button"
                            className="detail-icon-btn"
                            title={showDetailPassword ? 'Hide password' : 'Show password'}
                            onClick={() => setShowDetailPassword(!showDetailPassword)}
                          >
                            {showDetailPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <div className="detail-client-info-row">
                        <span className="lbl">Client Email Address</span>
                        <span className="val">{clientEmail}</span>
                      </div>

                      <div className="detail-client-info-row">
                        <span className="lbl">Account Status</span>
                        <span className="val" style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle2 size={15} /> Active / Authorized for Client Portal
                        </span>
                      </div>

                      <div style={{ marginTop: '10px', padding: '12px', background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#64748b', lineHeight: 1.45 }}>
                        <ShieldCheck size={16} style={{ color: '#d97706', float: 'left', marginRight: '8px', marginTop: '2px' }} />
                        The client uses this registered Mobile Number and Password to access their live construction updates, photos, payment breakups, and bills on the mobile client app.
                      </div>
                    </div>

                    {/* Right: Client Portal Access Pass Card */}
                    <div className="detail-client-pass-card">
                      <div>
                        <div className="pass-card-top">
                          <span className="pass-card-badge">
                            <ShieldCheck size={14} /> Client Portal Pass
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Yeloline Secure</span>
                        </div>

                        <div className="pass-card-avatar">
                          <User size={26} />
                        </div>

                        <h3 className="pass-client-name">{clientName}</h3>
                        <p className="pass-project-name">Project: {viewingDetailSite.site_name}</p>

                        <div className="pass-creds-grid">
                          <div className="pass-cred-row">
                            <span className="k">Site ID:</span>
                            <span className="v">{viewingDetailSite.site_id}</span>
                          </div>
                          <div className="pass-cred-row">
                            <span className="k">Login Mobile:</span>
                            <span className="v gold">{clientPhone}</span>
                          </div>
                          <div className="pass-cred-row">
                            <span className="k">Password:</span>
                            <span className="v gold">
                              {showDetailPassword ? clientPassword : '••••••••'}
                            </span>
                          </div>
                          <div className="pass-cred-row">
                            <span className="k">Location:</span>
                            <span className="v">{viewingDetailSite.location}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pass-actions-row">
                        <button
                          type="button"
                          className="pass-action-btn copy"
                          onClick={() => handleCopyDetailCredentials(viewingDetailSite, clientUser)}
                        >
                          {copiedCreds ? <CheckCheck size={15} /> : <Copy size={15} />}
                          <span>{copiedCreds ? 'Copied Pass!' : 'Copy Login Pass'}</span>
                        </button>
                        <button
                          type="button"
                          className="pass-action-btn whatsapp"
                          onClick={() => handleShareDetailWhatsApp(viewingDetailSite, clientUser)}
                        >
                          <Share2 size={15} />
                          <span>Share WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Tab Navigation Footer */}
                  <div className="detail-tab-footer-actions">
                    <button
                      type="button"
                      className="btn-tab-nav prev"
                      onClick={() => setDetailActiveTab(2)}
                    >
                      <ArrowLeft size={16} />
                      <span>Previous: Payment Breakup</span>
                    </button>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setViewingDetailSite(null)}
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                          const siteToEdit = viewingDetailSite;
                          setViewingDetailSite(null);
                          openEditModal(siteToEdit);
                        }}
                      >
                        <Edit3 size={15} />
                        <span>Edit Site Parameters</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          );
        })()}
      </Modal>

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        columnsSpec={SITE_COLUMNS_SPEC}
        onImport={(data) => {
          importSites(data);
          setIsImportModalOpen(false);
        }}
        sampleRow={{
          site_id: "SITE-105",
          site_name: "Modern Minimalist Villa - Perundurai",
          client_name: "Ramesh Sundaram",
          client_phone: "+91 98421 88321",
          client_email: "ramesh.s@gmail.com",
          location: "Perundurai Road, Erode",
          structure_type: "Villa",
          builtup_area_sqft: 3200,
          number_of_floors: "G + 1 Floor",
          estimated_budget: 7200000,
          supervisor_in_charge: "Er. S. Prakash",
          start_date: "2026-02-15",
          target_completion_date: "2026-11-30",
          status: "In Progress",
          progress_percentage: 65,
          cement_brand: "UltraTech PPC (Premium)",
          steel_brand: "TATA Tiscon 550D",
          bricks_spec: "Red Bricks (Premium)",
          flooring_spec: "Vitrified Tiles (Premium)",
          description: "4BHK luxury villa"
        }}
      />
    </div>
  );
}
