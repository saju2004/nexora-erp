import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Eye, CheckCircle2, Truck, XCircle, Trash2, Printer } from 'lucide-react';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';

const Orders = () => {
  const { showToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Aux state for dropdowns
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  // Create Order Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [discountAmount, setDiscountAmount] = useState('0');
  const [orderItems, setOrderItems] = useState([
    { productId: '', quantity: 1, unitPrice: 0, totalPrice: 0 },
  ]);

  // View / Status Drawer State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/orders', {
        params: {
          search: search || undefined,
          status: statusFilter || undefined,
          page,
          size: 15,
        },
      });
      if (res.success && res.data) {
        setOrders(res.data.content || []);
        setTotalCount(res.data.totalElements || 0);
      }
    } catch (err) {
      showToast('Failed to load orders: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter, showToast]);

  const loadAuxData = async () => {
    try {
      const [cRes, pRes] = await Promise.all([
        api.get('/customers/all'),
        api.get('/products/all'),
      ]);
      if (cRes.success) setCustomers(cRes.data || []);
      if (pRes.success) setProducts(pRes.data || []);
    } catch (e) {
      console.error('Aux load error', e);
    }
  };

  useEffect(() => {
    fetchOrders();
    loadAuxData();
  }, [fetchOrders]);

  // Order item line calculations
  const handleItemChange = (index, field, value) => {
    const updated = [...orderItems];
    const item = { ...updated[index], [field]: value };

    if (field === 'productId') {
      const p = products.find((prod) => String(prod.id) === String(value));
      if (p) {
        item.unitPrice = Number(p.sellingPrice);
        item.totalPrice = item.unitPrice * (item.quantity || 1);
      }
    } else if (field === 'quantity' || field === 'unitPrice') {
      const qty = field === 'quantity' ? Number(value) : item.quantity;
      const price = field === 'unitPrice' ? Number(value) : item.unitPrice;
      item.totalPrice = (qty || 0) * (price || 0);
    }

    updated[index] = item;
    setOrderItems(updated);
  };

  const handleAddItem = () => {
    setOrderItems([...orderItems, { productId: '', quantity: 1, unitPrice: 0, totalPrice: 0 }]);
  };

  const handleRemoveItem = (index) => {
    if (orderItems.length === 1) return;
    setOrderItems(orderItems.filter((_, idx) => idx !== index));
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((acc, item) => acc + (item.totalPrice || 0), 0);
  };

  const subtotal = calculateSubtotal();
  const discount = Number(discountAmount) || 0;
  const taxable = Math.max(0, subtotal - discount);
  const vatAmount = taxable * 0.05; // 5% UAE VAT
  const totalAmount = taxable + vatAmount;

  const handleOpenCreateModal = () => {
    setSelectedCustomerId(customers[0]?.id || '');
    setExpectedDate(new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10));
    setShippingAddress('');
    setNotes('');
    setDiscountAmount('0');
    if (products.length > 0) {
      const p0 = products[0];
      setOrderItems([{ productId: p0.id, quantity: 1, unitPrice: p0.sellingPrice, totalPrice: p0.sellingPrice }]);
    } else {
      setOrderItems([{ productId: '', quantity: 1, unitPrice: 0, totalPrice: 0 }]);
    }
    setIsCreateOpen(true);
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      showToast('Please select a customer', 'error');
      return;
    }
    const validItems = orderItems.filter((i) => i.productId && i.quantity > 0);
    if (validItems.length === 0) {
      showToast('Please add at least one valid product line item', 'error');
      return;
    }

    try {
      await api.post('/orders', {
        customerId: selectedCustomerId,
        expectedDeliveryDate: expectedDate || null,
        shippingAddress,
        notes,
        discountAmount: discount,
        items: validItems.map((i) => ({
          productId: i.productId,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
        })),
      });

      showToast('Sales Order created and Invoice auto-generated!', 'success');
      setIsCreateOpen(false);
      fetchOrders();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      showToast(`Order status updated to ${newStatus}`, 'success');
      if (selectedOrder) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      fetchOrders();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsViewOpen(true);
  };

  const columns = [
    {
      key: 'orderNumber',
      title: 'Order ID',
      width: '130px',
      sortable: true,
      render: (val, row) => (
        <span
          style={{ fontWeight: 600, color: 'var(--color-accent)', cursor: 'pointer' }}
          onClick={() => handleViewOrder(row)}
        >
          {val}
        </span>
      ),
    },
    {
      key: 'customer',
      title: 'Client Name',
      sortable: true,
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.customer?.companyName || row.customer?.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{row.customer?.city || 'Dubai'}</div>
        </div>
      ),
    },
    {
      key: 'orderDate',
      title: 'Date',
      sortable: true,
      render: (val) => val || '—',
    },
    {
      key: 'totalAmount',
      title: 'Total (Incl. VAT)',
      sortable: true,
      render: (val) => (
        <span style={{ fontWeight: 600 }}>
          AED {Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Fulfillment',
      width: '120px',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'paymentStatus',
      title: 'Payment',
      width: '110px',
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
          onClick={() => handleViewOrder(row)}
        >
          <Eye size={12} /> View
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Sales Orders</h1>
          <p>Process, dispatch, and track commercial enterprise client orders.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm" onClick={handleOpenCreateModal}>
            <Plus size={14} /> Create Order
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        isLoading={isLoading}
        totalItems={totalCount}
        page={page}
        pageSize={15}
        onPageChange={setPage}
        searchPlaceholder="Search order number or client..."
        searchValue={search}
        onSearchChange={setSearch}
        filterOptions={[
          { label: 'Processing', value: 'PROCESSING' },
          { label: 'Shipped', value: 'SHIPPED' },
          { label: 'Delivered', value: 'DELIVERED' },
          { label: 'Pending', value: 'PENDING' },
          { label: 'Cancelled', value: 'CANCELLED' },
        ]}
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        emptyTitle="No orders found"
        emptyDescription="Create your first customer sales order to start processing shipments."
        onAddRecord={handleOpenCreateModal}
        exportFileName="sales-orders"
      />

      {/* Create Order Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Commercial Sales Order"
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleCreateOrder}>
              Confirm & Generate Invoice
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateOrder}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label form-label-required">Customer Organization</label>
              <select
                className="form-select"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                required
              >
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName || c.name} ({c.customerCode})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Expected Delivery Date</label>
              <input
                type="date"
                className="form-input"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Delivery Destination Address</label>
            <input
              type="text"
              className="form-input"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="e.g. Warehouse 4, Al Quoz, Dubai"
            />
          </div>

          {/* Line Items Table */}
          <div style={{ marginTop: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Order Line Items</span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleAddItem}
              >
                <Plus size={12} /> Add Item
              </button>
            </div>

            <table className="data-table" style={{ border: '1px solid var(--color-border)' }}>
              <thead>
                <tr>
                  <th style={{ width: '45%' }}>Product / SKU</th>
                  <th style={{ width: '15%' }}>Quantity</th>
                  <th style={{ width: '20%' }}>Unit Price (AED)</th>
                  <th style={{ width: '15%' }}>Total (AED)</th>
                  <th style={{ width: '5%' }}></th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <select
                        className="form-select"
                        value={item.productId}
                        onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                        required
                        style={{ height: '32px', fontSize: '12.5px' }}
                      >
                        <option value="">Select item</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.sku}) — Stock: {p.stockQuantity}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-input"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        min="1"
                        style={{ height: '32px', fontSize: '12.5px' }}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-input"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                        step="0.01"
                        style={{ height: '32px', fontSize: '12.5px' }}
                        required
                      />
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      AED {Number(item.totalPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      {orderItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--status-danger-text)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              padding: '14px',
              backgroundColor: 'var(--color-bg-subtle)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div style={{ width: '280px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Subtotal:</span>
                <span style={{ fontWeight: 600 }}>AED {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Discount:</span>
                <input
                  type="number"
                  className="form-input"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  style={{ width: '90px', height: '26px', fontSize: '12px', textAlign: 'right' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>UAE VAT (5%):</span>
                <span>AED {vatAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '8px',
                  borderTop: '1px solid var(--color-border)',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: 'var(--color-text-main)',
                }}
              >
                <span>Net Total:</span>
                <span>AED {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* View Order Modal */}
      {selectedOrder && (
        <Modal
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          title={`Order Details — ${selectedOrder.orderNumber}`}
          size="lg"
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {selectedOrder.status === 'PROCESSING' && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'SHIPPED')}
                  >
                    <Truck size={13} /> Mark Shipped
                  </button>
                )}
                {selectedOrder.status === 'SHIPPED' && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'DELIVERED')}
                  >
                    <CheckCircle2 size={13} /> Mark Delivered
                  </button>
                )}
                {selectedOrder.status !== 'CANCELLED' && selectedOrder.status !== 'DELIVERED' && (
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ color: 'var(--status-danger-text)' }}
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'CANCELLED')}
                  >
                    <XCircle size={13} /> Cancel Order
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => window.print()}
                >
                  <Printer size={13} /> Print Order
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setIsViewOpen(false)}>
                  Close
                </button>
              </div>
            </div>
          }
        >
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
                padding: '16px',
                backgroundColor: 'var(--color-bg-subtle)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '20px',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Client</div>
                <div style={{ fontWeight: 600, fontSize: '13.5px', marginTop: '2px' }}>
                  {selectedOrder.customer?.companyName || selectedOrder.customer?.name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  {selectedOrder.customer?.email}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Fulfillment Status</div>
                <div style={{ marginTop: '4px' }}>
                  <StatusBadge status={selectedOrder.status} />
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  Ordered: {selectedOrder.orderDate}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Payment Status</div>
                <div style={{ marginTop: '4px' }}>
                  <StatusBadge status={selectedOrder.paymentStatus} />
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  Expected: {selectedOrder.expectedDeliveryDate || 'N/A'}
                </div>
              </div>
            </div>

            {/* Line items table */}
            <table className="data-table" style={{ border: '1px solid var(--color-border)', marginBottom: '16px' }}>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((it) => (
                    <tr key={it.id}>
                      <td style={{ fontWeight: 600 }}>{it.product?.name}</td>
                      <td>{it.product?.sku}</td>
                      <td>{it.quantity}</td>
                      <td>AED {Number(it.unitPrice).toFixed(2)}</td>
                      <td style={{ fontWeight: 600 }}>AED {Number(it.totalPrice).toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '12px' }}>
                      Standard Commercial Package
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Totals */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: '240px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Subtotal:</span>
                  <span>AED {Number(selectedOrder.subtotal).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>VAT (5%):</span>
                  <span>AED {Number(selectedOrder.taxAmount).toFixed(2)}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: '6px',
                    borderTop: '1px solid var(--color-border)',
                    fontWeight: 700,
                    fontSize: '14.5px',
                  }}
                >
                  <span>Total Amount:</span>
                  <span>AED {Number(selectedOrder.totalAmount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Orders;
