import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  User as UserIcon,
  Shield,
  LogOut,
  Settings,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const Header = ({ onToggleSidebar }) => {
  const { user, logout, isDarkMode, toggleDarkMode } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.success && res.data) {
        setNotifications(res.data);
        setUnreadCount(res.data.filter((n) => !n.read).length);
      }
    } catch (e) {
      console.error('Failed to load notifications', e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s poll
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error('Error marking notifications as read', e);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      try {
        await api.put(`/notifications/${notif.id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (e) {
        console.error(e);
      }
    }
    if (notif.targetUrl) {
      setIsNotifOpen(false);
      navigate(notif.targetUrl);
    }
  };

  // Generate breadcrumb from path
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment) => {
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
  });

  return (
    <header className="app-header">
      {/* Left: Sidebar Toggle & Breadcrumbs */}
      <div className="header-left">
        <button
          className="header-toggle-btn"
          onClick={onToggleSidebar}
          title="Toggle Navigation Sidebar"
          aria-label="Toggle Sidebar"
        >
          <Menu size={16} />
        </button>

        <div className="breadcrumb-trail">
          <span>Enterprise</span>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <span className="breadcrumb-separator">/</span>
              <span className={idx === breadcrumbs.length - 1 ? 'breadcrumb-active' : ''}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Right: Search, Dark Mode, Notifications, User Menu */}
      <div className="header-right">
        {/* Global Search */}
        <div className="header-search">
          <Search className="header-search-icon" />
          <input
            type="text"
            className="header-search-input"
            placeholder="Search orders, SKU, staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                navigate(`/inventory?search=${encodeURIComponent(searchQuery)}`);
              }
            }}
          />
        </div>

        {/* Dark Mode Toggle */}
        <button
          className="header-action-btn"
          onClick={toggleDarkMode}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Notifications Center */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            className="header-action-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsNotifOpen(!isNotifOpen);
              setIsUserMenuOpen(false);
            }}
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell size={15} />
            {unreadCount > 0 && <span className="badge-unread-count">{unreadCount}</span>}
          </button>

          {isNotifOpen && (
            <div
              className="dropdown-menu"
              style={{ width: '320px', padding: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  padding: '10px 14px',
                  borderBottom: '1px solid var(--color-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-accent)',
                      fontSize: '11.5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                  >
                    <Check size={12} />
                    Mark all as read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div
                    style={{
                      padding: '24px 16px',
                      textAlign: 'center',
                      fontSize: '12.5px',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    No notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      style={{
                        padding: '10px 14px',
                        borderBottom: '1px solid var(--color-border)',
                        cursor: 'pointer',
                        backgroundColor: n.read ? 'transparent' : 'var(--color-bg-subtle)',
                        transition: 'background-color 150ms',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '12.5px',
                          fontWeight: n.read ? 500 : 600,
                          color: 'var(--color-text-main)',
                          marginBottom: '2px',
                        }}
                      >
                        {n.title}
                      </div>
                      <div
                        style={{
                          fontSize: '11.5px',
                          color: 'var(--color-text-muted)',
                          lineHeight: 1.35,
                        }}
                      >
                        {n.message}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div style={{ position: 'relative' }} ref={userMenuRef}>
          <div
            className="user-profile-badge"
            onClick={(e) => {
              e.stopPropagation();
              setIsUserMenuOpen(!isUserMenuOpen);
              setIsNotifOpen(false);
            }}
          >
            <div className="user-avatar">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName || 'User'} />
              ) : (
                (user?.fullName?.charAt(0) || 'S')
              )}
            </div>
            <div className="user-meta">
              <span className="user-name">{user?.fullName || 'Sajith Ahamed'}</span>
              <span className="user-role-label">
                {user?.designation || 'Administrator'}
              </span>
            </div>
            <ChevronDown size={13} color="var(--color-text-muted)" />
          </div>

          {isUserMenuOpen && (
            <div className="dropdown-menu" style={{ minWidth: '210px' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)' }}>
                  {user?.fullName || 'Sajith Ahamed'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  {user?.email || 'admin@nexora.ae'}
                </div>
              </div>

              <button
                className="dropdown-item"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  navigate('/settings');
                }}
              >
                <UserIcon size={14} />
                <span>My Profile</span>
              </button>

              <button
                className="dropdown-item"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  navigate('/settings');
                }}
              >
                <Settings size={14} />
                <span>Account Settings</span>
              </button>

              <button
                className="dropdown-item"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  navigate('/audit');
                }}
              >
                <Shield size={14} />
                <span>Security & Audit</span>
              </button>

              <div className="dropdown-divider" />

              <button className="dropdown-item danger" onClick={logout}>
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
