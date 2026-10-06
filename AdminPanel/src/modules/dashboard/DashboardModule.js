import React, { useState } from 'react';
import {
  FileText,
  Building2,
  TrendingUp,
  Receipt,
  ShoppingCart,
  Calendar,
  Eye,
  MapPin,
  Phone,
  Mail,
  FileSpreadsheet
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import MetricCard from '../../components/common/MetricCard/MetricCard';
import DataTable from '../../components/common/DataTable/DataTable';
import StatusBadge from '../../components/common/StatusBadge/StatusBadge';
import Modal from '../../components/common/Modal/Modal';
import './DashboardModule.css';

const FINANCIAL_COLUMNS_SPEC = [
  { key: "enquiry_id", label: "Enquiry ID", type: "String", required: true, example: "ENQ-2026-001" },
  { key: "client_name", label: "Client Full Name", type: "String", required: true, example: "Ramesh Sundaram" },
  { key: "site_location", label: "Site Address", type: "String", required: true, example: "Perundurai Road, Erode" },
  { key: "structure_type", label: "Structure Type", type: "String", required: true, example: "Villa" },
  { key: "total_estimated_cost", label: "Total Cost (₹)", type: "Number", required: true, example: "7200000" },
  { key: "enquiry_date", label: "Enquiry Date", type: "Date", required: true, example: "2026-09-18" },
  { key: "lead_stage", label: "Lead Stage", type: "String", required: true, example: "Estimate Shared" }
];

export default function DashboardModule() {
  const {
    enquiries,
    projects,
    expenses,
    purchases,
    payments,
    appointments,
    exportToXLS,
    exportToPDF
  } = useApp();

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [viewingDetailEnquiry, setViewingDetailEnquiry] = useState(null);

  // Calculations
  const totalRevenue = payments.reduce((acc, p) => acc + Number(p.amount_received || 0), 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);
  const totalPurchases = purchases.reduce((acc, p) => acc + Number(p.total_amount || 0), 0);
  const pendingAppointments = appointments.filter(a => a.status !== 'Completed').length;

  const quoteColumns = [
    { header: "Client Name", key: "client_name", render: (r) => <strong style={{ whiteSpace: 'nowrap' }}>{r.client_name}</strong> },
    { header: "Location", key: "site_location", render: (r) => <span style={{ whiteSpace: 'nowrap' }}>{r.site_location}</span> },
    { header: "Structure", key: "structure_type", render: (r) => <span style={{ whiteSpace: 'nowrap' }}>{r.structure_type}</span> },
    { header: "Est. Rate", key: "estimated_rate_per_sqft", render: (r) => <span style={{ whiteSpace: 'nowrap' }}>{r.estimated_rate_per_sqft}</span> },
    { header: "Date", key: "enquiry_date", render: (r) => <span style={{ whiteSpace: 'nowrap' }}>{r.enquiry_date}</span> },
    { header: "Status", key: "lead_stage", render: (r) => <StatusBadge status={r.lead_stage} /> },
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
        </div>
      )
    }
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard & Financial Analytics</h1>
          <p className="dashboard-subtitle">Real-time site metrics, quote leads, and financial summary overview</p>
        </div>
        <div className="header-action-group">
          <button className="btn-secondary" onClick={() => exportToXLS(enquiries, 'Yeloline_Dashboard_Export', 'Dashboard & Financial Analytics', FINANCIAL_COLUMNS_SPEC)}>
            <FileSpreadsheet size={16} /> Export XLS
          </button>
          <button className="btn-secondary" onClick={() => exportToPDF(enquiries, 'Yeloline_Dashboard_Export', 'Dashboard & Financial Analytics', FINANCIAL_COLUMNS_SPEC)}>
            <FileText size={16} /> Export PDF
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="dashboard-metrics-grid">
        <MetricCard
          title="Total Quotes Received"
          value={enquiries.length}
          icon={FileText}
          trend="+18%"
          subtext="vs last month"
          highlight
        />
        <MetricCard
          title="Active Projects"
          value={projects.length}
          icon={Building2}
          trend="+2"
          subtext="Under active execution"
        />
        <MetricCard
          title="Revenue Collected"
          value={`₹${(totalRevenue / 100000).toFixed(2)}L`}
          icon={TrendingUp}
          trend="+24%"
          subtext="From client milestone payments"
        />
        <MetricCard
          title="Total Site Expenses"
          value={`₹${(totalExpenses / 1000).toFixed(1)}k`}
          icon={Receipt}
          subtext="Labor, equipment, utilities"
        />
        <MetricCard
          title="Material Purchase Total"
          value={`₹${(totalPurchases / 100000).toFixed(2)}L`}
          icon={ShoppingCart}
          subtext="Cement, TMT steel, bricks"
        />
        <MetricCard
          title="Pending Appointments"
          value={pendingAppointments}
          icon={Calendar}
          subtext="Renovation Van site visits"
        />
      </div>


      {/* Recent Quote Requests Table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 className="chart-card-title">Recent Quote Requests (Latest 5)</h3>
        <DataTable
          columns={quoteColumns}
          data={enquiries.slice(0, 5)}
          pageSize={5}
          onRowClick={(row) => setViewingDetailEnquiry(row)}
        />
      </div>

      {/* Enquiry Detail Modal */}
      {viewingDetailEnquiry && (
        <Modal
          isOpen={!!viewingDetailEnquiry}
          onClose={() => setViewingDetailEnquiry(null)}
          title={`Enquiry Full Details Specification - ${viewingDetailEnquiry.enquiry_id}`}
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

            {/* Comprehensive Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '0.85rem 1rem', background: 'var(--light-background)', border: '1px solid var(--light-border)', borderRadius: 'var(--radius-sm)' }}>
                <div className="form-label" style={{ marginBottom: '4px' }}>Phone Number</div>
                <div style={{ fontWeight: '700', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={14} /> {viewingDetailEnquiry.client_phone}
                </div>
              </div>

              <div style={{ padding: '0.85rem 1rem', background: 'var(--light-background)', border: '1px solid var(--light-border)', borderRadius: 'var(--radius-sm)' }}>
                <div className="form-label" style={{ marginBottom: '4px' }}>Email Address</div>
                <div style={{ fontWeight: '700', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={14} /> {viewingDetailEnquiry.client_email || 'Not Provided'}
                </div>
              </div>

              <div style={{ padding: '0.85rem 1rem', background: 'var(--light-background)', border: '1px solid var(--light-border)', borderRadius: 'var(--radius-sm)' }}>
                <div className="form-label" style={{ marginBottom: '4px' }}>Structure Type</div>
                <div style={{ fontWeight: '700', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={14} /> {viewingDetailEnquiry.structure_type || 'Villa / Residential'}
                </div>
              </div>

              <div style={{ padding: '0.85rem 1rem', background: 'var(--light-background)', border: '1px solid var(--light-border)', borderRadius: 'var(--radius-sm)' }}>
                <div className="form-label" style={{ marginBottom: '4px' }}>Built-Up Area</div>
                <div style={{ fontWeight: '700', fontSize: '0.92rem' }}>
                  {viewingDetailEnquiry.builtup_area_sqft} sq. ft.
                </div>
              </div>

              <div style={{ padding: '0.85rem 1rem', background: 'var(--light-background)', border: '1px solid var(--light-border)', borderRadius: 'var(--radius-sm)' }}>
                <div className="form-label" style={{ marginBottom: '4px' }}>Cement Brand Spec</div>
                <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--accent-yellow-dark)' }}>
                  {viewingDetailEnquiry.cement_brand || 'UltraTech Cement'}
                </div>
              </div>

              <div style={{ padding: '0.85rem 1rem', background: 'var(--light-background)', border: '1px solid var(--light-border)', borderRadius: 'var(--radius-sm)' }}>
                <div className="form-label" style={{ marginBottom: '4px' }}>Est. Rate / Sq. Ft.</div>
                <div style={{ fontWeight: '700', fontSize: '0.92rem' }}>
                  {viewingDetailEnquiry.estimated_rate_per_sqft || '₹2,200'}
                </div>
              </div>
            </div>

            {/* Total Estimated Cost Banner */}
            <div style={{ padding: '1rem 1.25rem', background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.15), rgba(234, 179, 8, 0.08))', border: '1px solid rgba(250, 204, 21, 0.3)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: '700', color: 'var(--dark-charcoal)' }}>Total Project Budget Estimate:</span>
              <span style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--accent-yellow-dark)' }}>
                ₹{Number(viewingDetailEnquiry.total_estimated_cost).toLocaleString('en-IN')}
              </span>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setViewingDetailEnquiry(null)}
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
