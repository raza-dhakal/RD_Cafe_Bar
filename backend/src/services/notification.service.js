const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
});

// ── Order Confirmation Email ──────────────────────────────────────
const sendOrderEmail = async (order, email, name) => {
  if (!email || !process.env.GMAIL_USER) return;
  const rows = order.items.map(i =>
    `<tr><td style="padding:8px;border-bottom:1px solid #1a1510">${i.name}${i.specialNote ? `<br><small style="color:#888">${i.specialNote}</small>` : ''}</td><td style="padding:8px;border-bottom:1px solid #1a1510;text-align:center">×${i.quantity}</td><td style="padding:8px;border-bottom:1px solid #1a1510;text-align:right;color:#C9A84C">Rs. ${i.price * i.quantity}</td></tr>`
  ).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0E0B08;font-family:Arial,sans-serif">
<div style="max-width:560px;margin:0 auto">
  <div style="background:#1A1510;padding:28px;text-align:center;border-bottom:2px solid #C9A84C">
    <div style="font-size:24px;color:#C9A84C;letter-spacing:3px">RD CAFÉ & BAR</div>
    <div style="font-size:10px;letter-spacing:3px;color:rgba(245,237,216,0.4);margin-top:6px;text-transform:uppercase">Sunwal-12, Bhumahi, Nawalparasi, Nepal</div>
  </div>
  <div style="padding:32px;color:#F5EDD8">
    <div style="text-align:center;margin-bottom:24px">
      <div style="font-size:48px">✅</div>
      <div style="font-size:22px;margin:8px 0 4px">Order Confirmed!</div>
      <div style="font-size:13px;color:rgba(245,237,216,0.55)">Thank you, <strong style="color:#C9A84C">${name}</strong>! We're preparing your order.</div>
    </div>
    <div style="background:#1A1510;border:1px solid rgba(201,168,76,0.2);padding:20px;margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:12px">
        <div><div style="font-size:9px;letter-spacing:3px;text-transform:uppercase;color:rgba(245,237,216,0.4);margin-bottom:4px">Order ID</div><div style="font-size:22px;color:#C9A84C">${order.orderId}</div></div>
        <div><div style="font-size:9px;letter-spacing:3px;text-transform:uppercase;color:rgba(245,237,216,0.4);margin-bottom:4px">Type</div><div style="font-size:14px;text-transform:capitalize">${order.orderType}</div></div>
        <div><div style="font-size:9px;letter-spacing:3px;text-transform:uppercase;color:rgba(245,237,216,0.4);margin-bottom:4px">Payment</div><div style="font-size:14px;text-transform:capitalize">${order.paymentMethod}</div></div>
      </div>
      <table style="width:100%;border-collapse:collapse;color:#F5EDD8">
        <thead><tr><th style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:rgba(245,237,216,0.4);padding:8px;text-align:left;border-bottom:1px solid rgba(201,168,76,0.2)">Item</th><th style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:rgba(245,237,216,0.4);padding:8px;border-bottom:1px solid rgba(201,168,76,0.2)">Qty</th><th style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:rgba(245,237,216,0.4);padding:8px;text-align:right;border-bottom:1px solid rgba(201,168,76,0.2)">Price</th></tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr><td colspan="2" style="padding:12px 8px;font-size:15px"><strong>Total</strong></td><td style="padding:12px 8px;text-align:right;font-size:20px;color:#C9A84C"><strong>Rs. ${order.totalAmount}</strong></td></tr></tfoot>
      </table>
    </div>
    ${order.loyaltyPointsEarned > 0 ? `<div style="background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.2);padding:14px;margin-bottom:16px;text-align:center"><div style="color:#C9A84C;font-size:14px">🎉 You earned <strong>${order.loyaltyPointsEarned} loyalty points!</strong></div></div>` : ''}
    <div style="background:#1A1510;border:1px solid rgba(201,168,76,0.15);padding:16px;text-align:center">
      <div style="font-size:11px;color:rgba(245,237,216,0.5);margin-bottom:6px">Questions? Contact us</div>
      <a href="tel:+9779846863458" style="color:#C9A84C;font-size:15px;text-decoration:none">📞 +977 9846863458</a>
      <div style="margin-top:8px"><a href="mailto:rdcafebar@np.com" style="color:rgba(245,237,216,0.4);font-size:12px;text-decoration:none">rdcafebar@np.com</a></div>
    </div>
  </div>
  <div style="background:#1A1510;padding:20px;text-align:center;border-top:1px solid rgba(201,168,76,0.12)">
    <div style="color:#C9A84C;font-size:14px;margin-bottom:4px">RD Café & Bar</div>
    <div style="font-size:10px;color:rgba(245,237,216,0.3)">© 2024 RD Café & Bar · rdcafebar@np.com · @rdcafebar</div>
  </div>
</div></body></html>`;

  try {
    await transporter.sendMail({ from: `"RD Café & Bar ☕" <${process.env.GMAIL_USER}>`, to: email, subject: `✅ Order Confirmed #${order.orderId} | RD Café & Bar`, html });
    console.log(`📧 Email sent to ${email}`);
  } catch (err) { console.error('Email error:', err.message); }
};

