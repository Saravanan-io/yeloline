import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Filter,
  Plus,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  Send,
  Building,
  Upload,
  Download,
  Check,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import DataTable from '../../components/common/DataTable/DataTable';
import StatusBadge from '../../components/common/StatusBadge/StatusBadge';
import Modal from '../../components/common/Modal/Modal';
import CustomSelect from '../../components/common/CustomSelect/CustomSelect';
import CSVImportModal from '../../components/common/CSVImportModal/CSVImportModal';
import './ContactEnquiryModule.css';

const CONTACT_COLUMNS_SPEC = [
  { key: "contact_id", label: "Contact ID", type: "String", required: true, example: "CNT-2026-001" },
  { key: "name", label: "Full Name", type: "String", required: true, example: "Senthil Kumar" },
  { key: "phone", label: "Mobile Number", type: "String", required: true, example: "+91 98765 43210" },
  { key: "email", label: "Email Address", type: "String", required: false, example: "senthil.k@gmail.com" },
  { key: "location", label: "Location", type: "String", required: false, example: "Perundurai, Erode" },
  { key: "message", label: "Message Content", type: "String", required: true, example: "Interested in 3BHK construction estimate" },
  { key: "status", label: "Status", type: "String", required: false, example: "New" }
];

export default function ContactEnquiryModule() {
  const {
    contactEnquiries = [],
    addContactEnquiry,
    updateContactEnquiryStatus,
    deleteContactEnquiry,
    exportToXLS,
    exportToPDF
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const [newFormData, setNewFormData] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    message: '',
    status: 'New'
  });

  // Filtering
  const filteredEnquiries = contactEnquiries.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phone.includes(searchTerm) ||
      (item.email && item.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.location && item.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === 'All' || item.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // Calculate Quick Stats
  const totalCount = contactEnquiries.length;
  const newCount = contactEnquiries.filter(c => c.status === 'New').length;
  const contactedCount = contactEnquiries.filter(c => c.status === 'Contacted' || c.status === 'In Progress').length;
  const resolvedCount = contactEnquiries.filter(c => c.status === 'Resolved').length;

  const handleCreateEnquiry = (e) => {
    e.preventDefault();
    if (!newFormData.name || !newFormData.phone || !newFormData.message) {
      alert('Please fill in Name, Phone, and Message fields.');
      return;
    }

    addContactEnquiry({
      name: newFormData.name,
      contact_info: `${newFormData.phone} / ${newFormData.email || 'N/A'}`,
      phone: newFormData.phone,
      email: newFormData.email,
      location: newFormData.location || 'Erode, TN',
      message: newFormData.message,
      status: newFormData.status || 'New'
    });

    setIsAddModalOpen(false);
    setNewFormData({ name: '', phone: '', email: '', location: '', message: '', status: 'New' });
  };

  const handleCSVImport = (data) => {
    let imported = 0;
    data.forEach(row => {
      if (row.name && row.phone && row.message) {
        addContactEnquiry({
          name: row.name,
          contact_info: `${row.phone} / ${row.email || ''}`,
          phone: row.phone,
          email: row.email || '',
          location: row.location || 'Erode, TN',
          message: row.message,
          status: row.status || 'New'
        });
        imported++;
      }
    });
    alert(`Successfully imported ${imported} contact enquiry records.`);
  };

  // Table Columns
  const tableColumns = [
    {
      key: 'name',
      label: 'Your Name',
      render: (row) => (
        <div>
          <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{row.name}</div>
          {row.location && (
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <MapPin size={12} /> {row.location}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'contact_info',
      label: 'Phone / Email',
      render: (row) => (
        <div style={{ fontSize: '0.84rem' }}>
          <div style={{ fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Phone size={13} style={{ color: 'var(--primary-yellow)' }} /> {row.phone}
          </div>
          {row.email && (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
              <Mail size={13} /> {row.email}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'message',
      label: 'Your Message',
      render: (row) => (
        <div className="message-preview-text" title={row.message}>
          {row.message}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="user-actions">
          <button
            className="action-btn-icon"
            title="View Full Details"
            onClick={() => {
              setSelectedEnquiry(row);
              setIsViewModalOpen(true);
            }}
          >
            <Eye size={16} />
          </button>
          <button
            className="action-btn-icon delete"
            title="Delete Enquiry"
            onClick={() => {
              if (window.confirm(`Delete contact enquiry from ${row.name}?`)) {
                deleteContactEnquiry(row.contact_id);
              }
            }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="contact-enquiry-module">
      {/* Header Banner */}
      <div className="contact-header-banner">
        <div className="contact-header-top">
          <div>
            <h1 className="contact-header-title">
              <MessageSquare size={26} style={{ color: 'var(--primary-yellow)' }} />
              Contact Us Enquiries
            </h1>
            <p className="contact-header-subtitle">
              Manage client inquiries, contact messages, and callback requests submitted via Website & Mobile App
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <button className="btn-secondary" onClick={() => exportToXLS(filteredEnquiries, 'Yeloline_Contact_Enquiries', 'Contact Us Enquiries', CONTACT_COLUMNS_SPEC)}>
              <FileSpreadsheet size={16} /> Export XLS
            </button>

            <button className="btn-secondary" onClick={() => exportToPDF(filteredEnquiries, 'Yeloline_Contact_Enquiries', 'Contact Us Enquiries', CONTACT_COLUMNS_SPEC)}>
              <FileText size={16} /> Export PDF
            </button>

            <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
              <Plus size={16} /> Add Contact Entry
            </button>
          </div>
        </div>

        {/* Office & Direct Contact Info Banner */}
        <div className="contact-office-grid">
          <div className="contact-info-card">
            <div className="contact-info-icon">
              <Phone size={20} />
            </div>
            <div>
              <div className="contact-info-title">Call Us</div>
              <div className="contact-info-val">+91 98765 43210</div>
            </div>
          </div>

          <div className="contact-info-card">
            <div className="contact-info-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
              <Send size={20} />
            </div>
            <div>
              <div className="contact-info-title">WhatsApp</div>
              <div className="contact-info-val">+91 98765 43210</div>
            </div>
          </div>

          <div className="contact-info-card">
            <div className="contact-info-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' }}>
              <MapPin size={20} />
            </div>
            <div>
              <div className="contact-info-title">Head Office Location</div>
              <div className="contact-info-val" style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                YeloLine Tower, Perundurai Road, Erode, Tamil Nadu 638011
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="contact-stats-grid">
        <div className="contact-stat-card">
          <div>
            <div className="contact-stat-number">{totalCount}</div>
            <div className="contact-stat-label">Total Messages</div>
          </div>
          <MessageSquare size={32} style={{ color: 'var(--text-muted)' }} />
        </div>

        <div className="contact-stat-card">
          <div>
            <div className="contact-stat-number" style={{ color: '#EF4444' }}>{newCount}</div>
            <div className="contact-stat-label">New Enquiries</div>
          </div>
          <Clock size={32} style={{ color: '#EF4444' }} />
        </div>

        <div className="contact-stat-card">
          <div>
            <div className="contact-stat-number" style={{ color: '#F59E0B' }}>{contactedCount}</div>
            <div className="contact-stat-label">In Progress</div>
          </div>
          <Phone size={32} style={{ color: '#F59E0B' }} />
        </div>

        <div className="contact-stat-card">
          <div>
            <div className="contact-stat-number" style={{ color: '#10B981' }}>{resolvedCount}</div>
            <div className="contact-stat-label">Resolved & Closed</div>
          </div>
          <CheckCircle size={32} style={{ color: '#10B981' }} />
        </div>
      </div>

      {/* Controls & Search Bar */}
      <div className="contact-controls-card">
        <div className="contact-search-filters">
          <div className="contact-search-box">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Search by name, phone, email, location or message content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-dropdown-group">
            <span className="filter-field-label">Status:</span>
            <CustomSelect
              options={['All', 'New', 'Contacted', 'In Progress', 'Resolved']}
              value={selectedStatus}
              onChange={(val) => setSelectedStatus(val)}
              placeholder="Filter Status"
            />
          </div>
        </div>
      </div>

      {/* Enquiries Table */}
      <DataTable
        columns={tableColumns}
        data={filteredEnquiries}
        keyField="contact_id"
        showSearch={false}
      />

      {/* View Details Modal */}
      {isViewModalOpen && selectedEnquiry && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Contact Message: ${selectedEnquiry.contact_id}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: 'var(--light-background)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--light-border)' }}>
              <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{selectedEnquiry.name}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <span><strong>Phone:</strong> {selectedEnquiry.phone}</span>
                {selectedEnquiry.email && <span><strong>Email:</strong> {selectedEnquiry.email}</span>}
                {selectedEnquiry.location && <span><strong>Location:</strong> {selectedEnquiry.location}</span>}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Message Content:</label>
              <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--light-border)', minHeight: '90px', whiteSpace: 'pre-wrap', lineHeight: '1.5', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                {selectedEnquiry.message}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Update Status:</span>
                <CustomSelect
                  options={['New', 'Contacted', 'In Progress', 'Resolved']}
                  value={selectedEnquiry.status}
                  onChange={(newStat) => {
                    updateContactEnquiryStatus(selectedEnquiry.contact_id, newStat);
                    setSelectedEnquiry({ ...selectedEnquiry, status: newStat });
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <a
                  href={`tel:${selectedEnquiry.phone}`}
                  className="btn-primary"
                  style={{ textDecoration: 'none', background: '#10B981', color: '#FFFFFF' }}
                >
                  <Phone size={15} /> Call Client
                </a>
                <a
                  href={`https://wa.me/${selectedEnquiry.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(selectedEnquiry.name)},%20thank%20you%20for%20contacting%20Yeloline%20Construction.`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary"
                  style={{ textDecoration: 'none', background: '#25D366', color: '#FFFFFF' }}
                >
                  <Send size={15} /> WhatsApp
                </a>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add New Contact Entry Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New Contact Enquiry Entry"
        >
          <form onSubmit={handleCreateEnquiry} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="user-form-grid">
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: '600', fontSize: '0.85rem' }}>Your Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Senthil Kumar"
                  value={newFormData.name}
                  onChange={(e) => setNewFormData({ ...newFormData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: '600', fontSize: '0.85rem' }}>Phone Number *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. +91 98765 43210"
                  value={newFormData.phone}
                  onChange={(e) => setNewFormData({ ...newFormData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: '600', fontSize: '0.85rem' }}>Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="e.g. senthil.k@gmail.com"
                  value={newFormData.email}
                  onChange={(e) => setNewFormData({ ...newFormData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: '600', fontSize: '0.85rem' }}>Location</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Perundurai, Erode"
                  value={newFormData.location}
                  onChange={(e) => setNewFormData({ ...newFormData, location: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '600', fontSize: '0.85rem' }}>Your Message *</label>
              <textarea
                className="form-control"
                placeholder="Enter client message / enquiry details..."
                value={newFormData.message}
                onChange={(e) => setNewFormData({ ...newFormData, message: e.target.value })}
                required
                style={{ minHeight: '100px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" className="btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                <Check size={16} /> Save Contact Entry
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* CSV Import Modal */}
      {isImportModalOpen && (
        <CSVImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          title="Import Contact Enquiries from CSV"
          columnsSpec={CONTACT_COLUMNS_SPEC}
          onImport={handleCSVImport}
        />
      )}

      )}
    </div>
  );
}
