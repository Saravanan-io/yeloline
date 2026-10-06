import React, { useState } from 'react';
import {
  Plus,
  CreditCard,
  Printer,
  Filter,
  FileSpreadsheet,
  FileText,
  MapPin,
  Calendar,
  Wallet,
  Building,
  User,
  Trash2,
  CheckCircle,
  Hash,
  Edit3
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import DataTable from '../../components/common/DataTable/DataTable';
import Modal from '../../components/common/Modal/Modal';
import MetricCard from '../../components/common/MetricCard/MetricCard';
import CustomSelect from '../../components/common/CustomSelect/CustomSelect';
import CSVImportModal from '../../components/common/CSVImportModal/CSVImportModal';
import './ClientPaymentsModule.css';

const DEFAULT_SITES = [
  "Skyline Residency",
  "Modern Minimalist Villa - Perundurai",
  "Grand Emerald Commercial Hub",
  "Heritage Home Renovation"
];

const PAYMENT_MODES = ["Cash", "GPay", "Bank"];
const ENTERED_BY_OPTIONS = ["Suriya prakash", "Bala"];

const PAYMENT_COLUMNS_SPEC = [
  { key: "payment_id", label: "Payment ID", type: "String", required: true, example: "PAY-701" },
  { key: "site_name", label: "Select Site", type: "String", required: true, example: "Skyline Residency" },
  { key: "payment_date", label: "Date", type: "Date", required: true, example: "2026-01-24" },
  { key: "amount_received", label: "Amount Received (₹)", type: "Number", required: true, example: "1500000" },
  { key: "payment_mode", label: "Payment Mode", type: "String", required: true, example: "Bank" },
  { key: "transaction_reference", label: "Reference Number", type: "String", required: false, example: "HDFC9823104921" },
  { key: "notes", label: "Notes", type: "String", required: false, example: "Plinth beam milestone payment" },
  { key: "entered_by", label: "Entered By", type: "String", required: true, example: "Suriya prakash" }
];

const SAMPLE_PAYMENT_ROW = {
  payment_id: "PAY-701",
  site_name: "Skyline Residency",
  payment_date: "2026-01-24",
  amount_received: 1500000,
  payment_mode: "Bank",
  transaction_reference: "HDFC9823104921",
  notes: "Plinth beam milestone payment",
  entered_by: "Suriya prakash"
};

export default function ClientPaymentsModule() {
  const {
    payments = [],
    sites = [],
    addPayment,
    deletePayment,
    importPayments,
    exportToXLS,
    exportToPDF
  } = useApp();

  const [selectedSiteFilter, setSelectedSiteFilter] = useState('ALL');
  const [selectedModeFilter, setSelectedModeFilter] = useState('ALL');
  const [selectedEnteredByFilter, setSelectedEnteredByFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [receiptPreviewPayment, setReceiptPreviewPayment] = useState(null);

  // Extracted registered site names or fall back to defaults
  const allSitesList = Array.from(new Set([
    ...DEFAULT_SITES,
    ...(sites || []).map(s => s.name || s.title || s.site_name).filter(Boolean)
  ]));

  const [formData, setFormData] = useState({
    site_name: 'Skyline Residency',
    payment_date: new Date().toISOString().split('T')[0],
    amount_received: '',
    payment_mode: 'Cash',
    transaction_reference: '',
    notes: '',
    entered_by: 'Suriya prakash'
  });

  const filteredPayments = payments.filter(p => {
    const matchesSite = selectedSiteFilter === 'ALL' || (p.site_name || p.project_name || 'Skyline Residency') === selectedSiteFilter;
    const matchesMode = selectedModeFilter === 'ALL' || (p.payment_mode || p.payment_method) === selectedModeFilter;
    const matchesEnteredBy = selectedEnteredByFilter === 'ALL' || (p.entered_by || 'Suriya prakash') === selectedEnteredByFilter;
    return matchesSite && matchesMode && matchesEnteredBy;
  });

  const totalCollected = filteredPayments.reduce((acc, p) => acc + Number(p.amount_received || 0), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    addPayment({
      ...formData,
      amount_received: Number(formData.amount_received || 0)
    });
    setIsModalOpen(false);
    setFormData({
      site_name: allSitesList[0] || 'Skyline Residency',
      payment_date: new Date().toISOString().split('T')[0],
      amount_received: '',
      payment_mode: 'Cash',
      transaction_reference: '',
      notes: '',
      entered_by: 'Suriya prakash'
    });
  };

  const columns = [
    {
      header: "Payment ID",
      key: "payment_id",
      render: (r) => <span style={{ fontWeight: '700', color: 'var(--accent-yellow-dark)' }}>{r.payment_id}</span>
    },
    {
      header: "Site",
      key: "site_name",
      render: (r) => <strong>{r.site_name || r.project_name || 'Skyline Residency'}</strong>
    },
    {
      header: "Date",
      key: "payment_date"
    },
    {
      header: "Amount Received",
      key: "amount_received",
      render: (r) => <strong style={{ color: 'var(--success-green)' }}>₹{Number(r.amount_received || 0).toLocaleString('en-IN')}</strong>
    },
    {
      header: "Payment Mode",
      key: "payment_mode",
      render: (r) => (
        <span style={{
          backgroundColor: 'var(--primary-yellow-light)',
          color: 'var(--accent-yellow-dark)',
          padding: '3px 8px',
          borderRadius: '4px',
          fontSize: '0.78rem',
          fontWeight: '700'
        }}>
          {r.payment_mode || r.payment_method || 'Cash'}
        </span>
      )
    },
    {
      header: "Reference Number",
      key: "transaction_reference",
      render: (r) => <span style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{r.transaction_reference || '—'}</span>
    },
    {
      header: "Entered By",
      key: "entered_by",
      render: (r) => (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          fontWeight: '700',
          color: 'var(--text-primary)',
          fontSize: '0.82rem'
        }}>
          <User size={13} style={{ color: 'var(--primary-yellow)' }} />
          {r.entered_by || 'Suriya prakash'}
        </span>
      )
    },
    {
      header: "Actions",
      key: "actions",
      render: (r) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            style={{ background: 'var(--primary-yellow-light)', border: 'none', color: 'var(--accent-yellow-dark)', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => setReceiptPreviewPayment(r)}
            title="View Receipt"
          >
            <Printer size={13} /> Receipt
          </button>
          <button
            style={{ background: 'var(--danger-bg)', border: 'none', color: 'var(--danger-red)', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer' }}
            onClick={() => deletePayment(r.payment_id)}
            title="Delete Payment"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="payments-container">
      <div className="leads-header-row">
        <div>
          <h1 className="dashboard-title">Client Payment & Milestone Tracking</h1>
          <p className="dashboard-subtitle">Record construction milestone payments and issue official PDF payment receipts</p>
        </div>
        <div className="header-action-group">
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Record New Payment
          </button>
          <div className="csv-action-group">
            <button
              className="btn-secondary"
              onClick={() => exportToXLS(filteredPayments, 'Yeloline_Client_Payments', 'Client Payment & Milestone Tracking', PAYMENT_COLUMNS_SPEC)}
            >
              <FileSpreadsheet size={16} /> Export XLS
            </button>
            <button
              className="btn-secondary"
              onClick={() => exportToPDF(filteredPayments, 'Yeloline_Client_Payments', 'Client Payment & Milestone Tracking', PAYMENT_COLUMNS_SPEC)}
            >
              <FileText size={16} /> Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stat */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
        <MetricCard
          title="Total Revenue Collected"
          value={`₹${(totalCollected / 100000).toFixed(2)} L`}
          icon={CreditCard}
          subtext="From construction milestone payouts"
          highlight
        />
        <MetricCard
          title="Milestone Receipts Issued"
          value={filteredPayments.length}
          icon={CheckCircle}
          subtext="Verified bank transfers, UPI & Cash"
        />
      </div>

      {/* Filter Bar */}
      <div className="leads-filter-bar" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <CustomSelect
          icon={Filter}
          label="SITE:"
          value={selectedSiteFilter}
          onChange={(val) => setSelectedSiteFilter(val)}
          options={[
            { value: "ALL", label: `All Sites (${payments.length})`, badge: payments.length },
            ...allSitesList.map(s => ({
              value: s,
              label: s,
              badge: payments.filter(p => (p.site_name || p.project_name || 'Skyline Residency') === s).length
            }))
          ]}
        />

        <CustomSelect
          icon={Filter}
          label="Payment Mode:"
          value={selectedModeFilter}
          onChange={(val) => setSelectedModeFilter(val)}
          options={[
            { value: "ALL", label: `All Modes (${payments.length})`, badge: payments.length },
            ...PAYMENT_MODES.map(m => ({
              value: m,
              label: m,
              badge: payments.filter(p => (p.payment_mode || p.payment_method) === m).length
            }))
          ]}
        />

        <CustomSelect
          icon={Filter}
          label="Entered By:"
          value={selectedEnteredByFilter}
          onChange={(val) => setSelectedEnteredByFilter(val)}
          options={[
            { value: "ALL", label: `All Users (${payments.length})`, badge: payments.length },
            ...ENTERED_BY_OPTIONS.map(name => ({
              value: name,
              label: name,
              badge: payments.filter(p => (p.entered_by || 'Suriya prakash') === name).length
            }))
          ]}
        />
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredPayments}
        searchPlaceholder="Search site, client, transaction ref..."
        pageSize={8}
        onRowClick={(row) => setReceiptPreviewPayment(row)}
      />

      {/* Create Payment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Client Milestone Payment"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          
          {/* Select Site */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: '700', fontSize: '0.88rem' }}>Select Site</label>
            <div className="input-with-icon" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <MapPin size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)' }} />
              <select
                className="form-input"
                style={{ paddingLeft: '38px' }}
                value={formData.site_name}
                onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
              >
                {allSitesList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Date */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: '700', fontSize: '0.88rem' }}>Date</label>
            <div className="input-with-icon" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Calendar size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)' }} />
              <input
                type="date"
                required
                className="form-input"
                style={{ paddingLeft: '38px' }}
                value={formData.payment_date}
                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
              />
            </div>
          </div>

          {/* Amount Received (₹) */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: '700', fontSize: '0.88rem' }}>Amount Received (₹)</label>
            <div className="input-with-icon" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '14px', fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>₹</span>
              <input
                type="number"
                required
                placeholder="Enter amount received"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                value={formData.amount_received}
                onChange={(e) => setFormData({ ...formData, amount_received: e.target.value })}
              />
            </div>
          </div>

          {/* Payment Mode (Segmented Buttons) */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: '700', fontSize: '0.88rem' }}>Payment Mode</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
              {PAYMENT_MODES.map(mode => {
                const isSelected = formData.payment_mode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setFormData({ ...formData, payment_mode: mode })}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid var(--primary-yellow)' : '1px solid var(--light-border)',
                      backgroundColor: isSelected ? 'var(--dark-navy, #182b49)' : 'var(--light-background)',
                      color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                      fontWeight: '700',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {mode === 'Cash' && <span>💵 Cash</span>}
                    {mode === 'GPay' && <span>📱 GPay</span>}
                    {mode === 'Bank' && <span>🏦 Bank</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reference Number */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: '700', fontSize: '0.88rem' }}>Reference Number</label>
            <div className="input-with-icon" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Hash size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="Enter Receipt / Voucher No."
                className="form-input"
                style={{ paddingLeft: '38px' }}
                value={formData.transaction_reference}
                onChange={(e) => setFormData({ ...formData, transaction_reference: e.target.value })}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: '700', fontSize: '0.88rem' }}>Notes</label>
            <div className="input-with-icon" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Edit3 size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="Enter note"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          {/* Entered By */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: '700', fontSize: '0.88rem' }}>Entered By</label>
            <div className="input-with-icon" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)' }} />
              <select
                className="form-input"
                style={{ paddingLeft: '38px' }}
                value={formData.entered_by}
                onChange={(e) => setFormData({ ...formData, entered_by: e.target.value })}
              >
                {ENTERED_BY_OPTIONS.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Record Payment
            </button>
          </div>
        </form>
      </Modal>

      {/* Payment Receipt PDF Preview Modal */}
      {receiptPreviewPayment && (
        <Modal
          isOpen={!!receiptPreviewPayment}
          onClose={() => setReceiptPreviewPayment(null)}
          title={`Official Payment Receipt - ${receiptPreviewPayment.payment_id}`}
        >
          <div className="receipt-modal-preview">
            <div className="receipt-header">
              <div>
                <strong style={{ fontSize: '1.2rem', color: 'var(--accent-yellow-dark)' }}>YELOLINE CONSTRUCTION</strong>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Official Milestone Payment Receipt</div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <div>Receipt #: {receiptPreviewPayment.payment_id}</div>
                <div>Date: {receiptPreviewPayment.payment_date}</div>
              </div>
            </div>

            <div className="receipt-row">
              <span className="form-label">Site Name:</span>
              <strong>{receiptPreviewPayment.site_name || receiptPreviewPayment.project_name}</strong>
            </div>
            <div className="receipt-row">
              <span className="form-label">Payment Mode:</span>
              <span>{receiptPreviewPayment.payment_mode || receiptPreviewPayment.payment_method}</span>
            </div>
            <div className="receipt-row">
              <span className="form-label">Reference Number:</span>
              <span>{receiptPreviewPayment.transaction_reference || 'N/A'}</span>
            </div>
            <div className="receipt-row">
              <span className="form-label">Entered By:</span>
              <span>👤 {receiptPreviewPayment.entered_by || 'Suriya prakash'}</span>
            </div>
            <div className="receipt-row">
              <span className="form-label">Notes:</span>
              <span>{receiptPreviewPayment.notes || 'N/A'}</span>
            </div>
            <div className="receipt-row" style={{ fontSize: '1.1rem', marginTop: '8px', borderBottom: 'none' }}>
              <strong>Amount Received:</strong>
              <strong style={{ color: 'var(--success-green)' }}>₹{Number(receiptPreviewPayment.amount_received || 0).toLocaleString('en-IN')}</strong>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                className="btn-primary"
                onClick={() => {
                  window.print();
                }}
              >
                <Printer size={16} /> Print / Save PDF
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* CSV Import Modal */}
      {isImportModalOpen && (
        <CSVImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          title="Import Client Milestone Payments CSV"
          moduleName="Client Payments"
          compulsoryColumns={PAYMENT_COLUMNS_SPEC}
          sampleRow={SAMPLE_PAYMENT_ROW}
          onImport={(data) => importPayments(data)}
        />
      )}
    </div>
  );
}
