import React, { useState, useEffect, useRef } from 'react';
import {
  Sliders,
  Plus,
  Search,
  Edit3,
  Trash2,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Layers,
  Box,
  Building2,
  DollarSign,
  CreditCard,
  ShoppingCart,
  Wrench,
  Users,
  TrendingUp,
  Grid,
  Maximize,
  LayoutGrid,
  List,
  Tag,
  Filter,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Modal from '../../components/common/Modal/Modal';
import CustomSelect from '../../components/common/CustomSelect/CustomSelect';
import DataTable from '../../components/common/DataTable/DataTable';
import './AdminMasterModule.css';

const PRESET_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#EF4444', '#EAB308', '#64748B'
];

const GROUP_TITLES = {
  All: {
    title: "Admin Master Data & Dropdowns",
    subtitle: "Configure dynamic dropdown lookup values, construction specifications, and system status options across Yeloline"
  },
  Leads: {
    title: "Leads & Enquiries Master",
    subtitle: "Manage Lead Stages, Quote Enquiries, and Structure Types dropdown options"
  },
  Materials: {
    title: "Construction Specifications Master",
    subtitle: "Manage Cement Brands, Steel Brands, Bricks & Blocks, Flooring, Doors & Windows specs"
  },
  Finance: {
    title: "Finance & Purchasing Master",
    subtitle: "Manage Expense Categories, Payment Methods, and Material Purchase Order categories"
  },
  Services: {
    title: "Services & Appointments Master",
    subtitle: "Manage Renovation Appointment Services and Site Van booking options"
  },
  Users: {
    title: "User Roles & Permissions Master",
    subtitle: "Manage System User Roles, Access levels, and Staff category definitions"
  }
};

