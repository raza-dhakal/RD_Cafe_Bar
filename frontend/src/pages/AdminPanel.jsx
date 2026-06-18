import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const s = { gold:'#C9A84C', cream:'#F5EDD8', dark:'#0E0B08', d2:'#1A1510', d3:'#241E15', muted:'rgba(245,237,216,0.5)', border:'rgba(201,168,76,0.18)' };
const PIE_COLORS = ['#C9A84C','#3b82f6','#8b5cf6','#10b981','#f59e0b'];
const STATUS_COLORS = { pending:'#f59e0b', confirmed:'#3b82f6', preparing:'#8b5cf6', ready:'#10b981', delivered:'#22c55e', cancelled:'#ef4444' };

const Input = ({ label, value, onChange, type='text', placeholder='' }) => (
  <div style={{marginBottom:'0.8rem'}}>
    <label style={{display:'block',fontSize:'0.6rem',letterSpacing:'0.18em',textTransform:'uppercase',color:s.muted,marginBottom:'0.3rem'}}>{label}</label>
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{width:'100%',background:s.dark,border:`1px solid ${s.border}`,color:s.cream,padding:'0.65rem',fontFamily:'"DM Sans",sans-serif',fontSize:'0.85rem',outline:'none',boxSizing:'border-box'}} />
  </div>
);

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats]       = useState({});
  const [orderStats, setOStats] = useState({});
  const [orders, setOrders]     = useState([]);
  const [menu, setMenu]         = useState([]);
  const [reviews, setReviews]   = useState([]);
  const [reservations, setRes]  = useState([]);
  const [users, setUsers]       = useState([]);
  const [msg, setMsg]           = useState('');
  const [newItem, setNewItem]   = useState({ name:'', description:'', price:'', category:'hot-coffee', emoji:'☕', isVeg:false });
  const [showAdd, setShowAdd]   = useState(false);

  const token   = localStorage.getItem('rdcafe_token');
  const headers = { 'Content-Type':'application/json', Authorization:`Bearer ${token}` };
  const toast   = m => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/admin-login'); return; }
    loadAll();
  }, [user]);

  const loadAll = () => {
    fetch(`${API}/admin/stats`, { headers }).then(r=>r.json()).then(d=>setStats(d.data||{}));
    fetch(`${API}/orders/stats`, { headers }).then(r=>r.json()).then(d=>setOStats(d.data||{}));
    fetch(`${API}/orders/all`, { headers }).then(r=>r.json()).then(d=>setOrders(d.data||[]));
    fetch(`${API}/menu`).then(r=>r.json()).then(d=>setMenu(d.data||[]));
    fetch(`${API}/reviews/all`, { headers }).then(r=>r.json()).then(d=>setReviews(d.data||[]));
    fetch(`${API}/reservations/all`, { headers }).then(r=>r.json()).then(d=>setRes(d.data||[]));
    fetch(`${API}/admin/users`, { headers }).then(r=>r.json()).then(d=>setUsers(d.data||[]));
  };

  const updateOrderStatus = async (id, status) => {
    await fetch(`${API}/orders/${id}/status`, { method:'PATCH', headers, body: JSON.stringify({ status }) });
    setOrders(o => o.map(x => x._id===id ? {...x, status} : x));
    toast(`✅ Order status → ${status}`);
  };
  const updateReview = async (id, status) => {
    await fetch(`${API}/reviews/${id}/status`, { method:'PATCH', headers, body: JSON.stringify({ status }) });
    setReviews(r => r.map(x => x._id===id ? {...x, status} : x));
    toast(status==='approved' ? '✅ Review approved!' : '🗑 Review rejected.');
  };
  const deleteReview = async id => { await fetch(`${API}/reviews/${id}`, { method:'DELETE', headers }); setReviews(r=>r.filter(x=>x._id!==id)); toast('Deleted.'); };
  const updateReservation = async (id, status) => {
    await fetch(`${API}/reservations/${id}/status`, { method:'PATCH', headers, body: JSON.stringify({ status }) });
    setRes(r => r.map(x => x._id===id ? {...x, status} : x));
    toast(`Reservation ${status}!`);
  };
  const addMenuItem = async () => {
    if (!newItem.name || !newItem.price) return toast('Name and price required.');
    const res = await fetch(`${API}/menu`, { method:'POST', headers, body: JSON.stringify({...newItem, price: Number(newItem.price)}) });
    const d = await res.json();
    if (d.success) { setMenu(m=>[...m,d.data]); setNewItem({name:'',description:'',price:'',category:'hot-coffee',emoji:'☕',isVeg:false}); setShowAdd(false); toast('✅ Item added!'); }
  };
  const deleteMenuItem = async id => { await fetch(`${API}/menu/${id}`, { method:'DELETE', headers }); setMenu(m=>m.filter(x=>x._id!==id)); toast('Deleted.'); };
  const toggleAvailable = async (id, val) => {
    await fetch(`${API}/menu/${id}`, { method:'PATCH', headers, body: JSON.stringify({ isAvailable: val }) });
    setMenu(m => m.map(x => x._id===id ? {...x, isAvailable: val} : x));
  };

  const TABS = [['dashboard','📊 Dashboard'],['orders','📦 Orders'],['menu','🍽 Menu'],['reviews','⭐ Reviews'],['reservations','🗓 Reservations'],['customers','👥 Customers']];
  const pendingReviews = reviews.filter(r=>r.status==='pending').length;

  const Th = ({ children }) => <th style={{fontSize:'0.62rem',letterSpacing:'0.15em',textTransform:'uppercase',color:s.muted,padding:'10px 12px',textAlign:'left',borderBottom:`1px solid ${s.border}`,fontWeight:400}}>{children}</th>;
  const Td = ({ children, style={} }) => <td style={{padding:'10px 12px',fontSize:'0.85rem',borderBottom:`1px solid rgba(201,168,76,0.06)`,...style}}>{children}</td>;

  return (
    <div style={{minHeight:'100vh',background:s.dark,color:s.cream,fontFamily:'"DM Sans",sans-serif',paddingTop:'70px'}}>
      <div style={{maxWidth:'1300px',margin:'0 auto',padding:'1.5rem'}}>

        {/* Header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem',flexWrap:'wrap',gap:'1rem'}}>
          <div>
            <p style={{fontSize:'0.62rem',letterSpacing:'0.3em',textTransform:'uppercase',color:s.gold,margin:'0 0 4px'}}>Admin Panel</p>
            <h1 style={{fontFamily:'"Cormorant Garamond",serif',fontSize:'1.8rem',fontWeight:300,margin:0}}>RD Café <em style={{fontStyle:'italic',color:s.gold}}>Dashboard</em></h1>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} style={{background:'transparent',border:'1px solid rgba(239,68,68,0.3)',color:'#f87171',padding:'0.5rem 1.2rem',fontSize:'0.72rem',cursor:'pointer',fontFamily:'"DM Sans",sans-serif',letterSpacing:'0.15em',textTransform:'uppercase'}}>Logout</button>
        </div>

        {msg && <div style={{background:'rgba(201,168,76,0.1)',border:`1px solid ${s.border}`,color:s.gold,padding:'0.7rem 1rem',marginBottom:'1rem',fontSize:'0.83rem'}}>{msg}</div>}

        {/* Tabs */}
        <div style={{display:'flex',overflowX:'auto',borderBottom:`1px solid ${s.border}`,marginBottom:'1.5rem',gap:0}}>
          {TABS.map(([key,label]) => (
            <button key={key} onClick={() => setTab(key)}
              style={{padding:'0.7rem 1.2rem',fontSize:'0.7rem',letterSpacing:'0.12em',textTransform:'uppercase',background:'transparent',border:'none',borderBottom:`2px solid ${tab===key?s.gold:'transparent'}`,color:tab===key?s.gold:s.muted,cursor:'pointer',fontFamily:'"DM Sans",sans-serif',whiteSpace:'nowrap',position:'relative'}}>
              {label}{key==='reviews'&&pendingReviews>0&&<span style={{position:'absolute',top:'6px',right:'6px',background:'#ef4444',borderRadius:'50%',width:'16px',height:'16px',fontSize:'0.6rem',display:'flex',alignItems:'center',justifyContent:'center',color:'white'}}>{pendingReviews}</span>}
            </button>
          ))}
        </div>

        {/* ── DASHBOARD ── */}
        {tab==='dashboard' && (
          <div>
            {/* Stat cards */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:'1px',background:s.border,marginBottom:'1.5rem'}}>
              {[['👥',stats.users,'Users'],['📦',stats.orders,'Total Orders'],['📦',orderStats.todayOrders,'Today'],['💰',`Rs.${(orderStats.totalRevenue||0).toLocaleString()}`,'Revenue'],['⭐',stats.pendingReviews,'Pending Reviews'],['🗓',stats.reservations,'Reservations']].map(([icon,val,label])=>(
                <div key={label} style={{background:s.d2,padding:'1.2rem',textAlign:'center'}}>
                  <div style={{fontSize:'1.5rem',marginBottom:'4px'}}>{icon}</div>
                  <div style={{fontFamily:'"Cormorant Garamond",serif',fontSize:'1.6rem',color:s.gold}}>{val??'—'}</div>
                  <div style={{fontSize:'0.62rem',letterSpacing:'0.15em',textTransform:'uppercase',color:s.muted,marginTop:'2px'}}>{label}</div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'1rem',marginBottom:'1.5rem'}}>
              <div style={{background:s.d2,border:`1px solid ${s.border}`,padding:'1.5rem'}}>
                <p style={{fontSize:'0.65rem',letterSpacing:'0.25em',textTransform:'uppercase',color:s.gold,marginBottom:'1rem'}}>Daily Revenue (7 days)</p>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={orderStats.dailyRevenue||[]}>
                    <XAxis dataKey="_id" stroke={s.muted} tick={{fontSize:10}} />
                    <YAxis stroke={s.muted} tick={{fontSize:10}} />
                    <Tooltip contentStyle={{background:s.d2,border:`1px solid ${s.border}`,color:s.cream,fontSize:'12px'}} />
                    <Line type="monotone" dataKey="revenue" stroke={s.gold} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={{background:s.d2,border:`1px solid ${s.border}`,padding:'1.5rem'}}>
                <p style={{fontSize:'0.65rem',letterSpacing:'0.25em',textTransform:'uppercase',color:s.gold,marginBottom:'1rem'}}>Top Items</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={orderStats.topItems||[]} layout="vertical">
                    <XAxis type="number" stroke={s.muted} tick={{fontSize:10}} />
                    <YAxis type="category" dataKey="_id" stroke={s.muted} tick={{fontSize:9}} width={80} />
                    <Tooltip contentStyle={{background:s.d2,border:`1px solid ${s.border}`,color:s.cream,fontSize:'12px'}} />
                    <Bar dataKey="count" fill={s.gold} radius={[0,2,2,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ── ORDERS ── */}
        {tab==='orders' && (
          <div>
            <p style={{fontSize:'0.65rem',letterSpacing:'0.25em',textTransform:'uppercase',color:s.gold,marginBottom:'1rem'}}>{orders.length} Total Orders</p>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr><Th>Order ID</Th><Th>Customer</Th><Th>Items</Th><Th>Total</Th><Th>Type</Th><Th>Payment</Th><Th>Status</Th></tr></thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o._id}>
                      <Td><span style={{color:s.gold,fontFamily:'"Cormorant Garamond",serif'}}>{o.orderId}</span></Td>
                      <Td><div>{o.user?.name||o.guestName||'Guest'}</div><div style={{fontSize:'0.7rem',color:s.muted}}>{o.user?.phone||o.guestPhone||''}</div></Td>
                      <Td style={{color:s.muted,fontSize:'0.78rem'}}>{o.items?.slice(0,2).map(i=>i.name).join(', ')}{o.items?.length>2?'...':''}</Td>
                      <Td><span style={{color:s.gold}}>Rs.{o.totalAmount}</span></Td>
                      <Td style={{textTransform:'capitalize',color:s.muted}}>{o.orderType}</Td>
                      <Td style={{textTransform:'capitalize',color:s.muted}}>{o.paymentMethod}</Td>
                      <Td>
                        <select value={o.status} onChange={e=>updateOrderStatus(o._id,e.target.value)}
                          style={{background:s.d3,border:`1px solid ${STATUS_COLORS[o.status]}40`,color:STATUS_COLORS[o.status],padding:'4px 8px',fontSize:'0.75rem',fontFamily:'"DM Sans",sans-serif',outline:'none',cursor:'pointer',textTransform:'capitalize'}}>
                          {['pending','confirmed','preparing','ready','out-for-delivery','delivered','cancelled'].map(st=><option key={st} value={st}>{st}</option>)}
                        </select>
                      </Td>
                    </tr>
                  ))}
                  {orders.length===0&&<tr><td colSpan={7} style={{textAlign:'center',padding:'3rem',color:s.muted}}>No orders yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── MENU ── */}
        {tab==='menu' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:'1rem',alignItems:'center'}}>
              <p style={{fontSize:'0.65rem',letterSpacing:'0.25em',textTransform:'uppercase',color:s.gold,margin:0}}>{menu.length} Menu Items</p>
              <button onClick={()=>setShowAdd(!showAdd)} style={{background:s.gold,color:s.dark,border:'none',padding:'0.5rem 1.2rem',fontSize:'0.72rem',letterSpacing:'0.15em',textTransform:'uppercase',cursor:'pointer',fontFamily:'"DM Sans",sans-serif'}}>+ Add Item</button>
            </div>
            {showAdd && (
              <div style={{background:s.d2,border:`1px solid ${s.border}`,padding:'1.5rem',marginBottom:'1rem'}}>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'10px'}}>
                  <Input label="Name *" value={newItem.name} onChange={e=>setNewItem(n=>({...n,name:e.target.value}))} placeholder="Cappuccino" />
                  <Input label="Price (Rs.) *" value={newItem.price} onChange={e=>setNewItem(n=>({...n,price:e.target.value}))} type="number" placeholder="220" />
                  <div style={{marginBottom:'0.8rem'}}>
                    <label style={{display:'block',fontSize:'0.6rem',letterSpacing:'0.18em',textTransform:'uppercase',color:s.muted,marginBottom:'0.3rem'}}>Category</label>
                    <select value={newItem.category} onChange={e=>setNewItem(n=>({...n,category:e.target.value}))}
                      style={{width:'100%',background:s.dark,border:`1px solid ${s.border}`,color:s.cream,padding:'0.65rem',fontFamily:'"DM Sans",sans-serif',fontSize:'0.85rem',outline:'none'}}>
                      {['hot-coffee','cold-coffee','tea','soft-drinks','beer','wine','food'].map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div style={{gridColumn:'1/-1'}}>
                    <Input label="Description" value={newItem.description} onChange={e=>setNewItem(n=>({...n,description:e.target.value}))} placeholder="Short description..." />
                  </div>
                  <Input label="Emoji" value={newItem.emoji} onChange={e=>setNewItem(n=>({...n,emoji:e.target.value}))} placeholder="☕" />
                  <div style={{display:'flex',alignItems:'center',gap:'8px',paddingTop:'1.5rem'}}>
                    <input type="checkbox" id="isVeg" checked={newItem.isVeg} onChange={e=>setNewItem(n=>({...n,isVeg:e.target.checked}))} style={{accentColor:s.gold}} />
                    <label htmlFor="isVeg" style={{fontSize:'0.83rem',color:s.muted,cursor:'pointer'}}>Veg item</label>
                  </div>
                </div>
                <div style={{display:'flex',gap:'8px',marginTop:'0.5rem'}}>
                  <button onClick={addMenuItem} style={{background:s.gold,color:s.dark,border:'none',padding:'0.6rem 1.5rem',fontSize:'0.72rem',cursor:'pointer',fontFamily:'"DM Sans",sans-serif',letterSpacing:'0.15em',textTransform:'uppercase'}}>Save Item</button>
                  <button onClick={()=>setShowAdd(false)} style={{background:'transparent',border:`1px solid ${s.border}`,color:s.muted,padding:'0.6rem 1.2rem',fontSize:'0.72rem',cursor:'pointer',fontFamily:'"DM Sans",sans-serif'}}>Cancel</button>
                </div>
              </div>
            )}
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr><Th>Item</Th><Th>Category</Th><Th>Price</Th><Th>Available</Th><Th>Action</Th></tr></thead>
              <tbody>
                {menu.map(item=>(
                  <tr key={item._id}>
                    <Td><span style={{marginRight:'6px'}}>{item.emoji}</span>{item.name}{item.isVeg&&<span style={{marginLeft:'6px',fontSize:'0.65rem',color:'#4ade80',border:'1px solid #4ade8040',padding:'1px 5px'}}>VEG</span>}</Td>
                    <Td style={{textTransform:'capitalize',color:s.muted}}>{item.category}</Td>
                    <Td style={{color:s.gold}}>Rs. {item.price}</Td>
                    <Td>
                      <button onClick={()=>toggleAvailable(item._id,!item.isAvailable)}
                        style={{background:item.isAvailable?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)',border:`1px solid ${item.isAvailable?'rgba(34,197,94,0.3)':'rgba(239,68,68,0.3)'}`,color:item.isAvailable?'#4ade80':'#f87171',padding:'3px 10px',fontSize:'0.7rem',cursor:'pointer',fontFamily:'"DM Sans",sans-serif'}}>
                        {item.isAvailable?'Available':'Unavailable'}
                      </button>
                    </Td>
                    <Td>
                      <button onClick={()=>{if(confirm('Delete?'))deleteMenuItem(item._id)}}
                        style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',color:'#f87171',padding:'3px 10px',fontSize:'0.7rem',cursor:'pointer',fontFamily:'"DM Sans",sans-serif'}}>Delete</button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── REVIEWS ── */}
        {tab==='reviews' && (
          <div>
            <div style={{display:'flex',gap:'1.5rem',marginBottom:'1rem',fontSize:'0.78rem',color:s.muted}}>
              {['all','pending','approved','rejected'].map(st=>(
                <span key={st} style={{textTransform:'capitalize'}}>{st}: <strong style={{color:s.gold}}>{st==='all'?reviews.length:reviews.filter(r=>r.status===st).length}</strong></span>
              ))}
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              {reviews.map(r=>(
                <div key={r._id} style={{background:s.d2,border:`1px solid ${r.status==='approved'?'rgba(34,197,94,0.2)':r.status==='rejected'?'rgba(239,68,68,0.2)':s.border}`,padding:'1.2rem'}}>
                  <div style={{display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:'10px'}}>
                    <div style={{flex:1}}>
                      <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'0.5rem',flexWrap:'wrap'}}>
                        <div style={{width:'32px',height:'32px',borderRadius:'50%',background:'rgba(201,168,76,0.15)',display:'flex',alignItems:'center',justifyContent:'center',color:s.gold,fontFamily:'"Cormorant Garamond",serif'}}>{(r.user?.name||r.guestName||'A')[0]}</div>
                        <div>
                          <p style={{margin:0,fontSize:'0.85rem',fontWeight:500}}>{r.user?.name||r.guestName||'Anonymous'}</p>
                          <p style={{margin:0,fontSize:'0.7rem',color:s.muted}}>{r.createdAt?.slice(0,10)}</p>
                        </div>
                        <span style={{color:s.gold}}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span>
                        <span style={{fontSize:'0.65rem',padding:'2px 8px',textTransform:'capitalize',border:`1px solid ${r.status==='approved'?'rgba(34,197,94,0.4)':r.status==='rejected'?'rgba(239,68,68,0.4)':'rgba(201,168,76,0.3)'}`,color:r.status==='approved'?'#4ade80':r.status==='rejected'?'#f87171':s.gold}}>{r.status}</span>
                      </div>
                      <p style={{margin:0,fontSize:'0.83rem',color:s.muted,fontStyle:'italic',paddingLeft:'42px'}}>"{r.comment}"</p>
                    </div>
                    <div style={{display:'flex',gap:'6px',flexShrink:0,alignItems:'flex-start'}}>
                      {r.status!=='approved'&&<button onClick={()=>updateReview(r._id,'approved')} style={{background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.3)',color:'#4ade80',padding:'4px 10px',fontSize:'0.7rem',cursor:'pointer',fontFamily:'"DM Sans",sans-serif'}}>✓ Approve</button>}
                      {r.status!=='rejected'&&<button onClick={()=>updateReview(r._id,'rejected')} style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',color:'#f87171',padding:'4px 10px',fontSize:'0.7rem',cursor:'pointer',fontFamily:'"DM Sans",sans-serif'}}>✕ Reject</button>}
                      <button onClick={()=>{if(confirm('Delete?'))deleteReview(r._id)}} style={{background:'transparent',border:`1px solid ${s.border}`,color:s.muted,padding:'4px 8px',fontSize:'0.7rem',cursor:'pointer',fontFamily:'"DM Sans",sans-serif'}}>🗑</button>
                    </div>
                  </div>
                </div>
              ))}
              {reviews.length===0&&<p style={{color:s.muted,textAlign:'center',padding:'3rem'}}>No reviews yet.</p>}
            </div>
          </div>
        )}

        {/* ── RESERVATIONS ── */}
        {tab==='reservations' && (
          <div>
            <p style={{fontSize:'0.65rem',letterSpacing:'0.25em',textTransform:'uppercase',color:s.gold,marginBottom:'1rem'}}>{reservations.length} Reservations</p>
            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
              {reservations.map(r=>(
                <div key={r._id} style={{background:s.d2,border:`1px solid ${s.border}`,padding:'1.2rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'10px'}}>
                  <div>
                    <p style={{margin:'0 0 4px',fontSize:'0.95rem',fontWeight:500}}>{r.name} <span style={{fontSize:'0.75rem',color:s.muted}}>({r.guests} guests)</span></p>
                    <p style={{margin:'0 0 2px',fontSize:'0.8rem',color:s.muted}}>📅 {r.date} at {r.time} · 📞 {r.contact}</p>
                    {r.occasion&&<p style={{margin:0,fontSize:'0.75rem',color:'rgba(201,168,76,0.6)'}}>{r.occasion}</p>}
                  </div>
                  <div style={{display:'flex',gap:'6px',alignItems:'center'}}>
                    <span style={{fontSize:'0.7rem',padding:'3px 10px',textTransform:'capitalize',border:`1px solid ${r.status==='confirmed'?'rgba(34,197,94,0.4)':r.status==='cancelled'?'rgba(239,68,68,0.4)':s.border}`,color:r.status==='confirmed'?'#4ade80':r.status==='cancelled'?'#f87171':s.muted}}>{r.status}</span>
                    {r.status==='pending'&&<>
                      <button onClick={()=>updateReservation(r._id,'confirmed')} style={{background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.3)',color:'#4ade80',padding:'4px 10px',fontSize:'0.7rem',cursor:'pointer',fontFamily:'"DM Sans",sans-serif'}}>✓ Confirm</button>
                      <button onClick={()=>updateReservation(r._id,'cancelled')} style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',color:'#f87171',padding:'4px 10px',fontSize:'0.7rem',cursor:'pointer',fontFamily:'"DM Sans",sans-serif'}}>✕ Cancel</button>
                    </>}
                  </div>
                </div>
              ))}
              {reservations.length===0&&<p style={{color:s.muted,textAlign:'center',padding:'3rem'}}>No reservations yet.</p>}
            </div>
          </div>
        )}

        {/* ── CUSTOMERS ── */}
        {tab==='customers' && (
          <div>
            <p style={{fontSize:'0.65rem',letterSpacing:'0.25em',textTransform:'uppercase',color:s.gold,marginBottom:'1rem'}}>{users.length} Registered Customers</p>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr><Th>#</Th><Th>Name</Th><Th>Email</Th><Th>Phone</Th><Th>Orders</Th><Th>Spent</Th><Th>Points</Th><Th>Joined</Th></tr></thead>
              <tbody>
                {users.map((u,i)=>(
                  <tr key={u._id}>
                    <Td style={{color:s.muted}}>{i+1}</Td>
                    <Td>{u.name}</Td>
                    <Td style={{color:s.muted,fontSize:'0.78rem'}}>{u.email}</Td>
                    <Td style={{color:s.muted,fontSize:'0.78rem'}}>{u.phone||'—'}</Td>
                    <Td style={{color:s.gold}}>{u.totalOrders||0}</Td>
                    <Td style={{color:s.gold}}>Rs.{u.totalSpent||0}</Td>
                    <Td><span style={{background:'rgba(201,168,76,0.1)',border:`1px solid ${s.border}`,color:s.gold,padding:'2px 8px',fontSize:'0.72rem'}}>{u.loyaltyPoints||0} pts</span></Td>
                    <Td style={{color:s.muted,fontSize:'0.75rem'}}>{u.createdAt?.slice(0,10)}</Td>
                  </tr>
                ))}
                {users.length===0&&<tr><td colSpan={8} style={{textAlign:'center',padding:'3rem',color:s.muted}}>No customers yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
