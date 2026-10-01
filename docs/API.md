# ESSEN AI - REST API Reference

The backend exposes a structured, strictly validated REST API with Swagger documentation available at `/api/docs`.

## Base URL
```
http://localhost:5000/api
```

---

## 1. Authentication & RBAC (`/api/auth`)
* `POST /api/auth/register` — Register new Customer.
* `POST /api/auth/login` — Universal login for Customer, Waiter, Admin, Delivery Partner.
* `POST /api/auth/manager-login` — Dual-credential login requiring email, password, and unique `restaurantCode`.
* `GET /api/auth/profile` — Fetch current user profile, active restaurant binding, and roles.

---

## 2. Restaurants & Discovery (`/api/restaurants`)
* `GET /api/restaurants` — Search and multi-filter venues (Veg, Non-Veg, Cuisine, Rating 4.5+, Distance, Price).
* `GET /api/restaurants/featured` — Fetch top-rated & trending restaurants.
* `GET /api/restaurants/:id` — Fetch complete restaurant profile with operational hours, GSTIN, and location.
* `POST /api/restaurants` — Register a new restaurant (Initiates verification workflow).
* `PUT /api/restaurants/:id/status` — Toggle restaurant status (`OPEN`, `CLOSED`, `TEMPORARILY_UNAVAILABLE`).

---

## 3. Digital Menu & Categories (`/api/restaurants/:id/menu` & `/api/menu`)
* `GET /api/restaurants/:id/menu` — Fetch full categorized menu with customization options.
* `GET /api/menu/search` — Search food items across restaurants by name, dietary tag, spice level, or budget.
* `POST /api/menu/items` — Manager endpoint to add menu item.
* `PUT /api/menu/items/:id` — Update menu item pricing, ingredients, or stock status.

---

## 4. Dine-In, Tables & Bookings (`/api/restaurants/:id/dine-in` & `/api/dine-in`)
* `GET /api/restaurants/:id/tables` — Fetch floor map and table availability.
* `POST /api/restaurants/:id/bookings` — Reserve table for specific date, time, and party size.
* `GET /api/restaurants/:id/waitlist` — Fetch active live waitlist queue.
* `POST /api/restaurants/:id/waitlist` — Join waitlist when tables are fully occupied.
* `POST /api/dine-in/service-requests` — Customer table assistance request (Call Waiter, Water, Cutlery, Bill).

---

## 5. Orders & Kitchen Display System (`/api/orders`)
* `POST /api/orders` — Create new Dine-in or Delivery order (Recalculates pricing server-side).
* `GET /api/orders/my-orders` — List customer order history.
* `GET /api/orders/:id` — Get detailed order summary with itemized taxes and live status.
* `PUT /api/orders/:id/status` — KDS / Staff status progression (`ACCEPTED`, `PREPARING`, `READY`, `SERVED`).
* `POST /api/orders/:id/cancel` — Cancel order according to restaurant cancellation policy.

---

## 6. Payments, Invoices & Refunds (`/api/payments`, `/api/invoices`, `/api/refunds`)
* `POST /api/payments/initiate` — Initiate payment for an order.
* `POST /api/payments/verify` — Verify gateway transaction and confirm order.
* `GET /api/invoices/:id` — Generate or view itemized invoice with CGST/SGST breakdowns.
* `POST /api/refunds` — File a dispute/refund request.

---

## 7. Delivery Operations (`/api/delivery`)
* `GET /api/delivery/active` — Rider view of assigned orders.
* `PUT /api/delivery/:orderId/status` — Update delivery status (`PICKED_UP`, `OUT_FOR_DELIVERY`, `ARRIVED`).
* `POST /api/delivery/:orderId/verify-otp` — Server-side verification of 4-digit customer OTP to finalize delivery.

---

## 8. Transaction-Linked Loyalty Engine (`/api/rewards`)
* `GET /api/rewards/my-rewards` — Fetch customer's restaurant-specific coin accounts.
* `POST /api/rewards/claim-voucher` — Anti-fraud claim of order-linked reward voucher (`+5 to +10 coins`).
* `POST /api/rewards/redeem-combo` — Unlock 5,000 coin combo and generate redemption QR code.
* `POST /api/rewards/verify-redemption` — Manager verification and burning of customer combo voucher.

---

## 9. ESSEN AI Concierge (`/api/essen`)
* `POST /api/essen/query` — AI Natural Language chat endpoint (Executes validated intent queries for Customer, Waiter, and Manager).
