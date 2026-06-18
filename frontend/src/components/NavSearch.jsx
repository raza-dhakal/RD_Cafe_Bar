import { useState, useEffect, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { ALL_ITEMS } from '../data/menuData';

const s = { gold:'#C9A84C', cream:'#F5EDD8', dark:'#0E0B08', d2:'#1A1510', d3:'#241E15', muted:'rgba(245,237,216,0.5)', border:'rgba(201,168,76,0.18)' };

// highlight matched text
function hl(text, q) {
  if (!q.trim()) return text;
  const rx = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi');
  return text.split(rx).map((p, i) => rx.test(p)
    ? <mark key={i} style={{background:'rgba(201,168,76,0.3)',color:s.cream,padding:'0 2px',borderRadius:'2px'}}>{p}</mark>
    : p);
}

export default function NavSearch() {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState('');
  const { addToCart, cart } = useCart();
  const inCart = id => cart.some(i => i._id === id);

  // Esc to close + lock body scroll
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') setOpen(false); };
    if (open) { window.addEventListener('keydown', onKey); document.body.style.overflow = 'hidden'; }
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return ALL_ITEMS.filter(i =>
      i.name.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q) ||
      i.categoryLabel.toLowerCase().includes(q)
    );
  }, [query]);

  const close = () => { setOpen(false); setQuery(''); };

  return (
    <>
      {/* 🔍 Search button (place this in navbar near cart) */}
      <button onClick={() => setOpen(true)} title="Search menu" aria-label="Search menu"
        style={{ background:'transparent', border:'none', color:s.cream, fontSize:'1.1rem', cursor:'pointer', padding:'4px 8px', lineHeight:1, opacity:0.85 }}
        onMouseEnter={e=>e.currentTarget.style.opacity=1}
        onMouseLeave={e=>e.currentTarget.style.opacity=0.85}>
        🔍
      </button>

      {open && (
        <div onClick={close}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(4px)', zIndex:2000, display:'flex', justifyContent:'center', alignItems:'flex-start', padding:'5rem 1rem 1rem', fontFamily:'"DM Sans",sans-serif' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ width:'100%', maxWidth:'640px', background:s.d2, border:`1px solid ${s.border}`, maxHeight:'80vh', display:'flex', flexDirection:'column', boxShadow:'0 20px 60px rgba(0,0,0,0.5)' }}>

            {/* Search input */}
            <div style={{ padding:'1.2rem 1.4rem', borderBottom:`1px solid ${s.border}`, position:'relative' }}>
              <span style={{ position:'absolute', left:'1.6rem', top:'50%', transform:'translateY(-50%)', color:s.muted, fontSize:'1.1rem' }}>🔍</span>
              <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search coffee, beer, wine, cake, sekuwa…"
                style={{ width:'100%', background:s.dark, border:`1px solid ${query?s.gold:s.border}`, color:s.cream, padding:'0.85rem 2.4rem', fontFamily:'"DM Sans",sans-serif', fontSize:'0.95rem', outline:'none', boxSizing:'border-box' }} />
              <button onClick={close}
                style={{ position:'absolute', right:'1.6rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:s.muted, cursor:'pointer', fontSize:'1.2rem' }}>✕</button>
            </div>

            {/* Results */}
            <div style={{ overflowY:'auto', flex:1 }}>
              {!query.trim() ? (
                <div style={{ padding:'3rem 1.5rem', textAlign:'center', color:s.muted }}>
                  <div style={{ fontSize:'2.5rem', opacity:0.3, marginBottom:'0.8rem' }}>☕</div>
                  <p style={{ margin:0, fontSize:'0.85rem' }}>Type to search the full menu — {ALL_ITEMS.length} items</p>
                </div>
              ) : results.length === 0 ? (
                <div style={{ padding:'3rem 1.5rem', textAlign:'center', color:s.muted }}>
                  <div style={{ fontSize:'2.5rem', opacity:0.3, marginBottom:'0.8rem' }}>🔍</div>
                  <p style={{ margin:0, fontSize:'0.9rem' }}>No items found for "<em style={{color:s.gold}}>{query}</em>"</p>
                </div>
              ) : (
                <>
                  <p style={{ padding:'0.8rem 1.4rem 0.4rem', margin:0, fontSize:'0.65rem', letterSpacing:'0.2em', textTransform:'uppercase', color:s.muted }}>
                    {results.length} result{results.length!==1?'s':''}
                  </p>
                  {results.map(item => (
                    <div key={item._id}
                      style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'0.8rem 1.4rem', borderBottom:'1px solid rgba(201,168,76,0.06)' }}>
                      {/* Thumbnail */}
                      <div style={{ width:'52px', height:'52px', flexShrink:0, overflow:'hidden', background:s.dark, borderRadius:'2px' }}>
                        <img src={item.image} alt={item.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}
                          onError={e=>{ e.target.style.display='none'; e.target.parentElement.innerHTML=`<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:1.3rem;opacity:0.3">${item.categoryLabel.split(' ')[0]}</div>`; }} />
                      </div>
                      {/* Info */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ margin:'0 0 2px', fontSize:'0.92rem', color:s.cream }}>{hl(item.name, query)}</p>
                        <p style={{ margin:0, fontSize:'0.68rem', color:s.muted }}>{item.categoryLabel} · Rs. {item.price}</p>
                      </div>
                      {/* Add */}
                      <button onClick={() => addToCart(item)}
                        style={{ flexShrink:0, fontSize:'0.62rem', letterSpacing:'0.12em', textTransform:'uppercase', padding:'0.45rem 0.9rem',
                          border:`1px solid ${inCart(item._id)?s.gold:'rgba(201,168,76,0.3)'}`, background:inCart(item._id)?s.gold:'transparent',
                          color:inCart(item._id)?s.dark:s.gold, cursor:'pointer', fontFamily:'"DM Sans",sans-serif', fontWeight:inCart(item._id)?500:400 }}>
                        {inCart(item._id) ? '✓ Added' : 'Add →'}
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
