# Price Search Logic

Use this skill when implementing product price search logic for Better Price Finder.

## Purpose

This skill defines how to evaluate product search results against a desired TargetPrice, ASIN rules, retry attempts, and proposal logic.

## Core Rules

- If ASIN is provided, search only for that ASIN or direct product matches.
- If ASIN is missing, search for similar products that satisfy the TargetPrice.
- Do not mix unrelated products when ASIN is specified.
- Track search attempts per product.
- After 3 failed attempts, save the lowest valid found price as BEST_PROPOSAL.
- BEST_PROPOSAL is not a successful target match.
- Do not send email for BEST_PROPOSAL unless explicitly requested.
- TARGET_MATCH means product price is less than or equal to TargetPrice.
- BEST_PROPOSAL means no TargetPrice match was found, but a reliable lowest-price candidate exists.
- NOT_FOUND means no reliable product candidate was found.

## ResultType Values

Use only these values:

- TARGET_MATCH
- BEST_PROPOSAL
- NOT_FOUND

## Data Rules

Expected fields:

- ProductName
- TargetPrice
- ASIN
- CurrentPrice
- LowestFoundPrice
- Url
- ResultType
- SearchAttempt
- SearchDate
- Notes

## Decision Logic

1. Read product input.
2. Check if ASIN exists.
3. If ASIN exists:
   - Search only ASIN-related results.
   - Ignore unrelated similar products.
4. If ASIN does not exist:
   - Search similar product candidates.
5. Normalize all prices to numeric values.
6. Compare valid prices against TargetPrice.
7. If price <= TargetPrice:
   - ResultType = TARGET_MATCH
8. If no target match and SearchAttempt >= 3:
   - Save the lowest reliable price found.
   - ResultType = BEST_PROPOSAL
9. If no reliable candidate exists:
   - ResultType = NOT_FOUND

## n8n Compatibility

- Keep JSON valid.
- Do not return undefined values.
- Use null or empty string when needed.
- Avoid changing existing node names unless requested.
- Return complete replacement code when modifying Code nodes.
- Explain changes before applying them.
