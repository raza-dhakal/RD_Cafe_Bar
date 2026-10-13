import { useState, useEffect, useRef } from 'react';

// ════════════════════════════════════════════════════════════════
//  RD CAFE AI — Business Advisor
//  Owner asks in plain language → Claude analyses real sales data
// ════════════════════════════════════════════════════════════════

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const C = {
  dark:'#0E0B08', panel:'#1A1510', panel2:'#241E15',
  gold:'#C9A84C', cream:'#F5EDD8', muted:'rgba(245,237,216,0.5)',
  border:'rgba(201,168,76,0.18)',
};

const SUGGESTED = [
  'Why did sales drop this week?',
  'Which menu items should I remove?',
  'How can I reduce food waste?',
  'What should I promote tomorrow?',
  'Are my prices too low?',
];

export default function BusinessAdvisor() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [ctx, setCtx] = useState(null);
  const endRef = useRef(null);

  const token = localStorage.getItem('rdcafe_token');
  const headers = { 'Content-Type':'application/json', Authorization:`Bearer ${token}` };

  // Pull the café's real numbers so the AI answers from data, not vibes
  useEffect(() => {
    Promise.all([
      fetch(`${API}/admin/stats`, { headers }).then(r=>r.json()).catch(()=>({})),
      fetch(`${API}/orders/stats`, { headers }).then(r=>r.json()).catch(()=>({})),
      fetch(`${API}/orders/all`, { headers }).then(r=>r.json()).catch(()=>({})),
    ]).then(([s, o, ord]) => {
      const orders = (ord.data || []).slice(0, 40);
      setCtx({
        stats: s.data || {},
        orderStats: o.data || {},
        recentOrders: orders.map(x => ({
          date: x.createdAt?.slice(0,10), total: x.totalAmount, type: x.orderType,
          status: x.status, items: x.items?.map(i => `${i.name} x${i.quantity}`).join(', '),
        })),
      });
    });
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages, busy]);

  const ask = async (question) => {
    const q = (question ?? input).trim();
    if (!q || busy) return;
    setInput('');
    const history = [...messages, { role:'user', content:q }];
    setMessages(history);
    setBusy(true);

    const system = `You are the business advisor for RD Café & Bar, a café in Sunwal, Nepal (currency: Nepali Rupees, "Rs.").
You are talking to the owner. Answer from the data below — never invent numbers.
If the data is too thin to answer confidently, say so plainly and tell the owner what to track.
Be direct and specific. Give 2-3 concrete actions, not generic advice. Keep it under 180 words.

CAFÉ DATA (JSON):
${JSON.stringify(ctx, null, 1)}`;

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system,
          messages: history.map(m => ({ role:m.role, content:m.content })),
        }),
      });
      const d = await res.json();
      const text = (d.content || []).map(i => i.type==='text' ? i.text : '').join('\n').trim();
      setMessages(h => [...h, { role:'assistant', content: text || 'No answer returned.' }]);
    } catch {
      setMessages(h => [...h, { role:'assistant', content:'Could not reach the AI service. Check your connection and try again.' }]);
    }
    setBusy(false);
  };

  return (
    <div style={{ fontFamily:'"DM Sans",sans-serif', color:C.cream }}>

      <div style={{ marginBottom:'1.2rem' }}>
        <div style={{ fontSize:'0.6rem', letterSpacing:'0.28em', textTransform:'uppercase', color:C.gold, marginBottom:'0.5rem' }}>
          RD Café AI · Business Advisor
        </div>
        <h2 style={{ fontFamily:'"Cormorant Garamond",serif', fontWeight:300, fontSize:'clamp(1.6rem,4vw,2.4rem)', margin:0, lineHeight:1.1 }}>
          Ask your data <em style={{ fontStyle:'italic', color:C.gold }}>anything</em>
        </h2>
        <p style={{ color:C.muted, fontSize:'0.85rem', marginTop:'0.5rem' }}>
          The AI reads your real orders, revenue and menu performance before it answers.
        </p>
      </div>

      {/* Conversation */}
      <div style={{ background:C.panel, border:`1px solid ${C.border}`, minHeight:'320px', maxHeight:'440px', overflowY:'auto', padding:'1.3rem' }}>
        {messages.length === 0 && (
          <div style={{ textAlign:'center', padding:'2.5rem 1rem', color:C.muted }}>
            <div style={{ fontSize:'2.2rem', marginBottom:'0.7rem', opacity:0.4 }}>🤖</div>
            <p style={{ margin:0, fontSize:'0.88rem' }}>
              {ctx ? 'Ask a question, or pick one below.' : 'Loading your café data…'}
            </p>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{ display:'flex', justifyContent: m.role==='user' ? 'flex-end' : 'flex-start', marginBottom:'0.9rem' }}>
            <div style={{
              maxWidth:'82%', padding:'0.8rem 1rem', fontSize:'0.87rem', lineHeight:1.65,
              whiteSpace:'pre-wrap',
              background: m.role==='user' ? C.gold : C.panel2,
              color: m.role==='user' ? C.dark : C.cream,
              border: m.role==='user' ? 'none' : `1px solid ${C.border}`,
            }}>
              {m.content}
            </div>
          </div>
        ))}

        {busy && (
          <div style={{ display:'flex', gap:'0.4rem', alignItems:'center', color:C.muted, fontSize:'0.82rem', padding:'0.4rem 0' }}>
            <span style={{ animation:'blink 1.2s infinite' }}>🤖</span> Reading your numbers…
            <style>{`@keyframes blink{0%,100%{opacity:.35}50%{opacity:1}}`}</style>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Suggested questions */}
      {messages.length === 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem', marginTop:'0.9rem' }}>
          {SUGGESTED.map(q => (
            <button key={q} onClick={() => ask(q)} disabled={!ctx || busy}
              style={{ background:'transparent', border:`1px solid ${C.border}`, color:C.muted,
                padding:'0.45rem 0.85rem', fontSize:'0.74rem', cursor: ctx ? 'pointer':'default',
                fontFamily:'"DM Sans",sans-serif' }}>
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ display:'flex', gap:'0.6rem', marginTop:'1rem' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') ask(); }}
          placeholder="Why did sales drop last week?"
          disabled={!ctx || busy}
          style={{ flex:1, background:C.dark, border:`1px solid ${C.border}`, color:C.cream,
            padding:'0.8rem 1rem', fontSize:'0.88rem', fontFamily:'"DM Sans",sans-serif', outline:'none' }} />
        <button onClick={() => ask()} disabled={!ctx || busy || !input.trim()}
          style={{ background: (!ctx||busy||!input.trim()) ? C.panel2 : C.gold,
            color: (!ctx||busy||!input.trim()) ? C.muted : C.dark, border:'none',
            padding:'0.8rem 1.6rem', fontSize:'0.72rem', letterSpacing:'0.12em', textTransform:'uppercase',
            cursor: (!ctx||busy||!input.trim()) ? 'default':'pointer', fontFamily:'"DM Sans",sans-serif', fontWeight:500 }}>
          Ask
        </button>
      </div>

      <p style={{ fontSize:'0.7rem', color:C.muted, marginTop:'0.8rem' }}>
        Answers come from your own order history. The AI will say when the data is too thin to be sure.
      </p>
    </div>
  );
}
