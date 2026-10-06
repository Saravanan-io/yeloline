import React, { useState, useRef } from 'react';
import { Upload, Download, CheckCircle2, AlertCircle, FileSpreadsheet, X, Info } from 'lucide-react';
import Modal from '../Modal/Modal';
import './CSVImportModal.css';

export default function CSVImportModal({
  isOpen,
  onClose,
  title = "Import CSV Data",
  moduleName = "Leads",
  compulsoryColumns = [],
  sampleRow = {},
  onImport
}) {
  const [file, setFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Generate Sample Template CSV
  const downloadSampleTemplate = () => {
    const keys = Object.keys(sampleRow);
    const headers = keys.join(',');
    const sampleValues = keys.map(k => `"${(''+(sampleRow[k] ?? '')).replace(/"/g, '""')}"`).join(',');
    const csvContent = `${headers}\n${sampleValues}`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Yeloline_${moduleName.replace(/\s+/g, '_')}_Template.csv`;
    a.click();
  };

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.name.endsWith('.csv')) {
      alert('Please upload a valid .csv file format');
      return;
    }
    setFile(selectedFile);
    parseCSV(selectedFile);
  };

  const parseCSV = (csvFile) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
      if (lines.length < 2) {
        setValidationErrors(['CSV file must contain a header row and at least 1 data row.']);
        setParsedRows([]);
        return;
      }

      // Helper to parse CSV row accounting for quotes
      const parseRow = (str) => {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < str.length; i++) {
          const char = str[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim().replace(/^"|"$/g, ''));
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.trim().replace(/^"|"$/g, ''));
        return result;
      };

      const headers = parseRow(lines[0]);
      
      // Check for missing compulsory columns
      const missingCompulsory = compulsoryColumns.filter(
        col => !headers.map(h => h.toLowerCase()).includes(col.key.toLowerCase())
      );

      const errors = [];
      if (missingCompulsory.length > 0) {
        errors.push(`Missing mandatory column headers: ${missingCompulsory.map(c => c.key).join(', ')}`);
      }

      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const values = parseRow(lines[i]);
        if (values.length === headers.length || values.length > 1) {
          const rowObj = {};
          headers.forEach((h, idx) => {
            rowObj[h] = values[idx] || '';
          });
          rows.push(rowObj);
        }
      }

      setValidationErrors(errors);
      setParsedRows(rows);
    };
    reader.readAsText(csvFile);
  };

  const handleConfirmImport = () => {
    if (parsedRows.length > 0 && validationErrors.length === 0) {
      onImport(parsedRows);
      handleReset();
      onClose();
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedRows([]);
    setValidationErrors([]);
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { handleReset(); onClose(); }} title={title} maxWidth="780px">
      <div className="csv-import-modal-body">
        
        {/* Specification Info Box */}
        <div className="spec-info-card">
          <div className="spec-info-header">
            <div className="spec-info-title">
              <Info size={18} className="spec-icon" />
              <span>Required CSV Structure & Compulsory Attributes</span>
            </div>
            <button type="button" className="btn-download-template" onClick={downloadSampleTemplate}>
              <Download size={14} /> Download Sample Template CSV
            </button>
          </div>
          <div className="spec-attributes-grid">
            {compulsoryColumns.map((col) => (
              <div key={col.key} className="spec-attr-pill">
                <span className="attr-name">{col.label || col.key}</span>
                <span className={`attr-req ${col.required ? 'required' : 'optional'}`}>
                  {col.required ? 'Compulsory' : 'Optional'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* File Drag & Drop Zone */}
        {!file ? (
          <div
            className={`csv-drop-zone ${isDragOver ? 'drag-over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileSelect(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              style={{ display: 'none' }}
              onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
            />
            <div className="drop-zone-content">
              <FileSpreadsheet size={40} className="drop-zone-icon" />
              <div className="drop-zone-title">Click or Drag & Drop `.csv` file here</div>
              <div className="drop-zone-subtitle">Supports UTF-8 formatted CSV spreadsheets</div>
            </div>
          </div>
        ) : (
          <div className="csv-file-loaded-bar">
            <div className="loaded-file-info">
              <FileSpreadsheet size={20} className="loaded-file-icon" />
              <div>
                <strong className="loaded-file-name">{file.name}</strong>
                <div className="loaded-file-size">{(file.size / 1024).toFixed(1)} KB — {parsedRows.length} Data Rows Detected</div>
              </div>
            </div>
            <button type="button" className="btn-remove-file" onClick={handleReset}>
              <X size={16} /> Remove File
            </button>
          </div>
        )}

        {/* Validation Errors Alert */}
        {validationErrors.length > 0 && (
          <div className="csv-error-alert">
            <AlertCircle size={20} className="alert-error-icon" />
            <div>
              <strong>CSV Validation Failed:</strong>
              <ul>
                {validationErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Data Rows Preview Table */}
        {parsedRows.length > 0 && validationErrors.length === 0 && (
          <div className="csv-preview-container">
            <div className="csv-preview-header">
              <span>Preview Parsed Rows ({parsedRows.length} Rows Ready to Import)</span>
              <span className="badge-valid"><CheckCircle2 size={14} /> Structure Validated</span>
            </div>
            <div className="csv-preview-table-wrapper">
              <table className="csv-preview-table">
                <thead>
                  <tr>
                    {Object.keys(parsedRows[0]).map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.slice(0, 5).map((row, rIdx) => (
                    <tr key={rIdx}>
                      {Object.keys(row).map((k, cIdx) => (
                        <td key={cIdx}>{row[k]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedRows.length > 5 && (
                <div className="preview-more-count">+ {parsedRows.length - 5} more rows will be imported</div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="csv-modal-actions">
          <button type="button" className="btn-secondary" onClick={() => { handleReset(); onClose(); }}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={!file || parsedRows.length === 0 || validationErrors.length > 0}
            onClick={handleConfirmImport}
          >
            <Upload size={16} /> Confirm & Import {parsedRows.length} Records
          </button>
        </div>

      </div>
    </Modal>
  );
}
