import { Link } from 'react-router-dom';

const s = { gold:'#C9A84C', cream:'#F5EDD8', dark:'#0E0B08', d2:'#1A1510', border:'rgba(201,168,76,0.18)' };

export default function PaymentFailure() {
  return (
    <div style={{minHeight:'100vh',background:s.dark,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'"DM Sans",sans-serif',color:s.cream,padding:'1rem'}}>
      <div style={{textAlign:'center',background:s.d2,border:'1px solid rgba(239,68,68,0.3)',padding:'3rem',maxWidth:'440px',width:'100%'}}>
        <div style={{fontSize:'4rem',marginBottom:'1rem'}}>❌</div>
        <h1 style={{fontFamily:'"Cormorant Garamond",serif',fontSize:'2rem',fontWeight:300,color:'#f87171',marginBottom:'0.5rem'}}>Payment Failed</h1>
        <p style={{color:'rgba(245,237,216,0.6)',marginBottom:'1.5rem'}}>Something went wrong. Please try again or choose a different payment method.</p>
        <div style={{display:'flex',gap:'10px',justifyContent:'center',flexWrap:'wrap'}}>
          <Link to="/checkout" style={{background:s.gold,color:s.dark,padding:'0.8rem 1.5rem',fontSize:'0.72rem',letterSpacing:'0.15em',textTransform:'uppercase',textDecoration:'none',fontWeight:500}}>Try Again</Link>
          <a href="tel:+9779846863458" style={{background:'transparent',border:`1px solid ${s.border}`,color:s.gold,padding:'0.8rem 1.5rem',fontSize:'0.72rem',letterSpacing:'0.15em',textTransform:'uppercase',textDecoration:'none'}}>📞 Call Us</a>
        </div>
      </div>
    </div>
  );
}
