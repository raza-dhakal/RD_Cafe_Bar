const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User } = require('../models/index');
const { sendOTPEmail } = require('../services/notification.service');

const signToken = (id, expiresIn = '7d') => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });

exports.register = async (req, res) => {
  try {
    const { username, name, email, password, phone } = req.body;
    if (!username || !name || !email || !password) return res.status(400).json({ success: false, message: 'All fields required.' });
    if (password.length < 8) return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(409).json({ success: false, message: existing.email === email ? 'Email already registered.' : 'Username taken.' });
    const user = await User.create({ username, name, email, password, phone });
    const token = signToken(user._id);
    res.status(201).json({ success: true, message: `Welcome to RD Café, ${name}! 🎉`, token, user });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ success: false, message: 'Email or username already taken.' });
    res.status(500).json({ success: false, message: 'Registration failed.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required.' });
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ success: false, message: 'Incorrect email or password.' });
    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account deactivated.' });
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    const token = signToken(user._id, rememberMe ? '30d' : '7d');
    res.json({ success: true, message: `Welcome back, ${user.name}! ☕`, token, user });
  } catch (err) { res.status(500).json({ success: false, message: 'Login failed.' }); }
};

exports.getMe = async (req, res) => res.json({ success: true, user: req.user });

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone }, { new: true, runValidators: true });
    res.json({ success: true, message: 'Profile updated!', user });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: true, message: 'If registered, reset link sent.' });
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save({ validateBeforeSave: false });
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendOTPEmail(email, `<a href="${resetURL}">Click here to reset</a>`, 'Password Reset Link').catch(console.error);
    res.json({ success: true, message: 'If registered, reset link sent.' });
  } catch (err) { res.status(500).json({ success: false, message: 'Could not send reset email.' }); }
};

exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset link.' });
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    const token = signToken(user._id);
    res.json({ success: true, message: 'Password reset successful!', token, user });
  } catch (err) { res.status(500).json({ success: false, message: 'Password reset failed.' }); }
};

const otpStore = new Map();
exports.adminRequestOtp = async (req, res) => {
  try {
    const { email, secretKey } = req.body;
    if (email !== process.env.ADMIN_EMAIL || secretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, { otp, expires: Date.now() + 5 * 60 * 1000 });
    await sendOTPEmail(email, otp, 'Admin Login').catch(console.error);
    res.json({ success: true, message: 'OTP sent to admin email.' });
  } catch (err) { res.status(500).json({ success: false, message: 'OTP send failed.' }); }
};

exports.adminVerifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = otpStore.get(email);
    if (!record || record.otp !== otp || Date.now() > record.expires) {
      return res.status(401).json({ success: false, message: 'Invalid or expired OTP.' });
    }
    otpStore.delete(email);
    let admin = await User.findOne({ email });
    if (!admin) {
      admin = await User.create({ username: 'rdcafe_admin', name: 'RD Admin', email, password: process.env.ADMIN_SECRET_KEY + '_admin_123!', role: 'admin' });
    }
    if (admin.role !== 'admin') { admin.role = 'admin'; await admin.save({ validateBeforeSave: false }); }
    const token = signToken(admin._id);
    res.json({ success: true, message: 'Admin login successful!', token, user: admin });
  } catch (err) { res.status(500).json({ success: false, message: 'OTP verification failed.' }); }
};
