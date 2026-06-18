import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Order() {
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || '', phone: user?.phone || '',
    orderType: 'dine-in', paymentMethod: 'cash',
    deliveryAddress: '', specialInstructions: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [err, setErr] = useState('');

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleOrder = async (e) => {
    e.preventDefault();
    if (!cart.length) return setErr('Cart is empty! Add items first.');
    setErr(''); setLoading(true);
    try {
      const payload = {
        items: cart.map(i => ({ menuItemId: i._id, name: i.name, quantity: i.qty })),
        ...form,
      };
      const { data } = await api.post('/orders', payload);
      setSuccess(data.message);
      clearCart();
      setTimeout(() => navigate('/dashboard'), 2500);
    } catch (error) {
      setErr(error.response?.data?.message || 'Order failed. Try again.');
    } finally { setLoading(false); }
  };

  if (!cart.length && !success) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4 pt-20">
      <span className="text-5xl">🛒</span>
      <p className="text-cream/50">Your cart is empty.</p>
      <button onClick={() => navigate('/menu')} className="btn-gold">Browse Menu →</button>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-2xl mx-auto page-enter">
        <p className="section-label">Checkout</p>
        <h1 className="section-heading mb-8">Your <em className="italic text-gold">Order</em></h1>

        {success ? (
          <div className="card text-center py-12">
            <div className="text-5xl mb-4">✅</div>
            <p className="text-green-300 text-lg">{success}</p>
            <p className="text-cream/45 text-sm mt-2">Redirecting to dashboard…</p>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="card mb-6">
              <h2 className="font-display text-xl text-gold mb-4">Order Summary</h2>
              {cart.map(i => (
                <div key={i._id} className="flex justify-between text-sm py-2 border-b border-gold/8 text-cream/70">
                  <span>{i.emoji} {i.name} ×{i.qty}</span>
                  <span>Rs. {i.price * i.qty}</span>
                </div>
              ))}
              <div className="flex justify-between font-medium mt-4 pt-3 border-t border-gold/20">
                <span>Grand Total</span>
                <span className="font-display text-xl text-gold">Rs. {total}</span>
              </div>
            </div>

            {err && <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 mb-5">{err}</div>}

            <form onSubmit={handleOrder} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Full Name</label><input className="input-field" value={form.name} onChange={set('name')} required /></div>
                <div><label className="label">Phone</label><input className="input-field" value={form.phone} onChange={set('phone')} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Order Type</label>
                  <select className="input-field" value={form.orderType} onChange={set('orderType')}>
                    <option value="dine-in">Dine In</option>
                    <option value="takeaway">Takeaway</option>
                    <option value="delivery">Delivery</option>
                  </select>
                </div>
                <div>
                  <label className="label">Payment</label>
                  <select className="input-field" value={form.paymentMethod} onChange={set('paymentMethod')}>
                    <option value="cash">💵 Cash</option>
                    <option value="esewa">📱 eSewa</option>
                    <option value="card">💳 Card</option>
                  </select>
                </div>
              </div>
              {form.orderType === 'delivery' && (
                <div><label className="label">Delivery Address</label><input className="input-field" value={form.deliveryAddress} onChange={set('deliveryAddress')} required /></div>
              )}
              <div><label className="label">Special Instructions</label><textarea className="input-field" rows={3} value={form.specialInstructions} onChange={set('specialInstructions')} placeholder="Allergies, spice level, etc." /></div>
              <button type="submit" disabled={loading} className="btn-gold w-full">{loading ? 'Placing order…' : 'Place Order →'}</button>
              <button type="button" onClick={() => navigate('/menu')} className="btn-outline w-full">← Add More Items</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
