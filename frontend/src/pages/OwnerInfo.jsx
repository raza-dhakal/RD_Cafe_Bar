import { useState } from 'react';
const rajanPhoto = '/rajan_dhakal.jpg';

const content = {
  en: {
    p1: 'Hello! I\'m Rajan Dhakal, the founder of RD Café & Bar, located in the heart of Sunwal, Nawalparasi. My love for coffee started during my years studying in Japan, where I discovered the beauty of specialty brewing and the art of slow mornings.',
    p2: 'I returned to Nepal with a dream: to create a space where great coffee meets genuine warmth. Every cup at RD Café is a piece of that journey — crafted with care, served with heart.',
    title: 'Founder & Head Barista',
  },
  jp: {
    p1: 'こんにちは！私はRDカフェ＆バーの創設者、ラジャン・ダカルです。ネパール、ナワルパラシのスンワルにあるカフェです。コーヒーへの愛は、日本に留学中に始まりました。',
    p2: 'ネパールに戻り、ひとつの夢を持ちました。素晴らしいコーヒーと温かいもてなしが出会える場所を作ること。RDカフェの一杯一杯に、その旅の思いが込められています。',
    title: '創設者 & ヘッドバリスタ',
  },
};

export default function OwnerInfo() {
  const [lang, setLang] = useState('en');
  const c = content[lang];

  return (
    <div className="min-h-screen flex items-center px-6 md:px-20 py-24">
      <div className="grid md:grid-cols-2 gap-16 items-center w-full max-w-5xl mx-auto">

        {/* Real photo */}
        <div className="relative">
          <img
            src={rajanPhoto}
            alt="Rajan Dhakal — Founder of RD Cafe"
            className="w-full aspect-[3/4] object-cover object-top border border-gold/15"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-dark/80 to-transparent p-6">
            <p className="font-display text-2xl text-gold">Rajan Dhakal</p>
            <p className="text-xs tracking-widest uppercase text-cream/60 mt-1">{c.title}</p>
          </div>
        </div>

        <div>
          <p className="section-label">Meet the Owner</p>
          {/* Language toggle */}
          <div className="flex gap-2 mb-6">
            {[['en','English'],['jp','日本語']].map(([l,label]) => (
              <button key={l} onClick={() => setLang(l)}
                className={`text-xs px-4 py-1.5 border tracking-widest uppercase transition-all ${lang===l ? 'bg-gold border-gold text-dark' : 'border-gold/22 text-cream/50 hover:border-gold'}`}>
                {label}
              </button>
            ))}
          </div>

          <h2 className="font-display text-4xl font-light mb-6">
            {lang==='en' ? 'Rajan' : 'ラジャン'} <em className="italic text-gold">{lang==='en' ? 'Dhakal' : 'ダカル'}</em>
          </h2>

          <p className="text-sm leading-loose text-cream/55 mb-4">{c.p1}</p>
          <p className="text-sm leading-loose text-cream/55 mb-8">{c.p2}</p>

          <p className="font-display italic text-gold text-base mb-8">
            — Rajan Dhakal, {c.title}
          </p>

          {/* Contact info */}
          <div className="border-t border-gold/15 pt-6 space-y-3">
            <div className="flex gap-3 text-sm text-cream/60">
              <span>📍</span>
              <span>Sunwal-12, Bhumahi, Nawalparasi, Nepal</span>
            </div>
            <div className="flex gap-3 text-sm text-cream/60">
              <span>📞</span>
              <a href="tel:+9779846863458" className="hover:text-gold transition-colors">+977 9846863458</a>
            </div>
            <div className="flex gap-3 text-sm text-cream/60">
              <span>📧</span>
              <a href="mailto:rdcafebar@np.com" className="hover:text-gold transition-colors">rdcafebar@np.com</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
