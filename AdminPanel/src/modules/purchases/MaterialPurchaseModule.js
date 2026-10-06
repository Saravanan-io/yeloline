import React, { useState } from 'react';
import {
  Plus,
  ShoppingBag,
  Truck,
  CheckCircle2,
  Filter,
  Eye,
  Trash2,
  FileSpreadsheet,
  FileText,
  MapPin,
  Building2,
  Store,
  Box,
  Calendar,
  Wallet,
  User
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import DataTable from '../../components/common/DataTable/DataTable';
import Modal from '../../components/common/Modal/Modal';
import MetricCard from '../../components/common/MetricCard/MetricCard';
import CustomSelect from '../../components/common/CustomSelect/CustomSelect';
import CSVImportModal from '../../components/common/CSVImportModal/CSVImportModal';
import './MaterialPurchaseModule.css';

const DEFAULT_SITES = [
  "Skyline Residency",
  "Modern Minimalist Villa - Perundurai",
  "Grand Emerald Commercial Hub",
  "Heritage Home Renovation"
];

const DEPARTMENTS = [
  "Masonry",
  "Structure",
  "Electrical",
  "Plumbing",
  "Shuttering",
  "Tiles",
  "Carpentry",
  "Painting"
];

const SUPPLIERS = [
  "Shree Ganesh Bricks",
  "UltraTech Cement Depot Erode",
  "Sri Balaji TMT Steel Traders",
  "Kaveri Red Bricks Yard",
  "Kajaria Ceramics Gallery",
  "SmartLine Systems Depot"
];

const PRODUCTS = [
  "Red Bricks",
  "Cement",
  "Steel / TMT Bars",
  "Sand & Aggregates",
  "Tiles & Flooring",
  "Paint",
  "Electrical Wiring",
  "Plumbing Fittings"
];

const ENTERED_BY_OPTIONS = ["Suriya prakash", "Bala"];

const PURCHASE_COLUMNS_SPEC = [
  { key: "purchase_id", label: "PO Ref ID", type: "String", required: true, example: "PO-301" },
  { key: "site_name", label: "Select Site", type: "String", required: true, example: "Skyline Residency" },
  { key: "department", label: "Department", type: "String", required: true, example: "Masonry" },
  { key: "vendor_name", label: "Supplier Name", type: "String", required: true, example: "Shree Ganesh Bricks" },
  { key: "material_category", label: "Product / Material", type: "String", required: true, example: "Red Bricks" },
  { key: "order_date", label: "Date of Purchase", type: "Date", required: true, example: "2026-01-24" },
  { key: "total_amount", label: "Total Purchase Amount (₹)", type: "Number", required: true, example: "165000" },
  { key: "amount_paid", label: "Amount Paid (₹)", type: "Number", required: true, example: "100000" },
  { key: "entered_by", label: "Entered By", type: "String", required: true, example: "Suriya prakash" }
];

const SAMPLE_PURCHASE_ROW = {
  purchase_id: "PO-301",
  site_name: "Skyline Residency",
  department: "Masonry",
  vendor_name: "Shree Ganesh Bricks",
  material_category: "Red Bricks",
  order_date: "2026-01-24",
  total_amount: 165000,
  amount_paid: 165000,
  entered_by: "Suriya prakash"
};

export default function MaterialPurchaseModule() {
  const {
    purchases = [],
    sites = [],
    addPurchase,
    deletePurchase,
    importPurchases,
    exportToXLS,
    exportToPDF
  } = useApp();

  const [selectedSiteFilter, setSelectedSiteFilter] = useState('ALL');
  const [selectedMaterialFilter, setSelectedMaterialFilter] = useState('ALL');
  const [selectedEnteredByFilter, setSelectedEnteredByFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [viewingDetailPurchase, setViewingDetailPurchase] = useState(null);

  // Extracted registered site names or fall back to defaults
  const allSitesList = Array.from(new Set([
    ...DEFAULT_SITES,
    ...(sites || []).map(s => s.name || s.title || s.site_name).filter(Boolean)
  ]));

  const [formData, setFormData] = useState({
    site_name: 'Skyline Residency',
    department: 'Masonry',
    vendor_name: 'Shree Ganesh Bricks',
    material_category: 'Red Bricks',
    order_date: new Date().toISOString().split('T')[0],
    total_amount: '',
    amount_paid: '',
    entered_by: 'Suriya prakash'
  });

  const filteredPurchases = purchases.filter(p => {
    const matchesSite = selectedSiteFilter === 'ALL' || (p.site_name || 'Skyline Residency') === selectedSiteFilter;
    const matchesMaterial = selectedMaterialFilter === 'ALL' || p.material_category === selectedMaterialFilter || p.department === selectedMaterialFilter;
    const matchesEnteredBy = selectedEnteredByFilter === 'ALL' || (p.entered_by || 'Suriya prakash') === selectedEnteredByFilter;
    return matchesSite && matchesMaterial && matchesEnteredBy;
  });

  const totalPOAmount = filteredPurchases.reduce((acc, p) => acc + Number(p.total_amount || 0), 0);
  const totalPaidAmount = filteredPurchases.reduce((acc, p) => acc + Number(p.amount_paid || 0), 0);
  const totalBalanceDue = Math.max(0, totalPOAmount - totalPaidAmount);

  const handleSubmit = (e) => {
    e.preventDefault();
    addPurchase({
      ...formData,
      total_amount: Number(formData.total_amount || 0),
      amount_paid: Number(formData.amount_paid || 0),
      entered_by: formData.entered_by || 'Suriya prakash'
    });
    setIsModalOpen(false);
    setFormData({
      site_name: allSitesList[0] || 'Skyline Residency',
      department: 'Masonry',
      vendor_name: 'Shree Ganesh Bricks',
      material_category: 'Red Bricks',
      order_date: new Date().toISOString().split('T')[0],
      total_amount: '',
      amount_paid: '',
      entered_by: 'Suriya prakash'
    });
  };

  const columns = [
    {
      header: "PO ID",
      key: "purchase_id",
      render: (r) => <span style={{ fontWeight: '700', color: 'var(--accent-yellow-dark)' }}>{r.purchase_id}</span>
    },
    {
      header: "Site",
      key: "site_name",
      render: (r) => <strong>{r.site_name || 'Skyline Residency'}</strong>
    },
    {
      header: "Department",
      key: "department",
      render: (r) => (
        <span style={{
          backgroundColor: 'var(--light-background)',
          color: 'var(--text-primary)',
          border: '1px solid var(--light-border)',
          padding: '3px 8px',
          borderRadius: '4px',
          fontSize: '0.78rem',
          fontWeight: '700'
        }}>
          {r.department || 'Masonry'}
        </span>
      )
    },
    {
      header: "Supplier Name",
      key: "vendor_name",
      render: (r) => <strong>{r.vendor_name}</strong>
    },
    {
      header: "Product / Material",
      key: "material_category"
    },
    {
      header: "Total Amount",
      key: "total_amount",
      render: (r) => <strong>₹{Number(r.total_amount || 0).toLocaleString('en-IN')}</strong>
    },
    {
      header: "Amount Paid",
      key: "amount_paid",
      render: (r) => <span style={{ color: 'var(--success-green)', fontWeight: '700' }}>₹{Number(r.amount_paid || 0).toLocaleString('en-IN')}</span>
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
            style={{ background: 'var(--info-bg)', border: 'none', color: 'var(--info-blue)', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer' }}
            onClick={() => setViewingDetailPurchase(r)}
            title="View Full Purchase Order Details"
          >
            <Eye size={14} />
          </button>
          <button
            style={{ background: 'var(--danger-bg)', border: 'none', color: 'var(--danger-red)', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer' }}
            onClick={() => deletePurchase(r.purchase_id)}
            title="Delete Purchase Order"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="purchases-container">
      <div className="leads-header-row">
        <div>
          <h1 className="dashboard-title">Material Purchase Orders</h1>
          <p className="dashboard-subtitle">Record and track construction material orders and site purchase invoices</p>
        </div>
        <div className="header-action-group">
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Create Purchase Order
          </button>
          <div className="csv-action-group">
            <button
              className="btn-secondary"
              onClick={() => exportToXLS(filteredPurchases, 'Yeloline_Material_Purchases', 'Material Purchase Orders', PURCHASE_COLUMNS_SPEC)}
            >
              <FileSpreadsheet size={16} /> Export XLS
            </button>
            <button
              className="btn-secondary"
              onClick={() => exportToPDF(filteredPurchases, 'Yeloline_Material_Purchases', 'Material Purchase Orders', PURCHASE_COLUMNS_SPEC)}
            >
              <FileText size={16} /> Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* PO Summary Metrics */}
      <div className="po-summary-grid">
        <MetricCard
          title="Total PO Spend"
          value={`₹${(totalPOAmount / 100000).toFixed(2)} L`}
          icon={ShoppingBag}
          subtext={`${filteredPurchases.length} Purchase Orders`}
          highlight
        />
        <MetricCard
          title="Total Amount Paid"
          value={`₹${(totalPaidAmount / 100000).toFixed(2)} L`}
          icon={CheckCircle2}
          subtext="Vendor payments settled"
        />
        <MetricCard
          title="Balance Payable"
          value={`₹${(totalBalanceDue / 100000).toFixed(2)} L`}
          icon={Truck}
          subtext="Pending vendor balance"
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
            { value: "ALL", label: `All Sites (${purchases.length})`, badge: purchases.length },
            ...allSitesList.map(s => ({
              value: s,
              label: s,
              badge: purchases.filter(p => (p.site_name || 'Skyline Residency') === s).length
            }))
          ]}
        />

        <CustomSelect
          icon={Filter}
          label="MATERIAL / PRODUCT:"
          value={selectedMaterialFilter}
          onChange={(val) => setSelectedMaterialFilter(val)}
          options={[
            { value: "ALL", label: `All Materials (${purchases.length})`, badge: purchases.length },
            ...PRODUCTS.map(m => ({
              value: m,
              label: m,
              badge: purchases.filter(p => p.material_category === m).length
            }))
          ]}
        />

        <CustomSelect
          icon={Filter}
          label="Entered By:"
          value={selectedEnteredByFilter}
          onChange={(val) => setSelectedEnteredByFilter(val)}
          options={[
            { value: "ALL", label: `All Users (${purchases.length})`, badge: purchases.length },
            ...ENTERED_BY_OPTIONS.map(name => ({
              value: name,
              label: name,
              badge: purchases.filter(p => (p.entered_by || 'Suriya prakash') === name).length
            }))
          ]}
        />
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredPurchases}
        searchPlaceholder="Search site, supplier name, material, PO ID..."
        pageSize={8}
        onRowClick={(row) => setViewingDetailPurchase(row)}
      />

      {/* Create Purchase Order Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Material Purchase Order"
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

          {/* Department */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: '700', fontSize: '0.88rem' }}>Department</label>
            <div className="input-with-icon" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Building2 size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)' }} />
              <select
                className="form-input"
                style={{ paddingLeft: '38px' }}
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Supplier Name */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: '700', fontSize: '0.88rem' }}>Supplier Name</label>
            <div className="input-with-icon" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Store size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)' }} />
              <select
                className="form-input"
                style={{ paddingLeft: '38px' }}
                value={formData.vendor_name}
                onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
              >
                {SUPPLIERS.map(sup => <option key={sup} value={sup}>{sup}</option>)}
              </select>
            </div>
          </div>

          {/* Product / Material */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: '700', fontSize: '0.88rem' }}>Product / Material</label>
            <div className="input-with-icon" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Box size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)' }} />
              <select
                className="form-input"
                style={{ paddingLeft: '38px' }}
                value={formData.material_category}
                onChange={(e) => setFormData({ ...formData, material_category: e.target.value })}
              >
                {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Date of Purchase */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: '700', fontSize: '0.88rem' }}>Date of Purchase</label>
            <div className="input-with-icon" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Calendar size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)' }} />
              <input
                type="date"
                required
                className="form-input"
                style={{ paddingLeft: '38px' }}
                value={formData.order_date}
                onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
              />
            </div>
          </div>

          {/* Total Purchase Amount (₹) */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: '700', fontSize: '0.88rem' }}>Total Purchase Amount (₹)</label>
            <div className="input-with-icon" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '14px', fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>₹</span>
              <input
                type="number"
                required
                placeholder="Enter total amount"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                value={formData.total_amount}
                onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
              />
            </div>
          </div>

          {/* Amount Paid (₹) */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: '700', fontSize: '0.88rem' }}>Amount Paid (₹)</label>
            <div className="input-with-icon" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Wallet size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)' }} />
              <input
                type="number"
                required
                placeholder="Enter amount paid"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                value={formData.amount_paid}
                onChange={(e) => setFormData({ ...formData, amount_paid: e.target.value })}
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
              Create Purchase Order
            </button>
          </div>
        </form>
      </Modal>

      {/* Purchase Detail Modal */}
      {viewingDetailPurchase && (
        <Modal
          isOpen={!!viewingDetailPurchase}
          onClose={() => setViewingDetailPurchase(null)}
          title={`Material Purchase Order Details - ${viewingDetailPurchase.purchase_id}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--light-background)', border: '1px solid var(--light-border)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>{viewingDetailPurchase.vendor_name}</h2>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Site: <strong>{viewingDetailPurchase.site_name || 'Skyline Residency'}</strong> | Dept: <strong>{viewingDetailPurchase.department || 'Masonry'}</strong>
                </div>
              </div>
              <span style={{ fontWeight: '700', color: 'var(--accent-yellow-dark)', fontSize: '1rem' }}>
                {viewingDetailPurchase.purchase_id}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '0.85rem 1rem', background: 'var(--light-background)', border: '1px solid var(--light-border)', borderRadius: 'var(--radius-sm)' }}>
                <div className="form-label" style={{ marginBottom: '4px' }}>Product / Material</div>
                <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--accent-yellow-dark)' }}>
                  {viewingDetailPurchase.material_category}
                </div>
              </div>

              <div style={{ padding: '0.85rem 1rem', background: 'var(--light-background)', border: '1px solid var(--light-border)', borderRadius: 'var(--radius-sm)' }}>
                <div className="form-label" style={{ marginBottom: '4px' }}>Date of Purchase</div>
                <div style={{ fontWeight: '700', fontSize: '0.92rem' }}>
                  {viewingDetailPurchase.order_date}
                </div>
              </div>

              <div style={{ padding: '0.85rem 1rem', background: 'var(--light-background)', border: '1px solid var(--light-border)', borderRadius: 'var(--radius-sm)' }}>
                <div className="form-label" style={{ marginBottom: '4px' }}>Amount Paid</div>
                <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--success-green)' }}>
                  ₹{Number(viewingDetailPurchase.amount_paid || 0).toLocaleString('en-IN')}
                </div>
              </div>

              <div style={{ padding: '0.85rem 1rem', background: 'var(--light-background)', border: '1px solid var(--light-border)', borderRadius: 'var(--radius-sm)' }}>
                <div className="form-label" style={{ marginBottom: '4px' }}>Entered By</div>
                <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                  👤 {viewingDetailPurchase.entered_by || 'Suriya prakash'}
                </div>
              </div>
            </div>

            <div style={{ padding: '1rem 1.25rem', background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.15), rgba(234, 179, 8, 0.08))', border: '1px solid rgba(250, 204, 21, 0.3)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: '700', color: 'var(--dark-charcoal)' }}>Total Purchase Amount:</span>
              <span style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--accent-yellow-dark)' }}>
                ₹{Number(viewingDetailPurchase.total_amount || 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="button" className="btn-secondary" onClick={() => setViewingDetailPurchase(null)}>
                Close
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
          title="Import Material Purchase Orders CSV"
          moduleName="Material Purchases"
          compulsoryColumns={PURCHASE_COLUMNS_SPEC}
          sampleRow={SAMPLE_PURCHASE_ROW}
          onImport={(data) => importPurchases(data)}
        />
      )}
    </div>
  );
}
