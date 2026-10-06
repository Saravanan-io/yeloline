import React, { useState } from 'react';
import { Plus, Star, MapPin, Clock, Edit3, Trash2, Layers, Filter, CheckCircle2, ShieldCheck, FileSpreadsheet, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Modal from '../../components/common/Modal/Modal';
import MultiImageUploader from '../../components/common/MultiImageUploader/MultiImageUploader';
import CoverImageUploader from '../../components/common/CoverImageUploader/CoverImageUploader';
import CustomSelect from '../../components/common/CustomSelect/CustomSelect';
import './PortfolioProjectModule.css';

const CATEGORIES = ["Residential", "Commercial", "Villa", "Renovation"];
const STATUSES = ["Completed", "Ongoing"];

const DEFAULT_QUALITY_STANDARDS = [
  "RCC Frame Structure (M25 Grade)",
  "Vitrified Tiles - Premium Quality",
  "UPVC Windows & Teak Wood Doors",
  "Branded CP & Sanitary Fittings",
  "Anti-termite & Waterproofing Treatment",
  "TATA Tiscon 550D High Strength Steel",
  "UltraTech Premium PPC Cement",
  "Italian Marble & Granite Joinery"
];

export default function PortfolioProjectModule() {
  const {
    projects,
    addProject,
    editProject,
    deleteProject,
    toggleFeaturedProject,
    masterHighlights,
    addMasterHighlight,
    exportToXLS,
    exportToPDF
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // Custom new highlight inline state
  const [isAddingNewHighlight, setIsAddingNewHighlight] = useState(false);
  const [newHighlightText, setNewHighlightText] = useState('');

  // Quality Standards state
  const [masterQualityStandards, setMasterQualityStandards] = useState(DEFAULT_QUALITY_STANDARDS);
  const [isAddingNewStandard, setIsAddingNewStandard] = useState(false);
  const [newStandardText, setNewStandardText] = useState('');

  const defaultStandards = [
    "RCC Frame Structure (M25 Grade)",
    "Vitrified Tiles - Premium Quality",
    "UPVC Windows & Teak Wood Doors",
    "Branded CP & Sanitary Fittings",
    "Anti-termite & Waterproofing Treatment"
  ];

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Villa',
    status: 'Completed',
    client_name: '',
    location: '',
    area_sqft: 3000,
    duration_months: 8,
    description: '',
    highlights: ["4 BHK Bedrooms", "2 Spacious Living Areas", "Modular Kitchen", "2 Covered Car Parkings"],
    quality_standards: defaultStandards,
    cover_image: '',
    gallery_images: [],
    featured: false
  });

  const filteredProjects = projects.filter(p => {
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || (p.status || 'Completed') === selectedStatus;
    return matchesCategory && matchesStatus;
  });

  const openCreateModal = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      category: 'Villa',
      status: 'Completed',
      client_name: '',
      location: '',
      area_sqft: 3000,
      duration_months: 8,
      description: '',
      highlights: ["4 BHK Bedrooms", "2 Spacious Living Areas", "Modular Kitchen", "2 Covered Car Parkings"],
      quality_standards: defaultStandards,
      cover_image: '',
      gallery_images: [],
      featured: false
    });
    setIsAddingNewHighlight(false);
    setNewHighlightText('');
    setIsAddingNewStandard(false);
    setNewStandardText('');
    setIsModalOpen(true);
  };

  const openEditModal = (proj) => {
    setEditingProject(proj);
    setFormData({
      ...proj,
      status: proj.status || 'Completed',
      highlights: proj.highlights || ["4 BHK Bedrooms", "2 Spacious Living Areas", "Modular Kitchen", "2 Covered Car Parkings"],
      quality_standards: proj.quality_standards || defaultStandards
    });
    setIsAddingNewHighlight(false);
    setNewHighlightText('');
    setIsAddingNewStandard(false);
    setNewStandardText('');
    setIsModalOpen(true);
  };

  const toggleHighlight = (item) => {
    const currentList = formData.highlights || [];
    if (currentList.includes(item)) {
      setFormData({
        ...formData,
        highlights: currentList.filter(h => h !== item)
      });
    } else {
      setFormData({
        ...formData,
        highlights: [...currentList, item]
      });
    }
  };

  const handleCreateNewHighlightSubmit = (e) => {
    e.preventDefault();
    if (!newHighlightText || !newHighlightText.trim()) return;
    const trimmed = newHighlightText.trim();
    addMasterHighlight(trimmed);
    
    // Auto check for current form
    const currentList = formData.highlights || [];
    if (!currentList.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        highlights: [...currentList, trimmed]
      }));
    }
    setNewHighlightText('');
    setIsAddingNewHighlight(false);
  };

  const toggleQualityStandard = (item) => {
    const currentList = formData.quality_standards || [];
    if (currentList.includes(item)) {
      setFormData({
        ...formData,
        quality_standards: currentList.filter(s => s !== item)
      });
    } else {
      setFormData({
        ...formData,
        quality_standards: [...currentList, item]
      });
    }
  };

  const handleAddNewStandardSubmit = (e) => {
    e.preventDefault();
    if (!newStandardText || !newStandardText.trim()) return;
    const trimmed = newStandardText.trim();
    if (!masterQualityStandards.includes(trimmed)) {
      setMasterQualityStandards(prev => [...prev, trimmed]);
    }
    const currentList = formData.quality_standards || [];
    if (!currentList.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        quality_standards: [...currentList, trimmed]
      }));
    }
    setNewStandardText('');
    setIsAddingNewStandard(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingProject) {
      editProject(formData);
    } else {
      addProject(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="projects-container">
      <div className="leads-header-row">
        <div>
          <h1 className="dashboard-title">Portfolio Project Management</h1>
          <p className="dashboard-subtitle">Upload & showcase finished and ongoing construction showcase projects for client mobile app</p>
        </div>
        <div className="header-action-group" style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={() => exportToXLS(filteredProjects, 'Yeloline_Portfolio_Projects', 'Portfolio Projects Showcase')}>
            <FileSpreadsheet size={16} /> Export XLS
          </button>
          <button className="btn-secondary" onClick={() => exportToPDF(filteredProjects, 'Yeloline_Portfolio_Projects', 'Portfolio Projects Showcase')}>
            <FileText size={16} /> Export PDF
          </button>
          <button className="btn-primary" onClick={openCreateModal}>
            <Plus size={16} /> Create New Project
          </button>
        </div>
      </div>

      {/* Category & Status Filter Bar */}
      <div className="leads-filter-bar">
        <CustomSelect
          icon={Filter}
          label="CATEGORY:"
          value={selectedCategory}
          onChange={(val) => setSelectedCategory(val)}
          options={[
            { value: "ALL", label: `All Showcase Projects (${projects.length})`, badge: projects.length },
            ...CATEGORIES.map(c => ({
              value: c,
              label: c,
              badge: projects.filter(p => p.category === c).length
            }))
          ]}
        />

        <CustomSelect
          icon={Filter}
          label="STATUS:"
          value={selectedStatus}
          onChange={(val) => setSelectedStatus(val)}
          options={[
            { value: "ALL", label: `All Statuses (${projects.length})`, badge: projects.length },
            ...STATUSES.map(s => ({
              value: s,
              label: s,
              badge: projects.filter(p => (p.status || 'Completed') === s).length
            }))
          ]}
        />
      </div>

      {/* Projects Grid */}
      <div className="projects-grid">
        {filteredProjects.map(proj => (
          <div key={proj.project_id} className="project-card">
            <div className="project-card-image-wrap">
              <img src={proj.cover_image || (proj.gallery_images && proj.gallery_images[0]?.url)} alt={proj.title} className="project-card-image" />
              {proj.featured && (
                <div className="project-featured-badge">
                  <Star size={12} fill="var(--dark-charcoal)" /> Featured on App
                </div>
              )}
              <div className="project-card-badges-row">
                <span className="project-badge-pill category-pill">{proj.category}</span>
                <span className={`project-badge-pill ${proj.status === 'Ongoing' ? 'status-ongoing' : 'status-completed'}`}>
                  {proj.status || 'Completed'}
                </span>
              </div>
            </div>

            <div className="project-card-body">
              <h3 className="project-card-title">{proj.title}</h3>

              <div className="project-meta-row">
                <div className="project-meta-item"><MapPin size={13} /> {proj.location}</div>
                <div className="project-meta-item"><Layers size={13} /> {proj.area_sqft} sq. ft.</div>
                <div className="project-meta-item"><Clock size={13} /> {proj.duration_months} mo</div>
              </div>

              <p className="project-description">{proj.description}</p>

              {/* Architectural Highlights Display (Cards with Stars) */}
              {(proj.highlights && proj.highlights.length > 0) && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Key Architectural Highlights:
                  </div>
                  <div className="project-highlights-grid">
                    {proj.highlights.map((hl, idx) => (
                      <div key={idx} className="highlight-card-item">
                        <Star size={16} className="highlight-card-star" />
                        <span className="highlight-card-text">{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Materials & Quality Standards Display */}
              {(proj.quality_standards && proj.quality_standards.length > 0) && (
                <div className="project-quality-standards-box">
                  <div className="quality-standards-header">
                    <span className="hq-badge">HQ</span>
                    <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>Materials & Quality Standards</h4>
                  </div>
                  <div className="quality-standards-list">
                    {proj.quality_standards.map((std, idx) => (
                      <div key={idx} className="quality-standard-item">
                        <CheckCircle2 size={18} fill="#10b981" color="#ffffff" className="quality-check-icon" />
                        <span>{std}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px', marginTop: '4px' }}>
                  Gallery Photos ({proj.gallery_images?.length || 0}):
                </div>
                <div className="project-gallery-thumbs">
                  {(proj.gallery_images || []).slice(0, 4).map((g, i) => (
                    <img key={g.id || i} src={g.url} alt={g.tag} className="project-thumb-small" title={g.tag} />
                  ))}
                  {(proj.gallery_images?.length || 0) > 4 && (
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>
                      +{proj.gallery_images.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="project-card-footer">
              <button
                style={{
                  background: proj.featured ? 'var(--primary-yellow-light)' : 'transparent',
                  border: '1px solid var(--light-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '4px 8px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: proj.featured ? 'var(--accent-yellow-dark)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                onClick={() => toggleFeaturedProject(proj.project_id)}
              >
                <Star size={13} fill={proj.featured ? 'var(--accent-yellow-dark)' : 'none'} />
                {proj.featured ? 'Featured' : 'Mark Featured'}
              </button>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  style={{ background: 'var(--light-background)', border: '1px solid var(--light-border)', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer' }}
                  onClick={() => openEditModal(proj)}
                  title="Edit Project"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  style={{ background: 'var(--danger-bg)', border: 'none', color: 'var(--danger-red)', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer' }}
                  onClick={() => deleteProject(proj.project_id)}
                  title="Delete Project"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? `Edit Project - ${editingProject.project_id}` : "Upload New Portfolio Project"}
        maxWidth="800px"
      >
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Project Title *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Modern Luxury Villa - Erode"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-input"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Project Status</label>
            <select
              className="form-input"
              value={formData.status || 'Completed'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Client Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.client_name}
              onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Site Location</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Perundurai, Erode"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Built-up Area (Sq. Ft.)</label>
            <input
              type="number"
              className="form-input"
              value={formData.area_sqft}
              onChange={(e) => setFormData({ ...formData, area_sqft: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Duration (Months)</label>
            <input
              type="number"
              className="form-input"
              value={formData.duration_months}
              onChange={(e) => setFormData({ ...formData, duration_months: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Description & Overview</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Detailed specs, materials used, structural highlights..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Section: Architectural Highlights Checkbox Selector + Add Button */}
          <div className="project-highlights-section">
            <div className="highlights-header-row">
              <div style={{ fontWeight: '800', fontSize: '0.92rem', color: 'var(--accent-yellow-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Star size={16} fill="#f59e0b" color="#f59e0b" /> Select Key Architectural Highlights
              </div>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.78rem', gap: '4px' }}
                onClick={() => setIsAddingNewHighlight(!isAddingNewHighlight)}
              >
                <Plus size={14} /> Add New Highlight
              </button>
            </div>

            {/* Inline Add New Highlight Input Bar */}
            {isAddingNewHighlight && (
              <div style={{ display: 'flex', gap: '8px', background: 'var(--light-card)', padding: '8px', borderRadius: '8px', border: '1px solid var(--primary-yellow)' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ flex: 1, padding: '4px 10px', fontSize: '0.84rem' }}
                  placeholder="Type new highlight (e.g., Italian Marble Flooring)..."
                  value={newHighlightText}
                  onChange={(e) => setNewHighlightText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateNewHighlightSubmit(e)}
                />
                <button
                  type="button"
                  className="btn-primary"
                  style={{ padding: '4px 12px', fontSize: '0.78rem' }}
                  onClick={handleCreateNewHighlightSubmit}
                >
                  Add to All Pages
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                  onClick={() => setIsAddingNewHighlight(false)}
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Checkbox List for Admin Selection */}
            <div className="highlight-checkboxes-grid">
              {masterHighlights.map((hl) => {
                const isChecked = (formData.highlights || []).includes(hl);
                return (
                  <label key={hl} className="highlight-checkbox-item">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleHighlight(hl)}
                    />
                    <span>⭐ {hl}</span>
                  </label>
                );
              })}
            </div>

            {/* Live Preview of Selected Highlights Cards */}
            {(formData.highlights && formData.highlights.length > 0) && (
              <div style={{ marginTop: '4px' }}>
                <div style={{ fontSize: '0.76rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Live Card Preview ({formData.highlights.length} Selected):
                </div>
                <div className="project-highlights-grid">
                  {formData.highlights.map((hl, idx) => (
                    <div key={idx} className="highlight-card-item">
                      <Star size={16} className="highlight-card-star" />
                      <span className="highlight-card-text">{hl}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section: Materials & Quality Standards Checkbox Selector + Add Button */}
          <div className="project-highlights-section" style={{ borderColor: 'var(--light-border)' }}>
            <div className="highlights-header-row">
              <div style={{ fontWeight: '800', fontSize: '0.92rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="hq-badge">HQ</span> Select Materials & Quality Standards
              </div>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.78rem', gap: '4px' }}
                onClick={() => setIsAddingNewStandard(!isAddingNewStandard)}
              >
                <Plus size={14} /> Add New Standard
              </button>
            </div>

            {/* Inline Add New Standard Input Bar */}
            {isAddingNewStandard && (
              <div style={{ display: 'flex', gap: '8px', background: 'var(--light-card)', padding: '8px', borderRadius: '8px', border: '1px solid #10b981' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ flex: 1, padding: '4px 10px', fontSize: '0.84rem' }}
                  placeholder="Type new quality standard (e.g., Schneider Switches & Fuses)..."
                  value={newStandardText}
                  onChange={(e) => setNewStandardText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNewStandardSubmit(e)}
                />
                <button
                  type="button"
                  className="btn-primary"
                  style={{ padding: '4px 12px', fontSize: '0.78rem', backgroundColor: '#10b981', borderColor: '#10b981' }}
                  onClick={handleAddNewStandardSubmit}
                >
                  Add Standard
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                  onClick={() => setIsAddingNewStandard(false)}
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Checkbox List for Quality Standards */}
            <div className="highlight-checkboxes-grid">
              {masterQualityStandards.map((std) => {
                const isChecked = (formData.quality_standards || []).includes(std);
                return (
                  <label key={std} className="highlight-checkbox-item">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleQualityStandard(std)}
                    />
                    <span>{std}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Cover Image Drag & Drop Uploader */}
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Primary Cover Image (Drag & Drop File or Image URL)</label>
            <CoverImageUploader
              value={formData.cover_image}
              onChange={(newCover) => setFormData({ ...formData, cover_image: newCover })}
            />
          </div>

          {/* Multi Image Uploader Component */}
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Project Gallery Multi-Image Uploader (Elevation, Floor Plans, Interiors)</label>
            <MultiImageUploader
              images={formData.gallery_images || []}
              onChange={(updatedGallery) => setFormData({ ...formData, gallery_images: updatedGallery })}
            />
          </div>

          <div style={{ gridColumn: '1 / -1', marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Project Entry
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
