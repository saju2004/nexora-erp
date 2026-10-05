import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Search,
  Download,
  Filter,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import EmptyState from './EmptyState';
import { TableSkeleton } from './SkeletonLoader';

const DataTable = ({
  columns,
  data = [],
  isLoading = false,
  totalItems,
  page = 0,
  pageSize = 15,
  onPageChange,
  onPageSizeChange,
  searchPlaceholder = 'Search records...',
  searchValue,
  onSearchChange,
  filterOptions = [],
  filterValue,
  onFilterChange,
  selectable = true,
  onSelectionChange,
  emptyTitle,
  emptyDescription,
  onAddRecord,
  exportFileName = 'export-data',
}) => {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Sorting
  const handleSort = (colKey) => {
    if (sortColumn === colKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(colKey);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortColumn) return data;
    return [...data].sort((a, b) => {
      let valA = a[sortColumn];
      let valB = b[sortColumn];

      if (valA == null) return 1;
      if (valB == null) return -1;

      if (typeof valA === 'string') {
        const comp = valA.localeCompare(valB);
        return sortDirection === 'asc' ? comp : -comp;
      }
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    });
  }, [data, sortColumn, sortDirection]);

  // Selection
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = new Set(data.map((row) => row.id));
      setSelectedIds(allIds);
      if (onSelectionChange) onSelectionChange(Array.from(allIds));
    } else {
      setSelectedIds(new Set());
      if (onSelectionChange) onSelectionChange([]);
    }
  };

  const handleSelectRow = (id) => {
    const updated = new Set(selectedIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedIds(updated);
    if (onSelectionChange) onSelectionChange(Array.from(updated));
  };

  // CSV Export
  const handleExportCSV = () => {
    if (!data || data.length === 0) return;
    const exportCols = columns.filter((c) => c.key !== 'actions');
    const headers = exportCols.map((c) => `"${c.title}"`).join(',');
    const rows = sortedData.map((row) =>
      exportCols
        .map((c) => {
          let val = row[c.key];
          if (val === null || val === undefined) val = '';
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${exportFileName}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = Math.ceil((totalItems || data.length) / pageSize);

  return (
    <div className="table-container">
      {/* Table Toolbar */}
      <div className="table-toolbar">
        <div className="table-toolbar-left">
          {onSearchChange && (
            <div style={{ position: 'relative' }}>
              <Search
                size={14}
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                }}
              />
              <input
                type="text"
                className="table-search-input"
                placeholder={searchPlaceholder}
                value={searchValue || ''}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          )}

          {filterOptions.length > 0 && onFilterChange && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={13} color="var(--color-text-muted)" />
              <select
                className="table-filter-select"
                value={filterValue || ''}
                onChange={(e) => onFilterChange(e.target.value)}
              >
                <option value="">All Statuses / Categories</option>
                {filterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="table-toolbar-right">
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleExportCSV}
            title="Export CSV"
          >
            <Download size={13} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="table-wrapper">
        {isLoading ? (
          <TableSkeleton cols={columns.length + (selectable ? 1 : 0)} rows={pageSize > 10 ? 8 : 5} />
        ) : sortedData.length === 0 ? (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            actionLabel={onAddRecord ? 'Add Record' : null}
            onAction={onAddRecord}
          />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                {selectable && (
                  <th style={{ width: '38px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={data.length > 0 && selectedIds.size === data.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                )}
                {columns.map((col) => (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    className={col.sortable ? 'sortable' : ''}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {col.title}
                      {col.sortable && sortColumn === col.key && (
                        <span>
                          {sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, rIdx) => {
                const isSelected = selectedIds.has(row.id);
                return (
                  <tr
                    key={row.id || rIdx}
                    style={{ backgroundColor: isSelected ? 'var(--color-bg-subtle)' : undefined }}
                  >
                    {selectable && (
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(row.id)}
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key}>
                        {col.render ? col.render(row[col.key], row) : row[col.key] || '—'}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Table Pagination */}
      {!isLoading && sortedData.length > 0 && (
        <div className="table-pagination">
          <div>
            Showing{' '}
            <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>
              {page * pageSize + 1}
            </span>{' '}
            to{' '}
            <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>
              {Math.min((page + 1) * pageSize, totalItems || sortedData.length)}
            </span>{' '}
            of{' '}
            <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>
              {totalItems || sortedData.length}
            </span>{' '}
            records
          </div>

          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => onPageChange && onPageChange(page - 1)}
              disabled={page === 0}
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
            </button>
            <span style={{ fontSize: '12px', padding: '0 6px' }}>
              Page {page + 1} of {Math.max(1, totalPages)}
            </span>
            <button
              className="pagination-btn"
              onClick={() => onPageChange && onPageChange(page + 1)}
              disabled={page >= totalPages - 1}
              aria-label="Next page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
