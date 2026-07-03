# Archived TanStack Start (Lovable) frontend

This directory preserves the original **TanStack Router + TanStack Start** application generated from Lovable. It is **not** part of the Laravel + Inertia runtime.

Use it as a **UI and copy reference** when porting screens into `resources/js/Pages` (Inertia).

Build (optional, for local preview only):

```bash
cd legacy/tanstack-start && npm install && npm run build
```

Production for the municipal site is **Laravel at the repository root** with assets compiled to `public/build` via Vite inside Docker or CI.
