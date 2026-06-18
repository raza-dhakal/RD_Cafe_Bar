import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000';
const s = { gold:'#C9A84C', cream:'#F5EDD8', dark:'#0E0B08', d2:'#1A1510', muted:'rgba(245,237,216,0.5)', border:'rgba(201,168,76,0.18)' };

const STEPS = [
  { key:'pending',          label:'Order Placed',      icon:'✅', desc:'Your order has been received' },
  { key:'confirmed',        label:'Confirmed',          icon:'📋', desc:'Restaurant confirmed your order' },
  { key:'preparing',        label:'Preparing',          icon:'👨‍🍳', desc:'Chef is preparing your order' },
  { key:'ready',            label:'Ready',              icon:'🎉', desc:'Your order is ready!' },
  { key:'out-for-delivery', label:'Out for Delivery',   icon:'🛵', desc:'On the way to you' },
  { key:'delivered',        label:'Delivered',          icon:'🏠', desc:'Enjoy your order!' },
];

export default function OrderTracking() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [liveStatus, setLiveStatus] = useState('');

  useEffect(() => {
    // Fetch order
    fetch(`${API}/orders/track/${orderId}`)
      .then(r => r.json())
      .then(d => { if (d.success) setOrder(d.data); else setErr('Order not found.'); })
      .catch(() => setErr('Failed to load order.'))
      .finally(() => setLoading(false));

    // Socket.io real-time
    const socket = io(SOCKET_URL);
    socket.emit('join-order', orderId);
    socket.on('order-status', ({ status }) => {
      setLiveStatus(status);
      setOrder(prev => prev ? { ...prev, status } : prev);
    });
    return () => socket.disconnect();
  }, [orderId]);

  if (loading) return (
    <div style={{minHeight:'100vh',background:s.dark,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'"DM Sans",sans-serif',color:s.muted}}>
      <div style={{textAlign:'center'}}><div style={{fontSize:'2rem',marginBottom:'1rem',animation:'spin 1s linear infinite'}}>☕</div><p>Loading order…</p></div>
    </div>
  );

  if (err || !order) return (
    <div style={{minHeight:'100vh',background:s.dark,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'"DM Sans",sans-serif',color:s.cream,textAlign:'center'}}>
      <div><div style={{fontSize:'3rem',marginBottom:'1rem'}}>❌</div><p style={{color:s.muted}}>{err || 'Order not found.'}</p><Link to="/menu" style={{color:s.gold}}>Go to Menu →</Link></div>
    </div>
  );

  const currentStepIdx = STEPS.findIndex(s => s.key === order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div style={{minHeight:'100vh',background:s.dark,color:s.cream,paddingTop:'90px',paddingBottom:'4rem',fontFamily:'"DM Sans",sans-serif'}}>
      <div style={{maxWidth:'700px',margin:'0 auto',padding:'0 1.5rem'}}>

        {/* Header */}
        <div style={{textAlign:'center',marginBottom:'2.5rem'}}>
          <p style={{fontSize:'0.65rem',letterSpacing:'0.3em',textTransform:'uppercase',color:s.gold,marginBottom:'0.5rem'}}>Live Order Tracking</p>
          <h1 style={{fontFamily:'"Cormorant Garamond",serif',fontSize:'2rem',fontWeight:300,margin:'0 0 0.5rem'}}>
            Order <em style={{fontStyle:'italic',color:s.gold}}>#{order.orderId}</em>
          </h1>
          {liveStatus && (
            <div style={{display:'inline-block',background:'rgba(201,168,76,0.1)',border:`1px solid ${s.border}`,padding:'4px 14px',fontSize:'0.72rem',color:s.gold,marginTop:'0.5rem'}}>
              🔴 Live Update: {liveStatus}
            </div>
          )}
        </div>

        {/* Progress Steps */}
        {!isCancelled ? (
          <div style={{background:s.d2,border:`1px solid ${s.border}`,padding:'2rem',marginBottom:'1.5rem'}}>
            {STEPS.map((step, idx) => {
              const done = idx <= currentStepIdx;
              const active = idx === currentStepIdx;
              return (
                <div key={step.key} style={{display:'flex',gap:'1rem',paddingBottom: idx < STEPS.length-1 ? '1.5rem' : 0, position:'relative'}}>
                  {/* Line */}
                  {idx < STEPS.length-1 && (
                    <div style={{position:'absolute',left:'19px',top:'40px',width:'2px',height:'calc(100% - 16px)',background:done?s.gold:'rgba(201,168,76,0.15)'}} />
                  )}
                  {/* Icon */}
                  <div style={{width:'40px',height:'40px',borderRadius:'50%',border:`2px solid ${done?s.gold:'rgba(201,168,76,0.2)'}`,background:active?s.gold:done?'rgba(201,168,76,0.15)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem',flexShrink:0,transition:'all 0.3s',zIndex:1}}>
                    {done ? (active ? step.icon : '✓') : <span style={{opacity:0.3}}>{step.icon}</span>}
                  </div>
                  {/* Text */}
                  <div style={{paddingTop:'6px'}}>
                    <p style={{margin:'0 0 2px',fontSize:'0.9rem',fontWeight:active?500:400,color:done?s.cream:s.muted}}>{step.label}</p>
                    {active && <p style={{margin:0,fontSize:'0.75rem',color:s.gold}}>{step.desc}</p>}
                    {!active && done && <p style={{margin:0,fontSize:'0.72rem',color:s.muted}}>{step.desc}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.3)',padding:'2rem',textAlign:'center',marginBottom:'1.5rem'}}>
            <div style={{fontSize:'2.5rem',marginBottom:'0.5rem'}}>❌</div>
            <p style={{color:'#f87171',fontFamily:'"Cormorant Garamond",serif',fontSize:'1.3rem',margin:'0 0 0.5rem'}}>Order Cancelled</p>
            <p style={{color:s.muted,fontSize:'0.83rem',margin:0}}>Contact us: <a href="tel:+9779846863458" style={{color:s.gold}}>+977 9846863458</a></p>
          </div>
        )}

        {/* Order Details */}
        <div style={{background:s.d2,border:`1px solid ${s.border}`,padding:'1.5rem',marginBottom:'1.5rem'}}>
          <p style={{fontSize:'0.65rem',letterSpacing:'0.25em',textTransform:'uppercase',color:s.gold,marginBottom:'1rem'}}>Order Details</p>
          {order.items.map((item, i) => (
            <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:`1px solid rgba(201,168,76,0.08)`,fontSize:'0.85rem'}}>
              <span style={{color:s.muted}}>{item.name} ×{item.quantity}{item.specialNote?<em style={{fontSize:'0.72rem',color:'rgba(201,168,76,0.5)',marginLeft:'6px'}}>({item.specialNote})</em>:null}</span>
              <span>Rs. {item.price * item.quantity}</span>
            </div>
          ))}
          <div style={{display:'flex',justifyContent:'space-between',paddingTop:'1rem',fontFamily:'"Cormorant Garamond",serif',fontSize:'1.2rem'}}>
            <span>Total</span><span style={{color:s.gold}}>Rs. {order.totalAmount}</span>
          </div>
        </div>

        {/* Info */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'2rem'}}>
          {[['Order Type',order.orderType],['Payment',order.paymentMethod],['Payment Status',order.paymentStatus],['Placed At',new Date(order.createdAt).toLocaleString()]].map(([l,v])=>(
            <div key={l} style={{background:s.d2,border:`1px solid ${s.border}`,padding:'1rem'}}>
              <p style={{fontSize:'0.6rem',letterSpacing:'0.2em',textTransform:'uppercase',color:s.muted,margin:'0 0 4px'}}>{l}</p>
              <p style={{fontSize:'0.9rem',margin:0,textTransform:'capitalize'}}>{v}</p>
            </div>
          ))}
        </div>

        <div style={{textAlign:'center',display:'flex',gap:'1rem',justifyContent:'center',flexWrap:'wrap'}}>
          <Link to="/menu" style={{background:s.gold,color:s.dark,padding:'0.8rem 2rem',fontSize:'0.72rem',letterSpacing:'0.18em',textTransform:'uppercase',textDecoration:'none',fontWeight:500}}>Order Again</Link>
          <a href="tel:+9779846863458" style={{background:'transparent',border:`1px solid ${s.border}`,color:s.gold,padding:'0.8rem 2rem',fontSize:'0.72rem',letterSpacing:'0.18em',textTransform:'uppercase',textDecoration:'none'}}>📞 Call Us</a>
        </div>
      </div>
    </div>
  );
}