// ── Status Update Email ───────────────────────────────────────────
const sendStatusEmail = async (order, email, name, status) => {
  if (!email) return;
  const icons = { confirmed:'✅', preparing:'👨‍🍳', ready:'🎉', 'out-for-delivery':'🛵', delivered:'✅', cancelled:'❌' };
  const msgs  = { confirmed:'Your order has been confirmed!', preparing:'Your order is being prepared!', ready:'Your order is ready for pickup!', 'out-for-delivery':'Your order is on the way!', delivered:'Your order has been delivered. Enjoy!', cancelled:'Your order has been cancelled.' };
  try {
    await transporter.sendMail({
      from: `"RD Café & Bar ☕" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `${icons[status]||'📦'} Order ${status} — #${order.orderId} | RD Café & Bar`,
      html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;background:#0E0B08;color:#F5EDD8;padding:32px;border:1px solid rgba(201,168,76,0.2)"><h2 style="color:#C9A84C">RD Café & Bar</h2><p>Hi <strong>${name}</strong>,</p><p style="font-size:18px">${icons[status]||'📦'} ${msgs[status]||`Order status: ${status}`}</p><p>Order: <strong style="color:#C9A84C">#${order.orderId}</strong> · Rs. ${order.totalAmount}</p><p style="margin-top:20px">Questions? <a href="tel:+9779846863458" style="color:#C9A84C">+977 9846863458</a></p><p style="font-size:10px;color:rgba(245,237,216,0.3);margin-top:24px">© 2024 RD Café & Bar</p></div>`,
    });
  } catch (err) { console.error('Status email error:', err.message); }
};

// ── OTP Email ──────────────────────────────────────────────────────
const sendOTPEmail = async (email, otp, purpose = 'verification') => {
  if (!email) return;
  try {
    await transporter.sendMail({
      from: `"RD Café & Bar ☕" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `🔑 Your OTP Code | RD Café & Bar`,
      html: `<div style="font-family:Arial,sans-serif;max-width:400px;margin:auto;background:#0E0B08;color:#F5EDD8;padding:32px;border:1px solid rgba(201,168,76,0.2)"><h2 style="color:#C9A84C">RD Café & Bar</h2><p>${purpose} OTP:</p><div style="font-size:42px;letter-spacing:12px;color:#C9A84C;text-align:center;margin:20px 0;font-weight:bold;background:#1a1510;padding:16px">${otp}</div><p style="color:rgba(245,237,216,0.5);font-size:12px">⏱ Valid for 5 minutes. Do not share this code.</p></div>`,
    });
  } catch (err) { console.error('OTP email error:', err.message); }
};

// ── SMS via Sparrow SMS Nepal ──────────────────────────────────────
const sendSMS = async (phone, message) => {
  if (!phone || !process.env.SPARROW_TOKEN) return;
  let p = phone.replace(/\D/g, '');
  if (p.startsWith('977')) p = p.slice(3);
  if (p.startsWith('0')) p = p.slice(1);
  try {
    const res = await fetch('http://api.sparrowsms.com/v2/sms/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: process.env.SPARROW_TOKEN, from: process.env.SPARROW_FROM || 'RDCafe', to: `977${p}`, text: message }),
    });
    const data = await res.json();
    if (data.response_code === 200) console.log(`📲 SMS sent to 977${p}`);
    return data;
  } catch (err) { console.error('SMS error:', err.message); }
};

const sendOrderSMS = (order, phone, name) =>
  sendSMS(phone, `RD Cafe & Bar\nHi ${name}!\nOrder #${order.orderId} confirmed!\nTotal: Rs.${order.totalAmount}\nType: ${order.orderType}\nQueries: 9846863458`);

const sendStatusSMS = (order, phone, status) => {
  const msgs = {
    preparing: `RD Cafe: Order #${order.orderId} is being prepared! 👨‍🍳`,
    ready: `RD Cafe: Order #${order.orderId} is READY! Please collect. 🎉`,
    'out-for-delivery': `RD Cafe: Order #${order.orderId} is on the way! 🛵`,
    delivered: `RD Cafe: Order #${order.orderId} delivered! Enjoy! ☕`,
    cancelled: `RD Cafe: Order #${order.orderId} cancelled. Call 9846863458`,
  };
  return sendSMS(phone, msgs[status] || `RD Cafe: Order #${order.orderId} status: ${status}`);
};

// ── WhatsApp Business API ──────────────────────────────────────────
const sendWhatsApp = async (phone, message) => {
  if (!phone || !process.env.WHATSAPP_TOKEN) return;
  let p = phone.replace(/\D/g, '');
  if (!p.startsWith('977')) p = '977' + p.replace(/^0/, '');
  try {
    await fetch(`https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', to: p, type: 'text', text: { body: message } }),
    });
    console.log(`💬 WhatsApp sent to ${p}`);
  } catch (err) { console.error('WhatsApp error:', err.message); }
};

// ── Send ALL notifications at once ────────────────────────────────
const sendAllNotifications = async (order, customer) => {
  const { name, email, phone } = customer;
  const waMsg = `*RD Café & Bar* ☕\n\nNamaste ${name}! 🙏\n\n✅ Order *#${order.orderId}* confirmed!\n\n*Total:* Rs. ${order.totalAmount}\n*Type:* ${order.orderType}\n*Payment:* ${order.paymentMethod}\n${order.loyaltyPointsEarned > 0 ? `\n🎉 *+${order.loyaltyPointsEarned} loyalty points earned!*\n` : ''}\nWe're preparing your order now! ☕\n\nQueries: +977 9846863458\n_RD Café & Bar, Sunwal, Nepal_`;
  await Promise.allSettled([
    email ? sendOrderEmail(order, email, name) : null,
    phone ? sendOrderSMS(order, phone, name) : null,
    phone && process.env.WHATSAPP_TOKEN ? sendWhatsApp(phone, waMsg) : null,
  ].filter(Boolean));
};

module.exports = { sendOrderEmail, sendStatusEmail, sendOTPEmail, sendSMS, sendOrderSMS, sendStatusSMS, sendWhatsApp, sendAllNotifications };
