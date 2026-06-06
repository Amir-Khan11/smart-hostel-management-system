import React, { useEffect, useState } from 'react';
import api from '../api';

const STATUS_BADGE  = { open:'badge-red', in_progress:'badge-amber', resolved:'badge-green', closed:'badge-gray' };
const PRIORITY_BADGE = { high:'badge-red', medium:'badge-amber', low:'badge-blue' };

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [students, setStudents] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ student_id:'', category:'electrical', title:'', description:'', priority:'medium' });
  const [filter, setFilter] = useState('all');

  const load = () => {
    api.get('/complaints').then(r => setComplaints(r.data));
    api.get('/students').then(r => setStudents(r.data.filter(s => s.status==='active')));
  };
  useEffect(load, []);

  const save = async () => { await api.post('/complaints', form); setModal(false); load(); };
  const updateStatus = async (id, status) => { await api.put(`/complaints/${id}/status`, { status }); load(); };
  const remove = async (id) => { if (window.confirm('Delete complaint?')) { await api.delete(`/complaints/${id}`); load(); }};

  const filtered = filter==='all' ? complaints : complaints.filter(c => c.status===filter);
  const nextStatus = { open:'in_progress', in_progress:'resolved', resolved:'closed' };

  return (
    <div>
      <div className="action-bar">
        <div style={{ display:'flex',gap:8 }}>
          {['all','open','in_progress','resolved','closed'].map(f => (
            <button key={f} className={`btn btn-sm ${filter===f?'btn-primary':'btn-ghost'}`} onClick={() => setFilter(f)}>
              {f.replace('_',' ').replace(/\b\w/g,l=>l.toUpperCase())}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ New Complaint</button>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Student</th><th>Room</th><th>Category</th><th>Title</th><th>Priority</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length===0 && <tr><td colSpan={8} className="empty">No complaints found</td></tr>}
              {filtered.map(c => (
                <tr key={c._id||c.id}>
                  <td><div style={{ fontWeight:500 }}>{c.full_name}</div><div style={{ fontSize:11,color:'#9ca3af' }}>{c.student_id}</div></td>
                  <td>{c.room_number||'—'}</td>
                  <td style={{ textTransform:'capitalize' }}>{c.category}</td>
                  <td><div style={{ fontWeight:500 }}>{c.title}</div>{c.description && <div style={{ fontSize:11,color:'#9ca3af' }}>{c.description.slice(0,60)}{c.description.length>60?'...':''}</div>}</td>
                  <td><span className={`badge ${PRIORITY_BADGE[c.priority]}`}>{c.priority}</span></td>
                  <td><span className={`badge ${STATUS_BADGE[c.status]}`}>{c.status.replace('_',' ')}</span></td>
                  <td style={{ fontSize:12,color:'#6b7280' }}>{new Date(c.createdAt||c.created_at).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display:'flex',gap:6 }}>
                      {nextStatus[c.status] && <button className="btn btn-success btn-sm" onClick={() => updateStatus(c._id||c.id, nextStatus[c.status])}>→ {nextStatus[c.status].replace('_',' ')}</button>}
                      <button className="btn btn-danger btn-sm" onClick={() => remove(c._id||c.id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {modal && (
        <div className="modal-backdrop" onClick={e => e.target===e.currentTarget && setModal(false)}>
          <div className="modal">
            <h2>Submit Complaint</h2>
            <div className="form-grid">
              <div className="form-group full"><label>Student</label>
                <select value={form.student_id} onChange={e=>setForm({...form,student_id:e.target.value})}>
                  <option value="">-- Select student --</option>
                  {students.map(s => <option key={s._id||s.id} value={s._id||s.id}>{s.full_name} — Room {s.room_number||'N/A'}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Category</label>
                <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                  {['electrical','plumbing','furniture','wifi','cleanliness','security','other'].map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Priority</label>
                <select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                </select>
              </div>
              <div className="form-group full"><label>Title</label><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></div>
              <div className="form-group full"><label>Description</label><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
