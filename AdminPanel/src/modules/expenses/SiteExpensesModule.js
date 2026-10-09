import React, { useState } from 'react';
import { Trash2, DollarSign, Filter, Eye, User, FileSpreadsheet, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import DataTable from '../../components/common/DataTable/DataTable';
import Modal from '../../components/common/Modal/Modal';
import CustomSelect from '../../components/common/CustomSelect/CustomSelect';
import CSVImportModal from '../../components/common/CSVImportModal/CSVImportModal';
import './SiteExpensesModule.css';

const getNormalizedCategory = (cat) => {
  if (!cat) return "Labour";
  const str = String(cat).toLowerCase();
  if (str.includes("labor") || str.includes("labour") || str.includes("mason") || str.includes("wages")) {
    return "Labour";
  }
  return "Other Expense";
};

const ENTERED_BY_OPTIONS = ["Suriya prakash", "Bala"];

const EXPENSE_COLUMNS_SPEC = [
  { key: "expense_id", label: "Expense ID", type: "String", required: true, example: "EXP-801" },
  { key: "category", label: "Construction Site", type: "String", required: true, example: "Labour" },
  { key: "work_category", label: "Work Category", type: "String", required: true, example: "Masonry" },
  { key: "amount", label: "Amount (₹)", type: "Number", required: true, example: "85000" },
  { key: "date", label: "Payment Date", type: "Date", required: true, example: "2026-09-18" },
  { key: "payment_mode", label: "Payment Mode", type: "String", required: true, example: "Bank Transfer" },
  { key: "entered_by", label: "Entered By", type: "String", required: true, example: "Suriya prakash" },
  { key: "notes", label: "Notes / Purpose", type: "String", required: false, example: "Weekly mason payout" }
];

const SAMPLE_EXPENSE_ROW = {
  expense_id: "EXP-801",
  site_name: "SITE-101",
  category: "Labour",
  work_category: "Masonry",
  amount: 85000,
  date: "2026-09-18",
  payment_mode: "Bank Transfer",
  entered_by: "Suriya prakash",
  notes: "Weekly mason payout"
};

export default function SiteExpensesModule() {
  const { expenses, projects, sites = [], deleteExpense, importExpenses, exportToXLS, exportToPDF } = useApp();

  const [selectedSiteName, setSelectedSiteName] = useState('ALL');
  const [selectedEnteredBy, setSelectedEnteredBy] = useState('ALL');

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [viewingDetailExpense, setViewingDetailExpense] = useState(null);

  // Dynamic Site Names list for modal & filter selection
  const siteList = Array.from(
    new Set([
      ...(sites || []).map(s => s.site_name || s.name || s.title),
      ...projects.map(p => p.title),
      ...expenses.map(e => e.site_name)
    ].filter(Boolean))
  );

  const filteredExpenses = expenses.filter(e => {
    // Only display Labour expenses in Labour Expense Tracker
    const cat = String(e.category || '').toLowerCase();
    if (cat.includes('material')) return false;

    const matchesSite = selectedSiteName === 'ALL' || e.site_name === selectedSiteName;
    const matchesEnteredBy = selectedEnteredBy === 'ALL' || (e.entered_by || 'Suriya prakash') === selectedEnteredBy;
    return matchesSite && matchesEnteredBy;
  });

  const totalExpenseSum = filteredExpenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const columns = [
    {
      header: "Expense ID",
      key: "expense_id",
      render: (r) => <span style={{ fontWeight: '700', color: 'var(--accent-yellow-dark)' }}>{r.expense_id}</span>
    },
    {
      header: "Site",
      key: "site_name",
      render: (r) => <strong>{r.site_name}</strong>
    },
    {
      header: "Expense Type",
      key: "category",
      render: (r) => {
        const cat = getNormalizedCategory(r.category);
        return (
          <span style={{
            backgroundColor: cat === 'Labour' ? 'var(--primary-yellow-light)' : 'var(--info-bg)',
            color: cat === 'Labour' ? 'var(--accent-yellow-dark)' : 'var(--info-blue)',
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '0.82rem',
            fontWeight: '800'
          }}>
            {cat}
          </span>
        );
      }
    },
    {
      header: "Work Category",
      key: "work_category",
      render: (r) => (
        <span style={{
          backgroundColor: 'var(--light-background)',
          color: 'var(--text-primary)',
          border: '1px solid var(--light-border)',
          padding: '4px 10px',
          borderRadius: '4px',
          fontSize: '0.78rem',
          fontWeight: '700'
        }}>
          {r.work_category || 'Masonry'}
        </span>
      )
    },
    {
      header: "Amount",
      key: "amount",
      render: (r) => <strong style={{ color: 'var(--danger-red)' }}>₹{Number(r.amount).toLocaleString('en-IN')}</strong>
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
            onClick={() => setViewingDetailExpense(r)}
            title="View Full Expense Details"
          >
            <Eye size={14} />
          </button>
          <button
            style={{ background: 'var(--danger-bg)', border: 'none', color: 'var(--danger-red)', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer' }}
            onClick={() => deleteExpense(r.expense_id)}
            title="Delete Entry"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="expenses-container">
      <div className="leads-header-row">
        <div>
          <h1 className="dashboard-title">Labour Expense Tracker</h1>
          <p className="dashboard-subtitle">Log, categorize, and aggregate daily site operational expenses</p>
        </div>
        <div className="header-action-group">
          <div className="csv-action-group">
            <button
              className="btn-secondary"
              onClick={() => exportToXLS(filteredExpenses, 'Yeloline_Site_Expenses', 'Site Expense Tracker', EXPENSE_COLUMNS_SPEC)}
            >
              <FileSpreadsheet size={16} /> Export XLS
            </button>
            <button
              className="btn-secondary"
              onClick={() => exportToPDF(filteredExpenses, 'Yeloline_Site_Expenses', 'Site Expense Tracker', EXPENSE_COLUMNS_SPEC)}
            >
              <FileText size={16} /> Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Expense Aggregation Banner */}
      <div className="expense-summary-card">
        <div>
          <div className="expense-total-label">Total Aggregated Site Expenses</div>
          <div className="expense-total-amount">₹{totalExpenseSum.toLocaleString('en-IN')}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.1)', padding: '8px 14px', borderRadius: '8px' }}>
          <DollarSign size={20} style={{ color: 'var(--primary-yellow)' }} />
          <span style={{ fontSize: '0.85rem' }}>{filteredExpenses.length} Logged Entries</span>
        </div>
      </div>

      {/* Filter Bar with Dropdowns */}
      <div className="leads-filter-bar" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <CustomSelect
          icon={Filter}
          label="SITE:"
          value={selectedSiteName}
          onChange={(val) => setSelectedSiteName(val)}
          options={[
            { value: "ALL", label: `All Sites (${expenses.length})`, badge: expenses.length },
            ...siteList.map(s => ({
              value: s,
              label: s,
              badge: expenses.filter(e => e.site_name === s).length
            }))
          ]}
        />



        <CustomSelect
          icon={Filter}
          label="ENTERED BY:"
          value={selectedEnteredBy}
          onChange={(val) => setSelectedEnteredBy(val)}
          options={[
            { value: "ALL", label: `All Users (${expenses.length})`, badge: expenses.length },
            ...ENTERED_BY_OPTIONS.map(user => ({
              value: user,
              label: user,
              badge: expenses.filter(e => (e.entered_by || 'Suriya prakash') === user).length
            }))
          ]}
        />
      </div>

      {/* Data Table without Search Input */}
      <DataTable
        columns={columns}
        data={filteredExpenses}
        showSearch={false}
        pageSize={8}
        onRowClick={(row) => setViewingDetailExpense(row)}
      />



      {/* Expense Detail Modal */}
      {viewingDetailExpense && (
        <Modal
          isOpen={!!viewingDetailExpense}
          onClose={() => setViewingDetailExpense(null)}
          title={`Site Expense Details - ${viewingDetailExpense.expense_id}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--light-background)', border: '1px solid var(--light-border)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>{viewingDetailExpense.site_name}</h2>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Expense Type: <strong style={{ color: 'var(--accent-yellow-dark)' }}>{viewingDetailExpense.category}</strong>
                </div>
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--danger-red)' }}>
                ₹{Number(viewingDetailExpense.amount).toLocaleString('en-IN')}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '0.85rem 1rem', background: 'var(--light-background)', border: '1px solid var(--light-border)', borderRadius: 'var(--radius-sm)' }}>
                <div className="form-label" style={{ marginBottom: '4px' }}>Work Category</div>
                <div style={{ fontWeight: '700', fontSize: '0.92rem' }}>
                  {viewingDetailExpense.work_category || 'Masonry'}
                </div>
              </div>

              <div style={{ padding: '0.85rem 1rem', background: 'var(--light-background)', border: '1px solid var(--light-border)', borderRadius: 'var(--radius-sm)' }}>
                <div className="form-label" style={{ marginBottom: '4px' }}>Payment Mode</div>
                <div style={{ fontWeight: '700', fontSize: '0.92rem' }}>
                  {viewingDetailExpense.payment_mode}
                </div>
              </div>

              <div style={{ padding: '0.85rem 1rem', background: 'var(--light-background)', border: '1px solid var(--light-border)', borderRadius: 'var(--radius-sm)' }}>
                <div className="form-label" style={{ marginBottom: '4px' }}>Entered By</div>
                <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                  👤 {viewingDetailExpense.entered_by || 'Suriya prakash'}
                </div>
              </div>

              <div style={{ padding: '0.85rem 1rem', background: 'var(--light-background)', border: '1px solid var(--light-border)', borderRadius: 'var(--radius-sm)' }}>
                <div className="form-label" style={{ marginBottom: '4px' }}>Payment Date</div>
                <div style={{ fontWeight: '700', fontSize: '0.92rem' }}>
                  {viewingDetailExpense.date}
                </div>
              </div>

              <div style={{ padding: '0.85rem 1rem', background: 'var(--light-background)', border: '1px solid var(--light-border)', borderRadius: 'var(--radius-sm)' }}>
                <div className="form-label" style={{ marginBottom: '4px' }}>Expense ID</div>
                <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--accent-yellow-dark)' }}>
                  {viewingDetailExpense.expense_id}
                </div>
              </div>
            </div>

            {viewingDetailExpense.notes && (
              <div style={{ padding: '0.85rem 1rem', background: 'var(--light-background)', border: '1px solid var(--light-border)', borderRadius: 'var(--radius-sm)' }}>
                <div className="form-label" style={{ marginBottom: '4px' }}>Notes & Purpose</div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                  {viewingDetailExpense.notes}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="button" className="btn-secondary" onClick={() => setViewingDetailExpense(null)}>
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
        title="Import Site Expenses CSV"
        moduleName="Site Expenses"
        compulsoryColumns={EXPENSE_COLUMNS_SPEC}
        sampleRow={SAMPLE_EXPENSE_ROW}
        onImport={(data) => importExpenses(data)}
      />
    </div>
  );
}
