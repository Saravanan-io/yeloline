import React, { useState, useMemo } from 'react';
import {
  Plus,
  Receipt,
  FileSpreadsheet,
  FileText,
  Filter,
  DollarSign,
  Trash2,
  CheckCircle,
  Edit3,
  Clock,
  Printer,
  Eye
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import DataTable from '../../components/common/DataTable/DataTable';
import Modal from '../../components/common/Modal/Modal';
import MetricCard from '../../components/common/MetricCard/MetricCard';
import StatusBadge from '../../components/common/StatusBadge/StatusBadge';
import './AdditionalBillingModule.css';

const WORK_CATEGORIES = [
  "Structural Variation",
  "Premium Material Upgrade",
  "Additional Electrical & Plumbing",
  "Extra Waterproofing & Roofing",
  "Custom Interior & Woodwork",
  "Site Demolition & Alteration",
  "Labour & Machinery Extra"
];

const BILL_STATUSES = [
  "Pending Approval",
  "Approved",
  "Billed",
  "Paid",
  "Cancelled"
];

const ADDITIONAL_BILLING_COLUMNS_SPEC = [
  { key: "sno", label: "S.No.", type: "Number", required: true, example: 1 },
  { key: "work_description", label: "Description", type: "String", required: true, example: "Extra 2nd floor balcony extension & RCC beam reinforcement" },
  { key: "quoted_amount", label: "Quoted Amount", type: "Number", required: true, example: 150000 },
  { key: "expense_amount", label: "Expense Amount", type: "Number", required: true, example: 125000 },
  { key: "amount", label: "Amount in Rs.", type: "Number", required: true, example: 150000 },
  { key: "site_name", label: "Site Name", type: "String", required: true, example: "Modern Minimalist Villa - Perundurai" },
  { key: "client_name", label: "Client Name", type: "String", required: false, example: "Ramesh Sundaram" },
  { key: "category", label: "Work Category", type: "String", required: true, example: "Structural Variation" },
  { key: "bill_date", label: "Billing Date", type: "Date", required: true, example: "2026-10-06" },
  { key: "status", label: "Status", type: "String", required: true, example: "Approved" }
];

export default function AdditionalBillingModule() {
  const {
    additionalBillings = [],
    sites = [],
    addAdditionalBilling,
    updateAdditionalBilling,
    deleteAdditionalBilling,
    exportToXLS,
    exportToPDF
  } = useApp();

  const [selectedSiteFilter, setSelectedSiteFilter] = useState('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [previewBill, setPreviewBill] = useState(null);

  const siteOptions = Array.from(new Set([
    ...(sites || []).map(s => s.site_name || s.name || s.title).filter(Boolean)
  ]));

  const [formData, setFormData] = useState({
    site_name: '',
    client_name: '',
    category: WORK_CATEGORIES[0],
    work_description: '',
    quoted_amount: '',
    expense_amount: '',
    amount: '', // Amount in Rs.
    bill_date: new Date().toISOString().split('T')[0],
    status: 'Pending Approval',
    notes: ''
  });

  const handleOpenAddModal = () => {
    setEditingBill(null);
    setFormData({
      site_name: siteOptions[0] || '',
      client_name: '',
      category: WORK_CATEGORIES[0],
      work_description: '',
      quoted_amount: '',
      expense_amount: '',
      amount: '',
      bill_date: new Date().toISOString().split('T')[0],
      status: 'Pending Approval',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (bill) => {
    setEditingBill(bill);
    setFormData({
      site_name: bill.site_name || '',
      client_name: bill.client_name || '',
      category: bill.category || WORK_CATEGORIES[0],
      work_description: bill.work_description || '',
      quoted_amount: bill.quoted_amount ?? bill.amount ?? '',
      expense_amount: bill.expense_amount ?? '',
      amount: bill.amount ?? bill.quoted_amount ?? '',
      bill_date: bill.bill_date || new Date().toISOString().split('T')[0],
      status: bill.status || 'Pending Approval',
      notes: bill.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.work_description) {
      alert('Please fill in the description of the additional work');
      return;
    }

    const quoted = Number(formData.quoted_amount) || 0;
    const expense = Number(formData.expense_amount) || 0;
    const finalAmt = Number(formData.amount) || quoted || 0;

    const payload = {
      ...formData,
      quoted_amount: quoted,
      expense_amount: expense,
      amount: finalAmt
    };

    if (editingBill) {
      await updateAdditionalBilling(editingBill.bill_id || editingBill.id, payload);
    } else {
      await addAdditionalBilling(payload);
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (billId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this additional billing record?')) {
      await deleteAdditionalBilling(billId);
    }
  };

  const filteredBillings = additionalBillings.filter(b => {
    const matchesSite = selectedSiteFilter === 'ALL' || b.site_name === selectedSiteFilter;
    const matchesCategory = selectedCategoryFilter === 'ALL' || b.category === selectedCategoryFilter;
    const matchesStatus = selectedStatusFilter === 'ALL' || b.status === selectedStatusFilter;
    return matchesSite && matchesCategory && matchesStatus;
  });

  const enrichedBillings = useMemo(() => {
    return filteredBillings.map((b, idx) => ({
      ...b,
      sno: idx + 1
    }));
  }, [filteredBillings]);

  const totalQuotedValue = filteredBillings.reduce((acc, b) => acc + Number(b.quoted_amount ?? b.amount ?? 0), 0);
  const totalExpenseValue = filteredBillings.reduce((acc, b) => acc + Number(b.expense_amount ?? 0), 0);
  const totalBilledValue = filteredBillings.reduce((acc, b) => acc + Number(b.amount ?? b.quoted_amount ?? 0), 0);
  const totalPaidValue = filteredBillings
    .filter(b => b.status === 'Paid')
    .reduce((acc, b) => acc + Number(b.amount ?? b.quoted_amount ?? 0), 0);

  // Table Columns matching Image 1: S.No., Description, Quoted Amount, Expense Amount, Amount in Rs.
  const tableColumns = [
    {
      header: "S.No.",
      key: "sno",
      width: "70px",
      render: (r, index) => <span className="sno-badge">{r.sno || index + 1}</span>
    },
    {
      header: "Description",
      key: "work_description",
      render: (r) => (
        <div>
          <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            {r.work_description}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--accent-yellow-dark)', fontWeight: '700' }}>{r.bill_id || r.id}</span>
            <span>•</span>
            <span>{r.site_name || 'General Site'}{r.client_name ? ` (${r.client_name})` : ''}</span>
            {r.category && (
              <>
                <span>•</span>
                <span className="category-pill" style={{ padding: '2px 8px', fontSize: '0.72rem' }}>{r.category}</span>
              </>
            )}
          </div>
        </div>
      )
    },
    {
      header: "Quoted Amount",
      key: "quoted_amount",
      render: (r) => (
        <span style={{ fontWeight: '600', color: '#2563EB', whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: '0.92rem' }}>
          ₹{Number(r.quoted_amount ?? r.amount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      )
    },
    {
      header: "Expense Amount",
      key: "expense_amount",
      render: (r) => (
        <span style={{ fontWeight: '600', color: '#DC2626', whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: '0.92rem' }}>
          ₹{Number(r.expense_amount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      )
    },
    {
      header: "Amount in Rs.",
      key: "amount",
      render: (r) => (
        <strong style={{ fontSize: '0.96rem', color: '#0F172A', whiteSpace: 'nowrap', fontWeight: '800', fontFamily: 'monospace' }}>
          ₹{Number(r.amount ?? r.quoted_amount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </strong>
      )
    },
    {
      header: "Date",
      key: "bill_date",
      render: (r) => <span style={{ whiteSpace: 'nowrap', fontSize: '0.84rem' }}>{r.bill_date}</span>
    },
    {
      header: "Status",
      key: "status",
      render: (r) => <StatusBadge status={r.status} />
    },
    {
      header: "Actions",
      key: "actions",
      render: (r) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            className="action-icon-btn info"
            onClick={(e) => { e.stopPropagation(); setPreviewBill(r); }}
            title="View Voucher"
          >
            <Eye size={14} />
          </button>
          <button
            className="action-icon-btn edit"
            onClick={(e) => { e.stopPropagation(); handleOpenEditModal(r); }}
            title="Edit Record"
          >
            <Edit3 size={14} />
          </button>
          <button
            className="action-icon-btn danger"
            onClick={(e) => handleDelete(r.bill_id || r.id, e)}
            title="Delete Record"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="additional-billing-container">
      {/* Header */}
      <div className="additional-billing-header">
        <div>
          <h1 className="additional-billing-title">Additional Billing & Extra Work Invoices</h1>
          <p className="additional-billing-subtitle">
            Manage extra scope variations, site modifications, client upgrades, and additional work expenses
          </p>
        </div>
        <div className="header-action-group">
          <button
            className="btn-secondary"
            onClick={() => {
              const exportRows = enrichedBillings.map(b => ({
                ...b,
                quoted_amount: Number(b.quoted_amount ?? b.amount ?? 0),
                expense_amount: Number(b.expense_amount ?? 0),
                amount: Number(b.amount ?? b.quoted_amount ?? 0)
              }));
              exportToXLS(exportRows, 'Yeloline_Additional_Work_Expenses', 'Additional work Expenses', ADDITIONAL_BILLING_COLUMNS_SPEC);
            }}
          >
            <FileSpreadsheet size={16} /> Export XLS
          </button>
          <button
            className="btn-secondary"
            onClick={() => {
              const exportRows = enrichedBillings.map(b => ({
                sno: b.sno,
                work_description: b.work_description,
                quoted_amount: `₹${Number(b.quoted_amount ?? b.amount ?? 0).toLocaleString('en-IN')}`,
                expense_amount: `₹${Number(b.expense_amount ?? 0).toLocaleString('en-IN')}`,
                amount: `₹${Number(b.amount ?? b.quoted_amount ?? 0).toLocaleString('en-IN')}`,
                site_name: b.site_name,
                bill_date: b.bill_date,
                status: b.status
              }));
              exportToPDF(exportRows, 'Yeloline_Additional_Work_Expenses', 'Additional work Expenses', ADDITIONAL_BILLING_COLUMNS_SPEC);
            }}
          >
            <FileText size={16} /> Export PDF
          </button>
          <button className="btn-primary" onClick={handleOpenAddModal}>
            <Plus size={16} /> Create Additional Bill
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <MetricCard
          title="Total Additional Bills"
          value={filteredBillings.length}
          icon={Receipt}
          subtext="Variation orders & extra work"
          highlight
        />
        <MetricCard
          title="Total Quoted Amount"
          value={`₹${(totalQuotedValue / 100000).toFixed(2)}L`}
          icon={DollarSign}
          subtext={`₹${Number(totalQuotedValue).toLocaleString('en-IN')} client quote`}
        />
        <MetricCard
          title="Total Expense Amount"
          value={`₹${(totalExpenseValue / 100000).toFixed(2)}L`}
          icon={Clock}
          subtext={`₹${Number(totalExpenseValue).toLocaleString('en-IN')} incurred cost`}
        />
        <MetricCard
          title="Total Billed (Amount in Rs.)"
          value={`₹${(totalBilledValue / 100000).toFixed(2)}L`}
          icon={CheckCircle}
          subtext={`₹${(totalPaidValue / 100000).toFixed(2)}L collected from clients`}
        />
      </div>

      {/* Filters Bar */}
      <div className="filters-card">
        <div className="filter-group">
          <label className="filter-label"><Filter size={14} /> Filter Site:</label>
          <select
            className="form-control filter-select"
            value={selectedSiteFilter}
            onChange={(e) => setSelectedSiteFilter(e.target.value)}
          >
            <option value="ALL">All Registered Sites ({siteOptions.length})</option>
            {siteOptions.map(site => (
              <option key={site} value={site}>{site}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Category:</label>
          <select
            className="form-control filter-select"
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            {WORK_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Status:</label>
          <select
            className="form-control filter-select"
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            {BILL_STATUSES.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Additional Work Expenses Header Banner (Matching Image 1) */}
      <div className="additional-work-header-banner">
        <div className="banner-title-wrap">
          <span className="banner-highlight-text">Additional work Expenses</span>
          <span className="banner-subtext">Itemized billing & expense tracking for extra client scope</span>
        </div>
      </div>

      {/* Main Table with S.No., Description, Quoted Amount, Expense Amount, Amount in Rs. */}
      <DataTable
        columns={tableColumns}
        data={enrichedBillings}
        pageSize={10}
        onRowClick={(row) => setPreviewBill(row)}
      />

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingBill ? `Edit Additional Bill - ${editingBill.bill_id}` : "Create New Additional Bill"}
          maxWidth="720px"
        >
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label className="form-label">Site / Project Name</label>
              {siteOptions.length > 0 ? (
                <select
                  className="form-control"
                  value={formData.site_name}
                  onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                  required
                >
                  <option value="">-- Select Site --</option>
                  {siteOptions.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Site Name"
                  value={formData.site_name}
                  onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                  required
                />
              )}
            </div>

            <div className="form-row-2col">
              <div className="form-group">
                <label className="form-label">Client Name (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Client full name"
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Work Category</label>
                <select
                  className="form-control"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  {WORK_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Description <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Enter description of additional work or extra scope..."
                value={formData.work_description}
                onChange={(e) => setFormData({ ...formData, work_description: e.target.value })}
                required
              />
            </div>

            {/* The 3 Core Financial Fields from Image 1 */}
            <div className="form-row-3col">
              <div className="form-group">
                <label className="form-label">
                  Quoted Amount (₹) <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  className="form-control"
                  placeholder="e.g. 85000"
                  value={formData.quoted_amount}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      quoted_amount: val,
                      amount: prev.amount === '' || prev.amount === prev.quoted_amount ? val : prev.amount
                    }));
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Expense Amount (₹)</label>
                <input
                  type="number"
                  step="any"
                  className="form-control"
                  placeholder="e.g. 55000"
                  value={formData.expense_amount}
                  onChange={(e) => setFormData({ ...formData, expense_amount: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Amount in Rs. (₹) <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  className="form-control"
                  placeholder="e.g. 85000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row-2col">
              <div className="form-group">
                <label className="form-label">Billing Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.bill_date}
                  onChange={(e) => setFormData({ ...formData, bill_date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-control"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                >
                  {BILL_STATUSES.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Internal Notes / Payment Reference</label>
              <input
                type="text"
                className="form-control"
                placeholder="Additional comments or payment reference info..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingBill ? 'Save Changes' : 'Create Bill Record'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Invoice Preview Modal (Displays Official Table from Image 1) */}
      {previewBill && (
        <Modal
          isOpen={!!previewBill}
          onClose={() => setPreviewBill(null)}
          title={`Additional work Expenses - ${previewBill.bill_id || previewBill.id}`}
          maxWidth="780px"
        >
          <div className="invoice-preview-card">
            <div className="invoice-preview-header">
              <div>
                <h2 className="company-brand">YELOLINE CONSTRUCTIONS</h2>
                <div className="company-sub">Additional Scope Invoice Voucher</div>
              </div>
              <StatusBadge status={previewBill.status} />
            </div>

            <div className="invoice-meta-grid">
              <div>
                <span className="meta-label">Bill ID:</span> <strong>{previewBill.bill_id || previewBill.id}</strong>
              </div>
              <div>
                <span className="meta-label">Date:</span> <span>{previewBill.bill_date}</span>
              </div>
              <div>
                <span className="meta-label">Site:</span> <strong>{previewBill.site_name}</strong>
              </div>
              <div>
                <span className="meta-label">Client:</span> <span>{previewBill.client_name || 'N/A'}</span>
              </div>
            </div>

            {/* Official Table Matching Image 1 */}
            <div className="official-voucher-table-wrapper">
              <div className="official-voucher-heading">Additional work Expenses</div>
              <table className="official-expenses-table">
                <thead>
                  <tr>
                    <th style={{ width: '8%', textAlign: 'center' }}>S.No.</th>
                    <th style={{ width: '42%' }}>Description</th>
                    <th style={{ width: '16%', textAlign: 'right' }}>Quoted Amount</th>
                    <th style={{ width: '17%', textAlign: 'right' }}>Expense Amount</th>
                    <th style={{ width: '17%', textAlign: 'right' }}>Amount in Rs.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ textAlign: 'center' }}>1</td>
                    <td style={{ fontWeight: 600 }}>{previewBill.work_description}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      ₹{Number(previewBill.quoted_amount ?? previewBill.amount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      ₹{Number(previewBill.expense_amount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 800 }}>
                      ₹{Number(previewBill.amount ?? previewBill.quoted_amount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td></td>
                    <td style={{ fontWeight: 800 }}>TOTAL</td>
                    <td style={{ textAlign: 'right' }}>
                      ₹{Number(previewBill.quoted_amount ?? previewBill.amount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      ₹{Number(previewBill.expense_amount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      ₹{Number(previewBill.amount ?? previewBill.quoted_amount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {previewBill.notes && (
              <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '1rem', background: '#F8FAFC', padding: '8px 12px', borderRadius: '4px' }}>
                <strong>Notes / Reference:</strong> {previewBill.notes}
              </div>
            )}

            <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
              <button className="btn-secondary" onClick={() => window.print()}>
                <Printer size={16} /> Print Voucher
              </button>
              <button className="btn-primary" onClick={() => setPreviewBill(null)}>
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
