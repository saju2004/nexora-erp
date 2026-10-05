import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, Check, Plus, Printer } from 'lucide-react';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';

const Payroll = () => {
  const { showToast } = useToast();

  const [payrolls, setPayrolls] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [monthFilter, setMonthFilter] = useState('2026-09');
  const [isLoading, setIsLoading] = useState(true);

  const [employees, setEmployees] = useState([]);
  const [isProcessOpen, setIsProcessOpen] = useState(false);
  const [processForm, setProcessForm] = useState({
    employeeId: '',
    month: '2026-09',
    allowances: '2000',
    deductions: '0',
  });

  const fetchPayroll = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/hr/payroll', {
        params: { month: monthFilter || undefined, page, size: 15 },
      });
      if (res.success && res.data) {
        setPayrolls(res.data.content || []);
        setTotalCount(res.data.totalElements || 0);
      }
    } catch (err) {
      showToast('Failed to load payroll: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [page, monthFilter, showToast]);

  const loadEmployees = async () => {
    try {
      const res = await api.get('/hr/employees/all');
      if (res.success && res.data) {
        setEmployees(res.data);
        if (res.data.length > 0) {
          setProcessForm((prev) => ({ ...prev, employeeId: res.data[0].id }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPayroll();
    loadEmployees();
  }, [fetchPayroll]);

  const handleProcessSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/hr/payroll/process', {
        employeeId: processForm.employeeId,
        month: processForm.month,
        allowances: Number(processForm.allowances),
        deductions: Number(processForm.deductions),
      });

      showToast('Payroll processed and slip generated', 'success');
      setIsProcessOpen(false);
      fetchPayroll();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await api.put(`/hr/payroll/${id}/pay`);
      showToast('Payroll marked as DISBURSED & PAID', 'success');
      fetchPayroll();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const columns = [
    {
      key: 'payrollMonth',
      title: 'Pay Period',
      width: '110px',
      sortable: true,
      render: (val) => <span style={{ fontWeight: 600 }}>{val}</span>,
    },
    {
      key: 'employee',
      title: 'Employee Name',
      sortable: true,
      render: (val) => (
        <div>
          <div style={{ fontWeight: 600 }}>{val?.fullName || `${val?.firstName} ${val?.lastName}`}</div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            {val?.employeeCode} &bull; {val?.department}
          </div>
        </div>
      ),
    },
    {
      key: 'basicSalary',
      title: 'Basic Salary',
      render: (val) => `AED ${Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    },
    {
      key: 'allowances',
      title: 'Allowances (+)',
      render: (val) => `AED ${Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    },
    {
      key: 'deductions',
      title: 'Deductions (-)',
      render: (val) => (
        <span style={{ color: Number(val) > 0 ? 'var(--status-danger-text)' : 'inherit' }}>
          AED {Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'netSalary',
      title: 'Net Disbursed',
      sortable: true,
      render: (val) => (
        <span style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>
          AED {Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'WPS Status',
      width: '110px',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'actions',
      title: 'Action',
      width: '100px',
      render: (_, row) => (
        <div>
          {row.status !== 'PAID' ? (
            <button
              className="btn btn-primary btn-sm"
              style={{ height: '24px', padding: '0 8px' }}
              onClick={() => handleMarkPaid(row.id)}
            >
              <Check size={12} /> Pay Slip
            </button>
          ) : (
            <span style={{ fontSize: '11px', color: 'var(--status-success-text)', fontWeight: 600 }}>
              Paid via WPS
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Payroll & Wages Protection (WPS)</h1>
          <p>Execute monthly remuneration disbursements, allowances, and statutory deductions.</p>
        </div>
        <div className="page-actions">
          <input
            type="month"
            className="form-input"
            style={{ width: '160px', height: '32px' }}
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
          />
          <button className="btn btn-primary btn-sm" onClick={() => setIsProcessOpen(true)}>
            <Plus size={14} /> Process Payroll
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={payrolls}
        isLoading={isLoading}
        totalItems={totalCount}
        page={page}
        pageSize={15}
        onPageChange={setPage}
        emptyTitle="No payroll records for this period"
        emptyDescription="Process compensation for staff using the button above."
        exportFileName="payroll-disbursements"
      />

      {/* Modal */}
      <Modal
        isOpen={isProcessOpen}
        onClose={() => setIsProcessOpen(false)}
        title="Process Monthly Staff Remuneration"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsProcessOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleProcessSubmit}>
              Generate Payroll Slip
            </button>
          </>
        }
      >
        <form onSubmit={handleProcessSubmit}>
          <div className="form-group">
            <label className="form-label form-label-required">Employee</label>
            <select
              className="form-select"
              value={processForm.employeeId}
              onChange={(e) => setProcessForm({ ...processForm, employeeId: e.target.value })}
              required
            >
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.firstName} {e.lastName} ({e.employeeCode}) — Basic: AED {Number(e.basicSalary).toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label form-label-required">Pay Period (Month)</label>
              <input
                type="month"
                className="form-input"
                value={processForm.month}
                onChange={(e) => setProcessForm({ ...processForm, month: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Allowances (AED)</label>
              <input
                type="number"
                className="form-input"
                value={processForm.allowances}
                onChange={(e) => setProcessForm({ ...processForm, allowances: e.target.value })}
                step="100"
                min="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Deductions (AED)</label>
              <input
                type="number"
                className="form-input"
                value={processForm.deductions}
                onChange={(e) => setProcessForm({ ...processForm, deductions: e.target.value })}
                step="50"
                min="0"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Payroll;
