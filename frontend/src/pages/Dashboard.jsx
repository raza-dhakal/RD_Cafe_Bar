import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const s = { gold:'#C9A84C', cream:'#F5EDD8', dark:'#0E0B08', d2:'#1A1510', d3:'#241E15', muted:'rgba(245,237,216,0.5)', border:'rgba(201,168,76,0.18)' };

const STATUS_COLORS = { pending:'#f59e0b', confirmed:'#3b82f6', preparing:'#8b5cf6', ready:'#10b981', delivered:'#22c55e', cancelled:'#ef4444' };

export default function Dashboard() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [editForm, setEditForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [editMsg, setEditMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('rdcafe_token');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetch(`${API}/orders/my`, { headers }).then(r => r.json()).then(d => setOrders(d.data || [])).catch(() => {});
  }, [user]);

  const handleProfileUpdate = async e => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch(`${API}/users/profile`, { method: 'PATCH', headers, body: JSON.stringify(editForm) });
      const data = await res.json();
      if (data.success) { updateUser?.(data.data); setEditMsg('✅ Profile updated!'); }
      else setEditMsg('❌ ' + data.message);
    } catch { setEditMsg('❌ Update failed.'); }
    finally { setLoading(false); setTimeout(() => setEditMsg(''), 3000); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const TABS = [['overview','📊 Overview'],['orders','📦 My Orders'],['profile','👤 Profile']];

  return (
    <div style={{minHeight:'100vh',background:s.dark,color:s.cream,paddingTop:'80px',fontFamily:'"DM Sans",sans-serif'}}>
      <div style={{maxWidth:'1000px',margin:'0 auto',padding:'2rem 1.5rem'}}>

        {/* Header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'2rem',flexWrap:'wrap',gap:'1rem'}}>
          <div>
            <p style={{fontSize:'0.65rem',letterSpacing:'0.3em',textTransform:'uppercase',color:s.gold,margin:'0 0 4px'}}>Member Dashboard</p>
            <h1 style={{fontFamily:'"Cormorant Garamond",serif',fontSize:'2rem',fontWeight:300,margin:0}}>
              Namaste, <em style={{fontStyle:'italic',color:s.gold}}>{user?.name?.split(' ')[0]}</em>! ☕
            </h1>
          </div>
          <div style={{display:'flex',gap:'10px'}}>
            <Link to="/menu" style={{background:'transparent',border:`1px solid ${s.border}`,color:s.gold,padding:'0.6rem 1.2rem',fontSize:'0.72rem',letterSpacing:'0.15em',textTransform:'uppercase',textDecoration:'none'}}>Order Now</Link>
            <button onClick={handleLogout} style={{background:'transparent',border:`1px solid rgba(239,68,68,0.3)`,color:'#f87171',padding:'0.6rem 1.2rem',fontSize:'0.72rem',letterSpacing:'0.15em',textTransform:'uppercase',cursor:'pointer',fontFamily:'"DM Sans",sans-serif'}}>Logout</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',border:`1px solid ${s.border}`,width:'fit-content',marginBottom:'2rem'}}>
          {TABS.map(([key,label]) => (
            <button key={key} onClick={() => setTab(key)}
              style={{padding:'0.6rem 1.3rem',fontSize:'0.72rem',letterSpacing:'0.12em',textTransform:'uppercase',background:tab===key?s.gold:'transparent',color:tab===key?s.dark:s.muted,border:'none',cursor:'pointer',fontFamily:'"DM Sans",sans-serif',whiteSpace:'nowrap'}}>
              {label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div>
            {/* Stats */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'1px',background:s.border,marginBottom:'2rem'}}>
              {[
                ['🏆', 'Loyalty Points', user?.loyaltyPoints || 0, 'pts'],
                ['📦', 'Total Orders', user?.totalOrders || orders.length, 'orders'],
                ['💰', 'Total Spent', `Rs. ${user?.totalSpent || 0}`, ''],
                ['⭐', 'Member Since', new Date(user?.createdAt).getFullYear() || '2024', ''],
              ].map(([icon, label, val, unit]) => (
                <div key={label} style={{background:s.d2,padding:'1.5rem',textAlign:'center'}}>
                  <div style={{fontSize:'1.8rem',marginBottom:'0.4rem'}}>{icon}</div>
                  <div style={{fontFamily:'"Cormorant Garamond",serif',fontSize:'1.8rem',color:s.gold}}>{val}</div>
                  <div style={{fontSize:'0.68rem',letterSpacing:'0.15em',textTransform:'uppercase',color:s.muted,marginTop:'0.2rem'}}>{label} {unit}</div>
                </div>
              ))}
            </div>

            {/* Loyalty tier */}
            <div style={{background:s.d2,border:`1px solid ${s.border}`,padding:'1.5rem',marginBottom:'2rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.8rem'}}>
                <p style={{fontSize:'0.68rem',letterSpacing:'0.2em',textTransform:'uppercase',color:s.gold,margin:0}}>Loyalty Status</p>
                <span style={{fontSize:'0.75rem',color:s.muted}}>1 point per Rs. 10 spent</span>
              </div>
              {(() => {
                const pts = user?.loyaltyPoints || 0;
                const tier = pts >= 1000 ? ['💎','Platinum',1000,5000] : pts >= 500 ? ['🥇','Gold',500,1000] : pts >= 100 ? ['🥈','Silver',100,500] : ['🥉','Bronze',0,100];
                const pct = Math.min(100, ((pts - tier[2]) / (tier[3] - tier[2])) * 100);
                return (
                  <>
                    <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'0.8rem'}}>
                      <span style={{fontSize:'1.5rem'}}>{tier[0]}</span>
                      <span style={{fontFamily:'"Cormorant Garamond",serif',fontSize:'1.3rem',color:s.gold}}>{tier[1]} Member</span>
                    </div>
                    <div style={{background:'rgba(201,168,76,0.1)',borderRadius:'2px',height:'6px',overflow:'hidden'}}>
                      <div style={{height:'100%',background:s.gold,width:`${pct}%`,transition:'width 1s ease'}} />
                    </div>
                    <p style={{fontSize:'0.72rem',color:s.muted,marginTop:'0.5rem',marginBottom:0}}>{pts} pts · {tier[3] - pts} more for next tier</p>
                  </>
                );
              })()}
            </div>

            {/* Recent orders */}
            <div>
              <p style={{fontSize:'0.68rem',letterSpacing:'0.25em',textTransform:'uppercase',color:s.gold,marginBottom:'1rem'}}>Recent Orders</p>
              {orders.slice(0,3).map(order => (
                <div key={order._id} style={{background:s.d2,border:`1px solid ${s.border}`,padding:'1.2rem',marginBottom:'8px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'10px'}}>
                  <div>
                    <p style={{fontFamily:'"Cormorant Garamond",serif',fontSize:'1.1rem',margin:'0 0 2px',color:s.gold}}>#{order.orderId}</p>
                    <p style={{fontSize:'0.75rem',color:s.muted,margin:0}}>{order.items.map(i=>i.name).join(', ').slice(0,50)}{order.items.length>2?'...':''}</p>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <p style={{fontFamily:'"Cormorant Garamond",serif',fontSize:'1.1rem',color:s.gold,margin:'0 0 4px'}}>Rs. {order.totalAmount}</p>
                    <span style={{fontSize:'0.65rem',padding:'2px 8px',border:`1px solid ${STATUS_COLORS[order.status]}40`,color:STATUS_COLORS[order.status],textTransform:'capitalize'}}>{order.status}</span>
                  </div>
                </div>
              ))}
              {orders.length === 0 && <p style={{color:s.muted,fontSize:'0.85rem'}}>No orders yet. <Link to="/menu" style={{color:s.gold}}>Order now →</Link></p>}
              {orders.length > 3 && <button onClick={() => setTab('orders')} style={{marginTop:'0.5rem',background:'transparent',border:`1px solid ${s.border}`,color:s.gold,padding:'0.5rem 1rem',fontSize:'0.72rem',cursor:'pointer',fontFamily:'"DM Sans",sans-serif'}}>View all orders</button>}
            </div>
          </div>
        )}

        {/* ── ORDERS ── */}
        {tab === 'orders' && (
          <div>
            <p style={{fontSize:'0.68rem',letterSpacing:'0.25em',textTransform:'uppercase',color:s.gold,marginBottom:'1.2rem'}}>{orders.length} Orders</p>
            {orders.length === 0 ? (
              <div style={{textAlign:'center',padding:'4rem',color:s.muted}}>
                <div style={{fontSize:'3rem',marginBottom:'1rem'}}>📦</div>
                <p>No orders yet.</p>
                <Link to="/menu" style={{color:s.gold}}>Start ordering →</Link>
              </div>
            ) : orders.map(order => (
              <div key={order._id} style={{background:s.d2,border:`1px solid ${s.border}`,padding:'1.5rem',marginBottom:'10px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'10px',marginBottom:'1rem'}}>
                  <div>
                    <p style={{fontFamily:'"Cormorant Garamond",serif',fontSize:'1.3rem',color:s.gold,margin:'0 0 4px'}}>#{order.orderId}</p>
                    <p style={{fontSize:'0.72rem',color:s.muted,margin:0}}>{new Date(order.createdAt).toLocaleString()} · {order.orderType} · {order.paymentMethod}</p>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <p style={{fontFamily:'"Cormorant Garamond",serif',fontSize:'1.4rem',color:s.gold,margin:'0 0 6px'}}>Rs. {order.totalAmount}</p>
                    <span style={{fontSize:'0.65rem',padding:'3px 10px',border:`1px solid ${STATUS_COLORS[order.status]}50`,color:STATUS_COLORS[order.status],textTransform:'capitalize'}}>{order.status}</span>
                  </div>
                </div>
                <div style={{borderTop:`1px solid ${s.border}`,paddingTop:'0.8rem'}}>
                  {order.items.map((item, i) => (
                    <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:'0.82rem',padding:'3px 0',color:s.muted}}>
                      <span>{item.name} ×{item.quantity}</span>
                      <span style={{color:s.cream}}>Rs. {item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                {['pending','confirmed','preparing','ready'].includes(order.status) && (
                  <Link to={`/track/${order.orderId}`} style={{display:'inline-block',marginTop:'0.8rem',fontSize:'0.7rem',color:s.gold,textDecoration:'none',border:`1px solid ${s.border}`,padding:'0.4rem 0.8rem'}}>📍 Track Order →</Link>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── PROFILE ── */}
        {tab === 'profile' && (
          <div style={{maxWidth:'480px'}}>
            <p style={{fontSize:'0.68rem',letterSpacing:'0.25em',textTransform:'uppercase',color:s.gold,marginBottom:'1.5rem'}}>Edit Profile</p>
            {editMsg && <div style={{padding:'0.75rem',marginBottom:'1rem',background:editMsg.startsWith('✅')?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)',border:`1px solid ${editMsg.startsWith('✅')?'rgba(34,197,94,0.3)':'rgba(239,68,68,0.3)'}`,fontSize:'0.83rem',color:editMsg.startsWith('✅')?'#4ade80':'#f87171'}}>{editMsg}</div>}
            <form onSubmit={handleProfileUpdate}>
              {[['Full Name','name','text'],['Phone Number','phone','tel']].map(([label,key,type]) => (
                <div key={key} style={{marginBottom:'1rem'}}>
                  <label style={{display:'block',fontSize:'0.62rem',letterSpacing:'0.2em',textTransform:'uppercase',color:s.muted,marginBottom:'0.4rem'}}>{label}</label>
                  <input type={type} value={editForm[key]} onChange={e => setEditForm(f => ({...f,[key]:e.target.value}))}
                    style={{width:'100%',background:s.d2,border:`1px solid ${s.border}`,color:s.cream,padding:'0.8rem',fontFamily:'"DM Sans",sans-serif',fontSize:'0.9rem',outline:'none',boxSizing:'border-box'}} />
                </div>
              ))}
              <div style={{marginBottom:'1.5rem'}}>
                <label style={{display:'block',fontSize:'0.62rem',letterSpacing:'0.2em',textTransform:'uppercase',color:s.muted,marginBottom:'0.4rem'}}>Email</label>
                <input value={user?.email} disabled style={{width:'100%',background:'rgba(14,11,8,0.5)',border:`1px solid ${s.border}`,color:s.muted,padding:'0.8rem',fontFamily:'"DM Sans",sans-serif',fontSize:'0.9rem',boxSizing:'border-box'}} />
              </div>
              <button type="submit" disabled={loading} style={{background:s.gold,color:s.dark,border:'none',padding:'0.85rem 2rem',fontSize:'0.72rem',letterSpacing:'0.18em',textTransform:'uppercase',cursor:'pointer',fontFamily:'"DM Sans",sans-serif',opacity:loading?0.7:1}}>
                {loading ? 'Saving…' : 'Save Changes →'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
