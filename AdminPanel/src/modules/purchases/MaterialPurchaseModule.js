import React, { useState } from 'react';
import {
  Filter,
  Eye,
  Trash2,
  FileSpreadsheet,
  FileText,
  User
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import DataTable from '../../components/common/DataTable/DataTable';
import Modal from '../../components/common/Modal/Modal';
import CustomSelect from '../../components/common/CustomSelect/CustomSelect';
import CSVImportModal from '../../components/common/CSVImportModal/CSVImportModal';
import './MaterialPurchaseModule.css';



const ENTERED_BY_OPTIONS = ["Suriya prakash", "Bala"];

const PURCHASE_COLUMNS_SPEC = [
  { key: "purchase_id", label: "PO Ref ID", type: "String", required: true, example: "PO-301" },
  { key: "site_name", label: "Select Site", type: "String", required: true, example: "SITE-101" },
  { key: "department", label: "Department", type: "String", required: true, example: "Masonry" },
  { key: "vendor_name", label: "Supplier Name", type: "String", required: true, example: "Shree Ganesh Bricks" },
  { key: "material_category", label: "Product / Material", type: "String", required: true, example: "Red Bricks" },
  { key: "order_date", label: "Date of Purchase", type: "Date", required: true, example: "2026-01-24" },
  { key: "total_amount", label: "Total Purchase Amount (₹)", type: "Number", required: true, example: "165000" },
  { key: "amount_paid", label: "Amount Paid (₹)", type: "Number", required: true, example: "100000" },
  { key: "entered_by", label: "Entered By", type: "String", required: true, example: "Suriya prakash" }
];

const SAMPLE_PURCHASE_ROW = {
  purchase_id: "PO-001",
  site_name: "SITE-101",
  department: "Masonry",
  vendor_name: "Shree Ganesh Bricks",
  material_category: "Red Bricks",
  order_date: "2026-01-24",
  total_amount: "50000",
  amount_paid: "50000",
  entered_by: "Suriya prakash"
};

export default function MaterialPurchaseModule() {
  const {
    purchases = [],
    expenses = [],
    sites = [],
    deletePurchase,
    deleteExpense,
    importPurchases,
    exportToXLS,
    exportToPDF
  } = useApp();

  const [selectedSiteFilter, setSelectedSiteFilter] = useState('ALL');
  const [selectedEnteredByFilter, setSelectedEnteredByFilter] = useState('ALL');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [viewingDetailPurchase, setViewingDetailPurchase] = useState(null);

  // Material Expense Tracker displays genuine material expenses from expenses collection
  const allMaterialExpenses = React.useMemo(() => {
    const list = [];
    (expenses || []).forEach(exp => {
      const cat = String(exp.category || '').toLowerCase();
      if (cat.includes('material')) {
        const supplierName = (exp.notes && exp.notes.includes('Supplier:'))
          ? exp.notes.replace('Supplier:', '').trim()
          : (exp.notes || 'Supplier');

        list.push({
          id: exp.id || exp.expense_id,
          purchase_id: exp.expense_id,
          expense_id: exp.expense_id,
          site_name: exp.site_name,
          department: exp.work_category || 'Masonry',
          vendor_name: supplierName,
          material_category: exp.work_category || 'Material',
          order_date: exp.date,
          total_amount: exp.amount,
          amount_paid: exp.amount,
          entered_by: exp.entered_by || 'Suriya prakash',
          payment_status: 'Paid',
          delivery_status: 'Delivered',
          notes: exp.notes
        });
      }
    });

    return list;
  }, [expenses]);

  // Extracted registered site names
  const allSitesList = Array.from(new Set(
    [
      ...(sites || []).map(s => s.name || s.title || s.site_name),
      ...allMaterialExpenses.map(p => p.site_name || p.project_name)
    ].filter(Boolean)
  ));

  const filteredPurchases = allMaterialExpenses.filter(p => {
    const matchesSite = selectedSiteFilter === 'ALL' || (p.site_name || p.project_name) === selectedSiteFilter;
    const matchesEnteredBy = selectedEnteredByFilter === 'ALL' || (p.entered_by || 'Suriya prakash') === selectedEnteredByFilter;
    return matchesSite && matchesEnteredBy;
  });

  const columns = [
    {
      header: "Expense ID",
      key: "purchase_id",
      render: (r) => <span style={{ fontWeight: '700', color: 'var(--accent-yellow-dark)' }}>{r.purchase_id}</span>
    },
    {
      header: "Site",
      key: "site_name",
      render: (r) => <strong>{r.site_name || 'N/A'}</strong>
    },
    {
      header: "Department",
      key: "department",
      render: (r) => (
        <span style={{
          backgroundColor: 'var(--light-background)',
          color: 'var(--text-primary)',
          border: '1px solid var(--light-border)',
          padding: '3px 8px',
          borderRadius: '4px',
          fontSize: '0.78rem',
          fontWeight: '700'
        }}>
          {r.department || 'Masonry'}
        </span>
      )
    },
    {
      header: "Supplier Name",
      key: "vendor_name",
      render: (r) => <strong>{r.vendor_name}</strong>
    },
    {
      header: "Product / Material",
      key: "material_category"
    },
    {
      header: "Total Amount",
      key: "total_amount",
      render: (r) => <strong>₹{Number(r.total_amount || 0).toLocaleString('en-IN')}</strong>
    },
    {
      header: "Amount Paid",
      key: "amount_paid",
      render: (r) => <span style={{ color: 'var(--success-green)', fontWeight: '700' }}>₹{Number(r.amount_paid || 0).toLocaleString('en-IN')}</span>
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
            onClick={() => setViewingDetailPurchase(r)}
            title="View Full Purchase Order Details"
          >
            <Eye size={14} />
          </button>
          <button
            style={{ background: 'var(--danger-bg)', border: 'none', color: 'var(--danger-red)', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer' }}
            onClick={() => {
              if (r.purchase_id && String(r.purchase_id).startsWith('EXP-')) {
                deleteExpense(r.purchase_id);
              } else {
                deletePurchase(r.purchase_id);
              }
            }}
            title="Delete Entry"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="purchases-container">
      <div className="leads-header-row">
        <div>
          <h1 className="dashboard-title">Material Expense Tracker</h1>
          <p className="dashboard-subtitle">Record and track construction material orders and site purchase invoices</p>
        </div>
        <div className="header-action-group">
          <div className="csv-action-group">
            <button
              className="btn-secondary"
              onClick={() => exportToXLS(filteredPurchases, 'Yeloline_Material_Purchases', 'Material Purchase Orders', PURCHASE_COLUMNS_SPEC)}
            >
              <FileSpreadsheet size={16} /> Export XLS
            </button>
            <button
              className="btn-secondary"
              onClick={() => exportToPDF(filteredPurchases, 'Yeloline_Material_Purchases', 'Material Purchase Orders', PURCHASE_COLUMNS_SPEC)}
            >
              <FileText size={16} /> Export PDF
            </button>
          </div>
        </div>
      </div>



      {/* Filter Bar */}
      <div className="leads-filter-bar" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <CustomSelect
          icon={Filter}
          label="SITE:"
          value={selectedSiteFilter}
          onChange={(val) => setSelectedSiteFilter(val)}
          options={[
            { value: "ALL", label: `All Sites (${purchases.length})`, badge: purchases.length },
            ...allSitesList.map(s => ({
              value: s,
              label: s,
              badge: purchases.filter(p => (p.site_name || p.project_name) === s).length
            }))
          ]}
        />



        <CustomSelect
          icon={Filter}
          label="Entered By:"
          value={selectedEnteredByFilter}
          onChange={(val) => setSelectedEnteredByFilter(val)}
          options={[
            { value: "ALL", label: `All Users (${purchases.length})`, badge: purchases.length },
            ...ENTERED_BY_OPTIONS.map(name => ({
              value: name,
              label: name,
              badge: purchases.filter(p => (p.entered_by || 'Suriya prakash') === name).length
            }))
          ]}
        />
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredPurchases}
        searchPlaceholder="Search site, supplier name, material, PO ID..."
        pageSize={8}
        onRowClick={(row) => setViewingDetailPurchase(row)}
      />



      {/* Purchase Detail Modal */}
      {viewingDetailPurchase && (
        <Modal
          isOpen={!!viewingDetailPurchase}
          onClose={() => setViewingDetailPurchase(null)}
          title={`Material Purchase Order Details - ${viewingDetailPurchase.purchase_id}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--light-background)', border: '1px solid var(--light-border)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>{viewingDetailPurchase.vendor_name}</h2>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Site: <strong>{viewingDetailPurchase.site_name || 'N/A'}</strong> | Dept: <strong>{viewingDetailPurchase.department || 'N/A'}</strong>
                </div>
              </div>
              <span style={{ fontWeight: '700', color: 'var(--accent-yellow-dark)', fontSize: '1rem' }}>
                {viewingDetailPurchase.purchase_id}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '0.85rem 1rem', background: 'var(--light-background)', border: '1px solid var(--light-border)', borderRadius: 'var(--radius-sm)' }}>
                <div className="form-label" style={{ marginBottom: '4px' }}>Product / Material</div>
                <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--accent-yellow-dark)' }}>
                  {viewingDetailPurchase.material_category}
                </div>
              </div>

              <div style={{ padding: '0.85rem 1rem', background: 'var(--light-background)', border: '1px solid var(--light-border)', borderRadius: 'var(--radius-sm)' }}>
                <div className="form-label" style={{ marginBottom: '4px' }}>Date of Purchase</div>
                <div style={{ fontWeight: '700', fontSize: '0.92rem' }}>
                  {viewingDetailPurchase.order_date}
                </div>
              </div>

              <div style={{ padding: '0.85rem 1rem', background: 'var(--light-background)', border: '1px solid var(--light-border)', borderRadius: 'var(--radius-sm)' }}>
                <div className="form-label" style={{ marginBottom: '4px' }}>Amount Paid</div>
                <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--success-green)' }}>
                  ₹{Number(viewingDetailPurchase.amount_paid || 0).toLocaleString('en-IN')}
                </div>
              </div>

              <div style={{ padding: '0.85rem 1rem', background: 'var(--light-background)', border: '1px solid var(--light-border)', borderRadius: 'var(--radius-sm)' }}>
                <div className="form-label" style={{ marginBottom: '4px' }}>Entered By</div>
                <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                  👤 {viewingDetailPurchase.entered_by || 'Suriya prakash'}
                </div>
              </div>
            </div>

            <div style={{ padding: '1rem 1.25rem', background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.15), rgba(234, 179, 8, 0.08))', border: '1px solid rgba(250, 204, 21, 0.3)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: '700', color: 'var(--dark-charcoal)' }}>Total Purchase Amount:</span>
              <span style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--accent-yellow-dark)' }}>
                ₹{Number(viewingDetailPurchase.total_amount || 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="button" className="btn-secondary" onClick={() => setViewingDetailPurchase(null)}>
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* CSV Import Modal */}
      {isImportModalOpen && (
        <CSVImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          title="Import Material Purchase Orders CSV"
          moduleName="Material Purchases"
          compulsoryColumns={PURCHASE_COLUMNS_SPEC}
          sampleRow={SAMPLE_PURCHASE_ROW}
          onImport={(data) => importPurchases(data)}
        />
      )}
    </div>
  );
}
