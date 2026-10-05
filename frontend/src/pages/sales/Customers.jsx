import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Users, Building, Phone, Mail, MapPin } from 'lucide-react';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';

const Customers = () => {
  const { showToast } = useToast();

  const [customers, setCustomers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    city: 'Dubai',
    country: 'United Arab Emirates',
    address: '',
    taxNumber: '',
    creditLimit: '50000',
    status: 'ACTIVE',
  });

  const fetchCustomers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/customers', {
        params: {
          search: search || undefined,
          status: statusFilter || undefined,
          page,
          size: 15,
        },
      });
      if (res.success && res.data) {
        setCustomers(res.data.content || []);
        setTotalCount(res.data.totalElements || 0);
      }
    } catch (err) {
      showToast('Failed to load customers: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter, showToast]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      companyName: '',
      email: '',
      phone: '',
      city: 'Dubai',
      country: 'United Arab Emirates',
      address: '',
      taxNumber: '',
      creditLimit: '50000',
      status: 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cust) => {
    setEditingCustomer(cust);
    setFormData({
      name: cust.name || '',
      companyName: cust.companyName || '',
      email: cust.email || '',
      phone: cust.phone || '',
      city: cust.city || 'Dubai',
      country: cust.country || 'United Arab Emirates',
      address: cust.address || '',
      taxNumber: cust.taxNumber || '',
      creditLimit: String(cust.creditLimit || '0'),
      status: cust.status || 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer.id}`, formData);
        showToast('Customer profile updated successfully', 'success');
      } else {
        await api.post('/customers', formData);
        showToast('Customer account registered successfully', 'success');
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const columns = [
    {
      key: 'customerCode',
      title: 'Code',
      width: '100px',
      sortable: true,
      render: (val) => <span style={{ fontWeight: 600, color: 'var(--color-accent)' }}>{val}</span>,
    },
    {
      key: 'companyName',
      title: 'Company / Organization',
      sortable: true,
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{val || row.name}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>Contact: {row.name}</div>
        </div>
      ),
    },
    {
      key: 'email',
      title: 'Communication',
      render: (val, row) => (
        <div style={{ fontSize: '12px' }}>
          <div>{val || '—'}</div>
          <div style={{ color: 'var(--color-text-muted)' }}>{row.phone || '—'}</div>
        </div>
      ),
    },
    {
      key: 'city',
      title: 'Location',
      sortable: true,
      render: (val, row) => `${val || 'Dubai'}, ${row.country || 'UAE'}`,
    },
    {
      key: 'currentBalance',
      title: 'Current Balance',
      sortable: true,
      render: (val) => (
        <span style={{ fontWeight: 600, color: Number(val) > 0 ? 'var(--status-danger-text)' : 'inherit' }}>
          AED {Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'creditLimit',
      title: 'Credit Limit',
      render: (val) => `AED ${Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
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
          onClick={() => handleOpenEditModal(row)}
          title="Edit Customer"
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
          <h1>Customer Management</h1>
          <p>Maintain corporate client accounts, credit terms, and billing contacts.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm" onClick={handleOpenAddModal}>
            <Plus size={14} /> Add Customer
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={customers}
        isLoading={isLoading}
        totalItems={totalCount}
        page={page}
        pageSize={15}
        onPageChange={setPage}
        searchPlaceholder="Search by name, company, code..."
        searchValue={search}
        onSearchChange={setSearch}
        filterOptions={[
          { label: 'Active', value: 'ACTIVE' },
          { label: 'Inactive', value: 'INACTIVE' },
          { label: 'On Hold', value: 'ON_HOLD' },
        ]}
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        emptyTitle="No customers found"
        emptyDescription="Start by adding your first enterprise client account."
        onAddRecord={handleOpenAddModal}
        exportFileName="customers-directory"
      />

      {/* Add / Edit Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? `Edit Customer — ${editingCustomer.customerCode}` : 'Register New Enterprise Client'}
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {editingCustomer ? 'Save Changes' : 'Create Account'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label form-label-required">Company Legal Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="e.g. Emirates General Trading LLC"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label form-label-required">Primary Contact Person</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Full Name"
                required
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Corporate Email</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="procurement@company.ae"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+971 4 000 0000"
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Emirate / City</label>
              <select
                className="form-select"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              >
                <option value="Dubai">Dubai</option>
                <option value="Abu Dhabi">Abu Dhabi</option>
                <option value="Sharjah">Sharjah</option>
                <option value="Ajman">Ajman</option>
                <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                <option value="Fujairah">Fujairah</option>
                <option value="Umm Al Quwain">Umm Al Quwain</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">UAE Tax TRN (15 digits)</label>
              <input
                type="text"
                className="form-input"
                value={formData.taxNumber}
                onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                placeholder="100xxxxxxxx0003"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Office / Billing Address</label>
            <input
              type="text"
              className="form-input"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Building, Street, District"
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Credit Limit (AED)</label>
              <input
                type="number"
                className="form-input"
                value={formData.creditLimit}
                onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                min="0"
                step="1000"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Account Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="ON_HOLD">On Hold</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Customers;
