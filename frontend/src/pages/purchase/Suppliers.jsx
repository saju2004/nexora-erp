import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Truck, Mail, Phone, MapPin } from 'lucide-react';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';

const Suppliers = () => {
  const { showToast } = useToast();

  const [suppliers, setSuppliers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    city: 'Dubai',
    country: 'United Arab Emirates',
    address: '',
    taxNumber: '',
    paymentTerms: 'Net 30',
    status: 'ACTIVE',
  });

  const fetchSuppliers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/suppliers', {
        params: {
          search: search || undefined,
          page,
          size: 15,
        },
      });
      if (res.success && res.data) {
        setSuppliers(res.data.content || []);
        setTotalCount(res.data.totalElements || 0);
      }
    } catch (err) {
      showToast('Failed to load suppliers: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, showToast]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      city: 'Dubai',
      country: 'United Arab Emirates',
      address: '',
      taxNumber: '',
      paymentTerms: 'Net 30',
      status: 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sup) => {
    setEditingSupplier(sup);
    setFormData({
      name: sup.name || '',
      contactPerson: sup.contactPerson || '',
      email: sup.email || '',
      phone: sup.phone || '',
      city: sup.city || 'Dubai',
      country: sup.country || 'United Arab Emirates',
      address: sup.address || '',
      taxNumber: sup.taxNumber || '',
      paymentTerms: sup.paymentTerms || 'Net 30',
      status: sup.status || 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await api.put(`/suppliers/${editingSupplier.id}`, formData);
        showToast('Supplier profile updated', 'success');
      } else {
        await api.post('/suppliers', formData);
        showToast('Vendor supplier added successfully', 'success');
      }
      setIsModalOpen(false);
      fetchSuppliers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const columns = [
    {
      key: 'supplierCode',
      title: 'Vendor Code',
      width: '120px',
      sortable: true,
      render: (val) => <span style={{ fontWeight: 600, color: 'var(--color-accent)' }}>{val}</span>,
    },
    {
      key: 'name',
      title: 'Supplier Entity',
      sortable: true,
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{val}</div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            Representative: {row.contactPerson || '—'}
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      title: 'Contact Details',
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
      key: 'taxNumber',
      title: 'Tax TRN',
      render: (val) => val || '—',
    },
    {
      key: 'paymentTerms',
      title: 'Payment Terms',
      render: (val) => (
        <span style={{ fontSize: '12px', fontWeight: 500 }}>{val || 'Net 30'}</span>
      ),
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
          <h1>Vendor & Supplier Management</h1>
          <p>Maintain procurement sources, terms of trade, and supplier tax documentation.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
            <Plus size={14} /> Add Supplier
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={suppliers}
        isLoading={isLoading}
        totalItems={totalCount}
        page={page}
        pageSize={15}
        onPageChange={setPage}
        searchPlaceholder="Search supplier name, code, contact..."
        searchValue={search}
        onSearchChange={setSearch}
        emptyTitle="No suppliers found"
        emptyDescription="Add procurement vendors and distributors to manage purchase orders."
        onAddRecord={handleOpenAdd}
        exportFileName="suppliers-directory"
      />

      {/* Add / Edit Supplier Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupplier ? `Edit Supplier — ${editingSupplier.supplierCode}` : 'Register New Vendor / Supplier'}
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {editingSupplier ? 'Save Changes' : 'Create Supplier'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label form-label-required">Supplier Business Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Gulf Star Trading LLC"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label form-label-required">Account Manager / Contact Person</label>
              <input
                type="text"
                className="form-input"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="Representative Name"
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
                placeholder="b2b@supplier.ae"
                required
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
              <input
                type="text"
                className="form-input"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Dubai"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Federal Tax TRN</label>
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
            <label className="form-label">Warehouse / Office Physical Address</label>
            <input
              type="text"
              className="form-input"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="District, Building, Logistics Zone"
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Payment Terms</label>
              <select
                className="form-select"
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
              >
                <option value="Net 15">Net 15 Days</option>
                <option value="Net 30">Net 30 Days</option>
                <option value="Net 45">Net 45 Days</option>
                <option value="Net 60">Net 60 Days</option>
                <option value="Advance Payment">100% Advance Payment</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Vendor Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="ACTIVE">Active Supplier</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Suppliers;
