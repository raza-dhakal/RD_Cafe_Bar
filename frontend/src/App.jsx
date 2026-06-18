import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';

// Pages
import Home          from './pages/Home';
import Menu          from './pages/Menu';
import MenuSearch    from './pages/MenuSearch';
import Login         from './pages/Login';
import Signup        from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard     from './pages/Dashboard';
import Reserve       from './pages/Reserve';
import OwnerInfo     from './pages/OwnerInfo';
import OrderTracking from './pages/OrderTracking';
import PaymentPage   from './pages/PaymentPage';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import AdminLogin    from './pages/AdminLogin';
import AdminPanel    from './pages/AdminPanel';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/admin-login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

function AppContent() {
  return (
    <BrowserRouter>
      <Navbar />
      <CartDrawer />
      <Routes>
        <Route path="/"              element={<Home />} />
        <Route path="/menu"          element={<Menu />} />
        <Route path="/search"        element={<MenuSearch />} />
        <Route path="/login"         element={<Login />} />
        <Route path="/signup"        element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/reserve"       element={<Reserve />} />
        <Route path="/owner"         element={<OwnerInfo />} />
        <Route path="/admin-login"   element={<AdminLogin />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failure" element={<PaymentFailure />} />
        <Route path="/dashboard"     element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/checkout"      element={<PaymentPage />} />
        <Route path="/track/:orderId" element={<OrderTracking />} />
        <Route path="/admin"         element={<AdminRoute><AdminPanel /></AdminRoute>} />
        <Route path="*"              element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
