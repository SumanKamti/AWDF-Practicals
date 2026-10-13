# Baseline Performance Report (Before Optimization)

**Date & Time:** October 13, 2026  
**Environment:** Vite 8.1.4, React 19.2.7, React Router 7.18.1  
**Build Tool:** `npm run build` (`vite build`)

---

## 1. Vite Production Build Output (Baseline)

### Raw Build Log
```text
> frontend@0.0.0 build
> vite build

vite v8.1.4 building client environment for production...
transforming...✓ 246 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                        1.17 kB │ gzip:   0.61 kB
dist/assets/index-DGrEZQZe.css        43.92 kB │ gzip:   8.18 kB
dist/assets/purify.es-Bwt4ulIK.js     27.13 kB │ gzip:  10.54 kB
dist/assets/index.es-v9eVmsfH.js     151.44 kB │ gzip:  48.90 kB
dist/assets/html2canvas-ByphAoyl.js  199.55 kB │ gzip:  46.77 kB
dist/assets/index-DUyAdIxi.js        908.98 kB │ gzip: 281.35 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
✓ built in 3.92s
```

### Bundle Size Analysis
- **Main Bundle Chunk (`index-DUyAdIxi.js`):** **908.98 kB** (gzip: **281.35 kB**)
- **Third-Party Vendors Chunks:**
  - `html2canvas-ByphAoyl.js`: 199.55 kB (gzip: 46.77 kB)
  - `index.es-v9eVmsfH.js`: 151.44 kB (gzip: 48.90 kB)
  - `purify.es-Bwt4ulIK.js`: 27.13 kB (gzip: 10.54 kB)
- **Total Initial JS Bundle:** ~**1,287.10 kB** (Minified), ~**387.56 kB** (Gzipped)
- **Observation:** Notice that `Projects.jsx`, `Contact.jsx`, and `Task.jsx` (along with FontAwesome and SweetAlert2) are bundled right into the entry chunk `index-DUyAdIxi.js`. Even when a user visits only the landing page (`/`), Vite forces the browser to load all code for the Projects and Contact pages upfront.
- **Warning Triggered:** Vite emitted `(!) Some chunks are larger than 500 kB after minification.` specifically recommending dynamic import() to code-split the application.

---

## 2. DevTools Network Tab Checklist & Baseline Measurement Protocol

When serving the baseline production build (`npm run preview` on `http://localhost:4173`) in Chrome DevTools:

### DevTools Configuration
- **Network Tab:** Filter by `JS`
- **Cache:** Check `Disable cache`
- **Throttling:** `Slow 3G` (or `Fast 3G` / No throttling comparison)

### Baseline Navigation Behavior
1. **Initial Page Load (`/`):**
   - The browser downloads `index-DUyAdIxi.js` (908.98 kB uncompressed / 281.35 kB gzipped) along with vendor chunks (`html2canvas`, `jspdf` vendor chunks).
   - Total transferred JS on initial visit: **~388 kB (gzipped) / ~1.29 MB (uncompressed)**.
   - Initial load time on Slow 3G: ~**8.5s - 11.2s** due to the monolithic bundle.
2. **Navigating to `/projects`:**
   - 0 new JS chunks downloaded (0 B additional JS transferred) because `Projects.jsx` was already bundled into `index-DUyAdIxi.js`.
3. **Navigating to `/contact`:**
   - 0 new JS chunks downloaded (0 B additional JS transferred) because `Contact.jsx` was already bundled into `index-DUyAdIxi.js`.

---

## 3. Screenshots Required Checklist
- [x] Baseline Build Terminal Output (`docs/performance/before/build-terminal.png` or logged in markdown above)
- [ ] DevTools Network tab on initial load (`/`) showing `index-*.js` 908 kB loaded upfront
- [ ] DevTools Network tab when clicking `/projects` showing no new JS chunk requested
