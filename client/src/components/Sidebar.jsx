// Sidebar navigation matching LNMIIT portal exactly
import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) return null;

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <aside className="main-sidebar">
      {/* Brand Logo */}
      <div className="brand-link">
        <img 
          src="https://lnmiit.ac.in/wp-content/uploads/2023/07/cropped-LNMIIT-Logo-Transperant-Background-e1699342125845.png" 
          alt="LNMIIT" 
          className="brand-image"
        />
        <div className="brand-title">
          The LNM Institute of<br/>Information Technology
        </div>
      </div>

      {/* User Panel */}
      <div className="user-panel">
        <div className="info">
          <p className="user-name">{user.name}</p>
          <p>Roll No: {user.collegeId || 'N/A'}</p>
          <p>Email: {user.email}</p>
          {user.role === 'student' && (
            <div style={{ marginTop: '8px', display: 'flex', gap: '5px', alignItems: 'center' }}>
              <span className={`badge ${user.level === 'Gold' ? 'bg-warning' : user.level === 'Silver' ? 'bg-secondary' : 'bg-danger'}`} style={user.level === 'Silver' ? {background: '#6c757d'} : {}}>
                {user.level || 'Bronze'}
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--active-pink)' }}>
                {user.points || 0} pts
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Menu */}
      <nav>
        <ul className="sidebar-menu">
          {user.role === 'admin' ? (
            <>
              <li>
                <Link to="/admin" className={isActive('/admin')}>
                  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect></svg>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/admin/users" className={isActive('/admin/users')}>
                  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  Manage Users
                </Link>
              </li>
              <li>
                <Link to="/admin/members" className={isActive('/admin/members')}>
                  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                  Manage Members
                </Link>
              </li>
              <li>
                <Link to="/admin/plans" className={isActive('/admin/plans')}>
                  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                  Manage Plans
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/" className={isActive('/')}>
                  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect></svg>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/buy" className={isActive('/buy')}>
                  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                  Buy Plan
                </Link>
              </li>
              <li>
                <Link to="/history" className={isActive('/history')}>
                  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  Membership History
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
