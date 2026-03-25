# Document Upload — Deduplication

Status: parked / not yet actioned
Last discussed: 2026-03-25

## Context

The upload screen allows assessors to upload company CRP documents (PDFs) for processing. Each upload triggers extraction and creates an assessment record.

The question explored: what value is there in storing two identical PDFs?

## Conclusion

Storing duplicate bytes has no value. If the same file is uploaded twice (identical bytes), we would:
- Store redundant data
- Run extraction twice to get the same result
- Potentially create two indistinguishable assessment records

**Two assessments for the same company is valid** (typically for different tenders or different PDF documents). The problem is specifically identical bytes being processed more than once.

## Where detection should live

Client-side duplicate detection (filename, hash) solves the wrong problem at the wrong layer. The right place is the **backend at upload time**:

1. Hash incoming bytes on receipt
2. Check against stored hashes
3. If already processed, return the existing extraction result rather than re-running

This is a backend deduplication / caching concern, not a UI state problem.

## UI implications

The upload screen needs a state for "server returned an existing result" — but only if we decide to surface that distinction to the user. We might silently reuse the existing result instead.

**Client-side: still worth a cheap filename + size check** to catch the obvious case of a user accidentally adding the same file twice in one session. No hash needed for this.

## Open questions

- Does the backend want to expose "this document was already processed" to the UI, or handle silently?
- If surfaced: what does the user need to decide? (Probably nothing — reuse the existing result automatically.)

## What this is not

This is not a "same company, two assessments" problem. That is a valid and expected state. The concern is only identical PDF bytes.
