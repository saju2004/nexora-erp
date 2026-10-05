import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Check, X, Calendar } from 'lucide-react';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';

const Leaves = () => {
  const { showToast } = useToast();

  const [leaves, setLeaves] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [employees, setEmployees] = useState([]);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    employeeId: '',
    leaveType: 'ANNUAL',
    startDate: '',
    endDate: '',
    daysCount: 1,
    reason: '',
  });

  const fetchLeaves = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/hr/leaves', {
        params: { status: statusFilter || undefined, page, size: 15 },
      });
      if (res.success && res.data) {
        setLeaves(res.data.content || []);
        setTotalCount(res.data.totalElements || 0);
      }
    } catch (err) {
      showToast('Failed to load leave applications: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, showToast]);

  const loadEmployees = async () => {
    try {
      const res = await api.get('/hr/employees/all');
      if (res.success && res.data) {
        setEmployees(res.data);
        if (res.data.length > 0) {
          setLeaveForm((prev) => ({ ...prev, employeeId: res.data[0].id }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLeaves();
    loadEmployees();
  }, [fetchLeaves]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/hr/leaves', {
        employee: { id: leaveForm.employeeId },
        leaveType: leaveForm.leaveType,
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
        daysCount: Number(leaveForm.daysCount),
        reason: leaveForm.reason,
      });

      showToast('Leave request submitted for managerial review', 'success');
      setIsApplyOpen(false);
      fetchLeaves();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/hr/leaves/${id}/status`, { status });
      showToast(`Leave application ${status.toLowerCase()}`, 'success');
      fetchLeaves();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const columns = [
    {
      key: 'employee',
      title: 'Applicant Employee',
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
      key: 'leaveType',
      title: 'Leave Category',
      sortable: true,
      render: (val) => (
        <span style={{ fontWeight: 500 }}>
          {val === 'ANNUAL' ? 'Annual Leave' : val === 'SICK' ? 'Medical / Sick' : 'Casual Leave'}
        </span>
      ),
    },
    {
      key: 'startDate',
      title: 'Duration',
      render: (_, row) => (
        <div style={{ fontSize: '12px' }}>
          <div>
            {row.startDate} to {row.endDate}
          </div>
          <div style={{ color: 'var(--color-text-muted)' }}>{row.daysCount} working days</div>
        </div>
      ),
    },
    {
      key: 'reason',
      title: 'Reason / Purpose',
      render: (val) => val || '—',
    },
    {
      key: 'status',
      title: 'Review Status',
      width: '120px',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'actions',
      title: 'Managerial Decision',
      width: '130px',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '4px' }}>
          {row.status === 'PENDING' ? (
            <>
              <button
                className="btn btn-secondary btn-sm"
                style={{ height: '24px', padding: '0 6px', color: 'var(--status-success-text)' }}
                onClick={() => handleStatusChange(row.id, 'APPROVED')}
                title="Approve Request"
              >
                <Check size={12} /> Approve
              </button>
              <button
                className="btn btn-secondary btn-sm"
                style={{ height: '24px', padding: '0 6px', color: 'var(--status-danger-text)' }}
                onClick={() => handleStatusChange(row.id, 'REJECTED')}
                title="Reject Request"
              >
                <X size={12} /> Reject
              </button>
            </>
          ) : (
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              Reviewed by {row.approvedBy || 'Admin'}
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
          <h1>Leave & Absence Management</h1>
          <p>Review annual vacation quotas, medical certificates, and supervisor approvals.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm" onClick={() => setIsApplyOpen(true)}>
            <Plus size={14} /> Apply for Leave
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={leaves}
        isLoading={isLoading}
        totalItems={totalCount}
        page={page}
        pageSize={15}
        onPageChange={setPage}
        filterOptions={[
          { label: 'Pending Approval', value: 'PENDING' },
          { label: 'Approved', value: 'APPROVED' },
          { label: 'Rejected', value: 'REJECTED' },
        ]}
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        emptyTitle="No leave applications found"
        emptyDescription="All staff are currently available and on schedule."
        exportFileName="leave-records"
      />

      {/* Modal */}
      <Modal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        title="Submit Employee Leave Request"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsApplyOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleApplySubmit}>
              Submit for Approval
            </button>
          </>
        }
      >
        <form onSubmit={handleApplySubmit}>
          <div className="form-group">
            <label className="form-label form-label-required">Employee</label>
            <select
              className="form-select"
              value={leaveForm.employeeId}
              onChange={(e) => setLeaveForm({ ...leaveForm, employeeId: e.target.value })}
              required
            >
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.firstName} {e.lastName} ({e.employeeCode}) — {e.department}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label form-label-required">Leave Category</label>
            <select
              className="form-select"
              value={leaveForm.leaveType}
              onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
            >
              <option value="ANNUAL">Annual Paid Vacation</option>
              <option value="SICK">Medical / Sick Leave</option>
              <option value="CASUAL">Casual Emergency Absence</option>
              <option value="UNPAID">Unpaid Leave</option>
            </select>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label form-label-required">Start Date</label>
              <input
                type="date"
                className="form-input"
                value={leaveForm.startDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label form-label-required">End Date</label>
              <input
                type="date"
                className="form-input"
                value={leaveForm.endDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label form-label-required">Total Days</label>
              <input
                type="number"
                className="form-input"
                value={leaveForm.daysCount}
                onChange={(e) => setLeaveForm({ ...leaveForm, daysCount: e.target.value })}
                min="1"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label form-label-required">Reason / Justification</label>
            <textarea
              className="form-textarea"
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              placeholder="State purpose of leave request..."
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Leaves;
