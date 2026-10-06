import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import './DataTable.css';

export default function DataTable({ columns, data, searchPlaceholder, actions, pageSize = 8, onRowClick, showSearch = true }) {
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    if (!showSearch || !query.trim()) return data || [];
    const q = query.toLowerCase();
    return (data || []).filter(item => {
      return Object.values(item).some(val => {
        if (val === null || val === undefined) return false;
        if (typeof val === 'object') return false;
        return String(val).toLowerCase().includes(q);
      });
    });
  }, [data, query, showSearch]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  return (
    <div className="datatable-wrapper">
      {(showSearch || actions) && (
        <div className="datatable-header">
          {showSearch && (
            <div className="datatable-search">
              <Search size={16} className="datatable-search-icon" />
              <input
                type="text"
                className="datatable-search-input"
                placeholder={searchPlaceholder || "Search table..."}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          )}
          {actions && <div className="datatable-actions">{actions}</div>}
        </div>
      )}

      <div className="datatable-container">
        <table className="datatable">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={col.key || idx} style={col.width ? { width: col.width } : {}}>
                  {col.header || col.label || col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={row.id || row.enquiry_id || row.project_id || row.expense_id || row.purchase_id || row.payment_id || row.appointment_id || rowIndex}
                  onClick={(e) => {
                    if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || e.target.closest('select')) return;
                    if (onRowClick) onRowClick(row);
                  }}
                  style={onRowClick ? { cursor: 'pointer' } : {}}
                >
                  {columns.map((col, colIndex) => (
                    <td key={col.key || colIndex}>
                      {col.render ? col.render(row, rowIndex) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length}>
                  <div className="datatable-empty">
                    <Inbox size={32} />
                    <span>No matching records found</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="datatable-footer">
        <span>
          Showing {filteredData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
        </span>
        <div className="datatable-pagination">
          <button
            className="datatable-page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            <ChevronLeft size={16} />
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            className="datatable-page-btn"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
