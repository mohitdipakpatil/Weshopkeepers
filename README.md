# 🏪 WeShopkeepers

> **Your Neighbourhood. Your Store. Online.**

A production-ready full-stack e-commerce platform built with React, Node.js, MongoDB, Redis, and Stripe.

---

## 📸 Screenshots

| Home Page | Product Listing | Admin Dashboard |
|-----------|----------------|-----------------|
| *(add screenshot)* | *(add screenshot)* | *(add screenshot)* |

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Zustand, React Query |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Cache | Redis (ioredis) |
| Payments | Stripe API |
| Auth | JWT + Google OAuth 2.0 (Passport.js) |
| File Uploads | Cloudinary |
| Deployment | Docker + Docker Compose |
| Charts | Recharts |

---

## 🗂️ Project Structure

```
weshopkeepers/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── common/        # Stars, Badge, Spinner, etc.
│   │   │   ├── layout/        # Navbar, Footer
│   │   │   └── product/       # ProductCard
│   │   ├── hooks/             # React Query hooks
│   │   ├── pages/             # All 10 pages
│   │   ├── services/          # Axios API service
│   │   ├── store/             # Zustand global state
│   │   └── utils/             # Helper functions
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── server/                    # Node.js backend
│   ├── config/                # DB, Redis, Cloudinary, Passport
│   ├── controllers/           # Business logic
│   ├── middleware/            # Auth, error handling
│   ├── models/                # Mongoose schemas
│   ├── routes/                # Express routes
│   ├── utils/                 # Logger, seeder, invoice generator
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## ⚡ Local Development Setup

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- Redis (local or Upstash)
- Git

### Step 1 — Clone & Install

```bash
git clone https://github.com/yourusername/weshopkeepers.git
cd weshopkeepers

# Install server dependencies
cd server && npm install && cd ..

# Install client dependencies
cd client && npm install && cd ..
```

### Step 2 — Configure Environment Variables

```bash
# Server
cp server/.env.example server/.env
# Edit server/.env with your actual values

# Client
cp client/.env.example client/.env
# Edit client/.env with your actual values
```

**Required values to fill in:**
| Variable | Where to get it |
|----------|----------------|
| `JWT_SECRET` | Run: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `STRIPE_SECRET_KEY` | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) |
| `GOOGLE_CLIENT_ID` | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `CLOUDINARY_CLOUD_NAME` | [Cloudinary Console](https://cloudinary.com/console) |

### Step 3 — Seed Database

```bash
cd server
npm run seed
# Creates: 8 sample products, 3 coupons, 1 admin user
# Admin login: admin@weshopkeepers.com / Admin@123
```

### Step 4 — Run Both Servers

```bash
# Terminal 1 — Backend
cd server && npm run dev
# Runs on http://localhost:5000

# Terminal 2 — Frontend
cd client && npm run dev
# Runs on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) 🚀

---

## 🐳 Docker Deployment

### Step 1 — Create root .env

```bash
cp .env.example .env
# Fill in all values in .env
```

### Step 2 — Build & Start All Services

```bash
docker-compose up --build -d
```

This starts 4 containers:
- **client** (Nginx + React) → http://localhost:3000
- **server** (Node.js API) → http://localhost:5000
- **mongodb** → port 27017
- **redis** → port 6379

### Step 3 — Seed the Database

```bash
docker-compose exec server node utils/seeder.js
```

### Useful Docker Commands

```bash
# View logs
docker-compose logs -f server
docker-compose logs -f client

# Stop all containers
docker-compose down

# Stop and delete volumes (resets database)
docker-compose down -v

# Rebuild a single service
docker-compose up --build server
```

---

## ☁️ Production Deployment (VPS / Cloud)

### Option A — Docker on a VPS (DigitalOcean, AWS EC2, etc.)

```bash
# 1. SSH into your server
ssh user@your-server-ip

# 2. Install Docker
curl -fsSL https://get.docker.com | sh

# 3. Clone the project
git clone https://github.com/yourusername/weshopkeepers.git
cd weshopkeepers

# 4. Create .env with production values
cp .env.example .env
nano .env   # Fill in all values

# 5. Start
docker-compose up -d --build

# 6. Set up Nginx reverse proxy (optional, for domain + SSL)
# Point domain → server IP
# Use Certbot for free SSL
```

