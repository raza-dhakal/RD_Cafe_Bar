import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart]     = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('rdcafe_cart');
    if (saved) try { setCart(JSON.parse(saved)); } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem('rdcafe_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i._id === item._id);
      if (existing) return prev.map(i => i._id === item._id ? { ...i, qty: (i.qty||1) + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
    setIsOpen(true);
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i._id !== id));

  const updateQty = (id, qty) => {
    if (qty <= 0) return removeFromCart(id);
    setCart(prev => prev.map(i => i._id === id ? { ...i, qty } : i));
  };

  const updateNote = (id, specialNote) => setCart(prev => prev.map(i => i._id === id ? { ...i, specialNote } : i));

  const clearCart = () => setCart([]);

  const count = cart.reduce((s, i) => s + (i.qty||1), 0);
  const total = cart.reduce((s, i) => s + i.price * (i.qty||1), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, updateNote, clearCart, count, total, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
