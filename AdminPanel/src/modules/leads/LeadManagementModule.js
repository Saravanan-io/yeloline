import React, { useState } from 'react';
import { Plus, Download, Upload, Edit3, Trash2, Phone, Mail, MapPin, Filter, Building2, Eye, Calendar, Layers, FileText, MessageSquare, FileSpreadsheet } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import DataTable from '../../components/common/DataTable/DataTable';
import StatusBadge from '../../components/common/StatusBadge/StatusBadge';
import Modal from '../../components/common/Modal/Modal';
import CustomSelect from '../../components/common/CustomSelect/CustomSelect';
import CSVImportModal from '../../components/common/CSVImportModal/CSVImportModal';
import './LeadManagementModule.css';

const STAGE_OPTIONS = [
  "New Enquiry",
  "Contacted",
  "Site Visit Scheduled",
  "Estimate Shared",
  "Converted",
  "Closed"
];

const STRUCTURE_TYPES = [
  "Residential House",
  "Commercial Building",
  "Villa",
  "Renovation & Remodeling"
];

const STRUCTURE_SPECS = [
  "RCC Frame Structure (M25 Grade)",
  "RCC Frame Structure (M30 Grade)",
  "Steel Frame Structure (Heavy Duty)"
];

const CEMENT_SPECS = [
  "UltraTech PPC (Premium)",
  "Ambuja PPC (Premium)",
  "ACC PPC (Premium)"
];

const STEEL_SPECS = [
  "TATA Tiscon 550D (High Strength)",
  "JSW Neosteel (Premium)",
  "SAIL TMT (Fe 550)"
];

const BRICKS_BLOCKS_SPECS = [
  "Red Bricks (Premium)",
  "AAC Blocks (Lightweight)",
  "Fly Ash Bricks (Eco Friendly)"
];

const FLOORING_SPECS = [
  "Vitrified Tiles (Premium)",
  "Italian Marble (Imported)",
  "Granite Flooring (Premium)"
];

const DOORS_SPECS = [
  "Teak Wood Doors (Premium)",
  "Flush Doors (Teak Frame)",
  "UPVC Doors (Modern)"
];

const WINDOWS_SPECS = [
  "Aluminium Windows (Powder Coated)",
  "UPVC Sliding Windows (Soundproof)",
  "Teak Wood Windows (Classic)"
];

const ENQUIRY_COLUMNS_SPEC = [
  { key: "enquiry_id", label: "Enquiry ID", type: "String", required: true, example: "ENQ-2026-001" },
  { key: "client_name", label: "Client Full Name", type: "String", required: true, example: "Ramesh Sundaram" },
  { key: "client_phone", label: "Mobile Number", type: "String", required: true, example: "+91 98421 88321" },
  { key: "whatsapp_number", label: "WhatsApp Number", type: "String", required: false, example: "+91 98421 88321" },
  { key: "client_email", label: "Email Address", type: "String", required: false, example: "ramesh.s@gmail.com" },
  { key: "site_location", label: "Project Location", type: "String", required: true, example: "Perundurai Road, Erode" },
  { key: "structure_type", label: "Structure Type", type: "String", required: true, example: "Villa" },
  { key: "structure_spec", label: "1. Structure Spec", type: "String", required: false, example: "RCC Frame Structure (M25 Grade)" },
  { key: "cement_brand", label: "2. Cement Spec", type: "String", required: false, example: "UltraTech PPC (Premium)" },
  { key: "steel_brand", label: "3. Steel Spec", type: "String", required: false, example: "TATA Tiscon 550D (High Strength)" },
  { key: "bricks_blocks_spec", label: "4. Bricks / Blocks Spec", type: "String", required: false, example: "Red Bricks (Premium)" },
  { key: "flooring_spec", label: "5. Flooring Spec", type: "String", required: false, example: "Vitrified Tiles (Premium)" },
  { key: "doors_spec", label: "6. Doors Spec", type: "String", required: false, example: "Teak Wood Doors (Premium)" },
  { key: "windows_spec", label: "7. Windows Spec", type: "String", required: false, example: "UPVC Sliding Windows (Soundproof)" },
  { key: "plot_size", label: "Plot Size", type: "String", required: false, example: "40 x 60 sq. ft." },
  { key: "builtup_area_sqft", label: "Builtup Area", type: "Number", required: true, example: "3200" },
  { key: "number_of_floors", label: "Number of Floors", type: "String", required: false, example: "G + 1 Floor" },
  { key: "preferred_start_date", label: "Preferred Start Date", type: "Date", required: false, example: "2026-10-15" },
  { key: "estimated_rate_per_sqft", label: "Est. Rate", type: "String", required: true, example: "₹2,250" },
  { key: "total_estimated_cost", label: "Total Cost (₹)", type: "Number", required: true, example: "7200000" },
  { key: "enquiry_date", label: "Enquiry Date", type: "Date", required: true, example: "2026-09-18" },
  { key: "lead_stage", label: "Lead Stage", type: "String", required: true, example: "Estimate Shared" },
  { key: "additional_notes", label: "Additional Notes", type: "String", required: false, example: "4BHK floor plan requested" }
];

