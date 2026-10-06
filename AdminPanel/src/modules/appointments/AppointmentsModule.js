import React, { useState } from 'react';
import { Plus, Download, Upload, Truck, Phone, Calendar, CheckCircle2, Filter, Eye, MapPin, Wrench, Clock, FileText, FileSpreadsheet } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import DataTable from '../../components/common/DataTable/DataTable';
import Modal from '../../components/common/Modal/Modal';
import MetricCard from '../../components/common/MetricCard/MetricCard';
import CustomSelect from '../../components/common/CustomSelect/CustomSelect';
import CSVImportModal from '../../components/common/CSVImportModal/CSVImportModal';
import './AppointmentsModule.css';

const SERVICES_LIST = [
  "Full Home Renovation",
  "Kitchen Remodeling",
  "Bathroom Upgrade",
  "Painting & Waterproofing",
  "Roofing & Structure"
];

const TIME_SLOTS = [
  "Morning (9:00 AM - 12:00 PM)",
  "Afternoon (2:00 PM - 5:00 PM)",
  "Evening (5:00 PM - 7:00 PM)"
];

const STATUS_OPTIONS = ["Scheduled", "Confirmed", "Completed", "Cancelled"];

const APPOINTMENT_COLUMNS_SPEC = [
  { key: "appointment_id", label: "Appointment ID", type: "String", required: true, example: "APT-501" },
  { key: "customer_name", label: "Customer Full Name", type: "String", required: true, example: "Gokulakrishnan M." },
  { key: "customer_phone", label: "Customer Phone", type: "String", required: true, example: "+91 98427 12900" },
  { key: "site_location", label: "Location", type: "String", required: true, example: "Sampath Nagar, Erode" },
  { key: "appointment_date", label: "Visit Date", type: "Date", required: true, example: "2026-09-22" },
  { key: "preferred_time_slot", label: "Preferred Time Slot", type: "String", required: true, example: "Morning (9:00 AM - 12:00 PM)" },
  { key: "status", label: "Booking Status", type: "String", required: true, example: "Scheduled" },
  { key: "additional_notes", label: "Additional Notes", type: "String", required: false, example: "Laser scan demo requested" }
];

const SAMPLE_APPOINTMENT_ROW = {
  appointment_id: "APT-501",
  customer_name: "Gokulakrishnan M.",
  customer_phone: "+91 98427 12900",
  site_location: "Sampath Nagar, Erode",
  appointment_date: "2026-09-22",
  preferred_time_slot: "Morning (9:00 AM - 12:00 PM)",
  status: "Scheduled",
  additional_notes: "Modular kitchen sample demo requested"
};

