import React, { useState, useMemo } from 'react';
import {
  Building2,
  MapPin,
  Calendar,
  User,
  DollarSign,
  Layers,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Phone,
  ShieldCheck,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  MessageCircle,
  Calculator,
  Filter
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Modal from '../../components/common/Modal/Modal';
import './NewSiteModule.css';

// Predefined 10 Work Categories from reference image
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

// Predefined 10 Payment Breakup Milestones
const DEFAULT_PAYMENT_STAGES = [
  { sno: 1, stage_name: 'MOBILIZATION ADVANCE (16%)', amount: '', work_schedule: '' },
  { sno: 2, stage_name: 'ON COMPLETION OF BASEMENT', amount: '', work_schedule: '' },
  { sno: 3, stage_name: "ON COMPLETION OF 7' LINTEL LEVEL RCC WORK", amount: '', work_schedule: '' },
  { sno: 4, stage_name: 'ON COMPLETION OF GROUND FLOOR ROOF CONCRETE', amount: '', work_schedule: '' },
  { sno: 5, stage_name: 'ON COMPLETION OF MEP CONCEALED WORK', amount: '', work_schedule: '' },
  { sno: 6, stage_name: 'ON COMPLETION OF WALL PLASTERING', amount: '', work_schedule: '' },
  { sno: 7, stage_name: 'ON COMPLETION OF TILE LAYING', amount: '', work_schedule: '' },
  { sno: 8, stage_name: 'ON COMPLETION OF UPVC WINDOW & DOOR FIXING', amount: '', work_schedule: '' },
  { sno: 9, stage_name: 'ON COMPLETION OF INTERIOR WALL PAINTING', amount: '', work_schedule: '' },
  { sno: 10, stage_name: 'ON COMPLETION OF ALL FINISHING WORKS', amount: '', work_schedule: '' }
];

const DEFAULT_FLOOR_NAMES = [
  'GROUND FLOOR',
  'FIRST FLOOR',
  'SECOND FLOOR',
  'THIRD FLOOR',
  'FOURTH FLOOR',
  'TERRACE FLOOR'
];

const getInitialFloorStages = (floorName = 'GROUND FLOOR') => {
  return DEFAULT_PAYMENT_STAGES.map((s, idx) => {
    let stageName = s.stage_name;
    const upper = (floorName || '').toUpperCase();
    if (s.sno === 4 && upper && !upper.includes('GROUND')) {
      stageName = `ON COMPLETION OF ${upper} ROOF CONCRETE`;
    }
    return {
      sno: idx + 1,
      stage_name: stageName,
      amount: '',
      work_schedule: s.work_schedule
    };
  });
};


const getAvailableFloorTitles = (numFloorsSetting = 'G + 1 Floor', totalSectionsCount = 1, currentTitle = '') => {
  let countFromSetting = 2;
  let hasBasement = false;
  if (numFloorsSetting === 'G Floor') countFromSetting = 1;
  else if (numFloorsSetting === 'G + 1 Floor') countFromSetting = 2;
  else if (numFloorsSetting === 'G + 2 Floors') countFromSetting = 3;
  else if (numFloorsSetting === 'G + 3 Floors') countFromSetting = 4;
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

const STRUCTURE_TYPES = [
  'Villa',
  'Residential House',
  'Commercial Building',
  'Renovation & Remodeling',
  'Industrial Warehouse',
  'Apartment Block'
];

const FLOOR_OPTIONS = [
  'G Floor',
  'G + 1 Floor',
  'G + 2 Floors',
  'G + 3 Floors',
  'Basement + G + 2 Floors'
];

export default function NewSiteModule() {
  const {
    sites,
    addSite,
    savePaymentBreakup,
    addUser,
    setActiveTab
  } = useApp();

  // Wizard Step (1 to 4)
  const [currentStep, setCurrentStep] = useState(1);

  // Form State: Step 1 (Project Info + Budget Estimation Table)
  const [siteName, setSiteName] = useState('');
  const [location, setLocation] = useState('');
  const [structureType, setStructureType] = useState('Villa');
  const [supervisor, setSupervisor] = useState('Er. S. Prakash');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetDate, setTargetDate] = useState('');
  const [budgetRows, setBudgetRows] = useState(DEFAULT_BUDGET_ROWS);

  // Form State: Step 2 (Payment Breakup Floors)
  const [floorSections, setFloorSections] = useState([
    {
      id: 'floor_1',
      floorTitle: 'GROUND FLOOR',
      milestones: getInitialFloorStages('GROUND FLOOR')
    }
  ]);
  const [selectedFloorFilter, setSelectedFloorFilter] = useState('ALL');

  const effectiveFloorFilter = useMemo(() => {
    if (selectedFloorFilter === 'ALL') return 'ALL';
    const idx = parseInt(selectedFloorFilter, 10);
    if (!isNaN(idx) && idx >= 0 && idx < floorSections.length) {
      return String(idx);
    }
    return 'ALL';
  }, [selectedFloorFilter, floorSections.length]);

  // Form State: Step 3 (Client Login Register)
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientPassword, setClientPassword] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Specs & Details
  const [builtupArea, setBuiltupArea] = useState('3200');
  const [floors, setFloors] = useState('G + 1 Floor');
  const [coverImage, setCoverImage] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);
  const [siteNotes, setSiteNotes] = useState('');

  // Validation & Submission States
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdSiteResult, setCreatedSiteResult] = useState(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // ==================== STEP 1 CALCULATIONS ====================
  const budgetTotals = useMemo(() => {
    let totalEstimated = 0;
    let totalExpense = 0;
    let totalBalance = 0;

    budgetRows.forEach(row => {
      const est = parseFloat(row.estimated_amount) || 0;
      const exp = parseFloat(row.expense_amount) || 0;
      const bal = est - exp;

      totalEstimated += est;
      totalExpense += exp;
      totalBalance += bal;
    });

    return { totalEstimated, totalExpense, totalBalance };
  }, [budgetRows]);

  const handleBudgetChange = (index, field, value) => {
    const updated = [...budgetRows];
    updated[index] = { ...updated[index], [field]: value };
    setBudgetRows(updated);
  };

  const handleAddBudgetRow = () => {
    const newSno = budgetRows.length + 1;
    setBudgetRows([
      ...budgetRows,
      { sno: newSno, description: `Custom Work Item #${newSno}`, estimated_amount: '', expense_amount: '' }
    ]);
  };

  const handleRemoveBudgetRow = (index) => {
    if (budgetRows.length <= 1) return;
    const updated = budgetRows
      .filter((_, i) => i !== index)
      .map((row, i) => ({ ...row, sno: i + 1 }));
    setBudgetRows(updated);
  };

  const handleResetBudgetRows = () => {
    if (window.confirm('Reset the budget & expense table back to the default 10 work categories?')) {
      setBudgetRows(DEFAULT_BUDGET_ROWS);
    }
  };

  // ==================== STEP 2 CALCULATIONS ====================
  const paymentTotals = useMemo(() => {
    let totalAmount = 0;
    let totalStagesCount = 0;
    floorSections.forEach(floor => {
      (floor.milestones || []).forEach(m => {
        totalAmount += parseFloat(m.amount) || 0;
        totalStagesCount++;
      });
    });
    return { totalAmount, totalStagesCount };
  }, [floorSections]);

  const handleFloorTitleChange = (floorIndex, value) => {
    setFloorSections(prev => {
      const updated = [...prev];
      const upper = (value || '').toUpperCase();
      const updatedMilestones = (updated[floorIndex].milestones || []).map(m => {
        if (m.sno === 4 && (m.stage_name?.includes('ROOF CONCRETE') || m.stage_name === 'ON COMPLETION OF ROOF CONCRETE')) {
          if (upper.includes('GROUND')) {
            return { ...m, stage_name: 'ON COMPLETION OF ROOF CONCRETE' };
          } else {
            return { ...m, stage_name: `ON COMPLETION OF ${upper} ROOF CONCRETE` };
          }
        }
        return m;
      });

      updated[floorIndex] = {
        ...updated[floorIndex],
        floorTitle: value,
        milestones: updatedMilestones
      };
      return updated;
    });
  };

  const handleMilestoneChange = (floorIndex, milestoneIndex, field, value) => {
    setFloorSections(prev => {
      const updated = [...prev];
      const floor = { ...updated[floorIndex] };
      const updatedMilestones = [...floor.milestones];
      updatedMilestones[milestoneIndex] = {
        ...updatedMilestones[milestoneIndex],
        [field]: value
      };
      floor.milestones = updatedMilestones;
      updated[floorIndex] = floor;
      return updated;
    });
  };

  const handleAddMilestone = (floorIndex) => {
    setFloorSections(prev => {
      const updated = [...prev];
      const floor = { ...updated[floorIndex] };
      const newSno = (floor.milestones || []).length + 1;
      floor.milestones = [
        ...(floor.milestones || []),
        { sno: newSno, stage_name: `ON COMPLETION OF STAGE ${newSno}`, amount: '', work_schedule: '' }
      ];
      updated[floorIndex] = floor;
      return updated;
    });
  };

  const handleRemoveMilestone = (floorIndex, milestoneIndex) => {
    setFloorSections(prev => {
      const updated = [...prev];
      const floor = { ...updated[floorIndex] };
      if ((floor.milestones || []).length <= 1) return prev;
      floor.milestones = floor.milestones
        .filter((_, i) => i !== milestoneIndex)
        .map((m, i) => ({ ...m, sno: i + 1 }));
      updated[floorIndex] = floor;
      return updated;
    });
  };

  const handleResetFloorMilestones = (floorIndex) => {
    const currentFloor = floorSections[floorIndex];
    if (window.confirm(`Reset milestones for "${currentFloor.floorTitle || `Floor #${floorIndex + 1}`}" back to default 10 construction stages?`)) {
      setFloorSections(prev => {
        const updated = [...prev];
        updated[floorIndex] = {
          ...updated[floorIndex],
          milestones: getInitialFloorStages(updated[floorIndex].floorTitle)
        };
        return updated;
      });
    }
  };

  const handleAddFloor = () => {
    const nextIdx = floorSections.length;
    const available = getAvailableFloorTitles(floors, floorSections.length + 1);
    const defaultTitle = available[nextIdx] || (nextIdx < DEFAULT_FLOOR_NAMES.length
      ? DEFAULT_FLOOR_NAMES[nextIdx]
      : `FLOOR ${nextIdx + 1}`);

    setFloorSections(prev => [
      ...prev,
      {
        id: `floor_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        floorTitle: defaultTitle,
        milestones: getInitialFloorStages(defaultTitle)
      }
    ]);

    if (selectedFloorFilter !== 'ALL') {
      setSelectedFloorFilter(String(nextIdx));
    }
  };

  const handleRemoveFloor = (floorIndex) => {
    if (floorSections.length <= 1) {
      alert("At least one floor form is required.");
      return;
    }
    const currentFloor = floorSections[floorIndex];
    if (window.confirm(`Are you sure you want to remove "${currentFloor.floorTitle || `Floor #${floorIndex + 1}`}" and its milestone schedule?`)) {
      setFloorSections(prev => prev.filter((_, i) => i !== floorIndex));
      setSelectedFloorFilter('ALL');
    }
  };

  // ==================== STEP 3 HELPERS ====================
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let pass = '';
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setClientPassword(pass);
  };

  // ==================== STEP VALIDATIONS ====================
  const validateStep1 = () => {
    const errs = {};
    if (!siteName.trim()) errs.siteName = 'Name of the project is required';
    if (!location.trim()) errs.location = 'Location of the project is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    // Validate each floor section title
    const errs = {};
    floorSections.forEach((floor, idx) => {
      if (!floor.floorTitle || !floor.floorTitle.trim()) {
        errs[`floorTitle_${idx}`] = `Floor Title is required for Floor #${idx + 1}`;
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = () => {
    const errs = {};
    if (!clientName.trim()) errs.clientName = 'Client Name is required';

    const cleanPhone = clientPhone.replace(/\D/g, '');
    if (!cleanPhone) {
      errs.clientPhone = 'Client Phone Number is required';
    } else if (cleanPhone.length < 10) {
      errs.clientPhone = 'Please enter a valid 10-digit phone number';
    }

    if (!clientPassword.trim()) {
      errs.clientPassword = 'Client Password is required for client login';
    } else if (clientPassword.length < 6) {
      errs.clientPassword = 'Password must be at least 6 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goToNextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;

    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ==================== SUBMIT & REGISTER SITE ====================
  const handleFinalSubmit = async (e) => {
    e.preventDefault();

    // Final checks
    if (!validateStep1() || !validateStep3()) {
      alert('Please complete all required fields in Project Details and Client Login steps.');
      return;
    }

    setIsSubmitting(true);

    try {
      const generatedSiteId = `SITE-${101 + (sites ? sites.length : 0)}`;
      const cleanPhone = clientPhone.replace(/\D/g, '');

      // Budget items with auto-computed balance
      const formattedBudgetItems = budgetRows.map((row, idx) => {
        const est = parseFloat(row.estimated_amount) || 0;
        const exp = parseFloat(row.expense_amount) || 0;
        const fallbackDesc = DEFAULT_BUDGET_ROWS[idx]?.description || DEFAULT_BUDGET_ROWS.find(d => d.sno === row.sno)?.description || `Work Item #${row.sno || idx + 1}`;
        const desc = (row.description || row.work_item || '').trim() || fallbackDesc;
        return {
          sno: row.sno || idx + 1,
          work_item: desc,
          description: desc,
          estimated_amount: est,
          expense_amount: exp,
          balance: est - exp
        };
      });

      // Format all floor sections and their milestones
      const formattedFloors = floorSections.map((floor, fIdx) => {
        const fTotal = (floor.milestones || []).reduce((acc, m) => acc + (parseFloat(m.amount) || 0), 0);
        return {
          id: floor.id || `floor_${fIdx + 1}`,
          floor_title: floor.floorTitle?.trim() || `FLOOR ${fIdx + 1}`,
          total_amount: fTotal,
          milestones: (floor.milestones || []).map((m, idx) => ({
            id: `stage_${fIdx + 1}_${idx + 1}`,
            sno: m.sno || idx + 1,
            stage_name: m.stage_name,
            amount: parseFloat(m.amount) || 0,
            work_schedule: m.work_schedule || '',
            percentage: fTotal > 0
              ? Math.round(((parseFloat(m.amount) || 0) / fTotal) * 100)
              : 0
          }))
        };
      });

      const allMilestones = formattedFloors.flatMap(f => f.milestones);

      // 1. Site Document Payload
      const sitePayload = {
        site_id: generatedSiteId,
        site_name: siteName.trim(),
        location: location.trim(),
        structure_type: structureType,
        builtup_area_sqft: parseFloat(builtupArea) || 0,
        number_of_floors: floors,
        estimated_budget: budgetTotals.totalEstimated > 0 ? budgetTotals.totalEstimated : paymentTotals.totalAmount,
        total_expense: budgetTotals.totalExpense,
        balance: budgetTotals.totalBalance,
        budget_items: formattedBudgetItems,
        supervisor_in_charge: supervisor.trim() || 'Er. S. Prakash',
        start_date: startDate,
        target_completion_date: targetDate || '',
        status: 'Planning',
        progress_percentage: 0,
        cement_brand: '',
        steel_brand: '',
        bricks_spec: '',
        flooring_spec: '',
        description: siteNotes,
        cover_image: coverImage || '',
        gallery_images: galleryImages || [],
        // Client details
        client_name: clientName.trim(),
        client_phone: cleanPhone,
        client_password: clientPassword.trim(),
        client_email: clientEmail.trim(),
        created_at: new Date().toISOString()
      };

      // 2. Payment Breakup Document Payload
      const breakupPayload = {
        id: generatedSiteId,
        site_id: generatedSiteId,
        site_name: siteName.trim(),
        client_name: clientName.trim(),
        floor_title: floorSections[0]?.floorTitle?.trim() || 'GROUND FLOOR',
        floors: formattedFloors,
        total_amount: paymentTotals.totalAmount > 0 ? paymentTotals.totalAmount : budgetTotals.totalEstimated,
        milestones: allMilestones,
        created_at: new Date().toISOString()
      };

      // 3. Client User Record Payload
      const clientUserPayload = {
        user_id: `CLIENT-${cleanPhone.slice(-6) || Date.now()}`,
        name: clientName.trim(),
        full_name: clientName.trim(),
        phone: cleanPhone,
        password: clientPassword.trim(),
        email: clientEmail.trim(),
        role: 'client',
        site_name: siteName.trim(),
        site_id: generatedSiteId,
        location: location.trim(),
        status: 'Active',
        created_at: new Date().toISOString()
      };

      // Execute Saves in parallel
      await addSite(sitePayload);
      await savePaymentBreakup(breakupPayload);
      await addUser(clientUserPayload);

      setCreatedSiteResult({
        site_id: generatedSiteId,
        site_name: siteName.trim(),
        location: location.trim(),
        client_name: clientName.trim(),
        client_phone: cleanPhone,
        client_password: clientPassword.trim(),
        total_budget: budgetTotals.totalEstimated
      });
    } catch (err) {
      console.error('Error creating site:', err);
      alert('An error occurred while creating the site: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdSiteResult) return;
    const text = `*Yeloline Construction - Client Portal Access*\n` +
      `Project: ${createdSiteResult.site_name}\n` +
      `Site ID: ${createdSiteResult.site_id}\n` +
      `Registered Mobile: ${createdSiteResult.client_phone}\n` +
      `Password: ${createdSiteResult.client_password}\n\n` +
      `Login to your Client Portal to track construction stages, payment breakups and bills.`;

    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 3000);
  };

  const handleShareWhatsApp = () => {
    if (!createdSiteResult) return;
    const text = `*Yeloline Construction - Client Portal Access*\n` +
      `Project: ${createdSiteResult.site_name}\n` +
      `Site ID: ${createdSiteResult.site_id}\n` +
      `Registered Mobile: ${createdSiteResult.client_phone}\n` +
      `Password: ${createdSiteResult.client_password}\n\n` +
      `Login to your Client Portal to track construction stages, payment breakups and bills.`;

    const url = `https://wa.me/91${createdSiteResult.client_phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleResetForm = () => {
    setCurrentStep(1);
    setSiteName('');
    setLocation('');
    setBudgetRows(DEFAULT_BUDGET_ROWS);
    setFloorSections([
      {
        id: 'floor_1',
        floorTitle: 'GROUND FLOOR',
        milestones: getInitialFloorStages('GROUND FLOOR')
      }
    ]);
    setClientName('');
    setClientPhone('');
    setClientPassword('');
    setClientEmail('');
    setCoverImage('');
    setGalleryImages([]);
    setSiteNotes('');
    setCreatedSiteResult(null);
  };

  // Currency Formatter Helper
  const formatINR = (val) => {
    const num = parseFloat(val) || 0;
    return num.toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0
    });
  };

  return (
    <div className="new-site-module">
      {/* Header Banner */}
      <div className="new-site-header">
        <div>
          <div className="new-site-title-row">
            <div className="new-site-badge-icon">
              <Sparkles size={24} />
            </div>
            <div>
              <h1 className="new-site-title">New Site Registration Wizard</h1>
              <p className="new-site-subtitle">
                Register a construction site, configure budget & expense estimates, define payment breakup, and provision client portal credentials.
              </p>
            </div>
          </div>
        </div>

        <div className="new-site-header-actions">
          <button
            className="btn btn-outline"
            onClick={() => setActiveTab('create_site')}
          >
            <Building2 size={16} />
            <span>View All Sites</span>
          </button>
        </div>
      </div>

      {/* 4-STEP PROGRESS INDICATOR */}
      <div className="wizard-stepper-card">
        <div className="wizard-stepper-container">
          {/* Step 1 */}
          <div
            className={`wizard-step-item ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}
            onClick={() => setCurrentStep(1)}
          >
            <div className="step-circle">
              {currentStep > 1 ? <Check size={18} /> : <span>1</span>}
            </div>
            <div className="step-info">
              <span className="step-name">Project & Budget Table</span>
            </div>
          </div>

          <div className={`step-connector ${currentStep > 1 ? 'completed' : ''}`} />

          {/* Step 2 */}
          <div
            className={`wizard-step-item ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}
            onClick={() => {
              if (validateStep1()) setCurrentStep(2);
            }}
          >
            <div className="step-circle">
              {currentStep > 2 ? <Check size={18} /> : <span>2</span>}
            </div>
            <div className="step-info">
              <span className="step-name">Payment Breakup</span>
            </div>
          </div>

          <div className={`step-connector ${currentStep > 2 ? 'completed' : ''}`} />

          {/* Step 3 */}
          <div
            className={`wizard-step-item ${currentStep === 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}
            onClick={() => {
              if (validateStep1() && validateStep2()) setCurrentStep(3);
            }}
          >
            <div className="step-circle">
              {currentStep > 3 ? <Check size={18} /> : <span>3</span>}
            </div>
            <div className="step-info">
              <span className="step-name">Client Login Register</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          STEP 1: PROJECT DETAILS & BUDGET / EXPENSE TABLE
         ======================================================== */}
      {currentStep === 1 && (
        <div className="wizard-step-card animate-fade-in">
          <div className="step-card-header">
            <div className="step-header-left">
              <h2>Project Information & Budget Estimation Form</h2>
              <p>Enter the basic project credentials and specify the itemized budget & expense table below.</p>
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
                  className={`styled-input ${errors.siteName ? 'has-error' : ''}`}
                  placeholder="e.g. Modern Minimalist Villa - Perundurai"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                />
              </div>
              {errors.siteName && (
                <span className="error-hint"><AlertCircle size={14} /> {errors.siteName}</span>
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
                  className={`styled-input ${errors.location ? 'has-error' : ''}`}
                  placeholder="e.g. Perundurai Road, Near Golden City, Erode"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              {errors.location && (
                <span className="error-hint"><AlertCircle size={14} /> {errors.location}</span>
              )}
            </div>

            <div className="form-group">
              <label className="input-label">Project / Structure Type</label>
              <select
                className="styled-select"
                value={structureType}
                onChange={(e) => setStructureType(e.target.value)}
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
                  value={supervisor}
                  onChange={(e) => setSupervisor(e.target.value)}
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
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
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
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="input-label">Built-up Area (sq. ft.)</label>
              <input
                type="number"
                className="styled-input"
                placeholder="e.g. 3200"
                value={builtupArea}
                onChange={(e) => setBuiltupArea(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="input-label">Number of Floors</label>
              <select
                className="styled-select"
                value={floors}
                onChange={(e) => setFloors(e.target.value)}
              >
                {FLOOR_OPTIONS.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>



          {/* TABLE INPUT FORM (REFERENCE IMAGE) */}
          <div className="budget-table-section">
            <div className="budget-table-header-row">
              <div>
                <h3 className="section-title">
                  <Calculator size={20} className="title-icon" />
                  Budget & Expense Estimation Table
                </h3>
                <p className="section-desc">
                  Input estimated and expense amounts for each work category. Balance is automatically calculated (<strong>Balance = Estimated Amount - Expense Amount</strong>). Leave blank to fill later.
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
                    <th className="th-sno">S.No</th>
                    <th className="th-desc">Description</th>
                    <th className="th-amount">Estimated Amount (₹)</th>
                    <th className="th-amount">Expense Amount (₹)</th>
                    <th className="th-balance">Balance (₹)</th>
                    <th className="th-action">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetRows.map((row, index) => {
                    const est = parseFloat(row.estimated_amount) || 0;
                    const exp = parseFloat(row.expense_amount) || 0;
                    const bal = est - exp;
                    const hasValues = row.estimated_amount !== '' || row.expense_amount !== '';

                    return (
                      <tr key={index} className="spreadsheet-row">
                        <td className="td-sno">{row.sno}</td>
                        <td className="td-desc">
                          <input
                            type="text"
                            className="table-cell-input desc-input"
                            value={row.description}
                            placeholder="Enter work category..."
                            onChange={(e) => handleBudgetChange(index, 'description', e.target.value)}
                          />
                        </td>
                        <td className="td-amount">
                          <div className="amount-input-box">
                            <span className="currency-symbol">₹</span>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              className="table-cell-input amount-input"
                              placeholder="0"
                              value={row.estimated_amount}
                              onChange={(e) => handleBudgetChange(index, 'estimated_amount', e.target.value)}
                            />
                          </div>
                        </td>
                        <td className="td-amount">
                          <div className="amount-input-box">
                            <span className="currency-symbol">₹</span>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              className="table-cell-input amount-input"
                              placeholder="0"
                              value={row.expense_amount}
                              onChange={(e) => handleBudgetChange(index, 'expense_amount', e.target.value)}
                            />
                          </div>
                        </td>
                        <td className={`td-balance ${bal < 0 ? 'negative' : ''} ${hasValues && bal >= 0 ? 'positive' : ''}`}>
                          <div className="balance-display">
                            <span className="balance-currency">₹</span>
                            <span className="balance-val">
                              {hasValues ? formatINR(bal) : '0'}
                            </span>
                          </div>
                        </td>
                        <td className="td-action">
                          <button
                            type="button"
                            className="btn-row-delete"
                            title="Remove row"
                            onClick={() => handleRemoveBudgetRow(index)}
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
                    <td colSpan={2} className="total-label-cell">
                      TOTAL
                    </td>
                    <td className="total-amount-cell">
                      <div className="total-val-wrapper">
                        <span>₹</span>
                        <span>{formatINR(budgetTotals.totalEstimated)}</span>
                      </div>
                    </td>
                    <td className="total-amount-cell">
                      <div className="total-val-wrapper">
                        <span>₹</span>
                        <span>{formatINR(budgetTotals.totalExpense)}</span>
                      </div>
                    </td>
                    <td className={`total-balance-cell ${budgetTotals.totalBalance < 0 ? 'negative' : ''}`}>
                      <div className="total-val-wrapper">
                        <span>₹</span>
                        <span>{formatINR(budgetTotals.totalBalance)}</span>
                      </div>
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Table Bottom Highlights */}
            <div className="budget-metrics-strip">
              <div className="budget-metric-pill">
                <span className="pill-lbl">Total Estimated:</span>
                <span className="pill-val">₹{formatINR(budgetTotals.totalEstimated)}</span>
              </div>
              <div className="budget-metric-pill">
                <span className="pill-lbl">Total Expenses:</span>
                <span className="pill-val">₹{formatINR(budgetTotals.totalExpense)}</span>
              </div>
              <div className={`budget-metric-pill ${budgetTotals.totalBalance < 0 ? 'pill-alert' : 'pill-success'}`}>
                <span className="pill-lbl">Net Balance:</span>
                <span className="pill-val">₹{formatINR(budgetTotals.totalBalance)}</span>
              </div>
            </div>
          </div>

          {/* Step 1 Actions */}
          <div className="wizard-card-footer">
            <div></div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={goToNextStep}
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
      {currentStep === 2 && (
        <div className="wizard-step-card animate-fade-in">
          <div className="step-card-header">
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
                  value={effectiveFloorFilter}
                  onChange={(e) => setSelectedFloorFilter(e.target.value)}
                >
                  <option value="ALL">All Floors ({floorSections.length})</option>
                  {floorSections.map((fl, idx) => (
                    <option key={fl.id || idx} value={String(idx)}>
                      Section #{idx + 1} - {fl.floorTitle || `FLOOR ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="floor-filter-right">
              {effectiveFloorFilter !== 'ALL' ? (
                <div className="floor-filter-active-pill">
                  <span>
                    Showing <strong>Section #{parseInt(effectiveFloorFilter, 10) + 1}</strong> (1 of {floorSections.length} floors)
                  </span>
                  <button
                    type="button"
                    className="btn-link-reset-filter"
                    onClick={() => setSelectedFloorFilter('ALL')}
                  >
                    View All Floors
                  </button>
                </div>
              ) : (
                <span className="floor-filter-count-badge">
                  Showing all {floorSections.length} floors
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
            {floorSections.map((floor, floorIndex) => {
              if (effectiveFloorFilter !== 'ALL' && effectiveFloorFilter !== String(floorIndex)) {
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
                      {paymentTotals.totalAmount > 0 && floorSubtotal > 0 && (
                        <span className="floor-subtotal-pct">
                          ({((floorSubtotal / paymentTotals.totalAmount) * 100).toFixed(1)}% of total)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="breakup-config-row">
                    <div className="form-group flex-1">
                      <label className="input-label required">Floor / Section Title</label>
                      <input
                        type="text"
                        className={`styled-input ${errors[`floorTitle_${floorIndex}`] ? 'has-error' : ''}`}
                        placeholder="e.g. GROUND FLOOR or FIRST FLOOR"
                        value={floor.floorTitle}
                        onChange={(e) => handleFloorTitleChange(floorIndex, e.target.value)}
                      />
                      {errors[`floorTitle_${floorIndex}`] && (
                        <span className="error-hint" style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '4px' }}>
                          {errors[`floorTitle_${floorIndex}`]}
                        </span>
                      )}
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

                      {floorSections.length > 1 && (
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

                  {/* Stages Table for this floor */}
                  <div className="table-responsive-container">
                    <table className="spreadsheet-table">
                      <thead>
                        <tr>
                          <th className="th-sno">S.No</th>
                          <th className="th-stage">Stage / Milestone Description</th>
                          <th className="th-amount">Milestone Amount (₹)</th>
                          <th className="th-schedule">Work Schedule / Target</th>
                          <th className="th-action">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(floor.milestones || []).map((m, idx) => {
                          return (
                            <tr key={idx} className="spreadsheet-row">
                              <td className="td-sno">{m.sno || idx + 1}</td>
                              <td className="td-stage">
                                <input
                                  type="text"
                                  className="table-cell-input stage-input"
                                  value={m.stage_name}
                                  placeholder="Milestone title..."
                                  onChange={(e) => handleMilestoneChange(floorIndex, idx, 'stage_name', e.target.value)}
                                />
                              </td>
                              <td className="td-amount">
                                <div className="amount-input-box">
                                  <span className="currency-symbol">₹</span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    className="table-cell-input amount-input"
                                    placeholder="0"
                                    value={m.amount}
                                    onChange={(e) => handleMilestoneChange(floorIndex, idx, 'amount', e.target.value)}
                                  />
                                </div>
                              </td>
                              <td className="td-schedule">
                                <input
                                  type="text"
                                  className="table-cell-input schedule-input"
                                  value={m.work_schedule}
                                  placeholder="Enter month (e.g. Month 1)..."
                                  onChange={(e) => handleMilestoneChange(floorIndex, idx, 'work_schedule', e.target.value)}
                                />
                              </td>
                              <td className="td-action">
                                <button
                                  type="button"
                                  className="btn-row-delete"
                                  title="Remove milestone"
                                  onClick={() => handleRemoveMilestone(floorIndex, idx)}
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
                            SUBTOTAL: {floor.floorTitle || `FLOOR #${floorIndex + 1}`}
                          </td>
                          <td className="total-amount-cell">
                            <div className="total-val-wrapper">
                              <span>₹</span>
                              <span>{formatINR(floorSubtotal)}</span>
                            </div>
                          </td>
                          <td></td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              );
            })}

            {/* Prominent Add Another Floor Button */}
            <button
              type="button"
              className="btn-add-floor-large"
              onClick={handleAddFloor}
            >
              <Plus size={18} />
              <span>
                + Add Floor / Section (e.g.{' '}
                {floorSections.length < DEFAULT_FLOOR_NAMES.length
                  ? DEFAULT_FLOOR_NAMES[floorSections.length]
                  : `Floor ${floorSections.length + 1}`}
                )
              </span>
            </button>

            {/* Overall All-Floors Summary Card */}
            <div className="all-floors-summary-card">
              <div className="floors-summary-col">
                <span className="summary-title">Configured Floors</span>
                <span className="summary-val">
                  {floorSections.length} {floorSections.length === 1 ? 'Floor' : 'Floors'}
                </span>
              </div>
              <div className="floors-summary-col">
                <span className="summary-title">Total Milestones</span>
                <span className="summary-val">{paymentTotals.totalStagesCount} Defined Stages</span>
              </div>
              <div className="floors-summary-col highlight">
                <span className="summary-title">Grand Total All Floors</span>
                <span className="summary-val grand-val">₹{formatINR(paymentTotals.totalAmount)}</span>
              </div>
            </div>

            {/* Sync Notification Banner */}
            {budgetTotals.totalEstimated > 0 && (
              <div className="comparison-banner">
                <div className="comparison-left">
                  <DollarSign size={18} className="banner-icon" />
                  <div>
                    <strong>Step 1 Budget Reference:</strong> ₹{formatINR(budgetTotals.totalEstimated)} Total Estimated
                  </div>
                </div>
                <div className="comparison-right">
                  {Math.abs(paymentTotals.totalAmount - budgetTotals.totalEstimated) < 1 ? (
                    <span className="badge-match">
                      <CheckCircle2 size={14} /> Milestones Match Project Budget
                    </span>
                  ) : (
                    <span className="badge-diff">
                      Difference: ₹{formatINR(Math.abs(budgetTotals.totalEstimated - paymentTotals.totalAmount))}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Step 2 Actions */}
          <div className="wizard-card-footer">
            <button
              type="button"
              className="btn btn-outline"
              onClick={goToPrevStep}
            >
              <ArrowLeft size={18} />
              <span>Previous: Project Info</span>
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={goToNextStep}
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
      {currentStep === 3 && (
        <div className="wizard-step-card animate-fade-in">
          <div className="step-card-header">
            <div className="step-header-left">
              <h2>Client Portal Account Registration</h2>
              <p>Register the client credentials. Only clients registered with their phone number and password will be authorized to log in to the Client Portal mobile app and web dashboard.</p>
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
                    className={`styled-input ${errors.clientName ? 'has-error' : ''}`}
                    placeholder="e.g. Ramesh Sundaram"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>
                {errors.clientName && (
                  <span className="error-hint"><AlertCircle size={14} /> {errors.clientName}</span>
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
                    className={`styled-input ${errors.clientPhone ? 'has-error' : ''}`}
                    placeholder="e.g. 9842188321 (10 digits)"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                {errors.clientPhone ? (
                  <span className="error-hint"><AlertCircle size={14} /> {errors.clientPhone}</span>
                ) : (
                  <span className="field-note">The client will log in using this 10-digit mobile number.</span>
                )}
              </div>

              {/* Client Password */}
              <div className="form-group">
                <div className="label-with-action">
                  <label className="input-label required">
                    Client Login Password <span className="req-star">*</span>
                  </label>
                  <button
                    type="button"
                    className="btn-link-action"
                    onClick={generateRandomPassword}
                  >
                    <Sparkles size={13} />
                    <span>Auto-generate Password</span>
                  </button>
                </div>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`styled-input ${errors.clientPassword ? 'has-error' : ''}`}
                    placeholder="Enter or generate client password (min. 6 characters)"
                    value={clientPassword}
                    onChange={(e) => setClientPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.clientPassword && (
                  <span className="error-hint"><AlertCircle size={14} /> {errors.clientPassword}</span>
                )}
              </div>

              {/* Client Email */}
              <div className="form-group">
                <label className="input-label">Client Email Address (Optional)</label>
                <input
                  type="email"
                  className="styled-input"
                  placeholder="e.g. ramesh.s@gmail.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
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
                {clientName || 'Client Full Name'}
              </h3>
              <p className="preview-project-name">
                Site: {siteName || 'Project Name'}
              </p>

              <div className="credentials-grid">
                <div className="cred-row">
                  <span className="cred-lbl">Login Phone:</span>
                  <span className="cred-val highlight">{clientPhone || 'Not entered yet'}</span>
                </div>
                <div className="cred-row">
                  <span className="cred-lbl">Password:</span>
                  <span className="cred-val highlight">
                    {clientPassword ? (showPassword ? clientPassword : '••••••••') : 'Not entered yet'}
                  </span>
                </div>
                <div className="cred-row">
                  <span className="cred-lbl">Site Location:</span>
                  <span className="cred-val">{location || 'Site Location'}</span>
                </div>
              </div>

              <div className="cred-security-box">
                <ShieldCheck size={16} className="sec-icon" />
                <span>
                  Once registered, only this Phone Number & Password combination will grant access to this site in the Yeloline Client App.
                </span>
              </div>
            </div>
          </div>

          {/* Step 3 Actions */}
          <div className="wizard-card-footer">
            <button
              type="button"
              className="btn btn-outline"
              onClick={goToPrevStep}
              disabled={isSubmitting}
            >
              <ArrowLeft size={18} />
              <span>Previous: Payment Breakup</span>
            </button>
            <button
              type="button"
              className="btn btn-primary btn-submit-lg"
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border" />
                  <span>Registering Site & Credentials...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Register & Activate New Site</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          SUCCESS REGISTRATION MODAL
         ======================================================== */}
      {createdSiteResult && (
        <Modal
          isOpen={true}
          onClose={() => setCreatedSiteResult(null)}
          title="Site & Client Account Created Successfully!"
          maxWidth="640px"
        >
          <div className="success-modal-body">
            <div className="success-celebration-icon">
              <CheckCircle2 size={48} />
            </div>

            <h3 className="success-title">{createdSiteResult.site_name}</h3>
            <p className="success-subtitle">
              Site ID: <strong>{createdSiteResult.site_id}</strong> • Location: <strong>{createdSiteResult.location}</strong>
            </p>

            <div className="success-credentials-box">
              <div className="success-credentials-header">
                <ShieldCheck size={18} />
                <span>Client Portal Login Credentials</span>
              </div>
              <div className="cred-display-item">
                <span className="item-label">Client Name:</span>
                <span className="item-value">{createdSiteResult.client_name}</span>
              </div>
              <div className="cred-display-item">
                <span className="item-label">Registered Mobile Number:</span>
                <span className="item-value highlight">{createdSiteResult.client_phone}</span>
              </div>
              <div className="cred-display-item">
                <span className="item-label">Client Password:</span>
                <span className="item-value highlight">{createdSiteResult.client_password}</span>
              </div>

              <div className="credentials-action-buttons">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handleCopyCredentials}
                >
                  {copiedSuccess ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copiedSuccess ? 'Copied to Clipboard!' : 'Copy Credentials'}</span>
                </button>

                <button
                  type="button"
                  className="btn btn-whatsapp btn-sm"
                  onClick={handleShareWhatsApp}
                >
                  <MessageCircle size={16} />
                  <span>Share via WhatsApp</span>
                </button>
              </div>
            </div>

            <div className="success-modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleResetForm}
              >
                <Plus size={16} />
                <span>Register Another Site</span>
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setCreatedSiteResult(null);
                  setActiveTab('create_site');
                }}
              >
                <Building2 size={16} />
                <span>Go to All Sites</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
