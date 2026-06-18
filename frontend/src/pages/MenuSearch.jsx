import { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';

const API_BASE = '';
const IMG = {
  hc: `${API_BASE}/Coffee/Hot Coffee`,
  cc: `${API_BASE}/Coffee/Cold Coffee`,
  tea: `${API_BASE}/Tea`,
  sd: `${API_BASE}/Soft Drinks`,
  beer: `${API_BASE}/Beer`,
  wine: `${API_BASE}/Wine`,
  food: `${API_BASE}/Food & Grill`,
};

const ALL_ITEMS = [
  { _id:'hc1', cat:'Hot Coffee',   image:`${IMG.hc}/Classic Espresso.jpg`,  name:'Classic Espresso',    price:180, tags:['espresso','hot','coffee'] },
  { _id:'hc2', cat:'Hot Coffee',   image:`${IMG.hc}/Cappuccino.jpg`,         name:'Cappuccino',          price:220, tags:['cappuccino','hot','milk'] },
  { _id:'hc3', cat:'Hot Coffee',   image:`${IMG.hc}/Cafe Latte.jpg`,         name:'Café Latte',          price:220, tags:['latte','hot','milk'] },
  { _id:'hc4', cat:'Hot Coffee',   image:`${IMG.hc}/Caramel Latte.jpg`,      name:'Caramel Latte',       price:240, tags:['caramel','sweet','hot'] },
  { _id:'hc5', cat:'Hot Coffee',   image:`${IMG.hc}/Matcha Latte.jpg`,       name:'Matcha Latte',        price:240, tags:['matcha','japanese','hot'], isVeg:true },
  { _id:'hc6', cat:'Hot Coffee',   image:`${IMG.hc}/Rd Signature Coffee.jpg`,name:'RD Signature Coffee', price:260, tags:['signature','special','hot'] },
  { _id:'hc7', cat:'Hot Coffee',   image:`${IMG.hc}/Hazelnut Mocha.jpg`,     name:'Hazelnut Mocha',      price:250, tags:['mocha','hazelnut','chocolate'] },
  { _id:'hc8', cat:'Hot Coffee',   image:`${IMG.hc}/Honey Cinnamon Latte.jpg`,name:'Honey Cinnamon Latte',price:240, tags:['honey','cinnamon','spice'], isVeg:true },
  { _id:'cc1', cat:'Cold Coffee',  image:`${IMG.cc}/Iced Americano.jpg`,     name:'Iced Americano',      price:220, tags:['iced','cold','americano'] },
  { _id:'cc2', cat:'Cold Coffee',  image:`${IMG.cc}/Caramel Iced Latte.jpg`, name:'Caramel Iced Latte',  price:250, tags:['caramel','cold','sweet'] },
  { _id:'cc3', cat:'Cold Coffee',  image:`${IMG.cc}/Rd Cold Brew Special.jpg`,name:'RD Cold Brew Special',price:270, tags:['cold brew','special','strong'] },
  { _id:'cc4', cat:'Cold Coffee',  image:`${IMG.cc}/Coffee Float.jpg`,       name:'Coffee Float',        price:260, tags:['float','ice cream','special'] },
  { _id:'cc5', cat:'Cold Coffee',  image:`${IMG.cc}/Ice Matcha Latte.jpg`,   name:'Ice Matcha Latte',    price:250, tags:['matcha','cold','japanese'], isVeg:true },
  { _id:'t1',  cat:'Tea',          image:`${IMG.tea}/japanese green tea.jpg`, name:'Japanese Green Tea',  price:180, tags:['japanese','green','sencha'], isVeg:true },
  { _id:'t2',  cat:'Tea',          image:`${IMG.tea}/Royal milk tea.jpg`,     name:'Royal Milk Tea',      price:220, tags:['milk tea','japanese','royal'], isVeg:true },
  { _id:'t3',  cat:'Tea',          image:`${IMG.tea}/Chai Masala tea.jpg`,    name:'Chai Masala Tea',     price:200, tags:['masala','spicy','nepali'], isVeg:true },
  { _id:'t4',  cat:'Tea',          image:`${IMG.tea}/Earl Grey Tea.jpg`,      name:'Earl Grey Tea',       price:190, tags:['earl grey','bergamot','classic'], isVeg:true },
  { _id:'t5',  cat:'Tea',          image:`${IMG.tea}/Peach Iced Tea.jpg`,     name:'Peach Iced Tea',      price:210, tags:['peach','iced','fruit'], isVeg:true },
  { _id:'sd1', cat:'Soft Drinks',  image:`${IMG.sd}/Coca Cola.jpg`,           name:'Coca-Cola',           price:120, tags:['soda','cola','cold'], isVeg:true },
  { _id:'sd2', cat:'Soft Drinks',  image:`${IMG.sd}/Melon Soda.jpg`,          name:'Melon Soda',          price:130, tags:['melon','japanese','sweet'], isVeg:true },
  { _id:'sd3', cat:'Soft Drinks',  image:`${IMG.sd}/Red Bull.jpg`,            name:'Red Bull',            price:180, tags:['energy','drink'], isVeg:true },
  { _id:'sd4', cat:'Soft Drinks',  image:`${IMG.sd}/Yuzu Sparkling.jpg`,      name:'Yuzu Sparkling',      price:150, tags:['yuzu','japanese','sparkling'], isVeg:true },
  { _id:'b1',  cat:'Beer',         image:`${IMG.beer}/Asahi Super Dry.jpg`,   name:'Asahi Super Dry',     price:260, tags:['japanese','beer','dry'] },
  { _id:'b2',  cat:'Beer',         image:`${IMG.beer}/Sapporo Premium.jpg`,   name:'Sapporo Premium',     price:260, tags:['japanese','beer','premium'] },
  { _id:'b3',  cat:'Beer',         image:`${IMG.beer}/Kirin Ichiban.jpg`,     name:'Kirin Ichiban',       price:260, tags:['japanese','beer','kirin'] },
  { _id:'b4',  cat:'Beer',         image:`${IMG.beer}/Yebisu Premimu.jpg`,    name:'Yebisu Premium',      price:280, tags:['japanese','beer','premium'] },
  { _id:'w1',  cat:'Wine',         image:`${IMG.wine}/House Red Wine.jpg`,    name:'House Red Wine',      price:500, tags:['red','wine','house'] },
  { _id:'w2',  cat:'Wine',         image:`${IMG.wine}/Cloudy Bay Sauvignon Blanc.jpg`, name:'Sauvignon Blanc', price:600, tags:['white','wine','crisp'] },
  { _id:'w3',  cat:'Wine',         image:`${IMG.wine}/Fresco Moscato.jpg`,    name:'Moscato',             price:550, tags:['sweet','sparkling','moscato'] },
  { _id:'f1',  cat:'Food & Grill', image:`${IMG.food}/Grilled Chicken Salad.jpg`, name:'Grilled Chicken Salad', price:380, tags:['chicken','salad','healthy','grill'] },
  { _id:'f2',  cat:'Food & Grill', image:`${IMG.food}/Chicken Tikka.jpg`,     name:'Chicken Tikka',       price:480, tags:['chicken','tikka','nepali','spicy'] },
  { _id:'f3',  cat:'Food & Grill', image:`${IMG.food}/Chicken Sekuwa.jpg`,    name:'Chicken Sekuwa',      price:450, tags:['sekuwa','nepali','grill','chicken'] },
  { _id:'f4',  cat:'Food & Grill', image:`${IMG.food}/Fish & Cips.jpg`,       name:'Fish & Chips',        price:520, tags:['fish','chips','fried'] },
  { _id:'f5',  cat:'Food & Grill', image:`${IMG.food}/Caesar Salad.jpg`,      name:'Caesar Salad',        price:320, tags:['salad','caesar','vegetarian'], isVeg:true },
];

const CATS = ['All','Hot Coffee','Cold Coffee','Tea','Soft Drinks','Beer','Wine','Food & Grill'];
const s = { gold:'#C9A84C', cream:'#F5EDD8', dark:'#0E0B08', d2:'#1A1510', d3:'#241E15', muted:'rgba(245,237,216,0.5)', border:'rgba(201,168,76,0.18)' };

function highlight(text, q) {
  if (!q.trim()) return text;
  const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi');
  return text.split(regex).map((p, i) =>
    regex.test(p) ? <mark key={i} style={{background:'rgba(201,168,76,0.25)',color:s.cream,borderRadius:'2px',padding:'0 2px'}}>{p}</mark> : p
  );
}

export default function MenuSearch() {
  const [query, setQuery]   = useState('');
  const [cat, setCat]       = useState('All');
  const [sort, setSort]     = useState('default');
  const [vegOnly, setVeg]   = useState(false);
  const [maxPrice, setMax]  = useState(1000);
  const { addToCart, cart } = useCart();
  const inCart = id => cart.some(i => i._id === id);

  const results = useMemo(() => {
    let items = ALL_ITEMS;
    if (cat !== 'All') items = items.filter(i => i.cat === cat);
    if (vegOnly) items = items.filter(i => i.isVeg);
    if (maxPrice < 1000) items = items.filter(i => i.price <= maxPrice);
    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(q) || i.cat.toLowerCase().includes(q) || i.tags?.some(t => t.includes(q)));
    }
    if (sort === 'price-asc')  return [...items].sort((a,b) => a.price - b.price);
    if (sort === 'price-desc') return [...items].sort((a,b) => b.price - a.price);
    if (sort === 'name')       return [...items].sort((a,b) => a.name.localeCompare(b.name));
    return items;
  }, [query, cat, sort, vegOnly, maxPrice]);

  return (
    <div style={{minHeight:'100vh',background:s.dark,color:s.cream,paddingTop:'75px',fontFamily:'"DM Sans",sans-serif'}}>

      {/* Search bar */}
      <div style={{background:s.d2,borderBottom:`1px solid ${s.border}`,padding:'1.5rem',position:'sticky',top:'60px',zIndex:40}}>
        <div style={{maxWidth:'1100px',margin:'0 auto'}}>
          <p style={{fontSize:'0.62rem',letterSpacing:'0.3em',textTransform:'uppercase',color:s.gold,marginBottom:'0.8rem'}}>Search Menu</p>
          <div style={{position:'relative',marginBottom:'1rem'}}>
            <span style={{position:'absolute',left:'1rem',top:'50%',transform:'translateY(-50%)',color:s.muted}}>🔍</span>
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Coffee, matcha, beer, chicken sekuwa..."
              style={{width:'100%',background:s.d3,border:`1px solid ${query?s.gold:s.border}`,color:s.cream,padding:'0.85rem 1rem 0.85rem 3rem',fontFamily:'"DM Sans",sans-serif',fontSize:'0.95rem',outline:'none',boxSizing:'border-box',transition:'border-color 0.2s'}} />
            {query && <button onClick={()=>setQuery('')} style={{position:'absolute',right:'1rem',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:s.muted,cursor:'pointer',fontSize:'1.1rem'}}>✕</button>}
          </div>

          {/* Filters */}
          <div style={{display:'flex',gap:'8px',flexWrap:'wrap',alignItems:'center'}}>
            <div style={{display:'flex',overflowX:'auto',border:`1px solid ${s.border}`}}>
              {CATS.map(c => (
                <button key={c} onClick={()=>setCat(c)}
                  style={{padding:'0.45rem 0.9rem',fontSize:'0.68rem',letterSpacing:'0.1em',textTransform:'uppercase',whiteSpace:'nowrap',background:cat===c?s.gold:'transparent',border:'none',borderRight:`1px solid ${s.border}`,color:cat===c?s.dark:s.muted,cursor:'pointer',fontFamily:'"DM Sans",sans-serif'}}>
                  {c}
                </button>
              ))}
            </div>
            <select value={sort} onChange={e=>setSort(e.target.value)}
              style={{background:s.d3,border:`1px solid ${s.border}`,color:s.cream,padding:'0.45rem 0.8rem',fontSize:'0.72rem',fontFamily:'"DM Sans",sans-serif',outline:'none',cursor:'pointer'}}>
              <option value="default">Default</option>
              <option value="price-asc">Price ↑</option>
              <option value="price-desc">Price ↓</option>
              <option value="name">A → Z</option>
            </select>
            <label style={{display:'flex',alignItems:'center',gap:'6px',cursor:'pointer',fontSize:'0.78rem',color:s.muted}}>
              <input type="checkbox" checked={vegOnly} onChange={e=>setVeg(e.target.checked)} style={{accentColor:s.gold}} /> 🥦 Veg only
            </label>
            <div style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'0.75rem',color:s.muted}}>
              <span>Max:</span>
              <input type="range" min={100} max={1000} step={50} value={maxPrice} onChange={e=>setMax(Number(e.target.value))}
                style={{accentColor:s.gold,width:'100px'}} />
              <span style={{color:s.gold}}>Rs.{maxPrice}</span>
            </div>
            <span style={{marginLeft:'auto',fontSize:'0.75rem',color:s.muted}}>{results.length} result{results.length!==1?'s':''}</span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div style={{maxWidth:'1200px',margin:'0 auto',padding:'1.5rem'}}>
        {results.length === 0 ? (
          <div style={{textAlign:'center',padding:'5rem'}}>
            <div style={{fontSize:'3rem',opacity:0.25,marginBottom:'1rem'}}>🔍</div>
            <p style={{fontFamily:'"Cormorant Garamond",serif',fontSize:'1.5rem',fontWeight:300,color:s.muted}}>No results for "<em style={{color:s.gold}}>{query}</em>"</p>
            <button onClick={()=>{setQuery('');setCat('All');setVeg(false);setMax(1000);}}
              style={{marginTop:'1.5rem',background:s.gold,color:s.dark,border:'none',padding:'0.7rem 1.5rem',fontSize:'0.72rem',letterSpacing:'0.15em',textTransform:'uppercase',cursor:'pointer',fontFamily:'"DM Sans",sans-serif'}}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:'1px',background:s.border}}>
            {results.map(item => (
              <div key={item._id} style={{background:s.d2,position:'relative',overflow:'hidden',transition:'background 0.2s'}}
                onMouseEnter={e=>e.currentTarget.style.background=s.d3}
                onMouseLeave={e=>e.currentTarget.style.background=s.d2}>
                {/* Badge */}
                <div style={{position:'absolute',top:'8px',left:'8px',zIndex:2,background:'rgba(14,11,8,0.85)',border:`1px solid ${s.border}`,padding:'2px 7px',fontSize:'0.58rem',letterSpacing:'0.15em',textTransform:'uppercase',color:s.gold}}>{item.cat}</div>
                {item.isVeg && <div style={{position:'absolute',top:'8px',right:'8px',zIndex:2,background:'rgba(34,197,94,0.15)',border:'1px solid rgba(34,197,94,0.4)',padding:'2px 6px',fontSize:'0.58rem',color:'#4ade80'}}>VEG</div>}
                <div style={{height:'180px',overflow:'hidden',background:s.dark}}>
                  <img src={item.image} alt={item.name} style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.4s'}}
                    onMouseEnter={e=>e.target.style.transform='scale(1.06)'} onMouseLeave={e=>e.target.style.transform='scale(1)'}
                    onError={e=>e.target.style.display='none'} />
                </div>
                <div style={{padding:'1rem 1.2rem'}}>
                  <h3 style={{fontFamily:'"Cormorant Garamond",serif',fontSize:'1.1rem',fontWeight:400,margin:'0 0 3px',color:s.cream}}>{highlight(item.name,query)}</h3>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:'0.8rem'}}>
                    <span style={{fontFamily:'"Cormorant Garamond",serif',fontSize:'1.1rem',color:s.gold}}>Rs. {item.price}</span>
                    <button onClick={()=>addToCart(item)}
                      style={{fontSize:'0.62rem',letterSpacing:'0.12em',textTransform:'uppercase',padding:'0.4rem 0.9rem',border:`1px solid ${inCart(item._id)?s.gold:'rgba(201,168,76,0.3)'}`,background:inCart(item._id)?s.gold:'transparent',color:inCart(item._id)?s.dark:s.gold,cursor:'pointer',transition:'all 0.2s',fontFamily:'"DM Sans",sans-serif'}}>
                      {inCart(item._id)?'✓ Added':'Add →'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
