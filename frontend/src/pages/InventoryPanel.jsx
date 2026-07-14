import { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const s = { gold:'#C9A84C', cream:'#F5EDD8', dark:'#0E0B08', d2:'#1A1510', d3:'#241E15', muted:'rgba(245,237,216,0.5)', border:'rgba(201,168,76,0.18)', up:'#6FBF73', down:'#D9805F' };

const CATEGORIES = ['milk', 'coffee', 'drinks', 'cake', 'food', 'packaging', 'other'];
const CAT_ICON = { milk:'🥛', coffee:'☕', drinks:'🥤', cake:'🍰', food:'🍽', packaging:'📦', other:'📌' };

export default function InventoryPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ name:'', category:'milk', unit:'L', currentStock:'', reorderLevel:'', autoOrder:false, supplierName:'', supplierEmail:'' });

  const token = localStorage.getItem('rdcafe_token');
  const headers = { 'Content-Type':'application/json', Authorization:`Bearer ${token}` };
  const toast = m => { setMsg(m); setTimeout(() => setMsg(''), 2500); };

  const load = () => {
    setLoading(true);
    fetch(`${API}/admin/inventory`, { headers })
      .then(r => r.json()).then(d => { setItems(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const addItem = async () => {
    if (!form.name) return toast('Name required.');
    const res = await fetch(`${API}/admin/inventory`, { method:'POST', headers, body: JSON.stringify({
      ...form, currentStock: Number(form.currentStock)||0, reorderLevel: Number(form.reorderLevel)||10,
    }) });
    const d = await res.json();
    if (d.success) { setItems(x => [...x, d.data]); setShowAdd(false);
      setForm({ name:'', category:'milk', unit:'L', currentStock:'', reorderLevel:'', autoOrder:false, supplierName:'', supplierEmail:'' });
      toast('✅ Item added!');
    }
  };
  const patch = async (id, body) => {
    const res = await fetch(`${API}/admin/inventory/${id}`, { method:'PATCH', headers, body: JSON.stringify(body) });
    const d = await res.json();
    if (d.success) setItems(x => x.map(i => i._id===id ? d.data : i));
  };
  const adjust = (item, field, delta) => patch(item._id, { [field]: Math.max(0, (item[field]||0) + delta) });
  const del = async id => { if (!confirm('Delete item?')) return; await fetch(`${API}/admin/inventory/${id}`, { method:'DELETE', headers }); setItems(x => x.filter(i => i._id!==id)); toast('Deleted.'); };

  const lowCount = items.filter(i => i.currentStock <= i.reorderLevel).length;
  const autoCount = items.filter(i => i.autoOrder).length;

  const Th = ({ children, r }) => <th style={{fontSize:'0.6rem',letterSpacing:'0.12em',textTransform:'uppercase',color:s.muted,padding:'10px 10px',textAlign:r?'right':'left',borderBottom:`1px solid ${s.border}`,fontWeight:400,whiteSpace:'nowrap'}}>{children}</th>;
  const Td = ({ children, style={} }) => <td style={{padding:'9px 10px',fontSize:'0.83rem',borderBottom:'1px solid rgba(201,168,76,0.06)',...style}}>{children}</td>;
  const StepBtn = ({ onClick, children }) => <button onClick={onClick} style={{background:s.d3,border:`1px solid ${s.border}`,color:s.cream,width:'22px',height:'22px',cursor:'pointer',fontSize:'0.85rem',lineHeight:1,fontFamily:'"DM Sans",sans-serif'}}>{children}</button>;

  return (
    <div>
      {msg && <div style={{background:'rgba(201,168,76,0.1)',border:`1px solid ${s.border}`,color:s.gold,padding:'0.7rem 1rem',marginBottom:'1rem',fontSize:'0.83rem'}}>{msg}</div>}

      {/* Summary */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:'1px',background:s.border,marginBottom:'1.5rem'}}>
        {[['📦', items.length, 'Total Items'], ['⚠️', lowCount, 'Low Stock'], ['⚡', autoCount, 'Auto-order On']].map(([ic,v,l]) => (
          <div key={l} style={{background:s.d2,padding:'1.1rem',textAlign:'center'}}>
            <div style={{fontSize:'1.4rem'}}>{ic}</div>
            <div style={{fontFamily:'"Cormorant Garamond",serif',fontSize:'1.6rem',color:l==='Low Stock'&&v>0?s.down:s.gold}}>{v}</div>
            <div style={{fontSize:'0.6rem',letterSpacing:'0.15em',textTransform:'uppercase',color:s.muted,marginTop:'2px'}}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
        <p style={{fontSize:'0.65rem',letterSpacing:'0.25em',textTransform:'uppercase',color:s.gold,margin:0}}>Inventory</p>
        <button onClick={()=>setShowAdd(!showAdd)} style={{background:s.gold,color:s.dark,border:'none',padding:'0.5rem 1.2rem',fontSize:'0.72rem',letterSpacing:'0.15em',textTransform:'uppercase',cursor:'pointer',fontFamily:'"DM Sans",sans-serif'}}>+ Add Item</button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{background:s.d2,border:`1px solid ${s.border}`,padding:'1.5rem',marginBottom:'1rem',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:'10px',alignItems:'end'}}>
          {[['name','Name *','text','Milk'],['currentStock','In Stock','number','30'],['reorderLevel','Reorder At','number','10']].map(([k,l,t,ph]) => (
            <div key={k}>
              <label style={{display:'block',fontSize:'0.6rem',letterSpacing:'0.15em',textTransform:'uppercase',color:s.muted,marginBottom:'0.3rem'}}>{l}</label>
              <input type={t} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} placeholder={ph}
                style={{width:'100%',background:s.dark,border:`1px solid ${s.border}`,color:s.cream,padding:'0.55rem',fontFamily:'"DM Sans",sans-serif',fontSize:'0.83rem',outline:'none',boxSizing:'border-box'}} />
            </div>
          ))}
          <div>
            <label style={{display:'block',fontSize:'0.6rem',letterSpacing:'0.15em',textTransform:'uppercase',color:s.muted,marginBottom:'0.3rem'}}>Category</label>
            <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} style={{width:'100%',background:s.dark,border:`1px solid ${s.border}`,color:s.cream,padding:'0.55rem',fontFamily:'"DM Sans",sans-serif',fontSize:'0.83rem',outline:'none'}}>
              {CATEGORIES.map(c=><option key={c} value={c}>{CAT_ICON[c]} {c}</option>)}
            </select>
          </div>
          <div>
            <label style={{display:'block',fontSize:'0.6rem',letterSpacing:'0.15em',textTransform:'uppercase',color:s.muted,marginBottom:'0.3rem'}}>Unit</label>
            <input value={form.unit} onChange={e=>setForm(f=>({...f,unit:e.target.value}))} placeholder="L / kg / pcs"
              style={{width:'100%',background:s.dark,border:`1px solid ${s.border}`,color:s.cream,padding:'0.55rem',fontFamily:'"DM Sans",sans-serif',fontSize:'0.83rem',outline:'none',boxSizing:'border-box'}} />
          </div>
          <div>
            <label style={{display:'block',fontSize:'0.6rem',letterSpacing:'0.15em',textTransform:'uppercase',color:s.muted,marginBottom:'0.3rem'}}>Supplier Email</label>
            <input value={form.supplierEmail} onChange={e=>setForm(f=>({...f,supplierEmail:e.target.value}))} placeholder="supplier@email.com"
              style={{width:'100%',background:s.dark,border:`1px solid ${s.border}`,color:s.cream,padding:'0.55rem',fontFamily:'"DM Sans",sans-serif',fontSize:'0.83rem',outline:'none',boxSizing:'border-box'}} />
          </div>
          <label style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'0.8rem',color:s.muted,cursor:'pointer'}}>
            <input type="checkbox" checked={form.autoOrder} onChange={e=>setForm(f=>({...f,autoOrder:e.target.checked}))} style={{accentColor:s.gold}} /> Auto-order
          </label>
          <div style={{display:'flex',gap:'8px'}}>
            <button onClick={addItem} style={{background:s.gold,color:s.dark,border:'none',padding:'0.6rem 1.4rem',fontSize:'0.72rem',cursor:'pointer',fontFamily:'"DM Sans",sans-serif',letterSpacing:'0.12em',textTransform:'uppercase'}}>Save</button>
            <button onClick={()=>setShowAdd(false)} style={{background:'transparent',border:`1px solid ${s.border}`,color:s.muted,padding:'0.6rem 1rem',fontSize:'0.72rem',cursor:'pointer',fontFamily:'"DM Sans",sans-serif'}}>Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? <p style={{color:s.muted,textAlign:'center',padding:'3rem'}}>Loading inventory…</p> : (
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr><Th>Item</Th><Th>Category</Th><Th>In Stock</Th><Th>Sold/Used</Th><Th>Reorder At</Th><Th>Status</Th><Th>Auto</Th><Th r>Action</Th></tr></thead>
          <tbody>
            {items.map(i => {
              const low = i.currentStock <= i.reorderLevel;
              return (
                <tr key={i._id} style={{background: low ? 'rgba(217,128,95,0.06)' : 'transparent'}}>
                  <Td><span style={{marginRight:6}}>{CAT_ICON[i.category]||'📌'}</span>{i.name}</Td>
                  <Td style={{textTransform:'capitalize',color:s.muted}}>{i.category}</Td>
                  <Td>
                    <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                      <StepBtn onClick={()=>adjust(i,'currentStock',-1)}>−</StepBtn>
                      <span style={{minWidth:'52px',textAlign:'center',color:low?s.down:s.cream}}>{i.currentStock} {i.unit}</span>
                      <StepBtn onClick={()=>adjust(i,'currentStock',1)}>+</StepBtn>
                    </div>
                  </Td>
                  <Td>
                    <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                      <StepBtn onClick={()=>adjust(i,'sold',-1)}>−</StepBtn>
                      <span style={{minWidth:'36px',textAlign:'center',color:s.muted}}>{i.sold}</span>
                      <StepBtn onClick={()=>adjust(i,'sold',1)}>+</StepBtn>
                    </div>
                  </Td>
                  <Td style={{color:s.muted}}>{i.reorderLevel} {i.unit}</Td>
                  <Td>{low
                    ? <span style={{color:s.down,fontSize:'0.7rem',border:`1px solid ${s.down}55`,padding:'2px 8px'}}>⚠ LOW — reorder</span>
                    : <span style={{color:s.up,fontSize:'0.7rem',border:`1px solid ${s.up}55`,padding:'2px 8px'}}>✓ OK</span>}
                  </Td>
                  <Td>
                    <button onClick={()=>patch(i._id,{autoOrder:!i.autoOrder})}
                      style={{background:i.autoOrder?'rgba(201,168,76,0.15)':'transparent',border:`1px solid ${i.autoOrder?s.gold:s.border}`,color:i.autoOrder?s.gold:s.muted,padding:'3px 10px',fontSize:'0.68rem',cursor:'pointer',fontFamily:'"DM Sans",sans-serif'}}>
                      {i.autoOrder?'⚡ ON':'OFF'}
                    </button>
                  </Td>
                  <Td style={{textAlign:'right'}}>
                    <button onClick={()=>del(i._id)} style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',color:'#f87171',padding:'3px 10px',fontSize:'0.68rem',cursor:'pointer',fontFamily:'"DM Sans",sans-serif'}}>Delete</button>
                  </Td>
                </tr>
              );
            })}
            {items.length===0 && <tr><td colSpan={8} style={{textAlign:'center',padding:'3rem',color:s.muted}}>No items yet. Click "+ Add Item" to start tracking stock.</td></tr>}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
