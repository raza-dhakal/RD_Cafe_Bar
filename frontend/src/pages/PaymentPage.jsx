import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const s = { gold:'#C9A84C', cream:'#F5EDD8', dark:'#0E0B08', d2:'#1A1510', d3:'#241E15', muted:'rgba(245,237,216,0.5)', border:'rgba(201,168,76,0.18)' };

const PAYMENT_METHODS = [
  { id:'esewa',        icon:'📱', label:'eSewa',          desc:"Nepal's #1 digital wallet" },
  { id:'khalti',       icon:'💜', label:'Khalti',         desc:'Digital wallet & QR payment' },
  { id:'card',         icon:'💳', label:'Debit/Credit Card', desc:'Visa, Mastercard, all cards' },
  { id:'cash',         icon:'💵', label:'Cash on Delivery', desc:'Pay when you receive' },
  { id:'bank-transfer',icon:'🏦', label:'Bank Transfer',  desc:'Direct bank payment' },
];

export default function PaymentPage() {
  const { cart, clearCart } = useCart();
  const { user }            = useAuth();
  const navigate            = useNavigate();
  const [method, setMethod] = useState('cash');
  const [orderType, setOrderType] = useState('dine-in');
  const [form, setForm]     = useState({ name:'', phone:'', email:'', address:'', instructions:'' });
  const [loading, setLoading] = useState(false);
  const [err, setErr]       = useState('');

  const subtotal = cart.reduce((sum,i) => sum + i.price * (i.qty||1), 0);
  const deliveryFee = orderType === 'delivery' ? 50 : 0;
  const total = subtotal + deliveryFee;
  const token   = localStorage.getItem('rdcafe_token');
  const headers = { 'Content-Type':'application/json', ...(token?{Authorization:`Bearer ${token}`}:{}) };

  const placeOrder = async () => {
    setErr('');
    if (!cart.length) return setErr('Cart is empty!');
    if (!user && (!form.name.trim() || !form.phone.trim())) return setErr('Please enter your name and phone number.');
    // ✅ ADDRESS REQUIRED for delivery — no order without address
    if (orderType === 'delivery' && !form.address.trim()) return setErr('⚠️ Delivery address is required. Please enter your full address.');
    if (orderType === 'delivery' && form.address.trim().length < 8) return setErr('⚠️ Please enter a complete delivery address.');

    setLoading(true);
    try {
      const orderPayload = {
        items: cart.map(i => ({ menuItemId: i._id, name: i.name, price: i.price, quantity: i.qty||1, specialNote: i.specialNote||'' })),
        orderType, paymentMethod: method,
        specialInstructions: form.instructions,
        ...(orderType==='delivery' && { deliveryAddress: form.address }),
        ...(!user && { guestName: form.name, guestPhone: form.phone, guestEmail: form.email }),
      };

      const res  = await fetch(`${API}/orders`, { method:'POST', headers, body: JSON.stringify(orderPayload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const orderId   = data.data._id;
      const orderCode = data.data.orderId;

      // ── eSewa ──
      if (method === 'esewa') {
        const eRes  = await fetch(`${API}/payments/esewa/initiate`, { method:'POST', headers, body: JSON.stringify({ orderId }) });
        const eData = await eRes.json();
        if (eData.success) {
          const form_el = document.createElement('form');
          form_el.method = 'POST';
          form_el.action = eData.data.paymentUrl;
          const fields = {
            amount: eData.data.amount, tax_amount: 0, total_amount: eData.data.amount,
            transaction_uuid: eData.data.productId, product_code: eData.data.merchantCode,
            product_service_charge: 0, product_delivery_charge: 0,
            success_url: eData.data.successUrl, failure_url: eData.data.failureUrl,
            signed_field_names: 'total_amount,transaction_uuid,product_code',
          };
          Object.entries(fields).forEach(([k,v]) => {
            const input = document.createElement('input');
            input.name = k; input.value = v; form_el.appendChild(input);
          });
          document.body.appendChild(form_el);
          clearCart();
          form_el.submit();
          return;
        }
      }

      // ── Khalti ──
      if (method === 'khalti') {
        const kRes  = await fetch(`${API}/payments/khalti/initiate`, { method:'POST', headers, body: JSON.stringify({ orderId }) });
        const kData = await kRes.json();
        if (kData.success && kData.paymentUrl) {
          clearCart();
          window.location.href = kData.paymentUrl;
          return;
        }
        throw new Error('Khalti payment could not start. Try again.');
      }

      // ── Card / Cash / Bank → straight to tracking ──
      clearCart();
      navigate(`/track/${orderCode}`);

    } catch (e) { setErr(e.message || 'Order failed. Try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{minHeight:'100vh',background:s.dark,color:s.cream,paddingTop:'90px',paddingBottom:'4rem',fontFamily:'"DM Sans",sans-serif'}}>
      <div style={{maxWidth:'900px',margin:'0 auto',padding:'0 1.5rem'}}>
        <div style={{textAlign:'center',marginBottom:'2.5rem'}}>
          <p style={{fontSize:'0.65rem',letterSpacing:'0.3em',textTransform:'uppercase',color:s.gold,marginBottom:'0.5rem'}}>Checkout</p>
          <h1 style={{fontFamily:'"Cormorant Garamond",serif',fontSize:'2rem',fontWeight:300,margin:0}}>Complete Your <em style={{fontStyle:'italic',color:s.gold}}>Order</em></h1>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 360px',gap:'1.5rem',alignItems:'start'}}>
          <div>
            {/* Order Type */}
            <div style={{background:s.d2,border:`1px solid ${s.border}`,padding:'1.5rem',marginBottom:'1rem'}}>
              <p style={{fontSize:'0.65rem',letterSpacing:'0.25em',textTransform:'uppercase',color:s.gold,marginBottom:'1rem'}}>Order Type</p>
              <div style={{display:'flex',gap:'8px'}}>
                {[['dine-in','🍽️','Dine In'],['takeaway','🥡','Takeaway'],['delivery','🛵','Delivery']].map(([val,icon,label]) => (
                  <button key={val} onClick={() => setOrderType(val)}
                    style={{flex:1,padding:'0.8rem',border:`1px solid ${orderType===val?s.gold:s.border}`,background:orderType===val?'rgba(201,168,76,0.1)':'transparent',color:orderType===val?s.gold:s.muted,cursor:'pointer',fontFamily:'"DM Sans",sans-serif',fontSize:'0.8rem'}}>
                    {icon}<br/><span style={{fontSize:'0.68rem',letterSpacing:'0.1em',textTransform:'uppercase'}}>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Guest info */}
            {!user && (
              <div style={{background:s.d2,border:`1px solid ${s.border}`,padding:'1.5rem',marginBottom:'1rem'}}>
                <p style={{fontSize:'0.65rem',letterSpacing:'0.25em',textTransform:'uppercase',color:s.gold,marginBottom:'1rem'}}>Your Info</p>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
                  {[['Name *','name','text','Your name'],['Phone *','phone','tel','+977 98XXXXXXXX'],['Email','email','email','you@email.com']].map(([label,key,type,ph]) => (
                    <div key={key} style={{gridColumn:key==='email'?'1/-1':'auto'}}>
                      <label style={{display:'block',fontSize:'0.6rem',letterSpacing:'0.18em',textTransform:'uppercase',color:s.muted,marginBottom:'0.3rem'}}>{label}</label>
                      <input type={type} placeholder={ph} value={form[key]} onChange={e => setForm(f=>({...f,[key]:e.target.value}))}
                        style={{width:'100%',background:s.dark,border:`1px solid ${s.border}`,color:s.cream,padding:'0.7rem',fontFamily:'"DM Sans",sans-serif',fontSize:'0.85rem',outline:'none',boxSizing:'border-box'}} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery address — REQUIRED */}
            {orderType === 'delivery' && (
              <div style={{background:s.d2,border:`1px solid ${form.address.trim() ? s.border : 'rgba(239,68,68,0.4)'}`,padding:'1.5rem',marginBottom:'1rem'}}>
                <p style={{fontSize:'0.65rem',letterSpacing:'0.25em',textTransform:'uppercase',color:s.gold,marginBottom:'0.3rem'}}>Delivery Address <span style={{color:'#f87171'}}>*</span></p>
                <p style={{fontSize:'0.7rem',color:s.muted,marginBottom:'0.8rem'}}>Required — order will not be placed without an address.</p>
                <textarea value={form.address} onChange={e => setForm(f=>({...f,address:e.target.value}))} placeholder="Full address: ward, tole, landmark, city..."
                  style={{width:'100%',background:s.dark,border:`1px solid ${s.border}`,color:s.cream,padding:'0.7rem',fontFamily:'"DM Sans",sans-serif',fontSize:'0.85rem',outline:'none',resize:'vertical',minHeight:'80px',boxSizing:'border-box'}} />
              </div>
            )}

            {/* Special instructions */}
            <div style={{background:s.d2,border:`1px solid ${s.border}`,padding:'1.5rem',marginBottom:'1rem'}}>
              <p style={{fontSize:'0.65rem',letterSpacing:'0.25em',textTransform:'uppercase',color:s.gold,marginBottom:'0.8rem'}}>Special Instructions (optional)</p>
              <textarea value={form.instructions} onChange={e => setForm(f=>({...f,instructions:e.target.value}))} placeholder="Any special requests? Allergies? Extra sauce?"
                style={{width:'100%',background:s.dark,border:`1px solid ${s.border}`,color:s.cream,padding:'0.7rem',fontFamily:'"DM Sans",sans-serif',fontSize:'0.85rem',outline:'none',resize:'vertical',minHeight:'70px',boxSizing:'border-box'}} />
            </div>

            {/* Payment Methods */}
            <div style={{background:s.d2,border:`1px solid ${s.border}`,padding:'1.5rem'}}>
              <p style={{fontSize:'0.65rem',letterSpacing:'0.25em',textTransform:'uppercase',color:s.gold,marginBottom:'1rem'}}>Payment Method</p>
              <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                {PAYMENT_METHODS.map(pm => (
                  <div key={pm.id} onClick={() => setMethod(pm.id)}
                    style={{display:'flex',alignItems:'center',gap:'12px',padding:'1rem',border:`1px solid ${method===pm.id?s.gold:s.border}`,background:method===pm.id?'rgba(201,168,76,0.08)':'transparent',cursor:'pointer'}}>
                    <span style={{fontSize:'1.4rem'}}>{pm.icon}</span>
                    <div style={{flex:1}}>
                      <p style={{margin:0,fontSize:'0.9rem',color:method===pm.id?s.cream:s.muted}}>{pm.label}</p>
                      <p style={{margin:0,fontSize:'0.72rem',color:'rgba(245,237,216,0.35)'}}>{pm.desc}</p>
                    </div>
                    <div style={{width:'18px',height:'18px',borderRadius:'50%',border:`2px solid ${method===pm.id?s.gold:s.border}`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                      {method===pm.id && <div style={{width:'8px',height:'8px',borderRadius:'50%',background:s.gold}} />}
                    </div>
                  </div>
                ))}
              </div>
              {(method==='esewa'||method==='khalti'||method==='card') && (
                <p style={{fontSize:'0.7rem',color:s.gold,marginTop:'0.8rem',marginBottom:0}}>✅ Order confirms automatically once payment is received.</p>
              )}
              {(method==='cash'||method==='bank-transfer') && (
                <p style={{fontSize:'0.7rem',color:s.muted,marginTop:'0.8rem',marginBottom:0}}>📋 Order will be confirmed by RD Café after payment is received.</p>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div style={{position:'sticky',top:'90px'}}>
            <div style={{background:s.d2,border:`1px solid ${s.border}`,padding:'1.5rem'}}>
              <p style={{fontSize:'0.65rem',letterSpacing:'0.25em',textTransform:'uppercase',color:s.gold,marginBottom:'1.2rem'}}>Order Summary</p>
              <div style={{maxHeight:'250px',overflowY:'auto',marginBottom:'1rem'}}>
                {cart.map(item => (
                  <div key={item._id} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid rgba(201,168,76,0.07)',fontSize:'0.82rem'}}>
                    <span style={{color:s.muted}}>{item.name} <span style={{color:s.gold}}>×{item.qty||1}</span></span>
                    <span>Rs. {item.price * (item.qty||1)}</span>
                  </div>
                ))}
              </div>
              <div style={{borderTop:`1px solid ${s.border}`,paddingTop:'1rem',marginBottom:'1.5rem'}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.82rem',color:s.muted,marginBottom:'0.4rem'}}><span>Subtotal</span><span>Rs. {subtotal}</span></div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.82rem',color:s.muted,marginBottom:'0.8rem'}}><span>Delivery</span><span>{deliveryFee?`Rs. ${deliveryFee}`:'Free'}</span></div>
                <div style={{display:'flex',justifyContent:'space-between',fontFamily:'"Cormorant Garamond",serif',fontSize:'1.3rem'}}>
                  <span>Total</span><span style={{color:s.gold}}>Rs. {total}</span>
                </div>
              </div>
              {err && <div style={{background:'rgba(220,38,38,0.1)',border:'1px solid rgba(220,38,38,0.3)',color:'#f87171',padding:'0.7rem',marginBottom:'1rem',fontSize:'0.78rem'}}>{err}</div>}
              <button onClick={placeOrder} disabled={loading||!cart.length}
                style={{width:'100%',background:s.gold,color:s.dark,border:'none',padding:'1rem',fontSize:'0.75rem',letterSpacing:'0.2em',textTransform:'uppercase',fontWeight:500,cursor:'pointer',fontFamily:'"DM Sans",sans-serif',opacity:loading||!cart.length?0.6:1}}>
                {loading ? 'Processing…' : method==='esewa' ? '📱 Pay with eSewa' : method==='khalti' ? '💜 Pay with Khalti' : method==='card' ? '💳 Pay with Card' : '✅ Place Order'}
              </button>
              <p style={{fontSize:'0.68rem',color:s.muted,textAlign:'center',marginTop:'0.8rem',marginBottom:0}}>🔒 Secure · SMS + Email confirmation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
