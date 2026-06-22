# API Reference

Base URL: `/api` (local: `http://localhost:4000/api`)

### Conventions

- **Success:** `{ "success": true, "data": <payload>, "meta"?: <pagination> }`
- **Error:** `{ "success": false, "error": { "code": "STRING", "message": "…", "details"?: [...] } }`
- **Auth:** send the access token as `Authorization: Bearer <token>`. The refresh token is an
  httpOnly cookie set automatically by `/auth/*` responses.
- **Pagination meta:** `{ total, page, limit, totalPages, hasNextPage, hasPrevPage }`
- **Common errors:** `400 BAD_REQUEST`, `401 UNAUTHORIZED`, `403 FORBIDDEN`,
  `404 NOT_FOUND`, `409 CONFLICT`, `422 VALIDATION_ERROR`, `429 RATE_LIMITED`,
  `500 INTERNAL_ERROR`.

---

## Auth — `/api/auth`

### `POST /auth/register`
Create an account and start a session.

- **Body:** `{ name: string(2–80), email: email, phone?: string, password: string }`
- **Password rules:** ≥ 8 chars, ≥ 1 letter, ≥ 1 number.
- **201:** `{ user, accessToken }` (+ refresh cookie). **409** if email exists.

### `POST /auth/login`
- **Body:** `{ email, password }`
- **200:** `{ user, accessToken }` (+ refresh cookie). **401** on bad credentials,
  **403** if the account is deactivated.

### `POST /auth/refresh`
Rotate tokens using the refresh cookie. **200:** `{ user, accessToken }`. **401** if missing/expired/reused.

### `POST /auth/logout`
Revoke the current refresh token and clear the cookie. **200:** `{ message }`.

### `GET /auth/me` 🔒
Return the authenticated user. **200:** `{ id, name, email, phone, role, avatarUrl, emailVerified, createdAt }`.

### `POST /auth/forgot-password`
- **Body:** `{ email }` — always **200** (no account enumeration); emails a reset link if the account exists.

### `POST /auth/reset-password`
- **Body:** `{ token, password }` — **200** on success, **400** if the token is invalid/expired. Revokes all sessions.

---

## Users (self) — `/api/users` 🔒

### `PATCH /users/me`
- **Body:** `{ name?, phone?, avatarUrl? }` → updated user.

### `POST /users/me/change-password`
- **Body:** `{ currentPassword, newPassword }` → **200**; **400** if current is wrong. Revokes other sessions.

### `GET /users/me/saved` → saved vehicles (array).
### `POST /users/me/saved/:vehicleId` → toggles save; returns `{ saved: boolean }`.
### `GET /users/me/inquiries` → the user's inquiries (with vehicle summary).
### `GET /users/me/bids` → distinct auctions the user has bid on: `[{ auction, myLastBid, isWinning, isWinner }]`.

---

## Vehicles — `/api/vehicles`

### `GET /vehicles`
Public, paginated, filtered listing (only `ACTIVE`).

- **Query:** `q?`, `brand?`, `fuelType?(PETROL|ELECTRIC|HYBRID)`, `listingType?(SALE|AUCTION)`,
  `city?`, `minPrice?`, `maxPrice?`, `minYear?`, `maxYear?`,
  `sort?(newest|price_asc|price_desc|year_desc|km_asc|popular)`, `page?`, `limit?(≤100)`.
- **200:** `{ data: Vehicle[], meta }`.

### `GET /vehicles/featured` → up to 6 featured active vehicles.

### `GET /vehicles/:slug` → full vehicle (images, seller, auction). Increments view count. **404** if not active.

### `GET /vehicles/:id/similar` → up to 4 similar active vehicles (same brand or fuel type).

### `GET /vehicles/me/listings` 🔒 → the caller's listings (all statuses).

### `POST /vehicles` 🔒
Create a listing.

- **Body:** `{ title, brand, model, variant?, year, fuelType, transmission, kmDriven,
  ownerCount, engineCapacityCc?, color?, registrationState?, city, description(≥20),
  price, listingType, images: [{ url, isPrimary?, sortOrder? }] (1–15) }`
- **201:** the created vehicle. `SALE` listings are `ACTIVE`; `AUCTION` listings are `PENDING`
  until an admin schedules the auction.

### `PATCH /vehicles/:id` 🔒 (owner or admin) → partial update; replaces images if provided.
### `DELETE /vehicles/:id` 🔒 (owner or admin) → **200** `{ message }`.

