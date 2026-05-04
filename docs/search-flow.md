# Search Flow

## How a search is triggered

A search can be initiated in two ways:

1. **Manual** — user clicks "Run Search Now" in the Products table or Product Detail page.
2. **Scheduled** — n8n runs the workflow automatically based on `SearchFrequency` (daily, 12h, 6h).

In both cases, the app's role is identical: POST a payload to the n8n webhook and wait for acknowledgement. The actual search, result evaluation, and sheet writes happen entirely inside n8n.

---

## Manual trigger (app → n8n)

```
User clicks "Run Search Now"
    │
    ▼
n8nService.triggerSearch(payload)
    │
    ▼
POST VITE_N8N_WEBHOOK_URL
    │
    Body:
    {
      "ProductId":   "P-001",
      "ProductName": "ThinkPad P16 Gen 2 i9 Workstation",
      "AmazonASIN":  "B0GXWVLXQK",   ← present only if set on the product
      "TargetPrice": 3400,
      "ManualRun":   true
    }
    │
    ▼
n8n acknowledges (HTTP 200)
    │
    ▼
App shows toast: success or error
```

The app does not poll for results. The user must refresh or navigate away and back to see updated state from the sheet.

---

## Search payload rules

| Field | Required | Notes |
|---|---|---|
| `ProductId` | Yes | Used by n8n to update the correct row in Products |
| `ProductName` | Yes | Used by n8n for the SerpAPI query when no ASIN |
| `AmazonASIN` | No | When present, n8n searches by ASIN specifically |
| `TargetPrice` | Yes | n8n uses this to evaluate the result |
| `ManualRun` | Yes | `true` for manual, `false` for scheduled |

If `AmazonASIN` is set, n8n searches for that specific product.
If `AmazonASIN` is absent, n8n uses `ProductName` as the search query.

---

## n8n workflow responsibilities (not the app)

The app does not implement any of the following. They are owned by the n8n workflow:

- Calling SerpAPI
- Parsing the price from the result
- Comparing `CurrentPrice` against `TargetPrice`
- Incrementing `AttemptNumber`
- Writing to ProcessHistory
- Writing to PricesHistory (only on DESIRED_MATCH)
- Sending the email alert
- Updating the Products sheet (Status, LastPrice, LastUrl, AlertSent, etc.)
- Determining BEST_PROPOSAL after 3 failed attempts

---

## App state after a search completes

After n8n finishes processing, the Products and ProcessHistory sheets are updated by n8n. The app reflects these changes the next time it calls `getProducts()` or `getProcessHistory()` — which happens on page load or manual refresh.

There is no real-time push from n8n to the app. This is intentional to keep the app stateless and simple.

---

## Error handling in the app

| Scenario | App behavior |
|---|---|
| `VITE_N8N_WEBHOOK_URL` not set | Simulates success with a mock response (development mode) |
| Webhook returns non-2xx | Shows error toast with the HTTP error message |
| Network timeout (>15s) | Shows error toast |
| Google Sheets API error | Shows empty state or error message in the relevant section |
