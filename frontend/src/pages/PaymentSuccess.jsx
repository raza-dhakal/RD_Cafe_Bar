import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const s = { gold:'#C9A84C', cream:'#F5EDD8', dark:'#0E0B08', d2:'#1A1510', border:'rgba(201,168,76,0.18)' };

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const { clearCart } = useCart();
  const orderId = params.get('orderId') || params.get('purchase_order_id');
  const pidx = params.get('pidx');          // Khalti
  const [verifying, setVerifying] = useState(!!pidx);

  useEffect(() => {
    clearCart();
    // If returning from Khalti, verify the payment → confirms order
    if (pidx && orderId) {
      fetch(`${API}/payments/khalti/verify`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pidx, orderId }),
      }).catch(() => {}).finally(() => setVerifying(false));
    }
  }, []);

  return (
    <div style={{minHeight:'100vh',background:s.dark,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'"DM Sans",sans-serif',color:s.cream,padding:'1rem'}}>
      <div style={{textAlign:'center',background:s.d2,border:'1px solid rgba(34,197,94,0.3)',padding:'3rem',maxWidth:'440px',width:'100%'}}>
        <div style={{fontSize:'4rem',marginBottom:'1rem'}}>🎉</div>
        <h1 style={{fontFamily:'"Cormorant Garamond",serif',fontSize:'2rem',fontWeight:300,color:'#4ade80',marginBottom:'0.5rem'}}>
          {verifying ? 'Verifying Payment…' : 'Payment Successful!'}
        </h1>
        <p style={{color:'rgba(245,237,216,0.6)',marginBottom:'1.5rem'}}>Your order is confirmed. Check your Email & SMS for details.</p>
        {orderId && <p style={{color:s.gold,fontFamily:'"Cormorant Garamond",serif',fontSize:'1.2rem',marginBottom:'1.5rem'}}>Order #{orderId}</p>}
        <div style={{display:'flex',gap:'10px',justifyContent:'center',flexWrap:'wrap'}}>
          {orderId && <Link to={`/track/${orderId}`} style={{background:s.gold,color:s.dark,padding:'0.8rem 1.5rem',fontSize:'0.72rem',letterSpacing:'0.15em',textTransform:'uppercase',textDecoration:'none',fontWeight:500}}>Track Order</Link>}
          <Link to="/menu" style={{background:'transparent',border:`1px solid ${s.border}`,color:s.gold,padding:'0.8rem 1.5rem',fontSize:'0.72rem',letterSpacing:'0.15em',textTransform:'uppercase',textDecoration:'none'}}>Order More</Link>
        </div>
      </div>
    </div>
  );
}
