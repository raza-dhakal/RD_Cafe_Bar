import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { MENU_DATA, CAT_ORDER } from '../data/menuData';

export default function Menu() {
  const [activeTab, setActiveTab] = useState('hot');
  const { addToCart, cart } = useCart();
  const inCart = (id) => cart.some(i => i._id === id);
  const cat = MENU_DATA[activeTab];

  return (
    <div className="min-h-screen pt-20 pb-16" style={{background:'#0E0B08'}}>

      {/* Category cover banner */}
      <div className="relative h-48 overflow-hidden mb-0">
        <img src={cat.cover} alt={cat.label}
          className="w-full h-full object-cover"
          onError={e=>{e.target.style.display='none'}} />
        <div className="absolute inset-0" style={{background:'linear-gradient(to bottom, rgba(14,11,8,0.3), rgba(14,11,8,0.85))'}} />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
          <p style={{fontSize:'0.65rem',letterSpacing:'0.3em',textTransform:'uppercase',color:'#C9A84C',marginBottom:'0.4rem'}}>Curated Selection</p>
          <h1 style={{fontFamily:'"Cormorant Garamond",serif',fontSize:'clamp(2rem,5vw,3rem)',fontWeight:300,color:'#F5EDD8',lineHeight:1}}>
            {cat.label.split(' ').slice(1).join(' ')} <em style={{fontStyle:'italic',color:'#C9A84C'}}>Menu</em>
          </h1>
        </div>
      </div>

      {/* Tabs — horizontal scroll */}
      <div style={{background:'rgba(14,11,8,0.95)',borderBottom:'1px solid rgba(201,168,76,0.15)',position:'sticky',top:'60px',zIndex:40}}>
        <div style={{display:'flex',overflowX:'auto',scrollbarWidth:'none',padding:'0 1rem'}}>
          {CAT_ORDER.map(key => {
            const c = MENU_DATA[key];
            return (
              <button key={key} onClick={() => setActiveTab(key)}
                style={{
                  padding:'0.85rem 1.2rem',
                  fontSize:'0.7rem',
                  letterSpacing:'0.15em',
                  textTransform:'uppercase',
                  whiteSpace:'nowrap',
                  background:'transparent',
                  border:'none',
                  borderBottom: activeTab===key ? '2px solid #C9A84C' : '2px solid transparent',
                  color: activeTab===key ? '#C9A84C' : 'rgba(245,237,216,0.5)',
                  cursor:'pointer',
                  transition:'all 0.2s',
                  fontFamily:'"DM Sans",sans-serif',
                }}>
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Item count */}
      <div style={{padding:'1rem 1.5rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{fontSize:'0.72rem',letterSpacing:'0.15em',textTransform:'uppercase',color:'rgba(245,237,216,0.4)'}}>
          {cat.items.length} items
        </span>
        <span style={{fontSize:'0.72rem',color:'rgba(201,168,76,0.6)'}}>
          {cart.length > 0 ? `${cart.reduce((s,i)=>s+i.qty,0)} in cart` : ''}
        </span>
      </div>

      {/* Grid */}
      <div style={{
        display:'grid',
        gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))',
        gap:'1px',
        background:'rgba(201,168,76,0.08)',
        margin:'0 0 2rem',
      }}>
        {cat.items.map(item => (
          <div key={item._id}
            style={{ background:'#1A1510', position:'relative', overflow:'hidden', transition:'background 0.25s' }}
            onMouseEnter={e=>e.currentTarget.style.background='#241E15'}
            onMouseLeave={e=>e.currentTarget.style.background='#1A1510'}
          >
            {/* Image */}
            <div style={{height:'200px',overflow:'hidden',background:'#0E0B08'}}>
              <img src={item.image} alt={item.name}
                style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.5s'}}
                onMouseEnter={e=>e.target.style.transform='scale(1.05)'}
                onMouseLeave={e=>e.target.style.transform='scale(1)'}
                onError={e=>{
                  e.target.style.display='none';
                  e.target.parentElement.innerHTML=`<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:3rem;opacity:0.15">${cat.label.split(' ')[0]}</div>`;
                }}
              />
            </div>

            {/* Content */}
            <div style={{padding:'1.2rem 1.5rem'}}>
              <h3 style={{fontFamily:'"Cormorant Garamond",serif',fontSize:'1.2rem',fontWeight:400,color:'#F5EDD8',marginBottom:'0.4rem'}}>{item.name}</h3>
              <p style={{fontSize:'0.75rem',color:'rgba(245,237,216,0.45)',lineHeight:1.65,marginBottom:'1.2rem'}}>{item.description}</p>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontFamily:'"Cormorant Garamond",serif',fontSize:'1.15rem',color:'#C9A84C',fontWeight:400}}>Rs. {item.price}</span>
                <button
                  onClick={() => addToCart(item)}
                  style={{
                    fontSize:'0.65rem', letterSpacing:'0.15em', textTransform:'uppercase', padding:'0.45rem 1rem',
                    border: inCart(item._id) ? '1px solid #C9A84C' : '1px solid rgba(201,168,76,0.3)',
                    background: inCart(item._id) ? '#C9A84C' : 'transparent',
                    color: inCart(item._id) ? '#0E0B08' : '#C9A84C',
                    cursor:'pointer', transition:'all 0.2s', fontFamily:'"DM Sans",sans-serif',
                    fontWeight: inCart(item._id) ? 500 : 400,
                  }}
                  onMouseEnter={e=>{ if(!inCart(item._id)){e.target.style.background='#C9A84C';e.target.style.color='#0E0B08';}}}
                  onMouseLeave={e=>{ if(!inCart(item._id)){e.target.style.background='transparent';e.target.style.color='#C9A84C';}}}
                >
                  {inCart(item._id) ? '✓ Added' : 'Add →'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
