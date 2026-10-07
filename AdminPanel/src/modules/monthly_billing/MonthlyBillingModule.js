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
  Calculator
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import MetricCard from '../../components/common/MetricCard/MetricCard';
import Modal from '../../components/common/Modal/Modal';
import './MonthlyBillingModule.css';

export default function MonthlyBillingModule() {
  const {
    sites = [],
    monthlyBillings = [],
    saveMonthlyBilling,
    DEFAULT_MONTHLY_BILLING_AREAS = [],
    DEFAULT_MONTHLY_BILLING_AMENITIES = [],
    exportToXLS,
    exportToPDF
  } = useApp();

  const siteList = useMemo(() => {
    return Array.from(new Set(
      (sites || []).map(s => s.site_name || s.name || s.title).filter(Boolean)
    ));
  }, [sites]);

  const [selectedSite, setSelectedSite] = useState(() => siteList[0] || '');

  useEffect(() => {
    if (siteList.length > 0 && (!selectedSite || !siteList.includes(selectedSite))) {
      setSelectedSite(siteList[0]);
    }
  }, [siteList, selectedSite]);

  // Header meta information
  const [clientTitle, setClientTitle] = useState('');
  const [statementSubtitle, setStatementSubtitle] = useState('');
  const [billDate, setBillDate] = useState('');
  const [settlementDate, setSettlementDate] = useState('');

  // Table 1: Area Valuation Rows
  const [areaItems, setAreaItems] = useState([]);

  // Table 2: Amenities / Additional Items Rows
  const [amenityItems, setAmenityItems] = useState([]);

  // Financial reconciliation fields
  const [additionalWorkBill, setAdditionalWorkBill] = useState(0);
  const [receivedAdditional, setReceivedAdditional] = useState(0);
  const [receivedQuoted, setReceivedQuoted] = useState(0);
  const [netBalanceManual, setNetBalanceManual] = useState(0);

  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Default Template Loader
  const getInitialAreaItems = useCallback(() => {
    return (DEFAULT_MONTHLY_BILLING_AREAS && DEFAULT_MONTHLY_BILLING_AREAS.length > 0)
      ? DEFAULT_MONTHLY_BILLING_AREAS
      : [];
  }, [DEFAULT_MONTHLY_BILLING_AREAS]);

  const getInitialAmenityItems = useCallback(() => {
    return (DEFAULT_MONTHLY_BILLING_AMENITIES && DEFAULT_MONTHLY_BILLING_AMENITIES.length > 0)
      ? DEFAULT_MONTHLY_BILLING_AMENITIES
      : [];
  }, [DEFAULT_MONTHLY_BILLING_AMENITIES]);

  // Load existing billing for selected site or set default
  useEffect(() => {
    if (!selectedSite) return;
    const existing = monthlyBillings.find(b => b.site_name === selectedSite || b.id === selectedSite);

    if (existing) {
      setClientTitle(existing.client_title || '');
      setStatementSubtitle(existing.statement_subtitle || '');
      setBillDate(existing.bill_date || '');
      setSettlementDate(existing.settlement_date || '');
      if (Array.isArray(existing.area_items)) setAreaItems(existing.area_items);
      if (Array.isArray(existing.amenity_items)) setAmenityItems(existing.amenity_items);
      setAdditionalWorkBill(Number(existing.additional_work_bill ?? 0));
      setReceivedAdditional(Number(existing.received_additional ?? 0));
      setReceivedQuoted(Number(existing.received_quoted ?? 0));
      setNetBalanceManual(Number(existing.net_balance ?? 0));
    } else {
      setClientTitle('');
      setStatementSubtitle('');
      setBillDate('');
      setSettlementDate('');
      setAreaItems(getInitialAreaItems());
      setAmenityItems(getInitialAmenityItems());
      setAdditionalWorkBill(0);
      setReceivedAdditional(0);
      setReceivedQuoted(0);
      setNetBalanceManual(0);
    }
  }, [selectedSite, monthlyBillings, getInitialAreaItems, getInitialAmenityItems]);

  // Calculations
  const totalBuiltupArea = useMemo(() => {
    return areaItems.reduce((acc, curr) => acc + (Number(curr.area_sqft) || 0), 0);
  }, [areaItems]);

  const totalBuiltupCost = useMemo(() => {
    return areaItems.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [areaItems]);

  const averageBuiltupRate = useMemo(() => {
    if (totalBuiltupArea === 0) return 0;
    return Math.round(totalBuiltupCost / totalBuiltupArea);
  }, [totalBuiltupCost, totalBuiltupArea]);

  const totalAmenitiesCost = useMemo(() => {
    return amenityItems.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [amenityItems]);

  const mainStructureTotal = useMemo(() => {
    return totalBuiltupCost + totalAmenitiesCost;
  }, [totalBuiltupCost, totalAmenitiesCost]);

  const grossTotalAmount = useMemo(() => {
    return mainStructureTotal + Number(additionalWorkBill || 0);
  }, [mainStructureTotal, additionalWorkBill]);

  const totalReceivedCombined = useMemo(() => {
    return Number(receivedAdditional || 0) + Number(receivedQuoted || 0);
  }, [receivedAdditional, receivedQuoted]);

  const balanceAmount = useMemo(() => {
    return grossTotalAmount - totalReceivedCombined;
  }, [grossTotalAmount, totalReceivedCombined]);

  // Handle Area Rows Changes
  const handleAreaChange = (index, field, value) => {
    setAreaItems(prev => {
      const next = [...prev];
      const updated = { ...next[index], [field]: value };
      if (field === 'area_sqft' || field === 'rate_per_sqft') {
        const area = Number(field === 'area_sqft' ? value : updated.area_sqft) || 0;
        const rate = Number(field === 'rate_per_sqft' ? value : updated.rate_per_sqft) || 0;
        updated.amount = Math.round(area * rate);
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
        description: `புதிய தளம் / பகுதி (New Area ${prev.length + 1})`,
        area_sqft: 0,
        rate_per_sqft: 2000,
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
        description: `கூடுதல் வேலை (Extra Amenity ${prev.length + 1})`,
        amount: 0
      }
    ]);
  };

  const handleDeleteAmenityRow = (index) => {
    setAmenityItems(prev => prev.filter((_, i) => i !== index));
  };

  // Format currency in Indian standard
  const formatCurrency = (val) => {
    const num = Number(val);
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
        statement_subtitle: statementSubtitle,
        bill_date: billDate,
        settlement_date: settlementDate,
        area_items: areaItems,
        amenity_items: amenityItems,
        total_builtup_area: totalBuiltupArea,
        total_builtup_cost: totalBuiltupCost,
        average_builtup_rate: averageBuiltupRate,
        main_structure_total: mainStructureTotal,
        additional_work_bill: Number(additionalWorkBill || 0),
        gross_total: grossTotalAmount,
        received_additional: Number(receivedAdditional || 0),
        received_quoted: Number(receivedQuoted || 0),
        total_received: totalReceivedCombined,
        balance_amount: balanceAmount,
        net_balance: Number(netBalanceManual || 0)
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
    exportRows.push({ SNo: '', Description: clientTitle, Area: '', Rate: '', Amount: '' });
    exportRows.push({ SNo: '', Description: statementSubtitle, Area: '', Rate: '', Amount: '' });
    exportRows.push({ SNo: 'வ.எண்', Description: 'விவரம் (Description)', Area: 'பரப்பளவு (Area Sq.Ft.)', Rate: 'சதுர அடி (Rate ₹)', Amount: 'தொகை (Amount ₹)' });

    // Area items
    areaItems.forEach(item => {
      exportRows.push({
        SNo: item.sno,
        Description: item.description,
        Area: `${item.area_sqft} Sft.`,
        Rate: `₹ ${item.rate_per_sqft}`,
        Amount: item.amount
      });
    });

    // Subtotal
    exportRows.push({
      SNo: '',
      Description: 'கட்டிட பரப்பளவு (Total Built-up Area)',
      Area: `${totalBuiltupArea} Sft.`,
      Rate: `₹ ${averageBuiltupRate}/Sft.`,
      Amount: totalBuiltupCost
    });

    // Amenities
    amenityItems.forEach((item, idx) => {
      exportRows.push({
        SNo: areaItems.length + idx + 1,
        Description: item.description,
        Area: '-',
        Rate: '-',
        Amount: item.amount
      });
    });

    // Main Structure Total
    exportRows.push({
      SNo: '',
      Description: 'மொத்தம் (Main Structure Total)',
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
      Amount: additionalWorkBill
    });

    // Gross Total
    exportRows.push({
      SNo: '',
      Description: `மொத்த தொகை (${billDate})`,
      Area: '',
      Rate: '',
      Amount: grossTotalAmount
    });

    // Settlement
    exportRows.push({ SNo: '', Description: 'TOTAL RECEIVED AMOUNT (in Additional)', Area: '', Rate: '', Amount: receivedAdditional || 0 });
    exportRows.push({ SNo: '', Description: 'TOTAL RECEIVED AMOUNT (in Quoted)', Area: '', Rate: '', Amount: receivedQuoted || 0 });
    exportRows.push({ SNo: '', Description: `AS PER STAGE AMOUNT INCLD. ADDITIONAL WORK BILL AS ON ${settlementDate}`, Area: '', Rate: '', Amount: grossTotalAmount });
    exportRows.push({ SNo: '', Description: `BALANCE AMOUNT AS ON ${settlementDate}`, Area: '', Rate: '', Amount: balanceAmount });
    exportRows.push({ SNo: '', Description: `NET BALANCE AMOUNT AS ON ${settlementDate}`, Area: '', Rate: '', Amount: netBalanceManual });

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
        area: `${item.area_sqft} Sft.`,
        rate: `₹${item.rate_per_sqft}`,
        amount: `₹${formatCurrency(item.amount)}`
      });
    });

    exportRows.push({
      sno: '',
      description: 'கட்டிட பரப்பளவு (Built-up Area)',
      area: `${totalBuiltupArea} Sft.`,
      rate: `₹${averageBuiltupRate}/Sft.`,
      amount: `₹${formatCurrency(totalBuiltupCost)}`
    });

    amenityItems.forEach((item, idx) => {
      exportRows.push({
        sno: areaItems.length + idx + 1,
        description: item.description,
        area: '—',
        rate: '—',
        amount: `₹${formatCurrency(item.amount)}`
      });
    });

    exportRows.push({
      sno: '',
      description: 'மொத்தம் (Structure Total)',
      area: '',
      rate: '',
      amount: `₹${formatCurrency(mainStructureTotal)}`
    });

    exportRows.push({
      sno: '',
      description: 'Additional Work Bill',
      area: '',
      rate: '',
      amount: `₹${formatCurrency(additionalWorkBill)}`
    });

    exportRows.push({
      sno: '',
      description: `மொத்த தொகை (${billDate})`,
      area: '',
      rate: '',
      amount: `₹${formatCurrency(grossTotalAmount)}`
    });

    exportRows.push({
      sno: '',
      description: `BALANCE AMOUNT (${settlementDate})`,
      area: '',
      rate: '',
      amount: `₹${formatCurrency(balanceAmount)}`
    });

    const exportCols = [
      { key: "sno", label: "வ.எண்" },
      { key: "description", label: "விவரம் (Description)" },
      { key: "area", label: "பரப்பளவு" },
      { key: "rate", label: "சதுர அடி" },
      { key: "amount", label: "தொகை" }
    ];

    const filename = `Yeloline_Monthly_Billing_${selectedSite.replace(/\s+/g, '_')}`;
    exportToPDF(exportRows, filename, `Monthly Billing & Valuation: ${selectedSite}`, exportCols);
  };

  return (
    <div className="monthly-billing-container">
      {/* Header Bar */}
      <div className="monthly-billing-header">
        <div>
          <h1 className="monthly-billing-title">Monthly Billing & Valuation Statement</h1>
          <p className="monthly-billing-subtitle">
            Customer updates • Itemized built-up area valuation, amenities, additional works, and monthly settlement reconciliation
          </p>
        </div>

        <div className="header-action-group">
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleExportXLS}
            title="Export Statement to Excel"
          >
            <FileSpreadsheet size={16} /> Export XLS
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={handleExportPDF}
            title="Download PDF Statement"
          >
            <FileText size={16} /> Export PDF
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsPrintModalOpen(true)}
            title="Preview and Print Document exactly like Reference"
          >
            <Printer size={16} /> Official Document
          </button>

          <button
            type="button"
            className="btn btn-primary save-btn"
            onClick={handleSaveBilling}
            disabled={isSaving}
          >
            <Save size={16} /> {isSaving ? 'Saving...' : 'Save Monthly Bill'}
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

      {/* Site Selector & Project Info Strip */}
      <div className="monthly-site-selector-card">
        <div className="site-select-wrapper">
          <label className="selector-label">
            <Building size={16} /> Select Site / Client:
          </label>
          <div className="site-select-dropdown">
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="form-select site-dropdown-input"
            >
              {siteList.map(siteName => (
                <option key={siteName} value={siteName}>
                  {siteName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="statement-meta-inputs">
          <div className="meta-input-group">
            <label>Bill Date:</label>
            <input
              type="text"
              className="form-input meta-input"
              value={billDate}
              onChange={(e) => setBillDate(e.target.value)}
              placeholder="e.g. 14.6.2026"
            />
          </div>

          <div className="meta-input-group">
            <label>Settlement Date:</label>
            <input
              type="text"
              className="form-input meta-input"
              value={settlementDate}
              onChange={(e) => setSettlementDate(e.target.value)}
              placeholder="e.g. 25.8.2026"
            />
          </div>
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
          subtext={`₹${(Number(receivedQuoted)/100000).toFixed(2)}L Quoted + ₹${(Number(receivedAdditional)/100000).toFixed(2)}L Addl.`}
        />

        <MetricCard
          title="BALANCE DUE"
          value={`₹ ${formatCurrency(balanceAmount)}`}
          icon={TrendingUp}
          subtext={`As on ${settlementDate} pending clearance`}
        />

        <MetricCard
          title="NET SETTLEMENT"
          value={`₹ ${formatCurrency(netBalanceManual)}`}
          icon={CalendarDays}
          subtext="Final settlement balance amount"
        />
      </div>

      {/* Main Billing Valuation Card (Matching Image 2 Layout) */}
      <div className="monthly-statement-card">
        {/* Document Header Input Strip */}
        <div className="statement-header-box">
          <div className="client-title-edit-wrap">
            <label className="edit-title-label">Client / Residence Title (தலைப்பு):</label>
            <input
              type="text"
              className="client-title-input"
              value={clientTitle}
              onChange={(e) => setClientTitle(e.target.value)}
              placeholder=""
            />
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
                <th className="col-desc">விவரம் (Description)</th>
                <th className="col-area">பரப்பளவு (Area)</th>
                <th className="col-rate">சதுர அடி (₹/Sft)</th>
                <th className="col-amount">தொகை (Amount ₹)</th>
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
                      className="cell-input"
                      value={item.description}
                      onChange={(e) => handleAreaChange(index, 'description', e.target.value)}
                      placeholder="e.g. தரைத்தளம் (Ground Floor)"
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
                      <span className="unit-text">Sft.</span>
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
                      <strong>₹ {formatCurrency(item.amount)}</strong>
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

              {/* Built-up Area Subtotal Row (Peach/Orange background - Image 2) */}
              <tr className="builtup-subtotal-row">
                <td></td>
                <td className="subtotal-label-cell">
                  <strong>கட்டிட பரப்பளவு (Total Built-up Area)</strong>
                </td>
                <td className="subtotal-val-cell subtotal-area-val">
                  <strong>{totalBuiltupArea} Sft.</strong>
                </td>
                <td className="subtotal-val-cell subtotal-rate-val">
                  <strong>₹ {averageBuiltupRate}/Sft.</strong>
                </td>
                <td className="subtotal-amount-cell">
                  <strong>₹ {formatCurrency(totalBuiltupCost)}</strong>
                </td>
                <td className="cell-center">
                  <button
                    type="button"
                    className="add-sub-btn"
                    onClick={handleAddAreaRow}
                    title="Add another area stage"
                  >
                    <Plus size={14} /> Add Area
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
                      className="cell-input"
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
                        className="cell-input num-input"
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

              {/* Amenities Add Row Button */}
              <tr className="amenity-toolbar-row">
                <td colSpan={6} style={{ padding: '6px 14px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleAddAmenityRow}
                  >
                    <Plus size={14} /> Add Extra Work / Amenity (Tank, Sump, etc.)
                  </button>
                </td>
              </tr>

              {/* Main Structure Total Row (Light Green background - Image 2) */}
              <tr className="structure-total-row">
                <td colSpan={2} className="total-title-cell">
                  <strong>மொத்தம் (Main Building Total)</strong>
                </td>
                <td colSpan={2}></td>
                <td className="total-val-cell">
                  <strong>₹ {formatCurrency(mainStructureTotal)}</strong>
                </td>
                <td></td>
              </tr>

              {/* Additional Work Bill Row */}
              <tr className="additional-bill-row">
                <td colSpan={2} className="total-title-cell">
                  <span>Additional Work Bill</span>
                </td>
                <td colSpan={2}></td>
                <td>
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

              {/* Gross Total Amount Row (Yellow background - Image 2) */}
              <tr className="gross-total-row">
                <td colSpan={2} className="total-title-cell">
                  <strong>மொத்த தொகை ({billDate})</strong>
                </td>
                <td colSpan={2}></td>
                <td className="total-val-cell highlight-yellow">
                  <strong>₹ {formatCurrency(grossTotalAmount)}</strong>
                </td>
                <td></td>
              </tr>

              {/* Section 3: Financial Settlements & Payments */}
              <tr className="reconciliation-row">
                <td colSpan={4} className="recon-label-cell">
                  TOTAL RECEIVED AMOUNT (in Additional)
                </td>
                <td>
                  <div className="currency-input-wrap">
                    <span className="currency-symbol">₹</span>
                    <input
                      type="number"
                      step="any"
                      className="cell-input num-input"
                      value={receivedAdditional}
                      onChange={(e) => setReceivedAdditional(e.target.value)}
                      placeholder="0.00 (or leave blank)"
                    />
                  </div>
                </td>
                <td></td>
              </tr>

              <tr className="reconciliation-row">
                <td colSpan={4} className="recon-label-cell">
                  TOTAL RECEIVED AMOUNT (in Quoted)
                </td>
                <td>
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

              <tr className="reconciliation-row">
                <td colSpan={4} className="recon-label-cell">
                  AS PER STAGE AMOUNT INCLD. ADDITIONAL WORK BILL (To Pay from client) AS ON {settlementDate}
                </td>
                <td className="recon-val-cell">
                  <strong>₹ {formatCurrency(grossTotalAmount)}</strong>
                </td>
                <td></td>
              </tr>

              {/* Balance Amount Row (Light Blue background - Image 2) */}
              <tr className="balance-row">
                <td colSpan={4} className="balance-label-cell">
                  <strong>BALANCE AMOUNT AS ON {settlementDate}</strong>
                </td>
                <td className="balance-val-cell">
                  <strong>₹ {formatCurrency(balanceAmount)}</strong>
                </td>
                <td></td>
              </tr>

              {/* Net Balance Amount Row (Light Green background - Image 2) */}
              <tr className="net-balance-row">
                <td colSpan={4} className="net-balance-label-cell">
                  <strong>NET BALANCE AMOUNT AS ON {settlementDate}</strong>
                </td>
                <td>
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
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Card Footer Save Bar */}
        <div className="monthly-card-footer">
          <div className="footer-info">
            <span>Built-up area cost automatically calculates: <code>Area × Rate = Amount</code>. All totals and balances update dynamically.</span>
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

      {/* Official Printable Statement Modal (Exact replica of Image 2) */}
      <Modal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Official Monthly Valuation Statement"
        maxWidth="850px"
      >
        <div className="official-monthly-sheet" id="printable-monthly-billing">
          {/* Header Title Box */}
          <div className="sheet-header-box">
            <h2>{clientTitle}</h2>
            <h3>{statementSubtitle}</h3>
          </div>

          {/* Statement Table Matching Image 2 */}
          <table className="sheet-table">
            <thead>
              <tr>
                <th style={{ width: '8%', textAlign: 'center' }}>வ.எண்</th>
                <th style={{ width: '42%' }}>விவரம்</th>
                <th style={{ width: '16%', textAlign: 'center' }}>பரப்பளவு</th>
                <th style={{ width: '17%', textAlign: 'center' }}>சதுர அடி</th>
                <th style={{ width: '17%', textAlign: 'right' }}>தொகை</th>
              </tr>
            </thead>
            <tbody>
              {/* Area items */}
              {areaItems.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ textAlign: 'center' }}>{item.sno || idx + 1}</td>
                  <td>{item.description}</td>
                  <td style={{ textAlign: 'center' }}>{Number(item.area_sqft).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                    ₹ {Number(item.rate_per_sqft).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>
                    ₹ {Number(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}

              {/* Built-up area subtotal (Peach row) */}
              <tr className="print-peach-row">
                <td></td>
                <td style={{ fontWeight: 800 }}>கட்டிட பரப்பளவு</td>
                <td style={{ textAlign: 'center', fontWeight: 800 }}>{totalBuiltupArea} Sft.</td>
                <td style={{ textAlign: 'center', fontWeight: 800 }}>₹ {averageBuiltupRate}/Sft.</td>
                <td style={{ textAlign: 'right', fontWeight: 800, fontFamily: 'monospace' }}>
                  ₹ {Number(totalBuiltupCost).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>

              {/* Amenities */}
              {amenityItems.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ textAlign: 'center' }}>{item.sno || areaItems.length + idx + 1}</td>
                  <td>{item.description}</td>
                  <td style={{ textAlign: 'center' }}>—</td>
                  <td style={{ textAlign: 'center' }}>—</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>
                    ₹ {Number(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', fontWeight: 600 }}>Additional Work Bill</td>
                <td style={{ textAlign: 'right', fontWeight: 800, fontFamily: 'monospace' }}>
                  ₹ {Number(additionalWorkBill).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>

              {/* Gross Total (Yellow row) */}
              <tr className="print-yellow-row">
                <td colSpan={4} style={{ textAlign: 'center', fontWeight: 800 }}>
                  மொத்த தொகை ({billDate})
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
                  {receivedAdditional > 0 ? `₹ ${Number(receivedAdditional).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹ -'}
                </td>
              </tr>

              {/* Received Quoted */}
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', fontSize: '0.82rem' }}>
                  TOTAL RECEIVED AMOUNT (in Quoted)
                </td>
                <td style={{ textAlign: 'right', fontWeight: 800, fontFamily: 'monospace' }}>
                  ₹ {Number(receivedQuoted).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>

              {/* To Pay from client */}
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 600 }}>
                  AS PER STAGE AMOUNT INCLD. ADDITIONAL WORK BILL (To Pay from client) AS ON {settlementDate}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 800, fontFamily: 'monospace' }}>
                  ₹ {Number(grossTotalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>

              {/* Balance Amount (Blue row) */}
              <tr className="print-blue-row">
                <td colSpan={4} style={{ textAlign: 'center', fontWeight: 800 }}>
                  BALANCE AMOUNT AS ON {settlementDate}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 800, fontFamily: 'monospace' }}>
                  ₹ {Number(balanceAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>

              {/* Net Balance Amount (Light Green row) */}
              <tr className="print-lightgreen-row">
                <td colSpan={4} style={{ textAlign: 'center', fontWeight: 800 }}>
                  NET BALANCE AMOUNT AS ON {settlementDate}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 800, fontFamily: 'monospace' }}>
                  ₹ {Number(netBalanceManual).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
