import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  MapPin,
  Calendar,
  User,
  DollarSign,
  Layers,
  Edit3,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Briefcase,
  Wrench,
  Grid,
  List,
  AlertCircle,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import DataTable from '../../components/common/DataTable/DataTable';
import Modal from '../../components/common/Modal/Modal';
import CustomSelect from '../../components/common/CustomSelect/CustomSelect';
import CoverImageUploader from '../../components/common/CoverImageUploader/CoverImageUploader';
import MultiImageUploader from '../../components/common/MultiImageUploader/MultiImageUploader';
import CSVImportModal from '../../components/common/CSVImportModal/CSVImportModal';
import './CreateSiteModule.css';

const STRUCTURE_TYPES = [
  "Villa",
  "Residential House",
  "Commercial Building",
  "Renovation & Remodeling",
  "Industrial Warehouse",
  "Apartment Block"
];

const FLOOR_OPTIONS = [
  "G Floor",
  "G + 1 Floor",
  "G + 2 Floors",
  "G + 3 Floors",
  "G + 4 Floors",
  "Basement + G + 2 Floors"
];

const STATUS_OPTIONS = [
  "Planning",
  "Foundation Phase",
  "Structure Phase",
  "Finishing Phase",
  "In Progress",
  "On Hold",
  "Completed"
];

const CEMENT_BRANDS = [
  "UltraTech PPC (Premium)",
  "Ambuja PPC (Premium)",
  "ACC PPC (Premium)",
  "Dalmia DSP (High Strength)",
  "Ramco Supergrade"
];

const STEEL_BRANDS = [
  "TATA Tiscon 550D (High Strength)",
  "JSW Neosteel (Premium)",
  "SAIL TMT (Fe 550)",
  "Indus TMT (Fe 550D)"
];

const BRICKS_OPTIONS = [
  "Red Bricks (Premium)",
  "AAC Blocks (Lightweight)",
  "Fly Ash Bricks (Eco Friendly)",
  "Concrete Solid Blocks"
];

const FLOORING_OPTIONS = [
  "Vitrified Tiles (Premium)",
  "Italian Marble (Imported)",
  "Granite Flooring (Premium)",
  "Hardwood Wooden Flooring"
];

const FALLBACK_SITE_IMAGE = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%231e293b'/%3E%3Cstop offset='100%25' stop-color='%230f172a'/%3E%3C/linearGradient%3E%3ClinearGradient id='accent' x1='0%25' y1='0%25' x2='100%25' y2='0%25'%3E%3Cstop offset='0%25' stop-color='%23f59e0b'/%3E%3Cstop offset='100%25' stop-color='%23d97706'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23bg)'/%3E%3Cpath d='M200,350 L200,120 L320,120 L320,350 Z M340,350 L340,160 L440,160 L440,350 Z M460,350 L460,200 L580,200 L580,350 Z' fill='none' stroke='rgba(255,255,255,0.15)' stroke-width='4'/%3E%3Crect x='220' y='140' width='30' height='40' fill='rgba(245,158,11,0.3)'/%3E%3Crect x='265' y='140' width='30' height='40' fill='rgba(245,158,11,0.3)'/%3E%3Crect x='360' y='180' width='25' height='35' fill='rgba(245,158,11,0.3)'/%3E%3Crect x='400' y='180' width='25' height='35' fill='rgba(245,158,11,0.3)'/%3E%3Ctext x='400' y='270' font-family='sans-serif' font-size='22' font-weight='bold' fill='url(%23accent)' text-anchor='middle'%3EYELOLINE CONSTRUCTION SITE%3C/text%3E%3C/svg%3E";

const handleImgError = (e) => {
  e.target.onerror = null;
  e.target.src = FALLBACK_SITE_IMAGE;
};

