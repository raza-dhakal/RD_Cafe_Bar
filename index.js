// ══════════════════════════════════════
// models/user.model.js
// ══════════════════════════════════════
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username:    { type: String, required: true, unique: true, trim: true, minlength: 3 },
  name:        { type: String, required: true, trim: true },
  email:       { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:    { type: String, required: true, minlength: 8, select: false },
  phone:       { type: String, trim: true, default: '' },
  avatar:      { type: String, default: '' },
  role:        { type: String, enum: ['user','admin'], default: 'user' },
  isActive:    { type: Boolean, default: true },
  // Loyalty system
  loyaltyPoints: { type: Number, default: 0 },
  totalOrders:   { type: Number, default: 0 },
  totalSpent:    { type: Number, default: 0 },
  // Saved addresses
  addresses: [{
    label: String,
    address: String,
    isDefault: Boolean,
  }],
  // Auth
  resetPasswordToken:   String,
  resetPasswordExpires: Date,
  phoneOTP:    String,
  phoneOTPExpires: Date,
  lastLogin:   Date,
  rememberToken: String,
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.comparePassword = async function(pwd) { return bcrypt.compare(pwd, this.password); };
userSchema.methods.toJSON = function() { const o = this.toObject(); delete o.password; delete o.resetPasswordToken; delete o.phoneOTP; return o; };

const User = mongoose.model('User', userSchema);

// ══════════════════════════════════════
// models/menu.model.js
// ══════════════════════════════════════
const menuItemSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price:       { type: Number, required: true, min: 0 },
  category:    { type: String, required: true, enum: ['hot-coffee','cold-coffee','tea','soft-drinks','beer','wine','food'] },
  emoji:       { type: String, default: '☕' },
  image:       { type: String, default: '' },
  isAvailable: { type: Boolean, default: true },
  isFeatured:  { type: Boolean, default: false },
  isVeg:       { type: Boolean, default: false },
  tags:        [String],
  rating:      { type: Number, default: 0 },
  orderCount:  { type: Number, default: 0 },
}, { timestamps: true });

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

// ══════════════════════════════════════
// models/order.model.js
// ══════════════════════════════════════
const orderItemSchema = new mongoose.Schema({
  menuItem:   { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
  name:       String,
  price:      Number,
  quantity:   { type: Number, required: true, min: 1 },
  subtotal:   Number,
  specialNote: String,
});

const orderSchema = new mongoose.Schema({
  orderId:     { type: String, unique: true },
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guestName:   String,
  guestPhone:  String,
  guestEmail:  String,
  items:       [orderItemSchema],
  totalAmount: { type: Number, required: true },
  orderType:   { type: String, enum: ['dine-in','takeaway','delivery'], default: 'dine-in' },
  deliveryAddress: String,
  paymentMethod: { type: String, enum: ['cash','esewa','khalti','card','bank-transfer'], default: 'cash' },
  paymentStatus: { type: String, enum: ['pending','paid','failed','refunded'], default: 'pending' },
  paymentRef:  String,
  status: {
    type: String,
    enum: ['pending','confirmed','preparing','ready','out-for-delivery','delivered','cancelled'],
    default: 'pending',
  },
  specialInstructions: String,
  estimatedTime: Number,
  statusHistory: [{
    status: String,
    time: { type: Date, default: Date.now },
    note: String,
  }],
  loyaltyPointsEarned: { type: Number, default: 0 },
}, { timestamps: true });

orderSchema.pre('save', function(next) {
  if (!this.orderId) this.orderId = 'RD' + Date.now().toString().slice(-6) + Math.random().toString(36).slice(-3).toUpperCase();
  next();
});

const Order = mongoose.model('Order', orderSchema);

// ══════════════════════════════════════
// models/reservation.model.js
// ══════════════════════════════════════
const reservationSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name:     { type: String, required: true },
  contact:  { type: String, required: true },
  date:     { type: String, required: true },
  time:     { type: String, required: true },
  guests:   { type: String, required: true },
  occasion: { type: String, default: 'Casual Visit' },
  tableNumber: Number,
  specialRequests: String,
  status:   { type: String, enum: ['pending','confirmed','cancelled','completed'], default: 'pending' },
  confirmationNote: String,
}, { timestamps: true });

const Reservation = mongoose.model('Reservation', reservationSchema);

// ══════════════════════════════════════
// models/review.model.js
// ══════════════════════════════════════
const reviewSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guestName:   String,
  guestEmail:  String,
  rating:      { type: Number, required: true, min: 1, max: 5 },
  comment:     { type: String, required: true, maxlength: 500 },
  status:      { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  adminReply:  String,
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);

module.exports = { User, MenuItem, Order, Reservation, Review };