### Option B — Separate Cloud Services (Recommended for scale)

| Service | Platform |
|---------|----------|
| Frontend | Vercel / Netlify |
| Backend | Railway / Render / Fly.io |
| Database | MongoDB Atlas (free tier available) |
| Redis | Upstash (free tier available) |
| Files | Cloudinary (free tier available) |

#### Deploy Frontend to Vercel
```bash
cd client
npm run build
# Push to GitHub → connect repo on vercel.com
# Set VITE_API_URL=https://your-backend-url.com/api
```

#### Deploy Backend to Railway
```bash
# Push to GitHub → connect repo on railway.app
# Add all env vars from server/.env in Railway dashboard
# Railway auto-detects Node.js and deploys
```

---

## 🔗 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login |
| GET | `/api/auth/me` | ✅ | Get current user |
| PUT | `/api/auth/profile` | ✅ | Update profile |
| POST | `/api/auth/address` | ✅ | Add address |
| DELETE | `/api/auth/address/:id` | ✅ | Delete address |
| POST | `/api/auth/wishlist/:productId` | ✅ | Toggle wishlist |
| GET | `/api/auth/google` | ❌ | Google OAuth |

### Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | ❌ | List products (filter, sort, paginate) |
| GET | `/api/products/:id` | ❌ | Get single product |
| GET | `/api/products/categories` | ❌ | All categories |
| POST | `/api/products` | 🔐 Admin | Create product |
| PUT | `/api/products/:id` | 🔐 Admin | Update product |
| DELETE | `/api/products/:id` | 🔐 Admin | Delete product |
| POST | `/api/products/:id/reviews` | ✅ | Add review |

### Cart
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/cart` | ✅ | Get cart |
| POST | `/api/cart/add` | ✅ | Add item |
| PUT | `/api/cart/update` | ✅ | Update quantity |
| DELETE | `/api/cart/remove/:productId` | ✅ | Remove item |
| DELETE | `/api/cart/clear` | ✅ | Clear cart |

### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/orders/create` | ✅ | Place order |
| GET | `/api/orders/my-orders` | ✅ | User order history |
| GET | `/api/orders/:id` | ✅ | Order details |
| PUT | `/api/orders/:id/status` | 🔐 Admin | Update status |
| POST | `/api/orders/:id/cancel` | ✅ | Cancel order |

### Payments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/payment/create-intent` | ✅ | Create Stripe PaymentIntent |
| POST | `/api/payment/webhook` | ❌ | Stripe webhook handler |
| POST | `/api/payment/validate-coupon` | ✅ | Validate coupon code |
| POST | `/api/payment/refund` | 🔐 Admin | Issue refund |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/dashboard-stats` | 🔐 Admin | Revenue, orders, users stats |
| GET | `/api/admin/orders` | 🔐 Admin | All orders (paginated) |
| GET | `/api/admin/users` | 🔐 Admin | All users (paginated) |
| PUT | `/api/admin/users/:id/status` | 🔐 Admin | Toggle user active status |

**Query Parameters for GET /api/products:**
```
?keyword=phone       # Full-text search
?category=Electronics
?brand=Samsung
?minPrice=500
?maxPrice=5000
?rating=4            # Minimum rating
?sort=price-asc      # popular | newest | price-asc | price-desc | rating
?page=1
?limit=12
```

---

## 🏷️ Coupon Codes (seeded)

| Code | Discount | Min Order |
|------|----------|-----------|
| `WSKDEAL40` | 40% off (max ₹500) | ₹999 |
| `WELCOME10` | 10% off | None |
| `FLAT100` | ₹100 flat off | ₹999 |

---

## 🔑 Default Credentials

After running the seeder:
- **Admin:** `admin@weshopkeepers.com` / `Admin@123`

---

## 🌐 Live Demo

🔗 [https://weshopkeepers.vercel.app](https://weshopkeepers.vercel.app) *(deploy and update this link)*

---

## 📄 License

MIT © 2025 WeShopkeepers
