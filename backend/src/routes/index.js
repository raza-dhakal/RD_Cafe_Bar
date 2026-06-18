// ════════════════════════════════════════
// AUTH ROUTES
// ════════════════════════════════════════
const express = require('express');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth.middleware');
const { User, MenuItem, Order, Reservation, Review } = require('../models/index');
const authCtrl = require('../controllers/auth.controller');
const orderCtrl = require('../controllers/order.controller');
const paymentSvc = require('../services/payment.service');

const authRouter = express.Router();
authRouter.post('/register',           authCtrl.register);
authRouter.post('/login',              authCtrl.login);
authRouter.get('/me',        protect,  authCtrl.getMe);
authRouter.patch('/profile', protect,  authCtrl.updateProfile);
authRouter.post('/forgot-password',    authCtrl.forgotPassword);
authRouter.patch('/reset-password/:token', authCtrl.resetPassword);
authRouter.post('/admin/request-otp', authCtrl.adminRequestOtp);
authRouter.post('/admin/verify-otp',  authCtrl.adminVerifyOtp);

// ════════════════════════════════════════
// MENU ROUTES
// ════════════════════════════════════════
const menuRouter = express.Router();
menuRouter.get('/', async (req, res) => {
  try {
    const { category, search, veg, featured } = req.query;
    const filter = { isAvailable: true };
    if (category)        filter.category = category;
    if (veg === 'true')  filter.isVeg = true;
    if (featured === 'true') filter.isFeatured = true;
    if (search) filter.$or = [
      { name:        { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags:        { $in: [new RegExp(search, 'i')] } },
    ];
    const items = await MenuItem.find(filter).sort({ isFeatured: -1, orderCount: -1 });
    res.json({ success: true, count: items.length, data: items });
  } catch (err) { res.status(500).json({ success: false, message: 'Failed.' }); }
});
menuRouter.get('/seed', protect, adminOnly, async (req, res) => {
  try {
    const count = await MenuItem.countDocuments();
    if (count > 0) return res.json({ success: true, message: `Already seeded: ${count} items.` });
    const items = [
      // Hot Coffee
      { name:'Classic Espresso',     description:'Double shot single-origin, bold and velvety',       price:180, category:'hot-coffee',   emoji:'☕', tags:['espresso','hot'], isFeatured:true },
      { name:'Americano',            description:'Espresso with hot water, smooth and clean',         price:200, category:'hot-coffee',   emoji:'☕' },
      { name:'Cappuccino',           description:'Equal parts espresso, steamed milk and foam',       price:220, category:'hot-coffee',   emoji:'☕' },
      { name:'Café Latte',           description:'Espresso with silky steamed milk',                  price:220, category:'hot-coffee',   emoji:'☕' },
      { name:'Caramel Latte',        description:'Espresso with rich caramel drizzle',                price:240, category:'hot-coffee',   emoji:'☕' },
      { name:'Vanilla Latte',        description:'Smooth latte with Madagascar vanilla',              price:240, category:'hot-coffee',   emoji:'☕' },
      { name:'Hazelnut Mocha',       description:'Espresso, chocolate, hazelnut, steamed milk',       price:250, category:'hot-coffee',   emoji:'☕' },
      { name:'Matcha Latte',         description:'Ceremonial grade matcha with steamed milk',         price:240, category:'hot-coffee',   emoji:'🍵', isVeg:true, tags:['matcha','japanese'] },
      { name:'RD Signature Coffee',  description:'Our secret blend — smooth, rich, unforgettable',   price:260, category:'hot-coffee',   emoji:'☕', isFeatured:true, tags:['signature'] },
      { name:'Japanese Blend Coffee',description:'Light roast pour-over, floral and delicate',       price:230, category:'hot-coffee',   emoji:'☕', tags:['japanese'] },
      // Cold Coffee
      { name:'Iced Americano',       description:'Espresso over ice with cold water',                 price:220, category:'cold-coffee',  emoji:'🧊' },
      { name:'Iced Café Latte',      description:'Espresso with cold milk over ice',                  price:240, category:'cold-coffee',  emoji:'🧊' },
      { name:'Caramel Iced Latte',   description:'Cold latte with golden caramel drizzle',            price:250, category:'cold-coffee',  emoji:'🧊' },
      { name:'Vanilla Cold Brew',    description:'18-hour cold brew with Madagascar vanilla',         price:250, category:'cold-coffee',  emoji:'🧊', isFeatured:true },
      { name:'Coffee Float',         description:'Cold brew topped with vanilla ice cream',           price:260, category:'cold-coffee',  emoji:'🧊' },
      { name:'RD Cold Brew Special', description:'Our signature 24-hour cold brew',                   price:270, category:'cold-coffee',  emoji:'🧊', isFeatured:true, tags:['signature'] },
      { name:'Ice Matcha Latte',     description:'Ceremonial matcha over iced oat milk',              price:250, category:'cold-coffee',  emoji:'🍵', isVeg:true },
      // Tea
      { name:'Japanese Green Tea',   description:'Premium sencha from Shizuoka',                      price:180, category:'tea',          emoji:'🍵', isVeg:true, tags:['japanese','green'] },
      { name:'Matcha Tea',           description:'Ceremonial grade matcha, whisked to perfection',    price:200, category:'tea',          emoji:'🍵', isVeg:true },
      { name:'Royal Milk Tea',       description:'Japanese-style rich milk tea',                      price:220, category:'tea',          emoji:'🍵', isFeatured:true },
      { name:'Chai Masala Tea',      description:'Spiced milk tea with cardamom and ginger',          price:200, category:'tea',          emoji:'🍵', isVeg:true },
      { name:'Earl Grey Tea',        description:'Bergamot-scented black tea, aromatic',              price:190, category:'tea',          emoji:'🍵', isVeg:true },
      { name:'Honey Ginger Tea',     description:'Fresh ginger with organic honey',                   price:200, category:'tea',          emoji:'🍵', isVeg:true },
      { name:'Peach Iced Tea',       description:'Cold brewed tea with fresh peach syrup',            price:210, category:'tea',          emoji:'🍵', isVeg:true },
      // Soft Drinks
      { name:'Coca-Cola',            description:'Classic Coca-Cola, ice cold',                       price:120, category:'soft-drinks',  emoji:'🥤', isVeg:true },
      { name:'Coca-Cola Zero',       description:'Zero sugar, full Coca-Cola taste',                  price:120, category:'soft-drinks',  emoji:'🥤', isVeg:true },
      { name:'Sprite',               description:'Crisp lemon-lime soda',                             price:120, category:'soft-drinks',  emoji:'🥤', isVeg:true },
      { name:'Fanta Orange',         description:'Fruity orange fizz',                                price:120, category:'soft-drinks',  emoji:'🥤', isVeg:true },
      { name:'Melon Soda',           description:'Japanese honeydew melon cream soda',                price:130, category:'soft-drinks',  emoji:'🥤', isVeg:true, tags:['japanese'] },
      { name:'Yuzu Sparkling',       description:'Japanese yuzu citrus sparkling',                    price:150, category:'soft-drinks',  emoji:'🥤', isVeg:true, tags:['japanese'] },
      { name:'Red Bull',             description:'Energy drink, original flavor',                     price:180, category:'soft-drinks',  emoji:'🥤' },
      // Beer
      { name:'Asahi Super Dry',      description:"Japan's iconic dry lager, crisp and clean",         price:260, category:'beer',         emoji:'🍺', tags:['japanese','asahi'] },
      { name:'Sapporo Premium',      description:'Premium Japanese lager, smooth malt',               price:260, category:'beer',         emoji:'🍺', tags:['japanese','sapporo'] },
      { name:'Kirin Ichiban',        description:'First press brewing, pure and refreshing',          price:260, category:'beer',         emoji:'🍺', tags:['japanese','kirin'] },
      { name:'Suntory Premium Malts',description:'Rich golden lager with deep malt character',        price:270, category:'beer',         emoji:'🍺', tags:['japanese','suntory'], isFeatured:true },
      { name:'Asahi Black',          description:'Dark Munich-style lager, roasted malt notes',       price:270, category:'beer',         emoji:'🍺', tags:['japanese'] },
      { name:'Yebisu Premium',       description:"All-malt premium lager, Tokyo's finest since 1890", price:280, category:'beer',         emoji:'🍺', tags:['japanese'] },
      // Wine
      { name:'House Red Wine',       description:'Our signature red wine, smooth and fruity',         price:500, category:'wine',         emoji:'🍷', isFeatured:true },
      { name:'Red Wine (Shiraz)',     description:'Full-bodied Shiraz, aged to perfection',            price:650, category:'wine',         emoji:'🍷' },
      { name:'White Wine (Sauvignon)',description:'New Zealand Sauvignon Blanc, crisp citrus',        price:600, category:'wine',         emoji:'🍷' },
      { name:'Chardonnay',           description:'Buttery Australian Chardonnay, oak-aged',           price:600, category:'wine',         emoji:'🍷' },
      { name:'Moscato',              description:'Sweet Italian sparkling, perfect with dessert',      price:550, category:'wine',         emoji:'🍷' },
      // Food
      { name:'Grilled Chicken Salad',description:'Tender chicken on fresh greens, house dressing',    price:380, category:'food',         emoji:'🥗' },
      { name:'Caesar Salad',         description:'Romaine, parmesan, croutons, Caesar dressing',      price:320, category:'food',         emoji:'🥗', isVeg:true },
      { name:'Chicken Tikka',        description:'Tandoor-marinated chicken tikka, mint chutney',     price:480, category:'food',         emoji:'🍖', isFeatured:true, tags:['nepali'] },
      { name:'Chicken Sekuwa',       description:'Nepali-style spiced grilled chicken skewer',        price:450, category:'food',         emoji:'🍖', tags:['nepali'] },
      { name:'Buff Sekuwa',          description:'Traditional smoked buffalo sekuwa, spicy',          price:480, category:'food',         emoji:'🍖', tags:['nepali'] },
      { name:'Fish & Chips',         description:'Beer-battered fish fillet with golden fries',       price:520, category:'food',         emoji:'🐟' },
      { name:'Grilled Chicken Sandwich', description:'Juicy chicken fillet, lettuce, toasted bun',   price:420, category:'food',         emoji:'🥪' },
      { name:'Chocolate Cheesecake', description:'Rich chocolate cheesecake with berry compote',      price:280, category:'food',         emoji:'🍰', isVeg:true },
      { name:'Chocolate Fondant',    description:'Warm lava cake with vanilla bean ice cream',        price:380, category:'food',         emoji:'🍫', isVeg:true, isFeatured:true },
    ];
    await MenuItem.insertMany(items);
    res.json({ success: true, message: `Seeded ${items.length} items!` });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
menuRouter.post('/',      protect, adminOnly, async (req, res) => {
  try { const i = await MenuItem.create(req.body); res.status(201).json({ success: true, data: i }); }
  catch (err) { res.status(400).json({ success: false, message: err.message }); }
});
menuRouter.patch('/:id',  protect, adminOnly, async (req, res) => {
  try { const i = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json({ success: true, data: i }); }
  catch (err) { res.status(400).json({ success: false, message: err.message }); }
});
menuRouter.delete('/:id', protect, adminOnly, async (req, res) => {
  try { await MenuItem.findByIdAndDelete(req.params.id); res.json({ success: true, message: 'Deleted.' }); }
  catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ════════════════════════════════════════
// ORDER ROUTES
// ════════════════════════════════════════
const orderRouter = express.Router();
orderRouter.post('/',              optionalAuth, orderCtrl.createOrder);
orderRouter.get('/my',   protect,              orderCtrl.getMyOrders);
orderRouter.get('/track/:orderId',             orderCtrl.trackOrder);
orderRouter.get('/stats', protect, adminOnly,  orderCtrl.getOrderStats);
orderRouter.get('/all',   protect, adminOnly,  orderCtrl.getAllOrders);
orderRouter.patch('/:id/status', protect, adminOnly, orderCtrl.updateOrderStatus);

// ════════════════════════════════════════
// RESERVATION ROUTES
// ════════════════════════════════════════
const reservationRouter = express.Router();
reservationRouter.post('/', optionalAuth, async (req, res) => {
  try {
    const { name, contact, date, time, guests, occasion, specialRequests } = req.body;
    if (!name || !contact || !date || !time || !guests) return res.status(400).json({ success: false, message: 'All fields required.' });
    const data = { name, contact, date, time, guests, occasion, specialRequests };
    if (req.user) data.user = req.user._id;
    const r = await Reservation.create(data);
    res.status(201).json({ success: true, message: `Table reserved for ${name} on ${date} at ${time}!`, data: r });
  } catch (err) { res.status(500).json({ success: false, message: 'Reservation failed.' }); }
});
reservationRouter.get('/my',  protect, async (req, res) => {
  try { const r = await Reservation.find({ user: req.user._id }).sort({ createdAt: -1 }); res.json({ success: true, data: r }); }
  catch (err) { res.status(500).json({ success: false, message: 'Failed.' }); }
});
reservationRouter.get('/all', protect, adminOnly, async (req, res) => {
  try { const r = await Reservation.find().sort({ createdAt: -1 }).populate('user', 'name email'); res.json({ success: true, count: r.length, data: r }); }
  catch (err) { res.status(500).json({ success: false, message: 'Failed.' }); }
});
reservationRouter.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try { const r = await Reservation.findByIdAndUpdate(req.params.id, { status: req.body.status, confirmationNote: req.body.note }, { new: true }); res.json({ success: true, data: r }); }
  catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// ════════════════════════════════════════
// REVIEW ROUTES
// ════════════════════════════════════════
const reviewRouter = express.Router();
reviewRouter.get('/', async (req, res) => {
  try { const reviews = await Review.find({ status: 'approved' }).populate('user', 'name').sort({ createdAt: -1 }).limit(20); res.json({ success: true, data: reviews }); }
  catch (err) { res.status(500).json({ success: false, message: 'Failed.' }); }
});
reviewRouter.post('/', optionalAuth, async (req, res) => {
  try {
    const { rating, comment, guestName, guestEmail } = req.body;
    if (!rating || !comment) return res.status(400).json({ success: false, message: 'Rating and comment required.' });
    const data = { rating, comment };
    if (req.user) data.user = req.user._id; else { data.guestName = guestName; data.guestEmail = guestEmail; }
    const review = await Review.create(data);
    res.status(201).json({ success: true, message: 'Review submitted! Awaiting approval.', data: review });
  } catch (err) { res.status(500).json({ success: false, message: 'Failed.' }); }
});
reviewRouter.get('/all',     protect, adminOnly, async (req, res) => {
  try { const r = await Review.find().populate('user','name email').sort({ createdAt: -1 }); res.json({ success: true, data: r }); }
  catch (err) { res.status(500).json({ success: false, message: 'Failed.' }); }
});
reviewRouter.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try { const r = await Review.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }); res.json({ success: true, data: r }); }
  catch (err) { res.status(400).json({ success: false, message: err.message }); }
});
reviewRouter.delete('/:id', protect, adminOnly, async (req, res) => {
  try { await Review.findByIdAndDelete(req.params.id); res.json({ success: true, message: 'Deleted.' }); }
  catch (err) { res.status(500).json({ success: false, message: 'Failed.' }); }
});

// ════════════════════════════════════════
// PAYMENT ROUTES
// ════════════════════════════════════════
const paymentRouter = express.Router();
paymentRouter.post('/esewa/initiate',   optionalAuth, paymentSvc.initiateEsewa);
paymentRouter.get('/esewa/verify',                   paymentSvc.verifyEsewa);
paymentRouter.post('/khalti/initiate',  optionalAuth, paymentSvc.initiateKhalti);
paymentRouter.post('/khalti/verify',    optionalAuth, paymentSvc.verifyKhalti);
paymentRouter.post('/stripe/intent',    optionalAuth, paymentSvc.createStripeIntent);
paymentRouter.post('/stripe/confirm',   optionalAuth, paymentSvc.confirmStripePayment);
paymentRouter.post('/offline',          optionalAuth, paymentSvc.confirmOfflinePayment);

// ════════════════════════════════════════
// ADMIN ROUTES
// ════════════════════════════════════════
const adminRouter = express.Router();
adminRouter.use(protect, adminOnly);
adminRouter.get('/stats', async (req, res) => {
  try {
    const [users, orders, menu, reservations, pendingReviews] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Order.countDocuments(),
      MenuItem.countDocuments(),
      Reservation.countDocuments(),
      Review.countDocuments({ status: 'pending' }),
    ]);
    const revenue = await Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]);
    res.json({ success: true, data: { users, orders, menu, reservations, pendingReviews, totalRevenue: revenue[0]?.total || 0 } });
  } catch (err) { res.status(500).json({ success: false, message: 'Stats failed.' }); }
});
adminRouter.get('/users', async (req, res) => {
  try { const users = await User.find({ role: 'user' }).sort({ createdAt: -1 }); res.json({ success: true, count: users.length, data: users }); }
  catch (err) { res.status(500).json({ success: false, message: 'Failed.' }); }
});
adminRouter.delete('/users/:id', async (req, res) => {
  try { await User.findByIdAndDelete(req.params.id); res.json({ success: true, message: 'User removed.' }); }
  catch (err) { res.status(500).json({ success: false, message: 'Failed.' }); }
});

// ════════════════════════════════════════
// USER ROUTES
// ════════════════════════════════════════
const userRouter = express.Router();
userRouter.get('/profile',   protect, async (req, res) => res.json({ success: true, data: req.user }));
userRouter.patch('/profile', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { name: req.body.name, phone: req.body.phone }, { new: true });
    res.json({ success: true, message: 'Profile updated!', data: user });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});
userRouter.post('/address', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses.push(req.body);
    await user.save();
    res.json({ success: true, data: user.addresses });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

module.exports = { authRouter, menuRouter, orderRouter, reservationRouter, reviewRouter, paymentRouter, adminRouter, userRouter };
