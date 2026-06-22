# Assumptions, Trade-offs & Design System

## Product framing

The brief combined two things: a **bike auction platform** (live, real-time bidding) and a
**Vutto-style used-two-wheeler marketplace** (listings, inquiries, lead-gen). I built a
single coherent product that does both: every vehicle is a listing, and a listing can be sold
either at a **fixed price (Buy now)** or via a **live auction**. This keeps one catalogue,
one detail page, one inquiry flow, and adds auctions as a first-class capability rather than a
bolt-on.

---

## Design system (derived from vutto.in)

Extracted from the live site + the provided palette export. Codified in
`frontend/tailwind.config.js` and `frontend/src/index.css`.

**Colours**

| Token | Hex | Use |
| --- | --- | --- |
| `ink` / `ink-soft` / `ink-muted` | `#222222` / `#444444` / `#767676` | text hierarchy |
| `brand` | `#0050FF` (with `#3478F5` light) | primary actions, links, accents |
| `accent` | `#FF8B2B` on `#FFF8F3` | warm CTAs (sell, bid) |
| `success` | `#12AA00` | live/positive states |
| `danger` / `pink` | `#FF2929` / `#D23657` | errors, destructive |
| `cream` / `surface` | `#F0EFEB` / `#F5F5F5` | section & app backgrounds |
| `line` / `line-strong` | `#EBEBEB` / `#DEDEDE` | borders |

**Typography** — the live site is a JS-rendered SPA, so the exact licensed webfont name
isn't publicly exposed. I matched its clean, friendly geometric look with **Plus Jakarta
Sans** (display/headings) + **Inter** (body/UI) via Google Fonts — both free, self-hostable,
and visually faithful. Swapping in the exact font later is a one-line change in `index.html`
+ `tailwind.config.js`.

**Other tokens** — generous radii (`card` = 20px, pill buttons), soft layered shadows
(`soft`/`card`/`lifted`), an 8px-based spacing rhythm, subtle `fade-up`/`pulse-ring`
animations, and a mobile-first responsive grid. Accessibility: visible focus rings, semantic
landmarks, `aria-*` on interactive controls, keyboard-dismissable modals.

---

## Key assumptions

1. **Listing approval.** Fixed-price (`SALE`) listings auto-publish (`ACTIVE`) so the demo is
   usable immediately; `AUCTION` listings stay `PENDING` until an admin schedules the auction.
   Admins can moderate any listing's status.
2. **Auctions are admin-scheduled.** Sellers flag a listing as auction-type; an admin sets the
   start/end window, starting/reserve price and increment. This mirrors how curated auction
   platforms actually operate and keeps quality high.
3. **Image handling.** Images are referenced by **URL** rather than uploaded. A real
   deployment would add S3/Cloudinary uploads; the data model (`VehicleImage`) and UI already
   support ordered images and a cover photo, so adding an uploader is isolated.
4. **Payments are out of scope.** "Best price / financing / warranty" are presented in the UI
   and GMV is tracked, but no payment gateway is integrated (clearly a separate, compliance-
   heavy workstream).
5. **Email.** Password-reset email works via SMTP if configured; otherwise it's logged to the
   console so the flow is fully testable locally without a mail server.
6. **Currency/locale.** INR + `en-IN` formatting (₹, lakh/crore), matching the Delhi-NCR
   market the brief references.
7. **Winner = highest bid ≥ reserve.** At settlement the leading bid wins only if it meets the
   (hidden) reserve; otherwise the vehicle goes unsold (`ARCHIVED`).

---

## Trade-offs (and why)

| Decision | Trade-off | Rationale |
| --- | --- | --- |
| **In-process auction scheduler** | Must elect a leader to scale to N instances | Zero extra infra for the common single-instance case; the doc spells out the advisory-lock/worker upgrade. The *bidding* path is already concurrency-safe via row locks. |
| **`SELECT … FOR UPDATE` per bid** | Serialises bids on one auction row | Correctness > raw throughput. Bids on *different* auctions don't contend, and per-auction bid rate is human-scale. |
| **JWT in memory + refresh cookie** | Access token lost on hard refresh (silent refresh re-issues it) | Best practical XSS/CSRF posture without a session store. |
| **Feature-first modules** | Slightly more files | Each domain is self-contained and easy to navigate/change. |
| **React Query + Zustand (no Redux)** | Two small libs instead of one big one | RQ owns server state; Zustand owns the tiny bit of client/auth state. Less boilerplate. |
| **Decimal money in DB, string on the wire** | Client must `Number()` before maths | Avoids float rounding bugs on currency — non-negotiable for money. |
| **Socket.IO over raw WS** | Slightly larger client | Rooms, acks, auto-reconnect and the Redis adapter come for free — exactly what bidding needs. |
| **URL-based images** | No upload UX | Keeps the demo dependency-free; cleanly swappable for object storage. |

---

## What I'd add next (with more time)

- Object-storage image uploads with client-side resizing.
- Redis: Socket.IO adapter (multi-instance fan-out) + a distributed lock for the scheduler.
- Proxy/auto bidding (set a max, the server bids the increment for you).
- Email/web push notifications for outbid / auction-won events.
- E2E tests (Playwright) for the bidding journey and a GitHub Actions pipeline.
- Payment + RC-transfer workflow and seller payouts.
