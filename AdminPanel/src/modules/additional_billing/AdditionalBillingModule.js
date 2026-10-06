import React, { useState } from 'react';
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
  Eye,
  Tag
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
  { key: "bill_id", label: "Bill ID", type: "String", required: true, example: "ADD-BILL-101" },
  { key: "site_name", label: "Site Name", type: "String", required: true, example: "Modern Minimalist Villa - Perundurai" },
  { key: "client_name", label: "Client Name", type: "String", required: true, example: "Ramesh Sundaram" },
  { key: "category", label: "Work Category", type: "String", required: true, example: "Structural Variation" },
  { key: "work_description", label: "Work Description", type: "String", required: true, example: "Extra 2nd floor balcony extension & RCC beam reinforcement" },
  { key: "amount", label: "Amount (₹)", type: "Number", required: true, example: "125000" },
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
    amount: '',
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
      amount: bill.amount || '',
      bill_date: bill.bill_date || new Date().toISOString().split('T')[0],
      status: bill.status || 'Pending Approval',
      notes: bill.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.work_description || !formData.amount) {
      alert('Please fill in work description and amount');
      return;
    }

    const payload = {
      ...formData,
      amount: Number(formData.amount) || 0
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

  const totalBilledValue = filteredBillings.reduce((acc, b) => acc + Number(b.amount || 0), 0);
  const totalPaidValue = filteredBillings
    .filter(b => b.status === 'Paid')
    .reduce((acc, b) => acc + Number(b.amount || 0), 0);
  const pendingApprovalsCount = filteredBillings.filter(b => b.status === 'Pending Approval' || b.status === 'Billed').length;

  const tableColumns = [
    {
      header: "Bill ID",
      key: "bill_id",
      render: (r) => <strong style={{ color: 'var(--accent-yellow-dark)', whiteSpace: 'nowrap' }}>{r.bill_id || r.id}</strong>
    },
    {
      header: "Site / Client",
      key: "site_name",
      render: (r) => (
        <div>
          <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>{r.site_name || 'General Site'}</div>
          {r.client_name && <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Client: {r.client_name}</div>}
        </div>
      )
    },
    {
      header: "Category",
      key: "category",
      render: (r) => (
        <span className="category-pill">
          <Tag size={12} /> {r.category}
        </span>
      )
    },
    {
      header: "Scope Description",
      key: "work_description",
      render: (r) => (
        <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
          {r.work_description}
        </span>
      )
    },
    {
      header: "Amount (₹)",
      key: "amount",
      render: (r) => (
        <strong style={{ fontSize: '0.94rem', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
          ₹{Number(r.amount).toLocaleString('en-IN')}
        </strong>
      )
    },
    {
      header: "Date",
      key: "bill_date",
      render: (r) => <span style={{ whiteSpace: 'nowrap' }}>{r.bill_date}</span>
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
            title="View Invoice Preview"
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
            Manage extra scope variations, site modifications, client upgrades, and additional billing invoices
          </p>
        </div>
        <div className="header-action-group">
          <button
            className="btn-secondary"
            onClick={() => exportToXLS(filteredBillings, 'Yeloline_Additional_Billing', 'Additional Billing Records', ADDITIONAL_BILLING_COLUMNS_SPEC)}
          >
            <FileSpreadsheet size={16} /> Export XLS
          </button>
          <button
            className="btn-secondary"
            onClick={() => exportToPDF(filteredBillings, 'Yeloline_Additional_Billing', 'Additional Billing Records', ADDITIONAL_BILLING_COLUMNS_SPEC)}
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
          title="Total Billed Amount"
          value={`₹${(totalBilledValue / 100000).toFixed(2)}L`}
          icon={DollarSign}
          subtext="Cumulative extra work cost"
        />
        <MetricCard
          title="Approved & Paid"
          value={`₹${(totalPaidValue / 100000).toFixed(2)}L`}
          icon={CheckCircle}
          subtext="Collected from clients"
        />
        <MetricCard
          title="Pending Approvals / Bills"
          value={pendingApprovalsCount}
          icon={Clock}
          subtext="Awaiting client sign-off / payment"
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

      {/* Main Table */}
      <DataTable
        columns={tableColumns}
        data={filteredBillings}
        pageSize={10}
        onRowClick={(row) => setPreviewBill(row)}
      />

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingBill ? `Edit Additional Bill - ${editingBill.bill_id}` : "Create New Additional Bill"}
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
              <label className="form-label">Scope Description / Extra Work Details</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Detail the extra work or material upgrade requested by client..."
                value={formData.work_description}
                onChange={(e) => setFormData({ ...formData, work_description: e.target.value })}
                required
              />
            </div>

            <div className="form-row-3col">
              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 85000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>

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

      {/* Invoice Preview Modal */}
      {previewBill && (
        <Modal
          isOpen={!!previewBill}
          onClose={() => setPreviewBill(null)}
          title={`Additional Invoice Statement - ${previewBill.bill_id || previewBill.id}`}
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

            <div className="invoice-body">
              <div className="body-label">Work Category:</div>
              <div className="body-val">{previewBill.category}</div>
              
              <div className="body-label" style={{ marginTop: '10px' }}>Extra Work Scope Details:</div>
              <div className="body-desc">{previewBill.work_description}</div>
            </div>

            <div className="invoice-total-banner">
              <span>Total Extra Work Amount:</span>
              <span className="total-amount">₹{Number(previewBill.amount).toLocaleString('en-IN')}</span>
            </div>

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
