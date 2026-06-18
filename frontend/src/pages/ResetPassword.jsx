import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const s = { gold:'#C9A84C', cream:'#F5EDD8', dark:'#0E0B08', d2:'#1A1510', muted:'rgba(245,237,216,0.5)', border:'rgba(201,168,76,0.2)' };

export default function ResetPassword() {
  const { token } = useParams();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password:'', confirm:'' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setErr('');
    if (form.password !== form.confirm) return setErr('Passwords do not match.');
    if (form.password.length < 8) return setErr('Password must be at least 8 characters.');
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/reset-password/${token}`, {
        method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ password: form.password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (e) { setErr(e.message || 'Reset failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{minHeight:'100vh',background:s.dark,display:'flex',alignItems:'center',justifyContent:'center',padding:'5rem 1rem',fontFamily:'"DM Sans",sans-serif',color:s.cream}}>
      <div style={{width:'100%',maxWidth:'440px',background:s.d2,border:`1px solid ${s.border}`,padding:'2.5rem'}}>
        <div style={{textAlign:'center',marginBottom:'2rem'}}>
          <p style={{fontSize:'0.65rem',letterSpacing:'0.3em',textTransform:'uppercase',color:s.gold,marginBottom:'0.5rem'}}>Reset Password</p>
          <h1 style={{fontFamily:'"Cormorant Garamond",serif',fontSize:'2.2rem',fontWeight:300,margin:0}}>New <em style={{fontStyle:'italic',color:s.gold}}>Password</em></h1>
        </div>

        {err && <div style={{background:'rgba(220,38,38,0.1)',border:'1px solid rgba(220,38,38,0.3)',color:'#f87171',padding:'0.75rem 1rem',marginBottom:'1.2rem',fontSize:'0.83rem'}}>❌ {err}</div>}

        <form onSubmit={handleSubmit}>
          {[['New Password','password','Min 8 characters'],['Confirm Password','confirm','Repeat password']].map(([label,name,ph]) => (
            <div key={name} style={{marginBottom:'1rem'}}>
              <label style={{display:'block',fontSize:'0.62rem',letterSpacing:'0.2em',textTransform:'uppercase',color:s.muted,marginBottom:'0.4rem'}}>{label}</label>
              <input type="password" placeholder={ph} value={form[name]} onChange={e=>setForm(f=>({...f,[name]:e.target.value}))} required
                style={{width:'100%',background:'#0E0B08',border:`1px solid ${s.border}`,color:s.cream,padding:'0.8rem',fontFamily:'"DM Sans",sans-serif',fontSize:'0.9rem',outline:'none',boxSizing:'border-box'}} />
            </div>
          ))}
          <button type="submit" disabled={loading}
            style={{width:'100%',background:s.gold,color:s.dark,border:'none',padding:'0.9rem',fontSize:'0.75rem',letterSpacing:'0.2em',textTransform:'uppercase',fontWeight:500,cursor:'pointer',fontFamily:'"DM Sans",sans-serif',marginTop:'0.5rem',opacity:loading?0.7:1}}>
            {loading ? 'Resetting…' : 'Reset Password →'}
          </button>
        </form>

        <p style={{textAlign:'center',fontSize:'0.83rem',color:s.muted,marginTop:'1.5rem',marginBottom:0}}>
          <Link to="/login" style={{color:s.gold,textDecoration:'none'}}>← Back to login</Link>
        </p>
      </div>
    </div>
  );
}
