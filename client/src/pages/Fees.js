import React, { useEffect, useState } from 'react';
import api from '../api';

const STATUS_BADGE = { paid:'badge-green', pending:'badge-amber', overdue:'badge-red' };
const MONTHS = ['January 2026','February 2026','March 2026','April 2026','May 2026','June 2026'];

export default function Fees() {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ student_id:'', amount:'', month:'', payment_date:'', method:'cash', status:'paid', notes:'' });
  const [filter, setFilter] = useState('all');

  const load = () => {
    api.get('/fees').then(r => setFees(r.data));
    api.get('/fees/summary').then(r => setSummary(r.data));
    api.get('/students').then(r => setStudents(r.data.filter(s => s.status==='active')));
  };
  useEffect(load, []);

  const save = async () => { await api.post('/fees', form); setModal(false); load(); };
  const markPaid = async (id) => { await api.put(`/fees/${id}`, { status:'paid', method:'cash', payment_date:new Date().toISOString().split('T')[0] }); load(); };

  const filtered = filter==='all' ? fees : fees.filter(f => f.status===filter);

  return (
    <div>
      {summary && (
        <div className="metrics-grid" style={{ gridTemplateColumns:'repeat(3,1fr)',marginBottom:20 }}>
          <div className="metric-card"><div className="metric-label">✅ Collected</div><div className="metric-value" style={{ color:'#059669' }}>PKR {Number(summary.totals.collected||0).toLocaleString()}</div></div>
          <div className="metric-card"><div className="metric-label">⏳ Pending</div><div className="metric-value" style={{ color:'#d97706' }}>PKR {Number(summary.totals.pending||0).toLocaleString()}</div></div>
          <div className="metric-card"><div className="metric-label">🔴 Overdue</div><div className="metric-value" style={{ color:'#dc2626' }}>PKR {Number(summary.totals.overdue||0).toLocaleString()}</div></div>
        </div>
      )}
      <div className="action-bar">
        <div style={{ display:'flex',gap:8 }}>
          {['all','paid','pending','overdue'].map(f => (
            <button key={f} className={`btn btn-sm ${filter===f?'btn-primary':'btn-ghost'}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase()+f.slice(1)}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Record Payment</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Receipt</th><th>Student</th><th>Room</th><th>Month</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
            <tbody>
              {filtered.length===0 && <tr><td colSpan={9} className="empty">No records found</td></tr>}
              {filtered.map(f => (
                <tr key={f._id||f.id}>
                  <td style={{ fontSize:11,color:'#9ca3af' }}>{f.receipt_no||'—'}</td>
                  <td><div style={{ fontWeight:500 }}>{f.full_name}</div><div style={{ fontSize:11,color:'#9ca3af' }}>{f.student_id}</div></td>
                  <td>{f.room_number||'—'}</td>
                  <td>{f.month}</td>
                  <td style={{ fontWeight:600 }}>PKR {Number(f.amount).toLocaleString()}</td>
                  <td style={{ textTransform:'capitalize' }}>{f.method?.replace('_',' ')||'—'}</td>
                  <td><span className={`badge ${STATUS_BADGE[f.status]}`}>{f.status}</span></td>
                  <td style={{ fontSize:12,color:'#6b7280' }}>{f.payment_date ? new Date(f.payment_date).toLocaleDateString() : '—'}</td>
                  <td>{f.status!=='paid' && <button className="btn btn-success btn-sm" onClick={() => markPaid(f._id||f.id)}>Mark Paid</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={e => e.target===e.currentTarget && setModal(false)}>
          <div className="modal">
            <h2>Record Fee Payment</h2>
            <div className="form-grid">
              <div className="form-group full"><label>Student</label>
                <select value={form.student_id} onChange={e=>setForm({...form,student_id:e.target.value})}>
                  <option value="">-- Select student --</option>
                  {students.map(s => <option key={s._id||s.id} value={s._id||s.id}>{s.full_name} ({s.student_id})</option>)}
                </select>
              </div>
              <div className="form-group"><label>Month</label>
                <select value={form.month} onChange={e=>setForm({...form,month:e.target.value})}>
                  <option value="">-- Select month --</option>
                  {MONTHS.map(m=><option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Amount (PKR)</label><input type="number" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/></div>
              <div className="form-group"><label>Payment Date</label><input type="date" value={form.payment_date} onChange={e=>setForm({...form,payment_date:e.target.value})}/></div>
              <div className="form-group"><label>Method</label>
                <select value={form.method} onChange={e=>setForm({...form,method:e.target.value})}>
                  <option value="cash">Cash</option><option value="bank_transfer">Bank Transfer</option><option value="online">Online</option>
                </select>
              </div>
              <div className="form-group"><label>Status</label>
                <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                  <option value="paid">Paid</option><option value="pending">Pending</option><option value="overdue">Overdue</option>
                </select>
              </div>
              <div className="form-group full"><label>Notes</label><textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
