# Connectivity Loss UX — Playbook

**Scenario:** User loses internet connection mid-task (e.g. mid-processing, mid-submission).

---

## Pattern: Two-phase escalation

Do not jump immediately to a hard error. Momentary drops are common (VPN reconnects, mobile networks). A grace period avoids alarming the user unnecessarily.

| Phase | Trigger | Component | Icon | Copy |
|---|---|---|---|---|
| 1 — Reconnecting | Connection lost | Slim top banner | `wifi_find` | "Reconnecting…" |
| 2 — No internet | ~5s without recovery | Same banner, escalated | `wifi_off` + `error` | "No internet connection. Check your connection." + Retry |
| Recovery | Connection restored | Auto-dismiss banner | — | "Back online" (brief, then dismiss) |

---

## Component: banner, not toast

Use a persistent inline banner (top of page). Do not use a toast.

- Toasts auto-dismiss — wrong when the problem has not resolved
- This state is blocking: the user cannot proceed until connectivity returns
- Banner stays until the state changes (recovery or user retries)
- Non-dismissible while offline; auto-dismisses on recovery

Maps to Carbon `ActionableNotification` (phase 2: persistent + Retry CTA) and Carbon `InlineNotification` (phase 1: no action needed yet).

---

## Icons

| Phase | Icon | Rationale |
|---|---|---|
| Reconnecting | `wifi_find` | Communicates the process is stalled waiting on connectivity — not syncing, not a generic spinner |
| No internet | `wifi_off` | Client-side drop — clearest signal for connectivity loss |
| No internet | `error` (alongside `wifi_off`) | Blocking state — `warning` implies optional attention, `error` implies cannot proceed |

**Do not use `cloud_off`** — that implies a server-side or service outage, not a client connectivity drop. It would mislead the user into thinking the problem is on your end.

---

## Copy principles

From GOV.UK's service patterns: be explicit about whose end the problem is on.

- Client connectivity drop → "No internet connection" (their end)
- Service outage → "Sorry, there is a problem with the service" (your end)

Never conflate the two. A procurement officer mid-task needs to know immediately whether to check their own connection or wait for the service to recover.

---

## Accessibility

- Icon must never be the sole indicator — always pair with text (WCAG 2.2 AA, colour-alone rule)
- Banner must not steal focus on appearance (Carbon inline notifications don't grab focus by design)
- `error` state should use `role="alert"` or `aria-live="assertive"` so screen readers announce it immediately
- `sync` / reconnecting state can use `aria-live="polite"` — lower urgency

---

## Sources

- [Connect, No Matter the Speed — Google Design](https://medium.com/google-design/connect-no-matter-the-speed-3b81cfd3355a) — spectrum model, lie-fi, grace period rationale
- [Material Design 2 — Offline states](https://m2.material.io/design/communication/offline-states.html) — `wifi_off`/`cloud_off` distinction, don't offer retry if failure is detectable
- [Carbon — Notifications](https://carbondesignsystem.com/components/notification/usage/) — toast vs inline vs actionable, `kind="error"` for blocking states
- [GOV.UK — Problem with the service](https://design-system.service.gov.uk/patterns/problem-with-the-service-pages/) — copy framing: their end vs your end
- Full research notes: [references/connectivity-spectrum-ux.md](../../references/connectivity-spectrum-ux.md)
