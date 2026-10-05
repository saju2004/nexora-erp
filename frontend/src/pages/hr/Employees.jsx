import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, UserCheck, Mail, Phone, Briefcase } from 'lucide-react';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';

const Employees = () => {
  const { showToast } = useToast();

  const [employees, setEmployees] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: 'IT & Engineering',
    designation: '',
    basicSalary: '15000',
    joiningDate: new Date().toISOString().slice(0, 10),
    employmentType: 'FULL_TIME',
    status: 'ACTIVE',
  });

  const fetchEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/hr/employees', {
        params: {
          search: search || undefined,
          department: departmentFilter || undefined,
          page,
          size: 15,
        },
      });
      if (res.success && res.data) {
        setEmployees(res.data.content || []);
        setTotalCount(res.data.totalElements || 0);
      }
    } catch (err) {
      showToast('Failed to load employees: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, departmentFilter, showToast]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleOpenAdd = () => {
    setEditingEmployee(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: 'IT & Engineering',
      designation: '',
      basicSalary: '15000',
      joiningDate: new Date().toISOString().slice(0, 10),
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setEditingEmployee(emp);
    setFormData({
      firstName: emp.firstName || '',
      lastName: emp.lastName || '',
      email: emp.email || '',
      phone: emp.phone || '',
      department: emp.department || 'IT & Engineering',
      designation: emp.designation || '',
      basicSalary: String(emp.basicSalary || '0'),
      joiningDate: emp.joiningDate || new Date().toISOString().slice(0, 10),
      employmentType: emp.employmentType || 'FULL_TIME',
      status: emp.status || 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        basicSalary: Number(formData.basicSalary),
      };

      if (editingEmployee) {
        await api.put(`/hr/employees/${editingEmployee.id}`, payload);
        showToast('Employee file updated successfully', 'success');
      } else {
        await api.post('/hr/employees', payload);
        showToast('Employee registered into human capital directory', 'success');
      }
      setIsModalOpen(false);
      fetchEmployees();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const columns = [
    {
      key: 'employeeCode',
      title: 'Staff ID',
      width: '110px',
      sortable: true,
      render: (val) => <span style={{ fontWeight: 600, color: 'var(--color-accent)' }}>{val}</span>,
    },
    {
      key: 'fullName',
      title: 'Employee Name',
      sortable: true,
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{`${row.firstName} ${row.lastName}`}</div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{row.email}</div>
        </div>
      ),
    },
    {
      key: 'department',
      title: 'Department',
      sortable: true,
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 500 }}>{val}</div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{row.designation}</div>
        </div>
      ),
    },
    {
      key: 'phone',
      title: 'Phone',
      render: (val) => val || '—',
    },
    {
      key: 'basicSalary',
      title: 'Basic Compensation',
      sortable: true,
      render: (val) => (
        <span style={{ fontWeight: 600 }}>
          AED {Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'joiningDate',
      title: 'Joining Date',
      sortable: true,
      render: (val) => val,
    },
    {
      key: 'status',
      title: 'Status',
      width: '100px',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'actions',
      title: 'Action',
      width: '80px',
      render: (_, row) => (
        <button
          className="btn btn-secondary btn-sm"
          style={{ height: '26px', padding: '0 8px' }}
          onClick={() => handleOpenEdit(row)}
        >
          <Edit2 size={12} /> Edit
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Employee Directory</h1>
          <p>Personnel master files, designations, compensation bands, and department affiliations.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
            <Plus size={14} /> Add Employee
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={employees}
        isLoading={isLoading}
        totalItems={totalCount}
        page={page}
        pageSize={15}
        onPageChange={setPage}
        searchPlaceholder="Search staff by name, code, email..."
        searchValue={search}
        onSearchChange={setSearch}
        filterOptions={[
          { label: 'Executive Management', value: 'Executive' },
          { label: 'Finance & Accounts', value: 'Finance & Accounts' },
          { label: 'Sales & Commercial', value: 'Sales & Commercial' },
          { label: 'Supply Chain', value: 'Supply Chain' },
          { label: 'IT & Engineering', value: 'IT & Engineering' },
          { label: 'Human Resources', value: 'Human Resources' },
        ]}
        filterValue={departmentFilter}
        onFilterChange={setDepartmentFilter}
        emptyTitle="No employees found"
        emptyDescription="Add personnel records to begin tracking attendance and processing payroll."
        onAddRecord={handleOpenAdd}
        exportFileName="employee-roster"
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEmployee ? `Edit Employee Record — ${editingEmployee.employeeCode}` : 'Onboard New Employee'}
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {editingEmployee ? 'Save Changes' : 'Confirm Registration'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label form-label-required">First Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label form-label-required">Last Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label form-label-required">Corporate Email</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@nexora.ae"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Contact</label>
              <input
                type="text"
                className="form-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+971 50 000 0000"
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label form-label-required">Department</label>
              <select
                className="form-select"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                <option value="Executive">Executive Management</option>
                <option value="Finance & Accounts">Finance & Accounts</option>
                <option value="Sales & Commercial">Sales & Commercial</option>
                <option value="Supply Chain">Supply Chain & Logistics</option>
                <option value="IT & Engineering">IT & Engineering</option>
                <option value="Human Resources">Human Resources</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label form-label-required">Job Title / Designation</label>
              <input
                type="text"
                className="form-input"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g. Senior Systems Architect"
                required
              />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label form-label-required">Basic Monthly Salary (AED)</label>
              <input
                type="number"
                className="form-input"
                value={formData.basicSalary}
                onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
                step="500"
                min="1000"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Joining Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.joiningDate}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="ACTIVE">Active Employee</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="TERMINATED">Terminated</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Employees;
