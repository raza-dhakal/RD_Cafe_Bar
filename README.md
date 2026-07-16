# ☕ RD Café & Bar — Full Stack Website

> Specialty coffee & craft cocktails — 
Sunwal-12, Bhumahi, Nawalparasi, Nepal

## 🗂️ Project Structure

```
rd-cafe-bar/
├── frontend/          ← React + Vite + Tailwind CSS
├── backend/           ← Node.js + Express + MongoDB
├── .github/workflows/ ← GitHub Actions CI/CD
├── render.yaml        ← Render deployment config
└── README.md
```

---

## ⚡ Quick Start (Local Development)

### Step 1 — Clone & setup

```bash
git clone https://github.com/YOUR_USERNAME/rd-cafe-bar.git
cd rd-cafe-bar
```

### Step 2 — Backend setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, Gmail credentials
npm run dev
# Backend runs on http://localhost:5000
```

### Step 3 — Frontend setup

```bash
cd ../frontend
npm install
cp .env.example .env
# .env already has VITE_API_URL=http://localhost:5000/api
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 🍃 MongoDB Atlas Setup (Free)

1. Go to **atlas.mongodb.com** → Create free account
2. Create a **Free M0 cluster** (512MB)
3. Database Access → Add user (username + password)
4. Network Access → Add IP → `0.0.0.0/0` (allow all)
5. Connect → Drivers → Copy connection string
6. Paste in backend `.env` as `MONGODB_URI`
7. Replace `<password>` with your password

### Seed the menu (first time only)

After backend is running, visit:
```
GET http://localhost:5000/api/menu/seed
```
Or with a logged-in admin token.

---

## 🚀 Deployment

### Frontend → Vercel (FREE)

1. Push code to GitHub
2. Go to **vercel.com** → New Project
3. Import `rd-cafe-bar` repo
4. Set **Root Directory** to `frontend`
5. Add Environment Variable:
   - `VITE_API_URL` = `https://rdcafe-api.onrender.com/api`
6. Deploy! URL: `https://rdcafe.vercel.app`

### Backend → Render (FREE)

1. Go to **render.com** → New Web Service
2. Connect GitHub → select `rd-cafe-bar`
3. Set **Root Directory** to `backend`
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add Environment Variables (from `.env.example`):
   - `MONGODB_URI`
   - `JWT_SECRET` (any long random string)
   - `FRONTEND_URL` = your Vercel URL
   - `GMAIL_USER` + `GMAIL_PASS`
   - `ADMIN_EMAIL` + `ADMIN_SECRET_KEY`
7. Deploy! URL: `https://rdcafe-api.onrender.com`

---

## 🔑 Admin Login

- URL: `/admin-login`
- Email: value of `ADMIN_EMAIL` in `.env`
- Secret Key: value of `ADMIN_SECRET_KEY` in `.env`
- OTP: sent to your Gmail inbox

**Default (change in .env):**
- Email: `owner@rdcafe.com.np`
- Secret Key: `rdadmin2024secure`

---

## 📡 API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | — | Register user |
| POST | `/api/auth/login` | — | Login user |
| GET | `/api/auth/me` | JWT | Get current user |
| POST | `/api/auth/forgot-password` | — | Send reset email |
| POST | `/api/auth/admin/request-otp` | — | Admin OTP request |
| POST | `/api/auth/admin/verify-otp` | — | Admin OTP verify |
| GET | `/api/menu` | — | Get all menu items |
| POST | `/api/menu` | Admin | Add menu item |
| PATCH | `/api/menu/:id` | Admin | Update menu item |
| DELETE | `/api/menu/:id` | Admin | Delete menu item |
| POST | `/api/orders` | Optional | Place order |
| GET | `/api/orders/my` | JWT | My orders |
| GET | `/api/orders/all` | Admin | All orders |
| PATCH | `/api/orders/:id/status` | Admin | Update order status |
| POST | `/api/reservations` | Optional | Book table |
| GET | `/api/admin/stats` | Admin | Dashboard stats |
| GET | `/api/admin/users` | Admin | All users |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| Backend | Node.js, Express.js, JWT Auth |
| Database | MongoDB Atlas (Mongoose ODM) |
| Email | Nodemailer + Gmail SMTP |
| Deploy Frontend | Vercel (free) |
| Deploy Backend | Render.com (free) |
| CI/CD | GitHub Actions |

---

## 📦 Pages

| Page | Route | Auth Required |
|------|-------|---------------|
| Home | `/` | ❌ |
| Menu | `/menu` | ❌ |
| Login | `/login` | ❌ |
| Signup | `/signup` | ❌ |
| Forgot Password | `/forgot-password` | ❌ |
| Dashboard | `/dashboard` | ✅ |
| Order | `/order` | ✅ |
| Reserve | `/reserve` | ❌ |
| Owner Info | `/owner` | ❌ |
| Admin Login | `/admin-login` | ❌ |
| Admin Panel | `/admin` | ✅ Admin only |

---

## 💡 Tips

- **Render free tier sleeps** after 15 min of inactivity. Use [cron-job.org](https://cron-job.org) to ping `/health` every 10 min.
- **Gmail App Password**: go to myaccount.google.com → Security → 2FA → App Passwords → generate one.
- **Custom domain**: buy from Namecheap/WebSewa, add in Vercel dashboard under Settings → Domains.

---

Made with ☕ by RD Café & Bar team
