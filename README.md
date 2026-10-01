# 🍽️ ESSEN — Omnichannel AI-Powered Smart Dining & Food-Tech Ecosystem

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![Web Audio API](https://img.shields.io/badge/Web_Audio_API-Synthesizer-orange?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Leaflet](https://img.shields.io/badge/Leaflet-Maps-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com/)

**ESSEN** is an enterprise-grade, omnichannel food-tech platform engineered to bridge dine-in restaurant operations, digital QR ordering, kitchen display workflows (KDS), waiter floor alerts, multi-vendor online food delivery, and intelligent guest personalization into a unified ecosystem.

---

## 🌟 Executive Summary & What Was Built (From Scratch to Now)

From initial foundation to advanced food-tech workflows, here is the complete breakdown of every feature, module, and system implemented:

### 1. 👥 Multi-Role Role-Based Access Control (RBAC)
* **5 Distinct User Personas**:
  1. **Customer**: Discovers restaurants, filters food, builds cross-restaurant carts, tracks live delivery, scans table QRs, and splits bills.
  2. **Restaurant Manager**: Real-time revenue metrics, KDS oversight, table layout & QR generator, menu editor, staff waiter provisioning, and dish stock 86'd manager.
  3. **Waiter / Floor Staff**: Real-time floor table grid, assistance chimes (water, cutlery, bill), and order progress.
  4. **Delivery Rider**: Active pickup route, GPS navigation, and 4-digit customer OTP handover verification.
  5. **Platform Admin**: Restaurant onboarding verification pipeline, commission ledger, and immutable system audit logs.
* **Persistent Authentication**: JWT-based session security with bcrypt password hashing, persistent storage, and fallback storage resilience.
* **Waiter Account Provisioning**: Managers can create, assign table sections to, and manage waiter staff directly from the Manager Dashboard.
* **1-Click Role Switcher**: Quick-switch header bar to instantly preview the application as any role during development and testing.

---

### 2. 🛒 Multi-Vendor & Cross-Restaurant Cart System
* **Omnichannel Ordering Modes**:
  * 🛵 **Online Delivery**: Home delivery with live rider tracking and drop-off instructions.
  * 🛍️ **Takeaway**: Counter pickup with ready-time estimates and packaging preferences.
  * 🍽️ **Dine-In**: In-restaurant table QR ordering directly dispatched to the chef.
* **Cross-Restaurant Cart**: Allows customers to add items from multiple restaurants for delivery and takeaway orders without forcibly clearing their cart.
* **Cart Surfaces**:
  * Interactive slide-over `CartDrawer` with quantity steppers and quick-delete.
  * Dedicated `/cart` page with bill breakdown.
  * Sticky `FloatingCartBar` indicating active items, total price, and one-click checkout.

---

### 3. 📍 Interactive Address Selection & Visual Geolocation Map
* **Triple Address Picker**:
  1. **Autocomplete City Search**: Instant suggestions for major metro cities (Bengaluru, Mumbai, Delhi, Hyderabad, Chennai, Kolkata, Pune).
  2. **Browser Geolocation**: One-click "Use Current Location" with high-precision GPS coordinates and reverse geocoding.
  3. **Visual Interactive Leaflet Map**: Draggable map pin on OpenStreetMap tiles with instant coordinate and address synchronization.
* **Smart Drop-Off Instructions & Preset Chips**:
  * 🚪 *Leave at door*
  * 🔕 *Do not ring bell*
  * 🐕 *Beware of pet*
  * 📞 *Call upon arrival*
  * 🛡️ *Leave with security*
  * 🛗 *Elevator available*
  * Freeform driver instructions notes box.

---

### 4. 🛵 Live Moving Delivery Rider Simulation & Telemetry HUD
* **Stylized Dark GPS Canvas**: SVG curved road route connecting the restaurant kitchen coordinates to customer delivery location.
* **Bézier Trajectory Mathematics**: Smooth vehicle animation with real-time heading rotation matching the road curvature.
* **Telemetry HUD**: Live speed gauge (28–34 km/h), remaining distance counter (`1.4 km`), and countdown ETA timer (`12 mins`).
* **Radar Sonar Rings**: Pulsating radar effect radiating from the rider marker.
* **Rider Profile Card**: Driver photo, rating (`4.9 ★`), vehicle info (*Hero Splendor EV*), and 1-click Call & Chat action buttons.
* **Secure Delivery Handover**: 4-digit OTP verification code displayed to customer and required for rider completion.

---

### 5. 🍱 "Frequently Paired Together" Smart Cart Recommendations
* **Contextual Pairing Intelligence**: Dynamically detects items in the cart and suggests high-synergy appetizers, sides, drinks, and desserts:
  * *Biryani* ➔ Garlic Naan, Kesar Phirni
  * *Pizza / Pasta* ➔ Herbed Garlic Breadsticks, Classic Tiramisu
  * *Ramen / Sushi* ➔ Steamed Pork Gyoza, Matcha Boba Tea
  * *Thali / Curry* ➔ Sweet Patiala Lassi, Rosogolla
* **1-Click Upsell**: `+ Add` button instantly adds recommendations directly to the cart without navigating away.

---

### 6. 🥗 Dietary, Lifestyle & Allergen Filtering with Calorie Counters
* **Dietary Lifestyle Tags**: Pure Veg, Jain, High Protein, Keto, Gluten-Free, Vegan.
* **Allergen Exclusion Switches**: Dairy-Free, Nut-Free, Gluten-Free.
* **Nutritional Badges on Food Cards**:
  * 🔥 Calorie counter badges (e.g. `🔥 420 kcal`, `🔥 650 kcal`).
  * Allergen alerts (e.g. `Contains: Dairy, Nuts`).
  * Low stock warning pills (e.g. `Only 4 portions left!`).

---

### 7. 🛎️ Waiter Smart Table Call with Synthesized Audio Chime & Haptics
* **Browser Web Audio API Synthesis**: Dual-tone melodic service chime (`D5` 587.33 Hz ➔ `A5` 880 Hz with exponential gain decay) – zero external MP3 file dependencies, works 100% offline.
* **Haptic Alert**: Physical vibration pulse via `navigator.vibrate([150, 80, 150])` for mobile devices.
* **Waiter Controls**: Sound toggle (Sound ON / Muted), "Test Bell Chime" button, and "+ Simulate Table Call" button.
* **Table Request Categorization**: Calls for Waiter, Water Refill, Extra Cutlery, and Bill Request.

---

### 8. 💳 Multi-User Table Split Bill & Individual UPI QR Settlement
* **Equal Split Calculator**: 2 to 6 guests selector with live per-diner share math.
* **Individual Dynamic UPI QR**: Generates scannable UPI QR codes (`upi://pay?pa=...&am=...`) for instant settlement via Google Pay, PhonePe, or Paytm.
* **Payment Checklist**: Interactive "Mark as Paid" checkboxes to track which table guests have settled their portion.

---

### 9. 📦 Automated Dish Stock Counter & "86'd" Sold-Out Manager
* **Manager Inventory Tab**: Dedicated "Dish Stock & Sold-Out Manager" on the Manager Dashboard.
* **1-Click 86'd Toggle**: Instant switch between `In Stock` and `Sold Out`.
* **Portion Stepper**: Adjust remaining portion numbers (`-` / `+`) with orange low-stock warnings.
* **Backend Disk Persistence**: Changes save directly to server storage.
* **Customer Menu Sync**: Sold-out dishes immediately reflect dim styling and disabled ordering state.

---

### 10. 🍳 Kitchen Display System (KDS)
* Real-time order dispatch board for kitchen chefs.
* Status progression: `NEW` ➔ `ACCEPTED` ➔ `PREPARING` ➔ `READY` ➔ `SERVED`.
* Table numbers prominently displayed for dine-in orders alongside delivery badges.

---

### 11. 🧾 Order Tracking, Invoices & Loyalty Coins
* Full real-time timeline from order placement to final delivery or dining service.
* Itemized tax invoice modal with printable layout, CGST, SGST, packaging fees, discounts, and GSTIN numbers.
* Anti-fraud transaction-linked loyalty coins engine with restaurant-specific ledgers and 5,000 coin milestone voucher generation.

---

## 🛠️ Complete Technology Stack

### Frontend (`client/`)
| Category | Technology |
|---|---|
| **Framework** | React 18 with TypeScript |
| **Bundler & Build Tool** | Vite |
| **Styling** | Tailwind CSS (v3), Custom Glassmorphism, CSS Animations |
| **Icons** | Lucide React |
| **Routing** | React Router DOM (v6) |
| **State Management** | React Context (`AuthContext`, `CartContext`, `SocketContext`) |
| **Real-time Comms** | Socket.IO Client |
| **HTTP Client** | Axios with request & response interceptors |
| **Audio** | Native Web Audio API (`AudioContext`, Oscillator nodes, Exponential Gain Decay) |
| **Maps & Location** | Leaflet & React-Leaflet with OpenStreetMap tiles |
| **QR Code Generation** | `qrcode.react` (SVG QR generation) |

### Backend (`server/`)
| Category | Technology |
|---|---|
| **Runtime** | Node.js (LTS) |
| **Framework** | Express.js with TypeScript |
| **Database** | MongoDB with Mongoose ODM + Resilient fallback local store (`mockStore.ts`) |
| **Real-time Engine** | Socket.IO Server (Rooms for restaurants, tables, and delivery tracking) |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` |
| **Security & Middleware** | Helmet, CORS, Express Rate Limiting |
| **API Documentation** | Swagger UI (`/api/docs`), OpenAPI 3.0 |

---

## 📁 Repository Structure

```
ESSEN/
├── client/                               # Frontend React + TypeScript application
│   ├── src/
│   │   ├── components/
│   │   │   ├── cart/                     # CartDrawer, DeliveryAddressPicker, SmartCartRecommendations
│   │   │   ├── delivery/                 # LiveDeliveryRiderMap (Bézier road & telemetry HUD)
│   │   │   ├── dinein/                   # TableSplitBillModal (Multi-user split & UPI QR)
│   │   │   ├── food/                     # FoodCard (Calorie counter, dietary pills, stock indicators)
│   │   │   ├── layout/                   # Navbar, Footer, 1-Click Role Switcher bar
│   │   │   └── ui/                       # Modals, Badges, Toast alerts
│   │   ├── context/                      # AuthContext, CartContext, SocketContext
│   │   ├── pages/
│   │   │   ├── admin/                    # AdminDashboard (Restaurant verification & platform logs)
│   │   │   ├── auth/                     # Login, Register, ManagerLogin
│   │   │   ├── customer/                 # Home, Restaurants, RestaurantDetails, Checkout, Orders, Tracking
│   │   │   ├── delivery/                 # DeliveryDashboard (GPS routing & OTP verification)
│   │   │   ├── manager/                  # ManagerDashboard (KDS, Tables, Inventory 86'd, Waiter Provisioning)
│   │   │   └── waiter/                   # WaiterDashboard (Floor tables, assistance chime & haptics)
│   │   ├── services/                     # Axios API client & endpoints
│   │   ├── types/                        # TypeScript domain interfaces (Order, MenuItem, User, etc.)
│   │   └── utils/                        # Food images, sound synthesizers, mock data
│   ├── package.json
│   └── vite.config.ts
│
├── server/                               # Backend Express + TypeScript server
│   ├── src/
│   │   ├── config/                       # Database, Redis, Socket.IO, Seed data
│   │   ├── controllers/                  # Auth, Restaurant, Order, Menu, and Waiter controllers
│   │   ├── middleware/                   # JWT verification, RBAC, Rate limiter, Error handler
│   │   ├── models/                       # Mongoose schemas (User, Restaurant, Order, Reward, Table)
│   │   ├── routes/                       # Express route modules (/api/auth, /api/orders, /api/menu, etc.)
│   │   ├── store/                        # Resilient persistent storage engine (data.json & mockStore.ts)
│   │   └── index.ts                      # Server entry point
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                                 # Technical architecture, DB schemas, API specs
└── README.md                             # Project documentation
```

---

## ⚡ Quick Start & Running Locally

### 1. Prerequisites
* **Node.js** (v18 or higher)
* **npm** (v9 or higher)

### 2. Installation
```bash
# From the project root
npm run install:all
```

### 3. Start Development Servers
```bash
# Starts both Backend (Port 5000) and Frontend (Port 5173) concurrently
npm run dev
```

* **Frontend Web App**: `http://localhost:5173`
* **Backend REST API**: `http://localhost:5000/api`
* **Swagger API Documentation**: `http://localhost:5000/api/docs`

---

## 🔑 Pre-Configured Test Accounts

Use the **1-Click Role Switcher bar** at the top of the app or log in with these credentials:

| Role | Email | Password | Restaurant Code |
|---|---|---|---|
| **Customer** | `customer@essen.com` | `password123` | — |
| **Restaurant Manager** | `manager@essen.com` | `password123` | `EST-ROY-1001` |
| **Waiter / Floor Staff** | `waiter@essen.com` | `password123` | — |
| **Delivery Rider** | `driver@essen.com` | `password123` | — |
| **Platform Admin** | `admin@essen.com` | `admin123` | — |

---

## 📄 Excluded Components (Per Design Spec)
* ❌ WhatsApp message notifications
* ❌ Voice ordering
* ❌ Kitchen thermal paper printer (KOT)
*(Replaced with real-time digital Kitchen Display Systems (KDS), Web Audio chime alerts, and on-screen live telemetry).*
