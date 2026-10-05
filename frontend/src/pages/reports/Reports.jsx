import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  FileSpreadsheet,
  TrendingUp,
  DollarSign,
  Package,
  Users,
} from 'lucide-react';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';

const Reports = () => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('sales');
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReport = async () => {
    try {
      setIsLoading(true);
      let endpoint = `/reports/${activeTab}`;
      let params = {};
      if (activeTab === 'sales') {
        params = { startDate, endDate };
      }
      const res = await api.get(endpoint, { params });
      if (res.success && res.data) {
        setReportData(res.data);
      }
    } catch (err) {
      showToast('Failed to generate report: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeTab]);

  const handleExportCSV = () => {
    showToast('Exporting ' + activeTab.toUpperCase() + ' report to CSV...', 'info');
    let csv = '';
    if (activeTab === 'sales' && reportData?.orders) {
      csv =
        'Order Number,Client,Date,Subtotal,VAT,Total,Status\n' +
        reportData.orders
          .map(
            (o) =>
              `"${o.orderNumber}","${o.customer?.companyName || o.customer?.name}","${o.orderDate}",${o.subtotal},${o.taxAmount},${o.totalAmount},"${o.status}"`
          )
          .join('\n');
    } else if (activeTab === 'inventory' && reportData?.products) {
      csv =
        'SKU,Product Name,Stock,Reorder Level,Unit Cost,Selling Price,Total Valuation\n' +
        reportData.products
          .map(
            (p) =>
              `"${p.sku}","${p.name}",${p.stockQuantity},${p.reorderLevel},${p.costPrice},${p.sellingPrice},${(p.costPrice * p.stockQuantity).toFixed(2)}`
          )
          .join('\n');
    } else if (activeTab === 'employees' && reportData?.employees) {
      csv =
        'Staff ID,Name,Department,Designation,Basic Salary,Status\n' +
        reportData.employees
          .map(
            (e) =>
              `"${e.employeeCode}","${e.firstName} ${e.lastName}","${e.department}","${e.designation}",${e.basicSalary},"${e.status}"`
          )
          .join('\n');
    } else {
      csv = 'Report,Generated\n' + activeTab + ',' + new Date().toISOString();
    }

    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nexora-${activeTab}-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatAED = (val) => {
    return `AED ${Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Enterprise Business Reports & Analytics</h1>
          <p>Consolidated statutory financial, commercial, inventory valuation, and payroll statements.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
            <Download size={13} /> Export CSV
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
            <Printer size={13} /> Print Statement
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--color-border)',
          marginBottom: '20px',
        }}
      >
        {[
          { key: 'sales', label: 'Commercial Sales Report', icon: TrendingUp },
          { key: 'inventory', label: 'Inventory Valuation Report', icon: Package },
          { key: 'financial', label: 'Financial & P&L Statement', icon: DollarSign },
          { key: 'employees', label: 'Headcount & Human Capital', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
                color: isActive ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 150ms',
              }}
            >
              <Icon size={14} color={isActive ? '#2563eb' : 'currentColor'} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Date filter toolbar for Sales */}
      {activeTab === 'sales' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
            <Calendar size={14} color="var(--color-text-muted)" />
            <span>Reporting Period:</span>
          </div>
          <input
            type="date"
            className="form-input"
            style={{ width: '150px', height: '32px' }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span style={{ color: 'var(--color-text-muted)' }}>to</span>
          <input
            type="date"
            className="form-input"
            style={{ width: '150px', height: '32px' }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <button className="btn btn-primary btn-sm" onClick={fetchReport}>
            Apply Period Filter
          </button>
        </div>
      )}

      {/* Content depending on active tab */}
      {isLoading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Generating analytical statement...
        </div>
      ) : activeTab === 'sales' ? (
        <div>
          <div className="kpi-grid">
            <StatCard
              title="Period Sales Volume"
              value={formatAED(reportData?.totalSalesAmount)}
              subtitle="All confirmed sales orders"
              icon={DollarSign}
            />
            <StatCard
              title="Order Count"
              value={reportData?.totalOrdersCount || 0}
              subtitle="Fulfillments processed"
              icon={TrendingUp}
            />
            <StatCard
              title="Average Order Value"
              value={formatAED(reportData?.averageOrderValue)}
              subtitle="Per client transaction"
              icon={TrendingUp}
            />
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Commercial Orders Itemized Audit</div>
            </div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order Number</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Subtotal (Excl. VAT)</th>
                    <th>5% UAE VAT</th>
                    <th>Total (AED)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData?.orders?.map((o) => (
                    <tr key={o.id}>
                      <td style={{ fontWeight: 600, color: 'var(--color-accent)' }}>{o.orderNumber}</td>
                      <td>{o.customer?.companyName || o.customer?.name}</td>
                      <td>{o.orderDate}</td>
                      <td>{formatAED(o.subtotal)}</td>
                      <td>{formatAED(o.taxAmount)}</td>
                      <td style={{ fontWeight: 700 }}>{formatAED(o.totalAmount)}</td>
                      <td>
                        <StatusBadge status={o.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'inventory' ? (
        <div>
          <div className="kpi-grid">
            <StatCard
              title="Total Stock Valuation"
              value={formatAED(reportData?.totalValuation)}
              subtitle="Cost valuation on-hand"
              icon={Package}
            />
            <StatCard
              title="Catalog Items"
              value={reportData?.totalProducts || 0}
              subtitle="Active product SKUs"
              icon={Package}
            />
            <StatCard
              title="Items Below Reorder"
              value={reportData?.lowStockCount || 0}
              subtitle="Immediate restocking needed"
              icon={Package}
              isPositive={false}
            />
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Stock Valuation by SKU</div>
            </div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Product Title</th>
                    <th>Quantity On Hand</th>
                    <th>Unit Cost (AED)</th>
                    <th>Selling Price (AED)</th>
                    <th>Total Asset Value</th>
                    <th>Inventory Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData?.products?.map((p) => {
                    const totalAssetVal = Number(p.costPrice) * Number(p.stockQuantity);
                    return (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600 }}>{p.sku}</td>
                        <td>{p.name}</td>
                        <td style={{ fontWeight: 600 }}>
                          {p.stockQuantity} {p.unit}
                        </td>
                        <td>{formatAED(p.costPrice)}</td>
                        <td>{formatAED(p.sellingPrice)}</td>
                        <td style={{ fontWeight: 700 }}>{formatAED(totalAssetVal)}</td>
                        <td>
                          <StatusBadge status={p.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'financial' ? (
        <div>
          <div className="kpi-grid">
            <StatCard
              title="Gross Billed Revenue"
              value={formatAED(reportData?.grossRevenue)}
              icon={DollarSign}
            />
            <StatCard
              title="Operating Expenses"
              value={formatAED(reportData?.totalExpenses)}
              icon={DollarSign}
            />
            <StatCard
              title="Net Operating Profit"
              value={formatAED(reportData?.netProfit)}
              icon={TrendingUp}
              isPositive={true}
            />
            <StatCard
              title="Uncollected Receivables"
              value={formatAED(reportData?.totalOutstanding)}
              icon={DollarSign}
              isPositive={false}
            />
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Approved Operating Cost Ledger</div>
            </div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Expense Allocation</th>
                    <th>Total Disbursed (AED)</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData?.expenseBreakdown?.map(([cat, total], idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{cat}</td>
                      <td style={{ fontWeight: 700 }}>{formatAED(total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="kpi-grid">
            <StatCard
              title="Active Headcount"
              value={reportData?.activeEmployees || 0}
              subtitle="Full-time staff"
              icon={Users}
            />
            <StatCard
              title="Staff On Leave"
              value={reportData?.onLeaveEmployees || 0}
              subtitle="Annual / medical leave"
              icon={Users}
            />
            <StatCard
              title="Total Staff"
              value={reportData?.totalEmployees || 0}
              subtitle="Total headcount"
              icon={Users}
            />
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Department Distribution</div>
            </div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Active Personnel Count</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData?.departmentBreakdown?.map(([dept, count], idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{dept}</td>
                      <td style={{ fontWeight: 700 }}>{count} members</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
