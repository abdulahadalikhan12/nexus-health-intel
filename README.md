# Nexus Health Intel

Vite + React + TypeScript frontend for the Agentic Healthcare Intelligence demo. Deployed on **Vercel**; set `VITE_BACKEND_URL` to your FastAPI `/query` base URL (e.g. Hugging Face Space).

**Call / Email:** use real `phone` / `email` from the API when present. If missing, the UI uses **synthetic** India-style +91 numbers and `name...@gmail.com` addresses (deterministic per facility) so `tel:` / `mailto:` still open — for demo only, not guaranteed real inboxes.

**Last deploy trigger:** 2026-04-28 — contact actions (tel/mailto + search fallback).

See repo history for the latest UI changes.
