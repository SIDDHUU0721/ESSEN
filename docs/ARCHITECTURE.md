# ESSEN AI - System Architecture

## Overview
**ESSEN** is a high-performance, AI-powered unified food-tech platform engineered with a strict layered architecture, MongoDB document store, and real-time Socket.IO pipelines.

```
                         PLATFORM ADMIN
                              │
                    Verification / Control
                              │
                              ▼
       ┌──────────────────────┴──────────────────────┐
       │                                             │
   CUSTOMER                                      RESTAURANT
       │                                             │
       │                                  ┌──────────┴──────────┐
       │                                  │                     │
       │                               MANAGER                WAITER
       │                                  │                     │
       └──────────────────────────────────┴─────────────────────┘
                                          │
                                          ▼
                              REACT + TYPESCRIPT (Vite)
                                          │
                                    REST / Axios
                                          │
                                          ▼
                              NODE + EXPRESS + TS
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
                  AUTH                BUSINESS              ESSEN AI
                  RBAC                 SERVICES                 │
                    │                     │                     │
                    │          ┌──────────┼──────────┐          │
                    │          │          │          │          │
                    │        Orders    Payments   Rewards       │
                    │        Booking   Delivery   Loyalty       │
                    │        Kitchen   Billing    QR            │
                    │        Waiter    Offers     Support       │
                    │          │          │          │          │
                    └──────────┴──────────┴──────────┴──────────┘
                                          │
                                      Mongoose
                                          │
                         ┌────────────────┴────────────────┐
                         │                                 │
                         ▼                                 ▼
                     MongoDB                              Redis
                         │
                         ▼
                  Complete Platform Data
```

---

## Key Pillars

### 1. Unified Multi-Role RBAC & Restaurant Isolation
* **Roles**: Customer, Waiter, Manager, Platform Admin, Delivery Partner.
* **Dual Restaurant Code Validation**: Managers authenticate via both credentials and a unique restaurant code (e.g. `EST-ROY-1001`). Cross-tenant data leaks are prevented at the service and query layer.
* **Waiters**: Strict operational scope bound exclusively to the assigning restaurant's active tables and dine-in tickets.

### 2. Transaction-Linked QR Loyalty Engine
* **No Arbitrary ₹100 = 10 Coins**: Anti-fraud digital vouchers generated strictly on paid, completed orders (`+5 to +10` coins).
* **Restaurant-Specific Ledger**: Each restaurant maintains independent loyalty accounts (`customer_id` + `restaurant_id`).
* **5,000 Coin Milestone Unlock**: Generates a cryptographic redemption voucher and QR code for restaurant verification.

### 3. Server-Authoritative Transparent Pricing
* Frontend pricing totals are never trusted. The backend recalculates item base prices, add-on costs, CGST (2.5%), SGST (2.5%), dynamic delivery fees, and packaging fees.
* Order items store an immutable purchase-time snapshot (`unitPrice`, `taxRate`, `itemTotal`) ensuring historical ledger integrity.

### 4. Real-Time Operations (Socket.IO)
* **KDS Rooms**: Instant order ingestion from NEW -> PREPARING -> READY.
* **Waiter Floor Rooms**: Live customer assistance, water, cutlery, and bill requests.
* **Delivery Live Dispatch**: State progression (ASSIGNED -> PICKED_UP -> OUT_FOR_DELIVERY -> ARRIVED) finalized by 4-digit customer OTP verification.

### 5. ESSEN AI Assistant Engine
* NLP intent detector transforming natural queries into structured backend filters.
* Role-bounded access ensuring customers query food/recommendations, waiters query active floor tickets, and managers analyze revenue, peak hours, and sentiment.
