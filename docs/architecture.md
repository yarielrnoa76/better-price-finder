# Architecture

## Overview

Better Price Finder is a React single-page application that acts as a control panel for an existing n8n workflow. The app does not run searches itself — it delegates that to n8n via webhook and reads/writes state to Google Sheets.

```
Browser (React SPA)
    │
    ├── Read product list & history ──► Google Sheets API
    │
    └── Trigger search ───────────────► n8n Webhook
                                            │
                                            └── SerpAPI ──► Google Sheets (written by n8n)
```

The app is stateless between sessions. All persistent state lives in Google Sheets.

---

## Layers

### UI Layer (`src/pages/`, `src/components/`)

React components. No business logic. Renders data, captures user intent, delegates to services.

### Service Layer (`src/services/`)

Two services, each with a single responsibility:

| Service | Responsibility |
|---|---|
| `googleSheetsService.ts` | Read and write products, process history, prices history |
| `n8nService.ts` | POST a search payload to the n8n webhook |

Services are the only place that makes HTTP calls. Components never call `axios` directly.

### Mock Layer (`src/mock/mockData.ts`)

In-memory substitute for Google Sheets. Active when `VITE_USE_MOCK_DATA=true`. Allows full UI development without credentials.

### Types (`src/types/index.ts`)

Single source of truth for all shared interfaces and union types. No logic, only types.

---

## Data sources

| Sheet | Purpose | Written by |
|---|---|---|
| Products | Product catalog and current state | App (create/update) |
| ProcessHistory | Every search attempt, regardless of outcome | n8n workflow |
| PricesHistory | Only successful price matches (≤ target) | n8n workflow |

The app reads all three sheets. It writes only to Products (create, update SearchEnabled, update Status).

---

## Environment variables

All secrets and external URLs come from environment variables with the `VITE_` prefix.

| Variable | Used by |
|---|---|
| `VITE_N8N_WEBHOOK_URL` | `n8nService.ts` |
| `VITE_GOOGLE_SHEETS_API_KEY` | `googleSheetsService.ts` |
| `VITE_GOOGLE_PRODUCTS_SHEET_ID` | `googleSheetsService.ts` |
| `VITE_GOOGLE_PROCESS_HISTORY_SHEET_ID` | `googleSheetsService.ts` |
| `VITE_GOOGLE_PRICES_HISTORY_SHEET_ID` | `googleSheetsService.ts` |
| `VITE_USE_MOCK_DATA` | `googleSheetsService.ts` |

No secrets are hardcoded or committed. `.env` is in `.gitignore`. `.env.example` is committed.

---

## Routing

| Path | Page | Purpose |
|---|---|---|
| `/` | Dashboard | Summary stats and recent activity |
| `/products` | Products | Full product list with actions |
| `/products/:productId` | ProductDetail | Per-product history and controls |
| `/history` | History | All ProcessHistory records with filters |
| `/settings` | Settings | Current env var values (read-only display) |

---

## Constraints

- The app never creates new Google Sheets.
- The app never sends emails. Email alerts are handled by the n8n workflow.
- The app never modifies ProcessHistory or PricesHistory — those are written exclusively by n8n.
- All business-rule decisions (DESIRED_MATCH, BEST_PROPOSAL, etc.) happen inside the n8n workflow. The app only reads and displays the outcomes.