function StatusDropdownPill({ status, onToggle }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (targetStatus) => {
    if (targetStatus !== status) {
      onToggle();
    }
    setIsOpen(false);
  };

  return (
    <div className="status-dropdown-container" ref={dropdownRef}>
      <button
        type="button"
        className={`status-toggle-btn dropdown-pill ${status === 'Active' ? 'active' : 'inactive'}`}
        onClick={() => setIsOpen(prev => !prev)}
        title="Click to switch status"
      >
        {status === 'Active' ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
        <span>{status}</span>
        <ChevronDown size={12} className={`status-dropdown-arrow ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="status-custom-menu">
          <button
            type="button"
            className={`status-menu-option active-option ${status === 'Active' ? 'selected' : ''}`}
            onClick={() => handleSelect('Active')}
          >
            <CheckCircle2 size={14} className="option-icon" />
            <span>Active</span>
          </button>
          <button
            type="button"
            className={`status-menu-option inactive-option ${status === 'Inactive' ? 'selected' : ''}`}
            onClick={() => handleSelect('Inactive')}
          >
            <XCircle size={14} className="option-icon" />
            <span>Inactive</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminMasterModule() {
  const {
    dropdownMasters,
    masterCategoriesMeta,
    addDropdownOption,
    updateDropdownOption,
    deleteDropdownOption,
    toggleDropdownOptionStatus,
    resetDropdownMastersToDefault,
    adminMasterGroupFilter,
    setAdminMasterGroupFilter,
    exportToXLS,
    exportToPDF
  } = useApp();

  const activeGroup = adminMasterGroupFilter || 'All';
  const setActiveGroup = (grp) => setAdminMasterGroupFilter(grp);
  const [selectedCategoryKey, setSelectedCategoryKey] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'table'

  useEffect(() => {
    setSelectedCategoryKey('All');
  }, [activeGroup]);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOption, setEditingOption] = useState(null);
  const [deleteConfirmOption, setDeleteConfirmOption] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    category: 'lead_stage',
    label: '',
    code: '',
    color: '#3B82F6',
    status: 'Active',
    description: ''
  });

  const categoryList = masterCategoriesMeta || [
    { key: "lead_stage", name: "Lead & Enquiry Stages", group: "Leads" },
    { key: "structure_type", name: "Structure & Building Types", group: "Leads" },
    { key: "cement_brand", name: "Cement Brands & Specs", group: "Materials" },
    { key: "steel_brand", name: "Steel Brands & Specs", group: "Materials" },
    { key: "bricks_blocks_spec", name: "Bricks & Blocks Specs", group: "Materials" },
    { key: "flooring_spec", name: "Flooring Specs", group: "Materials" },
    { key: "doors_windows_spec", name: "Doors & Windows Specs", group: "Materials" },
    { key: "expense_category", name: "Expense Categories", group: "Finance" },
    { key: "payment_method", name: "Payment Methods", group: "Finance" },
    { key: "material_category", name: "Material Purchase Categories", group: "Finance" },
    { key: "renovation_service", name: "Renovation Appointment Services", group: "Services" },
    { key: "user_role", name: "System User Roles", group: "Users" }
  ];

  // Helper to map category key to category name
  const getCategoryName = (catKey) => {
    const found = categoryList.find(c => c.key === catKey);
    return found ? found.name : catKey;
  };

  const groupMeta = GROUP_TITLES[activeGroup] || GROUP_TITLES.All;

  // Filter Categories by activeGroup
  const filteredCategoryList = categoryList.filter(c => {
    if (activeGroup === 'All') return true;
    return c.group === activeGroup;
  });

  // Calculate items in activeGroup for Stats Cards
  const groupMasterItems = (dropdownMasters || []).filter(item => {
    if (activeGroup === 'All') return true;
    const catMeta = categoryList.find(c => c.key === item.category);
    return catMeta && catMeta.group === activeGroup;
  });

  const totalOptionsCount = groupMasterItems.length;
  const activeOptionsCount = groupMasterItems.filter(d => d.status === 'Active').length;
  const inactiveOptionsCount = groupMasterItems.filter(d => d.status === 'Inactive').length;

  // Filter Dropdown Master items
  const filteredOptions = (dropdownMasters || []).filter(item => {
    // Search query match
    const matchesSearch =
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.code && item.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      getCategoryName(item.category).toLowerCase().includes(searchTerm.toLowerCase());

    // Category filter match
    const matchesCat = selectedCategoryKey === 'All' || item.category === selectedCategoryKey;

    // Group filter match
    const catMeta = categoryList.find(c => c.key === item.category);
    const matchesGroup = activeGroup === 'All' || (catMeta && catMeta.group === activeGroup);

    // Status filter match
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;

    return matchesSearch && matchesCat && matchesGroup && matchesStatus;
  });

  const handleOpenAddModal = (defaultCategoryKey) => {
    setEditingOption(null);
    setFormData({
      category: defaultCategoryKey || categoryList[0].key,
      label: '',
      code: '',
      color: PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)],
      status: 'Active',
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (option) => {
    setEditingOption(option);
    setFormData({
      category: option.category || categoryList[0].key,
      label: option.label || '',
      code: option.code || '',
      color: option.color || '#3B82F6',
      status: option.status || 'Active',
      description: option.description || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!formData.label.trim()) {
      alert('Option label is required.');
      return;
    }

    const finalCode = formData.code.trim();

    if (editingOption) {
      updateDropdownOption({
        ...editingOption,
        ...formData,
        code: finalCode
      });
    } else {
      addDropdownOption({
        ...formData,
        code: finalCode
      });
    }
    setIsModalOpen(false);
  };

  // Group options by Category for List View
  const groupedOptions = filteredCategoryList.reduce((acc, cat) => {
    const items = filteredOptions.filter(opt => opt.category === cat.key);

    if (items.length > 0 || (selectedCategoryKey === cat.key && searchTerm === '')) {
      acc.push({
        categoryMeta: cat,
        items
      });
    }
    return acc;
  }, []);

  // Table View Columns
  const tableColumns = [
    {
      key: 'label',
      label: 'Option Label & Code',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div className="option-color-dot" style={{ backgroundColor: row.color || '#3B82F6' }} />
          <div>
            <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{row.label}</div>
            {row.code && (
              <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                {row.code}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Master Category',
      render: (row) => (
        <span className="option-category-badge">
          {getCategoryName(row.category)}
        </span>
      )
    },
    {
      key: 'description',
      label: 'Description / Notes',
      render: (row) => (
        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          {row.description || '—'}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <StatusDropdownPill
          status={row.status}
          onToggle={() => toggleDropdownOptionStatus(row.id)}
        />
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="user-actions">
          <button
            className="action-btn-icon"
            onClick={() => handleOpenEditModal(row)}
            title="Edit Option"
          >
            <Edit3 size={15} />
          </button>
          <button
            className="action-btn-icon delete"
            onClick={() => setDeleteConfirmOption(row)}
            title="Delete Option"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="admin-master-container">
      {/* Header Row */}
      <div className="admin-master-header">
        <div>
          <h1 className="dashboard-title">{groupMeta.title}</h1>
          <p className="dashboard-subtitle">
            {groupMeta.subtitle}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            className="btn-secondary"
            onClick={() => exportToXLS(filteredOptions, 'Yeloline_System_Masters', 'System Master Options')}
          >
            <FileSpreadsheet size={16} />
            <span>Export XLS</span>
          </button>

          <button
            className="btn-secondary"
            onClick={() => exportToPDF(filteredOptions, 'Yeloline_System_Masters', 'System Master Options')}
          >
            <FileText size={16} />
            <span>Export PDF</span>
          </button>

          <button
            className="btn-secondary"
            onClick={() => {
              if (window.confirm('Reset all dropdown master options to system default initial values?')) {
                resetDropdownMastersToDefault();
              }
            }}
          >
            <RotateCcw size={16} />
            <span>Reset Defaults</span>
          </button>

          <button className="btn-primary" onClick={() => handleOpenAddModal(selectedCategoryKey !== 'All' ? selectedCategoryKey : null)}>
            <Plus size={18} />
            <span>Add Master Option</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="admin-master-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'rgba(250, 204, 21, 0.15)', color: '#EAB308' }}>
            <Sliders size={24} />
          </div>
          <div className="admin-stat-info">
            <h4>{filteredCategoryList.length}</h4>
            <p>Categories in Group</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6' }}>
            <Tag size={24} />
          </div>
          <div className="admin-stat-info">
            <h4>{totalOptionsCount}</h4>
            <p>Total Dropdown Options</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10B981' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="admin-stat-info">
            <h4>{activeOptionsCount}</h4>
            <p>Active Options</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#EF4444' }}>
            <XCircle size={24} />
          </div>
          <div className="admin-stat-info">
            <h4>{inactiveOptionsCount}</h4>
            <p>Inactive / Disabled</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="admin-controls-card">
        <div className="admin-search-filters">
          <div className="admin-search-box">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Search dropdown option name, code or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-dropdown-group">
            <span className="filter-field-label">Category:</span>
            <CustomSelect
              options={['All Categories', ...filteredCategoryList.map(c => c.name)]}
              value={selectedCategoryKey === 'All' ? 'All Categories' : getCategoryName(selectedCategoryKey)}
              onChange={(val) => {
                if (val === 'All Categories' || val === 'All') {
                  setSelectedCategoryKey('All');
                } else {
                  const found = filteredCategoryList.find(c => c.name === val);
                  if (found) setSelectedCategoryKey(found.key);
                }
              }}
              placeholder="Select Category"
            />
          </div>

          <div className="filter-dropdown-group">
            <span className="filter-field-label">Status:</span>
            <CustomSelect
              options={['All Statuses', 'Active Only', 'Inactive Only']}
              value={selectedStatus === 'All' ? 'All Statuses' : (selectedStatus === 'Active' ? 'Active Only' : 'Inactive Only')}
              onChange={(val) => {
                if (val === 'All Statuses' || val === 'All') {
                  setSelectedStatus('All');
                } else if (val === 'Active Only' || val === 'Active') {
                  setSelectedStatus('Active');
                } else {
                  setSelectedStatus('Inactive');
                }
              }}
              placeholder="Select Status"
            />
          </div>
        </div>

        <div className="view-toggle-group">
          <button
            className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="Category Grouped View"
          >
            <Grid size={18} />
          </button>
          <button
            className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="Flat Table View"
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Content Rendering */}
      {filteredOptions.length === 0 ? (
        <div className="empty-state-card" style={{ padding: '3rem', textAlign: 'center', background: 'var(--light-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--light-border)' }}>
          <Sliders size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>No Dropdown Options Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            No options match your current search or category filter. Try clearing filters or add a new option.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        <DataTable
          columns={tableColumns}
          data={filteredOptions}
          keyField="id"
          showSearch={false}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {groupedOptions.map(group => (
            <div
              key={group.categoryMeta.key}
              style={{
                background: 'var(--light-card)',
                border: '1px solid var(--light-border)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {/* Category Header */}
              <div
                style={{
                  padding: '0.88rem 1.25rem',
                  background: 'var(--light-background)',
                  borderBottom: '1px solid var(--light-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div className="category-header-title-wrapper">
                  <Tag size={18} style={{ color: 'var(--accent-yellow-dark)', flexShrink: 0 }} />
                  <h3 className="category-title-text">
                    {group.categoryMeta.name}
                  </h3>
                  <span className="category-count-badge">
                    {group.items.length} {group.items.length === 1 ? 'option' : 'options'}
                  </span>
                </div>

                <button
                  className="btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                  onClick={() => handleOpenAddModal(group.categoryMeta.key)}
                >
                  <Plus size={14} />
                  <span>Add Option</span>
                </button>
              </div>

              {/* Options List */}
              <div style={{ display: 'flex', flexDirection: 'column', divideY: '1px solid var(--light-border)' }}>
                {group.items.map(option => (
                  <div key={option.id} className="master-option-card" style={{ border: 'none', borderRadius: 0, borderBottom: '1px solid var(--light-border)' }}>
                    <div className="option-left-info">
                      <div className="option-color-dot" style={{ backgroundColor: option.color || '#3B82F6' }} />
                      <div className="option-main-details">
                        <div className="option-title-row">
                          <span className="option-label-text">{option.label}</span>
                          {option.code && <span className="option-code-tag">{option.code}</span>}
                        </div>
                        {option.description && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {option.description}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="option-right-actions">
                      <StatusDropdownPill
                        status={option.status}
                        onToggle={() => toggleDropdownOptionStatus(option.id)}
                      />

                      <div className="user-actions">
                        <button
                          className="action-btn-icon"
                          onClick={() => handleOpenEditModal(option)}
                          title="Edit Option"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          className="action-btn-icon delete"
                          onClick={() => setDeleteConfirmOption(option)}
                          title="Delete Option"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Option Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingOption ? `Edit Option: ${editingOption.label}` : 'Add New Dropdown Option'}
        >
          <form onSubmit={handleSubmitForm} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '600', fontSize: '0.85rem' }}>Master Category *</label>
              <select
                className="form-control"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categoryList.map(cat => (
                  <option key={cat.key} value={cat.key}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="user-form-grid">
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: '600', fontSize: '0.85rem' }}>Option Display Label *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. UltraTech PPC Premium"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: '600', fontSize: '0.85rem' }}>Option Code / Identifier (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. ULTRATECH_PPC"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '600', fontSize: '0.85rem' }}>Display Status</label>
              <select
                className="form-control"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active (Visible in Dropdowns)</option>
                <option value="Inactive">Inactive (Disabled)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '600', fontSize: '0.85rem' }}>Color Badge Marker</label>
              <div className="color-picker-grid">
                {PRESET_COLORS.map(c => (
                  <div
                    key={c}
                    className={`color-picker-swatch ${formData.color === c ? 'selected' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setFormData({ ...formData, color: c })}
                  />
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '600', fontSize: '0.85rem' }}>Description / Specification Notes</label>
              <textarea
                className="form-control"
                rows="2"
                placeholder="Optional description or specification detail..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingOption ? 'Save Changes' : 'Create Option'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOption && (
        <Modal
          isOpen={!!deleteConfirmOption}
          onClose={() => setDeleteConfirmOption(null)}
          title="Confirm Master Option Deletion"
        >
          <div style={{ padding: '0.5rem 0' }}>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              Are you sure you want to delete option <strong>"{deleteConfirmOption.label}"</strong> from <strong>{getCategoryName(deleteConfirmOption.category)}</strong>?
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              If you only want to hide this option from future dropdowns, consider setting its status to <strong>Inactive</strong> instead.
            </p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button className="btn-secondary" onClick={() => setDeleteConfirmOption(null)}>
              Cancel
            </button>
            <button
              className="btn-primary"
              style={{ background: 'var(--danger-red)', borderColor: 'var(--danger-red)', color: '#FFF' }}
              onClick={() => {
                deleteDropdownOption(deleteConfirmOption.id);
                setDeleteConfirmOption(null);
              }}
            >
              Delete Option
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