const DEFAULT_FORM_DATA = {
  site_name: '',
  client_name: '',
  client_phone: '',
  client_email: '',
  location: '',
  structure_type: 'Villa',
  builtup_area_sqft: '',
  number_of_floors: 'G + 1 Floor',
  estimated_budget: '',
  supervisor_in_charge: '',
  start_date: new Date().toISOString().split('T')[0],
  target_completion_date: '',
  status: 'Planning',
  progress_percentage: 0,
  cement_brand: 'UltraTech PPC (Premium)',
  steel_brand: 'TATA Tiscon 550D (High Strength)',
  bricks_spec: 'Red Bricks (Premium)',
  flooring_spec: 'Vitrified Tiles (Premium)',
  description: '',
  cover_image: '',
  gallery_images: []
};

export default function CreateSiteModule() {
  const {
    sites,
    addSite,
    updateSite,
    deleteSite,
    importSites,
    SITE_COLUMNS_SPEC,
    exportToXLS,
    exportToPDF
  } = useApp();

  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStructureFilter, setSelectedStructureFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  const [viewingDetailSite, setViewingDetailSite] = useState(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [validationErrors, setValidationErrors] = useState({});

  // Filter logic
  const filteredSites = sites.filter(site => {
    const matchesSearch =
      site.site_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.site_id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStructure =
      selectedStructureFilter === 'ALL' || site.structure_type === selectedStructureFilter;

    const matchesStatus =
      selectedStatusFilter === 'ALL' || site.status === selectedStatusFilter;

    return matchesSearch && matchesStructure && matchesStatus;
  });

  // Calculate high-level stats
  const totalSitesCount = sites.length;
  const totalAreaSqft = sites.reduce((sum, s) => sum + Number(s.builtup_area_sqft || 0), 0);
  const totalBudgetVal = sites.reduce((sum, s) => sum + Number(s.estimated_budget || 0), 0);
  const activeOngoingCount = sites.filter(s => s.status !== 'Completed').length;

  const openCreateModal = () => {
    setEditingSite(null);
    setFormData(DEFAULT_FORM_DATA);
    setValidationErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (site) => {
    setEditingSite(site);
    setFormData({
      ...DEFAULT_FORM_DATA,
      ...site
    });
    setValidationErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.site_name.trim()) errors.site_name = "Site Name is required";
    if (!formData.client_name.trim()) errors.client_name = "Client Name is required";
    if (!formData.client_phone.trim()) errors.client_phone = "Client Contact Number is required";
    if (!formData.location.trim()) errors.location = "Site Location / Address is required";
    if (!formData.builtup_area_sqft || Number(formData.builtup_area_sqft) <= 0) {
      errors.builtup_area_sqft = "Valid Built-up Area is required";
    }
    if (!formData.estimated_budget || Number(formData.estimated_budget) <= 0) {
      errors.estimated_budget = "Valid Estimated Budget is required";
    }
    if (!formData.supervisor_in_charge.trim()) {
      errors.supervisor_in_charge = "Site Supervisor Name is required";
    }
    if (!formData.target_completion_date) {
      errors.target_completion_date = "Target Completion Date is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    if (editingSite) {
      updateSite(formData);
    } else {
      addSite(formData);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (site_id, site_name) => {
    if (window.confirm(`Are you sure you want to delete site "${site_name}" (${site_id})?`)) {
      deleteSite(site_id);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Completed':
        return 'status-badge-completed';
      case 'In Progress':
        return 'status-badge-progress';
      case 'Structure Phase':
        return 'status-badge-structure';
      case 'Foundation Phase':
        return 'status-badge-foundation';
      case 'Finishing Phase':
        return 'status-badge-finishing';
      case 'On Hold':
        return 'status-badge-hold';
      default:
        return 'status-badge-planning';
    }
  };

  // DataTable columns setup
  const columns = [
    {
      header: "Site ID",
      key: "site_id",
      render: (r) => <span className="site-id-pill">{r.site_id}</span>
    },
    {
      header: "Site & Location",
      key: "site_name",
      render: (r) => (
        <div>
          <div className="site-table-title">{r.site_name}</div>
          <div className="site-table-sub">
            <MapPin size={12} style={{ marginRight: '4px' }} />
            {r.location}
          </div>
        </div>
      )
    },
    {
      header: "Client Info",
      key: "client_name",
      render: (r) => (
        <div>
          <div className="site-table-client">{r.client_name}</div>
          <div className="site-table-phone">{r.client_phone}</div>
        </div>
      )
    },
    {
      header: "Type & Area",
      key: "structure_type",
      render: (r) => (
        <div>
          <span className="site-type-tag">{r.structure_type}</span>
          <div className="site-table-area">{Number(r.builtup_area_sqft).toLocaleString()} sq. ft.</div>
        </div>
      )
    },
    {
      header: "Budget (₹)",
      key: "estimated_budget",
      render: (r) => (
        <span className="site-table-budget">₹{Number(r.estimated_budget).toLocaleString('en-IN')}</span>
      )
    },
    {
      header: "Supervisor",
      key: "supervisor_in_charge",
      render: (r) => <span className="site-table-supervisor">{r.supervisor_in_charge}</span>
    },
    {
      header: "Status & Progress",
      key: "status",
      render: (r) => (
        <div>
          <span className={`site-status-badge ${getStatusBadgeClass(r.status)}`}>{r.status}</span>
          <div className="progress-bar-container" style={{ marginTop: '6px' }}>
            <div
              className="progress-bar-fill"
              style={{ width: `${r.progress_percentage || 0}%` }}
            />
          </div>
        </div>
      )
    },
    {
      header: "Actions",
      key: "actions",
      render: (r) => (
        <div className="action-buttons-group">
          <button
            className="action-btn action-btn-view"
            title="View Details"
            onClick={() => setViewingDetailSite(r)}
          >
            <Eye size={15} />
          </button>
          <button
            className="action-btn action-btn-edit"
            title="Edit Site"
            onClick={() => openEditModal(r)}
          >
            <Edit3 size={15} />
          </button>
          <button
            className="action-btn action-btn-delete"
            title="Delete Site"
            onClick={() => handleDelete(r.site_id, r.site_name)}
          >
            <Trash2 size={15} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="create-site-module">
      {/* Header Banner */}
      <div className="create-site-header">
        <div>
          <div className="module-title-row">
            <Building2 className="module-header-icon" size={28} />
            <h1 className="module-title">Construction Site Management</h1>
          </div>
          <p className="module-subtitle">
            Create, configure and manage construction sites with exact required parameters, specs, budget & engineering timelines.
          </p>
        </div>
        <div className="module-header-actions">
          <button
            className="btn btn-secondary"
            onClick={() => exportToXLS(filteredSites, 'Yeloline_Construction_Sites', 'Construction Site Management', SITE_COLUMNS_SPEC)}
          >
            <FileSpreadsheet size={16} />
            <span>Export XLS</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => exportToPDF(filteredSites, 'Yeloline_Construction_Sites', 'Construction Site Management', SITE_COLUMNS_SPEC)}
          >
            <FileText size={16} />
            <span>Export PDF</span>
          </button>

          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={18} />
            <span>Create New Site</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="site-metrics-grid">
        <div className="site-metric-card">
          <div className="metric-icon-wrapper yellow">
            <Building2 size={22} />
          </div>
          <div>
            <div className="metric-value">{totalSitesCount}</div>
            <div className="metric-label">Total Sites Registered</div>
          </div>
        </div>

        <div className="site-metric-card">
          <div className="metric-icon-wrapper blue">
            <Layers size={22} />
          </div>
          <div>
            <div className="metric-value">{totalAreaSqft.toLocaleString()} <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>sq ft</span></div>
            <div className="metric-label">Total Built-Up Area</div>
          </div>
        </div>

        <div className="site-metric-card">
          <div className="metric-icon-wrapper green">
            <DollarSign size={22} />
          </div>
          <div>
            <div className="metric-value">₹{(totalBudgetVal / 10000000).toFixed(2)} Cr</div>
            <div className="metric-label">Total Project Budget</div>
          </div>
        </div>

        <div className="site-metric-card">
          <div className="metric-icon-wrapper purple">
            <Clock size={22} />
          </div>
          <div>
            <div className="metric-value">{activeOngoingCount}</div>
            <div className="metric-label">Active Construction Sites</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="site-toolbar">
        <div className="search-box-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search site name, client, location, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="toolbar-filters">
          <CustomSelect
            icon={Filter}
            value={selectedStructureFilter}
            onChange={(val) => setSelectedStructureFilter(val)}
            options={[
              { value: "ALL", label: "All Structure Types" },
              ...STRUCTURE_TYPES.map(type => ({ value: type, label: type }))
            ]}
          />

          <CustomSelect
            value={selectedStatusFilter}
            onChange={(val) => setSelectedStatusFilter(val)}
            options={[
              { value: "ALL", label: "All Statuses" },
              ...STATUS_OPTIONS.map(status => ({ value: status, label: status }))
            ]}
          />

          <div className="view-mode-toggle">
            <button
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <Grid size={18} />
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area: Grid or Table */}
      {viewMode === 'grid' ? (
        <div className="site-cards-grid">
          {filteredSites.length > 0 ? (
            filteredSites.map(site => (
              <div key={site.site_id} className="site-card">
                {/* Cover Image Banner */}
                {site.cover_image ? (
                  <div className="site-card-cover-container">
                    <img
                      src={site.cover_image}
                      alt={site.site_name}
                      className="site-card-cover-img"
                      onError={handleImgError}
                    />
                    {site.gallery_images && site.gallery_images.length > 0 && (
                      <span className="site-card-photo-count">
                        📷 {site.gallery_images.length} photo{site.gallery_images.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="site-card-cover-placeholder">
                    <Building2 size={24} />
                    <span>No Cover Photo Uploaded</span>
                  </div>
                )}

                <div className="site-card-header">
                  <div>
                    <span className="site-card-id">{site.site_id}</span>
                    <h3 className="site-card-title">{site.site_name}</h3>
                  </div>
                  <span className={`site-status-badge ${getStatusBadgeClass(site.status)}`}>
                    {site.status}
                  </span>
                </div>

                <div className="site-card-location">
                  <MapPin size={15} />
                  <span>{site.location}</span>
                </div>

                <div className="site-card-progress">
                  <div className="progress-label-row">
                    <span>Construction Progress</span>
                    <span>{site.progress_percentage || 0}%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${site.progress_percentage || 0}%` }}
                    />
                  </div>
                </div>

                <div className="site-card-details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Client Name</span>
                    <span className="detail-val">{site.client_name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Built-up Area</span>
                    <span className="detail-val">{Number(site.builtup_area_sqft).toLocaleString()} sq ft</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Estimated Budget</span>
                    <span className="detail-val highlight">₹{Number(site.estimated_budget).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Structure Type</span>
                    <span className="detail-val">{site.structure_type}</span>
                  </div>
                </div>

                <div className="site-card-specs-pills">
                  <span className="spec-pill">{site.cement_brand?.split(' ')[0] || 'Cement'}</span>
                  <span className="spec-pill">{site.steel_brand?.split(' ')[0] || 'Steel'}</span>
                  <span className="spec-pill">{site.number_of_floors}</span>
                </div>

                <div className="site-card-footer">
                  <div className="supervisor-info">
                    <User size={14} />
                    <span>{site.supervisor_in_charge}</span>
                  </div>
                  <div className="site-card-actions">
                    <button
                      className="btn-icon btn-icon-view"
                      title="View Full Details"
                      onClick={() => setViewingDetailSite(site)}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="btn-icon btn-icon-edit"
                      title="Edit Site"
                      onClick={() => openEditModal(site)}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      className="btn-icon btn-icon-delete"
                      title="Delete Site"
                      onClick={() => handleDelete(site.site_id, site.site_name)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state-card">
              <Building2 size={42} />
              <h3>No Construction Sites Found</h3>
              <p>Try adjusting your search query or filters, or click "Create New Site" to add a new project site.</p>
              <button className="btn btn-primary" onClick={openCreateModal}>
                <Plus size={16} />
                <span>Create New Site</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="site-table-wrapper">
          <DataTable
            columns={columns}
            data={filteredSites}
            showSearch={false}
            pageSize={10}
            onRowClick={(row) => setViewingDetailSite(row)}
          />
        </div>
      )}

      {/* CREATE / EDIT SITE MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSite ? `Edit Site (${editingSite.site_id})` : "Create New Construction Site"}
        maxWidth="840px"
      >
        <form onSubmit={handleSubmit} className="site-form">
          {/* Section 1: Basic Site & Client Details */}
          <div className="form-section-header">
            <Building2 size={18} />
            <span>1. General Site Info & Client Details</span>
          </div>

          <div className="form-grid-2">
            <div className="form-field">
              <label className="field-label required">
                Site / Project Name <span className="required-star">*</span>
              </label>
              <input
                type="text"
                className={`form-input ${validationErrors.site_name ? 'error' : ''}`}
                placeholder="e.g. Modern Minimalist Villa - Perundurai"
                value={formData.site_name}
                onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
              />
              {validationErrors.site_name && (
                <span className="field-error-text"><AlertCircle size={12} /> {validationErrors.site_name}</span>
              )}
            </div>

            <div className="form-field">
              <label className="field-label required">
                Client / Owner Name <span className="required-star">*</span>
              </label>
              <input
                type="text"
                className={`form-input ${validationErrors.client_name ? 'error' : ''}`}
                placeholder="e.g. Ramesh Sundaram"
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
              />
              {validationErrors.client_name && (
                <span className="field-error-text"><AlertCircle size={12} /> {validationErrors.client_name}</span>
              )}
            </div>

            <div className="form-field">
              <label className="field-label required">
                Client Contact Number <span className="required-star">*</span>
              </label>
              <input
                type="text"
                className={`form-input ${validationErrors.client_phone ? 'error' : ''}`}
                placeholder="e.g. +91 98421 88321"
                value={formData.client_phone}
                onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
              />
              {validationErrors.client_phone && (
                <span className="field-error-text"><AlertCircle size={12} /> {validationErrors.client_phone}</span>
              )}
            </div>

            <div className="form-field">
              <label className="field-label">Client Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="e.g. ramesh.s@gmail.com"
                value={formData.client_email}
                onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
              />
            </div>

            <div className="form-field full-width">
              <label className="field-label required">
                Site Location / Full Address <span className="required-star">*</span>
              </label>
              <input
                type="text"
                className={`form-input ${validationErrors.location ? 'error' : ''}`}
                placeholder="e.g. Perundurai Road, Near Golden City, Erode"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
              {validationErrors.location && (
                <span className="field-error-text"><AlertCircle size={12} /> {validationErrors.location}</span>
              )}
            </div>
          </div>

          {/* Section 2: Structure Parameters & Financial Estimates */}
          <div className="form-section-header margin-top">
            <Layers size={18} />
            <span>2. Structure Parameters & Financial Budget</span>
          </div>

          <div className="form-grid-3">
            <div className="form-field">
              <label className="field-label required">
                Structure / Project Type <span className="required-star">*</span>
              </label>
              <select
                className="form-select"
                value={formData.structure_type}
                onChange={(e) => setFormData({ ...formData, structure_type: e.target.value })}
              >
                {STRUCTURE_TYPES.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label className="field-label required">
                Built-up Area (sq. ft.) <span className="required-star">*</span>
              </label>
              <input
                type="number"
                className={`form-input ${validationErrors.builtup_area_sqft ? 'error' : ''}`}
                placeholder="e.g. 3200"
                value={formData.builtup_area_sqft}
                onChange={(e) => setFormData({ ...formData, builtup_area_sqft: e.target.value })}
              />
              {validationErrors.builtup_area_sqft && (
                <span className="field-error-text"><AlertCircle size={12} /> {validationErrors.builtup_area_sqft}</span>
              )}
            </div>

            <div className="form-field">
              <label className="field-label required">
                Number of Floors <span className="required-star">*</span>
              </label>
              <select
                className="form-select"
                value={formData.number_of_floors}
                onChange={(e) => setFormData({ ...formData, number_of_floors: e.target.value })}
              >
                {FLOOR_OPTIONS.map(fl => (
                  <option key={fl} value={fl}>{fl}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label className="field-label required">
                Estimated Budget (₹) <span className="required-star">*</span>
              </label>
              <input
                type="number"
                className={`form-input ${validationErrors.estimated_budget ? 'error' : ''}`}
                placeholder="e.g. 7200000"
                value={formData.estimated_budget}
                onChange={(e) => setFormData({ ...formData, estimated_budget: e.target.value })}
              />
              {validationErrors.estimated_budget && (
                <span className="field-error-text"><AlertCircle size={12} /> {validationErrors.estimated_budget}</span>
              )}
            </div>

            <div className="form-field">
              <label className="field-label required">
                Supervisor / Lead Engineer <span className="required-star">*</span>
              </label>
              <input
                type="text"
                className={`form-input ${validationErrors.supervisor_in_charge ? 'error' : ''}`}
                placeholder="e.g. Er. S. Prakash (Senior Engineer)"
                value={formData.supervisor_in_charge}
                onChange={(e) => setFormData({ ...formData, supervisor_in_charge: e.target.value })}
              />
              {validationErrors.supervisor_in_charge && (
                <span className="field-error-text"><AlertCircle size={12} /> {validationErrors.supervisor_in_charge}</span>
              )}
            </div>

            <div className="form-field">
              <label className="field-label">Progress Percentage (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="form-input"
                placeholder="0 - 100"
                value={formData.progress_percentage}
                onChange={(e) => setFormData({ ...formData, progress_percentage: e.target.value })}
              />
            </div>
          </div>

          {/* Section 3: Timeline & Construction Status */}
          <div className="form-section-header margin-top">
            <Calendar size={18} />
            <span>3. Timeline & Construction Status</span>
          </div>

          <div className="form-grid-3">
            <div className="form-field">
              <label className="field-label required">
                Start Date <span className="required-star">*</span>
              </label>
              <input
                type="date"
                className="form-input"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label className="field-label required">
                Target Completion Date <span className="required-star">*</span>
              </label>
              <input
                type="date"
                className={`form-input ${validationErrors.target_completion_date ? 'error' : ''}`}
                value={formData.target_completion_date}
                onChange={(e) => setFormData({ ...formData, target_completion_date: e.target.value })}
              />
              {validationErrors.target_completion_date && (
                <span className="field-error-text"><AlertCircle size={12} /> {validationErrors.target_completion_date}</span>
              )}
            </div>

            <div className="form-field">
              <label className="field-label required">
                Current Status <span className="required-star">*</span>
              </label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                {STATUS_OPTIONS.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 4: Yeloline Standard Specifications */}
          <div className="form-section-header margin-top">
            <Wrench size={18} />
            <span>4. Construction Material Specifications</span>
          </div>

          <div className="form-grid-2">
            <div className="form-field">
              <label className="field-label">Cement Brand Spec</label>
              <select
                className="form-select"
                value={formData.cement_brand}
                onChange={(e) => setFormData({ ...formData, cement_brand: e.target.value })}
              >
                {CEMENT_BRANDS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label className="field-label">Steel Brand Spec</label>
              <select
                className="form-select"
                value={formData.steel_brand}
                onChange={(e) => setFormData({ ...formData, steel_brand: e.target.value })}
              >
                {STEEL_BRANDS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label className="field-label">Bricks / Blocks Spec</label>
              <select
                className="form-select"
                value={formData.bricks_spec}
                onChange={(e) => setFormData({ ...formData, bricks_spec: e.target.value })}
              >
                {BRICKS_OPTIONS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label className="field-label">Flooring Spec</label>
              <select
                className="form-select"
                value={formData.flooring_spec}
                onChange={(e) => setFormData({ ...formData, flooring_spec: e.target.value })}
              >
                {FLOORING_OPTIONS.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 5: Site Images & Media */}
          <div className="form-section-header margin-top">
            <Briefcase size={18} />
            <span>5. Cover Photo & Project Gallery Photos (Drag & Drop or Click to Upload)</span>
          </div>

          <div className="form-field full-width">
            <label className="field-label">Primary Banner / Cover Image (Drag & Drop or Click to Upload)</label>
            <CoverImageUploader
              value={formData.cover_image}
              onChange={(url) => setFormData({ ...formData, cover_image: url })}
            />
          </div>

          <div className="form-field full-width margin-top-sm">
            <label className="field-label">Project Gallery & Progress Photos (Drag & Drop Multiple Images or Click to Upload)</label>
            <MultiImageUploader
              images={formData.gallery_images}
              onChange={(imgs) => setFormData({ ...formData, gallery_images: imgs })}
            />
          </div>

          {/* Section 6: Description */}
          <div className="form-section-header margin-top">
            <Briefcase size={18} />
            <span>6. Architectural Notes & Site Description</span>
          </div>

          <div className="form-field full-width">
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="e.g. Key client preferences, specialized foundation requirements, solar roof specs, or architectural notes..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="modal-form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle2 size={16} />
              <span>{editingSite ? 'Save Changes' : 'Create Site Record'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* VIEW SITE DETAIL MODAL */}
      <Modal
        isOpen={!!viewingDetailSite}
        onClose={() => setViewingDetailSite(null)}
        title={`Site Overview: ${viewingDetailSite?.site_name || ''}`}
        maxWidth="750px"
      >
        {viewingDetailSite && (
          <div className="site-detail-modal-body">
            {viewingDetailSite.cover_image && (
              <div className="detail-modal-cover-banner">
                <img src={viewingDetailSite.cover_image} alt={viewingDetailSite.site_name} onError={handleImgError} />
              </div>
            )}

            <div className="detail-modal-header-strip">
              <div>
                <span className="site-id-pill large">{viewingDetailSite.site_id}</span>
                <h2 className="detail-modal-title">{viewingDetailSite.site_name}</h2>
                <div className="detail-modal-sub">
                  <MapPin size={14} />
                  <span>{viewingDetailSite.location}</span>
                </div>
              </div>
              <span className={`site-status-badge large ${getStatusBadgeClass(viewingDetailSite.status)}`}>
                {viewingDetailSite.status}
              </span>
            </div>

            <div className="detail-modal-section">
              <h4>Construction Timeline & Progress</h4>
              <div className="progress-bar-container large">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${viewingDetailSite.progress_percentage || 0}%` }}
                />
              </div>
              <div className="timeline-meta-row">
                <span>Start Date: <strong>{viewingDetailSite.start_date}</strong></span>
                <span>Completion Target: <strong>{viewingDetailSite.target_completion_date}</strong></span>
                <span>Progress: <strong>{viewingDetailSite.progress_percentage || 0}%</strong></span>
              </div>
            </div>

            <div className="detail-modal-grid-2">
              <div className="detail-modal-box">
                <h4>Client & Contacts</h4>
                <p><strong>Name:</strong> {viewingDetailSite.client_name}</p>
                <p><strong>Phone:</strong> {viewingDetailSite.client_phone}</p>
                <p><strong>Email:</strong> {viewingDetailSite.client_email || 'N/A'}</p>
              </div>

              <div className="detail-modal-box">
                <h4>Engineering & Management</h4>
                <p><strong>Site Supervisor:</strong> {viewingDetailSite.supervisor_in_charge}</p>
                <p><strong>Built-Up Area:</strong> {Number(viewingDetailSite.builtup_area_sqft).toLocaleString()} sq ft</p>
                <p><strong>Estimated Budget:</strong> ₹{Number(viewingDetailSite.estimated_budget).toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="detail-modal-section margin-top">
              <h4>Material & Construction Specs</h4>
              <div className="specs-list-grid">
                <div className="spec-card">
                  <span className="spec-card-title">Cement Specification</span>
                  <span className="spec-card-val">{viewingDetailSite.cement_brand || 'N/A'}</span>
                </div>
                <div className="spec-card">
                  <span className="spec-card-title">Steel Specification</span>
                  <span className="spec-card-val">{viewingDetailSite.steel_brand || 'N/A'}</span>
                </div>
                <div className="spec-card">
                  <span className="spec-card-title">Masonry Bricks</span>
                  <span className="spec-card-val">{viewingDetailSite.bricks_spec || 'N/A'}</span>
                </div>
                <div className="spec-card">
                  <span className="spec-card-title">Flooring Type</span>
                  <span className="spec-card-val">{viewingDetailSite.flooring_spec || 'N/A'}</span>
                </div>
              </div>
            </div>

            {viewingDetailSite.gallery_images && viewingDetailSite.gallery_images.length > 0 && (
              <div className="detail-modal-section margin-top">
                <h4>Project Photos & Progress Gallery ({viewingDetailSite.gallery_images.length})</h4>
                <div className="detail-modal-gallery-grid">
                  {viewingDetailSite.gallery_images.map((img, i) => (
                    <div key={img.id || i} className="detail-gallery-thumb-card">
                      <img src={img.url} alt={`Gallery ${i}`} onError={handleImgError} />
                      {img.tag && <span className="detail-gallery-tag">{img.tag}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewingDetailSite.description && (
              <div className="detail-modal-section margin-top">
                <h4>Architectural Notes</h4>
                <p className="detail-description-text">{viewingDetailSite.description}</p>
              </div>
            )}

            <div className="modal-form-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setViewingDetailSite(null)}
              >
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  const siteToEdit = viewingDetailSite;
                  setViewingDetailSite(null);
                  openEditModal(siteToEdit);
                }}
              >
                <Edit3 size={15} />
                <span>Edit Site Parameters</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        columnsSpec={SITE_COLUMNS_SPEC}
        onImport={(data) => {
          importSites(data);
          setIsImportModalOpen(false);
        }}
        sampleRow={{
          site_id: "SITE-105",
          site_name: "Modern Minimalist Villa - Perundurai",
          client_name: "Ramesh Sundaram",
          client_phone: "+91 98421 88321",
          client_email: "ramesh.s@gmail.com",
          location: "Perundurai Road, Erode",
          structure_type: "Villa",
          builtup_area_sqft: 3200,
          number_of_floors: "G + 1 Floor",
          estimated_budget: 7200000,
          supervisor_in_charge: "Er. S. Prakash",
          start_date: "2026-02-15",
          target_completion_date: "2026-11-30",
          status: "In Progress",
          progress_percentage: 65,
          cement_brand: "UltraTech PPC (Premium)",
          steel_brand: "TATA Tiscon 550D",
          bricks_spec: "Red Bricks (Premium)",
          flooring_spec: "Vitrified Tiles (Premium)",
          description: "4BHK luxury villa"
        }}
      />
    </div>
  );
}
