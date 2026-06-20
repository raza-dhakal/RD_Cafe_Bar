// ════════════════════════════════════════════════════════════════
//  Email via BREVO HTTP API (works on Render free — no SMTP ports)
//  SMS via Sparrow (HTTP) · WhatsApp via Meta API (HTTP)
// ════════════════════════════════════════════════════════════════

const SENDER = { name: 'RD Café & Bar', email: process.env.GMAIL_USER || 'rjndkl1224@gmail.com' };

// ── Core Brevo sender ──────────────────────────────────────────
async function sendBrevoEmail(toEmail, toName, subject, htmlContent) {
  if (!toEmail || !process.env.BREVO_API_KEY) {
    if (!process.env.BREVO_API_KEY) console.warn('⚠️ BREVO_API_KEY not set — email skipped');
    return;
  }
  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json', 'accept': 'application/json' },
      body: JSON.stringify({
        sender: SENDER,
        to: [{ email: toEmail, name: toName || 'Customer' }],
        subject,
        htmlContent,
      }),
    });
    if (res.ok) console.log(`📧 Email sent to ${toEmail}`);
    else console.error('Brevo email error:', await res.text());
  } catch (err) { console.error('Brevo email error:', err.message); }
}

// ── Order Confirmation Email ──────────────────────────────────
const sendOrderEmail = async (order, email, name) => {
  if (!email) return;
  const rows = order.items.map(i =>
    `<tr><td style="padding:8px;border-bottom:1px solid #1a1510;color:#F5EDD8">${i.name}${i.specialNote ? `<br><small style="color:#888">${i.specialNote}</small>` : ''}</td><td style="padding:8px;border-bottom:1px solid #1a1510;text-align:center;color:#F5EDD8">×${i.quantity}</td><td style="padding:8px;border-bottom:1px solid #1a1510;text-align:right;color:#C9A84C">Rs. ${i.price * i.quantity}</td></tr>`
  ).join('');

  const html = `<div style="max-width:560px;margin:0 auto;font-family:Arial,sans-serif;background:#0E0B08">
    <div style="background:#1A1510;padding:28px;text-align:center;border-bottom:2px solid #C9A84C">
      <div style="font-size:24px;color:#C9A84C;letter-spacing:3px">RD CAFÉ &amp; BAR</div>
      <div style="font-size:10px;letter-spacing:3px;color:rgba(245,237,216,0.4);margin-top:6px;text-transform:uppercase">Sunwal-12, Bhumahi, Nawalparasi, Nepal</div>
    </div>
    <div style="padding:32px;color:#F5EDD8">
      <div style="text-align:center;margin-bottom:24px">
        <div style="font-size:48px">✅</div>
        <div style="font-size:22px;margin:8px 0 4px">Order Confirmed!</div>
        <div style="font-size:13px;color:rgba(245,237,216,0.55)">Thank you, <strong style="color:#C9A84C">${name}</strong>! We're preparing your order.</div>
      </div>
      <div style="background:#1A1510;border:1px solid rgba(201,168,76,0.2);padding:20px;margin-bottom:16px">
        <div style="margin-bottom:14px"><span style="font-size:9px;letter-spacing:3px;text-transform:uppercase;color:rgba(245,237,216,0.4)">Order ID</span><br><span style="font-size:22px;color:#C9A84C">${order.orderId}</span></div>
        <table style="width:100%;border-collapse:collapse">
          <tbody>${rows}</tbody>
          <tfoot><tr><td colspan="2" style="padding:12px 8px;color:#F5EDD8"><strong>Total</strong></td><td style="padding:12px 8px;text-align:right;font-size:20px;color:#C9A84C"><strong>Rs. ${order.totalAmount}</strong></td></tr></tfoot>
        </table>
        <div style="margin-top:12px;font-size:12px;color:rgba(245,237,216,0.5)">Type: ${order.orderType} · Payment: ${order.paymentMethod}</div>
      </div>
      ${order.loyaltyPointsEarned > 0 ? `<div style="background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.2);padding:14px;text-align:center;color:#C9A84C">🎉 You earned <strong>${order.loyaltyPointsEarned} loyalty points!</strong></div>` : ''}
      <div style="text-align:center;margin-top:16px"><a href="tel:+9779846863458" style="color:#C9A84C;text-decoration:none">📞 +977 9846863458</a></div>
    </div>
    <div style="background:#1A1510;padding:16px;text-align:center;font-size:10px;color:rgba(245,237,216,0.3)">© 2024 RD Café &amp; Bar · @rdcafebar</div>
  </div>`;

  await sendBrevoEmail(email, name, `✅ Order Confirmed #${order.orderId} | RD Café & Bar`, html);
};

