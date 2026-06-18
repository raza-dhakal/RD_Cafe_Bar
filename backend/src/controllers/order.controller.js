const mongoose = require('mongoose');
const { Order, MenuItem, User } = require('../models/index');
const { sendAllNotifications, sendStatusSMS, sendStatusEmail } = require('../services/notification.service');

exports.createOrder = async (req, res) => {
  try {
    const { items, orderType, paymentMethod, deliveryAddress, specialInstructions, guestName, guestPhone, guestEmail } = req.body;
    if (!items?.length) return res.status(400).json({ success: false, message: 'Order must have at least one item.' });

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      let price = item.price;
      let name  = item.name;
      let menuRef = undefined;

      // Only look up in DB if a REAL MongoDB ObjectId was sent.
      // Fake IDs like "hc2" are ignored — we trust the name/price from frontend.
      if (item.menuItemId && mongoose.Types.ObjectId.isValid(item.menuItemId)) {
        const menuItem = await MenuItem.findById(item.menuItemId);
        if (menuItem) {
          price   = menuItem.price;     // use DB price (more secure)
          name    = menuItem.name;
          menuRef = menuItem._id;
        }
      }

      if (price == null || isNaN(price)) {
        return res.status(400).json({ success: false, message: `Price missing for "${name || 'item'}".` });
      }

      const qty = item.quantity || 1;
      const subtotal = price * qty;
      totalAmount += subtotal;

      orderItems.push({
        menuItem: menuRef,            // can be undefined — that's fine
        name,
        price,
        quantity: qty,
        subtotal,
        specialNote: item.specialNote || '',
      });
    }

    const pointsEarned = Math.floor(totalAmount / 10);
    const orderData = {
      items: orderItems, totalAmount,
      orderType: orderType || 'dine-in',
      paymentMethod: paymentMethod || 'cash',
      specialInstructions,
      loyaltyPointsEarned: pointsEarned,
      statusHistory: [{ status: 'pending', time: new Date() }],
    };
    if (req.user) orderData.user = req.user._id;
    else { orderData.guestName = guestName; orderData.guestPhone = guestPhone; orderData.guestEmail = guestEmail; }
    if (orderType === 'delivery' && deliveryAddress) orderData.deliveryAddress = deliveryAddress;

    const order = await Order.create(orderData);

    // Loyalty / stats for logged-in user
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { $inc: { loyaltyPoints: pointsEarned, totalOrders: 1, totalSpent: totalAmount } });
    }

    // Bump orderCount only for items that exist in DB (real IDs)
    const validIds = orderItems.map(i => i.menuItem).filter(Boolean);
    if (validIds.length) {
      await MenuItem.updateMany({ _id: { $in: validIds } }, { $inc: { orderCount: 1 } });
    }

    // Real-time notify admin
    const io = req.app.get('io');
    if (io) io.to('admin-room').emit('new-order', { orderId: order.orderId, total: totalAmount, type: orderType, time: new Date() });

    // SMS + Email + WhatsApp
    const customer = {
      name:  req.user?.name  || guestName  || 'Customer',
      email: req.user?.email || guestEmail,
      phone: req.user?.phone || guestPhone,
    };
    sendAllNotifications(order, customer).catch(console.error);

    res.status(201).json({ success: true, message: `Order #${order.orderId} placed! Confirmation sent via SMS & Email. ☕`, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Order failed: ' + err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).populate('items.menuItem', 'name emoji');
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) { res.status(500).json({ success: false, message: 'Failed to fetch orders.' }); }
};

exports.trackOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId }).populate('items.menuItem', 'name emoji price');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, data: order });
  } catch (err) { res.status(500).json({ success: false, message: 'Track failed.' }); }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { status, date, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (date) { const s = new Date(date); s.setHours(0,0,0,0); const e = new Date(date); e.setHours(23,59,59,999); filter.createdAt = { $gte: s, $lte: e }; }
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip((page-1)*Number(limit)).limit(Number(limit)).populate('user','name email phone').populate('items.menuItem','name emoji'),
      Order.countDocuments(filter),
    ]);
    res.json({ success: true, count: orders.length, total, data: orders });
  } catch (err) { res.status(500).json({ success: false, message: 'Failed.' }); }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    order.status = status;
    order.statusHistory.push({ status, time: new Date(), note });
    await order.save();
    await order.populate('user', 'phone email name');

    const io = req.app.get('io');
    if (io) io.to(`order-${order.orderId}`).emit('order-status', { status, orderId: order.orderId, time: new Date() });

    const phone = order.user?.phone || order.guestPhone;
    const email = order.user?.email || order.guestEmail;
    const name  = order.user?.name  || order.guestName || 'Customer';
    if (phone) sendStatusSMS(order, phone, status).catch(console.error);
    if (email) sendStatusEmail(order, email, name, status).catch(console.error);

    res.json({ success: true, message: `Status updated to "${status}"`, data: order });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.getOrderStats = async (req, res) => {
  try {
    const today    = new Date(); today.setHours(0,0,0,0);
    const weekAgo  = new Date(); weekAgo.setDate(weekAgo.getDate()-7);
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
    const [todayCount, weekCount, monthCount, revenueData, statusData, topItems, dailyRevenue] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.countDocuments({ createdAt: { $gte: weekAgo } }),
      Order.countDocuments({ createdAt: { $gte: monthStart } }),
      Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Order.aggregate([
        { $unwind: '$items' },
        { $group: { _id: '$items.name', count: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price','$items.quantity'] } } } },
        { $sort: { count: -1 } }, { $limit: 5 },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: weekAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);
    res.json({ success: true, data: {
      todayOrders: todayCount, weekOrders: weekCount, monthOrders: monthCount,
      totalRevenue: revenueData[0]?.total || 0,
      statusBreakdown: Object.fromEntries(statusData.map(s => [s._id, s.count])),
      topItems, dailyRevenue,
    }});
  } catch (err) { res.status(500).json({ success: false, message: 'Stats failed.' }); }
};
