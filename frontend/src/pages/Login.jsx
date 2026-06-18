import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const s = { gold:'#C9A84C', cream:'#F5EDD8', dark:'#0E0B08', d2:'#1A1510', muted:'rgba(245,237,216,0.5)', border:'rgba(201,168,76,0.2)' };

export default function Login() {
  const [form, setForm]     = useState({ email:'', password:'', rememberMe:false });
  const [err, setErr]       = useState('');
  const [loading, setLoading] = useState(false);
  const { login }           = useAuth();
  const navigate            = useNavigate();
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type==='checkbox' ? e.target.checked : e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault(); setErr(''); setLoading(true);
    try {
      const res  = await fetch(`${API}/auth/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (e) { setErr(e.message || 'Login failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{minHeight:'100vh',background:s.dark,display:'flex',alignItems:'center',justifyContent:'center',padding:'5rem 1rem',fontFamily:'"DM Sans",sans-serif',color:s.cream}}>
      <div style={{width:'100%',maxWidth:'440px',background:s.d2,border:`1px solid ${s.border}`,padding:'2.5rem'}}>
        <div style={{textAlign:'center',marginBottom:'2rem'}}>
          <p style={{fontSize:'0.65rem',letterSpacing:'0.3em',textTransform:'uppercase',color:s.gold,marginBottom:'0.5rem'}}>Welcome Back</p>
          <h1 style={{fontFamily:'"Cormorant Garamond",serif',fontSize:'2.2rem',fontWeight:300,margin:0}}>Sign <em style={{fontStyle:'italic',color:s.gold}}>In</em></h1>
        </div>

        {err && <div style={{background:'rgba(220,38,38,0.1)',border:'1px solid rgba(220,38,38,0.3)',color:'#f87171',padding:'0.75rem 1rem',marginBottom:'1.2rem',fontSize:'0.83rem'}}>❌ {err}</div>}

        <form onSubmit={handleSubmit}>
          {[['Email','email','email','you@example.com'],['Password','password','password','••••••••']].map(([label,name,type,ph]) => (
            <div key={name} style={{marginBottom:'1rem'}}>
              <label style={{display:'block',fontSize:'0.62rem',letterSpacing:'0.2em',textTransform:'uppercase',color:s.muted,marginBottom:'0.4rem'}}>{label}</label>
              <input type={type} placeholder={ph} value={form[name]} onChange={set(name)} required
                style={{width:'100%',background:'#0E0B08',border:`1px solid ${s.border}`,color:s.cream,padding:'0.8rem',fontFamily:'"DM Sans",sans-serif',fontSize:'0.9rem',outline:'none',boxSizing:'border-box'}} />
            </div>
          ))}

          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
            <label style={{display:'flex',alignItems:'center',gap:'8px',cursor:'pointer',fontSize:'0.8rem',color:s.muted}}>
              <input type="checkbox" checked={form.rememberMe} onChange={set('rememberMe')} style={{accentColor:s.gold}} />
              Remember me (30 days)
            </label>
            <Link to="/forgot-password" style={{fontSize:'0.75rem',color:s.gold,textDecoration:'none'}}>Forgot password?</Link>
          </div>

          <button type="submit" disabled={loading}
            style={{width:'100%',background:s.gold,color:s.dark,border:'none',padding:'0.9rem',fontSize:'0.75rem',letterSpacing:'0.2em',textTransform:'uppercase',fontWeight:500,cursor:'pointer',fontFamily:'"DM Sans",sans-serif',opacity:loading?0.7:1}}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>

        <div style={{display:'flex',alignItems:'center',gap:'12px',margin:'1.5rem 0',color:s.muted,fontSize:'0.75rem'}}>
          <div style={{flex:1,height:'1px',background:s.border}} /> or <div style={{flex:1,height:'1px',background:s.border}} />
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'1.5rem'}}>
          {[['🌐','Google'],['📘','Facebook']].map(([icon,name]) => (
            <button key={name} style={{background:'transparent',border:`1px solid ${s.border}`,color:s.muted,padding:'0.75rem',fontSize:'0.78rem',cursor:'pointer',fontFamily:'"DM Sans",sans-serif',transition:'border-color 0.2s'}}
              onMouseEnter={e=>e.target.style.borderColor=s.gold} onMouseLeave={e=>e.target.style.borderColor=s.border}>
              {icon} {name}
            </button>
          ))}
        </div>

        <p style={{textAlign:'center',fontSize:'0.83rem',color:s.muted,margin:0}}>
          New here? <Link to="/signup" style={{color:s.gold,textDecoration:'none'}}>Create account</Link>
        </p>
        <p style={{textAlign:'center',marginTop:'0.8rem',margin:'0.8rem 0 0'}}>
          <Link to="/admin-login" style={{fontSize:'0.7rem',color:'rgba(201,168,76,0.4)',textDecoration:'none'}}>Owner / Admin Login →</Link>
        </p>
      </div>
    </div>
  );
}
