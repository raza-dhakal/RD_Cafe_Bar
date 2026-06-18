import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const rdLogo = '/rd-logo.jpg';
const shopView = '/img/Shop view.jpg';
const homeMenu = '/img/home menu.PNG';

// ── Time-based greeting ──
function useGreeting() {
  const [greeting, setGreeting] = useState({ text:'', sub:'', emoji:'' });
  useEffect(() => {
    const update = () => {
      const h = new Date().getHours();
      if      (h >= 5  && h < 12) setGreeting({ text:'Good Morning',   sub:'Start your day with a perfect cup ☕',        emoji:'🌅' });
      else if (h >= 12 && h < 17) setGreeting({ text:'Good Afternoon', sub:'Take a break — you deserve great coffee ☕',  emoji:'☀️' });
      else if (h >= 17 && h < 21) setGreeting({ text:'Good Evening',   sub:'Unwind with our signature cocktails 🍷',      emoji:'🌆' });
      else                         setGreeting({ text:'Good Night',     sub:'Sleep Mood hours — dim lights & lo-fi 🌙',    emoji:'🌙' });
    };
    update();
    const t = setInterval(update, 60000);
    return () => clearInterval(t);
  }, []);
  return greeting;
}

// Default reviews
const DEFAULT_REVIEWS = [
  { _id:'r1', name:'Priya Sharma',    rating:5, comment:'The best cappuccino I have ever had in Nepal! Ambiance is perfect for a date night. Will definitely come back!', date:'2024-03-15' },
  { _id:'r2', name:'Bikash Thapa',    rating:5, comment:'RD Cafe is my favorite weekend spot. Cold brew is amazing and the yakiniku chicken is absolutely delicious!',    date:'2024-03-20' },
  { _id:'r3', name:'Sunita Gurung',   rating:5, comment:'Visited with family — everyone loved it! The chocolate fondant is to die for. Staff is so warm and welcoming.', date:'2024-04-02' },
  { _id:'r4', name:'Rajesh K.C.',     rating:5, comment:'Amazing vibe, great coffee, even better cocktails. RD House Wine with chicken salad — perfect combo!',           date:'2024-04-10' },
  { _id:'r5', name:'Anisha Poudel',   rating:5, comment:'Sleep mood hours are magical ✨ Dim lights, lo-fi music, moon milk coffee — exactly what I needed after work!', date:'2024-04-18' },
  { _id:'r6', name:'Dipesh Maharjan', rating:5, comment:'Iced latte and cheesecake combo is unbeatable. Clean, cozy, and owner Rajan is so friendly. Love this place!',  date:'2024-04-25' },
];

function Stars({ n }) {
  return <span style={{color:'#C9A84C',fontSize:'0.9rem',letterSpacing:'1px'}}>{'★'.repeat(n)}{'☆'.repeat(5-n)}</span>;
}

function StarInput({ value, onChange }) {
  const [hov, setHov] = useState(0);
  return (
    <div style={{display:'flex',gap:'4px'}}>
      {[1,2,3,4,5].map(s => (
        <button key={s} type="button"
          onMouseEnter={()=>setHov(s)} onMouseLeave={()=>setHov(0)}
          onClick={()=>onChange(s)}
          style={{background:'none',border:'none',cursor:'pointer',fontSize:'1.6rem',color:s<=(hov||value)?'#C9A84C':'rgba(245,237,216,0.2)',transition:'color 0.15s',padding:'0 2px'}}>
          ★
        </button>
      ))}
    </div>
  );
}

