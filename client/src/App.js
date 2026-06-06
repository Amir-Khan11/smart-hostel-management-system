import React, { useState } from 'react';
import Dashboard  from './pages/Dashboard';
import Students   from './pages/Students';
import Rooms      from './pages/Rooms';
import Fees       from './pages/Fees';
import Complaints from './pages/Complaints';
import Visitors   from './pages/Visitors';

const NAV = [
  { key: 'dashboard',  label: 'Dashboard',  icon: '⊞' },
  { key: 'students',   label: 'Students',   icon: '👥' },
  { key: 'rooms',      label: 'Rooms',      icon: '🚪' },
  { key: 'fees',       label: 'Fees',       icon: '💳' },
  { key: 'complaints', label: 'Complaints', icon: '📋' },
  { key: 'visitors',   label: 'Visitors',   icon: '🪪' },
];

const PAGE_TITLES = {
  dashboard: 'Dashboard', students: 'Student Management',
  rooms: 'Room Management', fees: 'Fee Payments',
  complaints: 'Complaints', visitors: 'Visitor Records',
};

const PAGES = {
  dashboard:  Dashboard,
  students:   Students,
  rooms:      Rooms,
  fees:       Fees,
  complaints: Complaints,
  visitors:   Visitors,
};

export default function App() {
  const [page, setPage] = useState('dashboard');
  const ActivePage = PAGES[page];

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>🏠 HostelHub</h2>
          <p>Smart Hostel Management</p>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(n => (
            <div key={n.key} className={`nav-item${page === n.key ? ' active' : ''}`} onClick={() => setPage(n.key)}>
              <span className="nav-icon">{n.icon}</span>
              {n.label}
            </div>
          ))}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
          v1.0.0 · MySQL
        </div>
      </aside>
      <div className="main">
        <div className="topbar">
          <h1>{PAGE_TITLES[page]}</h1>
          <span style={{ fontSize: 13, color: '#6b7280' }}>{new Date().toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <div className="page"><ActivePage /></div>
      </div>
    </div>
  );
}
