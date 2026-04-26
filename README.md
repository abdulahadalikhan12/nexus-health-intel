# Nexus Health Intel

Vite + React + TypeScript frontend for the Agentic Healthcare Intelligence demo. Deployed on **Vercel**; set `VITE_BACKEND_URL` to your FastAPI `/query` base URL (e.g. Hugging Face Space).

**Call / Email:** when the API returns `phone` / `email`, links use `tel:` and `mailto:`. If those fields are missing (older Space build), Call/Email open a **Google search** for that facility so the buttons still work.

**Last deploy trigger:** 2026-04-28 — contact actions (tel/mailto + search fallback).

See repo history for the latest UI changes.