// ── Status Update Email ───────────────────────────────────────
const sendStatusEmail = async (order, email, name, status) => {
  if (!email) return;
  const icons = { confirmed:'✅', preparing:'👨‍🍳', ready:'🎉', 'out-for-delivery':'🛵', delivered:'✅', cancelled:'❌' };
  const msgs  = { confirmed:'Your order has been confirmed!', preparing:'Your order is being prepared!', ready:'Your order is ready for pickup!', 'out-for-delivery':'Your order is on the way!', delivered:'Your order has been delivered. Enjoy!', cancelled:'Your order has been cancelled.' };
  const html = `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;background:#0E0B08;color:#F5EDD8;padding:32px;border:1px solid rgba(201,168,76,0.2)">
    <h2 style="color:#C9A84C">RD Café &amp; Bar</h2><p>Hi <strong>${name}</strong>,</p>
    <p style="font-size:18px">${icons[status]||'📦'} ${msgs[status]||`Order status: ${status}`}</p>
    <p>Order: <strong style="color:#C9A84C">#${order.orderId}</strong> · Rs. ${order.totalAmount}</p>
    <p style="margin-top:16px"><a href="tel:+9779846863458" style="color:#C9A84C">📞 +977 9846863458</a></p></div>`;
  await sendBrevoEmail(email, name, `${icons[status]||'📦'} Order ${status} — #${order.orderId} | RD Café & Bar`, html);
};

// ── OTP Email ──────────────────────────────────────────────────
const sendOTPEmail = async (email, otp, purpose = 'verification') => {
  if (!email) return;
  const html = `<div style="font-family:Arial,sans-serif;max-width:400px;margin:auto;background:#0E0B08;color:#F5EDD8;padding:32px;border:1px solid rgba(201,168,76,0.2)">
    <h2 style="color:#C9A84C">RD Café &amp; Bar</h2><p>${purpose} code:</p>
    <div style="font-size:42px;letter-spacing:12px;color:#C9A84C;text-align:center;margin:20px 0;font-weight:bold;background:#1a1510;padding:16px">${otp}</div>
    <p style="color:rgba(245,237,216,0.5);font-size:12px">⏱ Valid for 5 minutes. Do not share this code.</p></div>`;
  await sendBrevoEmail(email, 'Admin', `🔑 Your OTP Code | RD Café & Bar`, html);
};

// ── SMS via Sparrow SMS Nepal (HTTP — works on Render) ─────────
const sendSMS = async (phone, message) => {
  if (!phone || !process.env.SPARROW_TOKEN) return;
  let p = phone.replace(/\D/g, '');
  if (p.startsWith('977')) p = p.slice(3);
  if (p.startsWith('0')) p = p.slice(1);
  try {
    const res = await fetch('http://api.sparrowsms.com/v2/sms/', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: process.env.SPARROW_TOKEN, from: process.env.SPARROW_FROM || 'RDCafe', to: `977${p}`, text: message }),
    });
    const data = await res.json();
    if (data.response_code === 200) console.log(`📲 SMS sent to 977${p}`);
    return data;
  } catch (err) { console.error('SMS error:', err.message); }
};
const sendOrderSMS = (order, phone, name) =>
  sendSMS(phone, `RD Cafe & Bar\nHi ${name}!\nOrder #${order.orderId} confirmed!\nTotal: Rs.${order.totalAmount}\nQueries: 9846863458`);
const sendStatusSMS = (order, phone, status) => {
  const msgs = { preparing:`RD Cafe: Order #${order.orderId} is being prepared! 👨‍🍳`, ready:`RD Cafe: Order #${order.orderId} is READY! 🎉`, 'out-for-delivery':`RD Cafe: Order #${order.orderId} on the way! 🛵`, delivered:`RD Cafe: Order #${order.orderId} delivered! ☕`, cancelled:`RD Cafe: Order #${order.orderId} cancelled. Call 9846863458` };
  return sendSMS(phone, msgs[status] || `RD Cafe: Order #${order.orderId} status: ${status}`);
};

// ── WhatsApp (HTTP — optional) ─────────────────────────────────
const sendWhatsApp = async (phone, message) => {
  if (!phone || !process.env.WHATSAPP_TOKEN) return;
  let p = phone.replace(/\D/g, '');
  if (!p.startsWith('977')) p = '977' + p.replace(/^0/, '');
  try {
    await fetch(`https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`, {
      method: 'POST', headers: { 'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', to: p, type: 'text', text: { body: message } }),
    });
    console.log(`💬 WhatsApp sent to ${p}`);
  } catch (err) { console.error('WhatsApp error:', err.message); }
};

// ── Send ALL at once ───────────────────────────────────────────
const sendAllNotifications = async (order, customer) => {
  const { name, email, phone } = customer;
  const waMsg = `*RD Café & Bar* ☕\n\nNamaste ${name}! 🙏\n\n✅ Order *#${order.orderId}* confirmed!\n*Total:* Rs. ${order.totalAmount}\n*Type:* ${order.orderType}\n\nQueries: +977 9846863458`;
  await Promise.allSettled([
    email ? sendOrderEmail(order, email, name) : null,
    phone ? sendOrderSMS(order, phone, name) : null,
    phone && process.env.WHATSAPP_TOKEN ? sendWhatsApp(phone, waMsg) : null,
  ].filter(Boolean));
};

module.exports = { sendOrderEmail, sendStatusEmail, sendOTPEmail, sendSMS, sendOrderSMS, sendStatusSMS, sendWhatsApp, sendAllNotifications };