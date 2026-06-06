import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => { api.get('/dashboard').then(r => setData(r.data)).catch(() => {}); }, []);

  if (!data) return <div className="loading">Loading dashboard...</div>;

  const { students, rooms, fees, complaints, visitors } = data;
  const feeTotal = (Number(fees.collected) || 0) + (Number(fees.pending_count) > 0 ? Number(fees.collected) * 0.38 : 0);
  const occupancy = rooms.total ? Math.round((rooms.occupied / rooms.total) * 100) : 0;

  return (
    <div>
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">👥 Total Students</div>
          <div className="metric-value">{students.total}</div>
          <div className="metric-sub">{students.active} active · {students.pending} pending</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">🚪 Room Occupancy</div>
          <div className="metric-value">{occupancy}%</div>
          <div className="metric-sub">{rooms.available} available · {rooms.maintenance} maintenance</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">💳 Fees Collected</div>
          <div className="metric-value">PKR {Number(fees.collected || 0).toLocaleString()}</div>
          <div className="metric-sub">{fees.pending_count} payments pending/overdue</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">📋 Complaints</div>
          <div className="metric-value">{complaints.open_count}</div>
          <div className="metric-sub">{complaints.in_progress} in progress · {complaints.resolved} resolved</div>
        </div>
      </div>

      <div className="grid2">
        <div className="card">
          <div className="card-title">System Overview</div>
          {[
            { label: 'Total Rooms', value: rooms.total, color: '#2563eb' },
            { label: 'Occupied Rooms', value: rooms.occupied, color: '#059669' },
            { label: 'Available Rooms', value: rooms.available, color: '#d97706' },
            { label: 'Under Maintenance', value: rooms.maintenance, color: '#dc2626' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: 13, color: '#6b7280' }}>{item.label}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: item.color }}>{item.value}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">Complaint Status</div>
          {[
            { label: 'Open',        value: complaints.open_count,   color: '#dc2626' },
            { label: 'In Progress', value: complaints.in_progress,  color: '#d97706' },
            { label: 'Resolved',    value: complaints.resolved,     color: '#059669' },
            { label: 'Visitors Today', value: visitors.today,       color: '#2563eb' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: 13, color: '#6b7280' }}>{item.label}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: item.color }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
