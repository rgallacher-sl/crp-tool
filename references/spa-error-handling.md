---
name: spa-error-handling
description: How SPA (Angular) error handling differs from traditional server-rendered apps — informs error UI design decisions
type: reference
---

# SPA vs Traditional: Error Handling and Error UI Patterns

## Key difference: page navigation

In a traditional server-rendered app, form submission causes a full page navigation (HTTP POST). If the server returns a 5xx, the browser has already left the original page — form data is gone and the server must render a new error page.

In a SPA (Angular), form submission is a background HTTP request. The browser never navigates. Whether the request succeeds or fails, the component stays alive and form values remain intact.

## Implications for error UI

| Scenario | Traditional | Angular (SPA) |
|---|---|---|
| 5xx on submit | Must show a new error page — original page is gone | Stay on the page, inject an inline error — form data is still there |
| User retry | User must navigate back and re-enter data | User just resubmits — no data loss |
| 500 on page load | Server renders an error page in place of the content | Angular is already running — catch the failed `ngOnInit` call and render an error state in the component |

## Design consequence

- **Angular**: a banner/inline notification on the form is the right pattern for 5xx on submit. The form context is still present.
- **Traditional**: a dedicated error page is unavoidable for 5xx on submit because the page is already gone.
- **Both**: a dedicated error page is needed for 5xx on initial load, because there is no content to display in either case.
