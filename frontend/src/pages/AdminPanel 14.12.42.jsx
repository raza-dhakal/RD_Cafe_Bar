import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:8000/api';

export default function AdminPanel() {
  const { logout } = useAuth();
  const [tab, setTab] = useState('reviews');
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({});
  const [newItem, setNewItem] = useState({ emoji:'☕', name:'', description:'', price:'', category:'coffee' });
  const [showAdd, setShowAdd] = useState(false);
  const [msg, setMsg] = useState('');

  const token = localStorage.getItem('rdcafe_token');
  const headers = { 'Content-Type':'application/json', Authorization:`Bearer ${token}` };

  useEffect(() => {
    fetch(`${API}/admin/stats`, { headers }).then(r=>r.json()).then(d=>setStats(d.data||{})).catch(()=>{});
    fetch(`${API}/admin/users`, { headers }).then(r=>r.json()).then(d=>setUsers(d.data||[])).catch(()=>{});
    fetch(`${API}/orders/all`, { headers }).then(r=>r.json()).then(d=>setOrders(d.data||[])).catch(()=>{});
    fetch(`${API}/menu`).then(r=>r.json()).then(d=>setMenu(d.data||[])).catch(()=>{});
    fetch(`${API}/reviews/all`, { headers }).then(r=>r.json()).then(d=>setReviews(d.data||[])).catch(()=>{});
  }, []);

  const toast = (m) => { setMsg(m); setTimeout(()=>setMsg(''),3000); };

  // Review actions
  const updateReview = async (id, status) => {
    const res = await fetch(`${API}/reviews/${id}/status`, { method:'PATCH', headers, body: JSON.stringify({status}) });
    const data = await res.json();
    if (data.success) {
      setReviews(r => r.map(x => x._id===id ? {...x, status} : x));
      toast(status==='approved' ? '✅ Review approved!' : '🗑️ Review rejected.');
    }
  };
  const deleteReview = async (id) => {
    if (!confirm('Delete this review?')) return;
    await fetch(`${API}/reviews/${id}`, { method:'DELETE', headers });
    setReviews(r => r.filter(x => x._id!==id));
    toast('Review deleted.');
  };

  // User actions
  const deleteUser = async (id) => {
    if (!confirm('Remove this user?')) return;
    await fetch(`${API}/admin/users/${id}`, { method:'DELETE', headers });
    setUsers(u => u.filter(x => x._id!==id));
    toast('User removed.');
  };

  // Menu actions
  const addMenuItem = async () => {
    if (!newItem.name || !newItem.price) return toast('Name and price required.');
    const res = await fetch(`${API}/menu`, { method:'POST', headers, body: JSON.stringify({...newItem, price:Number(newItem.price)}) });
    const data = await res.json();
    if (data.success) { setMenu(m=>[...m,data.data]); setNewItem({emoji:'☕',name:'',description:'',price:'',category:'coffee'}); setShowAdd(false); toast('Item added!'); }
  };
  const deleteMenuItem = async (id) => {
    if (!confirm('Delete this menu item?')) return;
    await fetch(`${API}/menu/${id}`, { method:'DELETE', headers });
    setMenu(m => m.filter(x => x._id!==id));
    toast('Item deleted.');
  };

  // Order status
  const updateOrderStatus = async (id, status) => {
    await fetch(`${API}/orders/${id}/status`, { method:'PATCH', headers, body: JSON.stringify({status}) });
    setOrders(o => o.map(x => x._id===id ? {...x, status} : x));
  };

  const pendingReviews = reviews.filter(r=>r.status==='pending').length;
  const TABS = [
    { key:'reviews', label:`⭐ Reviews${pendingReviews>0?` (${pendingReviews} pending)`:''}` },
    { key:'orders',  label:'📦 Orders' },
    { key:'menu',    label:'🍽️ Menu' },
    { key:'users',   label:'👤 Users' },
  ];

  const StarRow = ({rating}) => (
    <span className="text-gold text-sm">{'★'.repeat(rating)}{'☆'.repeat(5-rating)}</span>
  );

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 md:px-12 page-enter">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-3">
        <h1 className="font-display text-4xl font-light">Admin <em className="italic text-gold">Dashboard</em></h1>
        <button onClick={logout} className="btn-outline text-xs py-2 px-4">Logout</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[['👤','Users',stats.users],['📦','Orders',stats.orders],['🍽️','Menu',stats.menu],['⭐','Reviews',reviews.length]].map(([i,l,v])=>(
          <div key={l} className="card text-center">
            <div className="font-display text-3xl text-gold">{v??'—'}</div>
            <div className="text-xs tracking-widest uppercase text-cream/40 mt-1">{i} {l}</div>
          </div>
        ))}
      </div>

      {msg && <div className="bg-gold/10 border border-gold/25 text-gold text-sm px-4 py-2 mb-4">{msg}</div>}

      {/* Tabs */}
      <div className="flex gap-0 border border-gold/22 w-fit mb-6 overflow-x-auto">
        {TABS.map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)}
            className={`px-4 py-2 text-xs tracking-widest uppercase whitespace-nowrap transition-all ${tab===t.key?'bg-gold text-dark':'text-cream/45 hover:text-gold'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── REVIEWS TAB ── */}
      {tab==='reviews' && (
        <div>
          <div className="flex gap-4 mb-4 text-xs">
            {['all','pending','approved','rejected'].map(s=>(
              <span key={s} className="text-cream/50 capitalize">
                {s}: <strong className="text-gold">{s==='all'?reviews.length:reviews.filter(r=>r.status===s).length}</strong>
              </span>
            ))}
          </div>
          <div className="space-y-3">
            {reviews.length===0 && <p className="text-cream/40 text-sm">No reviews yet.</p>}
            {reviews.map(r=>(
              <div key={r._id} className={`card border ${r.status==='approved'?'border-green-500/20':r.status==='rejected'?'border-red-500/20':'border-gold/20'}`}>
                <div className="flex flex-wrap justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <div className="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center text-gold font-display text-sm">
                        {(r.user?.name||r.guestName||'A').charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{r.user?.name||r.guestName||'Anonymous'}</p>
                        <p className="text-xs text-cream/35">{r.createdAt?.slice(0,10)} · {r.user?.email||r.guestEmail||'—'}</p>
                      </div>
                      <StarRow rating={r.rating} />
                      <span className={`text-xs px-2 py-0.5 border capitalize ${
                        r.status==='approved'?'border-green-500/40 text-green-300 bg-green-500/10':
                        r.status==='rejected'?'border-red-500/40 text-red-300 bg-red-500/10':
                        'border-gold/30 text-gold bg-gold/10'
                      }`}>{r.status}</span>
                    </div>
                    <p className="text-sm text-cream/70 italic leading-relaxed pl-11">"{r.comment}"</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {r.status!=='approved' && (
                      <button onClick={()=>updateReview(r._id,'approved')}
                        className="text-xs bg-green-500/15 border border-green-500/35 text-green-300 px-3 py-1.5 hover:bg-green-500/25 transition-colors">
                        ✓ Approve
                      </button>
                    )}
                    {r.status!=='rejected' && (
                      <button onClick={()=>updateReview(r._id,'rejected')}
                        className="text-xs bg-red-500/10 border border-red-500/30 text-red-300 px-3 py-1.5 hover:bg-red-500/20 transition-colors">
                        ✕ Reject
                      </button>
                    )}
                    <button onClick={()=>deleteReview(r._id)}
                      className="text-xs border border-cream/15 text-cream/40 px-3 py-1.5 hover:border-red-500/40 hover:text-red-400 transition-colors">
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ORDERS TAB ── */}
      {tab==='orders' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gold/20 text-xs tracking-widest uppercase text-gold/70">
              <th className="text-left py-3 px-2">ID</th><th className="text-left py-3 px-2">Customer</th>
              <th className="text-left py-3 px-2">Total</th><th className="text-left py-3 px-2">Type</th>
              <th className="text-left py-3 px-2">Payment</th><th className="text-left py-3 px-2">Status</th>
            </tr></thead>
            <tbody>{orders.length?orders.map(o=>(
              <tr key={o._id} className="border-b border-gold/7">
                <td className="py-3 px-2 text-cream/40 text-xs">{o.orderId}</td>
                <td className="py-3 px-2">{o.guestName||o.user?.name||'—'}</td>
                <td className="py-3 px-2 text-gold font-display">Rs. {o.totalAmount}</td>
                <td className="py-3 px-2 text-cream/50">{o.orderType}</td>
                <td className="py-3 px-2 text-cream/50">{o.paymentMethod}</td>
                <td className="py-3 px-2">
                  <select value={o.status} onChange={e=>updateOrderStatus(o._id,e.target.value)}
                    className="bg-dark-3 border border-gold/18 text-cream text-xs px-2 py-1">
                    {['pending','preparing','ready','delivered','cancelled'].map(s=><option key={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            )):<tr><td colSpan={6} className="text-center py-8 text-cream/30">No orders yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* ── MENU TAB ── */}
      {tab==='menu' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-cream/40 text-sm">{menu.length} items</span>
            <button onClick={()=>setShowAdd(!showAdd)} className="btn-gold text-xs py-2 px-4">+ Add Item</button>
          </div>
          {showAdd && (
            <div className="card mb-6 grid grid-cols-2 md:grid-cols-3 gap-3">
              <div><label className="label">Emoji</label><input className="input-field" value={newItem.emoji} onChange={e=>setNewItem({...newItem,emoji:e.target.value})} /></div>
              <div><label className="label">Category</label>
                <select className="input-field" value={newItem.category} onChange={e=>setNewItem({...newItem,category:e.target.value})}>
                  <option value="coffee">Coffee</option><option value="bar">Bar</option><option value="food">Food</option>
                </select>
              </div>
              <div><label className="label">Name</label><input className="input-field" value={newItem.name} onChange={e=>setNewItem({...newItem,name:e.target.value})} /></div>
              <div><label className="label">Price (Rs.)</label><input className="input-field" type="number" value={newItem.price} onChange={e=>setNewItem({...newItem,price:e.target.value})} /></div>
              <div className="col-span-2"><label className="label">Description</label><input className="input-field" value={newItem.description} onChange={e=>setNewItem({...newItem,description:e.target.value})} /></div>
              <div className="col-span-2 md:col-span-3 flex gap-3">
                <button onClick={addMenuItem} className="btn-gold text-xs py-2 px-4">Save</button>
                <button onClick={()=>setShowAdd(false)} className="btn-outline text-xs py-2 px-4">Cancel</button>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gold/20 text-xs tracking-widest uppercase text-gold/70">
                <th className="text-left py-3 px-2">Item</th><th className="text-left py-3 px-2">Category</th>
                <th className="text-left py-3 px-2">Price</th><th className="py-3 px-2">Action</th>
              </tr></thead>
              <tbody>{menu.map(item=>(
                <tr key={item._id} className="border-b border-gold/7">
                  <td className="py-3 px-2">{item.emoji} {item.name}</td>
                  <td className="py-3 px-2 text-cream/50 capitalize">{item.category}</td>
                  <td className="py-3 px-2 text-gold font-display">Rs. {item.price}</td>
                  <td className="py-3 px-2 text-center">
                    <button onClick={()=>deleteMenuItem(item._id)} className="text-red-400 text-xs border border-red-500/30 px-2 py-1">Delete</button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── USERS TAB ── */}
      {tab==='users' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gold/20 text-xs tracking-widest uppercase text-gold/70">
              <th className="text-left py-3 px-2">#</th><th className="text-left py-3 px-2">Name</th>
              <th className="text-left py-3 px-2">Email</th><th className="text-left py-3 px-2">Phone</th>
              <th className="text-left py-3 px-2">Joined</th><th className="py-3 px-2">Action</th>
            </tr></thead>
            <tbody>{users.map((u,i)=>(
              <tr key={u._id} className="border-b border-gold/7 hover:bg-gold/3">
                <td className="py-3 px-2 text-cream/40">{i+1}</td><td className="py-3 px-2">{u.name}</td>
                <td className="py-3 px-2 text-cream/60">{u.email}</td><td className="py-3 px-2 text-cream/60">{u.phone||'—'}</td>
                <td className="py-3 px-2 text-cream/40 text-xs">{u.createdAt?.slice(0,10)}</td>
                <td className="py-3 px-2 text-center">
                  <button onClick={()=>deleteUser(u._id)} className="text-red-400 hover:text-red-300 text-xs border border-red-500/30 px-2 py-1">Remove</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
