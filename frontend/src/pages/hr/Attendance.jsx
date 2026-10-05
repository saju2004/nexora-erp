import React, { useState, useEffect, useCallback } from 'react';
import { CalendarCheck, Plus, Clock } from 'lucide-react';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';

const Attendance = () => {
  const { showToast } = useToast();

  const [attendance, setAttendance] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().slice(0, 10));
  const [isLoading, setIsLoading] = useState(true);

  // Aux staff
  const [employees, setEmployees] = useState([]);

  // Modal State
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [recordForm, setRecordForm] = useState({
    employeeId: '',
    attendanceDate: new Date().toISOString().slice(0, 10),
    checkInTime: '08:45',
    checkOutTime: '17:30',
    status: 'PRESENT',
    notes: 'Normal working day shift',
  });

  const fetchAttendance = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/hr/attendance', {
        params: {
          date: dateFilter || undefined,
          page,
          size: 20,
        },
      });
      if (res.success && res.data) {
        setAttendance(res.data.content || []);
        setTotalCount(res.data.totalElements || 0);
      }
    } catch (err) {
      showToast('Failed to load attendance logs: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [page, dateFilter, showToast]);

  const loadEmployees = async () => {
    try {
      const res = await api.get('/hr/employees/all');
      if (res.success && res.data) {
        setEmployees(res.data);
        if (res.data.length > 0) {
          setRecordForm((prev) => ({ ...prev, employeeId: res.data[0].id }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAttendance();
    loadEmployees();
  }, [fetchAttendance]);

  const handleRecordSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/hr/attendance', {
        employee: { id: recordForm.employeeId },
        attendanceDate: recordForm.attendanceDate,
        checkInTime: recordForm.checkInTime ? `${recordForm.checkInTime}:00` : null,
        checkOutTime: recordForm.checkOutTime ? `${recordForm.checkOutTime}:00` : null,
        status: recordForm.status,
        notes: recordForm.notes,
      });

      showToast('Daily attendance entry registered', 'success');
      setIsRecordOpen(false);
      fetchAttendance();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const columns = [
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
      key: 'attendanceDate',
      title: 'Date',
      sortable: true,
      render: (val) => val,
    },
    {
      key: 'checkInTime',
      title: 'Check In',
      render: (val) => val || '—',
    },
    {
      key: 'checkOutTime',
      title: 'Check Out',
      render: (val) => val || '—',
    },
    {
      key: 'status',
      title: 'Punctuality Status',
      width: '120px',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'notes',
      title: 'Remarks',
      render: (val) => <span style={{ color: 'var(--color-text-muted)' }}>{val || '—'}</span>,
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Biometric & Daily Attendance</h1>
          <p>Real-time terminal punch tracking, late check-ins, and shift records.</p>
        </div>
        <div className="page-actions">
          <input
            type="date"
            className="form-input"
            style={{ width: '160px', height: '32px' }}
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          <button className="btn btn-primary btn-sm" onClick={() => setIsRecordOpen(true)}>
            <Plus size={14} /> Log Attendance
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={attendance}
        isLoading={isLoading}
        totalItems={totalCount}
        page={page}
        pageSize={20}
        onPageChange={setPage}
        emptyTitle="No attendance records found"
        emptyDescription="Select another date or log attendance for the staff roster."
        exportFileName="attendance-records"
      />

      {/* Modal */}
      <Modal
        isOpen={isRecordOpen}
        onClose={() => setIsRecordOpen(false)}
        title="Record Daily Attendance Entry"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsRecordOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleRecordSubmit}>
              Save Punch Record
            </button>
          </>
        }
      >
        <form onSubmit={handleRecordSubmit}>
          <div className="form-group">
            <label className="form-label form-label-required">Employee</label>
            <select
              className="form-select"
              value={recordForm.employeeId}
              onChange={(e) => setRecordForm({ ...recordForm, employeeId: e.target.value })}
              required
            >
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.firstName} {e.lastName} ({e.employeeCode}) — {e.department}
                </option>
              ))}
            </select>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label form-label-required">Date</label>
              <input
                type="date"
                className="form-input"
                value={recordForm.attendanceDate}
                onChange={(e) => setRecordForm({ ...recordForm, attendanceDate: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Check In Time</label>
              <input
                type="time"
                className="form-input"
                value={recordForm.checkInTime}
                onChange={(e) => setRecordForm({ ...recordForm, checkInTime: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Check Out Time</label>
              <input
                type="time"
                className="form-input"
                value={recordForm.checkOutTime}
                onChange={(e) => setRecordForm({ ...recordForm, checkOutTime: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label form-label-required">Attendance Status</label>
            <select
              className="form-select"
              value={recordForm.status}
              onChange={(e) => setRecordForm({ ...recordForm, status: e.target.value })}
            >
              <option value="PRESENT">Present (On-Time)</option>
              <option value="LATE">Late Arrival</option>
              <option value="HALF_DAY">Half-Day Shift</option>
              <option value="ABSENT">Absent (Unexcused)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <input
              type="text"
              className="form-input"
              value={recordForm.notes}
              onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Attendance;
