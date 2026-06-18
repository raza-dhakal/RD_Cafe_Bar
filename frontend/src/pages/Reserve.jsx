import { useState } from 'react';
import api from '../api/axios';

export default function Reserve() {
  const [form, setForm] = useState({ name:'', contact:'', date:'', time:'', guests:'', occasion:'Casual Visit', specialRequests:'' });
  const [success, setSuccess] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true);
    try {
      const { data } = await api.post('/reservations', form);
      setSuccess(data.message);
      setForm({ name:'', contact:'', date:'', time:'', guests:'', occasion:'Casual Visit', specialRequests:'' });
    } catch (error) {
      setErr(error.response?.data?.message || 'Reservation failed. Try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-2xl mx-auto page-enter">
        <p className="section-label">Reservation</p>
        <h1 className="section-heading mb-8">Reserve Your <em className="italic text-gold">Table</em></h1>

        {success && <div className="bg-green-500/10 border border-green-500/30 text-green-300 text-sm px-4 py-4 mb-6">✅ {success}</div>}
        {err && <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 mb-5">{err}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Full Name</label><input className="input-field" value={form.name} onChange={set('name')} placeholder="Your name" required /></div>
            <div><label className="label">Phone / Email</label><input className="input-field" value={form.contact} onChange={set('contact')} placeholder="Contact info" required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Date</label><input className="input-field" type="date" value={form.date} onChange={set('date')} required /></div>
            <div><label className="label">Time</label><input className="input-field" type="time" value={form.time} onChange={set('time')} required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Number of Guests</label>
              <select className="input-field" value={form.guests} onChange={set('guests')} required>
                <option value="">Select guests</option>
                {['1 person','2 people','3–4 people','5–6 people','7+ people'].map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Occasion</label>
              <select className="input-field" value={form.occasion} onChange={set('occasion')}>
                {['Casual Visit','Birthday','Date Night','Business Meeting','Private Event'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div><label className="label">Special Requests</label><textarea className="input-field" rows={3} value={form.specialRequests} onChange={set('specialRequests')} placeholder="Dietary needs, seating preference, decorations…" /></div>
          <button type="submit" disabled={loading} className="btn-gold w-full">{loading ? 'Confirming…' : 'Confirm Reservation →'}</button>
        </form>
      </div>
    </div>
  );
}
