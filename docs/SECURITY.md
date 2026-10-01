# ESSEN AI - Security Architecture & Threat Model

## 1. Dual Restaurant Code Verification
Manager accounts must pass dual verification:
1. Valid JWT with role `manager`
2. Correct `restaurantCode` linked to the target restaurant tenant.

```
Authenticated User -> Manager Role -> Restaurant Association -> Restaurant Code -> Authorized
```
Cross-restaurant parameter tampering or brute-force code attacks are automatically rejected and recorded in `auditLogs`.

---

## 2. Server-Authoritative Financial Integrity
* **Pricing Manipulation Prevention**: Base prices, taxes (CGST 2.5%, SGST 2.5%), delivery tiering, packaging fees, and discounts are recomputed by `calculateOrderPricing()` on the server.
* **Immutable Snapshot**: Historical orders reference an embedded frozen snapshot of the menu item and tax rates at the exact millisecond of checkout.

---

## 3. Cryptographic Loyalty Voucher Verification
* Coins are never awarded on raw client pings.
* Orders must reach `COMPLETED` and `PAID` before a signed `RewardVoucher` is generated.
* Each voucher possesses a single-use `qrToken`. Claiming or redeeming burns the token atomically within MongoDB.
* Duplicate claims, expired tokens, or restaurant mismatches are immediately rejected.

---

## 4. Delivery OTP Handshake
* Deliveries cannot be marked completed by the driver alone.
* A 4-digit cryptographically generated OTP is shared with the customer.
* The driver must enter the customer's OTP into the driver interface for server verification before transitioning state to `DELIVERED`.

---

## 5. Security Headers & Rate Limiting
* Helmet HTTP protection headers enabled.
* Express rate limiters applied on `/api/auth` and `/api/essen`.
* CORS restricted to authorized client domains.