export default function Home() {
  const greeting = useGreeting();
  const { user } = useAuth();
  const videoRef = useRef(null);
  const [reviews, setReviews] = useState(DEFAULT_REVIEWS);
  const [form, setForm] = useState({ rating:0, comment:'', guestName:'', guestEmail:'' });
  const [submitMsg, setSubmitMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8000/api/reviews')
      .then(r=>r.json())
      .then(d=>{ if(d.success && d.data?.length>0) setReviews(d.data); })
      .catch(()=>{});
  }, []);

  const handleReview = async (e) => {
    e.preventDefault();
    if (!form.rating) return setSubmitMsg('Please select a rating.');
    if (!form.comment.trim()) return setSubmitMsg('Please write a review.');
    if (!user && !form.guestName.trim()) return setSubmitMsg('Please enter your name.');
    setSubmitting(true);
    try {
      const token = localStorage.getItem('rdcafe_token');
      const res = await fetch('http://localhost:8000/api/reviews', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', ...(token?{Authorization:`Bearer ${token}`}:{}) },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitMsg('✅ Thank you! Your review will appear after approval.');
        setForm({ rating:0, comment:'', guestName:'', guestEmail:'' });
      } else setSubmitMsg(data.message||'Failed to submit.');
    } catch { setSubmitMsg('Failed to submit. Try again.'); }
    finally { setSubmitting(false); }
  };

  const getName = r => r.name || r.user?.name || r.guestName || 'Guest';

  const s = {
    gold: '#C9A84C', cream: '#F5EDD8', dark: '#0E0B08', d2: '#1A1510', d3: '#241E15',
    muted: 'rgba(245,237,216,0.5)', mutedMore: 'rgba(245,237,216,0.35)',
    goldFaint: 'rgba(201,168,76,0.15)', goldBorder: 'rgba(201,168,76,0.18)',
  };

  return (
    <div style={{background:s.dark,color:s.cream,fontFamily:'"DM Sans",sans-serif',fontWeight:300}}>

      {/* ══ HERO — Video or Photo background ══ */}
      <section style={{minHeight:'100vh',position:'relative',display:'flex',alignItems:'center',overflow:'hidden'}}>

        {/* Video background — put your video file at /hero-video.mp4 */}
        {!videoError && (
          <video
            ref={videoRef}
            autoPlay muted loop playsInline
            onError={()=>setVideoError(true)}
            style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',zIndex:0}}
          >
            <source src="/hero-video.mp4" type="video/mp4" />
            <source src="/hero-video.webm" type="video/webm" />
          </video>
        )}

        {/* Photo fallback */}
        {videoError && (
          <img src={shopView} alt="RD Cafe"
            style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',zIndex:0}}
            onError={e=>{e.target.src='/cafe-background.jpg'}} />
        )}

        {/* Overlay */}
        <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg, rgba(14,11,8,0.85) 0%, rgba(14,11,8,0.6) 50%, rgba(14,11,8,0.8) 100%)',zIndex:1}} />

        {/* Content */}
        <div style={{position:'relative',zIndex:2,padding:'9rem 2rem 5rem',maxWidth:'780px',marginLeft:'clamp(1.5rem, 8vw, 8rem)'}}>

          {/* Time-based greeting */}
          <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'1rem',animation:'fadeUp 0.6s ease 0.1s both'}}>
            <span style={{fontSize:'1.2rem'}}>{greeting.emoji}</span>
            <span style={{fontSize:'0.72rem',letterSpacing:'0.25em',textTransform:'uppercase',color:s.gold}}>
              {greeting.text}
            </span>
          </div>
          <p style={{fontSize:'0.82rem',color:s.muted,marginBottom:'1.8rem',letterSpacing:'0.08em',animation:'fadeUp 0.6s ease 0.2s both'}}>
            {greeting.sub}
          </p>

          <h1 style={{
            fontFamily:'"Cormorant Garamond",serif',
            fontSize:'clamp(3.5rem,7.5vw,7rem)',
            fontWeight:300,
            lineHeight:0.92,
            letterSpacing:'-0.02em',
            marginBottom:'1.8rem',
            animation:'fadeUp 0.8s ease 0.3s both',
          }}>
            Where Every<br />Sip Tells a<br />
            <em style={{fontStyle:'italic',color:s.gold}}>Story</em>
          </h1>

          <p style={{fontSize:'0.88rem',lineHeight:1.85,color:s.muted,maxWidth:'380px',marginBottom:'2.5rem',animation:'fadeUp 0.8s ease 0.5s both'}}>
            A sanctuary of specialty coffee and craft cocktails — your escape from the ordinary. Est. 2024, Sunwal, Nepal.
          </p>

          <div style={{display:'flex',gap:'1rem',flexWrap:'wrap',animation:'fadeUp 0.8s ease 0.7s both'}}>
            <Link to="/menu" style={{background:s.gold,color:s.dark,padding:'0.9rem 2rem',fontSize:'0.72rem',letterSpacing:'0.2em',textTransform:'uppercase',fontWeight:500,textDecoration:'none',transition:'background 0.2s'}}>
              Explore Menu
            </Link>
            <Link to="/reserve" style={{background:'transparent',border:`1px solid ${s.gold}`,color:s.gold,padding:'0.9rem 2rem',fontSize:'0.72rem',letterSpacing:'0.2em',textTransform:'uppercase',textDecoration:'none',transition:'all 0.2s'}}>
              Reserve Table
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{position:'absolute',bottom:'2.5rem',left:'50%',transform:'translateX(-50%)',display:'flex',flexDirection:'column',alignItems:'center',gap:'8px',opacity:0.5,zIndex:2}}>
          <div style={{width:'1px',height:'50px',background:`linear-gradient(to bottom, transparent, ${s.gold})`,animation:'scrollPulse 2s ease infinite'}} />
          <span style={{fontSize:'0.6rem',letterSpacing:'0.25em',textTransform:'uppercase',color:s.muted}}>Scroll</span>
        </div>
      </section>

      {/* ══ FEATURE STRIP ══ */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',borderTop:`1px solid ${s.goldBorder}`,background:s.d2}}>
        {[
          {icon:'☕',t:'Specialty Coffee',s:'Single-origin beans'},
          {icon:'🍷',t:'Craft Cocktails',s:'Artisan bar menu'},
          {icon:'🌙',t:'Sleep Mood Hours',s:'Lo-fi · Dim lights'},
          {icon:'🛵',t:'Online Ordering',s:'Pickup & delivery'},
        ].map((f,i) => (
          <div key={i} style={{display:'flex',alignItems:'center',gap:'12px',padding:'1.4rem 1.2rem',borderRight:`1px solid ${s.goldBorder}`}}>
            <span style={{fontSize:'1.5rem',flexShrink:0}}>{f.icon}</span>
            <div>
              <p style={{fontSize:'0.82rem',fontWeight:500,marginBottom:'0.15rem'}}>{f.t}</p>
              <p style={{fontSize:'0.7rem',color:s.mutedMore}}>{f.s}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ══ HOME MENU PREVIEW ══ */}
      <section style={{padding:'5rem 2rem',textAlign:'center'}}>
        <p style={{fontSize:'0.68rem',letterSpacing:'0.3em',textTransform:'uppercase',color:s.gold,marginBottom:'1rem'}}>Our Menu</p>
        <h2 style={{fontFamily:'"Cormorant Garamond",serif',fontSize:'clamp(2rem,4vw,3rem)',fontWeight:300,marginBottom:'2.5rem'}}>
          Explore <em style={{fontStyle:'italic',color:s.gold}}>Our Collection</em>
        </h2>
        <img src={homeMenu} alt="RD Cafe Menu Overview"
          style={{width:'100%',maxWidth:'900px',borderRadius:'4px',border:`1px solid ${s.goldBorder}`}}
          onError={e=>e.target.style.display='none'} />
        <div style={{marginTop:'2rem'}}>
          <Link to="/menu" style={{background:s.gold,color:s.dark,padding:'0.9rem 2.5rem',fontSize:'0.72rem',letterSpacing:'0.2em',textTransform:'uppercase',fontWeight:500,textDecoration:'none'}}>
            View Full Menu →
          </Link>
        </div>
      </section>

      {/* ══ ABOUT ══ */}
      <section style={{padding:'4rem 2rem 5rem',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'4rem',alignItems:'center',maxWidth:'1100px',margin:'0 auto'}} id="about">
        <div style={{position:'relative'}}>
          <img src={shopView} alt="RD Cafe interior"
            style={{width:'100%',aspectRatio:'4/5',objectFit:'cover',border:`1px solid ${s.goldBorder}`}}
            onError={e=>{e.target.src=rdLogo}} />
          <span style={{position:'absolute',top:'-12px',right:'-12px',background:s.gold,color:s.dark,fontSize:'0.65rem',letterSpacing:'0.15em',textTransform:'uppercase',padding:'0.5rem 0.8rem',fontWeight:500}}>
            Our Story
          </span>
        </div>
        <div>
          <p style={{fontSize:'0.68rem',letterSpacing:'0.3em',textTransform:'uppercase',color:s.gold,marginBottom:'1rem'}}>About RD Café & Bar</p>
          <h2 style={{fontFamily:'"Cormorant Garamond",serif',fontSize:'clamp(2rem,3.5vw,2.8rem)',fontWeight:300,lineHeight:1.1,marginBottom:'1.2rem'}}>
            More Than a Café,<br />It's <em style={{fontStyle:'italic',color:s.gold}}>an Experience</em>
          </h2>
          <p style={{fontSize:'0.85rem',lineHeight:1.9,color:s.muted,marginBottom:'0.8rem'}}>
            Born from a passion for exceptional coffee and artfully crafted cocktails, RD Café & Bar is where every detail matters — from our carefully sourced single-origin beans to handcrafted cocktails.
          </p>
          <p style={{fontSize:'0.85rem',lineHeight:1.9,color:s.muted,marginBottom:'2rem'}}>
            Located in the heart of Sunwal, Nawalparasi — we believe the best moments deserve to be savored slowly, with great company.
          </p>
          <div style={{display:'flex',gap:'2.5rem',flexWrap:'wrap'}}>
            {[['50+','Menu Items'],['12+','Craft Drinks'],['5★','Guest Rating']].map(([n,l]) => (
              <div key={l} style={{borderLeft:`2px solid ${s.gold}`,paddingLeft:'0.8rem'}}>
                <div style={{fontFamily:'"Cormorant Garamond",serif',fontSize:'2rem',fontWeight:300,color:s.gold,lineHeight:1}}>{n}</div>
                <div style={{fontSize:'0.65rem',letterSpacing:'0.15em',textTransform:'uppercase',color:s.mutedMore,marginTop:'0.25rem'}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ REVIEWS ══ */}
      <section style={{padding:'5rem 2rem',background:s.d2}}>
        <div style={{textAlign:'center',marginBottom:'3rem'}}>
          <p style={{fontSize:'0.68rem',letterSpacing:'0.3em',textTransform:'uppercase',color:s.gold,marginBottom:'1rem'}}>What Our Guests Say</p>
          <h2 style={{fontFamily:'"Cormorant Garamond",serif',fontSize:'clamp(2rem,4vw,3rem)',fontWeight:300}}>
            Guest <em style={{fontStyle:'italic',color:s.gold}}>Reviews</em>
          </h2>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',marginTop:'0.8rem'}}>
            <Stars n={5} />
            <span style={{fontSize:'0.8rem',color:s.muted}}>5.0 · {reviews.length} reviews</span>
          </div>
        </div>

        {/* Review cards */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'1px',background:s.goldBorder,marginBottom:'4rem',maxWidth:'1200px',margin:'0 auto 4rem'}}>
          {reviews.slice(0,6).map((r,i) => (
            <div key={r._id||i} style={{background:s.d2,padding:'1.5rem',borderBottom:`1px solid ${s.goldBorder}`,transition:'background 0.2s'}}
              onMouseEnter={e=>e.currentTarget.style.background=s.d3}
              onMouseLeave={e=>e.currentTarget.style.background=s.d2}>
              <Stars n={r.rating} />
              <p style={{fontSize:'0.83rem',color:'rgba(245,237,216,0.65)',lineHeight:1.75,margin:'0.8rem 0 1rem',fontStyle:'italic'}}>"{r.comment}"</p>
              <div style={{display:'flex',alignItems:'center',gap:'10px',borderTop:`1px solid ${s.goldBorder}`,paddingTop:'0.8rem'}}>
                <div style={{width:'32px',height:'32px',borderRadius:'50%',background:'rgba(201,168,76,0.15)',display:'flex',alignItems:'center',justifyContent:'center',color:s.gold,fontFamily:'"Cormorant Garamond",serif',fontSize:'0.9rem',fontWeight:600,flexShrink:0}}>
                  {getName(r).charAt(0)}
                </div>
                <div style={{flex:1}}>
                  <p style={{fontSize:'0.82rem',fontWeight:500,margin:0}}>{getName(r)}</p>
                  <p style={{fontSize:'0.7rem',color:s.mutedMore,margin:0}}>{r.date||r.createdAt?.slice(0,10)||'Verified Guest'}</p>
                </div>
                <span style={{fontSize:'0.62rem',color:'rgba(201,168,76,0.6)',border:`1px solid rgba(201,168,76,0.2)`,padding:'2px 8px'}}>✓ Verified</span>
              </div>
            </div>
          ))}
        </div>

        {/* Submit review */}
        <div style={{maxWidth:'560px',margin:'0 auto',background:s.d3,border:`1px solid ${s.goldBorder}`,padding:'2.5rem'}}>
          <h3 style={{fontFamily:'"Cormorant Garamond",serif',fontSize:'1.7rem',fontWeight:300,marginBottom:'0.3rem'}}>
            Share Your <em style={{fontStyle:'italic',color:s.gold}}>Experience</em>
          </h3>
          <p style={{fontSize:'0.72rem',color:s.mutedMore,marginBottom:'1.5rem'}}>Your review appears after admin approval.</p>

          {submitMsg && (
            <div style={{fontSize:'0.8rem',padding:'0.7rem 1rem',marginBottom:'1rem',
              background:submitMsg.startsWith('✅')?'rgba(76,175,80,0.1)':'rgba(224,82,82,0.1)',
              border:submitMsg.startsWith('✅')?'1px solid rgba(76,175,80,0.3)':'1px solid rgba(224,82,82,0.3)',
              color:submitMsg.startsWith('✅')?'#7dce80':'#e08080'}}>
              {submitMsg}
            </div>
          )}

          <form onSubmit={handleReview}>
            {!user && (
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.8rem',marginBottom:'1rem'}}>
                <div>
                  <label style={{display:'block',fontSize:'0.62rem',letterSpacing:'0.2em',textTransform:'uppercase',color:s.mutedMore,marginBottom:'0.4rem'}}>Your Name</label>
                  <input style={{width:'100%',background:s.d2,border:`1px solid ${s.goldBorder}`,color:s.cream,padding:'0.75rem',fontFamily:'"DM Sans",sans-serif',fontSize:'0.83rem',outline:'none',boxSizing:'border-box'}}
                    placeholder="Rajan Dhakal" value={form.guestName} onChange={e=>setForm({...form,guestName:e.target.value})} />
                </div>
                <div>
                  <label style={{display:'block',fontSize:'0.62rem',letterSpacing:'0.2em',textTransform:'uppercase',color:s.mutedMore,marginBottom:'0.4rem'}}>Email (optional)</label>
                  <input type="email" style={{width:'100%',background:s.d2,border:`1px solid ${s.goldBorder}`,color:s.cream,padding:'0.75rem',fontFamily:'"DM Sans",sans-serif',fontSize:'0.83rem',outline:'none',boxSizing:'border-box'}}
                    placeholder="you@email.com" value={form.guestEmail} onChange={e=>setForm({...form,guestEmail:e.target.value})} />
                </div>
              </div>
            )}
            {user && <p style={{fontSize:'0.75rem',color:s.gold,marginBottom:'1rem'}}>Reviewing as: <strong>{user.name}</strong></p>}
            <div style={{marginBottom:'1rem'}}>
              <label style={{display:'block',fontSize:'0.62rem',letterSpacing:'0.2em',textTransform:'uppercase',color:s.mutedMore,marginBottom:'0.5rem'}}>Your Rating</label>
              <StarInput value={form.rating} onChange={v=>setForm({...form,rating:v})} />
            </div>
            <div style={{marginBottom:'1.2rem'}}>
              <label style={{display:'block',fontSize:'0.62rem',letterSpacing:'0.2em',textTransform:'uppercase',color:s.mutedMore,marginBottom:'0.4rem'}}>Your Review</label>
              <textarea style={{width:'100%',background:s.d2,border:`1px solid ${s.goldBorder}`,color:s.cream,padding:'0.75rem',fontFamily:'"DM Sans",sans-serif',fontSize:'0.83rem',outline:'none',resize:'vertical',minHeight:'100px',boxSizing:'border-box'}}
                placeholder="Tell us about your experience at RD Café & Bar..."
                value={form.comment} onChange={e=>setForm({...form,comment:e.target.value})} />
            </div>
            <button type="submit" disabled={submitting}
              style={{width:'100%',background:s.gold,color:s.dark,border:'none',padding:'0.9rem',fontSize:'0.72rem',letterSpacing:'0.2em',textTransform:'uppercase',fontWeight:500,cursor:'pointer',fontFamily:'"DM Sans",sans-serif',opacity:submitting?0.6:1}}>
              {submitting ? 'Submitting…' : 'Submit Review →'}
            </button>
          </form>
        </div>
      </section>

      {/* ══ HOURS & CONTACT ══ */}
      <section style={{padding:'5rem 2rem'}} id="contact">
        <div style={{textAlign:'center',marginBottom:'3rem'}}>
          <p style={{fontSize:'0.68rem',letterSpacing:'0.3em',textTransform:'uppercase',color:s.gold,marginBottom:'1rem'}}>Visit Us</p>
          <h2 style={{fontFamily:'"Cormorant Garamond",serif',fontSize:'clamp(2rem,4vw,3rem)',fontWeight:300}}>
            Hours & <em style={{fontStyle:'italic',color:s.gold}}>Location</em>
          </h2>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1px',background:s.goldBorder,maxWidth:'1100px',margin:'0 auto'}}>
          <div style={{background:s.dark,padding:'2.5rem 2rem'}}>
            <p style={{fontSize:'0.65rem',letterSpacing:'0.25em',textTransform:'uppercase',color:s.gold,marginBottom:'1.5rem'}}>Opening Hours</p>
            {[['Mon – Fri','7:00 – 23:00'],['Saturday','8:00 – 01:00'],['Sunday','9:00 – 22:00']].map(([d,t])=>(
              <div key={d} style={{display:'flex',justifyContent:'space-between',marginBottom:'0.8rem',fontSize:'0.83rem'}}>
                <span style={{color:s.muted}}>{d}</span><span>{t}</span>
              </div>
            ))}
            <div style={{marginTop:'1.2rem',padding:'0.8rem',background:'rgba(201,168,76,0.06)',border:`1px solid ${s.goldBorder}`,fontSize:'0.72rem',color:s.muted,lineHeight:1.7}}>
              🌙 <strong style={{color:s.gold}}>Sleep Mood:</strong> Mon–Thu 21–23 & Sun 20–22.<br/>Dim lights · lo-fi beats · Moon Milk Coffee.
            </div>
          </div>
          <div style={{background:s.dark,padding:'2.5rem 2rem'}}>
            <p style={{fontSize:'0.65rem',letterSpacing:'0.25em',textTransform:'uppercase',color:s.gold,marginBottom:'1.5rem'}}>Find Us</p>
            {[
              ['📍','Sunwal-12, Bhumahi,\nNawalparasi, Nepal'],
              ['📞','+977 9846863458'],
              ['📧','rdcafebar@np.com'],
              ['📸','@rdcafebar'],
            ].map(([icon,text])=>(
              <div key={icon} style={{display:'flex',gap:'10px',marginBottom:'1rem',fontSize:'0.83rem',color:s.muted}}>
                <span style={{flexShrink:0}}>{icon}</span>
                <span style={{whiteSpace:'pre-line'}}>{text}</span>
              </div>
            ))}
          </div>
          <div style={{background:s.dark,padding:'2.5rem 2rem'}}>
            <p style={{fontSize:'0.65rem',letterSpacing:'0.25em',textTransform:'uppercase',color:s.gold,marginBottom:'1.5rem'}}>Reserve a Table</p>
            <p style={{fontSize:'0.83rem',color:s.muted,lineHeight:1.8,marginBottom:'1.5rem'}}>Book your table in advance for a guaranteed spot. Walk-ins always welcome!</p>
            <Link to="/reserve" style={{background:s.gold,color:s.dark,padding:'0.7rem 1.5rem',fontSize:'0.68rem',letterSpacing:'0.18em',textTransform:'uppercase',fontWeight:500,textDecoration:'none',display:'inline-block'}}>
              Book Now
            </Link>
            <div style={{marginTop:'1.5rem',padding:'0.8rem',background:'rgba(201,168,76,0.06)',border:`1px solid ${s.goldBorder}`,fontSize:'0.72rem',color:s.muted}}>
              📞 Quick Reserve:<br/>
              <a href="tel:+9779846863458" style={{color:s.gold,textDecoration:'none'}}>+977 9846863458</a>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{background:s.d2,borderTop:`1px solid ${s.goldBorder}`,padding:'2.5rem 2rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1rem'}}>
        <div>
          <div style={{fontFamily:'"Cormorant Garamond",serif',fontSize:'1.3rem',color:s.gold}}>RD Café & Bar</div>
          <p style={{fontSize:'0.7rem',color:s.mutedMore,marginTop:'0.2rem'}}>Sunwal-12, Bhumahi, Nawalparasi, Nepal</p>
        </div>
        <p style={{fontSize:'0.7rem',color:s.mutedMore}}>© 2024 RD Café & Bar · All rights reserved</p>
        <div style={{display:'flex',gap:'8px'}}>
          {[['ig','Instagram'],['fb','Facebook'],['tk','TikTok']].map(([k,label])=>(
            <a key={k} aria-label={label} style={{width:'34px',height:'34px',border:`1px solid rgba(201,168,76,0.22)`,display:'flex',alignItems:'center',justifyContent:'center',color:s.gold,fontSize:'0.72rem',cursor:'pointer',textDecoration:'none',transition:'all 0.2s'}}
              onMouseEnter={e=>{e.target.style.background='rgba(201,168,76,0.1)';e.target.style.borderColor=s.gold;}}
              onMouseLeave={e=>{e.target.style.background='transparent';e.target.style.borderColor='rgba(201,168,76,0.22)';}}>
              {k}
            </a>
          ))}
        </div>
      </footer>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes scrollPulse { 0%,100%{opacity:0.3} 50%{opacity:0.8} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-thumb { background: #C9A84C; }
        @media(max-width:768px) {
          section[id="about"] { grid-template-columns: 1fr !important; gap: 2rem !important; }
          section[id="contact"] > div { grid-template-columns: 1fr !important; }
          .feature-strip { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
