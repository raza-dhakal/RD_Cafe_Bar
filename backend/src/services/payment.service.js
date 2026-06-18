const { Order } = require('../models/index');

// ─── eSewa ──────────────────────────────────────────────────────
const initiateEsewa = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, data: {
      merchantCode: process.env.ESEWA_MERCHANT_CODE || 'EPAYTEST',
      amount: order.totalAmount,
      taxAmount: 0, serviceCharge: 0, deliveryCharge: 0,
      productId: order.orderId,
      productName: `RD Cafe Order ${order.orderId}`,
      successUrl: `${process.env.FRONTEND_URL}/payment/success?orderId=${order.orderId}`,
      failureUrl: `${process.env.FRONTEND_URL}/payment/failure?orderId=${order.orderId}`,
      paymentUrl: process.env.NODE_ENV === 'production'
        ? 'https://epay.esewa.com.np/api/epay/main/v2/form'
        : 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
    }});
  } catch (err) { res.status(500).json({ success: false, message: 'eSewa init failed.' }); }
};

const verifyEsewa = async (req, res) => {
  try {
    const { data } = req.query;
    if (!data) return res.redirect(`${process.env.FRONTEND_URL}/payment/failure`);
    const decoded = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
    if (decoded.status === 'COMPLETE') {
      // ✅ Paisa aayo → payment paid + order CONFIRMED
      await Order.findOneAndUpdate(
        { orderId: decoded.transaction_uuid },
        { paymentStatus: 'paid', paymentMethod: 'esewa', paymentRef: decoded.transaction_code,
          status: 'confirmed', $push: { statusHistory: { status: 'confirmed', time: new Date(), note: 'Auto-confirmed: eSewa payment received' } } }
      );
      return res.redirect(`${process.env.FRONTEND_URL}/payment/success?orderId=${decoded.transaction_uuid}`);
    }
    res.redirect(`${process.env.FRONTEND_URL}/payment/failure`);
  } catch { res.redirect(`${process.env.FRONTEND_URL}/payment/failure`); }
};

// ─── Khalti ─────────────────────────────────────────────────────
const initiateKhalti = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    const url = process.env.NODE_ENV === 'production'
      ? 'https://khalti.com/api/v2/epayment/initiate/'
      : 'https://a.khalti.com/api/v2/epayment/initiate/';
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        return_url: `${process.env.FRONTEND_URL}/payment/success?orderId=${order.orderId}`,
        website_url: process.env.FRONTEND_URL,
        amount: order.totalAmount * 100,           // Khalti uses paisa
        purchase_order_id: order.orderId,
        purchase_order_name: `RD Cafe ${order.orderId}`,
        customer_info: { name: order.guestName || 'Customer', phone: order.guestPhone || '9800000000' },
      }),
    });
    const data = await response.json();
    if (data.payment_url) return res.json({ success: true, paymentUrl: data.payment_url, pidx: data.pidx });
    res.status(400).json({ success: false, message: 'Khalti init failed.', error: data });
  } catch (err) { res.status(500).json({ success: false, message: 'Khalti error.' }); }
};

const verifyKhalti = async (req, res) => {
  try {
    const { pidx, orderId } = req.body;
    const url = process.env.NODE_ENV === 'production'
      ? 'https://khalti.com/api/v2/epayment/lookup/'
      : 'https://a.khalti.com/api/v2/epayment/lookup/';
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ pidx }),
    });
    const data = await response.json();
    if (data.status === 'Completed') {
      // ✅ Paisa aayo → confirm order
      await Order.findOneAndUpdate(
        { orderId },
        { paymentStatus: 'paid', paymentMethod: 'khalti', paymentRef: pidx,
          status: 'confirmed', $push: { statusHistory: { status: 'confirmed', time: new Date(), note: 'Auto-confirmed: Khalti payment received' } } }
      );
      return res.json({ success: true, message: 'Khalti payment verified! Order confirmed.' });
    }
    res.status(400).json({ success: false, message: 'Payment not completed.' });
  } catch (err) { res.status(500).json({ success: false, message: 'Khalti verify failed.' }); }
};

// ─── Stripe (card) ──────────────────────────────────────────────
const createStripeIntent = async (req, res) => {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100),
      currency: 'npr',
      metadata: { orderId: order.orderId },
    });
    res.json({ success: true, clientSecret: intent.client_secret, publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
  } catch (err) { res.status(500).json({ success: false, message: 'Stripe error: ' + err.message }); }
};

const confirmStripePayment = async (req, res) => {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const { paymentIntentId, orderId } = req.body;
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (intent.status === 'succeeded') {
      await Order.findOneAndUpdate(
        { orderId },
        { paymentStatus: 'paid', paymentMethod: 'card', paymentRef: paymentIntentId,
          status: 'confirmed', $push: { statusHistory: { status: 'confirmed', time: new Date(), note: 'Auto-confirmed: Card payment received' } } }
      );
      return res.json({ success: true, message: 'Card payment confirmed! Order confirmed.' });
    }
    res.status(400).json({ success: false, message: 'Payment not succeeded.' });
  } catch (err) { res.status(500).json({ success: false, message: 'Stripe confirm error.' }); }
};

// ─── Cash / Bank transfer (offline) ─────────────────────────────
// NOTE: Order stays "pending" — admin confirms manually when cash/bank money received.
const confirmOfflinePayment = async (req, res) => {
  try {
    const { orderId, method } = req.body;
    const order = await Order.findOneAndUpdate({ orderId }, { paymentMethod: method || 'cash' }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, message: `${method || 'Cash'} order received. Awaiting confirmation.`, data: order });
  } catch (err) { res.status(500).json({ success: false, message: 'Payment confirm error.' }); }
};

module.exports = { initiateEsewa, verifyEsewa, initiateKhalti, verifyKhalti, createStripeIntent, confirmStripePayment, confirmOfflinePayment };
