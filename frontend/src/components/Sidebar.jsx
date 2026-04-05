import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const icons = {
  dashboard: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="nav-icon">
      <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
      <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
    </svg>
  ),
  customer: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="nav-icon">
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
    </svg>
  ),
  items: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="nav-icon">
      <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
    </svg>
  ),
  billing: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="nav-icon">
      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
  ),
};

export default function Sidebar() {
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">
          <div className="brand-icon">L</div>
          <div>
            <div className="brand-name">LogiEdge</div>
            <div className="brand-sub">Billing Suite</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Overview</div>
        <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          {icons.dashboard}
          Dashboard
        </NavLink>

        <div className="nav-section-label">Master Data</div>
        <NavLink to="/master/customers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          {icons.customer}
          Customers
        </NavLink>
        <NavLink to="/master/items" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          {icons.items}
          Items
        </NavLink>

        <div className="nav-section-label">Operations</div>
        <NavLink to="/billing" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          {icons.billing}
          New Invoice
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>v1.0.0 · LogiEdge Systems</div>
      </div>
    </aside>
  );
}
