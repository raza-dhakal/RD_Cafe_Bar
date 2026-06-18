import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const s = { gold:'#C9A84C', cream:'#F5EDD8', dark:'#0E0B08', d2:'#1A1510', muted:'rgba(245,237,216,0.5)', border:'rgba(201,168,76,0.18)' };

export default function CartDrawer() {
  const { cart, isOpen, setIsOpen, updateQty, removeFromCart, updateNote, clearCart, count, total } = useCart();
  const navigate = useNavigate();
  const [showNotes, setShowNotes] = useState({});

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div onClick={() => setIsOpen(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:1000,backdropFilter:'blur(2px)'}} />

      {/* Drawer */}
      <div style={{position:'fixed',top:0,right:0,bottom:0,width:'100%',maxWidth:'420px',background:s.d2,zIndex:1001,display:'flex',flexDirection:'column',fontFamily:'"DM Sans",sans-serif',color:s.cream,borderLeft:`1px solid ${s.border}`}}>

        {/* Header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'1.2rem 1.5rem',borderBottom:`1px solid ${s.border}`}}>
          <div>
            <p style={{fontSize:'0.6rem',letterSpacing:'0.3em',textTransform:'uppercase',color:s.gold,margin:'0 0 2px'}}>Your Cart</p>
            <h2 style={{fontFamily:'"Cormorant Garamond",serif',fontSize:'1.4rem',fontWeight:300,margin:0}}>{count} item{count!==1?'s':''}</h2>
          </div>
          <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
            {cart.length>0&&<button onClick={clearCart} style={{background:'transparent',border:'none',color:'rgba(239,68,68,0.6)',fontSize:'0.7rem',cursor:'pointer',fontFamily:'"DM Sans",sans-serif'}}>Clear all</button>}
            <button onClick={() => setIsOpen(false)} style={{background:'transparent',border:'none',color:s.muted,fontSize:'1.3rem',cursor:'pointer',lineHeight:1,padding:'4px'}}>✕</button>
          </div>
        </div>

        {/* Items */}
        <div style={{flex:1,overflowY:'auto',padding:'1rem 1.5rem'}}>
          {cart.length === 0 ? (
            <div style={{textAlign:'center',paddingTop:'4rem'}}>
              <div style={{fontSize:'3rem',marginBottom:'1rem',opacity:0.3}}>🛒</div>
              <p style={{color:s.muted,fontFamily:'"Cormorant Garamond",serif',fontSize:'1.2rem',fontWeight:300}}>Your cart is empty</p>
              <button onClick={() => { setIsOpen(false); navigate('/menu'); }}
                style={{marginTop:'1rem',background:s.gold,color:s.dark,border:'none',padding:'0.7rem 1.5rem',fontSize:'0.72rem',letterSpacing:'0.15em',textTransform:'uppercase',cursor:'pointer',fontFamily:'"DM Sans",sans-serif'}}>
                Browse Menu
              </button>
            </div>
          ) : cart.map(item => (
            <div key={item._id} style={{borderBottom:`1px solid rgba(201,168,76,0.08)`,paddingBottom:'1rem',marginBottom:'1rem'}}>
              <div style={{display:'flex',gap:'10px',alignItems:'flex-start'}}>
                {/* Image */}
                {item.image && (
                  <div style={{width:'52px',height:'52px',flexShrink:0,overflow:'hidden',borderRadius:'2px'}}>
                    <img src={item.image} alt={item.name} style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>e.target.style.display='none'} />
                  </div>
                )}
                <div style={{flex:1}}>
                  <p style={{margin:'0 0 2px',fontSize:'0.9rem',fontWeight:500}}>{item.name}</p>
                  <p style={{margin:'0 0 8px',fontSize:'0.78rem',color:s.gold}}>Rs. {item.price}</p>
                  {/* Quantity */}
                  <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                    <div style={{display:'flex',alignItems:'center',border:`1px solid ${s.border}`}}>
                      <button onClick={() => updateQty(item._id, (item.qty||1)-1)}
                        style={{width:'28px',height:'28px',background:'transparent',border:'none',color:s.gold,cursor:'pointer',fontSize:'1rem',lineHeight:1,display:'flex',alignItems:'center',justifyContent:'center'}}>−</button>
                      <span style={{width:'28px',textAlign:'center',fontSize:'0.85rem'}}>{item.qty||1}</span>
                      <button onClick={() => updateQty(item._id, (item.qty||1)+1)}
                        style={{width:'28px',height:'28px',background:'transparent',border:'none',color:s.gold,cursor:'pointer',fontSize:'1rem',lineHeight:1,display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
                    </div>
                    <button onClick={() => setShowNotes(n => ({...n,[item._id]:!n[item._id]}))}
                      style={{background:'transparent',border:`1px solid ${s.border}`,color:s.muted,padding:'4px 8px',fontSize:'0.65rem',cursor:'pointer',fontFamily:'"DM Sans",sans-serif'}}>
                      {item.specialNote ? '📝 Note' : '+ Note'}
                    </button>
                    <span style={{marginLeft:'auto',fontSize:'0.9rem',color:s.cream}}>Rs. {item.price * (item.qty||1)}</span>
                    <button onClick={() => removeFromCart(item._id)} style={{background:'transparent',border:'none',color:'rgba(239,68,68,0.5)',cursor:'pointer',fontSize:'1rem',padding:'0 2px'}}>×</button>
                  </div>
                  {/* Special note */}
                  {showNotes[item._id] && (
                    <input type="text" placeholder="Special instructions (no sugar, extra sauce...)" value={item.specialNote||''} onChange={e => updateNote(item._id, e.target.value)}
                      style={{width:'100%',marginTop:'8px',background:s.dark,border:`1px solid ${s.border}`,color:s.cream,padding:'0.5rem',fontFamily:'"DM Sans",sans-serif',fontSize:'0.78rem',outline:'none',boxSizing:'border-box'}} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{borderTop:`1px solid ${s.border}`,padding:'1.2rem 1.5rem'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.5rem',fontSize:'0.83rem',color:s.muted}}>
              <span>Subtotal ({count} items)</span><span>Rs. {total}</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',fontFamily:'"Cormorant Garamond",serif',fontSize:'1.3rem',marginBottom:'1.2rem'}}>
              <span>Total</span><span style={{color:s.gold}}>Rs. {total}</span>
            </div>
            <Link to="/checkout" onClick={() => setIsOpen(false)}
              style={{display:'block',textAlign:'center',background:s.gold,color:s.dark,padding:'0.9rem',fontSize:'0.75rem',letterSpacing:'0.2em',textTransform:'uppercase',fontWeight:500,textDecoration:'none',fontFamily:'"DM Sans",sans-serif'}}>
              Proceed to Checkout →
            </Link>
            <button onClick={() => { setIsOpen(false); navigate('/menu'); }}
              style={{display:'block',width:'100%',marginTop:'8px',background:'transparent',border:`1px solid ${s.border}`,color:s.muted,padding:'0.7rem',fontSize:'0.72rem',letterSpacing:'0.15em',textTransform:'uppercase',cursor:'pointer',fontFamily:'"DM Sans",sans-serif',textAlign:'center'}}>
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
