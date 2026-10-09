import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarDays,
  Save,
  FileSpreadsheet,
  FileText,
  Printer,
  CheckCircle2,
  Building,
  TrendingUp,
  DollarSign,
  Calculator,
  RotateCcw,
  User,
  MapPin
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import MetricCard from '../../components/common/MetricCard/MetricCard';
import Modal from '../../components/common/Modal/Modal';
import './MonthlyBillingModule.css';

// Clean numeric parser
const parseCleanNumber = (val) => {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

// Calculate total estimated amount from Itemized Budget breakdown (budget_items)
const getItemizedBudgetEstimateTotal = (siteObj) => {
  if (!siteObj) return 0;
  const raw = siteObj.raw || siteObj;

  // 1. Calculate sum from budget_items if present
  const items = Array.isArray(raw.budget_items)
    ? raw.budget_items
    : (raw.budget_items && typeof raw.budget_items === 'object' ? Object.values(raw.budget_items) : null);

  if (items && items.length > 0) {
    const sum = items.reduce((acc, row) => {
      if (!row) return acc;
      const amt = parseCleanNumber(
        row.estimated_amount !== undefined ? row.estimated_amount :
        row.estimate_amount !== undefined ? row.estimate_amount :
        row.estimated !== undefined ? row.estimated :
        row.amount !== undefined ? row.amount : 0
      );
      return acc + amt;
    }, 0);
    if (sum > 0) return sum;
  }

  // 2. Fall back to estimated_budget if recorded on site
  const estBudget = parseCleanNumber(raw.estimated_budget ?? raw.total_budget);
  if (estBudget > 0) return estBudget;

  return 0;
};

export default function MonthlyBillingModule() {
  const {
    sites = [],
    monthlyBillings = [],
    paymentBreakups = [],
    expenses = [],
    saveMonthlyBilling,
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

  useEffect(() => {
    if (siteList.length > 0 && (!selectedSite || !siteList.includes(selectedSite))) {
      setSelectedSite(siteList[0]);
    }
  }, [siteList, selectedSite]);

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
          balance: Number(
            existing.net_balance !== undefined && existing.net_balance !== '' && Number(existing.net_balance) !== 3000000
              ? existing.net_balance
              : (existing.balance_amount || 0)
          ),
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

  // Billing overview status for current selected site
  const selectedSiteBillingStat = useMemo(() => {
    return siteBillingMap[selectedSite] || null;
  }, [siteBillingMap, selectedSite]);

  // Header meta information matching document
  const [clientTitle, setClientTitle] = useState('');
  const [clientLocation, setClientLocation] = useState('');
  const [statementSubtitle, setStatementSubtitle] = useState('மதிப்பீடு');
  const [billDate, setBillDate] = useState('');
  const [settlementDate, setSettlementDate] = useState('');

  // Financial valuation & reconciliation fields
  const [mainStructureTotalInput, setMainStructureTotalInput] = useState('');
  const [additionalWorkBill, setAdditionalWorkBill] = useState('');
  const [receivedAdditional, setReceivedAdditional] = useState('');
  const [receivedQuoted, setReceivedQuoted] = useState('');
  const [netBalanceManual, setNetBalanceManual] = useState('');

  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Load existing billing for selected site or populate default from site itemized budget
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

    // Extract itemized budget estimated total
    const itemizedEstTotal = getItemizedBudgetEstimateTotal(siteObj);

    if (existing) {
      setClientTitle(existing.client_title || (siteObj?.client_name ? `திரு. ${siteObj.client_name} இல்லம்` : ''));
      setClientLocation(existing.client_location || siteObj?.location || '');
      setStatementSubtitle(existing.statement_subtitle || 'மதிப்பீடு');
      setBillDate(existing.bill_date || '');
      setSettlementDate(existing.settlement_date || '');

      // Quoted Total resolution:
      // If the admin added amount in estimate amount in itemized budget, populate that total.
      // Otherwise, make field empty (removing legacy 3000000 / dummy data).
      if (itemizedEstTotal > 0) {
        setMainStructureTotalInput(String(itemizedEstTotal));
      } else {
        const storedVal = existing.main_structure_total;
        if (storedVal !== undefined && storedVal !== null && storedVal !== '' && Number(storedVal) !== 3000000 && Number(storedVal) !== 0) {
          setMainStructureTotalInput(String(storedVal));
        } else {
          setMainStructureTotalInput('');
        }
      }

      setAdditionalWorkBill(existing.additional_work_bill !== undefined && existing.additional_work_bill !== null ? existing.additional_work_bill : '');
      setReceivedAdditional(existing.received_additional !== undefined && existing.received_additional !== null ? existing.received_additional : '');
      setReceivedQuoted(existing.received_quoted !== undefined && existing.received_quoted !== null ? existing.received_quoted : '');

      // Purge legacy 3000000 dummy data or auto-synced balances from netBalanceManual
      if (
        existing.has_manual_net_balance &&
        existing.net_balance_manual !== undefined &&
        existing.net_balance_manual !== '' &&
        Number(existing.net_balance_manual) !== 3000000
      ) {
        setNetBalanceManual(String(existing.net_balance_manual));
      } else {
        setNetBalanceManual('');
      }
    } else {
      setClientTitle(siteObj?.client_name ? `திரு. ${siteObj.client_name} இல்லம்` : '');
      setClientLocation(siteObj?.location || '');
      setStatementSubtitle('மதிப்பீடு');
      setBillDate('');
      setSettlementDate('');

      // Quoted Total:
      // If itemized budget has an estimate, populate it; otherwise field is empty
      if (itemizedEstTotal > 0) {
        setMainStructureTotalInput(String(itemizedEstTotal));
      } else {
        setMainStructureTotalInput('');
      }

      setAdditionalWorkBill('');
      setReceivedAdditional('');
      setReceivedQuoted('');
      setNetBalanceManual('');
    }
  }, [selectedSite, monthlyBillings, allAvailableSites]);

  // Current selected site details & Itemized Budget estimate total
  const currentSiteObj = useMemo(() => {
    if (!selectedSite) return null;
    return allAvailableSites.find(
      s => s.site_name.toLowerCase() === selectedSite.toLowerCase()
    ) || null;
  }, [allAvailableSites, selectedSite]);

  const currentItemizedEstimateTotal = useMemo(() => {
    return getItemizedBudgetEstimateTotal(currentSiteObj);
  }, [currentSiteObj]);

  // Calculations
  const mainStructureTotal = useMemo(() => {
    return parseFloat(mainStructureTotalInput) || 0;
  }, [mainStructureTotalInput]);

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

  const totalReceivedCombined = useMemo(() => {
    const additional = parseFloat(receivedAdditional) || 0;
    const quoted = parseFloat(receivedQuoted) || 0;
    // Reflect expenses added from Admin App directly into total received amount
    return additional + quoted + siteExpensesTotal;
  }, [receivedAdditional, receivedQuoted, siteExpensesTotal]);

  const balanceAmount = useMemo(() => {
    return grossTotalAmount - totalReceivedCombined;
  }, [grossTotalAmount, totalReceivedCombined]);

  // Reset to default
  const handleResetToTemplate = () => {
    if (window.confirm("Reset billing figures for this site?")) {
      const siteObj = allAvailableSites.find(
        s => s.site_name.toLowerCase() === selectedSite.toLowerCase()
      );
      const itemizedEstTotal = getItemizedBudgetEstimateTotal(siteObj);
      setMainStructureTotalInput(itemizedEstTotal > 0 ? String(itemizedEstTotal) : '');
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
      const hasManualNet = String(netBalanceManual).trim() !== '';
      const netVal = hasManualNet ? (parseFloat(netBalanceManual) || 0) : balanceAmount;

      const payload = {
        id: selectedSite,
        bill_id: `MONTHLY-${selectedSite.replace(/\s+/g, '-').toUpperCase()}`,
        site_name: selectedSite,
        client_title: clientTitle,
        client_location: clientLocation,
        statement_subtitle: statementSubtitle,
        bill_date: billDate,
        settlement_date: settlementDate,
        area_items: [],
        amenity_items: [],
        total_builtup_area: 0,
        total_builtup_cost: 0,
        average_builtup_rate: 0,
        main_structure_total: mainStructureTotal,
        additional_work_bill: parseFloat(additionalWorkBill) || 0,
        gross_total: grossTotalAmount,
        received_additional: parseFloat(receivedAdditional) || 0,
        received_quoted: parseFloat(receivedQuoted) || 0,
        site_expenses_total: siteExpensesTotal,
        total_received: totalReceivedCombined,
        balance_amount: balanceAmount,
        net_balance: netVal,
        net_balance_manual: hasManualNet ? netBalanceManual.trim() : '',
        has_manual_net_balance: hasManualNet
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
    if (clientTitle) exportRows.push({ SNo: '', Description: clientTitle, Amount: '' });
    if (clientLocation) exportRows.push({ SNo: '', Description: clientLocation, Amount: '' });
    exportRows.push({ SNo: '', Description: statementSubtitle || 'மதிப்பீடு', Amount: '' });
    exportRows.push({ SNo: 'வ.எண்', Description: 'விவரங்கள்', Amount: 'தொகை' });

    // Main Structure Total
    exportRows.push({
      SNo: '1',
      Description: 'மொத்தம் (Main Structure / Quoted Total)',
      Amount: mainStructureTotal
    });

    // Additional Work Bill
    exportRows.push({
      SNo: '2',
      Description: 'Additional Work Bill',
      Amount: additionalWorkBill !== '' ? additionalWorkBill : 0
    });

    // Gross Total
    exportRows.push({
      SNo: '3',
      Description: `மொத்த தொகை ${billDate ? `(${billDate})` : ''}`,
      Amount: grossTotalAmount
    });

    // Settlement
    exportRows.push({ SNo: '4', Description: 'TOTAL RECEIVED AMOUNT (in Additional)', Amount: receivedAdditional !== '' ? receivedAdditional : '-' });
    exportRows.push({ SNo: '5', Description: 'TOTAL RECEIVED AMOUNT (in Quoted)', Amount: receivedQuoted !== '' ? receivedQuoted : 0 });
    if (siteExpensesTotal > 0) {
      exportRows.push({ SNo: '•', Description: 'EXPENSES ADDED (Admin App / Site Live)', Amount: siteExpensesTotal });
    }
    exportRows.push({ SNo: '6', Description: `AS PER STAGE AMOUNT INCLD. ADDITIONAL WORK BILL (To Pay from client) ${settlementDate ? `AS ON ${settlementDate}` : ''}`, Amount: grossTotalAmount });
    exportRows.push({ SNo: '7', Description: `BALANCE AMOUNT ${settlementDate ? `AS ON ${settlementDate}` : ''}`, Amount: balanceAmount });
    exportRows.push({ SNo: '8', Description: `NET BALANCE AMOUNT ${settlementDate ? `AS ON ${settlementDate}` : ''}`, Amount: netBalanceManual !== '' ? netBalanceManual : balanceAmount });

    const filename = `Yeloline_Monthly_Billing_${selectedSite.replace(/\s+/g, '_')}`;
    exportToXLS(exportRows, filename, 'Monthly Billing Statement');
  };

  // Export to PDF
  const handleExportPDF = () => {
    const exportRows = [];

    exportRows.push({
      sno: '1',
      description: 'மொத்தம் (Main Structure / Quoted Total)',
      amount: `₹ ${formatCurrency(mainStructureTotal)}`
    });

    exportRows.push({
      sno: '2',
      description: 'Additional Work Bill',
      amount: `₹ ${formatCurrency(additionalWorkBill || 0)}`
    });

    exportRows.push({
      sno: '3',
      description: `மொத்த தொகை ${billDate ? `(${billDate})` : ''}`,
      amount: `₹ ${formatCurrency(grossTotalAmount)}`
    });

    exportRows.push({
      sno: '4',
      description: 'TOTAL RECEIVED AMOUNT (in Additional)',
      amount: receivedAdditional !== '' && parseFloat(receivedAdditional) > 0 ? `₹ ${formatCurrency(receivedAdditional)}` : '₹ -'
    });

    exportRows.push({
      sno: '5',
      description: 'TOTAL RECEIVED AMOUNT (in Quoted)',
      amount: `₹ ${formatCurrency(receivedQuoted || 0)}`
    });

    if (siteExpensesTotal > 0) {
      exportRows.push({
        sno: '•',
        description: 'EXPENSES ADDED (Admin App / Site Live)',
        amount: `₹ ${formatCurrency(siteExpensesTotal)}`
      });
    }

    exportRows.push({
      sno: '6',
      description: `AS PER STAGE AMOUNT INCLD. ADDITIONAL WORK BILL (To Pay from client) ${settlementDate ? `AS ON ${settlementDate}` : ''}`,
      amount: `₹ ${formatCurrency(grossTotalAmount)}`
    });

    exportRows.push({
      sno: '7',
      description: `BALANCE AMOUNT ${settlementDate ? `AS ON ${settlementDate}` : ''}`,
      amount: `₹ ${formatCurrency(balanceAmount)}`
    });

    exportRows.push({
      sno: '8',
      description: `NET BALANCE AMOUNT ${settlementDate ? `AS ON ${settlementDate}` : ''}`,
      amount: `₹ ${formatCurrency(netBalanceManual !== '' ? netBalanceManual : balanceAmount)}`
    });

    const exportCols = [
      { key: "sno", label: "வ.எண்" },
      { key: "description", label: "விவரங்கள்" },
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

      {/* 1. Dropdown Style Site Selector Strip */}
      <div className="monthly-site-selector-card">
        <div className="site-select-wrapper">
          <label className="selector-label" htmlFor="monthly-site-select">
            <Building size={18} style={{ color: '#D97706' }} /> Select Site / Project:
          </label>
          <div className="site-select-dropdown-box">
            <select
              id="monthly-site-select"
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="site-dropdown-input"
            >
              {allAvailableSites.map(site => {
                const stat = siteBillingMap[site.site_name];
                const statusTag = stat?.hasBill ? '✓ Configured' : '○ Ready for Setup';
                const clientPart = site.client_name ? ` (${site.client_name})` : '';
                return (
                  <option key={site.id || site.site_name} value={site.site_name}>
                    {site.site_name}{clientPart} — {statusTag}
                  </option>
                );
              })}
            </select>
          </div>
          <span className="monthly-sites-count-badge">
            {allAvailableSites.length} {allAvailableSites.length === 1 ? 'Site' : 'Sites'} Available
          </span>
        </div>

        {/* Selected Site Meta Badges */}
        {currentSiteObj && (
          <div className="site-meta-badges">
            {currentSiteObj.client_name && (
              <span className="site-badge">
                <User size={13} style={{ color: '#D97706' }} /> Client: <strong>{currentSiteObj.client_name}</strong>
              </span>
            )}
            {currentSiteObj.location && (
              <span className="site-badge">
                <MapPin size={13} style={{ color: '#0284C7' }} /> <span>{currentSiteObj.location}</span>
              </span>
            )}
            <span className={`site-badge ${selectedSiteBillingStat?.hasBill ? 'configured-badge' : 'draft-badge'}`}>
              {selectedSiteBillingStat?.hasBill ? (
                <>
                  <CheckCircle2 size={13} style={{ color: '#16A34A' }} />
                  <span>Configured: <strong>₹ {formatCurrency(selectedSiteBillingStat.grossTotal)}</strong></span>
                </>
              ) : (
                <span>○ Ready for Setup</span>
              )}
            </span>
          </div>
        )}
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

        {/* The Billing Statement Table */}
        <div className="valuation-table-wrapper">
          <table className="valuation-table">
            <thead>
              <tr className="table-main-header">
                <th className="col-sno" style={{ width: '80px' }}>வ.எண்</th>
                <th className="col-desc">விவரங்கள் (Particulars)</th>
                <th className="col-amount" style={{ width: '240px' }}>தொகை (Amount ₹)</th>
              </tr>
            </thead>
            <tbody>
              {/* 1. Main Contract / Building Total */}
              <tr className="structure-total-row">
                <td className="cell-center">
                  <span className="sno-badge">1</span>
                </td>
                <td className="total-title-cell">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <strong>மொத்தம் (Main Structure / Quoted Total)</strong>
                    {currentItemizedEstimateTotal > 0 && (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: '#15803d',
                          backgroundColor: '#dcfce7',
                          border: '1px solid #bbf7d0',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        title="Linked to Itemized Budget Estimated Total"
                      >
                        Itemized Budget Est: ₹{formatCurrency(currentItemizedEstimateTotal)}
                      </span>
                    )}
                  </div>
                </td>
                <td className="total-input-cell">
                  <div className="currency-input-wrap">
                    <span className="currency-symbol">₹</span>
                    <input
                      type="number"
                      step="any"
                      className="cell-input num-input bold-input"
                      value={mainStructureTotalInput}
                      onChange={(e) => setMainStructureTotalInput(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </td>
              </tr>

              {/* 2. Additional Work Bill Row */}
              <tr className="additional-bill-row">
                <td className="cell-center">
                  <span className="sno-badge">2</span>
                </td>
                <td className="total-title-cell">
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
              </tr>

              {/* 3. Gross Total Amount Row (Light Yellow background - Matching Document) */}
              <tr className="gross-total-row">
                <td className="cell-center">
                  <span className="sno-badge">3</span>
                </td>
                <td className="total-title-cell">
                  <strong>மொத்த தொகை {billDate ? `(${billDate})` : ''}</strong>
                </td>
                <td className="total-val-cell highlight-yellow">
                  <span className="currency-symbol">₹</span>
                  <strong>{formatCurrency(grossTotalAmount)}</strong>
                </td>
              </tr>

              {/* 4. TOTAL RECEIVED AMOUNT (in Additional) */}
              <tr className="reconciliation-row">
                <td className="cell-center">
                  <span className="sno-badge">4</span>
                </td>
                <td className="recon-label-cell">
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
              </tr>

              {/* 5. TOTAL RECEIVED AMOUNT (in Quoted) */}
              <tr className="reconciliation-row">
                <td className="cell-center">
                  <span className="sno-badge">5</span>
                </td>
                <td className="recon-label-cell">
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
              </tr>

              {/* Live Expenses from Admin App / Site */}
              {siteExpensesTotal > 0 && (
                <tr className="reconciliation-row" style={{ backgroundColor: '#fffbeb' }}>
                  <td className="cell-center">
                    <span className="sno-badge" style={{ background: '#fef3c7', color: '#b45309' }}>•</span>
                  </td>
                  <td className="recon-label-cell">
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
                </tr>
              )}

              {/* 6. AS PER STAGE AMOUNT INCLD. ADDITIONAL WORK BILL */}
              <tr className="reconciliation-row">
                <td className="cell-center">
                  <span className="sno-badge">6</span>
                </td>
                <td className="recon-label-cell recon-multiline">
                  <div>AS PER STAGE AMOUNT INCLD. ADDITIONAL WORK BILL</div>
                  <div>(To Pay from client) {settlementDate ? `AS ON ${settlementDate}` : ''}</div>
                </td>
                <td className="recon-val-cell">
                  <span className="currency-symbol">₹</span>
                  <strong>{formatCurrency(grossTotalAmount)}</strong>
                </td>
              </tr>

              {/* 7. Balance Amount Row (Light Blue background - Matching Document) */}
              <tr className="balance-row">
                <td className="cell-center">
                  <span className="sno-badge">7</span>
                </td>
                <td className="balance-label-cell">
                  <strong>BALANCE AMOUNT {settlementDate ? `AS ON ${settlementDate}` : ''}</strong>
                </td>
                <td className="balance-val-cell">
                  <span className="currency-symbol">₹</span>
                  <strong>{formatCurrency(balanceAmount)}</strong>
                </td>
              </tr>

              {/* 8. Net Balance Amount Row (Light Green background - Matching Document) */}
              <tr className="net-balance-row">
                <td className="cell-center">
                  <span className="sno-badge">8</span>
                </td>
                <td className="net-balance-label-cell">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <strong>NET BALANCE AMOUNT {settlementDate ? `AS ON ${settlementDate}` : ''}</strong>
                    {netBalanceManual !== '' && (
                      <button
                        type="button"
                        onClick={() => setNetBalanceManual('')}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#dc2626',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          fontWeight: 600,
                          textDecoration: 'underline',
                          padding: 0
                        }}
                        title="Clear manual override"
                      >
                        Clear field
                      </button>
                    )}
                  </div>
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
                      placeholder="0.00"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Card Footer Save Bar */}
        <div className="monthly-card-footer">
          <div className="footer-info">
            <span>Enter Main Contract / Quoted Total and Additional Work Bill. All totals, received amounts, and balance settlements calculate dynamically.</span>
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

          {/* Statement Table Matching Document */}
          <table className="sheet-table">
            <thead>
              <tr className="sheet-th-row">
                <th style={{ width: '10%', textAlign: 'center' }}>வ.எண்</th>
                <th style={{ width: '60%', textAlign: 'left', paddingLeft: '14px' }}>விவரங்கள் (Particulars)</th>
                <th style={{ width: '30%', textAlign: 'right', paddingRight: '14px' }}>தொகை (Amount ₹)</th>
              </tr>
            </thead>
            <tbody>
              {/* Main Structure Total (Green row) */}
              <tr className="print-green-row">
                <td style={{ textAlign: 'center', fontWeight: 800 }}>1</td>
                <td style={{ textAlign: 'left', paddingLeft: '14px', fontWeight: 800 }}>மொத்தம் (Main Structure / Quoted Total)</td>
                <td style={{ textAlign: 'right', paddingRight: '14px', fontWeight: 800, fontFamily: 'monospace' }}>
                  ₹ {Number(mainStructureTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>

              {/* Additional Work Bill */}
              <tr className="sheet-additional-row">
                <td style={{ textAlign: 'center', fontWeight: 600 }}>2</td>
                <td style={{ textAlign: 'left', paddingLeft: '14px', fontWeight: 600 }}>Additional Work Bill</td>
                <td style={{ textAlign: 'right', paddingRight: '14px', fontWeight: 800, fontFamily: 'monospace' }}>
                  ₹ {Number(additionalWorkBill || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>

              {/* Gross Total (Yellow row) */}
              <tr className="print-yellow-row">
                <td style={{ textAlign: 'center', fontWeight: 800 }}>3</td>
                <td style={{ textAlign: 'left', paddingLeft: '14px', fontWeight: 800 }}>
                  மொத்த தொகை {billDate ? `(${billDate})` : ''}
                </td>
                <td style={{ textAlign: 'right', paddingRight: '14px', fontWeight: 800, fontFamily: 'monospace' }}>
                  ₹ {Number(grossTotalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>

              {/* Received Additional */}
              <tr>
                <td style={{ textAlign: 'center', fontSize: '0.85rem' }}>4</td>
                <td style={{ textAlign: 'left', paddingLeft: '14px', fontSize: '0.85rem' }}>
                  TOTAL RECEIVED AMOUNT (in Additional)
                </td>
                <td style={{ textAlign: 'right', paddingRight: '14px', fontFamily: 'monospace' }}>
                  {receivedAdditional !== '' && parseFloat(receivedAdditional) > 0 ? `₹ ${Number(receivedAdditional).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹ -'}
                </td>
              </tr>

              {/* Received Quoted */}
              <tr>
                <td style={{ textAlign: 'center', fontSize: '0.85rem' }}>5</td>
                <td style={{ textAlign: 'left', paddingLeft: '14px', fontSize: '0.85rem' }}>
                  TOTAL RECEIVED AMOUNT (in Quoted)
                </td>
                <td style={{ textAlign: 'right', paddingRight: '14px', fontFamily: 'monospace' }}>
                  ₹ {Number(receivedQuoted || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>

              {/* Site Expenses Added */}
              {siteExpensesTotal > 0 && (
                <tr style={{ backgroundColor: '#fffbeb' }}>
                  <td style={{ textAlign: 'center', fontWeight: 700, color: '#92400e' }}>•</td>
                  <td style={{ textAlign: 'left', paddingLeft: '14px', fontSize: '0.85rem', fontWeight: 700, color: '#92400e' }}>
                    EXPENSES ADDED (Admin App / Site Live)
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: '14px', fontWeight: 800, fontFamily: 'monospace', color: '#92400e' }}>
                    ₹ {Number(siteExpensesTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              )}

              {/* To Pay from client */}
              <tr>
                <td style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 600 }}>6</td>
                <td style={{ textAlign: 'left', paddingLeft: '14px', fontSize: '0.85rem', fontWeight: 600 }}>
                  AS PER STAGE AMOUNT INCLD. ADDITIONAL WORK BILL (To Pay from client) {settlementDate ? `AS ON ${settlementDate}` : ''}
                </td>
                <td style={{ textAlign: 'right', paddingRight: '14px', fontWeight: 800, fontFamily: 'monospace' }}>
                  ₹ {Number(grossTotalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>

              {/* Balance Amount (Blue row) */}
              <tr className="print-blue-row">
                <td style={{ textAlign: 'center', fontWeight: 800 }}>7</td>
                <td style={{ textAlign: 'left', paddingLeft: '14px', fontWeight: 800 }}>
                  BALANCE AMOUNT {settlementDate ? `AS ON ${settlementDate}` : ''}
                </td>
                <td style={{ textAlign: 'right', paddingRight: '14px', fontWeight: 800, fontFamily: 'monospace' }}>
                  ₹ {Number(balanceAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>

              {/* Net Balance Amount (Light Green row) */}
              <tr className="print-lightgreen-row">
                <td style={{ textAlign: 'center', fontWeight: 800 }}>8</td>
                <td style={{ textAlign: 'left', paddingLeft: '14px', fontWeight: 800 }}>
                  NET BALANCE AMOUNT {settlementDate ? `AS ON ${settlementDate}` : ''}
                </td>
                <td style={{ textAlign: 'right', paddingRight: '14px', fontWeight: 800, fontFamily: 'monospace' }}>
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
