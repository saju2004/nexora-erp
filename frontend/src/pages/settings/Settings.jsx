import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Building, ShieldCheck, Users, Lock, Plus, Save } from 'lucide-react';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const SettingsPage = () => {
  const { showToast } = useToast();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('company');
  const [settingsList, setSettingsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Company Settings Form State
  const [companyForm, setCompanyForm] = useState({
    company_name: 'NEXORA Enterprise Solutions LLC',
    trn_number: '100348291000003',
    default_currency: 'AED',
    vat_rate: '5%',
    official_email: 'contact@nexora.ae',
    official_phone: '+971 4 800 6396',
    headquarters: 'Level 28, Al Saada Tower, Business Bay, Dubai, UAE',
  });

  // Password Change Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Create User Modal State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [userForm, setUserForm] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    department: 'Sales & Commercial',
    designation: '',
    role: 'ROLE_EMPLOYEE',
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [sRes, uRes, rRes] = await Promise.all([
        api.get('/settings'),
        api.get('/settings/users'),
        api.get('/settings/roles'),
      ]);

      if (sRes.success && sRes.data) {
        setSettingsList(sRes.data);
        const map = {};
        sRes.data.forEach((s) => {
          map[s.key] = s.value;
        });
        setCompanyForm((prev) => ({ ...prev, ...map }));
      }
      if (uRes.success && uRes.data) setUsersList(uRes.data);
      if (rRes.success && rRes.data) setRolesList(rRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveCompanySettings = async (e) => {
    e.preventDefault();
    try {
      await api.post('/settings', companyForm);
      showToast('Corporate configuration settings saved', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/settings/users?role=${userForm.role}`, {
        fullName: userForm.fullName,
        username: userForm.username,
        email: userForm.email,
        password: userForm.password,
        department: userForm.department,
        designation: userForm.designation,
      });

      showToast('User account provisioned with assigned role', 'success');
      setIsAddUserOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const next = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.put(`/settings/users/${userId}/status`, { status: next });
      showToast(`User account status updated to ${next}`, 'success');
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    try {
      await api.post('/auth/change-password', { oldPassword, newPassword });
      showToast('Password updated successfully', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const userColumns = [
    {
      key: 'fullName',
      title: 'Full Name',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{val}</div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{row.email}</div>
        </div>
      ),
    },
    {
      key: 'username',
      title: 'User Login ID',
      render: (val) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{val}</span>,
    },
    {
      key: 'department',
      title: 'Department & Role',
      render: (val, row) => (
        <div>
          <div>{val}</div>
          <div style={{ fontSize: '11px', color: 'var(--color-accent)' }}>
            {row.roles?.map((r) => r.name.replace('ROLE_', '')).join(', ')}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Account State',
      width: '120px',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'actions',
      title: 'Access Control',
      width: '120px',
      render: (_, row) => (
        <button
          className="btn btn-secondary btn-sm"
          style={{
            height: '24px',
            fontSize: '11px',
            padding: '0 8px',
            color: row.status === 'ACTIVE' ? 'var(--status-danger-text)' : 'var(--status-success-text)',
          }}
          onClick={() => handleToggleUserStatus(row.id, row.status)}
        >
          {row.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>System Configuration & Administration</h1>
          <p>Entity profile, corporate tax settings, role-based authorization, and account security.</p>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--color-border)',
          marginBottom: '20px',
        }}
      >
        <button
          onClick={() => setActiveTab('company')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'company' ? '2px solid #2563eb' : '2px solid transparent',
            color: activeTab === 'company' ? 'var(--color-text-main)' : 'var(--color-text-muted)',
            fontWeight: activeTab === 'company' ? 600 : 500,
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          <Building size={14} color={activeTab === 'company' ? '#2563eb' : 'currentColor'} />
          Company Profile & Tax
        </button>

        <button
          onClick={() => setActiveTab('users')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'users' ? '2px solid #2563eb' : '2px solid transparent',
            color: activeTab === 'users' ? 'var(--color-text-main)' : 'var(--color-text-muted)',
            fontWeight: activeTab === 'users' ? 600 : 500,
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          <Users size={14} color={activeTab === 'users' ? '#2563eb' : 'currentColor'} />
          Users & RBAC Roles ({usersList.length})
        </button>

        <button
          onClick={() => setActiveTab('security')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'security' ? '2px solid #2563eb' : '2px solid transparent',
            color: activeTab === 'security' ? 'var(--color-text-main)' : 'var(--color-text-muted)',
            fontWeight: activeTab === 'security' ? 600 : 500,
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          <Lock size={14} color={activeTab === 'security' ? '#2563eb' : 'currentColor'} />
          Security & Password
        </button>
      </div>

      {/* Tab 1: Company Profile Form */}
      {activeTab === 'company' && (
        <div className="card" style={{ maxWidth: '800px' }}>
          <div className="card-header">
            <div>
              <div className="card-title">Corporate Organization Parameters</div>
              <div className="card-subtitle">Values reflected on all generated invoices and reports</div>
            </div>
          </div>
          <div className="card-body">
            <form onSubmit={handleSaveCompanySettings}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label form-label-required">Registered Legal Entity Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={companyForm.company_name}
                    onChange={(e) => setCompanyForm({ ...companyForm, company_name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label form-label-required">Federal Tax Registration Number (TRN)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={companyForm.trn_number}
                    onChange={(e) => setCompanyForm({ ...companyForm, trn_number: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Base Operating Currency</label>
                  <input
                    type="text"
                    className="form-input"
                    value={companyForm.default_currency}
                    onChange={(e) => setCompanyForm({ ...companyForm, default_currency: e.target.value })}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Standard UAE VAT Rate</label>
                  <input
                    type="text"
                    className="form-input"
                    value={companyForm.vat_rate}
                    onChange={(e) => setCompanyForm({ ...companyForm, vat_rate: e.target.value })}
                    disabled
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Official Support / Billing Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={companyForm.official_email}
                    onChange={(e) => setCompanyForm({ ...companyForm, official_email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Hotline Phone</label>
                  <input
                    type="text"
                    className="form-input"
                    value={companyForm.official_phone}
                    onChange={(e) => setCompanyForm({ ...companyForm, official_phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Corporate Headquarters Address</label>
                <input
                  type="text"
                  className="form-input"
                  value={companyForm.headquarters}
                  onChange={(e) => setCompanyForm({ ...companyForm, headquarters: e.target.value })}
                />
              </div>

              <div style={{ marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary">
                  <Save size={14} /> Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: Users & RBAC */}
      {activeTab === 'users' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
            <button className="btn btn-primary btn-sm" onClick={() => setIsAddUserOpen(true)}>
              <Plus size={14} /> Provision New User
            </button>
          </div>

          <DataTable
            columns={userColumns}
            data={usersList}
            isLoading={isLoading}
            selectable={false}
            emptyTitle="No users found"
            exportFileName="users-rbac-directory"
          />

          {/* Add User Modal */}
          <Modal
            isOpen={isAddUserOpen}
            onClose={() => setIsAddUserOpen(false)}
            title="Provision Enterprise User Account"
            size="lg"
            footer={
              <>
                <button className="btn btn-secondary" onClick={() => setIsAddUserOpen(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleCreateUser}>
                  Create User
                </button>
              </>
            }
          >
            <form onSubmit={handleCreateUser}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label form-label-required">Full Legal Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={userForm.fullName}
                    onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                    placeholder="e.g. Sultan Al-Qasimi"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label form-label-required">Login Username</label>
                  <input
                    type="text"
                    className="form-input"
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                    placeholder="e.g. sqasimi"
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label form-label-required">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    placeholder="name@nexora.ae"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label form-label-required">Initial Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label form-label-required">Department</label>
                  <select
                    className="form-select"
                    value={userForm.department}
                    onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                  >
                    <option value="Executive Management">Executive Management</option>
                    <option value="Finance & Accounts">Finance & Accounts</option>
                    <option value="Sales & Commercial">Sales & Commercial</option>
                    <option value="Supply Chain">Supply Chain</option>
                    <option value="IT & Engineering">IT & Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Job Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={userForm.designation}
                    onChange={(e) => setUserForm({ ...userForm, designation: e.target.value })}
                    placeholder="Designation"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label form-label-required">Assigned Security Role</label>
                  <select
                    className="form-select"
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  >
                    {rolesList.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name.replace('ROLE_', '')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </form>
          </Modal>
        </div>
      )}

      {/* Tab 3: Security & Password */}
      {activeTab === 'security' && (
        <div className="card" style={{ maxWidth: '600px' }}>
          <div className="card-header">
            <div>
              <div className="card-title">Corporate Password Policy</div>
              <div className="card-subtitle">Encrypted via BCrypt SHA-256 standard</div>
            </div>
          </div>
          <div className="card-body">
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label className="form-label form-label-required">Current Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">New Corporate Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
