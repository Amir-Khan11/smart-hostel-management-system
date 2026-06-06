import React, { useEffect, useState } from 'react';
import api from '../api';

const STATUS_COLOR = { available:'badge-green', occupied:'badge-blue', maintenance:'badge-amber' };
const BLOCKS = ['A','B','C'];

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [form, setForm] = useState({ room_number:'',block:'A',floor:1,capacity:2,monthly_fee:5000 });
  const [editForm, setEditForm] = useState({});
  const [filter, setFilter] = useState('all');

  const load = () => { api.get('/rooms').then(r => setRooms(r.data)).catch(e => console.error('Rooms error:', e)); };
  useEffect(load, []);

  const save = async () => { await api.post('/rooms', form); setModal(false); load(); };
  const saveEdit = async () => { await api.put(`/rooms/${editModal._id||editModal.id}`, editForm); setEditModal(null); load(); };

  const filtered = filter === 'all' ? rooms : rooms.filter(r => r.status === filter);
  const byBlock = block => filtered.filter(r => r.block === block);

  return (
    <div>
      <div className="action-bar">
        <div style={{ display:'flex',gap:8 }}>
          {['all','available','occupied','maintenance'].map(f => (
            <button key={f} className={`btn btn-sm ${filter===f?'btn-primary':'btn-ghost'}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase()+f.slice(1)}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Add Room</button>
      </div>

      {BLOCKS.map(block => {
        const bRooms = byBlock(block);
        if (!bRooms.length) return null;
        return (
          <div className="card" key={block} style={{ marginBottom:16 }}>
            <div className="card-title">Block {block}</div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:10 }}>
              {bRooms.map(r => (
                <div key={r._id||r.id}
                  onClick={() => { setEditModal(r); setEditForm({ status:r.status,monthly_fee:r.monthly_fee,capacity:r.capacity }); }}
                  style={{ border:`2px solid ${r.status==='available'?'#bbf7d0':r.status==='occupied'?'#bfdbfe':'#fde68a'}`,
                    borderRadius:10,padding:'10px 8px',cursor:'pointer',
                    background:r.status==='available'?'#f0fdf4':r.status==='occupied'?'#eff6ff':'#fffbeb',
                    textAlign:'center' }}>
                  <div style={{ fontWeight:600,fontSize:13 }}>{r.room_number}</div>
                  <div style={{ fontSize:11,color:'#6b7280',marginTop:2 }}>{r.occupants}/{r.capacity}</div>
                  <span className={`badge ${STATUS_COLOR[r.status]}`} style={{ marginTop:4,fontSize:10 }}>{r.status}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {modal && (
        <div className="modal-backdrop" onClick={e => e.target===e.currentTarget && setModal(false)}>
          <div className="modal" style={{ width:400 }}>
            <h2>Add New Room</h2>
            <div className="form-grid">
              <div className="form-group"><label>Room Number</label><input value={form.room_number} onChange={e=>setForm({...form,room_number:e.target.value})}/></div>
              <div className="form-group"><label>Block</label><select value={form.block} onChange={e=>setForm({...form,block:e.target.value})}>{BLOCKS.map(b=><option key={b}>{b}</option>)}</select></div>
              <div className="form-group"><label>Floor</label><input type="number" min="1" value={form.floor} onChange={e=>setForm({...form,floor:e.target.value})}/></div>
              <div className="form-group"><label>Capacity</label><input type="number" min="1" max="6" value={form.capacity} onChange={e=>setForm({...form,capacity:e.target.value})}/></div>
              <div className="form-group full"><label>Monthly Fee (PKR)</label><input type="number" value={form.monthly_fee} onChange={e=>setForm({...form,monthly_fee:e.target.value})}/></div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>Add Room</button>
            </div>
          </div>
        </div>
      )}

      {editModal && (
        <div className="modal-backdrop" onClick={e => e.target===e.currentTarget && setEditModal(null)}>
          <div className="modal" style={{ width:380 }}>
            <h2>Edit Room {editModal.room_number}</h2>
            <div className="form-grid">
              <div className="form-group"><label>Status</label>
                <select value={editForm.status} onChange={e=>setEditForm({...editForm,status:e.target.value})}>
                  <option value="available">Available</option><option value="occupied">Occupied</option><option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div className="form-group"><label>Capacity</label><input type="number" min="1" value={editForm.capacity} onChange={e=>setEditForm({...editForm,capacity:e.target.value})}/></div>
              <div className="form-group full"><label>Monthly Fee (PKR)</label><input type="number" value={editForm.monthly_fee} onChange={e=>setEditForm({...editForm,monthly_fee:e.target.value})}/></div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setEditModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveEdit}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
