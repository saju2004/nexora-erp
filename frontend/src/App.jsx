import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layout
import AppLayout from './components/layout/AppLayout';

// Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Customers from './pages/sales/Customers';
import Orders from './pages/sales/Orders';
import Invoices from './pages/sales/Invoices';
import Products from './pages/inventory/Products';
import StockMovements from './pages/inventory/StockMovements';
import Suppliers from './pages/purchase/Suppliers';
import FinanceOverview from './pages/finance/FinanceOverview';
import Expenses from './pages/finance/Expenses';
import Employees from './pages/hr/Employees';
import Attendance from './pages/hr/Attendance';
import Leaves from './pages/hr/Leaves';
import Payroll from './pages/hr/Payroll';
import Projects from './pages/projects/Projects';
import Reports from './pages/reports/Reports';
import SettingsPage from './pages/settings/Settings';
import AuditLogs from './pages/audit/AuditLogs';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-bg-app)',
          fontSize: '14px',
          color: 'var(--color-text-muted)',
        }}
      >
        Initializing secure workspace...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Guard (redirect to /dashboard if logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Login Route */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />

            {/* Protected Enterprise ERP Layout & Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />

              {/* Sales Module */}
              <Route path="sales" element={<Navigate to="/sales/orders" replace />} />
              <Route path="sales/orders" element={<Orders />} />
              <Route path="sales/customers" element={<Customers />} />
              <Route path="sales/invoices" element={<Invoices />} />
              <Route path="sales/payments" element={<Invoices />} />

              {/* Inventory Module */}
              <Route path="inventory" element={<Products />} />
              <Route path="inventory/movements" element={<StockMovements />} />

              {/* Purchase Module */}
              <Route path="purchase" element={<Navigate to="/purchase/suppliers" replace />} />
              <Route path="purchase/suppliers" element={<Suppliers />} />

              {/* Finance Module */}
              <Route path="finance" element={<FinanceOverview />} />
              <Route path="finance/expenses" element={<Expenses />} />

              {/* Human Resources Module */}
              <Route path="hr" element={<Navigate to="/hr/employees" replace />} />
              <Route path="hr/employees" element={<Employees />} />
              <Route path="hr/attendance" element={<Attendance />} />
              <Route path="hr/leaves" element={<Leaves />} />
              <Route path="hr/payroll" element={<Payroll />} />

              {/* Projects Module */}
              <Route path="projects" element={<Projects />} />

              {/* Reports Module */}
              <Route path="reports" element={<Reports />} />

              {/* Administration & Settings */}
              <Route path="settings" element={<SettingsPage />} />
              <Route path="audit" element={<AuditLogs />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
