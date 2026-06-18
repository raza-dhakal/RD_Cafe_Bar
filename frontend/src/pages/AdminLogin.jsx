import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const s = { gold:'#C9A84C', cream:'#F5EDD8', dark:'#0E0B08', d2:'#1A1510', muted:'rgba(245,237,216,0.5)', border:'rgba(201,168,76,0.2)' };

export default function AdminLogin() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [otp, setOtp] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(300);
  const { login } = useAuth();
  const navigate = useNavigate();

  const step1 = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true);
    try {
      const res = await fetch(`${API}/auth/admin/request-otp`, {
        method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, secretKey })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setStep(2);
      let t = 300;
      const iv = setInterval(() => { t--; setTimer(t); if (t <= 0) clearInterval(iv); }, 1000);
    } catch (e) { setErr(e.message || 'Invalid credentials.'); }
    finally { setLoading(false); }
  };

  const step2 = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true);
    try {
      const res = await fetch(`${API}/auth/admin/verify-otp`, {
        method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      login(data.user, data.token);
      navigate('/admin');
    } catch (e) { setErr(e.message || 'Invalid OTP.'); }
    finally { setLoading(false); }
  };

  const fmt = t => `${Math.floor(t/60)}:${(t%60).toString().padStart(2,'0')}`;

  return (
    <div style={{minHeight:'100vh',background:s.dark,display:'flex',alignItems:'center',justifyContent:'center',padding:'5rem 1rem',fontFamily:'"DM Sans",sans-serif',color:s.cream}}>
      <div style={{width:'100%',maxWidth:'440px',background:s.d2,border:`1px solid ${s.border}`,padding:'2.5rem'}}>
        <div style={{textAlign:'center',marginBottom:'2rem'}}>
          <p style={{fontSize:'0.65rem',letterSpacing:'0.3em',textTransform:'uppercase',color:s.gold,marginBottom:'0.5rem'}}>Owner / Admin</p>
          <h1 style={{fontFamily:'"Cormorant Garamond",serif',fontSize:'2.2rem',fontWeight:300,margin:0}}>Admin <em style={{fontStyle:'italic',color:s.gold}}>Access</em></h1>
          <p style={{fontSize:'0.75rem',color:s.muted,marginTop:'0.5rem'}}>Two-step verification</p>
        </div>

        {err && <div style={{background:'rgba(220,38,38,0.1)',border:'1px solid rgba(220,38,38,0.3)',color:'#f87171',padding:'0.75rem 1rem',marginBottom:'1.2rem',fontSize:'0.83rem'}}>❌ {err}</div>}

        {step === 1 ? (
          <form onSubmit={step1}>
            <div style={{marginBottom:'1rem'}}>
              <label style={{display:'block',fontSize:'0.62rem',letterSpacing:'0.2em',textTransform:'uppercase',color:s.muted,marginBottom:'0.4rem'}}>Owner Email</label>
              <input type="email" placeholder="owner@rdcafe.com.np" value={email} onChange={e=>setEmail(e.target.value)} required
                style={{width:'100%',background:'#0E0B08',border:`1px solid ${s.border}`,color:s.cream,padding:'0.8rem',fontFamily:'"DM Sans",sans-serif',fontSize:'0.9rem',outline:'none',boxSizing:'border-box'}} />
            </div>
            <div style={{marginBottom:'1.5rem'}}>
              <label style={{display:'block',fontSize:'0.62rem',letterSpacing:'0.2em',textTransform:'uppercase',color:s.muted,marginBottom:'0.4rem'}}>Secret Key</label>
              <input type="password" placeholder="••••••••••" value={secretKey} onChange={e=>setSecretKey(e.target.value)} required
                style={{width:'100%',background:'#0E0B08',border:`1px solid ${s.border}`,color:s.cream,padding:'0.8rem',fontFamily:'"DM Sans",sans-serif',fontSize:'0.9rem',outline:'none',boxSizing:'border-box'}} />
            </div>
            <button type="submit" disabled={loading}
              style={{width:'100%',background:s.gold,color:s.dark,border:'none',padding:'0.9rem',fontSize:'0.75rem',letterSpacing:'0.2em',textTransform:'uppercase',fontWeight:500,cursor:'pointer',fontFamily:'"DM Sans",sans-serif',opacity:loading?0.7:1}}>
              {loading ? 'Verifying…' : 'Continue →'}
            </button>
          </form>
        ) : (
          <form onSubmit={step2}>
            <div style={{background:'rgba(201,168,76,0.08)',border:`1px solid ${s.border}`,padding:'1rem',fontSize:'0.83rem',color:s.muted,marginBottom:'1.2rem'}}>
              OTP sent to <strong style={{color:s.gold}}>{email}</strong>. Check your inbox.
            </div>
            <div style={{marginBottom:'1rem'}}>
              <label style={{display:'block',fontSize:'0.62rem',letterSpacing:'0.2em',textTransform:'uppercase',color:s.muted,marginBottom:'0.4rem'}}>Enter OTP</label>
              <input type="text" placeholder="6-digit code" value={otp} onChange={e=>setOtp(e.target.value)} maxLength={6} required
                style={{width:'100%',background:'#0E0B08',border:`1px solid ${s.border}`,color:s.cream,padding:'0.8rem',fontFamily:'"DM Sans",sans-serif',fontSize:'1.2rem',letterSpacing:'0.3em',textAlign:'center',outline:'none',boxSizing:'border-box'}} />
            </div>
            <p style={{textAlign:'center',fontSize:'0.75rem',color:s.muted,marginBottom:'1rem'}}>
              {timer > 0 ? `Expires in ${fmt(timer)}` : 'OTP expired. Please restart.'}
            </p>
            <button type="submit" disabled={loading || timer === 0}
              style={{width:'100%',background:s.gold,color:s.dark,border:'none',padding:'0.9rem',fontSize:'0.75rem',letterSpacing:'0.2em',textTransform:'uppercase',fontWeight:500,cursor:'pointer',fontFamily:'"DM Sans",sans-serif',opacity:(loading||timer===0)?0.6:1}}>
              {loading ? 'Verifying…' : 'Verify & Enter →'}
            </button>
          </form>
        )}

        <p style={{textAlign:'center',marginTop:'1.5rem',marginBottom:0}}>
          <Link to="/login" style={{fontSize:'0.72rem',color:s.muted,textDecoration:'none'}}>← Back to login</Link>
        </p>
      </div>
    </div>
  );
}
