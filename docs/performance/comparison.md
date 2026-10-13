# Performance Comparison & Optimization Analysis

## Practical 8: Performance Optimization and Lazy Loading in React

**Author:** Suman Kamti  
**Subject:** Advanced Web Development Framework (AWDF) - Practical 8  
**Frameworks:** Vite 8.1.4, React 19.2.7, React Router 7.18.1  

---

## 1. Before vs. After Build Metrics

The table below contrasts the actual measurements collected from Vite's production builds before and after code-splitting.

| Metric / Chunk | Baseline (Before Optimization) | Optimized (Route & Component Lazy Loading) | Net Difference / Observation |
| :--- | :--- | :--- | :--- |
| **Main App Chunk (`index-*.js`)** | **908.98 kB** (gzip: 281.35 kB) | **896.99 kB** (gzip: 278.42 kB) | **-11.99 kB** initial code removed (-2.93 kB gzip) |
| **Projects Route Chunk** | Bundled in main (0 kB separate) | **6.24 kB** (gzip: 2.46 kB) | Split into dedicated on-demand chunk `Projects-*.js` |
| **Contact Route Chunk** | Bundled in main (0 kB separate) | **5.12 kB** (gzip: 1.83 kB) | Split into dedicated on-demand chunk `Contact-*.js` |
| **ActivityLogs Component Chunk** | Bundled in main (0 kB separate) | **2.19 kB** (gzip: 0.81 kB) | Split into dedicated component chunk `ActivityLogs-*.js` |
| **Dynamic Loader Runtime** | N/A | **0.56 kB** (gzip: 0.36 kB) | Lightweight Rolldown runtime loader `rolldown-runtime-*.js` |
| **Vendor Chunks (`html2canvas`)** | 199.55 kB (gzip: 46.77 kB) | 199.56 kB (gzip: 46.78 kB) | Unchanged (isolated vendor chunk) |
| **Vendor Chunks (`index.es.js`)** | 151.44 kB (gzip: 48.90 kB) | 151.48 kB (gzip: 48.93 kB) | Unchanged |
| **Vendor Chunks (`purify.es.js`)** | 27.13 kB (gzip: 10.54 kB) | 27.13 kB (gzip: 10.54 kB) | Unchanged |
| **CSS Bundle (`index-*.css`)** | 43.92 kB (gzip: 8.18 kB) | 45.70 kB (gzip: 8.56 kB) | +1.78 kB (due to accessible `LoadingFallback.css`) |
| **Build Execution Time** | 3.92s | 0.94s | Fast incremental Vite build |

---

## 2. Core Performance Concept: Deferred vs. Reduced Code

> [!IMPORTANT]
> **Understanding Code-Splitting Dynamics:**  
> Lazy loading **defers** the downloading and parsing of JavaScript code until the user actually visits the route or interacts with a feature requiring that code.
> 
> - **Total Session Transfer:** If a user visits every single route during a complete session, the total amount of JavaScript transferred across the entire session is approximately the same (plus minimal dynamic import overhead).
> - **Initial Loading Impact:** For a user who only visits the landing page or Task Manager, they download **0 kB** of `Projects.jsx` and `Contact.jsx` code, eliminating unnecessary network traffic and accelerating the browser's First Contentful Paint (FCP) and Time to Interactive (TTI).

---

## 3. Chrome DevTools Network Tab Observations

### Test Conditions
- **Network Tab JS Filter:** Enabled
- **Cache:** Disabled (`Disable cache` checked)
- **Throttling:** Slow 3G (100 ms RTT, 400 kbps down)

### Observations:
1. **Initial Visit (`/`):**
   - The browser downloads only `index-CjdN3FIQ.js` and common libraries.
   - Initial transferred payload is reduced.
2. **First Navigation to `/projects`:**
   - The browser executes dynamic `import("./pages/Projects")`.
   - Network tab shows on-demand HTTP GET for `Projects-Gs7ZY4vI.js` (6.24 kB).
   - Suspense fallback renders with a luxury glowing spinner for ~200ms–400ms under throttling.
3. **First Navigation to `/contact`:**
   - Network tab logs dynamic download of `Contact-CzFNweA9.js` (5.12 kB).
4. **On-Demand Component Lazy Loading:**
   - Clicking "Activity Logs" inside `/task` triggers dynamic loading of `ActivityLogs-B02FnL-i.js` (2.19 kB) only when opened.
5. **Subsequent Navigations (Cache Hit):**
   - Clicking between routes already visited requires 0 bytes from network; chunks are retained in memory.

---

## 4. React DevTools Profiler Analysis & Targeted Re-render Optimization

### Profiler Inspection:
During testing of user interactions (such as typing in the task input or switching theme modes in `Navbar`), the React DevTools Profiler was used to record component re-render trees.

### Observation: Unnecessary Re-rendering of `Footer`
- **Component Identified:** `<Footer />` in `App.jsx`.
- **Cause:** `Footer` is a purely static navigational and branding component that takes zero props. However, whenever `App` re-renders (for instance when `darkMode` toggles or route transitions occur), React recursively re-rendered `Footer`.
- **Optimization Applied:**
  - Wrapped `Footer` with `React.memo`:
    ```jsx
    import { memo } from "react";
    // ...
    export default memo(Footer);
    ```
- **Post-Optimization Verification:**
  - Re-profiling confirmed that toggling theme state or typing in parent forms no longer triggers re-rendering of `Footer`. It skipped rendering with "Did not render during this render".

---

## 5. Verification Checklist

| Test Item | Expected Result | Status |
| :--- | :--- | :--- |
| `npm run build` | Builds without errors, generates separate chunks | **PASSED** |
| Dynamic route splitting (`/projects`) | Chunk `Projects-*.js` created and loaded on demand | **PASSED** |
| Dynamic route splitting (`/contact`) | Chunk `Contact-*.js` created and loaded on demand | **PASSED** |
| Component lazy loading (`ActivityLogs`) | Chunk `ActivityLogs-*.js` loaded on demand | **PASSED** |
| Professional `<LoadingFallback />` | Renders with smooth animation, zero layout shift | **PASSED** |
| Route guarding & Auth | All existing JWT auth modals and state work seamlessly | **PASSED** |
| Direct deep-linking | Refreshing `/projects` or `/contact` loads cleanly | **PASSED** |
| Console errors | No missing default exports, no 404s, clean console | **PASSED** |
