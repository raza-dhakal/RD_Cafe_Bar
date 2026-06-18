import { useState } from 'react';
import { Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const s = { gold:'#C9A84C', cream:'#F5EDD8', dark:'#0E0B08', d2:'#1A1510', muted:'rgba(245,237,216,0.5)', border:'rgba(201,168,76,0.2)' };

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email })
      });
      const data = await res.json();
      setMsg(data.message || 'If that email is registered, a reset link has been sent.');
    } catch {
      setMsg('If that email is registered, a reset link has been sent.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{minHeight:'100vh',background:s.dark,display:'flex',alignItems:'center',justifyContent:'center',padding:'5rem 1rem',fontFamily:'"DM Sans",sans-serif',color:s.cream}}>
      <div style={{width:'100%',maxWidth:'440px',background:s.d2,border:`1px solid ${s.border}`,padding:'2.5rem'}}>
        <div style={{textAlign:'center',marginBottom:'2rem'}}>
          <p style={{fontSize:'0.65rem',letterSpacing:'0.3em',textTransform:'uppercase',color:s.gold,marginBottom:'0.5rem'}}>Forgot Password</p>
          <h1 style={{fontFamily:'"Cormorant Garamond",serif',fontSize:'2.2rem',fontWeight:300,margin:0}}>Reset <em style={{fontStyle:'italic',color:s.gold}}>Password</em></h1>
        </div>

        {msg ? (
          <div style={{background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.3)',color:'#4ade80',padding:'1rem',fontSize:'0.85rem',textAlign:'center'}}>
            ✅ {msg}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{marginBottom:'1rem'}}>
              <label style={{display:'block',fontSize:'0.62rem',letterSpacing:'0.2em',textTransform:'uppercase',color:s.muted,marginBottom:'0.4rem'}}>Email Address</label>
              <input type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required
                style={{width:'100%',background:'#0E0B08',border:`1px solid ${s.border}`,color:s.cream,padding:'0.8rem',fontFamily:'"DM Sans",sans-serif',fontSize:'0.9rem',outline:'none',boxSizing:'border-box'}} />
            </div>
            <button type="submit" disabled={loading}
              style={{width:'100%',background:s.gold,color:s.dark,border:'none',padding:'0.9rem',fontSize:'0.75rem',letterSpacing:'0.2em',textTransform:'uppercase',fontWeight:500,cursor:'pointer',fontFamily:'"DM Sans",sans-serif',opacity:loading?0.7:1}}>
              {loading ? 'Sending…' : 'Send Reset Link →'}
            </button>
          </form>
        )}

        <p style={{textAlign:'center',fontSize:'0.83rem',color:s.muted,marginTop:'1.5rem',marginBottom:0}}>
          <Link to="/login" style={{color:s.gold,textDecoration:'none'}}>← Back to login</Link>
        </p>
      </div>
    </div>
  );
}
