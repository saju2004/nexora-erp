import React, { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, RefreshCw, Filter, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';

const AuditLogs = () => {
  const { showToast } = useToast();

  const [logs, setLogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [moduleFilter, setModuleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [usernameSearch, setUsernameSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/audit', {
        params: {
          module: moduleFilter || undefined,
          action: actionFilter || undefined,
          username: usernameSearch || undefined,
          page,
          size: 20,
        },
      });
      if (res.success && res.data) {
        setLogs(res.data.content || []);
        setTotalCount(res.data.totalElements || 0);
      }
    } catch (err) {
      showToast('Failed to load audit logs: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [page, moduleFilter, actionFilter, usernameSearch, showToast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const columns = [
    {
      key: 'timestamp',
      title: 'Audit Timestamp',
      width: '170px',
      sortable: true,
      render: (val) => (val ? new Date(val).toLocaleString() : '—'),
    },
    {
      key: 'username',
      title: 'User Principal',
      width: '130px',
      sortable: true,
      render: (val) => (
        <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{val || 'SYSTEM'}</span>
      ),
    },
    {
      key: 'action',
      title: 'Action Event',
      width: '150px',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'module',
      title: 'Subsystem Module',
      width: '140px',
      sortable: true,
      render: (val) => (
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
          {val}
        </span>
      ),
    },
    {
      key: 'details',
      title: 'Activity Payload Description',
      render: (val, row) => (
        <div>
          <div>{val}</div>
          {row.recordId && (
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              Entity Reference: #{row.recordId}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'ipAddress',
      title: 'Source IP',
      width: '110px',
      render: (val) => (
        <span style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
          {val || '127.0.0.1'}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Security & Compliance Audit Logs</h1>
          <p>Immutable immutable security ledger recording all user actions, data modifications, and approvals.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={fetchLogs}>
            <RefreshCw size={13} /> Refresh Log
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        isLoading={isLoading}
        totalItems={totalCount}
        page={page}
        pageSize={20}
        onPageChange={setPage}
        searchPlaceholder="Filter by username..."
        searchValue={usernameSearch}
        onSearchChange={setUsernameSearch}
        filterOptions={[
          { label: 'SALES', value: 'SALES' },
          { label: 'INVENTORY', value: 'INVENTORY' },
          { label: 'FINANCE', value: 'FINANCE' },
          { label: 'HR', value: 'HR' },
          { label: 'PROJECTS', value: 'PROJECTS' },
          { label: 'SETTINGS', value: 'SETTINGS' },
          { label: 'AUTH', value: 'AUTH' },
        ]}
        filterValue={moduleFilter}
        onFilterChange={setModuleFilter}
        emptyTitle="No audit log entries match"
        emptyDescription="All ERP activities are continuously streamed to the database."
        exportFileName="security-audit-trail"
      />
    </div>
  );
};

export default AuditLogs;
