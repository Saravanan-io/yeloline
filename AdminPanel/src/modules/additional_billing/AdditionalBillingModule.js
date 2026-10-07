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
  Eye,
  Building,
  Layers,
  Search,
  CheckCircle2
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
    monthlyBillings = [],
    paymentBreakups = [],
    addAdditionalBilling,
    updateAdditionalBilling,
    deleteAdditionalBilling,
    exportToXLS,
    exportToPDF
  } = useApp();

  const [selectedSiteFilter, setSelectedSiteFilter] = useState('ALL');
  const [siteSearchQuery, setSiteSearchQuery] = useState('');
  const [updateSuccessNotice, setUpdateSuccessNotice] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [previewBill, setPreviewBill] = useState(null);

  // Robustly aggregate all registered project sites
  const allAvailableSites = useMemo(() => {
    const siteMap = new Map();

    // 1. Sites from sites collection
    (sites || []).forEach(s => {
      const name = (s.site_name || s.name || s.title || '').trim();
      if (name) {
        siteMap.set(name.toLowerCase(), {
          id: s.site_id || s.id || name,
          site_name: name,
          client_name: s.client_name || s.clientName || '',
          client_phone: s.client_phone || s.phone || '',
          location: s.site_address || s.location || s.city || '',
          status: s.status || 'In Progress',
          raw: s
        });
      }
    });

    // 2. Check monthlyBillings
    (monthlyBillings || []).forEach(m => {
      const name = (m.site_name || '').trim();
      if (name && !siteMap.has(name.toLowerCase())) {
        siteMap.set(name.toLowerCase(), {
          id: m.id || name,
          site_name: name,
          client_name: m.client_name || m.client_title || '',
          client_phone: '',
          location: '',
          status: 'Active',
          raw: m
        });
      }
    });

    // 3. Check paymentBreakups
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

  // Statistics for each site
  const siteStats = useMemo(() => {
    const stats = {};
    allAvailableSites.forEach(s => {
      const siteBills = (additionalBillings || []).filter(b => {
        const bName = (b.site_name || b.siteName || '').trim().toLowerCase();
        const bId = (b.site_id || b.siteId || '').trim().toLowerCase();
        const sName = s.site_name.toLowerCase();
        const sId = (s.id || '').toLowerCase();
        return bName === sName || (bId && bId === sId) || (sName && bName.includes(sName));
      });
      const totalAmount = siteBills.reduce((acc, b) => acc + Number(b.amount ?? b.quoted_amount ?? 0), 0);
      stats[s.site_name] = {
        count: siteBills.length,
        totalAmount,
        bills: siteBills
      };
    });
    return stats;
  }, [allAvailableSites, additionalBillings]);

  // Filtered sites for search bar
  const filteredSitesList = useMemo(() => {
    if (!siteSearchQuery.trim()) return allAvailableSites;
    const q = siteSearchQuery.toLowerCase();
    return allAvailableSites.filter(s =>
      s.site_name.toLowerCase().includes(q) ||
      (s.client_name && s.client_name.toLowerCase().includes(q)) ||
      (s.location && s.location.toLowerCase().includes(q))
    );
  }, [allAvailableSites, siteSearchQuery]);

  // Currently selected site object
  const currentSelectedSiteObj = useMemo(() => {
    if (selectedSiteFilter === 'ALL') return null;
    return allAvailableSites.find(s => s.site_name.toLowerCase() === selectedSiteFilter.toLowerCase()) || null;
  }, [selectedSiteFilter, allAvailableSites]);

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
    const initialSite = selectedSiteFilter !== 'ALL'
      ? selectedSiteFilter
      : (allAvailableSites[0]?.site_name || '');
    const matched = allAvailableSites.find(s => s.site_name.toLowerCase() === initialSite.toLowerCase());

    setEditingBill(null);
    setFormData({
      site_name: initialSite,
      client_name: matched?.client_name || '',
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

  const handleOpenAddModalForSite = (siteName) => {
    const matched = allAvailableSites.find(s => s.site_name.toLowerCase() === siteName.toLowerCase());
    setEditingBill(null);
    setFormData({
      site_name: siteName,
      client_name: matched?.client_name || '',
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
    const q = bill.quoted_amount ?? bill.amount ?? '';
    const exp = bill.expense_amount ?? '';
    const amt = bill.amount !== undefined && bill.amount !== null && bill.amount !== ''
      ? bill.amount
      : (q !== '' ? (Number(q) - Number(exp || 0)).toString() : '');

    setFormData({
      site_name: bill.site_name || bill.siteName || '',
      client_name: bill.client_name || '',
      category: bill.category || WORK_CATEGORIES[0],
      work_description: bill.work_description || bill.description || '',
      quoted_amount: q,
      expense_amount: exp,
      amount: amt,
      bill_date: bill.bill_date || bill.billing_date || new Date().toISOString().split('T')[0],
      status: bill.status || 'Pending Approval',
      notes: bill.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleQuotedAmountChange = (val) => {
    setFormData(prev => {
      const q = val === '' ? '' : parseFloat(val);
      const e = prev.expense_amount === '' ? 0 : (parseFloat(prev.expense_amount) || 0);
      let calculatedAmount = prev.amount;
      if (val !== '') {
        calculatedAmount = (q - e).toString();
      } else {
        calculatedAmount = '';
      }
      return {
        ...prev,
        quoted_amount: val,
        amount: calculatedAmount
      };
    });
  };

  const handleExpenseAmountChange = (val) => {
    setFormData(prev => {
      const e = val === '' ? 0 : (parseFloat(val) || 0);
      const q = prev.quoted_amount === '' ? 0 : (parseFloat(prev.quoted_amount) || 0);
      let calculatedAmount = prev.amount;
      if (prev.quoted_amount !== '') {
        calculatedAmount = (q - e).toString();
      }
      return {
        ...prev,
        expense_amount: val,
        amount: calculatedAmount
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.work_description) {
      alert('Please fill in the description of the additional work');
      return;
    }
    if (!formData.site_name) {
      alert('Please select a site for this additional work');
      return;
    }

    const quoted = Number(formData.quoted_amount) || 0;
    const expense = Number(formData.expense_amount) || 0;
    const finalAmt = formData.amount !== '' && formData.amount !== null && formData.amount !== undefined
      ? Number(formData.amount)
      : (quoted - expense);

    const matchingSite = allAvailableSites.find(s => s.site_name.toLowerCase() === formData.site_name.toLowerCase()) || {};

    const payload = {
      ...formData,
      site_name: formData.site_name.trim(),
      siteName: formData.site_name.trim(),
      site_id: matchingSite.id || matchingSite.site_id || formData.site_name.trim(),
      siteId: matchingSite.id || matchingSite.site_id || formData.site_name.trim(),
      client_name: formData.client_name || matchingSite.client_name || '',
      client_phone: matchingSite.client_phone || '',
      quoted_amount: quoted,
      expense_amount: expense,
      amount: finalAmt,
      bill_date: formData.bill_date,
      billing_date: formData.bill_date,
      date: formData.bill_date,
      work_description: formData.work_description.trim(),
      description: formData.work_description.trim(),
      updated_at: new Date().toISOString()
    };

    if (editingBill) {
      await updateAdditionalBilling(editingBill.bill_id || editingBill.id, payload);
      setUpdateSuccessNotice(`Successfully updated additional work for "${payload.site_name}"! Synced to Client Portal in real-time.`);
    } else {
      await addAdditionalBilling(payload);
      setUpdateSuccessNotice(`Successfully created additional work for "${payload.site_name}"! Synced to Client Portal in real-time.`);
    }

    setTimeout(() => setUpdateSuccessNotice(''), 5000);
    setIsModalOpen(false);
  };

  const handleDelete = async (billId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this additional billing record?')) {
      await deleteAdditionalBilling(billId);
      setUpdateSuccessNotice('Additional billing record deleted.');
      setTimeout(() => setUpdateSuccessNotice(''), 3000);
    }
  };

  const handleQuickStatusChange = async (bill, newStatus) => {
    await updateAdditionalBilling(bill.bill_id || bill.id, {
      ...bill,
      status: newStatus,
      updated_at: new Date().toISOString()
    });
    setUpdateSuccessNotice(`Updated status to "${newStatus}" for ${bill.site_name || 'site'}! Synced to Client Portal in real-time.`);
    setTimeout(() => setUpdateSuccessNotice(''), 4000);
  };

  const filteredBillings = additionalBillings.filter(b => {
    const bSite = (b.site_name || b.siteName || '').trim();
    const bId = (b.site_id || b.siteId || '').trim();
    const matchesSite = selectedSiteFilter === 'ALL' ||
      bSite.toLowerCase() === selectedSiteFilter.toLowerCase() ||
      (currentSelectedSiteObj && (bId === currentSelectedSiteObj.id || bSite.toLowerCase().includes(selectedSiteFilter.toLowerCase())));
    return matchesSite;
  });

  const enrichedBillings = useMemo(() => {
    return filteredBillings.map((b, idx) => ({
      ...b,
      sno: idx + 1
    }));
  }, [filteredBillings]);

  const totalQuotedValue = filteredBillings.reduce((acc, b) => acc + Number(b.quoted_amount ?? b.amount ?? 0), 0);
  const totalExpenseValue = filteredBillings.reduce((acc, b) => acc + Number(b.expense_amount ?? 0), 0);
  const totalBilledValue = filteredBillings.reduce((acc, b) => {
    const val = b.amount !== undefined && b.amount !== null && b.amount !== ''
      ? Number(b.amount)
      : (Number(b.quoted_amount ?? 0) - Number(b.expense_amount ?? 0));
    return acc + val;
  }, 0);
  const totalPaidValue = filteredBillings
    .filter(b => b.status === 'Paid')
    .reduce((acc, b) => {
      const val = b.amount !== undefined && b.amount !== null && b.amount !== ''
        ? Number(b.amount)
        : (Number(b.quoted_amount ?? 0) - Number(b.expense_amount ?? 0));
      return acc + val;
    }, 0);

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
            {r.work_description || r.description}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--accent-yellow-dark)', fontWeight: '700' }}>{r.bill_id || r.id}</span>
            <span>•</span>
            <span style={{ fontWeight: '600' }}>{r.site_name || 'General Site'}{r.client_name ? ` (${r.client_name})` : ''}</span>
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
      render: (r) => {
        const amt = r.amount !== undefined && r.amount !== null && r.amount !== ''
          ? Number(r.amount)
          : (Number(r.quoted_amount ?? 0) - Number(r.expense_amount ?? 0));
        return (
          <strong style={{ fontSize: '0.96rem', color: '#0F172A', whiteSpace: 'nowrap', fontWeight: '800', fontFamily: 'monospace' }}>
            ₹{amt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </strong>
        );
      }
    },
    {
      header: "Date",
      key: "bill_date",
      render: (r) => <span style={{ whiteSpace: 'nowrap', fontSize: '0.84rem' }}>{r.bill_date || r.billing_date || r.date}</span>
    },
    {
      header: "Status",
      key: "status",
      render: (r) => (
        <div className="status-dropdown-wrap" onClick={(e) => e.stopPropagation()}>
          <select
            className={`quick-status-select status-${(r.status || 'Pending Approval').toLowerCase().replace(/\s+/g, '-')}`}
            value={r.status || 'Pending Approval'}
            onChange={(e) => handleQuickStatusChange(r, e.target.value)}
            title="Click to update status instantly (syncs with client app)"
          >
            {BILL_STATUSES.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      )
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
            title="Edit / Update Record"
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
                work_description: b.work_description || b.description,
                quoted_amount: `₹${Number(b.quoted_amount ?? b.amount ?? 0).toLocaleString('en-IN')}`,
                expense_amount: `₹${Number(b.expense_amount ?? 0).toLocaleString('en-IN')}`,
                amount: `₹${Number(b.amount ?? b.quoted_amount ?? 0).toLocaleString('en-IN')}`,
                site_name: b.site_name,
                bill_date: b.bill_date || b.billing_date,
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
          subtext={selectedSiteFilter === 'ALL' ? "Variation orders across all sites" : `Bills for ${selectedSiteFilter}`}
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

      {/* ==================================================================== */}
      {/* 1. All Registered Sites Selector Cards Section */}
      {/* ==================================================================== */}
      <div className="sites-selector-section">
        <div className="sites-section-header">
          <div className="sites-title-wrap">
            <Building size={20} className="section-title-icon" />
            <div>
              <div className="sites-section-title">
                Registered Sites & Client Projects
                <span className="sites-count-badge">{allAvailableSites.length} Sites Available</span>
              </div>
              <div className="sites-section-subtitle">
                Click any site below to view, add, or update additional work items synced directly with that client's app
              </div>
            </div>
          </div>
          <div className="sites-search-wrap">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              className="sites-search-input"
              placeholder="Search project sites..."
              value={siteSearchQuery}
              onChange={(e) => setSiteSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="sites-cards-grid">
          {/* All Sites Card */}
          <div
            className={`site-card-item ${selectedSiteFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedSiteFilter('ALL')}
          >
            <div className="site-card-top">
              <div className="site-icon-box all-sites-icon">
                <Layers size={18} />
              </div>
              <div className="site-card-heading">
                <div className="site-card-name">All Registered Sites</div>
                <div className="site-card-client">Entire organization view</div>
              </div>
              {selectedSiteFilter === 'ALL' && <span className="active-pill">Selected</span>}
            </div>
            <div className="site-card-footer">
              <span className="works-badge">{additionalBillings.length} total works</span>
              <span className="site-total-val">₹{(additionalBillings.reduce((acc, b) => acc + Number(b.amount ?? b.quoted_amount ?? 0), 0) / 100000).toFixed(2)}L</span>
            </div>
          </div>

          {/* Individual Site Cards */}
          {filteredSitesList.map(site => {
            const isSelected = selectedSiteFilter.toLowerCase() === site.site_name.toLowerCase();
            const stat = siteStats[site.site_name] || { count: 0, totalAmount: 0 };
            return (
              <div
                key={site.id || site.site_name}
                className={`site-card-item ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedSiteFilter(site.site_name)}
              >
                <div className="site-card-top">
                  <div className="site-icon-box">
                    <Building size={18} />
                  </div>
                  <div className="site-card-heading">
                    <div className="site-card-name" title={site.site_name}>{site.site_name}</div>
                    <div className="site-card-client" title={site.client_name}>
                      {site.client_name ? `Client: ${site.client_name}` : 'Registered Client'}
                      {site.location ? ` • ${site.location}` : ''}
                    </div>
                  </div>
                  {isSelected && <span className="active-pill">Selected</span>}
                </div>
                <div className="site-card-footer">
                  <span className={`works-badge ${stat.count > 0 ? 'has-items' : ''}`}>
                    {stat.count} {stat.count === 1 ? 'extra work' : 'extra works'}
                  </span>
                  <span className="site-total-val">
                    ₹{Number(stat.totalAmount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. Active Site Action Bar (Appears when specific site is chosen) */}
      {/* ==================================================================== */}
      {selectedSiteFilter !== 'ALL' && (
        <div className="site-active-action-bar">
          <div className="active-site-info">
            <span className="active-site-label">ACTIVE SITE</span>
            <span className="active-site-name">{selectedSiteFilter}</span>
            {currentSelectedSiteObj?.client_name && (
              <span className="active-site-client">
                Client: <strong>{currentSelectedSiteObj.client_name}</strong>
                {currentSelectedSiteObj.client_phone ? ` (${currentSelectedSiteObj.client_phone})` : ''}
                {currentSelectedSiteObj.location ? ` • ${currentSelectedSiteObj.location}` : ''}
              </span>
            )}
          </div>
          <div className="active-site-actions">
            <button
              className="btn-primary"
              onClick={() => handleOpenAddModalForSite(selectedSiteFilter)}
            >
              <Plus size={16} /> + Add Additional Work for {selectedSiteFilter}
            </button>
            <button
              className="btn-secondary"
              onClick={() => setSelectedSiteFilter('ALL')}
            >
              View All Sites
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* Live Sync Notice Banner */}
      {/* ==================================================================== */}
      {updateSuccessNotice && (
        <div className="update-success-banner">
          <CheckCircle2 size={18} />
          <span>{updateSuccessNotice}</span>
          <button className="close-notice-btn" onClick={() => setUpdateSuccessNotice('')}>✕</button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="filters-card">
        <div className="filter-group">
          <label className="filter-label"><Filter size={14} /> Filter Site:</label>
          <select
            className="form-control filter-select"
            value={selectedSiteFilter}
            onChange={(e) => setSelectedSiteFilter(e.target.value)}
          >
            <option value="ALL">All Registered Sites ({allAvailableSites.length})</option>
            {allAvailableSites.map(site => (
              <option key={site.id || site.site_name} value={site.site_name}>{site.site_name}</option>
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
        {selectedSiteFilter !== 'ALL' && (
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-yellow-dark)' }}>
            Showing records for: {selectedSiteFilter}
          </span>
        )}
      </div>

      {/* Empty State for specific site with 0 records */}
      {selectedSiteFilter !== 'ALL' && enrichedBillings.length === 0 ? (
        <div className="empty-site-works-card">
          <div className="empty-site-icon-wrap">
            <Building size={32} color="#D97706" />
          </div>
          <h3>No Additional Work Recorded Yet for "{selectedSiteFilter}"</h3>
          <p>
            Client: <strong>{currentSelectedSiteObj?.client_name || 'Registered Client'}</strong>
            {currentSelectedSiteObj?.location ? ` • ${currentSelectedSiteObj.location}` : ''}
          </p>
          <p className="empty-site-desc">
            When you add extra scope variations, modifications, or material upgrades for this site, they will automatically sync and update in that client's mobile/web portal in real time.
          </p>
          <button
            className="btn-primary"
            style={{ marginTop: '12px' }}
            onClick={() => handleOpenAddModalForSite(selectedSiteFilter)}
          >
            <Plus size={16} /> + Add First Additional Work for {selectedSiteFilter}
          </button>
        </div>
      ) : (
        /* Main Table with S.No., Description, Quoted Amount, Expense Amount, Amount in Rs. */
        <DataTable
          columns={tableColumns}
          data={enrichedBillings}
          pageSize={10}
          onRowClick={(row) => setPreviewBill(row)}
        />
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingBill ? `Edit Additional Bill - ${editingBill.bill_id || editingBill.id}` : "Create New Additional Bill"}
          maxWidth="720px"
        >
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label className="form-label">
                Site / Project Name <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <select
                className="form-control"
                value={formData.site_name}
                onChange={(e) => {
                  const sName = e.target.value;
                  const matched = allAvailableSites.find(s => s.site_name.toLowerCase() === sName.toLowerCase());
                  setFormData(prev => ({
                    ...prev,
                    site_name: sName,
                    client_name: matched?.client_name || prev.client_name
                  }));
                }}
                required
              >
                <option value="">-- Select Project Site --</option>
                {allAvailableSites.map(s => (
                  <option key={s.id || s.site_name} value={s.site_name}>
                    {s.site_name} {s.client_name ? `(${s.client_name})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row-2col">
              <div className="form-group">
                <label className="form-label">Client Name</label>
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
                Description of Additional Work <span style={{ color: '#EF4444' }}>*</span>
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
                  placeholder="e.g. 50000"
                  value={formData.quoted_amount}
                  onChange={(e) => handleQuotedAmountChange(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Expense Amount (₹)</label>
                <input
                  type="number"
                  step="any"
                  className="form-control"
                  placeholder="e.g. 25000"
                  value={formData.expense_amount}
                  onChange={(e) => handleExpenseAmountChange(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Amount in Rs. (₹) <span style={{ color: '#EF4444' }}>*</span>
                  <span style={{ fontSize: '0.74rem', fontWeight: '500', color: '#64748B', marginLeft: '6px' }}>
                    (Quoted - Expense)
                  </span>
                </label>
                <input
                  type="number"
                  step="any"
                  className="form-control"
                  placeholder="e.g. 25000"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
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
                {editingBill ? 'Update Additional Work' : 'Create Bill Record'}
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
                <span className="meta-label">Date:</span> <span>{previewBill.bill_date || previewBill.billing_date || previewBill.date}</span>
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
                    <td style={{ fontWeight: 600 }}>{previewBill.work_description || previewBill.description}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      ₹{Number(previewBill.quoted_amount ?? previewBill.amount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      ₹{Number(previewBill.expense_amount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 800 }}>
                      ₹{Number(previewBill.amount !== undefined && previewBill.amount !== null && previewBill.amount !== '' ? previewBill.amount : (Number(previewBill.quoted_amount ?? 0) - Number(previewBill.expense_amount ?? 0))).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                      ₹{Number(previewBill.amount !== undefined && previewBill.amount !== null && previewBill.amount !== '' ? previewBill.amount : (Number(previewBill.quoted_amount ?? 0) - Number(previewBill.expense_amount ?? 0))).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
