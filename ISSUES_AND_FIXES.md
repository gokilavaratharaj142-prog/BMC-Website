# BMC Project — Issues Found & Fixes Applied

## Issues Detected

### 1. Broken Icons (??)
- **Location:** `_header.html`, `admin.html`
- **Issue:** Dropdown labels showed "About Us ?" and "Our Products ?" (broken Unicode/emoji)
- **Fix:** Replaced with `<span class="dropdown-arrow">▾</span>`. Replaced admin lock/eye emoji with SVG icons.

### 2. Admin Login API Mismatch
- **Location:** `admin.html`
- **Issue:** Previously pointed to `/api/admin/login` and `/api/admin/verify-otp` which do not exist.
- **Fix:** Updated to use `/api/auth/login` and `/api/auth/verify-otp` (existing auth routes).

### 3. CORS Too Restrictive
- **Location:** `backend/app.js`
- **Issue:** CORS allowed only `http://localhost:3000`. Admin opened from file or different port would fail.
- **Fix:** Extended allowed origins: localhost:3000, localhost:5000, 127.0.0.1:3000, 127.0.0.1:5000, null (for file://).

### 4. Token Expiry Not Handled
- **Location:** `backend/middleware/auth.js`, `admin-dashboard.html`
- **Issue:** Expired JWT returned generic error; no client-side expiry check.
- **Fix:** Auth middleware returns "Session expired, please login again" for TokenExpiredError. Dashboard checks JWT expiry on load and redirects to login.

### 5. Feedback API Public
- **Location:** `backend/routes/feedback.js`
- **Issue:** GET /api/feedback returns all feedback without auth (potential data exposure).
- **Note:** Left as-is per "Do NOT change design" constraint. Consider adding admin-only route later.

### 6. Charset Consistency
- **Location:** Various HTML files
- **Issue:** Mixed `utf-8` and `UTF-8` in meta charset.
- **Fix:** Admin pages use `UTF-8`; both are valid.

## Links Verified (No Broken Links Found)

- `_header.html` → `bmc original maari.html#top`, `#categories`, `#contact`, `about.html`, etc. — all valid
- `_footer.html` → `bmc original maari.html#who`, `#services`, `#products`, `#contact` — IDs exist on main page
- `sitemap.html` → All internal links valid
- Product pages → `valves.html`, `crucibles.html`, etc. — all exist

## Summary of Fixes

| Area | Fix |
|------|-----|
| Header | Replaced ?? with dropdown arrow ▾; added `.dropdown-arrow` CSS |
| Admin Login | Corporate styling, loading state, SVG icons, proper error messages |
| Admin Dashboard | Enterprise layout with sidebar, top bar, cards, charts, search, pagination |
| Security | CORS extended, token expiry handling, auto-logout on expiry |
| Icons | SVG lock/eye in admin; no emoji dependency |
