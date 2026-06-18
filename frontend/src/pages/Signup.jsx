import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const s = { gold:'#C9A84C', cream:'#F5EDD8', dark:'#0E0B08', d2:'#1A1510', muted:'rgba(245,237,216,0.5)', border:'rgba(201,168,76,0.2)' };

export default function Signup() {
  const [form, setForm]     = useState({ username:'', name:'', email:'', password:'', confirm:'', phone:'' });
  const [err, setErr]       = useState('');
  const [loading, setLoading] = useState(false);
  const { login }           = useAuth();
  const navigate            = useNavigate();
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault(); setErr('');
    if (form.password !== form.confirm) return setErr('Passwords do not match.');
    if (form.password.length < 8) return setErr('Password must be at least 8 characters.');
    setLoading(true);
    try {
      const res  = await fetch(`${API}/auth/register`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (e) { setErr(e.message || 'Registration failed.'); }
    finally { setLoading(false); }
  };

  const fields = [
    ['Username','username','text','rajan123'],
    ['Full Name','name','text','Rajan Dhakal'],
    ['Email','email','email','you@example.com'],
    ['Phone (optional)','phone','tel','+977 98XXXXXXXX'],
    ['Password','password','password','Min 8 characters'],
    ['Confirm Password','confirm','password','Repeat password'],
  ];

  return (
    <div style={{minHeight:'100vh',background:s.dark,display:'flex',alignItems:'center',justifyContent:'center',padding:'5rem 1rem',fontFamily:'"DM Sans",sans-serif',color:s.cream}}>
      <div style={{width:'100%',maxWidth:'480px',background:s.d2,border:`1px solid ${s.border}`,padding:'2.5rem'}}>
        <div style={{textAlign:'center',marginBottom:'2rem'}}>
          <p style={{fontSize:'0.65rem',letterSpacing:'0.3em',textTransform:'uppercase',color:s.gold,marginBottom:'0.5rem'}}>Join RD Café</p>
          <h1 style={{fontFamily:'"Cormorant Garamond",serif',fontSize:'2.2rem',fontWeight:300,margin:0}}>Create <em style={{fontStyle:'italic',color:s.gold}}>Account</em></h1>
        </div>

        {err && <div style={{background:'rgba(220,38,38,0.1)',border:'1px solid rgba(220,38,38,0.3)',color:'#f87171',padding:'0.75rem 1rem',marginBottom:'1.2rem',fontSize:'0.83rem'}}>❌ {err}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
            {fields.map(([label,name,type,ph]) => (
              <div key={name} style={{marginBottom:'0.5rem',gridColumn:['email','phone'].includes(name)?'1/-1':'auto'}}>
                <label style={{display:'block',fontSize:'0.62rem',letterSpacing:'0.2em',textTransform:'uppercase',color:s.muted,marginBottom:'0.4rem'}}>{label}</label>
                <input type={type} placeholder={ph} value={form[name]} onChange={set(name)} required={name!=='phone'}
                  style={{width:'100%',background:'#0E0B08',border:`1px solid ${s.border}`,color:s.cream,padding:'0.75rem',fontFamily:'"DM Sans",sans-serif',fontSize:'0.85rem',outline:'none',boxSizing:'border-box'}} />
              </div>
            ))}
          </div>

          <button type="submit" disabled={loading}
            style={{width:'100%',background:s.gold,color:s.dark,border:'none',padding:'0.9rem',fontSize:'0.75rem',letterSpacing:'0.2em',textTransform:'uppercase',fontWeight:500,cursor:'pointer',fontFamily:'"DM Sans",sans-serif',marginTop:'1rem',opacity:loading?0.7:1}}>
            {loading ? 'Creating account…' : 'Create Account →'}
          </button>
        </form>

        <p style={{textAlign:'center',fontSize:'0.83rem',color:s.muted,marginTop:'1.5rem',marginBottom:0}}>
          Already have an account? <Link to="/login" style={{color:s.gold,textDecoration:'none'}}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
