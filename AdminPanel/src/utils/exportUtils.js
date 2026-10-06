import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Export array of data to Excel (.xlsx) file
 * @param {Array} dataArray - Array of objects to export
 * @param {string} filename - Output file name without extension
 * @param {string} title - Sheet/document title
 * @param {Array} customColumns - Optional list of column specifications [{ key, label }]
 */
export const exportToXLS = (dataArray = [], filename = 'Yeloline_Export', title = 'Export Data', customColumns = null) => {
  if (!dataArray || !dataArray.length) {
    alert('No records available to export.');
    return;
  }

  let formattedData = [];
  if (customColumns && customColumns.length > 0) {
    formattedData = dataArray.map(item => {
      const row = {};
      customColumns.forEach(col => {
        const val = item[col.key];
        row[col.label || col.key] = Array.isArray(val) ? val.join(', ') : (val ?? '');
      });
      return row;
    });
  } else {
    formattedData = dataArray.map(item => {
      const row = {};
      Object.keys(item).forEach(key => {
        if (typeof item[key] !== 'object' && key !== 'id') {
          const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          const val = item[key];
          row[formattedKey] = Array.isArray(val) ? val.join(', ') : (val ?? '');
        }
      });
      return row;
    });
  }

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, title.slice(0, 30));

  // Auto-fit column widths
  if (formattedData.length > 0) {
    const keys = Object.keys(formattedData[0]);
    const maxWidths = keys.map(key => {
      let maxLen = key.length;
      formattedData.forEach(row => {
        const valStr = String(row[key] || '');
        if (valStr.length > maxLen) maxLen = valStr.length;
      });
      return { wch: Math.min(Math.max(maxLen + 3, 12), 45) };
    });
    worksheet['!cols'] = maxWidths;
  }

  const cleanFilename = filename.replace(/[^a-zA-Z0-9_-]/g, '_');
  XLSX.writeFile(workbook, `${cleanFilename}.xlsx`);
};

/**
 * Export array of data to PDF (.pdf) file
 * @param {Array} dataArray - Array of objects to export
 * @param {string} filename - Output file name without extension
 * @param {string} title - Document header title
 * @param {Array} customColumns - Optional list of column specifications [{ key, label }]
 */
export const exportToPDF = (dataArray = [], filename = 'Yeloline_Export', title = 'Export Data', customColumns = null) => {
  if (!dataArray || !dataArray.length) {
    alert('No records available to export.');
    return;
  }

  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

  // Document Title Header
  doc.setFontSize(16);
  doc.setTextColor(24, 43, 73); // Dark Navy Blue (#182b49)
  doc.text(`Yeloline - ${title}`, 40, 40);

  // Generation timestamp
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated on: ${new Date().toLocaleString()} | Total Records: ${dataArray.length}`, 40, 55);

  let headers = [];
  let rows = [];

  if (customColumns && customColumns.length > 0) {
    headers = customColumns.map(col => col.label || col.key);
    rows = dataArray.map(item => customColumns.map(col => {
      const val = item[col.key];
      return Array.isArray(val) ? val.join(', ') : String(val ?? '');
    }));
  } else {
    const keys = Object.keys(dataArray[0]).filter(k => typeof dataArray[0][k] !== 'object' && k !== 'id');
    headers = keys.map(k => k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
    rows = dataArray.map(item => keys.map(k => {
      const val = item[k];
      return Array.isArray(val) ? val.join(', ') : String(val ?? '');
    }));
  }

  autoTable(doc, {
    startY: 68,
    head: [headers],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: [24, 43, 73],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    styles: {
      cellPadding: 6,
      overflow: 'linebreak',
    },
    margin: { top: 68, left: 40, right: 40, bottom: 40 },
  });

  const cleanFilename = filename.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`${cleanFilename}.pdf`);
};
