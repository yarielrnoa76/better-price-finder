# ProcessHistory

ProcessHistory is the central audit log of the system. Every search attempt — successful or not — produces exactly one row in this sheet.

---

## Schema

| Column | Type | Description |
|---|---|---|
| `RunId` | string | Unique identifier for this attempt (e.g. `RUN-001`) |
| `ProductId` | string | Foreign key to Products sheet |
| `ProductName` | string | Denormalized name for readability |
| `SearchDate` | ISO 8601 datetime | When this attempt ran |
| `SearchStatus` | enum | `SUCCESS` or `ERROR` — did the search execute cleanly |
| `ResultType` | enum | The business outcome (see below) |
| `AttemptNumber` | integer | 1, 2, or 3 for this product cycle |
| `Found` | boolean | Whether any product listing was found at all |
| `CurrentPrice` | number | The price found, empty if not found |
| `TargetPrice` | number | The target at the time of the search |
| `ResultTitle` | string | Title of the product listing found |
| `Url` | string | URL of the product listing |
| `ErrorMessage` | string | Populated only on errors or when Found = false |
| `Source` | string | Always `SerpAPI` in production |

---

## ResultType values

ResultType is the single most important field. It encodes the business decision made by n8n.

### DESIRED_MATCH

`CurrentPrice <= TargetPrice`

The price goal was reached. This is the only case that:
- Triggers an email alert
- Writes a row to PricesHistory
- Sets the product Status to `FOUND`

### ABOVE_TARGET

`CurrentPrice > TargetPrice` and `AttemptNumber < 3`

A listing was found but the price is above the goal. The product stays active and AttemptNumber increments.

### BEST_PROPOSAL

`AttemptNumber == 3` and no prior `DESIRED_MATCH` in this cycle.

After three attempts without reaching the target, n8n picks the lowest price seen across all three attempts and records it as the best available option. This is **not** a success case:
- No email is sent
- No row is written to PricesHistory
- The product Status is set to `BEST_PROPOSAL`
- `CurrentPrice` contains the lowest price found across the three attempts

### NOT_FOUND

The search executed but returned no product listings.

- `Found = false`
- `CurrentPrice` is empty
- `ErrorMessage` may contain details

### ERROR

The search failed to execute (SerpAPI error, network failure, etc.).

- `SearchStatus = ERROR`
- `Found = false`
- `ErrorMessage` contains the failure reason

---

## AttemptNumber lifecycle

AttemptNumber tracks how many times a product has been searched in the current cycle. A cycle resets when a product reaches `DESIRED_MATCH` or `BEST_PROPOSAL`.

```
Attempt 1 → ABOVE_TARGET → continue
Attempt 2 → ABOVE_TARGET → continue
Attempt 3 → ABOVE_TARGET → evaluate BEST_PROPOSAL
                           pick lowest price from attempts 1-3
                           write final row as BEST_PROPOSAL
                           set product Status = BEST_PROPOSAL
```

If Attempt 1 returns `DESIRED_MATCH`, the cycle ends immediately. AttemptNumber never reaches 2.

---

## What the app reads from ProcessHistory

The app reads ProcessHistory to display:

- Per-product search history (Product Detail page → "Search History" tab)
- Global history across all products (History page)
- Recent searches on the Dashboard

The app never writes to ProcessHistory. All rows are created by the n8n workflow.

---

## Relationship with PricesHistory

ProcessHistory and PricesHistory are complementary:

| Sheet | Contains | Condition |
|---|---|---|
| ProcessHistory | Every attempt | Always |
| PricesHistory | Only successful matches | `ResultType == DESIRED_MATCH` |

A `BEST_PROPOSAL` result appears only in ProcessHistory, never in PricesHistory.

---

## Display rules in the UI

| ResultType | Color | Label shown |
|---|---|---|
| `DESIRED_MATCH` | Green | Match |
| `ABOVE_TARGET` | Orange | Above Target |
| `BEST_PROPOSAL` | Yellow | Best Proposal |
| `NOT_FOUND` | Gray | Not Found |
| `ERROR` | Red | Error |

On the Product Detail page, if the current product Status is `BEST_PROPOSAL`, a banner is shown explaining that the target was never reached and displaying the best price found.
