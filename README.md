# NEXORA Enterprise ERP System

**NEXORA Enterprise ERP** is a full-stack, mission-critical enterprise resource planning web application designed for corporate operations across the United Arab Emirates and the GCC. Built on clean layered architecture, relational database integrity, and a restrained "Quiet Enterprise" user interface.

---

## 🏛 Architecture & Technology Stack

### Frontend
- **Framework**: React 18 (Pure JavaScript: `.js` / `.jsx` only — **Zero TypeScript / TSX**)
- **Routing**: React Router DOM v6
- **State & Communication**: Context API (`AuthContext`, `ToastContext`), Axios with JWT bearer interceptors
- **Styling**: Vanilla CSS Design System with CSS Custom Properties (Theme tokens, light/dark modes, high-density layouts, zero AI decorative tropes)
- **Visuals**: Chart.js / `react-chartjs-2` for financial analytics, Lucide React enterprise iconography

### Backend
- **Platform**: Java 17, Spring Boot 3.2.5
- **Modules**: Spring MVC, Spring Data JPA, Hibernate ORM, Spring Security
- **Security**: Stateless JWT Token Provider, BCrypt password hashing, Granular Role-Based Access Control (RBAC)
- **Build Tool**: Apache Maven 3.9.6
- **Architecture**: Clean layered controller-service-repository pattern with typed DTOs and global exception handling

### Database
- **Engine**: MySQL 8.0 Community Server
- **Schema**: Fully normalized relational schema with foreign key constraints, indexes, and audit columns
- **Seed Data**: Realistic UAE enterprise operations (AED currency, 5% UAE VAT, TRN tax identifiers, multi-warehouse inventory, double-entry financial ledger)

---

## 🚀 Quick Start & Running the Application

### Option A: One-Click Windows Launcher
Simply double-click `start-erp.bat` in `c:\ERP`, or run it from the command line:
```cmd
c:\ERP\start-erp.bat
```
This automatically boots:
1. MySQL 8.0 on `localhost:3306`
2. Spring Boot on `http://localhost:8080`
3. React Frontend on `http://localhost:5173`
4. Automatically opens `http://localhost:5173` in your default browser.

### Option B: Manual Startup

#### 1. Start MySQL Server
```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --datadir="c:\ERP\mysql-data" --port=3306 --console
```

#### 2. Start Java Spring Boot Backend
```cmd
cd c:\ERP\backend
C:\Users\sajum\maven\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run
```
*Backend runs on `http://localhost:8080`.*

#### 3. Start Vite React Frontend
```cmd
cd c:\ERP\frontend
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🔑 Corporate Demo Accounts

The database comes pre-seeded with realistic corporate roles and users:

| Role | Name | Email / Username | Password | Access Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin / CTO** | Sajith Ahamed | `admin@nexora.ae` | `Admin@123` | Complete system access & settings |
| **Finance Manager** | Fatima Al-Mansoor | `finance@nexora.ae` | `Finance@123` | Invoices, expenses, P&L, payments |
| **Sales Director** | Rashid Al-Nuaimi | `sales@nexora.ae` | `Sales@123` | Orders, customers, sales reports |
| **Logistics Lead** | Tariq Hassan | `inventory@nexora.ae` | `Inventory@123` | Products, stock adjustments, warehouses |
| **HR Director** | Mariam Khalid | `hr@nexora.ae` | `Hr@123` | Employees, biometric logs, leave, payroll |

*(The login screen also features convenient single-click test account autofill buttons).*

---

## 📦 Complete Enterprise Modules

1. **Dashboard**:
   - Executive KPIs: Total Revenue, Total Orders, Inventory Valuation, Outstanding Payments.
   - Dynamic Revenue Area Chart, Order Status Donut Chart.
   - Recent transaction audit, low stock threshold warnings, active project milestones.

2. **Sales Management**:
   - **Customers**: GCC client directory with TRN tax registrations, credit limits, and billing terms.
   - **Sales Orders**: Multi-line item order builder with auto-computed 5% UAE VAT, stock deduction, and status transitions (`PENDING` → `CONFIRMED` → `SHIPPED` → `DELIVERED`).
   - **Invoices**: Tax invoice generation with UAE FTA-compliant layout, payment collection modal, and printable invoice viewer.

3. **Inventory & Warehouses**:
   - **Product Catalog**: SKU codes, reorder thresholds, supplier associations, unit cost vs sell price.
   - **Stock Movements**: Full immutable ledger of additions, deductions, and transfer audit records.
   - **Warehouses**: Multi-location inventory tracking across Dubai Industrial City, JAFZA, and Mussafah.

4. **Procurement & Vendors**:
   - **Suppliers**: Vendor database with payment terms, ratings, and lead times.

5. **Finance & Accounting**:
   - **Financial Summary**: Real-time revenue vs operating expenses, net profit, and expense breakdowns.
   - **Expense Ledger**: Operating expenses tracking with categorized receipts and management approval workflows.

6. **Human Capital Management (HR)**:
   - **Employees**: Directory with departmental assignments, designation, contact information, and WPS salary baselines.
   - **Attendance**: Biometric check-in/out logging with status tracking (`PRESENT`, `LATE`, `REMOTE`, `ABSENT`).
   - **Leaves**: Leave application and manager approval/rejection pipeline.
   - **Payroll**: UAE Wages Protection System (WPS) compliant monthly payroll batch run with allowances and deductions.

7. **Project Management**:
   - **Projects**: Active commercial deliverables with budget tracking, client linkages, and auto-computed task progress percentages.
   - **Tasks**: Milestone and task execution tracking with priority and status controls.

8. **Business Intelligence & Reports**:
   - Comprehensive analytical reports with date filters, KPI aggregates, CSV export, and print capabilities:
     - Sales Performance Ledger
     - Inventory Valuation & Reorder Report
     - Profit & Loss Statement
     - Personnel & Payroll Summary

9. **Administration & Security**:
   - **Company Settings**: Corporate identity, legal TRN, base currency, and fiscal configurations.
   - **User Management & RBAC**: Granular user account and role assignment controls.
   - **Audit Trail**: Non-repudiation security audit log tracking user ID, IP address, module, and timestamp.
