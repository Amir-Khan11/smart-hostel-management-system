import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Visitors() {
  const [visitors, setVisitors] = useState([]);
  const [students, setStudents] = useState([]);
  const [modal, setModal] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ visitor_name:'', cnic:'', phone:'', relation:'', student_id:'', check_in:'', purpose:'' });
  const [filter, setFilter] = useState('all');

  const load = () => {
    setError('');
    api.get('/visitors').then(r => setVisitors(r.data)).catch(e => setError(e.response?.data?.error || 'Cannot connect to server. Is the backend running on port 5000?'));
    api.get('/students').then(r => setStudents(r.data.filter(s => s.status==='active'))).catch(() => {});
  };
  useEffect(load, []);

  const save = async () => {
    const check_in = form.check_in || new Date().toISOString().slice(0,16);
    await api.post('/visitors', {...form, check_in});
    setModal(false);
    setForm({ visitor_name:'', cnic:'', phone:'', relation:'', student_id:'', check_in:'', purpose:'' });
    load();
  };

  const checkout = async (id) => { await api.put(`/visitors/${id}/checkout`); load(); };
  const filtered = filter==='all' ? visitors : filter==='inside' ? visitors.filter(v => !v.check_out) : visitors.filter(v => v.check_out);
  const fmt = dt => dt ? new Date(dt).toLocaleString('en-PK', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';

  return (
    <div>
      {error && (
        <div style={{ background:'#fee2e2',border:'1px solid #fca5a5',borderRadius:10,padding:'14px 18px',marginBottom:16,color:'#991b1b',fontSize:13 }}>
          <strong>⚠ API Error:</strong> {error}
          <div style={{ marginTop:6,fontSize:12,color:'#7f1d1d' }}>
            1. Make sure MongoDB is running: <code>mongod</code><br/>
            2. Run seed: <code>cd server && node seed.js</code><br/>
            3. Restart backend: <code>npm run dev</code>
          </div>
        </div>
      )}
      <div className="action-bar">
        <div style={{ display:'flex',gap:8 }}>
          {[['all','All'],['inside','Currently Inside'],['out','Checked Out']].map(([f,l]) => (
            <button key={f} className={`btn btn-sm ${filter===f?'btn-primary':'btn-ghost'}`} onClick={() => setFilter(f)}>{l}</button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Log Visitor</button>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Visitor</th><th>CNIC</th><th>Phone</th><th>Relation</th><th>Visiting</th><th>Room</th><th>Check In</th><th>Check Out</th><th>Action</th></tr></thead>
            <tbody>
              {filtered.length===0 && <tr><td colSpan={9} className="empty">No visitor records found</td></tr>}
              {filtered.map(v => (
                <tr key={v._id||v.id}>
                  <td style={{ fontWeight:500 }}>{v.visitor_name}</td>
                  <td style={{ fontSize:12,color:'#6b7280' }}>{v.cnic||'—'}</td>
                  <td style={{ fontSize:12 }}>{v.phone||'—'}</td>
                  <td>{v.relation||'—'}</td>
                  <td><div style={{ fontWeight:500 }}>{v.student_name}</div>{v.purpose && <div style={{ fontSize:11,color:'#9ca3af' }}>{v.purpose.slice(0,40)}</div>}</td>
                  <td>{v.room_number ? <span className="badge badge-blue">{v.room_number}</span> : '—'}</td>
                  <td style={{ fontSize:12,color:'#6b7280' }}>{fmt(v.check_in)}</td>
                  <td>{v.check_out ? <span style={{ fontSize:12,color:'#6b7280' }}>{fmt(v.check_out)}</span> : <span className="badge badge-green">Inside</span>}</td>
                  <td>{!v.check_out && <button className="btn btn-ghost btn-sm" onClick={() => checkout(v._id||v.id)}>Check Out</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {modal && (
        <div className="modal-backdrop" onClick={e => e.target===e.currentTarget && setModal(false)}>
          <div className="modal">
            <h2>Log New Visitor</h2>
            <div className="form-grid">
              <div className="form-group"><label>Visitor Name</label><input value={form.visitor_name} onChange={e=>setForm({...form,visitor_name:e.target.value})}/></div>
              <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div>
              <div className="form-group"><label>CNIC</label><input value={form.cnic} onChange={e=>setForm({...form,cnic:e.target.value})}/></div>
              <div className="form-group"><label>Relation to Student</label><input value={form.relation} onChange={e=>setForm({...form,relation:e.target.value})}/></div>
              <div className="form-group full"><label>Visiting Student</label>
                <select value={form.student_id} onChange={e=>setForm({...form,student_id:e.target.value})}>
                  <option value="">-- Select student --</option>
                  {students.map(s => <option key={s._id||s.id} value={s._id||s.id}>{s.full_name} — Room {s.room_number||'N/A'}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Check-in Time</label><input type="datetime-local" value={form.check_in} onChange={e=>setForm({...form,check_in:e.target.value})}/></div>
              <div className="form-group full"><label>Purpose of Visit</label><input value={form.purpose} onChange={e=>setForm({...form,purpose:e.target.value})}/></div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>Log Visitor</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
