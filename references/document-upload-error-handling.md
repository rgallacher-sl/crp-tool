# Document Upload — Error Handling & Protections

Source: dev spike "File Upload Protections & Error Handling"
Captured: 2026-03-25

> Messages in this document are developer-defined technical placeholders. Final user-facing copy is to be defined by UCD using these failure scenarios as input.

---

## 4xx — Client/validation errors (do not retry)

| Failure | Status | Dev message (not final copy) |
|---|---|---|
| No file and no link provided | 400 | "Provide a PDF link or upload a PDF file." |
| Both file and link provided | 400 | "Use either link or file, not both." |
| Unknown supplierId | 400 | "Unknown supplierId provided." |
| Empty file | 400 | "PDF is empty." |
| Invalid URL scheme or malformed URL | 400 | "Provide a valid http(s) PDF link." |
| File type is not a PDF | 415 | "Only PDF files are supported." |
| URL resolves to a non-PDF | 415 | "The supplied link does not point to a PDF." |
| File exceeds 10MB | 413 | "PDF must be less than 10MB." |
| Unauthenticated request | 401 | Standard challenge response |
| Authorised user without upload permission | 403 | "You do not have permission to upload files." |

## 5xx — Upstream errors (retry eligible)

| Failure | Status | Retry policy | Dev message (not final copy) |
|---|---|---|---|
| Remote URL server returns 5xx or times out | 502/504 | No server retry; surface immediately | "Could not download PDF from the supplied link." |
| Blob storage transient failure (408/429/5xx) | 503 | 3 attempts, exponential backoff with jitter (~250ms, 1s, 3s) | "Storage temporarily unavailable, please try again." |
| Cosmos DB transient failure (429/5xx) | 503 | 3 attempts, exponential backoff with jitter | "Temporary persistence error, please try again." |
| Blob written but Cosmos create fails | 503 | No immediate client retry; log for reconciliation | "Upload could not be finalised, please try again." |
| Unhandled / unexpected exception | 500 | No | "An unexpected error occurred." + traceId |

---

## Design implications

### Upload screen (provide-crp)

Most 4xx errors can be caught client-side before submission:
- Empty file, wrong type, over 10MB, malformed URL — already handled as per-row errors
- **Both file and link provided (400)** — currently the UI allows mixing; the backend rejects this combination. Needs a product/UCD decision: enforce one-or-the-other in the UI, or handle the 400 response gracefully.
- **Unknown supplierId (400)** — supplierId not currently visible in the UI; likely passed implicitly from context. Needs clarification before API integration.
- 401/403 — auth concern, separate from upload state design.

### Processing screen

5xx errors and URL-resolution errors (URL resolves to non-PDF, 502/504) only surface after submission, so they land on the processing screen:
- Per-assessment error state with appropriate message
- Retryable errors (503) should offer a retry action
- 500 errors should surface the traceId for support reference

### File type protections (noted from spike)

Backend validates three signals: file extension, MIME/content-type, and PDF magic bytes (`%PDF-`). Client-side currently checks extension and MIME only — a renamed `.exe` with spoofed MIME passes client-side but is caught server-side, returning a 415. Consider adding a client-side magic bytes check to catch this earlier.

Filename sanitisation (stripping path traversal characters) is handled server-side but should also be applied to the display name client-side.
