import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, SlidersHorizontal, AlertTriangle, Layers, Trash2 } from 'lucide-react';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';

const Products = () => {
  const { showToast } = useToast();

  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Aux state
  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  // Modals
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [adjustProduct, setAdjustProduct] = useState(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('Stock count discrepancy correction');

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    categoryId: '',
    warehouseId: '',
    supplierId: '',
    costPrice: '0',
    sellingPrice: '0',
    stockQuantity: '0',
    reorderLevel: '10',
    unit: 'UNIT',
    description: '',
  });

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/products', {
        params: {
          search: search || undefined,
          categoryId: categoryFilter || undefined,
          status: statusFilter || undefined,
          page,
          size: 15,
        },
      });
      if (res.success && res.data) {
        setProducts(res.data.content || []);
        setTotalCount(res.data.totalElements || 0);
      }
    } catch (err) {
      showToast('Failed to load products: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, categoryFilter, statusFilter, showToast]);

  const loadAuxData = async () => {
    try {
      const [cRes, wRes, sRes] = await Promise.all([
        api.get('/products/categories'),
        api.get('/products/warehouses'),
        api.get('/suppliers/all'),
      ]);
      if (cRes.success) setCategories(cRes.data || []);
      if (wRes.success) setWarehouses(wRes.data || []);
      if (sRes.success) setSuppliers(sRes.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProducts();
    loadAuxData();
  }, [fetchProducts]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: 'SKU-' + Math.floor(1000 + Math.random() * 9000),
      barcode: '',
      categoryId: categories[0]?.id || '',
      warehouseId: warehouses[0]?.id || '',
      supplierId: suppliers[0]?.id || '',
      costPrice: '100',
      sellingPrice: '150',
      stockQuantity: '20',
      reorderLevel: '5',
      unit: 'UNIT',
      description: '',
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEditModal = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name || '',
      sku: p.sku || '',
      barcode: p.barcode || '',
      categoryId: p.category?.id || '',
      warehouseId: p.warehouse?.id || '',
      supplierId: p.supplier?.id || '',
      costPrice: String(p.costPrice || '0'),
      sellingPrice: String(p.sellingPrice || '0'),
      stockQuantity: String(p.stockQuantity || '0'),
      reorderLevel: String(p.reorderLevel || '10'),
      unit: p.unit || 'UNIT',
      description: p.description || '',
    });
    setIsAddEditOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        sku: formData.sku,
        barcode: formData.barcode,
        costPrice: Number(formData.costPrice),
        sellingPrice: Number(formData.sellingPrice),
        stockQuantity: Number(formData.stockQuantity),
        reorderLevel: Number(formData.reorderLevel),
        unit: formData.unit,
        description: formData.description,
        category: formData.categoryId ? { id: formData.categoryId } : null,
        warehouse: formData.warehouseId ? { id: formData.warehouseId } : null,
        supplier: formData.supplierId ? { id: formData.supplierId } : null,
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
        showToast('Product updated successfully', 'success');
      } else {
        await api.post('/products', payload);
        showToast('Product registered in inventory', 'success');
      }
      setIsAddEditOpen(false);
      fetchProducts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleOpenAdjustStock = (p) => {
    setAdjustProduct(p);
    setAdjustQty('');
    setAdjustReason('Stock count verification');
    setIsAdjustOpen(true);
  };

  const handleSaveAdjustment = async (e) => {
    e.preventDefault();
    if (!adjustProduct) return;
    const qtyChange = Number(adjustQty);
    if (isNaN(qtyChange) || qtyChange === 0) {
      showToast('Please specify a positive or negative quantity adjustment', 'error');
      return;
    }

    try {
      await api.post('/products/adjust-stock', {
        productId: adjustProduct.id,
        quantity: qtyChange,
        adjustmentType: qtyChange > 0 ? 'IN' : 'OUT',
        reason: adjustReason,
        referenceNumber: 'ADJ-' + Date.now().toString().slice(-6),
      });

      showToast(`Stock updated by ${qtyChange > 0 ? '+' : ''}${qtyChange} units`, 'success');
      setIsAdjustOpen(false);
      fetchProducts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const columns = [
    {
      key: 'sku',
      title: 'SKU',
      width: '130px',
      sortable: true,
      render: (val) => <span style={{ fontWeight: 600, color: 'var(--color-accent)' }}>{val}</span>,
    },
    {
      key: 'name',
      title: 'Product Title',
      sortable: true,
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{val}</div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            {row.category?.name || 'Uncategorized'} &bull; {row.warehouse?.name || 'Dubai Central'}
          </div>
        </div>
      ),
    },
    {
      key: 'stockQuantity',
      title: 'Available Stock',
      sortable: true,
      render: (val, row) => (
        <div>
          <span
            style={{
              fontWeight: 700,
              color: val <= row.reorderLevel ? 'var(--status-danger-text)' : 'inherit',
            }}
          >
            {val} {row.unit}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>
            Min: {row.reorderLevel}
          </span>
        </div>
      ),
    },
    {
      key: 'costPrice',
      title: 'Cost (AED)',
      sortable: true,
      render: (val) => Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }),
    },
    {
      key: 'sellingPrice',
      title: 'Price (AED)',
      sortable: true,
      render: (val) => (
        <span style={{ fontWeight: 600 }}>
          {Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      width: '110px',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '150px',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            className="btn btn-secondary btn-sm"
            style={{ height: '26px', padding: '0 6px' }}
            onClick={() => handleOpenAdjustStock(row)}
            title="Adjust Stock"
          >
            <SlidersHorizontal size={12} /> Stock
          </button>
          <button
            className="btn btn-secondary btn-sm"
            style={{ height: '26px', padding: '0 6px' }}
            onClick={() => handleOpenEditModal(row)}
            title="Edit Details"
          >
            <Edit2 size={12} /> Edit
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Product Catalog & Inventory</h1>
          <p>Control multi-facility inventory stock, reorder levels, and catalog pricing.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm" onClick={handleOpenAddModal}>
            <Plus size={14} /> Add Product
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={products}
        isLoading={isLoading}
        totalItems={totalCount}
        page={page}
        pageSize={15}
        onPageChange={setPage}
        searchPlaceholder="Search product name, SKU, barcode..."
        searchValue={search}
        onSearchChange={setSearch}
        filterOptions={[
          { label: 'Active', value: 'ACTIVE' },
          { label: 'Low Stock', value: 'LOW_STOCK' },
          { label: 'Out of Stock', value: 'OUT_OF_STOCK' },
        ]}
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        emptyTitle="No products found"
        emptyDescription="Add new enterprise hardware, components, or consumables to the inventory."
        onAddRecord={handleOpenAddModal}
        exportFileName="inventory-products"
      />

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={editingProduct ? `Edit Product — ${editingProduct.sku}` : 'Add Product to Inventory'}
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsAddEditOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSaveProduct}>
              {editingProduct ? 'Update Product' : 'Register Product'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveProduct}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label form-label-required">Product Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Cisco Catalyst 9200 Switch"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label form-label-required">SKU Identifier</label>
              <input
                type="text"
                className="form-input"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Primary Warehouse</label>
              <select
                className="form-select"
                value={formData.warehouseId}
                onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
              >
                <option value="">Select Warehouse</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Supplier</label>
              <select
                className="form-select"
                value={formData.supplierId}
                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
              >
                <option value="">Select Supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label form-label-required">Unit Cost (AED)</label>
              <input
                type="number"
                className="form-input"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label form-label-required">Selling Price (AED)</label>
              <input
                type="number"
                className="form-input"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Unit of Measure</label>
              <select
                className="form-select"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              >
                <option value="UNIT">Unit / Piece</option>
                <option value="BOX">Box / Carton</option>
                <option value="ROLL">Roll / Spool</option>
                <option value="SET">Set / Kit</option>
                <option value="KG">Kilogram (kg)</option>
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Initial Stock Quantity</label>
              <input
                type="number"
                className="form-input"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                min="0"
                disabled={!!editingProduct}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Reorder Warning Level</label>
              <input
                type="number"
                className="form-input"
                value={formData.reorderLevel}
                onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                min="1"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description & Technical Specs</label>
            <textarea
              className="form-textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enterprise equipment specifications and serial details..."
            />
          </div>
        </form>
      </Modal>

      {/* Adjust Stock Modal */}
      {adjustProduct && (
        <Modal
          isOpen={isAdjustOpen}
          onClose={() => setIsAdjustOpen(false)}
          title={`Adjust Inventory — ${adjustProduct.name}`}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setIsAdjustOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveAdjustment}>
                Save Adjustment
              </button>
            </>
          }
        >
          <form onSubmit={handleSaveAdjustment}>
            <div
              style={{
                padding: '12px 14px',
                backgroundColor: 'var(--color-bg-subtle)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '16px',
                fontSize: '13px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>SKU:</span>
                <span style={{ fontWeight: 600 }}>{adjustProduct.sku}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Current Warehouse:</span>
                <span>{adjustProduct.warehouse?.name || 'Dubai Central'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                <span>Current Stock on Hand:</span>
                <span>
                  {adjustProduct.stockQuantity} {adjustProduct.unit}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label form-label-required">
                Quantity Change (+ to add, - to deduct)
              </label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. +10 or -3"
                value={adjustQty}
                onChange={(e) => setAdjustQty(e.target.value)}
                required
              />
              <span className="form-hint">
                New balance will be:{' '}
                <strong>
                  {adjustProduct.stockQuantity + (Number(adjustQty) || 0)} {adjustProduct.unit}
                </strong>
              </span>
            </div>

            <div className="form-group">
              <label className="form-label form-label-required">Reason / Justification</label>
              <select
                className="form-select"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
              >
                <option value="Physical Stock Audit Verification">Physical Stock Audit Verification</option>
                <option value="Damaged / Scrapped in Transit">Damaged / Scrapped in Transit</option>
                <option value="Direct Supplier Inward Intake">Direct Supplier Inward Intake</option>
                <option value="Customer Return Stock Intake">Customer Return Stock Intake</option>
                <option value="Inter-Warehouse Transfer Adjustment">Inter-Warehouse Transfer Adjustment</option>
              </select>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Products;
