import React, { useEffect, useState } from 'react';
import api from '../api';

const EMPTY = { student_id:'', full_name:'', email:'', phone:'', department:'', cnic:'', guardian_name:'', guardian_phone:'', joined_date:'' };

export default function Students() {
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [assignModal, setAssignModal] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    setError('');
    api.get('/students').then(r => setStudents(r.data)).catch(e => setError(e.response?.data?.error || 'Cannot connect to server'));
    api.get('/rooms/available').then(r => setRooms(r.data)).catch(() => {});
  };
  useEffect(load, []);

  const save = async () => {
    try {
      if (editing) await api.put(`/students/${editing}`, { ...form, status: form.status || 'pending' });
      else await api.post('/students', form);
      setModal(false); setForm(EMPTY); setEditing(null); load();
    } catch(e) { alert(e.response?.data?.error || 'Error saving student'); }
  };

  const remove = async (id) => { if (window.confirm('Delete this student?')) { await api.delete(`/students/${id}`); load(); } };
  const startEdit = (s) => { setForm(s); setEditing(s._id || s.id); setModal(true); };
  const assignRoom = async () => {
    try {
      await api.put(`/students/${assignModal._id || assignModal.id}/assign-room`, { room_id: roomId });
      setAssignModal(null); load();
    } catch(e) { alert(e.response?.data?.error || 'Error assigning room'); }
  };

  const filtered = students.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.student_id.toLowerCase().includes(search.toLowerCase()) ||
    (s.department || '').toLowerCase().includes(search.toLowerCase())
  );
  const statusBadge = s => s === 'active' ? 'badge-green' : s === 'pending' ? 'badge-amber' : 'badge-gray';

  return (
    <div>
      {error && <div style={{ background:'#fee2e2',border:'1px solid #fca5a5',borderRadius:10,padding:'12px 16px',marginBottom:16,color:'#991b1b',fontSize:13 }}>⚠ {error} — Make sure MongoDB is running and backend is on port 5000.</div>}
      <div className="action-bar">
        <input placeholder="🔍 Search by name, ID, department..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 300 }} />
        <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setEditing(null); setModal(true); }}>+ Register Student</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Student ID</th><th>Name</th><th>Department</th><th>Room</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={7} className="empty">No students found</td></tr>}
              {filtered.map(s => (
                <tr key={s._id || s.id}>
                  <td><strong>{s.student_id}</strong></td>
                  <td><div style={{ fontWeight:500 }}>{s.full_name}</div><div style={{ fontSize:11,color:'#9ca3af' }}>{s.email}</div></td>
                  <td>{s.department || '—'}</td>
                  <td>{s.room_number ? <span className="badge badge-blue">{s.room_number}</span> : <span style={{ color:'#d1d5db' }}>Unassigned</span>}</td>
                  <td><span className={`badge ${statusBadge(s.status)}`}>{s.status}</span></td>
                  <td style={{ fontSize:12,color:'#6b7280' }}>{s.joined_date ? new Date(s.joined_date).toLocaleDateString() : '—'}</td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      {!s.room_number && <button className="btn btn-success btn-sm" onClick={() => { setAssignModal(s); setRoomId(''); }}>Assign Room</button>}
                      <button className="btn btn-ghost btn-sm" onClick={() => startEdit(s)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => remove(s._id || s.id)}>Del</button>
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
            <h2>{editing ? 'Edit Student' : 'Register New Student'}</h2>
            <div className="form-grid">
              {[['student_id','Student ID'],['full_name','Full Name'],['email','Email'],['phone','Phone'],['department','Department'],['cnic','CNIC'],['guardian_name','Guardian Name'],['guardian_phone','Guardian Phone']].map(([k,l]) => (
                <div className="form-group" key={k}><label>{l}</label><input value={form[k]||''} onChange={e => setForm({...form,[k]:e.target.value})} /></div>
              ))}
              <div className="form-group"><label>Joined Date</label><input type="date" value={form.joined_date||''} onChange={e => setForm({...form,joined_date:e.target.value})} /></div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>Save</button>
            </div>
          </div>
        </div>
      )}

      {assignModal && (
        <div className="modal-backdrop" onClick={e => e.target===e.currentTarget && setAssignModal(null)}>
          <div className="modal" style={{ width:400 }}>
            <h2>Assign Room — {assignModal.full_name}</h2>
            <div className="form-group">
              <label>Select Available Room</label>
              <select value={roomId} onChange={e => setRoomId(e.target.value)}>
                <option value="">-- Choose room --</option>
                {rooms.map(r => <option key={r._id||r.id} value={r._id||r.id}>Room {r.room_number} · Block {r.block} · PKR {r.monthly_fee}/mo · {r.capacity - r.occupants} spot(s) left</option>)}
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setAssignModal(null)}>Cancel</button>
              <button className="btn btn-success" onClick={assignRoom} disabled={!roomId}>Assign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
