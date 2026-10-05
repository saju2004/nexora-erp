import React, { useState, useEffect, useCallback } from 'react';
import { Layers, ArrowDownLeft, ArrowUpRight, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';

const StockMovements = () => {
  const { showToast } = useToast();

  const [movements, setMovements] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMovements = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/products/movements', {
        params: { page, size: 20 },
      });
      if (res.success && res.data) {
        setMovements(res.data.content || []);
        setTotalCount(res.data.totalElements || 0);
      }
    } catch (err) {
      showToast('Failed to load stock movements: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [page, showToast]);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  const columns = [
    {
      key: 'createdAt',
      title: 'Timestamp',
      width: '160px',
      sortable: true,
      render: (val) => (val ? new Date(val).toLocaleString() : '—'),
    },
    {
      key: 'product',
      title: 'Product / SKU',
      render: (val) => (
        <div>
          <div style={{ fontWeight: 600 }}>{val?.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{val?.sku}</div>
        </div>
      ),
    },
    {
      key: 'movementType',
      title: 'Type',
      width: '120px',
      render: (val) => {
        let color = '#2563eb';
        if (val === 'IN') color = 'var(--status-success-text)';
        if (val === 'OUT') color = 'var(--status-danger-text)';
        return (
          <span style={{ fontWeight: 600, color, display: 'flex', alignItems: 'center', gap: '4px' }}>
            {val === 'IN' ? <ArrowDownLeft size={13} /> : <ArrowUpRight size={13} />}
            {val}
          </span>
        );
      },
    },
    {
      key: 'quantity',
      title: 'Change Qty',
      width: '110px',
      render: (val, row) => (
        <span style={{ fontWeight: 700 }}>
          {row.movementType === 'OUT' ? `-${val}` : `+${val}`}
        </span>
      ),
    },
    {
      key: 'quantityBefore',
      title: 'Before',
      width: '90px',
      render: (val) => val ?? '—',
    },
    {
      key: 'quantityAfter',
      title: 'After',
      width: '90px',
      render: (val) => <span style={{ fontWeight: 600 }}>{val ?? '—'}</span>,
    },
    {
      key: 'referenceNumber',
      title: 'Reference / Source',
      render: (val) => (
        <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{val || '—'}</span>
      ),
    },
    {
      key: 'performedBy',
      title: 'Authorized By',
      render: (val) => val || 'SYSTEM',
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Stock Movements Audit</h1>
          <p>Real-time audit log of all inventory inward intakes, sales order dispatches, and adjustments.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={fetchMovements}>
            <RefreshCw size={13} /> Refresh Log
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={movements}
        isLoading={isLoading}
        totalItems={totalCount}
        page={page}
        pageSize={20}
        onPageChange={setPage}
        emptyTitle="No stock movements recorded"
        emptyDescription="Inventory stock transactions will be recorded here automatically."
        exportFileName="stock-movements-audit"
      />
    </div>
  );
};

export default StockMovements;
