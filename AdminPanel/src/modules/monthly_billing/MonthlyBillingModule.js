import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CalendarDays,
  Plus,
  Save,
  Trash2,
  FileSpreadsheet,
  FileText,
  Printer,
  CheckCircle2,
  Building,
  TrendingUp,
  DollarSign,
  Calculator,
  RotateCcw,
  Search
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import MetricCard from '../../components/common/MetricCard/MetricCard';
import Modal from '../../components/common/Modal/Modal';
import './MonthlyBillingModule.css';

export default function MonthlyBillingModule() {
  const {
    sites = [],
    monthlyBillings = [],
    paymentBreakups = [],
    expenses = [],
    payments = [],
    saveMonthlyBilling,
    DEFAULT_MONTHLY_BILLING_AREAS = [],
    DEFAULT_MONTHLY_BILLING_AMENITIES = [],
    exportToXLS,
    exportToPDF
  } = useApp();

  // 1. Resolve all available registered sites across collections
  const allAvailableSites = useMemo(() => {
    const siteMap = new Map();

    // From sites collection
    (sites || []).forEach(s => {
      const name = (s.site_name || s.name || s.title || '').trim();
      if (name) {
        siteMap.set(name.toLowerCase(), {
          id: s.id || s.site_id || name,
          site_name: name,
          client_name: s.client_name || s.customer_name || s.client || '',
          client_phone: s.phone || s.mobile || '',
          location: s.location || s.city || s.site_location || '',
          status: s.status || 'Active',
          raw: s
        });
      }
    });

    // From monthlyBillings
    (monthlyBillings || []).forEach(m => {
      const name = (m.site_name || '').trim();
      if (name && !siteMap.has(name.toLowerCase())) {
        siteMap.set(name.toLowerCase(), {
          id: m.id || name,
          site_name: name,
          client_name: m.client_name || m.client_title || '',
          client_phone: '',
          location: m.client_location || '',
          status: 'Active',
          raw: m
        });
      }
    });

    // From paymentBreakups
    (paymentBreakups || []).forEach(p => {
      const name = (p.site_name || '').trim();
      if (name && !siteMap.has(name.toLowerCase())) {
        siteMap.set(name.toLowerCase(), {
          id: p.id || name,
          site_name: name,
          client_name: p.client_name || '',
          client_phone: '',
          location: '',
          status: 'Active',
          raw: p
        });
      }
    });

    return Array.from(siteMap.values());
  }, [sites, monthlyBillings, paymentBreakups]);

  const siteList = useMemo(() => {
    return allAvailableSites.map(s => s.site_name);
  }, [allAvailableSites]);

  const [selectedSite, setSelectedSite] = useState(() => siteList[0] || '');
  const [siteSearchQuery, setSiteSearchQuery] = useState('');

  useEffect(() => {
    if (siteList.length > 0 && (!selectedSite || !siteList.includes(selectedSite))) {
      setSelectedSite(siteList[0]);
    }
  }, [siteList, selectedSite]);

  // Filtered sites for search query
  const filteredSitesList = useMemo(() => {
    if (!siteSearchQuery.trim()) return allAvailableSites;
    const q = siteSearchQuery.toLowerCase();
    return allAvailableSites.filter(s =>
      s.site_name.toLowerCase().includes(q) ||
      (s.client_name && s.client_name.toLowerCase().includes(q)) ||
      (s.location && s.location.toLowerCase().includes(q))
    );
  }, [allAvailableSites, siteSearchQuery]);

  // Billing status & overview mapping for each registered site
  const siteBillingMap = useMemo(() => {
    const map = {};
    allAvailableSites.forEach(s => {
      const sName = s.site_name.trim().toLowerCase();
      const existing = (monthlyBillings || []).find(b => {
        const bName = (b.site_name || '').trim().toLowerCase();
        const bId = (b.id || b.bill_id || '').trim().toLowerCase();
        return bName === sName || bId === sName;
      });
      if (existing) {
        map[s.site_name] = {
          hasBill: true,
          grossTotal: Number(existing.gross_total || 0),
          balance: Number(existing.net_balance !== undefined && existing.net_balance !== '' ? existing.net_balance : (existing.balance_amount || 0)),
          billDate: existing.bill_date || '',
          billId: existing.bill_id || existing.id || '',
          updatedAt: existing.updated_at || ''
        };
      } else {
        map[s.site_name] = {
          hasBill: false,
          grossTotal: 0,
          balance: 0,
          billDate: '',
          billId: '',
          updatedAt: ''
        };
      }
    });
    return map;
  }, [allAvailableSites, monthlyBillings]);

  // Header meta information matching document
  const [clientTitle, setClientTitle] = useState('');
  const [clientLocation, setClientLocation] = useState('');
  const [statementSubtitle, setStatementSubtitle] = useState('மதிப்பீடு');
  const [billDate, setBillDate] = useState('');
  const [settlementDate, setSettlementDate] = useState('');

  // Table 1: Area Valuation Rows (Default descriptions match exact document template)
  const [areaItems, setAreaItems] = useState([]);

  // Table 2: Amenities / Additional Items Rows (Default descriptions match exact document template)
  const [amenityItems, setAmenityItems] = useState([]);

  // Financial reconciliation fields
  const [additionalWorkBill, setAdditionalWorkBill] = useState('');
  const [receivedAdditional, setReceivedAdditional] = useState('');
  const [receivedQuoted, setReceivedQuoted] = useState('');
  const [netBalanceManual, setNetBalanceManual] = useState('');

  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Exact Default Template Loaders (Descriptions present, numerical data empty for manual entry)
  const getInitialAreaItems = useCallback(() => {
    if (DEFAULT_MONTHLY_BILLING_AREAS && DEFAULT_MONTHLY_BILLING_AREAS.length > 0) {
      return DEFAULT_MONTHLY_BILLING_AREAS.map(item => ({ ...item }));
    }
    return [
      { sno: 1, description: 'தரைத்தளம்', area_sqft: '', rate_per_sqft: '', amount: 0 },
      { sno: 2, description: 'படிக்கட்டு ஏரியா', area_sqft: '', rate_per_sqft: '', amount: 0 },
      { sno: 3, description: 'போர்டிகோ ஏரியா', area_sqft: '', rate_per_sqft: '', amount: 0 },
      { sno: 4, description: 'போர்டிகோ ஏரியா (Extended) (30\'3" x 9\'3")', area_sqft: '', rate_per_sqft: '', amount: 0 }
    ];
  }, [DEFAULT_MONTHLY_BILLING_AREAS]);

  const getInitialAmenityItems = useCallback(() => {
    if (DEFAULT_MONTHLY_BILLING_AMENITIES && DEFAULT_MONTHLY_BILLING_AMENITIES.length > 0) {
      return DEFAULT_MONTHLY_BILLING_AMENITIES.map(item => ({ ...item }));
    }
    return [
      { sno: 5, description: 'நிலத்தொட்டி (5000 லிட்டர்)', amount: '' },
      { sno: 6, description: 'செப்டிக் டேங்க் (3000 லிட்டர்)', amount: '' },
      { sno: 7, description: 'Sintex tank (1500 லிட்டர்)', amount: '' }
    ];
  }, [DEFAULT_MONTHLY_BILLING_AMENITIES]);

  // Load existing billing for selected site or populate default template
  useEffect(() => {
    if (!selectedSite) return;
    const siteObj = allAvailableSites.find(
      s => s.site_name.toLowerCase() === selectedSite.toLowerCase()
    );

    const existing = monthlyBillings.find(b => {
      const bName = (b.site_name || '').trim().toLowerCase();
      const bId = (b.id || b.bill_id || '').trim().toLowerCase();
      const sName = selectedSite.trim().toLowerCase();
      return bName === sName || bId === sName;
    });

    if (existing) {
      setClientTitle(existing.client_title || (siteObj?.client_name ? `திரு. ${siteObj.client_name} இல்லம்` : ''));
      setClientLocation(existing.client_location || siteObj?.location || '');
      setStatementSubtitle(existing.statement_subtitle || 'மதிப்பீடு');
      setBillDate(existing.bill_date || '');
      setSettlementDate(existing.settlement_date || '');
      if (Array.isArray(existing.area_items) && existing.area_items.length > 0) {
        setAreaItems(existing.area_items);
      } else {
        setAreaItems(getInitialAreaItems());
      }
      if (Array.isArray(existing.amenity_items) && existing.amenity_items.length > 0) {
        setAmenityItems(existing.amenity_items);
      } else {
        setAmenityItems(getInitialAmenityItems());
      }
      setAdditionalWorkBill(existing.additional_work_bill !== undefined && existing.additional_work_bill !== null ? existing.additional_work_bill : '');
      setReceivedAdditional(existing.received_additional !== undefined && existing.received_additional !== null ? existing.received_additional : '');
      setReceivedQuoted(existing.received_quoted !== undefined && existing.received_quoted !== null ? existing.received_quoted : '');
      setNetBalanceManual(existing.net_balance !== undefined && existing.net_balance !== null ? existing.net_balance : '');
    } else {
      setClientTitle(siteObj?.client_name ? `திரு. ${siteObj.client_name} இல்லம்` : '');
      setClientLocation(siteObj?.location || '');
      setStatementSubtitle('மதிப்பீடு');
      setBillDate('');
      setSettlementDate('');
      setAreaItems(getInitialAreaItems());
      setAmenityItems(getInitialAmenityItems());
      setAdditionalWorkBill('');
      setReceivedAdditional('');
      setReceivedQuoted('');
      setNetBalanceManual('');
    }
  }, [selectedSite, monthlyBillings, allAvailableSites, getInitialAreaItems, getInitialAmenityItems]);

  // Calculations
  const totalBuiltupArea = useMemo(() => {
    return areaItems.reduce((acc, curr) => acc + (parseFloat(curr.area_sqft) || 0), 0);
  }, [areaItems]);

  const totalBuiltupCost = useMemo(() => {
    return areaItems.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  }, [areaItems]);

  const averageBuiltupRate = useMemo(() => {
    if (totalBuiltupArea === 0) return 0;
    return Math.round(totalBuiltupCost / totalBuiltupArea);
  }, [totalBuiltupCost, totalBuiltupArea]);

  const totalAmenitiesCost = useMemo(() => {
    return amenityItems.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  }, [amenityItems]);

  const mainStructureTotal = useMemo(() => {
    return totalBuiltupCost + totalAmenitiesCost;
  }, [totalBuiltupCost, totalAmenitiesCost]);

  const grossTotalAmount = useMemo(() => {
    return mainStructureTotal + (parseFloat(additionalWorkBill) || 0);
  }, [mainStructureTotal, additionalWorkBill]);

  // Live Site Expenses logged from Admin App (Firestore 'expenses' collection)
  const siteExpensesTotal = useMemo(() => {
    if (!selectedSite || !expenses || expenses.length === 0) return 0;
    const sName = selectedSite.toLowerCase().trim();
    return expenses
      .filter(e => {
        const eSite = String(e.site_name || e.site_id || '').toLowerCase().trim();
        return eSite === sName || eSite.includes(sName) || sName.includes(eSite);
      })
      .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  }, [selectedSite, expenses]);

  // Live Payments logged from Admin App (Firestore 'payments' collection)
  const sitePaymentsTotal = useMemo(() => {
    if (!selectedSite || !payments || payments.length === 0) return 0;
    const sName = selectedSite.toLowerCase().trim();
    return payments
      .filter(p => {
        const pSite = String(p.site_name || p.project_name || p.site_id || '').toLowerCase().trim();
        return pSite === sName || pSite.includes(sName) || sName.includes(pSite);
      })
      .reduce((sum, p) => sum + (parseFloat(p.amount_received || p.amount) || 0), 0);
  }, [selectedSite, payments]);

  const totalReceivedCombined = useMemo(() => {
    const additional = parseFloat(receivedAdditional) || 0;
    const quoted = parseFloat(receivedQuoted) || 0;
    // Reflect expenses added from Admin App directly into total received amount
    return additional + quoted + siteExpensesTotal;
  }, [receivedAdditional, receivedQuoted, siteExpensesTotal]);

  const balanceAmount = useMemo(() => {
    return grossTotalAmount - totalReceivedCombined;
  }, [grossTotalAmount, totalReceivedCombined]);

  // Handle Area Rows Changes
  const handleAreaChange = (index, field, value) => {
    setAreaItems(prev => {
      const next = [...prev];
      const updated = { ...next[index], [field]: value };
      if (field === 'area_sqft' || field === 'rate_per_sqft') {
        const areaVal = field === 'area_sqft' ? value : updated.area_sqft;
        const rateVal = field === 'rate_per_sqft' ? value : updated.rate_per_sqft;
        const area = parseFloat(areaVal);
        const rate = parseFloat(rateVal);
        if (!isNaN(area) && !isNaN(rate) && areaVal !== '' && rateVal !== '') {
          updated.amount = Math.round(area * rate);
        } else {
          updated.amount = 0;
        }
      }
      next[index] = updated;
      return next;
    });
  };

  const handleAddAreaRow = () => {
    setAreaItems(prev => [
      ...prev,
      {
        sno: prev.length + 1,
        description: '',
        area_sqft: '',
        rate_per_sqft: '',
        amount: 0
      }
    ]);
  };

  const handleDeleteAreaRow = (index) => {
    if (areaItems.length <= 1) {
      alert("At least one area valuation item is required.");
      return;
    }
    setAreaItems(prev => {
      const next = prev.filter((_, i) => i !== index);
      return next.map((it, i) => ({ ...it, sno: i + 1 }));
    });
  };

  // Handle Amenity Rows Changes
  const handleAmenityChange = (index, field, value) => {
    setAmenityItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAddAmenityRow = () => {
    setAmenityItems(prev => [
      ...prev,
      {
        sno: areaItems.length + prev.length + 1,
        description: '',
        amount: ''
      }
    ]);
  };

  const handleDeleteAmenityRow = (index) => {
    setAmenityItems(prev => prev.filter((_, i) => i !== index));
  };

  // Reset to Document Template
  const handleResetToTemplate = () => {
    if (window.confirm("Reset rows to the exact document template descriptions? Any custom added rows will be reset.")) {
      setAreaItems(getInitialAreaItems());
      setAmenityItems(getInitialAmenityItems());
      setAdditionalWorkBill('');
      setReceivedAdditional('');
      setReceivedQuoted('');
      setNetBalanceManual('');
    }
  };

  // Format currency in Indian standard
  const formatCurrency = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return '0.00';
    return num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Save to Firebase & Context
  const handleSaveBilling = async () => {
    setIsSaving(true);
    try {
      const payload = {
        id: selectedSite,
        bill_id: `MONTHLY-${selectedSite.replace(/\s+/g, '-').toUpperCase()}`,
        site_name: selectedSite,
        client_title: clientTitle,
        client_location: clientLocation,
        statement_subtitle: statementSubtitle,
        bill_date: billDate,
        settlement_date: settlementDate,
        area_items: areaItems,
        amenity_items: amenityItems,
        total_builtup_area: totalBuiltupArea,
        total_builtup_cost: totalBuiltupCost,
        average_builtup_rate: averageBuiltupRate,
        main_structure_total: mainStructureTotal,
        additional_work_bill: parseFloat(additionalWorkBill) || 0,
        gross_total: grossTotalAmount,
        received_additional: parseFloat(receivedAdditional) || 0,
        received_quoted: parseFloat(receivedQuoted) || 0,
        site_expenses_total: siteExpensesTotal,
        total_received: totalReceivedCombined,
        balance_amount: balanceAmount,
        net_balance: parseFloat(netBalanceManual) || (netBalanceManual === '' ? balanceAmount : 0)
      };

      await saveMonthlyBilling(payload);
      setSaveSuccessMsg(`Monthly billing statement for "${selectedSite}" saved successfully!`);
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      alert("Error saving monthly billing statement.");
    } finally {
      setIsSaving(false);
    }
  };

  // Export to XLS
  const handleExportXLS = () => {
    const exportRows = [];

    // Header section
    if (clientTitle) exportRows.push({ SNo: '', Description: clientTitle, Area: '', Rate: '', Amount: '' });
    if (clientLocation) exportRows.push({ SNo: '', Description: clientLocation, Area: '', Rate: '', Amount: '' });
    exportRows.push({ SNo: '', Description: statementSubtitle || 'மதிப்பீடு', Area: '', Rate: '', Amount: '' });
    exportRows.push({ SNo: 'வ.எண்', Description: 'விவரங்கள்', Area: 'பரப்பளவு (சதுர அடி)', Rate: 'விலை (சதுர அடி)', Amount: 'தொகை' });

    // Area items
    areaItems.forEach(item => {
      exportRows.push({
        SNo: item.sno,
        Description: item.description,
        Area: item.area_sqft !== '' ? `${item.area_sqft} Sft.` : '',
        Rate: item.rate_per_sqft !== '' ? `₹ ${item.rate_per_sqft}` : '',
        Amount: item.amount > 0 ? item.amount : ''
      });
    });

    // Subtotal
    exportRows.push({
      SNo: '',
      Description: 'கட்டிட பரப்பளவு',
      Area: totalBuiltupArea > 0 ? `${totalBuiltupArea} Sft.` : '',
      Rate: averageBuiltupRate > 0 ? `₹ ${averageBuiltupRate}/Sft.` : '',
      Amount: totalBuiltupCost
    });

    // Amenities
    amenityItems.forEach((item, idx) => {
      exportRows.push({
        SNo: item.sno || areaItems.length + idx + 1,
        Description: item.description,
        Area: '',
        Rate: '',
        Amount: item.amount !== '' ? item.amount : ''
      });
    });

    // Main Structure Total
    exportRows.push({
      SNo: '',
      Description: 'மொத்தம்',
      Area: '',
      Rate: '',
      Amount: mainStructureTotal
    });

    // Additional Work Bill
    exportRows.push({
      SNo: '',
      Description: 'Additional Work Bill',
      Area: '',
      Rate: '',
      Amount: additionalWorkBill !== '' ? additionalWorkBill : 0
    });

    // Gross Total
    exportRows.push({
      SNo: '',
      Description: `மொத்த தொகை ${billDate ? `(${billDate})` : ''}`,
      Area: '',
      Rate: '',
      Amount: grossTotalAmount
    });

    // Settlement
    exportRows.push({ SNo: '', Description: 'TOTAL RECEIVED AMOUNT (in Additional)', Area: '', Rate: '', Amount: receivedAdditional !== '' ? receivedAdditional : '-' });
    exportRows.push({ SNo: '', Description: 'TOTAL RECEIVED AMOUNT (in Quoted)', Area: '', Rate: '', Amount: receivedQuoted !== '' ? receivedQuoted : 0 });
    if (siteExpensesTotal > 0) {
      exportRows.push({ SNo: '', Description: 'EXPENSES ADDED (Admin App / Site Live)', Area: '', Rate: '', Amount: siteExpensesTotal });
    }
    exportRows.push({ SNo: '', Description: `AS PER STAGE AMOUNT INCLD. ADDITIONAL WORK BILL (To Pay from client) ${settlementDate ? `AS ON ${settlementDate}` : ''}`, Area: '', Rate: '', Amount: grossTotalAmount });
    exportRows.push({ SNo: '', Description: `BALANCE AMOUNT ${settlementDate ? `AS ON ${settlementDate}` : ''}`, Area: '', Rate: '', Amount: balanceAmount });
    exportRows.push({ SNo: '', Description: `NET BALANCE AMOUNT ${settlementDate ? `AS ON ${settlementDate}` : ''}`, Area: '', Rate: '', Amount: netBalanceManual !== '' ? netBalanceManual : balanceAmount });

    const filename = `Yeloline_Monthly_Billing_${selectedSite.replace(/\s+/g, '_')}`;
    exportToXLS(exportRows, filename, 'Monthly Billing Statement');
  };

  // Export to PDF
  const handleExportPDF = () => {
    const exportRows = [];

    areaItems.forEach(item => {
      exportRows.push({
        sno: item.sno,
        description: item.description,
        area: item.area_sqft !== '' ? `${item.area_sqft} Sft.` : '',
        rate: item.rate_per_sqft !== '' ? `₹ ${item.rate_per_sqft}` : '',
        amount: item.amount > 0 ? `₹ ${formatCurrency(item.amount)}` : ''
      });
    });

    exportRows.push({
      sno: '',
      description: 'கட்டிட பரப்பளவு',
      area: totalBuiltupArea > 0 ? `${totalBuiltupArea} Sft.` : '',
      rate: averageBuiltupRate > 0 ? `₹ ${averageBuiltupRate}/Sft.` : '',
      amount: `₹ ${formatCurrency(totalBuiltupCost)}`
    });

    amenityItems.forEach((item, idx) => {
      exportRows.push({
        sno: item.sno || areaItems.length + idx + 1,
        description: item.description,
        area: '',
        rate: '',
        amount: item.amount !== '' ? `₹ ${formatCurrency(item.amount)}` : ''
      });
    });

    exportRows.push({
      sno: '',
      description: 'மொத்தம்',
      area: '',
      rate: '',
      amount: `₹ ${formatCurrency(mainStructureTotal)}`
    });

    exportRows.push({
      sno: '',
      description: 'Additional Work Bill',
      area: '',
      rate: '',
      amount: `₹ ${formatCurrency(additionalWorkBill || 0)}`
    });

    exportRows.push({
      sno: '',
      description: `மொத்த தொகை ${billDate ? `(${billDate})` : ''}`,
      area: '',
      rate: '',
      amount: `₹ ${formatCurrency(grossTotalAmount)}`
    });

    exportRows.push({
      sno: '',
      description: 'TOTAL RECEIVED AMOUNT (in Additional)',
      area: '',
      rate: '',
      amount: receivedAdditional !== '' && parseFloat(receivedAdditional) > 0 ? `₹ ${formatCurrency(receivedAdditional)}` : '₹ -'
    });

    exportRows.push({
      sno: '',
      description: 'TOTAL RECEIVED AMOUNT (in Quoted)',
      area: '',
      rate: '',
      amount: `₹ ${formatCurrency(receivedQuoted || 0)}`
    });

    if (siteExpensesTotal > 0) {
      exportRows.push({
        sno: '',
        description: 'EXPENSES ADDED (Admin App / Site Live)',
        area: '',
        rate: '',
        amount: `₹ ${formatCurrency(siteExpensesTotal)}`
      });
    }

    exportRows.push({
      sno: '',
      description: `AS PER STAGE AMOUNT INCLD. ADDITIONAL WORK BILL (To Pay from client) ${settlementDate ? `AS ON ${settlementDate}` : ''}`,
      area: '',
      rate: '',
      amount: `₹ ${formatCurrency(grossTotalAmount)}`
    });

    exportRows.push({
      sno: '',
      description: `BALANCE AMOUNT ${settlementDate ? `AS ON ${settlementDate}` : ''}`,
      area: '',
      rate: '',
      amount: `₹ ${formatCurrency(balanceAmount)}`
    });

    exportRows.push({
      sno: '',
      description: `NET BALANCE AMOUNT ${settlementDate ? `AS ON ${settlementDate}` : ''}`,
      area: '',
      rate: '',
      amount: `₹ ${formatCurrency(netBalanceManual !== '' ? netBalanceManual : balanceAmount)}`
    });

    const exportCols = [
      { key: "sno", label: "வ.எண்" },
      { key: "description", label: "விவரங்கள்" },
      { key: "area", label: "பரப்பளவு (சதுர அடி)" },
      { key: "rate", label: "விலை (சதுர அடி)" },
      { key: "amount", label: "தொகை" }
    ];

    const filename = `Yeloline_Monthly_Billing_${selectedSite.replace(/\s+/g, '_')}`;
    exportToPDF(exportRows, filename, `${clientTitle || selectedSite} - ${statementSubtitle}`, exportCols);
  };

  return (
    <div className="monthly-billing-container">
      {/* Header Bar */}
      <div className="monthly-billing-header">
        <div>
          <h1 className="monthly-billing-title">Monthly Billing & Valuation Statement</h1>
          <p className="monthly-billing-subtitle">
            Exact template document layout • Enter building area & rate, amenities, additional works, and monthly settlement reconciliation
          </p>
        </div>

        <div className="header-action-group">
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleResetToTemplate}
            title="Reset to default document template descriptions"
          >
            <RotateCcw size={15} /> Reset Template
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={handleExportXLS}
            title="Export Statement to Excel"
          >
            <FileSpreadsheet size={15} /> Export XLS
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={handleExportPDF}
            title="Download PDF Statement"
          >
            <FileText size={15} /> Export PDF
          </button>

          <button
            type="button"
            className="btn btn-primary save-btn"
            onClick={handleSaveBilling}
            disabled={isSaving}
          >
            <Save size={15} /> {isSaving ? 'Saving...' : 'Save Monthly Bill'}
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {saveSuccessMsg && (
        <div className="monthly-success-banner">
          <CheckCircle2 size={18} />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* 1. All Registered Sites Selection Cards Section */}
      <div className="monthly-sites-section">
        <div className="monthly-sites-header">
          <div className="monthly-sites-title-wrap">
            <Building size={20} style={{ color: '#D97706' }} />
            <div>
              <div className="monthly-sites-title">
                Registered Sites & Client Projects
                <span className="monthly-sites-count-badge">
                  {allAvailableSites.length} {allAvailableSites.length === 1 ? 'Site' : 'Sites'} Available
                </span>
              </div>
              <div className="monthly-sites-subtitle">
                Click any registered site below to load and update its monthly billing valuation statement in real-time
              </div>
            </div>
          </div>

          <div className="monthly-sites-search-wrap">
            <Search size={14} className="monthly-sites-search-icon" />
            <input
              type="text"
              className="monthly-sites-search-input"
              placeholder="Search registered sites..."
              value={siteSearchQuery}
              onChange={(e) => setSiteSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="monthly-sites-grid">
          {filteredSitesList.map(site => {
            const isSelected = selectedSite.toLowerCase() === site.site_name.toLowerCase();
            const stat = siteBillingMap[site.site_name] || { hasBill: false, grossTotal: 0, balance: 0 };
            return (
              <div
                key={site.id || site.site_name}
                className={`monthly-site-card ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedSite(site.site_name)}
                title={`Click to load and edit monthly billing for ${site.site_name}`}
              >
                <div className="monthly-site-card-top">
                  <div className="monthly-site-icon">
                    <Building size={16} />
                  </div>
                  <div className="monthly-site-heading">
                    <div className="monthly-site-name">{site.site_name}</div>
                    <div className="monthly-site-client">
                      {site.client_name ? `Client: ${site.client_name}` : 'Registered Client'}
                      {site.location ? ` • ${site.location}` : ''}
                    </div>
                  </div>
                  {isSelected && (
                    <span className="monthly-site-active-pill">
                      <CheckCircle2 size={10} /> Selected
                    </span>
                  )}
                </div>

                <div className="monthly-site-card-footer">
                  <span className={`monthly-site-status-pill ${stat.hasBill ? 'configured' : 'draft'}`}>
                    {stat.hasBill ? '✓ Configured' : '○ Ready for Setup'}
                  </span>
                  <span className="monthly-site-amount">
                    {stat.hasBill
                      ? `₹ ${formatCurrency(stat.grossTotal)}`
                      : '₹ 0.00'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="metrics-grid">
        <MetricCard
          title="GROSS TOTAL AMOUNT"
          value={`₹ ${formatCurrency(grossTotalAmount)}`}
          icon={Calculator}
          subtext={`Main Structure (₹${(mainStructureTotal/100000).toFixed(2)}L) + Extra Work`}
          highlight
        />

        <MetricCard
          title="TOTAL RECEIVED"
          value={`₹ ${formatCurrency(totalReceivedCombined)}`}
          icon={DollarSign}
          subtext={
            siteExpensesTotal > 0
              ? `Quoted: ₹${((parseFloat(receivedQuoted) || 0)/100000).toFixed(2)}L + Expenses Added: ₹${(siteExpensesTotal/100000).toFixed(2)}L`
              : `₹${((parseFloat(receivedQuoted) || 0)/100000).toFixed(2)}L Quoted + ₹${((parseFloat(receivedAdditional) || 0)/100000).toFixed(2)}L Addl.`
          }
        />

        <MetricCard
          title="BALANCE DUE"
          value={`₹ ${formatCurrency(balanceAmount)}`}
          icon={TrendingUp}
          subtext={`As on ${settlementDate || 'statement date'} pending`}
        />

        <MetricCard
          title="NET SETTLEMENT"
          value={`₹ ${formatCurrency(netBalanceManual !== '' ? netBalanceManual : balanceAmount)}`}
          icon={CalendarDays}
          subtext="Final settlement balance amount"
        />
      </div>

      {/* Main Billing Valuation Card (Exact Document Layout) */}
      <div className="monthly-statement-card">
        {/* Document Header Input Strip */}
        <div className="statement-header-box">
          <div className="client-header-inputs-container">
            <div className="client-header-field">
              <label className="header-field-label">பெயர் / இல்லம் (Residence Title):</label>
              <input
                type="text"
                className="client-title-input"
                value={clientTitle}
                onChange={(e) => setClientTitle(e.target.value)}
                placeholder="e.g. திரு. நகுலன் குடும்பத்தார் இல்லம்,"
              />
            </div>
            <div className="client-header-field">
              <label className="header-field-label">ஊர் / இடம் (Location):</label>
              <input
                type="text"
                className="client-location-input"
                value={clientLocation}
                onChange={(e) => setClientLocation(e.target.value)}
                placeholder="e.g. மூலனூர்."
              />
            </div>
            <div className="client-header-field">
              <label className="header-field-label">தேதி (Bill Date):</label>
              <input
                type="text"
                className="client-location-input"
                style={{ width: '130px', textAlign: 'center' }}
                value={billDate}
                onChange={(e) => setBillDate(e.target.value)}
                placeholder="e.g. 14.6.2026"
              />
            </div>
            <div className="client-header-field">
              <label className="header-field-label">முடிவு தேதி (Settlement Date):</label>
              <input
                type="text"
                className="client-location-input"
                style={{ width: '130px', textAlign: 'center' }}
                value={settlementDate}
                onChange={(e) => setSettlementDate(e.target.value)}
                placeholder="e.g. 25.8.2026"
              />
            </div>
          </div>

          <div className="client-subtitle-edit-wrap">
            <input
              type="text"
              className="client-subtitle-input"
              value={statementSubtitle}
              onChange={(e) => setStatementSubtitle(e.target.value)}
              placeholder="மதிப்பீடு"
            />
          </div>
        </div>

        {/* The Exact Valuation Table */}
        <div className="valuation-table-wrapper">
          <table className="valuation-table">
            <thead>
              <tr className="table-main-header">
                <th className="col-sno">வ.எண்</th>
                <th className="col-desc">விவரங்கள்</th>
                <th className="col-area">
                  பரப்பளவு<br />
                  <span className="col-subtext">(சதுர அடி)</span>
                </th>
                <th className="col-rate">
                  விலை<br />
                  <span className="col-subtext">(சதுர அடி)</span>
                </th>
                <th className="col-amount">தொகை</th>
                <th className="col-actions">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {/* Section 1: Built-up Area Valuation Items */}
              {areaItems.map((item, index) => (
                <tr key={index} className="area-item-row">
                  <td className="cell-center">
                    <span className="sno-badge">{item.sno || index + 1}</span>
                  </td>
                  <td>
                    <input
                      type="text"
                      className="cell-input desc-input"
                      value={item.description}
                      onChange={(e) => handleAreaChange(index, 'description', e.target.value)}
                      placeholder="e.g. தரைத்தளம்"
                    />
                  </td>
                  <td>
                    <div className="unit-input-wrap">
                      <input
                        type="number"
                        step="any"
                        className="cell-input num-input"
                        value={item.area_sqft}
                        onChange={(e) => handleAreaChange(index, 'area_sqft', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </td>
                  <td>
                    <div className="currency-input-wrap">
                      <span className="currency-symbol">₹</span>
                      <input
                        type="number"
                        step="any"
                        className="cell-input num-input"
                        value={item.rate_per_sqft}
                        onChange={(e) => handleAreaChange(index, 'rate_per_sqft', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </td>
                  <td>
                    <div className="amount-display-cell">
                      <span className="currency-symbol">₹</span>
                      <strong>{formatCurrency(item.amount)}</strong>
                    </div>
                  </td>
                  <td className="cell-center">
                    <button
                      type="button"
                      className="delete-row-btn"
                      onClick={() => handleDeleteAreaRow(index)}
                      title="Remove area row"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}

              {/* Built-up Area Subtotal Row (Peach & Mint Green background - Matching Document) */}
              <tr className="builtup-subtotal-row">
                <td className="cell-empty"></td>
                <td className="subtotal-label-cell">
                  <strong>கட்டிட பரப்பளவு</strong>
                </td>
                <td className="subtotal-val-cell subtotal-area-val">
                  <strong>{totalBuiltupArea > 0 ? `${totalBuiltupArea} Sft.` : '—'}</strong>
                </td>
                <td className="subtotal-val-cell subtotal-rate-val">
                  <strong>{averageBuiltupRate > 0 ? `₹ ${averageBuiltupRate}/Sft.` : '—'}</strong>
                </td>
                <td className="subtotal-amount-cell">
                  <span className="currency-symbol">₹</span>
                  <strong>{formatCurrency(totalBuiltupCost)}</strong>
                </td>
                <td className="cell-center">
                  <button
                    type="button"
                    className="add-sub-btn"
                    onClick={handleAddAreaRow}
                    title="Add another area row"
                  >
                    <Plus size={14} /> Add
                  </button>
                </td>
              </tr>

              {/* Section 2: Fixed Amenities (Sump, Septic Tank, Sintex Tank) */}
              {amenityItems.map((item, index) => (
                <tr key={index} className="amenity-item-row">
                  <td className="cell-center">
                    <span className="sno-badge">{item.sno || areaItems.length + index + 1}</span>
                  </td>
                  <td>
                    <input
                      type="text"
                      className="cell-input desc-input"
                      value={item.description}
                      onChange={(e) => handleAmenityChange(index, 'description', e.target.value)}
                      placeholder="e.g. நிலத்தொட்டி (5000 லிட்டர்)"
                    />
                  </td>
                  <td className="cell-center text-muted">—</td>
                  <td className="cell-center text-muted">—</td>
                  <td>
                    <div className="currency-input-wrap">
                      <span className="currency-symbol">₹</span>
                      <input
                        type="number"
                        step="any"
                        className="cell-input num-input bold-input"
                        value={item.amount}
                        onChange={(e) => handleAmenityChange(index, 'amount', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </td>
                  <td className="cell-center">
                    <button
                      type="button"
                      className="delete-row-btn"
                      onClick={() => handleDeleteAmenityRow(index)}
                      title="Remove amenity row"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}

              {/* Amenities Toolbar Row */}
              <tr className="amenity-toolbar-row">
                <td colSpan={6}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleAddAmenityRow}
                  >
                    <Plus size={14} /> Add Extra Work / Amenity Row
                  </button>
                </td>
              </tr>

              {/* Main Structure Total Row (Light Green background - Matching Document) */}
              <tr className="structure-total-row">
                <td colSpan={4} className="total-title-cell">
                  <strong>மொத்தம்</strong>
                </td>
                <td className="total-val-cell">
                  <span className="currency-symbol">₹</span>
                  <strong>{formatCurrency(mainStructureTotal)}</strong>
                </td>
                <td></td>
              </tr>

              {/* Additional Work Bill Row */}
              <tr className="additional-bill-row">
                <td colSpan={4} className="total-title-cell">
                  <span>Additional Work Bill</span>
                </td>
                <td className="total-input-cell">
                  <div className="currency-input-wrap">
                    <span className="currency-symbol">₹</span>
                    <input
                      type="number"
                      step="any"
                      className="cell-input num-input bold-input"
                      value={additionalWorkBill}
                      onChange={(e) => setAdditionalWorkBill(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </td>
                <td></td>
              </tr>

              {/* Gross Total Amount Row (Light Yellow background - Matching Document) */}
              <tr className="gross-total-row">
                <td colSpan={4} className="total-title-cell">
                  <strong>மொத்த தொகை {billDate ? `(${billDate})` : ''}</strong>
                </td>
                <td className="total-val-cell highlight-yellow">
                  <span className="currency-symbol">₹</span>
                  <strong>{formatCurrency(grossTotalAmount)}</strong>
                </td>
                <td></td>
              </tr>

              {/* Section 3: Financial Settlements & Payments */}
              <tr className="reconciliation-row">
                <td colSpan={4} className="recon-label-cell">
                  TOTAL RECEIVED AMOUNT (in Additional)
                </td>
                <td className="recon-input-cell">
                  <div className="currency-input-wrap">
                    <span className="currency-symbol">₹</span>
                    <input
                      type="number"
                      step="any"
                      className="cell-input num-input bold-input"
                      value={receivedAdditional}
                      onChange={(e) => setReceivedAdditional(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </td>
                <td></td>
              </tr>

              <tr className="reconciliation-row">
                <td colSpan={4} className="recon-label-cell">
                  TOTAL RECEIVED AMOUNT (in Quoted)
                </td>
                <td className="recon-input-cell">
                  <div className="currency-input-wrap">
                    <span className="currency-symbol">₹</span>
                    <input
                      type="number"
                      step="any"
                      className="cell-input num-input bold-input"
                      value={receivedQuoted}
                      onChange={(e) => setReceivedQuoted(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </td>
                <td></td>
              </tr>

              {siteExpensesTotal > 0 && (
                <tr className="reconciliation-row" style={{ backgroundColor: '#fffbeb' }}>
                  <td colSpan={4} className="recon-label-cell">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, color: '#92400e' }}>EXPENSES ADDED (Admin App / Site Live)</span>
                      <span style={{ fontSize: '11px', background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                        Live Firestore Sync
                      </span>
                    </div>
                  </td>
                  <td className="recon-val-cell" style={{ color: '#b45309', fontWeight: 800 }}>
                    <span className="currency-symbol">₹</span>
                    <strong>{formatCurrency(siteExpensesTotal)}</strong>
                  </td>
                  <td></td>
                </tr>
              )}

              <tr className="reconciliation-row">
                <td colSpan={4} className="recon-label-cell recon-multiline">
                  <div>AS PER STAGE AMOUNT INCLD. ADDITIONAL WORK BILL</div>
                  <div>(To Pay from client) {settlementDate ? `AS ON ${settlementDate}` : ''}</div>
                </td>
                <td className="recon-val-cell">
                  <span className="currency-symbol">₹</span>
                  <strong>{formatCurrency(grossTotalAmount)}</strong>
                </td>
                <td></td>
              </tr>

              {/* Balance Amount Row (Light Blue background - Matching Document) */}
              <tr className="balance-row">
                <td colSpan={4} className="balance-label-cell">
                  <strong>BALANCE AMOUNT {settlementDate ? `AS ON ${settlementDate}` : ''}</strong>
                </td>
                <td className="balance-val-cell">
                  <span className="currency-symbol">₹</span>
                  <strong>{formatCurrency(balanceAmount)}</strong>
                </td>
                <td></td>
              </tr>

              {/* Net Balance Amount Row (Light Green background - Matching Document) */}
              <tr className="net-balance-row">
                <td colSpan={4} className="net-balance-label-cell">
                  <strong>NET BALANCE AMOUNT {settlementDate ? `AS ON ${settlementDate}` : ''}</strong>
                </td>
                <td className="net-input-cell">
                  <div className="currency-input-wrap">
                    <span className="currency-symbol">₹</span>
                    <input
                      type="number"
                      step="any"
                      className="cell-input num-input net-input"
                      value={netBalanceManual}
                      onChange={(e) => setNetBalanceManual(e.target.value)}
                      placeholder={formatCurrency(balanceAmount)}
                    />
                  </div>
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Card Footer Save Bar */}
        <div className="monthly-card-footer">
          <div className="footer-info">
            <span>Building area cost automatically calculates: <code>Area × Rate = Amount</code>. All totals, subtotals, and balance amounts update dynamically.</span>
          </div>
          <div className="footer-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSaveBilling}
              disabled={isSaving}
            >
              <Save size={16} /> {isSaving ? 'Saving...' : 'Save Monthly Bill'}
            </button>
          </div>
        </div>
      </div>

      {/* Official Printable Statement Modal (Exact Replica of Document Photo) */}
      <Modal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Official Monthly Valuation Statement"
        maxWidth="850px"
      >
        <div className="official-monthly-sheet" id="printable-monthly-billing">
          {/* Header Title Box */}
          <div className="sheet-header-box">
            <h2>{clientTitle || 'திரு. நகுலன் குடும்பத்தார் இல்லம்,'}</h2>
            {clientLocation && <h3>{clientLocation}</h3>}
            <div className="sheet-subtitle-pill">
              <span>{statementSubtitle || 'மதிப்பீடு'}</span>
            </div>
          </div>

          {/* Statement Table Matching Document Photo */}
          <table className="sheet-table">
            <thead>
              <tr className="sheet-th-row">
                <th style={{ width: '8%', textAlign: 'center' }}>வ.எண்</th>
                <th style={{ width: '42%', textAlign: 'center' }}>விவரங்கள்</th>
                <th style={{ width: '16%', textAlign: 'center' }}>
                  பரப்பளவு<br />
                  <span style={{ fontSize: '0.85em' }}>(சதுர அடி)</span>
                </th>
                <th style={{ width: '17%', textAlign: 'center' }}>
                  விலை<br />
                  <span style={{ fontSize: '0.85em' }}>(சதுர அடி)</span>
                </th>
                <th style={{ width: '17%', textAlign: 'center' }}>தொகை</th>
              </tr>
            </thead>
            <tbody>
              {/* Area items */}
              {areaItems.map((item, idx) => (
                <tr key={idx} className="sheet-area-row">
                  <td style={{ textAlign: 'center' }}>{item.sno || idx + 1}</td>
                  <td>{item.description}</td>
                  <td style={{ textAlign: 'center', fontFamily: 'monospace' }}>
                    {item.area_sqft !== '' ? Number(item.area_sqft).toFixed(2) : ''}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                    {item.rate_per_sqft !== '' ? `₹ ${Number(item.rate_per_sqft).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : ''}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>
                    {item.amount > 0 ? `₹ ${Number(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : ''}
                  </td>
                </tr>
              ))}

              {/* Built-up area subtotal (Peach row) */}
              <tr className="print-peach-row">
                <td></td>
                <td style={{ fontWeight: 800 }}>கட்டிட பரப்பளவு</td>
                <td style={{ textAlign: 'center', fontWeight: 800 }}>
                  {totalBuiltupArea > 0 ? `${totalBuiltupArea} Sft.` : ''}
                </td>
                <td style={{ textAlign: 'center', fontWeight: 800 }}>
                  {averageBuiltupRate > 0 ? `₹ ${averageBuiltupRate}/Sft.` : ''}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 800, fontFamily: 'monospace' }}>
                  ₹ {Number(totalBuiltupCost).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>

              {/* Amenities */}
              {amenityItems.map((item, idx) => (
                <tr key={idx} className="sheet-amenity-row">
                  <td style={{ textAlign: 'center' }}>{item.sno || areaItems.length + idx + 1}</td>
                  <td>{item.description}</td>
                  <td style={{ textAlign: 'center' }}>—</td>
                  <td style={{ textAlign: 'center' }}>—</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>
                    {item.amount !== '' && parseFloat(item.amount) > 0 ? `₹ ${Number(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : ''}
                  </td>
                </tr>
              ))}

              {/* Main Structure Total (Green row) */}
              <tr className="print-green-row">
                <td colSpan={4} style={{ textAlign: 'center', fontWeight: 800 }}>மொத்தம்</td>
                <td style={{ textAlign: 'right', fontWeight: 800, fontFamily: 'monospace' }}>
                  ₹ {Number(mainStructureTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>

              {/* Additional Work Bill */}
              <tr className="sheet-additional-row">
                <td colSpan={4} style={{ textAlign: 'center', fontWeight: 600 }}>Additional Work Bill</td>
                <td style={{ textAlign: 'right', fontWeight: 800, fontFamily: 'monospace' }}>
                  ₹ {Number(additionalWorkBill || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>

              {/* Gross Total (Yellow row) */}
              <tr className="print-yellow-row">
                <td colSpan={4} style={{ textAlign: 'center', fontWeight: 800 }}>
                  மொத்த தொகை {billDate ? `(${billDate})` : ''}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 800, fontFamily: 'monospace' }}>
                  ₹ {Number(grossTotalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>

              {/* Received Additional */}
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', fontSize: '0.82rem' }}>
                  TOTAL RECEIVED AMOUNT (in Additional)
                </td>
                <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                  {receivedAdditional !== '' && parseFloat(receivedAdditional) > 0 ? `₹ ${Number(receivedAdditional).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹ -'}
                </td>
              </tr>

              {/* Received Quoted */}
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', fontSize: '0.82rem' }}>
                  TOTAL RECEIVED AMOUNT (in Quoted)
                </td>
                <td style={{ textAlign: 'right', fontWeight: 800, fontFamily: 'monospace' }}>
                  ₹ {Number(receivedQuoted || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>

              {/* Site Expenses Added */}
              {siteExpensesTotal > 0 && (
                <tr style={{ backgroundColor: '#fffbeb' }}>
                  <td colSpan={4} style={{ textAlign: 'center', fontSize: '0.82rem', fontWeight: 700, color: '#92400e' }}>
                    EXPENSES ADDED (Admin App / Site Live)
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 800, fontFamily: 'monospace', color: '#92400e' }}>
                    ₹ {Number(siteExpensesTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              )}

              {/* To Pay from client */}
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 600 }}>
                  AS PER STAGE AMOUNT INCLD. ADDITIONAL WORK BILL (To Pay from client) {settlementDate ? `AS ON ${settlementDate}` : ''}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 800, fontFamily: 'monospace' }}>
                  ₹ {Number(grossTotalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>

              {/* Balance Amount (Blue row) */}
              <tr className="print-blue-row">
                <td colSpan={4} style={{ textAlign: 'center', fontWeight: 800 }}>
                  BALANCE AMOUNT {settlementDate ? `AS ON ${settlementDate}` : ''}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 800, fontFamily: 'monospace' }}>
                  ₹ {Number(balanceAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>

              {/* Net Balance Amount (Light Green row) */}
              <tr className="print-lightgreen-row">
                <td colSpan={4} style={{ textAlign: 'center', fontWeight: 800 }}>
                  NET BALANCE AMOUNT {settlementDate ? `AS ON ${settlementDate}` : ''}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 800, fontFamily: 'monospace' }}>
                  ₹ {Number(netBalanceManual !== '' ? netBalanceManual : balanceAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Signatures */}
          <div className="sheet-signatures">
            <div className="sig-block">
              <div className="sig-line" />
              <span>Yeloline Constructions</span>
            </div>
            <div className="sig-block">
              <div className="sig-line" />
              <span>Client / Owner Acceptance</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="print-modal-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setIsPrintModalOpen(false)}
          >
            Close
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => window.print()}
          >
            <Printer size={16} /> Print / Save PDF
          </button>
        </div>
      </Modal>
    </div>
  );
}
