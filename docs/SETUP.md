# ESSEN AI - Local Development & Setup Guide

## Prerequisites
* **Node.js**: v18+ or v20+
* **MongoDB**: Local MongoDB community instance running on port `27017` or MongoDB Atlas URI.
* **Redis** (Optional): In-memory cache fallback is built-in if Redis is not running locally.
* **Docker & Docker Compose** (Optional): For full containerized execution.

---

## 1. Fast Start (Local Monorepo)

### Step 1: Install Dependencies
From the repository root:
```bash
npm run install:all
```

### Step 2: Configure Environment Variables
Copy `.env.example` in `server/` or root:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/essen_db
JWT_SECRET=essen_super_secret_jwt_key_2026
CLIENT_URL=http://localhost:5173
```

### Step 3: Seed Database with Demo Accounts & Restaurants
```bash
npm run seed
```
This seeds 4 authentic restaurant venues (North Indian, South Indian, Pan-Asian, Continental), digital menus, tables, and test accounts.

### Step 4: Start Dev Server & Client
```bash
npm run dev
```
* **Frontend**: `http://localhost:5173`
* **Backend API**: `http://localhost:5000/api`
* **Swagger Docs**: `http://localhost:5000/api/docs`

---

## 2. Docker Compose Deployment

```bash
docker-compose up --build
```
This spins up:
* `essen-backend` (Port 5000)
* `essen-frontend` (Port 5173)
* `mongodb` (Port 27017)
* `redis` (Port 6379)

---

## 3. Pre-Seeded Demo Credentials

| Role | Email | Password | Restaurant Code (Manager only) |
|---|---|---|---|
| **Customer** | `customer@essen.com` | `password123` | — |
| **Manager** | `manager@essen.com` | `password123` | `EST-ROY-1001` |
| **Waiter** | `waiter@essen.com` | `password123` | — |
| **Delivery Rider** | `driver@essen.com` | `password123` | — |
| **Platform Admin** | `admin@essen.com` | `admin123` | — |

> **Pro-Tip**: The frontend includes a **1-Click Role Switcher** dropdown in the top navbar to instantly test Customer, Waiter, Manager, Driver, and Admin views with zero friction.