const SAMPLE_ENQUIRY_ROW = {
  client_name: "Ramesh Sundaram",
  client_phone: "+91 98421 88321",
  whatsapp_number: "+91 98421 88321",
  client_email: "ramesh.s@gmail.com",
  site_location: "Perundurai Road, Erode",
  structure_type: "Villa",
  structure_spec: "RCC Frame Structure (M25 Grade)",
  cement_brand: "UltraTech PPC (Premium)",
  steel_brand: "TATA Tiscon 550D (High Strength)",
  bricks_blocks_spec: "Red Bricks (Premium)",
  flooring_spec: "Vitrified Tiles (Premium)",
  doors_spec: "Teak Wood Doors (Premium)",
  windows_spec: "UPVC Sliding Windows (Soundproof)",
  plot_size: "40 x 60 (2400 sq. ft.)",
  builtup_area_sqft: 3200,
  number_of_floors: "G + 1 Floor",
  preferred_start_date: "2026-10-15",
  estimated_rate_per_sqft: "₹2,250",
  total_estimated_cost: 7200000,
  enquiry_date: "2026-09-18",
  lead_stage: "Estimate Shared",
  additional_notes: "Client requested full turnkey estimate including 4BHK floor plan."
};

export default function LeadManagementModule() {
  const { enquiries, addEnquiry, updateEnquiryStage, deleteEnquiry, importEnquiries, exportToXLS, exportToPDF } = useApp();
  const [selectedStageFilter, setSelectedStageFilter] = useState('ALL');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedEnquiryForStage, setSelectedEnquiryForStage] = useState(null);
  const [viewingDetailEnquiry, setViewingDetailEnquiry] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    client_name: '',
    client_phone: '',
    whatsapp_number: '',
    client_email: '',
    site_location: '',
    structure_type: 'Villa',
    structure_spec: 'RCC Frame Structure (M25 Grade)',
    cement_brand: 'UltraTech PPC (Premium)',
    steel_brand: 'TATA Tiscon 550D (High Strength)',
    bricks_blocks_spec: 'Red Bricks (Premium)',
    flooring_spec: 'Vitrified Tiles (Premium)',
    doors_spec: 'Teak Wood Doors (Premium)',
    windows_spec: 'UPVC Sliding Windows (Soundproof)',
    plot_size: '30 x 40 (1200 sq. ft.)',
    builtup_area_sqft: 2500,
    number_of_floors: 'G + 1 Floor',
    preferred_start_date: '2026-10-15',
    estimated_rate_per_sqft: '₹2,200',
    total_estimated_cost: 5500000,
    lead_stage: 'New Enquiry',
    additional_notes: ''
  });

  const filteredEnquiries = selectedStageFilter === 'ALL'
    ? enquiries
    : enquiries.filter(e => e.lead_stage === selectedStageFilter);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    addEnquiry(formData);
    setIsAddModalOpen(false);
    setFormData({
      client_name: '',
      client_phone: '',
      whatsapp_number: '',
      client_email: '',
      site_location: '',
      structure_type: 'Villa',
      structure_spec: 'RCC Frame Structure (M25 Grade)',
      cement_brand: 'UltraTech PPC (Premium)',
      steel_brand: 'TATA Tiscon 550D (High Strength)',
      bricks_blocks_spec: 'Red Bricks (Premium)',
      flooring_spec: 'Vitrified Tiles (Premium)',
      doors_spec: 'Teak Wood Doors (Premium)',
      windows_spec: 'UPVC Sliding Windows (Soundproof)',
      plot_size: '30 x 40 (1200 sq. ft.)',
      builtup_area_sqft: 2500,
      number_of_floors: 'G + 1 Floor',
      preferred_start_date: '2026-10-15',
      estimated_rate_per_sqft: '₹2,200',
      total_estimated_cost: 5500000,
      lead_stage: 'New Enquiry',
      additional_notes: ''
    });
  };

  const columns = [
    {
      header: "Enquiry ID",
      key: "enquiry_id",
      render: (r) => <span style={{ fontWeight: '700', color: 'var(--accent-yellow-dark)', whiteSpace: 'nowrap' }}>{r.enquiry_id}</span>
    },
    {
      header: "Client Contact",
      key: "client_name",
      render: (r) => (
        <div>
          <div style={{ fontWeight: '700' }}>{r.client_name}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
            <Phone size={12} /> {r.client_phone}
          </div>
          {r.client_email && (
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
              <Mail size={12} /> {r.client_email}
            </div>
          )}
        </div>
      )
    },
    {
      header: "Location & Area",
      key: "site_location",
      render: (r) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}><MapPin size={13} /> {r.site_location}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{r.builtup_area_sqft} sq. ft.</div>
        </div>
      )
    },
    { header: "Structure Type", key: "structure_type" },
    {
      header: "Est. Cost",
      key: "total_estimated_cost",
      render: (r) => <strong style={{ whiteSpace: 'nowrap' }}>₹{Number(r.total_estimated_cost).toLocaleString('en-IN')}</strong>
    },
    {
      header: "Date",
      key: "enquiry_date",
      render: (r) => <span style={{ whiteSpace: 'nowrap' }}>{r.enquiry_date}</span>
    },
    {
      header: "Stage",
      key: "lead_stage",
      render: (r) => <StatusBadge status={r.lead_stage} />
    },
    {
      header: "Actions",
      key: "actions",
      render: (r) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            style={{ background: 'var(--info-bg)', border: 'none', color: 'var(--info-blue)', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer' }}
            onClick={() => setViewingDetailEnquiry(r)}
            title="View Full Specification Details"
          >
            <Eye size={14} />
          </button>
          <button
            style={{ background: 'var(--primary-yellow-light)', border: 'none', color: 'var(--accent-yellow-dark)', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer' }}
            onClick={() => setSelectedEnquiryForStage(r)}
            title="Update Lead Stage"
          >
            <Edit3 size={14} />
          </button>
          <button
            style={{ background: 'var(--danger-bg)', border: 'none', color: 'var(--danger-red)', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer' }}
            onClick={() => deleteEnquiry(r.enquiry_id)}
            title="Delete Enquiry"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="leads-container">
      <div className="leads-header-row">
        <div>
          <h1 className="dashboard-title">Quote & Enquiry Lead Management</h1>
          <p className="dashboard-subtitle">Manage Get Quote submissions received from customer app & website</p>
        </div>
        <div className="header-action-group">
          <button
            className="btn-primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={16} /> New Quote Lead
          </button>
          <div className="csv-action-group">
            <button
              className="btn-secondary"
              onClick={() => exportToXLS(filteredEnquiries, 'Yeloline_Quote_Leads', 'Quote & Enquiry Lead Management', ENQUIRY_COLUMNS_SPEC)}
            >
              <FileSpreadsheet size={16} /> Export XLS
            </button>
            <button
              className="btn-secondary"
              onClick={() => exportToPDF(filteredEnquiries, 'Yeloline_Quote_Leads', 'Quote & Enquiry Lead Management', ENQUIRY_COLUMNS_SPEC)}
            >
              <FileText size={16} /> Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="leads-filter-bar">
        <CustomSelect
          icon={Filter}
          label="Stage:"
          value={selectedStageFilter}
          onChange={(val) => setSelectedStageFilter(val)}
          options={[
            { value: "ALL", label: `All Stages (${enquiries.length})`, badge: enquiries.length },
            ...STAGE_OPTIONS.map(stage => ({
              value: stage,
              label: stage,
              badge: enquiries.filter(e => e.lead_stage === stage).length
            }))
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredEnquiries}
        searchPlaceholder="Search client name, location, phone..."
        pageSize={8}
        onRowClick={(row) => setViewingDetailEnquiry(row)}
      />

      {/* Create Lead Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Quote & Enquiry Lead"
      >
        <form onSubmit={handleCreateSubmit} className="form-grid">
          {/* Section: Contact Information */}
          <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid var(--light-border)', paddingBottom: '4px', marginBottom: '4px' }}>
            <strong style={{ fontSize: '0.9rem', color: 'var(--accent-yellow-dark)' }}>Contact Information (Step 3)</strong>
          </div>

          <div className="form-group">
            <label className="form-label">Client Name *</label>
            <input
              type="text"
              required
              className="form-input"
              value={formData.client_name}
              onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mobile Number *</label>
            <input
              type="text"
              required
              className="form-input"
              value={formData.client_phone}
              onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">WhatsApp Number</label>
            <input
              type="text"
              className="form-input"
              value={formData.whatsapp_number}
              onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={formData.client_email}
              onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
            />
          </div>

          {/* Section: Project & Site Details */}
          <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid var(--light-border)', paddingBottom: '4px', marginTop: '0.5rem', marginBottom: '4px' }}>
            <strong style={{ fontSize: '0.9rem', color: 'var(--accent-yellow-dark)' }}>Project & Site Details (Step 3)</strong>
          </div>

          <div className="form-group">
            <label className="form-label">Project Location *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g., Perundurai Road, Erode"
              value={formData.site_location}
              onChange={(e) => setFormData({ ...formData, site_location: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Structure Category</label>
            <select
              className="form-input"
              value={formData.structure_type}
              onChange={(e) => setFormData({ ...formData, structure_type: e.target.value })}
            >
              {STRUCTURE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Plot Size</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., 30 x 40 (1200 sq. ft.)"
              value={formData.plot_size}
              onChange={(e) => setFormData({ ...formData, plot_size: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Built-up Area (Sq. Ft.) *</label>
            <input
              type="number"
              required
              className="form-input"
              value={formData.builtup_area_sqft}
              onChange={(e) => setFormData({ ...formData, builtup_area_sqft: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Number of Floors</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., G + 1 Floor"
              value={formData.number_of_floors}
              onChange={(e) => setFormData({ ...formData, number_of_floors: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Preferred Start Date</label>
            <input
              type="date"
              className="form-input"
              value={formData.preferred_start_date}
              onChange={(e) => setFormData({ ...formData, preferred_start_date: e.target.value })}
            />
          </div>

          {/* Section: Selected Specifications (7 Compulsory Selections) */}
          <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid var(--light-border)', paddingBottom: '4px', marginTop: '0.5rem', marginBottom: '4px' }}>
            <strong style={{ fontSize: '0.9rem', color: 'var(--accent-yellow-dark)' }}>Selected Material Specifications (Step 1 - 7 Compulsory Selections)</strong>
          </div>

          <div className="form-group">
            <label className="form-label">1. Structure</label>
            <select
              className="form-input"
              value={formData.structure_spec}
              onChange={(e) => setFormData({ ...formData, structure_spec: e.target.value })}
            >
              {STRUCTURE_SPECS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">2. Cement</label>
            <select
              className="form-input"
              value={formData.cement_brand}
              onChange={(e) => setFormData({ ...formData, cement_brand: e.target.value })}
            >
              {CEMENT_SPECS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">3. Steel</label>
            <select
              className="form-input"
              value={formData.steel_brand}
              onChange={(e) => setFormData({ ...formData, steel_brand: e.target.value })}
            >
              {STEEL_SPECS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">4. Bricks / Blocks</label>
            <select
              className="form-input"
              value={formData.bricks_blocks_spec}
              onChange={(e) => setFormData({ ...formData, bricks_blocks_spec: e.target.value })}
            >
              {BRICKS_BLOCKS_SPECS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">5. Flooring</label>
            <select
              className="form-input"
              value={formData.flooring_spec}
              onChange={(e) => setFormData({ ...formData, flooring_spec: e.target.value })}
            >
              {FLOORING_SPECS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">6. Doors</label>
            <select
              className="form-input"
              value={formData.doors_spec}
              onChange={(e) => setFormData({ ...formData, doors_spec: e.target.value })}
            >
              {DOORS_SPECS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">7. Windows</label>
            <select
              className="form-input"
              value={formData.windows_spec}
              onChange={(e) => setFormData({ ...formData, windows_spec: e.target.value })}
            >
              {WINDOWS_SPECS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Estimated Rate (Per Sq. Ft.)</label>
            <input
              type="text"
              className="form-input"
              value={formData.estimated_rate_per_sqft}
              onChange={(e) => setFormData({ ...formData, estimated_rate_per_sqft: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Total Estimated Cost (₹)</label>
            <input
              type="number"
              className="form-input"
              value={formData.total_estimated_cost}
              onChange={(e) => setFormData({ ...formData, total_estimated_cost: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Lead Stage</label>
            <select
              className="form-input"
              value={formData.lead_stage}
              onChange={(e) => setFormData({ ...formData, lead_stage: e.target.value })}
            >
              {STAGE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Additional Notes (Optional)</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="e.g., Turnkey estimate with 4BHK layout design..."
              value={formData.additional_notes}
              onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ gridColumn: '1 / -1', marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Lead Record
            </button>
          </div>
        </form>
      </Modal>

      {/* Update Stage Modal */}
      {selectedEnquiryForStage && (
        <Modal
          isOpen={!!selectedEnquiryForStage}
          onClose={() => setSelectedEnquiryForStage(null)}
          title={`Update Lead Stage for ${selectedEnquiryForStage.enquiry_id}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <strong>Client:</strong> {selectedEnquiryForStage.client_name} ({selectedEnquiryForStage.site_location})
            </div>
            <div className="form-group">
              <label className="form-label">Select New Stage</label>
              <select
                className="form-input"
                defaultValue={selectedEnquiryForStage.lead_stage}
                onChange={(e) => {
                  updateEnquiryStage(selectedEnquiryForStage.enquiry_id, e.target.value);
                  setSelectedEnquiryForStage(null);
                }}
              >
                {STAGE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </Modal>
      )}

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Quote & Enquiry Leads CSV"
        moduleName="Leads"
        compulsoryColumns={ENQUIRY_COLUMNS_SPEC}
        sampleRow={SAMPLE_ENQUIRY_ROW}
        onImport={(data) => importEnquiries(data)}
      />

      {/* Full Enquiry Details View Modal */}
      {viewingDetailEnquiry && (
        <Modal
          isOpen={!!viewingDetailEnquiry}
          onClose={() => setViewingDetailEnquiry(null)}
          title={`Quote Lead Specifications & Details - ${viewingDetailEnquiry.enquiry_id}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Header profile info */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--light-background)', border: '1px solid var(--light-border)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>{viewingDetailEnquiry.client_name}</h2>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} /> {viewingDetailEnquiry.site_location}
                </div>
              </div>
              <StatusBadge status={viewingDetailEnquiry.lead_stage} />
            </div>

            {/* Section 1: Contact Information (Step 3 Contact Info) */}
            <div style={{ padding: '1rem', background: 'var(--light-background)', border: '1px solid var(--light-border)', borderRadius: 'var(--radius-md)' }}>
              <div className="form-label" style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', fontSize: '0.92rem', color: 'var(--accent-yellow-dark)' }}>
                <Phone size={15} /> Contact Information (Step 3)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                <div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Mobile Number *</div>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{viewingDetailEnquiry.client_phone}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>WhatsApp Number *</div>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--success-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MessageSquare size={13} /> {viewingDetailEnquiry.whatsapp_number || viewingDetailEnquiry.client_phone}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Email Address</div>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{viewingDetailEnquiry.client_email || 'Not Provided'}</div>
                </div>
              </div>
            </div>

            {/* Section 2: Project & Site Details (Step 3 Site Details) */}
            <div style={{ padding: '1rem', background: 'var(--light-background)', border: '1px solid var(--light-border)', borderRadius: 'var(--radius-md)' }}>
              <div className="form-label" style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', fontSize: '0.92rem', color: 'var(--accent-yellow-dark)' }}>
                <Building2 size={15} /> Project & Site Details (Step 3)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
                <div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Structure Category</div>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{viewingDetailEnquiry.structure_type || 'Villa'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Plot Size</div>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{viewingDetailEnquiry.plot_size || '30 x 40 sq. ft.'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Approx. Construction Area</div>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{viewingDetailEnquiry.builtup_area_sqft} sq. ft.</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Number of Floors</div>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{viewingDetailEnquiry.number_of_floors || 'G + 1 Floor'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Preferred Start Date</div>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--accent-yellow-dark)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} /> {viewingDetailEnquiry.preferred_start_date || '2026-10-15'}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Selected Specifications (Step 1 - 7 Compulsory Selections) */}
            <div style={{ padding: '1rem', background: 'var(--light-background)', border: '1px solid var(--light-border)', borderRadius: 'var(--radius-md)' }}>
              <div className="form-label" style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', fontSize: '0.92rem', color: 'var(--accent-yellow-dark)' }}>
                <Layers size={15} /> Selected Material Specifications (7 Compulsory Selections - Step 1)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                <div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>1. Structure</div>
                  <div style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-primary)' }}>{viewingDetailEnquiry.structure_spec || 'RCC Frame Structure (M25 Grade)'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>2. Cement</div>
                  <div style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--accent-yellow-dark)' }}>{viewingDetailEnquiry.cement_brand || 'UltraTech PPC (Premium)'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>3. Steel</div>
                  <div style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-primary)' }}>{viewingDetailEnquiry.steel_brand || 'TATA Tiscon 550D (High Strength)'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>4. Bricks / Blocks</div>
                  <div style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-primary)' }}>{viewingDetailEnquiry.bricks_blocks_spec || 'Red Bricks (Premium)'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>5. Flooring</div>
                  <div style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-primary)' }}>{viewingDetailEnquiry.flooring_spec || 'Vitrified Tiles (Premium)'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>6. Doors</div>
                  <div style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-primary)' }}>{viewingDetailEnquiry.doors_spec || 'Teak Wood Doors (Premium)'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>7. Windows</div>
                  <div style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-primary)' }}>{viewingDetailEnquiry.windows_spec || 'UPVC Sliding Windows (Soundproof)'}</div>
                </div>
              </div>
            </div>

            {/* Total Estimated Cost Banner */}
            <div style={{ padding: '1rem 1.25rem', background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.15), rgba(234, 179, 8, 0.08))', border: '1px solid rgba(250, 204, 21, 0.3)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontWeight: '700', color: 'var(--dark-charcoal)' }}>Total Project Budget Estimate:</span>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Est. Rate: {viewingDetailEnquiry.estimated_rate_per_sqft || '₹2,200'} / sq. ft.</div>
              </div>
              <span style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--accent-yellow-dark)' }}>
                ₹{Number(viewingDetailEnquiry.total_estimated_cost).toLocaleString('en-IN')}
              </span>
            </div>

            {/* Additional Notes Card */}
            {viewingDetailEnquiry.additional_notes && (
              <div style={{ padding: '1rem', background: 'var(--light-background)', border: '1px solid var(--light-border)', borderRadius: 'var(--radius-md)' }}>
                <div className="form-label" style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={14} /> Additional Notes (Optional)
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                  {viewingDetailEnquiry.additional_notes}
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setViewingDetailEnquiry(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setSelectedEnquiryForStage(viewingDetailEnquiry);
                  setViewingDetailEnquiry(null);
                }}
              >
                <Edit3 size={16} /> Update Stage
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
