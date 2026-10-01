# ESSEN AI - MongoDB Database Schema & Indexes

## Database Design Philosophy
* **Document-First Approach**: Embedded snapshots for purchase records, high-performance subdocuments for customization options, and normalized references for major multi-tenant relations.
* **Geospatial Queries**: `2dsphere` indexed GeoJSON points for real-time radius matching (`within 3 km`).
* **Multi-Tenant Isolation**: Compound indexing on `customerId` + `restaurantId`.

---

## Main Collections

### 1. `users`
* Fields: `name`, `email` (unique), `phone`, `password`, `role` (enum), `addresses`, `preferences`.
* Indexes: `{ email: 1 }`, `{ phone: 1 }`, `{ role: 1 }`.

### 2. `restaurants`
* Fields: `name`, `slug`, `restaurantCode` (unique), `cuisine`, `foodType`, `address`, `location` (GeoJSON Point), `gstin`, `isVerified`, `status`, `loyaltySettings`.
* Indexes: `{ location: "2dsphere" }`, `{ restaurantCode: 1 }`, `{ cuisine: 1 }`, `{ rating: -1 }`.

### 3. `menuCategories` & `menuItems`
* Fields: `restaurantId`, `categoryId`, `name`, `foodType` (`veg`, `non-veg`, `vegan`, `egg`), `price`, `taste`, `customizationGroups`, `isAvailable`.
* Indexes: `{ restaurantId: 1, categoryId: 1 }`, `{ name: "text" }`, `{ foodType: 1 }`.

### 4. `orders`
* Fields: `orderNumber`, `customerId`, `restaurantId`, `orderType` (`DINE_IN` | `ONLINE_DELIVERY`), `items` (purchase-time immutable snapshot), `pricing` (`itemTotal`, `cgst`, `sgst`, `deliveryFee`, `packagingFee`, `tip`, `discount`, `grandTotal`), `status`, `deliveryOtp`, `tableNumber`.
* Indexes: `{ customerId: 1, createdAt: -1 }`, `{ restaurantId: 1, status: 1 }`, `{ orderNumber: 1 }`.

### 5. `rewardAccounts` & `rewardVouchers`
* Fields (`rewardAccounts`): `customerId`, `restaurantId`, `coinBalance`, `lifetimeEarned`, `milestonesUnlocked`.
* Fields (`rewardVouchers`): `voucherCode`, `orderId`, `customerId`, `restaurantId`, `coins` (`+5 to +10`), `qrToken`, `status` (`UNCLAIMED`, `CLAIMED`, `EXPIRED`), `expiresAt`.
* Indexes: `{ customerId: 1, restaurantId: 1 }` (Unique Compound), `{ qrToken: 1 }`, `{ voucherCode: 1 }`.

### 6. `rewardRedemptions`
* Fields: `redemptionCode`, `customerId`, `restaurantId`, `rewardName`, `requiredCoins` (5000), `qrToken`, `status` (`PENDING_VERIFICATION`, `VERIFIED_AND_REDEEMED`, `CANCELLED`), `expiresAt`.
* Indexes: `{ qrToken: 1 }`, `{ redemptionCode: 1 }`.

### 7. `restaurantTables`, `tableBookings`, `waitlists`
* Indexes: `{ restaurantId: 1, tableNumber: 1 }`, `{ restaurantId: 1, bookingDate: 1 }`.

### 8. `deliveries`, `payments`, `invoices`, `reviews`, `supportTickets`, `auditLogs`
* Indexes: `{ orderId: 1 }`, `{ invoiceNumber: 1 }`, `{ restaurantId: 1, rating: -1 }`.
