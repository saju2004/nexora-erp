import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Layers,
  Truck,
  DollarSign,
  UserCheck,
  CalendarCheck,
  CalendarDays,
  CreditCard,
  Briefcase,
  BarChart3,
  Settings,
  ShieldAlert,
  ChevronDown,
  ChevronRight,
  Building2,
  FileText,
  Clock,
} from 'lucide-react';

const Sidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation();

  // Collapsible submenus state
  const [openSections, setOpenSections] = useState({
    sales: true,
    inventory: true,
    finance: false,
    hr: false,
    projects: false,
    reports: false,
    admin: false,
  });

  const toggleSection = (section) => {
    if (isCollapsed) return;
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <aside className={`app-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Header / Logo */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Building2 size={18} />
          </div>
          {!isCollapsed && (
            <div className="sidebar-logo-text">
              <span className="sidebar-brand">NEXORA</span>
              <span className="sidebar-edition">Enterprise ERP</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="sidebar-nav">
        {/* Core */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          title="Dashboard"
        >
          <LayoutDashboard className="nav-icon" />
          {!isCollapsed && <span className="nav-label">Dashboard</span>}
        </NavLink>

        {/* Sales & Commercial */}
        {!isCollapsed && (
          <div
            className="nav-section-title"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
            onClick={() => toggleSection('sales')}
          >
            <span>Sales & Commercial</span>
            {openSections.sales ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </div>
        )}
        {(openSections.sales || isCollapsed) && (
          <>
            <NavLink
              to="/sales/orders"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title="Orders"
            >
              <ShoppingCart className="nav-icon" />
              {!isCollapsed && <span className="nav-label">Orders</span>}
            </NavLink>
            <NavLink
              to="/sales/customers"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title="Customers"
            >
              <Users className="nav-icon" />
              {!isCollapsed && <span className="nav-label">Customers</span>}
            </NavLink>
            <NavLink
              to="/sales/invoices"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title="Invoices"
            >
              <FileText className="nav-icon" />
              {!isCollapsed && <span className="nav-label">Invoices</span>}
            </NavLink>
          </>
        )}

        {/* Inventory & Supply Chain */}
        {!isCollapsed && (
          <div
            className="nav-section-title"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
            onClick={() => toggleSection('inventory')}
          >
            <span>Inventory</span>
            {openSections.inventory ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </div>
        )}
        {(openSections.inventory || isCollapsed) && (
          <>
            <NavLink
              to="/inventory"
              end
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title="Products"
            >
              <Package className="nav-icon" />
              {!isCollapsed && <span className="nav-label">Products</span>}
            </NavLink>
            <NavLink
              to="/inventory/movements"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title="Stock Movements"
            >
              <Layers className="nav-icon" />
              {!isCollapsed && <span className="nav-label">Stock Movements</span>}
            </NavLink>
            <NavLink
              to="/purchase/suppliers"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title="Suppliers"
            >
              <Truck className="nav-icon" />
              {!isCollapsed && <span className="nav-label">Suppliers</span>}
            </NavLink>
          </>
        )}

        {/* Finance */}
        {!isCollapsed && (
          <div
            className="nav-section-title"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
            onClick={() => toggleSection('finance')}
          >
            <span>Finance & Accounts</span>
            {openSections.finance ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </div>
        )}
        {(openSections.finance || isCollapsed) && (
          <>
            <NavLink
              to="/finance"
              end
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title="Financial Overview"
            >
              <DollarSign className="nav-icon" />
              {!isCollapsed && <span className="nav-label">Financial Overview</span>}
            </NavLink>
            <NavLink
              to="/finance/expenses"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title="Expenses"
            >
              <CreditCard className="nav-icon" />
              {!isCollapsed && <span className="nav-label">Expenses</span>}
            </NavLink>
          </>
        )}

        {/* Human Resources */}
        {!isCollapsed && (
          <div
            className="nav-section-title"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
            onClick={() => toggleSection('hr')}
          >
            <span>Human Resources</span>
            {openSections.hr ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </div>
        )}
        {(openSections.hr || isCollapsed) && (
          <>
            <NavLink
              to="/hr/employees"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title="Employees"
            >
              <UserCheck className="nav-icon" />
              {!isCollapsed && <span className="nav-label">Employees</span>}
            </NavLink>
            <NavLink
              to="/hr/attendance"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title="Attendance"
            >
              <CalendarCheck className="nav-icon" />
              {!isCollapsed && <span className="nav-label">Attendance</span>}
            </NavLink>
            <NavLink
              to="/hr/leaves"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title="Leave Management"
            >
              <CalendarDays className="nav-icon" />
              {!isCollapsed && <span className="nav-label">Leave Requests</span>}
            </NavLink>
            <NavLink
              to="/hr/payroll"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title="Payroll"
            >
              <DollarSign className="nav-icon" />
              {!isCollapsed && <span className="nav-label">Payroll</span>}
            </NavLink>
          </>
        )}

        {/* Projects */}
        <NavLink
          to="/projects"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          title="Projects & Tasks"
        >
          <Briefcase className="nav-icon" />
          {!isCollapsed && <span className="nav-label">Projects</span>}
        </NavLink>

        {/* Reports */}
        <NavLink
          to="/reports"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          title="Business Reports"
        >
          <BarChart3 className="nav-icon" />
          {!isCollapsed && <span className="nav-label">Reports</span>}
        </NavLink>

        {/* Administration */}
        {!isCollapsed && <div className="nav-section-title">Administration</div>}
        <NavLink
          to="/settings"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          title="Settings & Users"
        >
          <Settings className="nav-icon" />
          {!isCollapsed && <span className="nav-label">Settings</span>}
        </NavLink>
        <NavLink
          to="/audit"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          title="Audit Logs"
        >
          <ShieldAlert className="nav-icon" />
          {!isCollapsed && <span className="nav-label">Audit Logs</span>}
        </NavLink>
      </nav>

      {/* Sidebar Footer */}
      {!isCollapsed && (
        <div className="sidebar-footer">
          <div className="sidebar-status-indicator">
            <span className="status-dot-live"></span>
            <span>MySQL Production v8.0</span>
          </div>
          <span style={{ fontSize: '10.5px', color: '#64748b' }}>UAE AED</span>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
