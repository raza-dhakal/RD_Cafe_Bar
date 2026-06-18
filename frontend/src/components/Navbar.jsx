import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';
import NavSearch from './NavSearch';

const rdLogo = '/rd-logo.jpg';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { count, setIsOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleLogout = () => { logout(); navigate('/'); };
  const active = (p) => location.pathname === p ? 'text-gold' : 'text-cream/65 hover:text-gold';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-dark/95 backdrop-blur border-b border-gold/15' : 'bg-dark/70 backdrop-blur-sm'}`}>
      <div className="flex justify-between items-center px-6 md:px-10 py-3">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img src={rdLogo} alt="RD Cafe" className="w-10 h-10 object-cover rounded-full border border-gold/30" />
          <span className="font-display text-xl font-semibold text-gold">
            RD <span className="italic font-light text-cream">Café & Bar</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-5 text-xs tracking-widest uppercase">
          <Link to="/menu"    className={`transition-colors ${active('/menu')}`}>Menu</Link>
          <Link to="/reserve" className={`transition-colors ${active('/reserve')}`}>Reserve</Link>
          <Link to="/owner"   className={`transition-colors ${active('/owner')}`}>About</Link>
          <a href="/#contact" className="text-cream/65 hover:text-gold transition-colors">Contact</a>
          {isAdmin && <Link to="/admin" className="text-gold">Admin</Link>}

          {/* 🔍 Search button — searches the full menu */}
          <NavSearch />

          {/* Cart button */}
          <button onClick={() => setIsOpen(true)} className="relative text-cream/65 hover:text-gold transition-colors">
            🛒 Cart
            {count > 0 && (
              <span className="absolute -top-2 -right-3 bg-gold text-dark text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </button>

          {/* Auth buttons */}
          {user ? (
            <>
              <Link to="/dashboard" className={`transition-colors ${active('/dashboard')}`}>
                👤 {user.name?.split(' ')[0]}
              </Link>
              <button onClick={handleLogout} className="btn-gold text-[10px] py-2 px-4">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login"  className={`transition-colors ${active('/login')}`}>Login</Link>
              <Link to="/signup" className="btn-gold text-[10px] py-2 px-4">Sign Up</Link>
            </>
          )}
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-4">
          {/* 🔍 Search button — mobile */}
          <NavSearch />

          <button onClick={() => setIsOpen(true)} className="relative text-cream/65 text-lg">
            🛒
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold text-dark text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{count}</span>
            )}
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-cream text-xl">
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-dark border-t border-gold/10 px-6 py-4 flex flex-col gap-0 text-xs tracking-widest uppercase">
          {[
            ['/menu','Menu'],
            ['/reserve','Reserve'],
            ['/owner','About'],
          ].map(([path, label]) => (
            <Link key={path} to={path} className="text-cream/70 hover:text-gold py-3 border-b border-gold/8 transition-colors">
              {label}
            </Link>
          ))}
          {isAdmin && <Link to="/admin" className="text-gold py-3 border-b border-gold/8">Admin</Link>}
          {user ? (
            <>
              <Link to="/dashboard" className="text-cream/70 hover:text-gold py-3 border-b border-gold/8">👤 {user.name?.split(' ')[0]}</Link>
              <button onClick={handleLogout} className="btn-gold mt-3 py-2 text-center w-full">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login"  className="text-cream/70 hover:text-gold py-3 border-b border-gold/8">Login</Link>
              <Link to="/signup" className="btn-gold mt-3 py-2 text-center block">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