---

## Auctions — `/api/auctions`

### `GET /auctions`
- **Query:** `status?(SCHEDULED|LIVE|ENDED|SETTLED|CANCELLED)` (defaults to live+scheduled), `page?`, `limit?`.
- **200:** `{ data: Auction[], meta }` (each includes its vehicle + images).

### `GET /auctions/:id` → one auction with vehicle and winner. **404** if missing.
### `GET /auctions/:id/bids` → the latest 25 bids (with bidder name).

### `POST /auctions/:id/bids` 🔒
REST fallback for bidding (the primary path is the WebSocket).

- **Body:** `{ amount: number }`
- **201:** `{ currentPrice, totalBids, endTime, extended }`.
- **Errors:** `400` (auction not live / below minimum / outside window),
  `403` (bidding on your own vehicle), `404`.

### `POST /auctions` 🔒 **ADMIN**
Create/schedule an auction for a vehicle.

- **Body:** `{ vehicleId, startingPrice, reservePrice?, bidIncrement(=500), startTime,
  endTime, antiSnipeSeconds(=30) }` — `endTime > startTime`, `reservePrice ≥ startingPrice`.
- **201:** the auction (status `LIVE` if `startTime` is past, else `SCHEDULED`). **409** if the vehicle already has an auction.

### `POST /auctions/:id/cancel` 🔒 **ADMIN** → sets status `CANCELLED`. **400** if already settled.

---

## Inquiries — `/api/inquiries`

### `POST /inquiries`
Public lead capture (user id attached automatically if logged in).

- **Body:** `{ vehicleId, name, email, phone, message(5–2000) }`
- **201:** `{ id, message }`. **404** if the vehicle isn't active.

---

## CMS (public reads) — `/api/cms`

- `GET /cms/faqs` → published FAQs.
- `GET /cms/testimonials` → published testimonials.
- `GET /cms/content` → editable homepage blocks as a `{ key: value }` map.
- `GET /cms/stats` → `{ vehiclesListed, vehiclesSold, happyCustomers, liveAuctions }`.

---

## Admin — `/api/admin` 🔒 **ADMIN**

| Method & path | Purpose |
| --- | --- |
| `GET /admin/dashboard` | Metrics + recent inquiries/users (totals, GMV, live/settled auctions…) |
| `GET /admin/users` | List users (`q?`, `role?`, `page?`) with activity counts |
| `PATCH /admin/users/:id` | Update `{ name?, phone?, role?, isActive? }` (can't self-demote/disable) |
| `DELETE /admin/users/:id` | Delete a user (not self) |
| `GET /admin/vehicles` | List vehicles (`q?`, `status?`, `page?`) |
| `PATCH /admin/vehicles/:id` | Moderate `{ status?, featured? }` |
| `DELETE /admin/vehicles/:id` | Delete a vehicle |
| `GET /admin/inquiries` | List inquiries (`status?`, `page?`) |
| `PATCH /admin/inquiries/:id` | Update `{ status }` |
| `DELETE /admin/inquiries/:id` | Delete an inquiry |
| `GET/POST /admin/faqs`, `PATCH/DELETE /admin/faqs/:id` | FAQ CRUD |
| `GET/POST /admin/testimonials`, `PATCH/DELETE /admin/testimonials/:id` | Testimonial CRUD |
| `GET /admin/site-content`, `PUT /admin/site-content` | Read / upsert `{ key, value }` content blocks |

---

## WebSocket (Socket.IO)

Connect to the server origin with the access token in the handshake:

```ts
import { io } from 'socket.io-client';
const socket = io(SOCKET_URL, { auth: { token: accessToken } });
```

**Client → Server**

| Event | Payload | Notes |
| --- | --- | --- |
| `auction:join` | `auctionId: string` | join an auction room |
| `auction:leave` | `auctionId: string` | leave the room |
| `bid:place` | `{ auctionId, amount }` + ack | ack: `{ ok, currentPrice?, error? }` |

**Server → Client**

| Event | Payload |
| --- | --- |
| `bid:new` | `{ auctionId, bid: { id, amount, bidderName, createdAt }, currentPrice, totalBids, endTime, extended }` |
| `auction:status` | `{ auctionId, status, winnerId?, finalPrice?, reserveMet? }` |
| `bid:rejected` | `{ auctionId, error }` |

All bid validation, the row lock, anti-snipe and broadcasting are server-side; clients are
never trusted to compute price or outcome.
