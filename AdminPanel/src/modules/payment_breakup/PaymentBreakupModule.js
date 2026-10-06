import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Calculator,
  Plus,
  Save,
  Trash2,
  FileSpreadsheet,
  FileText,
  Printer,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Building,
  User,
  MapPin,
  TrendingUp,
  Layers,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import MetricCard from '../../components/common/MetricCard/MetricCard';
import Modal from '../../components/common/Modal/Modal';
import './PaymentBreakupModule.css';

export default function PaymentBreakupModule() {
  const {
    sites = [],
    paymentBreakups = [],
    savePaymentBreakup,
    DEFAULT_PAYMENT_BREAKUP_STAGES = [],
    exportToXLS,
    exportToPDF
  } = useApp();

  // Registered site names fallback
  const siteList = useMemo(() => {
    const list = Array.from(new Set([
      ...(sites || []).map(s => s.site_name || s.name || s.title).filter(Boolean),
      "Skyline Residency",
      "Modern Minimalist Villa - Perundurai",
      "Grand Emerald Commercial Hub",
      "Heritage Home Renovation"
    ]));
    return list;
  }, [sites]);

  const [selectedSite, setSelectedSite] = useState(() => siteList[0] || 'Skyline Residency');
  const [floorTitle, setFloorTitle] = useState('GROUND FLOOR');
  const [milestones, setMilestones] = useState([]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Helper to create blank 10-milestone template (Amount & Work Schedule empty)
  const getBlankDefaultMilestones = useCallback(() => {
    const base = (DEFAULT_PAYMENT_BREAKUP_STAGES && DEFAULT_PAYMENT_BREAKUP_STAGES.length > 0)
      ? DEFAULT_PAYMENT_BREAKUP_STAGES
      : [
          { sno: 1, stage_name: "MOBILIZATION ADVANCE (16%)", amount: "", work_schedule: "" },
          { sno: 2, stage_name: "ON COMPLETION OF BASEMENT", amount: "", work_schedule: "" },
          { sno: 3, stage_name: "ON COMPLETION OF 7' LINTEL LEVEL RCC WORK", amount: "", work_schedule: "" },
          { sno: 4, stage_name: "ON COMPLETION OF GROUND FLOOR ROOF CONCRETE", amount: "", work_schedule: "" },
          { sno: 5, stage_name: "ON COMPLETION OF MEP CONCEALED WORK", amount: "", work_schedule: "" },
          { sno: 6, stage_name: "ON COMPLETION OF WALL PLASTERING", amount: "", work_schedule: "" },
          { sno: 7, stage_name: "ON COMPLETION OF TILE LAYING", amount: "", work_schedule: "" },
          { sno: 8, stage_name: "ON COMPLETION OF UPVC WINDOW & DOOR FIXING", amount: "", work_schedule: "" },
          { sno: 9, stage_name: "ON COMPLETION OF INTERIOR WALL PAINTING", amount: "", work_schedule: "" },
          { sno: 10, stage_name: "ON COMPLETION OF ALL FINISHING WORKS", amount: "", work_schedule: "" }
        ];

    return base.map((item, index) => ({
      id: `stage_${index + 1}`,
      sno: index + 1,
      stage_name: item.stage_name,
      amount: "", // Kept blank - admin needs to edit it
      work_schedule: "" // Kept blank - admin needs to edit it
    }));
  }, [DEFAULT_PAYMENT_BREAKUP_STAGES]);

  // Load existing breakup when site changes or when paymentBreakups load
  useEffect(() => {
    if (!selectedSite) return;
    const existing = paymentBreakups.find(b => b.site_name === selectedSite || b.id === selectedSite);

    if (existing && Array.isArray(existing.milestones) && existing.milestones.length > 0) {
      setMilestones(existing.milestones);
      setFloorTitle(existing.floor_title || 'GROUND FLOOR');
    } else {
      setMilestones(getBlankDefaultMilestones());
      setFloorTitle('GROUND FLOOR');
    }
  }, [selectedSite, paymentBreakups, getBlankDefaultMilestones]);

  // Current selected site object for metadata
  const currentSiteMeta = useMemo(() => {
    return (sites || []).find(s => (s.site_name || s.name || s.title) === selectedSite) || null;
  }, [sites, selectedSite]);

  // Calculations
  const totalAmount = useMemo(() => {
    return milestones.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [milestones]);

  const scheduledCount = useMemo(() => {
    return milestones.filter(m => m.work_schedule && String(m.work_schedule).trim() !== '').length;
  }, [milestones]);

  const filledAmountsCount = useMemo(() => {
    return milestones.filter(m => m.amount !== '' && m.amount !== null && !isNaN(Number(m.amount)) && Number(m.amount) > 0).length;
  }, [milestones]);

  // Handle Input Changes
  const handleStageFieldChange = (index, field, value) => {
    setMilestones(prev => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: value
      };
      return next;
    });
  };

  // Add new milestone row
  const handleAddMilestone = () => {
    setMilestones(prev => [
      ...prev,
      {
        id: `stage_${Date.now()}`,
        sno: prev.length + 1,
        stage_name: `ON COMPLETION OF STAGE ${prev.length + 1}`,
        amount: "",
        work_schedule: ""
      }
    ]);
  };

  // Delete milestone row
  const handleDeleteMilestone = (index) => {
    if (milestones.length <= 1) {
      alert("At least one milestone row is required.");
      return;
    }
    setMilestones(prev => {
      const next = prev.filter((_, i) => i !== index);
      // Re-assign S.NO sequentially
      return next.map((item, i) => ({ ...item, sno: i + 1 }));
    });
  };

  // Reset to default 10 blank fields
  const handleResetToDefault = () => {
    if (window.confirm("Are you sure you want to reset this site's payment breakup to the default blank 10-stage schedule? Any unsaved edits will be cleared.")) {
      setMilestones(getBlankDefaultMilestones());
      setFloorTitle('GROUND FLOOR');
    }
  };

  // Save breakup to Firebase & Context
  const handleSaveBreakup = async () => {
    setIsSaving(true);
    try {
      const payload = {
        id: selectedSite,
        site_name: selectedSite,
        floor_title: floorTitle,
        milestones: milestones,
        total_amount: totalAmount,
        milestones_count: milestones.length,
        scheduled_count: scheduledCount
      };

      await savePaymentBreakup(payload);
      setSaveSuccessMsg(`Payment breakup for "${selectedSite}" saved successfully!`);
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      alert("Error saving payment breakup. Please check console.");
    } finally {
      setIsSaving(false);
    }
  };

  // Format currency in Indian standard
  const formatCurrency = (val) => {
    const num = Number(val);
    if (isNaN(num) || num === 0) return '0.00';
    return num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Export to Excel
  const handleExportXLS = () => {
    const exportRows = milestones.map(m => ({
      sno: m.sno,
      stage_name: m.stage_name,
      amount: m.amount !== "" ? Number(m.amount) : 0,
      work_schedule: m.work_schedule || "Pending Schedule"
    }));

    // Add total row
    exportRows.push({
      sno: '',
      stage_name: 'TOTAL',
      amount: totalAmount,
      work_schedule: ''
    });

    const filename = `Yeloline_Payment_Breakup_${selectedSite.replace(/\s+/g, '_')}`;
    exportToXLS(exportRows, filename, `Payment Breakup - ${selectedSite}`);
  };

  // Export to PDF
  const handleExportPDF = () => {
    const exportRows = milestones.map(m => ({
      sno: m.sno,
      stage_name: m.stage_name,
      amount: m.amount !== "" ? `₹ ${formatCurrency(m.amount)}` : "—",
      work_schedule: m.work_schedule || "—"
    }));

    exportRows.push({
      sno: '',
      stage_name: 'TOTAL',
      amount: `₹ ${formatCurrency(totalAmount)}`,
      work_schedule: ''
    });

    const exportCols = [
      { key: "sno", label: "S.NO" },
      { key: "stage_name", label: "DESCRIPTION OF WORK" },
      { key: "amount", label: "AMOUNT" },
      { key: "work_schedule", label: "WORK SCHEDULE" }
    ];

    const filename = `Yeloline_Payment_Breakup_${selectedSite.replace(/\s+/g, '_')}`;
    exportToPDF(exportRows, filename, `Payment Breakup Schedule: ${selectedSite}`, exportCols);
  };

  return (
    <div className="payment-breakup-container">
      {/* Header Bar */}
      <div className="payment-breakup-header">
        <div>
          <h1 className="payment-breakup-title">Payment Breakup & Milestone Schedule</h1>
          <p className="payment-breakup-subtitle">
            Configure construction milestone payment breakup, work schedules, and stage amounts for each project site
          </p>
        </div>

        <div className="header-action-group">
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleExportXLS}
            title="Export to Microsoft Excel"
          >
            <FileSpreadsheet size={16} /> Export XLS
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={handleExportPDF}
            title="Download PDF Schedule"
          >
            <FileText size={16} /> Export PDF
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsPrintModalOpen(true)}
            title="Preview Printable Document"
          >
            <Printer size={16} /> Official Document
          </button>

          <button
            type="button"
            className="btn btn-primary save-btn"
            onClick={handleSaveBreakup}
            disabled={isSaving}
          >
            <Save size={16} /> {isSaving ? 'Saving...' : 'Save Breakup'}
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {saveSuccessMsg && (
        <div className="breakup-success-banner">
          <CheckCircle2 size={18} />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Site Selector & Project Info Strip */}
      <div className="breakup-site-selector-card">
        <div className="site-select-wrapper">
          <label className="selector-label">
            <Building size={16} /> Select Site / Project:
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

        {currentSiteMeta && (
          <div className="site-meta-badges">
            {currentSiteMeta.client_name && (
              <span className="site-badge">
                <User size={13} /> Client: <strong>{currentSiteMeta.client_name}</strong>
              </span>
            )}
            {currentSiteMeta.location && (
              <span className="site-badge">
                <MapPin size={13} /> {currentSiteMeta.location}
              </span>
            )}
            {currentSiteMeta.estimated_budget && (
              <span className="site-badge budget-badge">
                Budget: <strong>₹ {Number(currentSiteMeta.estimated_budget).toLocaleString('en-IN')}</strong>
              </span>
            )}
            {currentSiteMeta.structure_type && (
              <span className="site-badge">
                <Layers size={13} /> {currentSiteMeta.structure_type}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Metric Cards Row */}
      <div className="metrics-grid">
        <MetricCard
          title="TOTAL CONTRACT BREAKUP"
          value={`₹ ${formatCurrency(totalAmount)}`}
          icon={Calculator}
          subtext="Dynamic sum of all milestone stages"
          highlight
        />

        <MetricCard
          title="ESTIMATED SITE BUDGET"
          value={currentSiteMeta?.estimated_budget ? `₹ ${Number(currentSiteMeta.estimated_budget).toLocaleString('en-IN')}` : 'Not Specified'}
          icon={TrendingUp}
          subtext={
            currentSiteMeta?.estimated_budget && totalAmount > 0
              ? `${((totalAmount / Number(currentSiteMeta.estimated_budget)) * 100).toFixed(1)}% of estimated budget allocated`
              : "Reference from Site details"
          }
        />

        <MetricCard
          title="TOTAL MILESTONES"
          value={`${milestones.length} Stages`}
          icon={Layers}
          subtext={`${filledAmountsCount} of ${milestones.length} stages have amounts entered`}
        />

        <MetricCard
          title="SCHEDULED MILESTONES"
          value={`${scheduledCount} / ${milestones.length}`}
          icon={Calendar}
          subtext={`${milestones.length - scheduledCount} milestones awaiting target dates`}
        />
      </div>

      {/* Main Payment Breakup Table Card */}
      <div className="breakup-table-card">
        <div className="table-card-toolbar">
          <div className="table-toolbar-left">
            <div className="floor-title-edit-group">
              <span className="toolbar-section-label">Section / Floor Header:</span>
              <input
                type="text"
                className="floor-title-input"
                value={floorTitle}
                onChange={(e) => setFloorTitle(e.target.value.toUpperCase())}
                placeholder="e.g. GROUND FLOOR"
              />
            </div>
            <span className="blank-notice-pill">
              <Info size={13} /> Default amounts & work schedules are blank for custom entry
            </span>
          </div>

          <div className="table-toolbar-right">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleResetToDefault}
              title="Reset to 10 standard blank stages"
            >
              <RotateCcw size={14} /> Reset Blank Template
            </button>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleAddMilestone}
              title="Add a new custom milestone row"
            >
              <Plus size={14} /> Add Stage
            </button>
          </div>
        </div>

        {/* The Exact Table matching Image 2 */}
        <div className="breakup-table-wrapper">
          <table className="breakup-table">
            <thead>
              <tr>
                <th className="col-sno">S.NO</th>
                <th className="col-desc">DESCRIPTION OF WORK</th>
                <th className="col-amount">AMOUNT (₹)</th>
                <th className="col-schedule">WORK SCHEDULE</th>
                <th className="col-percent">% SHARE</th>
                <th className="col-actions">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {/* Floor Group Subheader Row */}
              <tr className="floor-group-row">
                <td colSpan={6}>
                  <div className="floor-group-cell">
                    <strong>{floorTitle || 'GROUND FLOOR'}</strong>
                  </div>
                </td>
              </tr>

              {/* Milestone Rows */}
              {milestones.map((m, index) => {
                const amountNum = Number(m.amount) || 0;
                const percentShare = totalAmount > 0 && amountNum > 0
                  ? ((amountNum / totalAmount) * 100).toFixed(1)
                  : null;

                return (
                  <tr key={m.id || index} className="milestone-row">
                    {/* S.NO */}
                    <td className="col-sno cell-center">
                      <span className="sno-badge">{m.sno}</span>
                    </td>

                    {/* DESCRIPTION OF WORK */}
                    <td className="col-desc">
                      <input
                        type="text"
                        className="cell-input desc-input"
                        value={m.stage_name}
                        onChange={(e) => handleStageFieldChange(index, 'stage_name', e.target.value)}
                        placeholder="Stage description..."
                      />
                    </td>

                    {/* AMOUNT */}
                    <td className="col-amount">
                      <div className="amount-input-container">
                        <span className="currency-prefix">₹</span>
                        <input
                          type="number"
                          step="any"
                          className="cell-input amount-input"
                          value={m.amount}
                          onChange={(e) => handleStageFieldChange(index, 'amount', e.target.value)}
                          placeholder="0.00 (Blank)"
                        />
                      </div>
                    </td>

                    {/* WORK SCHEDULE */}
                    <td className="col-schedule">
                      <div className="schedule-input-container">
                        <Calendar size={14} className="schedule-calendar-icon" />
                        <input
                          type="text"
                          className="cell-input schedule-input"
                          value={m.work_schedule}
                          onChange={(e) => handleStageFieldChange(index, 'work_schedule', e.target.value)}
                          placeholder="e.g. 5-Mar-25 or date..."
                        />
                      </div>
                    </td>

                    {/* % SHARE */}
                    <td className="col-percent cell-center">
                      {percentShare ? (
                        <span className="share-pill">{percentShare}%</span>
                      ) : (
                        <span className="share-empty">—</span>
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td className="col-actions cell-center">
                      <button
                        type="button"
                        className="delete-row-btn"
                        onClick={() => handleDeleteMilestone(index)}
                        title="Remove milestone"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Total Footer Row */}
            <tfoot>
              <tr className="total-footer-row">
                <td className="cell-center"></td>
                <td className="total-label-cell">
                  <strong>TOTAL</strong>
                </td>
                <td className="total-amount-cell">
                  <strong>₹ {formatCurrency(totalAmount)}</strong>
                </td>
                <td className="total-schedule-cell">
                  <span className="schedule-summary-badge">
                    {scheduledCount} of {milestones.length} Scheduled
                  </span>
                </td>
                <td className="total-percent-cell cell-center">
                  <strong>{totalAmount > 0 ? '100%' : '0%'}</strong>
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer Actions & Save Bar */}
        <div className="breakup-card-footer">
          <div className="footer-info">
            <span>Tip: Enter amounts and work schedule dates. All calculations update automatically. Click "Save Breakup" to save your changes to the cloud.</span>
          </div>
          <div className="footer-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleResetToDefault}
            >
              Reset
            </button>
            <button
              type="button"
              className="btn btn-primary save-btn-footer"
              onClick={handleSaveBreakup}
              disabled={isSaving}
            >
              <Save size={16} /> {isSaving ? 'Saving...' : 'Save Payment Breakup'}
            </button>
          </div>
        </div>
      </div>

      {/* Official Document Print / Preview Modal (Matches Image 2) */}
      <Modal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title={`Official Payment Breakup Schedule - ${selectedSite}`}
        maxWidth="820px"
      >
        <div className="official-document-sheet" id="printable-payment-breakup">
          {/* Header */}
          <div className="document-header">
            <div className="doc-brand">
              <h2>YELOLINE CONSTRUCTIONS</h2>
              <p>Milestone Payment & Work Schedule Breakup</p>
            </div>
            <div className="doc-meta">
              <div><strong>Site:</strong> {selectedSite}</div>
              {currentSiteMeta?.client_name && (
                <div><strong>Client:</strong> {currentSiteMeta.client_name}</div>
              )}
              {currentSiteMeta?.location && (
                <div><strong>Location:</strong> {currentSiteMeta.location}</div>
              )}
              <div><strong>Generated Date:</strong> {new Date().toLocaleDateString('en-GB')}</div>
            </div>
          </div>

          {/* Table matching Image 2 */}
          <table className="official-print-table">
            <thead>
              <tr>
                <th style={{ width: '8%' }}>S.NO</th>
                <th style={{ width: '54%' }}>DESCRIPTION OF WORK</th>
                <th style={{ width: '20%', textAlign: 'right' }}>AMOUNT</th>
                <th style={{ width: '18%', textAlign: 'center' }}>WORK SCHEDULE</th>
              </tr>
            </thead>
            <tbody>
              {/* Floor subheader */}
              <tr className="doc-floor-header-row">
                <td></td>
                <td colSpan={3}>
                  <strong>{floorTitle || 'GROUND FLOOR'}</strong>
                </td>
              </tr>

              {/* Rows */}
              {milestones.map((m) => (
                <tr key={m.id || m.sno}>
                  <td style={{ textAlign: 'center' }}>{m.sno}</td>
                  <td>{m.stage_name}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>
                    {m.amount !== "" && !isNaN(Number(m.amount))
                      ? Number(m.amount).toFixed(2)
                      : "—"}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {m.work_schedule || "—"}
                  </td>
                </tr>
              ))}

              {/* Total Row */}
              <tr className="doc-total-row">
                <td></td>
                <td style={{ fontWeight: 800 }}>TOTAL</td>
                <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 800 }}>
                  {totalAmount.toFixed(2)}
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>

          {/* Document Sign-off Footer */}
          <div className="doc-signoff-row">
            <div className="signoff-box">
              <div className="sign-line" />
              <span>Prepared By (Yeloline Admin)</span>
            </div>
            <div className="signoff-box">
              <div className="sign-line" />
              <span>Client Acceptance & Signature</span>
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
            <Printer size={16} /> Print / Save as PDF
          </button>
        </div>
      </Modal>
    </div>
  );
}
