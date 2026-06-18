const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: [process.env.FRONTEND_URL, 'http://localhost:5173'], methods: ['GET','POST'] }
});
app.set('io', io);
io.on('connection', (socket) => {
  socket.on('join-order', (orderId) => socket.join(`order-${orderId}`));
  socket.on('join-admin', () => socket.join('admin-room'));
});

app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(express.json({ limit: '10mb' }));
app.use(cors({ origin: [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use('/api/', rateLimit({ windowMs: 15*60*1000, max: 300 }));
app.use('/api/auth/', rateLimit({ windowMs: 15*60*1000, max: 20 }));
app.use('/uploads', express.static('uploads'));

// Routes — all routers come from one combined file: routes/index.js
const {
  authRouter, menuRouter, orderRouter, reservationRouter,
  reviewRouter, paymentRouter, adminRouter, userRouter
} = require('./routes/index');

app.use('/api/auth',          authRouter);
app.use('/api/menu',          menuRouter);
app.use('/api/orders',        orderRouter);
app.use('/api/reservations',  reservationRouter);
app.use('/api/reviews',       reviewRouter);
app.use('/api/payments',      paymentRouter);
app.use('/api/admin',         adminRouter);
app.use('/api/users',         userRouter);

app.get('/',       (req, res) => res.json({ success: true, message: 'RD Cafe API v2.0 ☕' }));
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));
app.use('*', (req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use((err, req, res, next) => res.status(err.statusCode||500).json({ success: false, message: err.message||'Server error' }));

const PORT = process.env.PORT || 8000;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(PORT, () => console.log(`🚀 RD Cafe API running on port ${PORT}`));
  })
  .catch(err => { console.error('❌ MongoDB failed:', err.message); process.exit(1); });

module.exports = { app, io };
