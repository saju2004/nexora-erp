import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, Printer, Eye, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';

const Invoices = () => {
  const { showToast } = useToast();

  const [invoices, setInvoices] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Payment Modal State
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Invoice Print Preview Modal
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState(null);

  const fetchInvoices = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/invoices', {
        params: {
          search: search || undefined,
          status: statusFilter || undefined,
          page,
          size: 15,
        },
      });
      if (res.success && res.data) {
        setInvoices(res.data.content || []);
        setTotalCount(res.data.totalElements || 0);
      }
    } catch (err) {
      showToast('Failed to load invoices: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter, showToast]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleOpenPayment = (inv) => {
    setSelectedInvoice(inv);
    setPaymentAmount(String(inv.balanceAmount || '0'));
    setPaymentMethod('BANK_TRANSFER');
    setReferenceNumber('TXN-' + Math.floor(100000 + Math.random() * 900000));
    setPaymentNotes('Settlement of Invoice ' + inv.invoiceNumber);
    setIsPaymentOpen(true);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) {
      showToast('Payment amount must be greater than zero', 'error');
      return;
    }
    if (amount > Number(selectedInvoice.balanceAmount)) {
      showToast(`Amount cannot exceed outstanding balance AED ${selectedInvoice.balanceAmount}`, 'error');
      return;
    }

    try {
      await api.post(`/invoices/${selectedInvoice.id}/pay`, {
        amount,
        method: paymentMethod,
        referenceNumber,
        notes: paymentNotes,
      });

      showToast(`Payment of AED ${amount.toFixed(2)} recorded successfully!`, 'success');
      setIsPaymentOpen(false);
      fetchInvoices();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handlePreviewInvoice = (inv) => {
    setPreviewInvoice(inv);
    setIsPreviewOpen(true);
  };

  const columns = [
    {
      key: 'invoiceNumber',
      title: 'Invoice ID',
      width: '130px',
      sortable: true,
      render: (val, row) => (
        <span
          style={{ fontWeight: 600, color: 'var(--color-accent)', cursor: 'pointer' }}
          onClick={() => handlePreviewInvoice(row)}
        >
          {val}
        </span>
      ),
    },
    {
      key: 'order',
      title: 'Sales Order',
      width: '120px',
      render: (val) => val?.orderNumber || 'Direct Invoice',
    },
    {
      key: 'customer',
      title: 'Client Organization',
      sortable: true,
      render: (val) => (
        <div>
          <div style={{ fontWeight: 600 }}>{val?.companyName || val?.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>TRN: {val?.taxNumber || 'Unregistered'}</div>
        </div>
      ),
    },
    {
      key: 'invoiceDate',
      title: 'Date',
      sortable: true,
      render: (val) => val,
    },
    {
      key: 'dueDate',
      title: 'Due Date',
      sortable: true,
      render: (val) => (
        <span style={{ color: 'var(--color-text-muted)' }}>{val || '—'}</span>
      ),
    },
    {
      key: 'totalAmount',
      title: 'Total (AED)',
      sortable: true,
      render: (val) => (
        <span style={{ fontWeight: 600 }}>
          AED {Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'balanceAmount',
      title: 'Outstanding (AED)',
      sortable: true,
      render: (val) => (
        <span
          style={{
            fontWeight: 600,
            color: Number(val) > 0 ? 'var(--status-danger-text)' : 'var(--status-success-text)',
          }}
        >
          AED {Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
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
      title: 'Actions',
      width: '150px',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            className="btn btn-secondary btn-sm"
            style={{ height: '26px', padding: '0 6px' }}
            onClick={() => handlePreviewInvoice(row)}
            title="View Invoice"
          >
            <Eye size={12} /> View
          </button>
          {Number(row.balanceAmount) > 0 && (
            <button
              className="btn btn-primary btn-sm"
              style={{ height: '26px', padding: '0 6px' }}
              onClick={() => handleOpenPayment(row)}
              title="Record Payment"
            >
              <CreditCard size={12} /> Pay
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Invoices & Billing</h1>
          <p>Issue corporate tax invoices, track settlements, and manage accounts receivable.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
            <Printer size={13} /> Print Statement
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={invoices}
        isLoading={isLoading}
        totalItems={totalCount}
        page={page}
        pageSize={15}
        onPageChange={setPage}
        searchPlaceholder="Search invoice # or client..."
        searchValue={search}
        onSearchChange={setSearch}
        filterOptions={[
          { label: 'Paid', value: 'PAID' },
          { label: 'Partial', value: 'PARTIAL' },
          { label: 'Unpaid', value: 'UNPAID' },
          { label: 'Overdue', value: 'OVERDUE' },
        ]}
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        emptyTitle="No invoices found"
        emptyDescription="Invoices will be auto-generated when sales orders are placed."
        exportFileName="invoices-ledger"
      />

      {/* Record Payment Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          title={`Record Payment for ${selectedInvoice.invoiceNumber}`}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setIsPaymentOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleRecordPayment}>
                Confirm Receipt
              </button>
            </>
          }
        >
          <form onSubmit={handleRecordPayment}>
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
                <span style={{ color: 'var(--color-text-muted)' }}>Customer:</span>
                <span style={{ fontWeight: 600 }}>{selectedInvoice.customer?.companyName || selectedInvoice.customer?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Invoice Total:</span>
                <span>AED {Number(selectedInvoice.totalAmount).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--status-danger-text)', fontWeight: 600 }}>
                <span>Outstanding Balance:</span>
                <span>AED {Number(selectedInvoice.balanceAmount).toFixed(2)}</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label form-label-required">Payment Amount (AED)</label>
              <input
                type="number"
                className="form-input"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                min="0.01"
                max={selectedInvoice.balanceAmount}
                step="0.01"
                required
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label form-label-required">Payment Method</label>
                <select
                  className="form-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="BANK_TRANSFER">Bank Wire Transfer</option>
                  <option value="CREDIT_CARD">Corporate Card</option>
                  <option value="CHEQUE">PDC / Cheque</option>
                  <option value="CASH">Cash Deposit</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Transaction / Reference #</label>
                <input
                  type="text"
                  className="form-input"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="e.g. FT-ENBD-884129"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Memo / Notes</label>
              <input
                type="text"
                className="form-input"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="Optional settlement notes"
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Corporate Tax Invoice Printable Preview Modal */}
      {previewInvoice && (
        <Modal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          title={`Corporate Tax Invoice — ${previewInvoice.invoiceNumber}`}
          size="lg"
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
                Federal Tax Authority (FTA) Compliant Tax Invoice
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
                  <Printer size={13} /> Print Invoice
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setIsPreviewOpen(false)}>
                  Close
                </button>
              </div>
            </div>
          }
        >
          <div style={{ padding: '8px', color: 'var(--color-text-main)' }}>
            {/* Invoice Top Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: '2px solid var(--color-border)',
                paddingBottom: '16px',
                marginBottom: '20px',
              }}
            >
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary)' }}>
                  NEXORA ENTERPRISE SOLUTIONS LLC
                </h2>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  Level 28, Al Saada Tower, Business Bay, Dubai, UAE
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  UAE Tax Registration Number (TRN): <strong>100348291000003</strong>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em' }}>
                  TAX INVOICE
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-accent)' }}>
                  {previewInvoice.invoiceNumber}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  Date: {previewInvoice.invoiceDate}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  Due: {previewInvoice.dueDate || 'Upon Receipt'}
                </div>
              </div>
            </div>

            {/* Bill To Info */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                backgroundColor: 'var(--color-bg-subtle)',
                padding: '14px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '20px',
                fontSize: '12.5px',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                  Billed To (Client):
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>
                  {previewInvoice.customer?.companyName || previewInvoice.customer?.name}
                </div>
                <div>{previewInvoice.customer?.address || 'Sheikh Zayed Road, Dubai'}</div>
                <div>Client TRN: {previewInvoice.customer?.taxNumber || '100234589000003'}</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                  Payment Details:
                </div>
                <div>Terms: Net 30 Days</div>
                <div>Currency: AED (United Arab Emirates Dirham)</div>
                <div style={{ marginTop: '4px' }}>
                  Status: <StatusBadge status={previewInvoice.status} />
                </div>
              </div>
            </div>

            {/* Breakdown table */}
            <table className="data-table" style={{ border: '1px solid var(--color-border)', marginBottom: '16px' }}>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Order Reference</th>
                  <th>Amount (Excl. VAT)</th>
                  <th>VAT (5%)</th>
                  <th>Total (AED)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 500 }}>
                    Commercial Order Dispatch & Fulfillment Services
                  </td>
                  <td>{previewInvoice.order?.orderNumber || 'ORD-2026-Direct'}</td>
                  <td>AED {Number(previewInvoice.subtotal).toFixed(2)}</td>
                  <td>AED {Number(previewInvoice.taxAmount).toFixed(2)}</td>
                  <td style={{ fontWeight: 700 }}>AED {Number(previewInvoice.totalAmount).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            {/* Bottom summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', maxWidth: '340px' }}>
                Bank Wire Settlement:
                <br />
                Bank: Emirates NBD PJSC (Corporate Banking)
                <br />
                IBAN: AE29 0260 0012 3456 7890 101
                <br />
                SWIFT / BIC: EBILAEAD
              </div>

              <div style={{ width: '240px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Subtotal:</span>
                  <span>AED {Number(previewInvoice.subtotal).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>VAT (5%):</span>
                  <span>AED {Number(previewInvoice.taxAmount).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Paid to date:</span>
                  <span>AED {Number(previewInvoice.paidAmount).toFixed(2)}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: '6px',
                    borderTop: '1px solid var(--color-border)',
                    fontWeight: 700,
                    fontSize: '15px',
                    color: Number(previewInvoice.balanceAmount) > 0 ? 'var(--status-danger-text)' : 'var(--status-success-text)',
                  }}
                >
                  <span>Balance Due:</span>
                  <span>AED {Number(previewInvoice.balanceAmount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Invoices;
