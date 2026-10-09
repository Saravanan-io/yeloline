import React, { useState, useMemo } from 'react';
import {
  Building2,
  Store,
  ShoppingBag,
  Plus,
  FileSpreadsheet,
  FileText,
  Eye,
  Trash2,
  User,
  Box,
  X,
  RotateCcw,
  Filter
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import DataTable from '../../components/common/DataTable/DataTable';
import Modal from '../../components/common/Modal/Modal';
import CustomSelect from '../../components/common/CustomSelect/CustomSelect';
import './MaterialPurchaseListModule.css';

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
  "Ultratech Cement Supplies",
  "Tata Tiscon Steel",
  "Kajaria Tiles Center",
  "Asian Paints World",
  "L&T Electrical Depot",
  "Supreme Pipes & Fittings",
  "Jaguar Hardware Store"
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

const ENTERED_BY_OPTIONS = ["Suriya prakash", "Bala", "Admin"];

const PURCHASE_EXPORT_COLUMNS = [
  { key: "purchase_id", label: "PO Ref ID", type: "String" },
  { key: "site_name", label: "Site Name", type: "String" },
  { key: "department", label: "Department", type: "String" },
  { key: "vendor_name", label: "Supplier / Vendor", type: "String" },
  { key: "material_category", label: "Material / Product", type: "String" },
  { key: "order_date", label: "Date of Purchase", type: "Date" },
  { key: "total_amount", label: "Total Amount (₹)", type: "Number" },
  { key: "calculated_paid", label: "Amount Paid (₹)", type: "Number" },
  { key: "calculated_balance", label: "Balance Due (₹)", type: "Number" },
  { key: "entered_by", label: "Entered By", type: "String" }
];

const isSupplierMatch = (supA, supB) => {
  if (!supA || !supB) return false;
  const a = String(supA).toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
  const b = String(supB).toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;

  const wordsA = a.split(/\s+/).filter(w => w.length >= 3);
  const wordsB = b.split(/\s+/).filter(w => w.length >= 3);

  let sharedCount = 0;
  for (const wa of wordsA) {
    for (const wb of wordsB) {
      if (wa === wb) {
        sharedCount++;
        break;
      }
      if (wa.length >= 4 && wb.length >= 4 && wa.slice(0, 5) === wb.slice(0, 5)) {
        sharedCount++;
        break;
      }
    }
  }

  const keyBrands = ['ganesh', 'ganesha', 'ultratech', 'tata', 'balaji', 'kajaria', 'asian', 'kaveri', 'smartline', 'supreme', 'jaguar'];
  const hasKeyBrandMatch = keyBrands.some(k => a.includes(k) && b.includes(k));
  if (hasKeyBrandMatch) return true;

  return sharedCount >= 2;
};

const isCategoryMatch = (pDept, pMaterial, expCategory) => {
  if (!expCategory) return true;
  const c = String(expCategory).toLowerCase().trim();
  const d = String(pDept || '').toLowerCase().trim();
  const m = String(pMaterial || '').toLowerCase().trim();

  if (d === c || m === c || d.includes(c) || c.includes(d) || m.includes(c) || c.includes(m)) return true;

  const isMasonryExp = c.includes('mason') || c.includes('brick') || c.includes('cement') || c.includes('sand');
  const isMasonryPur = d.includes('mason') || m.includes('brick') || m.includes('cement') || m.includes('sand');
  if (isMasonryExp && isMasonryPur) return true;

  const isTilesExp = c.includes('tile') || c.includes('floor');
  const isTilesPur = d.includes('tile') || m.includes('tile') || m.includes('floor');
  if (isTilesExp && isTilesPur) return true;

  const isSteelExp = c.includes('steel') || c.includes('tmt') || c.includes('structur');
  const isSteelPur = d.includes('steel') || d.includes('structur') || m.includes('steel') || m.includes('tmt');
  if (isSteelExp && isSteelPur) return true;

  const isElecExp = c.includes('electr');
  const isElecPur = d.includes('electr') || m.includes('electr') || m.includes('wiring');
  if (isElecExp && isElecPur) return true;

  const isPlumbExp = c.includes('plumb');
  const isPlumbPur = d.includes('plumb') || m.includes('plumb') || m.includes('pipe');
  if (isPlumbExp && isPlumbPur) return true;

  const isPaintExp = c.includes('paint');
  const isPaintPur = d.includes('paint') || m.includes('paint');
  if (isPaintExp && isPaintPur) return true;

  const isCarpExp = c.includes('carpent') || c.includes('door') || c.includes('window');
  const isCarpPur = d.includes('carpent') || d.includes('door') || m.includes('door') || m.includes('wood');
  if (isCarpExp && isCarpPur) return true;

  return false;
};

export default function MaterialPurchaseListModule() {
  const {
    purchases = [],
    expenses = [],
    sites = [],
    addPurchase,
    deletePurchase,
    exportToXLS,
    exportToPDF
  } = useApp();

  const [selectedSiteFilter, setSelectedSiteFilter] = useState('ALL');
  const [selectedSupplierFilter, setSelectedSupplierFilter] = useState('ALL');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingDetailPurchase, setViewingDetailPurchase] = useState(null);

  // Material Purchase List should only display genuine purchase orders (not material expense logs)
  const actualPurchases = useMemo(() => {
    return (purchases || []).filter(p => {
      if (p.expense_id || p.is_expense_entry || p.is_expense || p.category === 'Material' || (p.notes && p.notes.includes('Supplier:'))) {
        return false;
      }
      return true;
    });
  }, [purchases]);

  // Material expenses from expenses collection
  const materialExpenses = useMemo(() => {
    return (expenses || []).filter(e => {
      const cat = String(e.category || '').toLowerCase();
      return cat.includes('material');
    });
  }, [expenses]);

  // Dynamically calculate paid amounts and balance due strictly per site + supplier + category
  const purchasesWithCalculatedBalances = useMemo(() => {
    // 1. Group material expenses by site
    const siteExpensesMap = {};
    materialExpenses.forEach(e => {
      const siteKey = (e.site_name || e.project_name || 'General').toLowerCase().trim();
      if (!siteExpensesMap[siteKey]) siteExpensesMap[siteKey] = [];

      const supName = e.supplier_name || e.vendor_name || 
        ((e.notes && e.notes.includes('Supplier:')) 
          ? e.notes.replace('Supplier:', '').trim() 
          : (e.notes || ''));

      siteExpensesMap[siteKey].push({
        ...e,
        remainingAmount: Number(e.amount || 0),
        supplier: supName.trim(),
        work_category: (e.work_category || '').trim()
      });
    });

    // 2. Group actual purchases by site
    const sitePurchasesMap = {};
    actualPurchases.forEach(p => {
      const siteKey = (p.site_name || p.project_name || 'General').toLowerCase().trim();
      if (!sitePurchasesMap[siteKey]) sitePurchasesMap[siteKey] = [];
      sitePurchasesMap[siteKey].push({ ...p });
    });

    const result = [];

    // 3. Process each site strictly independently
    Object.keys(sitePurchasesMap).forEach(siteKey => {
      const sitePurchases = sitePurchasesMap[siteKey];
      // Sort purchases by order_date ascending
      sitePurchases.sort((a, b) => {
        const da = new Date(a.order_date || 0);
        const db = new Date(b.order_date || 0);
        return da - db;
      });

      const siteExpenses = siteExpensesMap[siteKey] || [];

      // For each purchase of this site, deduct matching expenses with SAME SUPPLIER and SAME CATEGORY
      sitePurchases.forEach(p => {
        const pTotal = Number(p.total_amount || 0);
        let allocated = 0;
        const pVendor = p.vendor_name || '';
        const pDept = p.department || '';
        const pMaterial = p.material_category || '';

        siteExpenses.forEach(exp => {
          if (exp.remainingAmount > 0) {
            const supplierMatches = isSupplierMatch(pVendor, exp.supplier);
            const categoryMatches = isCategoryMatch(pDept, pMaterial, exp.work_category);

            if (supplierMatches && categoryMatches) {
              const needed = pTotal - allocated;
              if (needed > 0) {
                const take = Math.min(needed, exp.remainingAmount);
                allocated += take;
                exp.remainingAmount -= take;
              }
            }
          }
        });

        const finalPaid = Math.min(pTotal, allocated);
        const finalBalance = Math.max(0, pTotal - finalPaid);

        p.calculated_paid = finalPaid;
        p.calculated_balance = finalBalance;
        p.payment_status = finalBalance === 0 && pTotal > 0 ? 'Paid' : (finalPaid > 0 ? 'Partially Paid' : 'Unpaid');

        result.push(p);
      });
    });

    return result;
  }, [actualPurchases, materialExpenses]);

  // Extracted list of all registered sites
  const allSitesList = useMemo(() => {
    const list = Array.from(new Set(
      (sites || []).map(s => s.name || s.title || s.site_name).filter(Boolean)
    ));
    // Also include any site names present in purchases
    actualPurchases.forEach(p => {
      const pSite = p.site_name || p.project_name;
      if (pSite && !list.includes(pSite)) {
        list.push(pSite);
      }
    });
    return list;
  }, [sites, actualPurchases]);

  // Extracted list of all distinct suppliers / vendors
  const allSuppliersList = useMemo(() => {
    const set = new Set();
    actualPurchases.forEach(p => {
      if (p.vendor_name) set.add(p.vendor_name.trim());
    });
    SUPPLIERS.forEach(s => set.add(s));
    return Array.from(set).filter(Boolean);
  }, [actualPurchases]);

  const [formData, setFormData] = useState({
    site_name: allSitesList[0] || '',
    department: 'Masonry',
    vendor_name: '',
    material_category: 'Red Bricks',
    order_date: new Date().toISOString().split('T')[0],
    total_amount: '',
    entered_by: 'Suriya prakash'
  });

  // Filtered purchases based on active site and supplier dropdowns
  const filteredPurchases = useMemo(() => {
    return purchasesWithCalculatedBalances.filter(p => {
      const pSite = p.site_name || p.project_name || '';
      const pVendor = (p.vendor_name || '').trim();
      const matchesSite = selectedSiteFilter === 'ALL' || pSite === selectedSiteFilter;
      const matchesSupplier = selectedSupplierFilter === 'ALL' || pVendor === selectedSupplierFilter.trim();
      return matchesSite && matchesSupplier;
    });
  }, [purchasesWithCalculatedBalances, selectedSiteFilter, selectedSupplierFilter]);

  // Dropdown options with count badges
  const siteOptions = useMemo(() => [
    { value: "ALL", label: `All Sites (${actualPurchases.length})`, badge: actualPurchases.length },
    ...allSitesList.map(s => ({
      value: s,
      label: s,
      badge: actualPurchases.filter(p => (p.site_name || p.project_name) === s).length
    }))
  ], [allSitesList, actualPurchases]);

  const supplierOptions = useMemo(() => [
    { value: "ALL", label: `All Suppliers (${actualPurchases.length})`, badge: actualPurchases.length },
    ...allSuppliersList.map(sup => ({
      value: sup,
      label: sup,
      badge: actualPurchases.filter(p => (p.vendor_name || '').trim() === sup.trim()).length
    }))
  ], [allSuppliersList, actualPurchases]);

  // Financial summary calculations
  const totalAmountSum = useMemo(() => {
    return filteredPurchases.reduce((acc, p) => acc + Number(p.total_amount || 0), 0);
  }, [filteredPurchases]);

  const totalPaidSum = useMemo(() => {
    return filteredPurchases.reduce((acc, p) => acc + Number(p.calculated_paid || 0), 0);
  }, [filteredPurchases]);

  const totalDueSum = useMemo(() => {
    return filteredPurchases.reduce((acc, p) => acc + Number(p.calculated_balance || 0), 0);
  }, [filteredPurchases]);

  const hasActiveFilters = selectedSiteFilter !== 'ALL' ||
    selectedSupplierFilter !== 'ALL';

  const resetAllFilters = () => {
    setSelectedSiteFilter('ALL');
    setSelectedSupplierFilter('ALL');
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    addPurchase({
      ...formData,
      total_amount: Number(formData.total_amount || 0),
      amount_paid: 0,
      payment_status: 'Unpaid',
      entered_by: formData.entered_by || 'Suriya prakash'
    });
    setIsCreateModalOpen(false);
    setFormData({
      site_name: allSitesList[0] || '',
      department: 'Masonry',
      vendor_name: '',
      material_category: 'Red Bricks',
      order_date: new Date().toISOString().split('T')[0],
      total_amount: '',
      entered_by: 'Suriya prakash'
    });
  };

  const handleExportXLS = () => {
    const siteTag = selectedSiteFilter === 'ALL' ? 'All_Sites' : selectedSiteFilter.replace(/\s+/g, '_');
    const supplierTag = selectedSupplierFilter === 'ALL' ? '' : `_Supplier_${selectedSupplierFilter.replace(/\s+/g, '_')}`;
    const filename = `Yeloline_Material_Purchases_${siteTag}${supplierTag}`;
    const title = `Material Purchases - ${selectedSiteFilter === 'ALL' ? 'All Sites' : selectedSiteFilter}${selectedSupplierFilter === 'ALL' ? '' : ` (Supplier: ${selectedSupplierFilter})`}`;
    exportToXLS(filteredPurchases, filename, title, PURCHASE_EXPORT_COLUMNS);
  };

  const handleExportPDF = () => {
    const siteTag = selectedSiteFilter === 'ALL' ? 'All_Sites' : selectedSiteFilter.replace(/\s+/g, '_');
    const supplierTag = selectedSupplierFilter === 'ALL' ? '' : `_Supplier_${selectedSupplierFilter.replace(/\s+/g, '_')}`;
    const filename = `Yeloline_Material_Purchases_${siteTag}${supplierTag}`;
    const title = `Material Purchases - ${selectedSiteFilter === 'ALL' ? 'All Sites' : selectedSiteFilter}${selectedSupplierFilter === 'ALL' ? '' : ` (Supplier: ${selectedSupplierFilter})`}`;
    exportToPDF(filteredPurchases, filename, title, PURCHASE_EXPORT_COLUMNS);
  };

  // Table columns definition
  const tableColumns = [
    {
      header: "PO Ref ID",
      key: "purchase_id",
      render: (r) => (
        <span style={{ fontWeight: '700', color: 'var(--accent-yellow-dark)' }}>
          {r.purchase_id}
        </span>
      )
    },
    {
      header: "Site Name",
      key: "site_name",
      render: (r) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '700', color: 'var(--text-primary)' }}>
          <Building2 size={15} style={{ color: 'var(--info-blue)' }} />
          {r.site_name || 'N/A'}
        </span>
      )
    },
    {
      header: "Product / Material",
      key: "material_category",
      render: (r) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: '600' }}>
          <Box size={14} style={{ color: 'var(--text-secondary)' }} />
          {r.material_category || 'Material'}
        </span>
      )
    },
    {
      header: "Department",
      key: "department",
      render: (r) => (
        <span style={{
          backgroundColor: 'var(--light-background)',
          color: 'var(--text-primary)',
          border: '1px solid var(--light-border)',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '0.76rem',
          fontWeight: '700'
        }}>
          {r.department || 'Masonry'}
        </span>
      )
    },
    {
      header: "Supplier / Vendor",
      key: "vendor_name",
      render: (r) => (
        <span style={{ fontWeight: '600' }}>
          {r.vendor_name || 'N/A'}
        </span>
      )
    },
    {
      header: "Order Date",
      key: "order_date",
      render: (r) => (
        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          {r.order_date || 'N/A'}
        </span>
      )
    },
    {
      header: "Total (₹)",
      key: "total_amount",
      render: (r) => <strong>₹{Number(r.total_amount || 0).toLocaleString('en-IN')}</strong>
    },
    {
      header: "Paid (₹)",
      key: "calculated_paid",
      render: (r) => <span style={{ color: 'var(--success-green)', fontWeight: '700' }}>₹{Number(r.calculated_paid ?? r.amount_paid ?? 0).toLocaleString('en-IN')}</span>
    },
    {
      header: "Balance Due (₹)",
      key: "calculated_balance",
      render: (r) => {
        const bal = Number(r.calculated_balance !== undefined ? r.calculated_balance : Math.max(0, Number(r.total_amount || 0) - Number(r.amount_paid || 0)));
        return (
          <span style={{ color: bal > 0 ? 'var(--danger-red)' : 'var(--text-muted)', fontWeight: bal > 0 ? '700' : '500' }}>
            ₹{bal.toLocaleString('en-IN')}
          </span>
        );
      }
    },
    {
      header: "Entered By",
      key: "entered_by",
      render: (r) => (
        <span className="mpl-entered-by-badge">
          <User size={13} style={{ color: 'var(--primary-yellow)' }} />
          <span>{r.entered_by || 'Suriya prakash'}</span>
        </span>
      )
    },
    {
      header: "Actions",
      key: "actions",
      render: (r) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            style={{
              background: 'var(--info-bg)',
              border: 'none',
              color: 'var(--info-blue)',
              padding: '5px 8px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={() => setViewingDetailPurchase(r)}
            title="View Full Purchase Order Details"
          >
            <Eye size={14} />
          </button>
          <button
            style={{
              background: 'var(--danger-bg)',
              border: 'none',
              color: 'var(--danger-red)',
              padding: '5px 8px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={() => deletePurchase(r.purchase_id, r.id)}
            title="Delete Purchase Order"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="mpl-container">
      {/* Top Header Row */}
      <div className="mpl-header-row">
        <div className="mpl-title-area">
          <div className="mpl-title-badge-wrap">
            <h1 className="dashboard-title">Material Purchase List</h1>
            <div className="mpl-live-badge">
              <span className="mpl-live-pulse-dot" />
              <span>Live Firestore Sync (Admin App Connected)</span>
            </div>
          </div>
          <p className="dashboard-subtitle">
            Synchronized in real-time with Admin App. Separate material purchases and billing breakdown per construction site.
          </p>
        </div>

        <div className="header-action-group">
          <button className="btn-primary" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={16} /> Record Purchase
          </button>
          <div className="csv-action-group">
            <button className="btn-secondary" onClick={handleExportXLS} title="Export current site purchases to Excel">
              <FileSpreadsheet size={16} /> Export XLS
            </button>
            <button className="btn-secondary" onClick={handleExportPDF} title="Export current site purchases to PDF">
              <FileText size={16} /> Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Financial Aggregation Banner */}
      <div className="mpl-summary-banner">
        <div className="mpl-summary-kpi">
          <span className="mpl-summary-kpi-label">Total Material Purchases</span>
          <span className="mpl-summary-kpi-val">₹{totalAmountSum.toLocaleString('en-IN')}</span>
        </div>
        <div className="mpl-summary-kpi">
          <span className="mpl-summary-kpi-label">Total Amount Paid</span>
          <span className="mpl-summary-kpi-val green">₹{totalPaidSum.toLocaleString('en-IN')}</span>
        </div>
        <div className="mpl-summary-kpi">
          <span className="mpl-summary-kpi-label">Total Balance Due</span>
          <span className="mpl-summary-kpi-val amber">₹{totalDueSum.toLocaleString('en-IN')}</span>
        </div>
        <div className="mpl-summary-count-badge">
          <ShoppingBag size={18} style={{ color: 'var(--primary-yellow)' }} />
          <span>{filteredPurchases.length} Purchase Orders</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mpl-filter-bar">
        {/* Site Wise Filter Dropdown */}
        <div className="mpl-filter-item">
          <CustomSelect
            icon={Filter}
            label="SITE:"
            options={siteOptions}
            value={selectedSiteFilter}
            onChange={(val) => setSelectedSiteFilter(val)}
          />
        </div>

        {/* Supplier Wise Selection Dropdown */}
        <div className="mpl-filter-item">
          <CustomSelect
            icon={Store}
            label="SUPPLIER:"
            options={supplierOptions}
            value={selectedSupplierFilter}
            onChange={(val) => setSelectedSupplierFilter(val)}
          />
        </div>
      </div>

      {/* Active Filter Chips & Reset All */}
      {hasActiveFilters && (
        <div className="mpl-active-filters-strip">
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
            Active Filters:
          </span>
          {selectedSiteFilter !== 'ALL' && (
            <span className="mpl-filter-chip">
              Site: <strong>{selectedSiteFilter}</strong>
              <button className="mpl-filter-chip-remove" onClick={() => setSelectedSiteFilter('ALL')} title="Remove site filter">
                <X size={13} />
              </button>
            </span>
          )}
          {selectedSupplierFilter !== 'ALL' && (
            <span className="mpl-filter-chip">
              Supplier: <strong>{selectedSupplierFilter}</strong>
              <button className="mpl-filter-chip-remove" onClick={() => setSelectedSupplierFilter('ALL')} title="Remove supplier filter">
                <X size={13} />
              </button>
            </span>
          )}

          <button className="mpl-reset-all-btn" onClick={resetAllFilters} title="Reset all applied filters">
            <RotateCcw size={12} /> Reset All Filters
          </button>
        </div>
      )}

      {/* Direct Detailed Data Table View */}
      <DataTable
        columns={tableColumns}
        data={filteredPurchases}
        searchPlaceholder="Search site purchases..."
        showSearch={false}
        pageSize={10}
      />

      {/* Record New Purchase Modal */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Record Material Purchase Order"
          maxWidth="640px"
        >
          <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="input-label">Select Site *</label>
              <select
                className="input-field"
                value={formData.site_name}
                onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                required
              >
                {allSitesList.length === 0 && <option value="">No Sites Registered</option>}
                {allSitesList.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="input-label">Department *</label>
                <select
                  className="input-field"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                >
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="input-label">Product / Material *</label>
                <select
                  className="input-field"
                  value={formData.material_category}
                  onChange={(e) => setFormData({ ...formData, material_category: e.target.value })}
                  required
                >
                  {PRODUCTS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="input-label">Supplier / Vendor Name *</label>
              <select
                className="input-field"
                value={formData.vendor_name}
                onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                required
              >
                <option value="">Select Supplier Name</option>
                {allSuppliersList.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="input-label">Total Purchase Amount (₹) *</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  className="input-field"
                  placeholder="0.00"
                  value={formData.total_amount}
                  onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="input-label">Date of Purchase *</label>
                <input
                  type="date"
                  className="input-field"
                  value={formData.order_date}
                  onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="input-label">Entered By *</label>
              <select
                className="input-field"
                value={formData.entered_by}
                onChange={(e) => setFormData({ ...formData, entered_by: e.target.value })}
                required
              >
                {ENTERED_BY_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="button" className="btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save Purchase (Sync to Firestore)
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Purchase Details Modal */}
      {viewingDetailPurchase && (
        <Modal
          isOpen={Boolean(viewingDetailPurchase)}
          onClose={() => setViewingDetailPurchase(null)}
          title={`Purchase Order Details - ${viewingDetailPurchase.purchase_id}`}
          maxWidth="600px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="mpl-detail-grid">
              <div className="mpl-detail-item">
                <span className="mpl-detail-label">PO Ref ID</span>
                <span className="mpl-detail-val" style={{ color: 'var(--accent-yellow-dark)' }}>
                  {viewingDetailPurchase.purchase_id}
                </span>
              </div>

              <div className="mpl-detail-item">
                <span className="mpl-detail-label">Site Name</span>
                <span className="mpl-detail-val">
                  {viewingDetailPurchase.site_name || 'N/A'}
                </span>
              </div>

              <div className="mpl-detail-item">
                <span className="mpl-detail-label">Department</span>
                <span className="mpl-detail-val">
                  {viewingDetailPurchase.department || 'Masonry'}
                </span>
              </div>

              <div className="mpl-detail-item">
                <span className="mpl-detail-label">Product / Material</span>
                <span className="mpl-detail-val">
                  {viewingDetailPurchase.material_category || 'Material'}
                </span>
              </div>

              <div className="mpl-detail-item">
                <span className="mpl-detail-label">Supplier / Vendor</span>
                <span className="mpl-detail-val">
                  {viewingDetailPurchase.vendor_name || 'N/A'}
                </span>
              </div>

              <div className="mpl-detail-item">
                <span className="mpl-detail-label">Date of Purchase</span>
                <span className="mpl-detail-val">
                  {viewingDetailPurchase.order_date || 'N/A'}
                </span>
              </div>

              <div className="mpl-detail-item">
                <span className="mpl-detail-label">Entered By</span>
                <span className="mpl-detail-val" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={15} style={{ color: 'var(--primary-yellow)' }} />
                  {viewingDetailPurchase.entered_by || 'Suriya prakash'}
                </span>
              </div>
            </div>

            {/* Financial Callout */}
            <div className="mpl-detail-callout">
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Total Purchase Value</span>
                <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  ₹{Number(viewingDetailPurchase.total_amount || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Amount Paid</span>
                <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--success-green)' }}>
                  ₹{Number(viewingDetailPurchase.calculated_paid ?? viewingDetailPurchase.amount_paid ?? 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Balance Due</span>
                <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--danger-red)' }}>
                  ₹{Number(viewingDetailPurchase.calculated_balance !== undefined ? viewingDetailPurchase.calculated_balance : Math.max(0, Number(viewingDetailPurchase.total_amount || 0) - Number(viewingDetailPurchase.amount_paid || 0))).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn-danger"
                onClick={() => {
                  deletePurchase(viewingDetailPurchase.purchase_id, viewingDetailPurchase.id);
                  setViewingDetailPurchase(null);
                }}
              >
                <Trash2 size={15} /> Delete PO
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setViewingDetailPurchase(null)}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
