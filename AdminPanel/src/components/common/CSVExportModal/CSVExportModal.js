import React from 'react';
import { Download, FileSpreadsheet, CheckCircle2, Info } from 'lucide-react';
import Modal from '../Modal/Modal';
import './CSVExportModal.css';

export default function CSVExportModal({
  isOpen,
  onClose,
  title = "CSV Export & Attribute Specifications",
  moduleName = "Data",
  columns = [],
  data = [],
  onConfirmExport
}) {
  const downloadBlankTemplate = () => {
    if (!columns || !columns.length) return;
    const headers = columns.map(c => c.key).join(',');
    const sampleValues = columns.map(c => `"${(''+(c.example || '')).replace(/"/g, '""')}"`).join(',');
    const csvContent = `${headers}\n${sampleValues}`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Yeloline_${moduleName.replace(/\s+/g, '_')}_Blank_Template.csv`;
    a.click();
  };

  const handleExportData = () => {
    onConfirmExport();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="760px">
      <div className="csv-export-modal-body">
        
        {/* Header Summary Banner */}
        <div className="export-summary-banner">
          <div className="export-summary-left">
            <FileSpreadsheet size={36} className="export-banner-icon" />
            <div>
              <h4 className="export-banner-title">{moduleName} CSV Attributes Specification</h4>
              <p className="export-banner-subtitle">Review compulsory attributes & column schema before exporting</p>
            </div>
          </div>
          <div className="export-record-count-badge">
            <CheckCircle2 size={16} />
            <span>{data.length} Records Ready</span>
          </div>
        </div>

        {/* Column Attributes Specification Box */}
        <div className="attributes-spec-container">
          <div className="spec-box-header">
            <Info size={16} className="spec-info-icon" />
            <span className="spec-box-title">Included CSV Columns ({columns.length} Total Attributes)</span>
          </div>
          <div className="spec-table-wrapper">
            <table className="spec-table">
              <thead>
                <tr>
                  <th>Attribute Key</th>
                  <th>Display Header</th>
                  <th>Data Type</th>
                  <th>Requirement</th>
                  <th>Example Value</th>
                </tr>
              </thead>
              <tbody>
                {columns.map((col) => (
                  <tr key={col.key}>
                    <td><code className="attr-code-key">{col.key}</code></td>
                    <td><strong>{col.label || col.key}</strong></td>
                    <td><span className="type-badge">{col.type || 'String'}</span></td>
                    <td>
                      <span className={`status-pill ${col.required ? 'compulsory' : 'optional'}`}>
                        {col.required ? 'Compulsory' : 'Optional'}
                      </span>
                    </td>
                    <td className="example-val-cell">{col.example || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Controls */}
        <div className="csv-export-actions">
          <button type="button" className="btn-download-blank" onClick={downloadBlankTemplate}>
            <Download size={15} /> Download Blank CSV Template
          </button>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn-primary" onClick={handleExportData}>
              <Download size={16} /> Export {data.length} Records CSV
            </button>
          </div>
        </div>

      </div>
    </Modal>
  );
}
