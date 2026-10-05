import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Check, X, CreditCard } from 'lucide-react';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';

const Expenses = () => {
  const { showToast } = useToast();

  const [expenses, setExpenses] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Cloud & IT Infrastructure',
    amount: '',
    expenseDate: new Date().toISOString().slice(0, 10),
    payee: '',
    paidFrom: 'Main Business Account (ENBD)',
    paymentMethod: 'BANK_TRANSFER',
    description: '',
  });

  const fetchExpenses = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/finance/expenses', {
        params: {
          search: search || undefined,
          status: statusFilter || undefined,
          page,
          size: 15,
        },
      });
      if (res.success && res.data) {
        setExpenses(res.data.content || []);
        setTotalCount(res.data.totalElements || 0);
      }
    } catch (err) {
      showToast('Failed to load expenses: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter, showToast]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/finance/expenses', {
        ...formData,
        amount: Number(formData.amount),
        status: 'APPROVED',
      });
      showToast('Expense recorded successfully', 'success');
      setIsAddOpen(false);
      fetchExpenses();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/finance/expenses/${id}/status`, { status });
      showToast(`Expense ${status.toLowerCase()}`, 'success');
      fetchExpenses();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const columns = [
    {
      key: 'expenseNumber',
      title: 'Expense ID',
      width: '130px',
      sortable: true,
      render: (val) => <span style={{ fontWeight: 600, color: 'var(--color-accent)' }}>{val}</span>,
    },
    {
      key: 'category',
      title: 'Cost Category',
      sortable: true,
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{val}</div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{row.description || 'General expenditure'}</div>
        </div>
      ),
    },
    {
      key: 'payee',
      title: 'Beneficiary / Payee',
      sortable: true,
      render: (val) => val,
    },
    {
      key: 'amount',
      title: 'Amount (AED)',
      sortable: true,
      render: (val) => (
        <span style={{ fontWeight: 600 }}>
          AED {Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'expenseDate',
      title: 'Disbursement Date',
      sortable: true,
      render: (val) => val,
    },
    {
      key: 'paymentMethod',
      title: 'Method',
      render: (val) => val?.replace('_', ' ') || 'BANK TRANSFER',
    },
    {
      key: 'status',
      title: 'Approval',
      width: '110px',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '100px',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '4px' }}>
          {row.status === 'PENDING' && (
            <>
              <button
                className="btn btn-secondary btn-sm"
                style={{ height: '24px', padding: '0 6px', color: 'var(--status-success-text)' }}
                onClick={() => handleStatusChange(row.id, 'APPROVED')}
                title="Approve"
              >
                <Check size={12} />
              </button>
              <button
                className="btn btn-secondary btn-sm"
                style={{ height: '24px', padding: '0 6px', color: 'var(--status-danger-text)' }}
                onClick={() => handleStatusChange(row.id, 'REJECTED')}
                title="Reject"
              >
                <X size={12} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Corporate Operating Expenses</h1>
          <p>Disbursements, vendor invoices, lease obligations, and utility overheads.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm" onClick={() => setIsAddOpen(true)}>
            <Plus size={14} /> Add Expense
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={expenses}
        isLoading={isLoading}
        totalItems={totalCount}
        page={page}
        pageSize={15}
        onPageChange={setPage}
        searchPlaceholder="Search expense #, payee, or description..."
        searchValue={search}
        onSearchChange={setSearch}
        filterOptions={[
          { label: 'Approved', value: 'APPROVED' },
          { label: 'Pending Review', value: 'PENDING' },
          { label: 'Rejected', value: 'REJECTED' },
        ]}
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        emptyTitle="No expenses found"
        emptyDescription="Record your first operating expense voucher."
        onAddRecord={() => setIsAddOpen(true)}
        exportFileName="corporate-expenses"
      />

      {/* Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Record Operating Expense"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleCreate}>
              Submit Expense
            </button>
          </>
        }
      >
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label className="form-label form-label-required">Category</label>
            <select
              className="form-select"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="Cloud & IT Infrastructure">Cloud & IT Infrastructure</option>
              <option value="Facility & Warehouse Lease">Facility & Warehouse Lease</option>
              <option value="Telecommunications & ISP">Telecommunications & ISP</option>
              <option value="Office Supplies & Logistics">Office Supplies & Logistics</option>
              <option value="Staff Training & Professional Fees">Staff Training & Professional Fees</option>
              <option value="Trade License & Government Compliance">Trade License & Government Compliance</option>
            </select>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label form-label-required">Amount (AED)</label>
              <input
                type="number"
                className="form-input"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label form-label-required">Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.expenseDate}
                onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label form-label-required">Payee / Vendor</label>
            <input
              type="text"
              className="form-input"
              value={formData.payee}
              onChange={(e) => setFormData({ ...formData, payee: e.target.value })}
              placeholder="e.g. Amazon Web Services MENA / Etisalat"
              required
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Debit Account</label>
              <select
                className="form-select"
                value={formData.paidFrom}
                onChange={(e) => setFormData({ ...formData, paidFrom: e.target.value })}
              >
                <option value="Main Business Account (ENBD)">Main Business Account (ENBD)</option>
                <option value="Petty Cash Fund">Petty Cash Fund</option>
                <option value="Corporate Visa Card">Corporate Visa Card</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select
                className="form-select"
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              >
                <option value="BANK_TRANSFER">Bank Wire Transfer</option>
                <option value="CREDIT_CARD">Corporate Card</option>
                <option value="CHEQUE">Corporate Cheque</option>
                <option value="CASH">Cash</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes & Justification</label>
            <textarea
              className="form-textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Business rationale..."
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Expenses;
