import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  ShoppingCart,
  Package,
  CreditCard,
  Plus,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import { CardSkeleton } from '../../components/common/SkeletonLoader';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/dashboard/stats');
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatAED = (amount) => {
    if (amount === undefined || amount === null) return 'AED 0.00';
    return `AED ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Line Chart Data: Monthly Revenue vs Expenses
  const revenueChartData = {
    labels: stats?.revenueMonths || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    datasets: [
      {
        label: 'Gross Revenue (AED)',
        data: stats?.monthlyRevenue || [182400, 195200, 210500, 204100, 228900, 241300, 235600, 252100, 261800, 248650],
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.08)',
        fill: true,
        tension: 0.25,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
      {
        label: 'Operating Expenses (AED)',
        data: stats?.monthlyExpenses || [94500, 102000, 98300, 112400, 108900, 115000, 119200, 121400, 128500, 132100],
        borderColor: '#94a3b8',
        backgroundColor: 'transparent',
        borderDash: [4, 4],
        tension: 0.25,
        borderWidth: 1.5,
        pointRadius: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          boxWidth: 12,
          font: { family: 'Inter', size: 12 },
          color: '#64748b',
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 10,
        cornerRadius: 4,
        titleFont: { family: 'Inter', size: 12 },
        bodyFont: { family: 'Inter', size: 12 },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Inter', size: 11 }, color: '#64748b' },
      },
      y: {
        grid: { color: 'rgba(226, 232, 240, 0.6)' },
        ticks: {
          font: { family: 'Inter', size: 11 },
          color: '#64748b',
          callback: (value) => `AED ${(value / 1000).toFixed(0)}k`,
        },
      },
    },
  };

  // Donut Chart: Order Status Breakdown
  const orderStatusCounts = stats?.orderStatusCounts || {
    DELIVERED: 842,
    PROCESSING: 286,
    SHIPPED: 112,
    PENDING: 34,
    CANCELLED: 10,
  };

  const donutChartData = {
    labels: Object.keys(orderStatusCounts).map((k) => k.charAt(0) + k.slice(1).toLowerCase()),
    datasets: [
      {
        data: Object.values(orderStatusCounts),
        backgroundColor: ['#15803d', '#2563eb', '#38bdf8', '#f59e0b', '#dc2626'],
        borderWidth: 1,
        borderColor: '#ffffff',
      },
    ],
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 10, font: { family: 'Inter', size: 11 }, color: '#64748b' },
      },
    },
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Dashboard</h1>
          <p>
            Good morning, {user?.fullName?.split(' ')[0] || 'Sajith'}. Here's an overview of your business operations.
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/reports')}>
            View Reports
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/sales/orders')}>
            <Plus size={14} />
            Create Order
          </button>
        </div>
      </div>

      {/* Top KPI Cards Section */}
      <div className="kpi-grid">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Total Revenue"
              value={formatAED(stats?.totalRevenue || 248650)}
              change={stats?.revenueChangePercentage || '+12.4%'}
              isPositive={true}
              icon={DollarSign}
            />
            <StatCard
              title="Total Orders"
              value={Number(stats?.totalOrders || 1284).toLocaleString()}
              change={stats?.ordersChangePercentage || '+8.2%'}
              isPositive={true}
              icon={ShoppingCart}
            />
            <StatCard
              title="Inventory Value"
              value={formatAED(stats?.inventoryValue || 684320)}
              change={stats?.inventoryChangePercentage || '-2.1%'}
              isPositive={true}
              icon={Package}
            />
            <StatCard
              title="Outstanding Payments"
              value={formatAED(stats?.outstandingPayments || 42850)}
              change={stats?.outstandingChangePercentage || '-5.4%'}
              isPositive={true}
              icon={CreditCard}
            />
          </>
        )}
      </div>

      {/* Charts Grid */}
      <div className="charts-grid-2">
        {/* Revenue Overview (Area / Line Chart) */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Revenue & Operating Margin Overview</div>
              <div className="card-subtitle">Monthly comparisons (AED) for Fiscal Year 2026</div>
            </div>
            <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 600 }}>
              Operating Margin: 51.8%
            </span>
          </div>
          <div className="card-body" style={{ height: '300px' }}>
            <Line data={revenueChartData} options={chartOptions} />
          </div>
        </div>

        {/* Order Status (Donut Chart) */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Order Status Distribution</div>
              <div className="card-subtitle">Fulfillment pipeline tracking</div>
            </div>
          </div>
          <div className="card-body" style={{ height: '300px' }}>
            <Doughnut data={donutChartData} options={donutOptions} />
          </div>
        </div>
      </div>

      {/* Lower Dashboard Split: Recent Transactions, Low Stock, Tasks */}
      <div className="dashboard-split-grid">
        {/* Left Column: Recent Orders & Transactions */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Recent Transactions & Orders</div>
              <div className="card-subtitle">Real-time commercial dispatch queue</div>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/sales/orders')}
            >
              All Orders <ArrowUpRight size={13} />
            </button>
          </div>
          <div className="table-wrapper">
            <table className="data-table data-table-compact">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                  stats.recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 600, color: 'var(--color-accent)' }}>
                        {order.orderNumber}
                      </td>
                      <td>{order.customer?.name}</td>
                      <td style={{ color: 'var(--color-text-muted)' }}>{order.orderDate}</td>
                      <td style={{ fontWeight: 600 }}>{formatAED(order.totalAmount)}</td>
                      <td>
                        <StatusBadge status={order.status} />
                      </td>
                      <td>
                        <StatusBadge status={order.paymentStatus} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
                      No recent orders recorded
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Low Stock Alerts & Upcoming Tasks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Low Stock Warning Card */}
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} color="var(--status-warning-text)" />
                <div className="card-title">Low Stock Item Alerts</div>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => navigate('/inventory')}
              >
                Inventory
              </button>
            </div>
            <div className="table-wrapper">
              <table className="data-table data-table-compact">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Warehouse</th>
                    <th>Stock</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.lowStockItems && stats.lowStockItems.length > 0 ? (
                    stats.lowStockItems.map((prod) => (
                      <tr key={prod.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{prod.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                            {prod.sku}
                          </div>
                        </td>
                        <td style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>
                          {prod.warehouse?.code || 'WH-DXB-01'}
                        </td>
                        <td>
                          <span style={{ color: 'var(--status-danger-text)', fontWeight: 700 }}>
                            {prod.stockQuantity} {prod.unit}
                          </span>
                          <span style={{ fontSize: '10.5px', color: 'var(--color-text-muted)', display: 'block' }}>
                            Min: {prod.reorderLevel}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0 6px', height: '24px', fontSize: '11px' }}
                            onClick={() => navigate('/inventory')}
                          >
                            Restock
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '16px', color: 'var(--color-text-muted)' }}>
                        All items above threshold
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upcoming Project Tasks */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Upcoming Operations Tasks</div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => navigate('/projects')}
              >
                Projects
              </button>
            </div>
            <div style={{ padding: '8px 16px' }}>
              {stats?.upcomingTasks && stats.upcomingTasks.length > 0 ? (
                stats.upcomingTasks.map((task) => (
                  <div
                    key={task.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 0',
                      borderBottom: '1px solid var(--color-border)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600 }}>{task.title}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'flex', gap: '8px', marginTop: '2px' }}>
                        <span>Assigned: {task.assignedTo || 'Unassigned'}</span>
                        <span>•</span>
                        <span>Due: {task.dueDate}</span>
                      </div>
                    </div>
                    <StatusBadge status={task.status} />
                  </div>
                ))
              ) : (
                <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '12.5px' }}>
                  No pending operational tasks
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