export default function AppointmentsModule() {
  const { appointments, addAppointment, updateAppointmentStatus, importAppointments, exportToXLS, exportToPDF } = useApp();
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [viewingDetailAppointment, setViewingDetailAppointment] = useState(null);

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    site_location: '',
    appointment_date: new Date().toISOString().split('T')[0],
    preferred_time_slot: 'Morning (9:00 AM - 12:00 PM)',
    renovation_services: ["Kitchen Remodeling"],
    additional_notes: ''
  });

  const filteredAppointments = selectedStatusFilter === 'ALL'
    ? appointments
    : appointments.filter(a => a.status === selectedStatusFilter);

  const handleSubmit = (e) => {
    e.preventDefault();
    addAppointment(formData);
    setIsModalOpen(false);
    setFormData({
      customer_name: '',
      customer_phone: '',
      site_location: '',
      appointment_date: new Date().toISOString().split('T')[0],
      preferred_time_slot: 'Morning (9:00 AM - 12:00 PM)',
      renovation_services: ["Kitchen Remodeling"],
      additional_notes: ''
    });
  };

  const toggleServiceChoice = (srv) => {
    setFormData(prev => {
      const exists = prev.renovation_services.includes(srv);
      return {
        ...prev,
        renovation_services: exists
          ? prev.renovation_services.filter(s => s !== srv)
          : [...prev.renovation_services, srv]
      };
    });
  };

  const columns = [
    {
      header: "APT ID",
      key: "appointment_id",
      render: (r) => <span style={{ fontWeight: '700', color: 'var(--accent-yellow-dark)' }}>{r.appointment_id}</span>
    },
    { header: "Client Name", key: "customer_name", render: (r) => <strong>{r.customer_name}</strong> },
    {
      header: "Phone",
      key: "customer_phone",
      render: (r) => (
        <a
          href={`tel:${r.customer_phone}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--accent-yellow-dark)', fontWeight: '600', textDecoration: 'none' }}
        >
          <Phone size={13} /> {r.customer_phone}
        </a>
      )
    },
    { header: "Location", key: "site_location" },
    {
      header: "Preferred Time Slot",
      key: "appointment_date",
      render: (r) => (
        <div>
          <div style={{ fontWeight: '600' }}>{r.appointment_date}</div>
          {r.preferred_time_slot && (
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>{r.preferred_time_slot}</div>
          )}
        </div>
      )
    },
    {
      header: "Service Required",
      key: "renovation_services",
      render: (r) => (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {(r.renovation_services || []).map((srv, idx) => (
            <span key={idx} className="service-tag">{srv}</span>
          ))}
        </div>
      )
    },
    {
      header: "Actions",
      key: "actions",
      render: (r) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            style={{ background: 'var(--info-bg)', border: 'none', color: 'var(--info-blue)', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer' }}
            onClick={() => setViewingDetailAppointment(r)}
            title="View Full Appointment Details"
          >
            <Eye size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="appointments-container">
      <div className="leads-header-row">
        <div>
          <h1 className="dashboard-title">Renovation Van & Site Appointments</h1>
          <p className="dashboard-subtitle">Manage mobile Renovation Van technician site visits & customer bookings</p>
        </div>
        <div className="header-action-group">
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Schedule Appointment
          </button>
          <div className="csv-action-group">
            <button
              className="btn-secondary"
              onClick={() => exportToXLS(filteredAppointments, 'Yeloline_Renovation_Appointments', 'Renovation Van & Site Appointments', APPOINTMENT_COLUMNS_SPEC)}
            >
              <FileSpreadsheet size={16} /> Export XLS
            </button>
            <button
              className="btn-secondary"
              onClick={() => exportToPDF(filteredAppointments, 'Yeloline_Renovation_Appointments', 'Renovation Van & Site Appointments', APPOINTMENT_COLUMNS_SPEC)}
            >
              <FileText size={16} /> Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Van Feature Banner */}
      <div className="van-banner">
        <div>
          <div className="van-title"><Truck size={20} /> Mobile Renovation Van Fleet active in Erode Zone</div>
          <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Equipped with 3D laser scanners, tile samples, moisture meters & instant quote estimation kits.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ fontSize: '0.85rem' }}>Active Vans: <strong>4 Units</strong></div>
          <div style={{ fontSize: '0.85rem' }}>Visits Today: <strong>6 Completed</strong></div>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <MetricCard
          title="Total Bookings"
          value={appointments.length}
          icon={Calendar}
          highlight
        />
        <MetricCard
          title="Scheduled Visits"
          value={appointments.filter(a => a.status === 'Scheduled' || a.status === 'Confirmed').length}
          icon={Clock}
        />
        <MetricCard
          title="Completed Site Visits"
          value={appointments.filter(a => a.status === 'Completed').length}
          icon={CheckCircle2}
        />
      </div>

      {/* Filter Bar */}
      <div className="leads-filter-bar">
        <CustomSelect
          icon={Filter}
          label="Status:"
          value={selectedStatusFilter}
          onChange={(val) => setSelectedStatusFilter(val)}
          options={[
            { value: "ALL", label: `All Statuses (${appointments.length})`, badge: appointments.length },
            ...STATUS_OPTIONS.map(s => ({
              value: s,
              label: s,
              badge: appointments.filter(a => a.status === s).length
            }))
          ]}
        />
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredAppointments}
        searchPlaceholder="Search customer, location..."
        pageSize={8}
        onRowClick={(row) => setViewingDetailAppointment(row)}
      />

      {/* Create Appointment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Renovation Van Site Appointment"
      >
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label className="form-label">Client Name *</label>
            <input
              type="text"
              required
              className="form-input"
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <input
              type="text"
              required
              className="form-input"
              value={formData.customer_phone}
              onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Location *</label>
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
            <label className="form-label">Appointment Date *</label>
            <input
              type="date"
              className="form-input"
              value={formData.appointment_date}
              onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Preferred Time Slot *</label>
            <select
              className="form-input"
              value={formData.preferred_time_slot}
              onChange={(e) => setFormData({ ...formData, preferred_time_slot: e.target.value })}
            >
              {TIME_SLOTS.map(ts => <option key={ts} value={ts}>{ts}</option>)}
            </select>
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Service Required</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
              {SERVICES_LIST.map(srv => {
                const active = formData.renovation_services.includes(srv);
                return (
                  <button
                    key={srv}
                    type="button"
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--light-border)',
                      backgroundColor: active ? 'var(--primary-yellow)' : 'var(--light-background)',
                      color: active ? 'var(--dark-charcoal)' : 'var(--text-primary)',
                      fontWeight: active ? '800' : '600',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                    onClick={() => toggleServiceChoice(srv)}
                  >
                    {srv}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Additional Notes</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="e.g., Client wants bath tile sample demo, site laser scan required..."
              value={formData.additional_notes}
              onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ gridColumn: '1 / -1', marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Book Appointment
            </button>
          </div>
        </form>
      </Modal>

      {/* Appointment Detail Modal */}
      {viewingDetailAppointment && (
        <Modal
          isOpen={!!viewingDetailAppointment}
          onClose={() => setViewingDetailAppointment(null)}
          title={`Renovation Appointment Details - ${viewingDetailAppointment.appointment_id}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Header info card */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--light-background)', border: '1px solid var(--light-border)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>{viewingDetailAppointment.customer_name}</h2>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} /> {viewingDetailAppointment.site_location}
                </div>
              </div>
              <span className={`status-badge ${viewingDetailAppointment.status === 'Completed' ? 'badge-active' : viewingDetailAppointment.status === 'Cancelled' ? 'badge-cancelled' : 'badge-pending'}`}>
                {viewingDetailAppointment.status}
              </span>
            </div>

            {/* Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '0.85rem 1rem', background: 'var(--light-background)', border: '1px solid var(--light-border)', borderRadius: 'var(--radius-sm)' }}>
                <div className="form-label" style={{ marginBottom: '4px' }}>Phone Number</div>
                <a
                  href={`tel:${viewingDetailAppointment.customer_phone}`}
                  style={{ fontWeight: '700', fontSize: '0.92rem', display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent-yellow-dark)', textDecoration: 'none' }}
                >
                  <Phone size={14} /> {viewingDetailAppointment.customer_phone}
                </a>
              </div>

              <div style={{ padding: '0.85rem 1rem', background: 'var(--light-background)', border: '1px solid var(--light-border)', borderRadius: 'var(--radius-sm)' }}>
                <div className="form-label" style={{ marginBottom: '4px' }}>Appointment Date</div>
                <div style={{ fontWeight: '700', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} /> {viewingDetailAppointment.appointment_date}
                </div>
              </div>

              <div style={{ padding: '0.85rem 1rem', background: 'var(--light-background)', border: '1px solid var(--light-border)', borderRadius: 'var(--radius-sm)' }}>
                <div className="form-label" style={{ marginBottom: '4px' }}>Preferred Time Slot</div>
                <div style={{ fontWeight: '700', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-yellow-dark)' }}>
                  <Clock size={14} /> {viewingDetailAppointment.preferred_time_slot || 'Morning (9:00 AM - 12:00 PM)'}
                </div>
              </div>

              <div style={{ padding: '0.85rem 1rem', background: 'var(--light-background)', border: '1px solid var(--light-border)', borderRadius: 'var(--radius-sm)' }}>
                <div className="form-label" style={{ marginBottom: '4px' }}>Appointment ID</div>
                <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--accent-yellow-dark)' }}>
                  {viewingDetailAppointment.appointment_id}
                </div>
              </div>
            </div>

            {/* Service Required Card */}
            <div style={{ padding: '1rem', background: 'var(--light-background)', border: '1px solid var(--light-border)', borderRadius: 'var(--radius-md)' }}>
              <div className="form-label" style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Wrench size={14} /> Service Required
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {(viewingDetailAppointment.renovation_services || []).length > 0 ? (
                  viewingDetailAppointment.renovation_services.map((srv, idx) => (
                    <span key={idx} className="service-tag" style={{ fontSize: '0.85rem', padding: '4px 10px' }}>
                      {srv}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>General Van Site Inspection</span>
                )}
              </div>
            </div>

            {/* Additional Notes Card */}
            {viewingDetailAppointment.additional_notes && (
              <div style={{ padding: '1rem', background: 'var(--light-background)', border: '1px solid var(--light-border)', borderRadius: 'var(--radius-md)' }}>
                <div className="form-label" style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={14} /> Additional Notes
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                  {viewingDetailAppointment.additional_notes}
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setViewingDetailAppointment(null)}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Renovation Appointments CSV"
        moduleName="Renovation Appointments"
        compulsoryColumns={APPOINTMENT_COLUMNS_SPEC}
        sampleRow={SAMPLE_APPOINTMENT_ROW}
        onImport={(data) => importAppointments(data)}
      />

    </div>
  );
}
