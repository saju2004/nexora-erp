import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, TrendingUp, CreditCard, ArrowDownRight, Plus, PieChart } from 'lucide-react';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';

const FinanceOverview = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // New Expense Modal State
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: 'Cloud & IT Infrastructure',
    amount: '',
    expenseDate: new Date().toISOString().slice(0, 10),
    payee: '',
    paidFrom: 'Main Business Account (ENBD)',
    paymentMethod: 'BANK_TRANSFER',
    description: '',
  });

  const fetchSummary = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/finance/summary');
      if (res.success && res.data) {
        setSummary(res.data);
      }
    } catch (err) {
      showToast('Failed to load financial overview: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    try {
      await api.post('/finance/expenses', {
        ...expenseForm,
        amount: Number(expenseForm.amount),
        status: 'APPROVED',
      });
      showToast('Corporate expense recorded and approved', 'success');
      setIsAddExpenseOpen(false);
      fetchSummary();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const formatAED = (val) => {
    return `AED ${Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Financial Management & Overview</h1>
          <p>Real-time corporate ledger, profit & loss statement, and expense disbursements.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/finance/expenses')}>
            All Expenses
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setIsAddExpenseOpen(true)}>
            <Plus size={14} /> Record Expense
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <StatCard
          title="Gross Billed Revenue"
          value={formatAED(summary?.totalRevenue)}
          change="+12.4%"
          isPositive={true}
          icon={DollarSign}
        />
        <StatCard
          title="Cash Collected"
          value={formatAED(summary?.totalPaymentsReceived)}
          change="+18.5%"
          isPositive={true}
          icon={TrendingUp}
        />
        <StatCard
          title="Total Operating Expenses"
          value={formatAED(summary?.totalExpenses)}
          change="-3.2%"
          isPositive={true}
          icon={CreditCard}
        />
        <StatCard
          title="Net Operating Income"
          value={formatAED(summary?.netIncome)}
          change="+14.2%"
          isPositive={true}
          icon={TrendingUp}
        />
      </div>

      {/* Main Split: Expense Breakdown & Invoicing Aging */}
      <div className="charts-grid-2">
        {/* Category Expense Breakdown Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Corporate Operating Expenses by Category</div>
              <div className="card-subtitle">Approved general disbursements</div>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/finance/expenses')}
            >
              Manage Expenses
            </button>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Expense Category</th>
                  <th>Total Disbursed (AED)</th>
                  <th>Share of Operating Budget</th>
                </tr>
              </thead>
              <tbody>
                {summary?.expenseCategories && summary.expenseCategories.length > 0 ? (
                  summary.expenseCategories.map(([cat, total], idx) => {
                    const percent =
                      summary.totalExpenses > 0
                        ? Math.round((Number(total) / Number(summary.totalExpenses)) * 100)
                        : 0;
                    return (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{cat}</td>
                        <td style={{ fontWeight: 600 }}>{formatAED(total)}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div
                              style={{
                                flex: 1,
                                height: '6px',
                                backgroundColor: 'var(--color-bg-subtle)',
                                borderRadius: '3px',
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                style={{
                                  width: `${percent}%`,
                                  height: '100%',
                                  backgroundColor: 'var(--color-accent)',
                                }}
                              />
                            </div>
                            <span style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', width: '32px' }}>
                              {percent}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>
                      No expenses recorded for current cycle
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoice Collections Status */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Accounts Receivable & Aging</div>
              <div className="card-subtitle">Uncollected corporate invoices</div>
            </div>
          </div>
          <div style={{ padding: '16px' }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Total Outstanding Receivables:
              </div>
              <div
                style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  color: 'var(--status-danger-text)',
                  marginTop: '4px',
                }}
              >
                {formatAED(summary?.totalOutstanding)}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {summary?.invoiceBreakdown?.map(([status, count, sum], idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    backgroundColor: 'var(--color-bg-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12.5px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <StatusBadge status={status} />
                    <span>{count} invoices</span>
                  </div>
                  <span style={{ fontWeight: 600 }}>{formatAED(sum)}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '20px' }}>
              <button
                className="btn btn-secondary btn-sm"
                style={{ width: '100%' }}
                onClick={() => navigate('/sales/invoices')}
              >
                Go to Invoices & Collections
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Record Expense Modal */}
      <Modal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        title="Record Corporate Operating Expense"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsAddExpenseOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleCreateExpense}>
              Record & Disburse
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateExpense}>
          <div className="form-group">
            <label className="form-label form-label-required">Expense Category</label>
            <select
              className="form-select"
              value={expenseForm.category}
              onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
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
              <label className="form-label form-label-required">Disbursement Amount (AED)</label>
              <input
                type="number"
                className="form-input"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label form-label-required">Expense Date</label>
              <input
                type="date"
                className="form-input"
                value={expenseForm.expenseDate}
                onChange={(e) => setExpenseForm({ ...expenseForm, expenseDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label form-label-required">Payee / Vendor</label>
            <input
              type="text"
              className="form-input"
              value={expenseForm.payee}
              onChange={(e) => setExpenseForm({ ...expenseForm, payee: e.target.value })}
              placeholder="e.g. Amazon Web Services MENA / Etisalat"
              required
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Debit Account</label>
              <select
                className="form-select"
                value={expenseForm.paidFrom}
                onChange={(e) => setExpenseForm({ ...expenseForm, paidFrom: e.target.value })}
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
                value={expenseForm.paymentMethod}
                onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}
              >
                <option value="BANK_TRANSFER">Bank Wire Transfer</option>
                <option value="CREDIT_CARD">Corporate Card</option>
                <option value="CHEQUE">Corporate Cheque</option>
                <option value="CASH">Cash</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Business Justification / Description</label>
            <textarea
              className="form-textarea"
              value={expenseForm.description}
              onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
              placeholder="Provide reason for corporate disbursement..."
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FinanceOverview;
