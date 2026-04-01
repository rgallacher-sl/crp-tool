# Connectivity Spectrum UX

**Source:** [Connect, No Matter the Speed — Google Design](https://medium.com/google-design/connect-no-matter-the-speed-3b81cfd3355a)

## Why this matters

Default design instinct treats connectivity as binary (online / offline). This article establishes it as a spectrum — and the UX implications differ at each point. Use this when designing any state that involves data loading, submission, or sync.

## The spectrum

| State | Characteristic |
|-------|---------------|
| Fast (4G/WiFi) | Normal experience |
| Slow (2G/3G) | Perceived latency, images stall |
| "Lie-fi" | Signal icon shows connected but requests time out or stall silently |
| Intermittent | Drops in and out — tasks may start online and fail mid-flight |
| Offline | No connectivity at all |

**"Lie-fi"** is the hardest state to design for: the user believes they are connected, so a blank screen or spinner with no timeout feedback is especially damaging to trust.

## Core principles

1. Never freeze or show a blank screen — always communicate what is happening
2. Serve something at every connectivity level; degrade gracefully rather than blocking entirely

## Patterns

**Progressive loading**
- Load text before images; low-res/skeleton placeholders before full-resolution
- Priority-based loading: essential content first, supplementary content when bandwidth allows
- Show mock/skeleton content during onboarding to set expectations

**Status indicators**
- Combine determinate progress (percentage) with indeterminate spinners where appropriate
- Surface connectivity status explicitly in the UI — don't rely on OS-level indicators alone
- Badge elements to show sync state: "waiting to sync" vs "synced"

**Graceful degradation**
- Offer lower-fidelity alternatives (audio-only, reduced resolution, cached version)
- Disable actions that will fail rather than letting them fail silently
- Do not offer "Try again" if you can detect the operation will fail (aligns with Material Design offline states guidance)

**Task queuing**
- Allow non-urgent tasks (searches, uploads) to complete in the background when connectivity returns
- Notify the user when a deferred task completes

## Real-world examples cited

Google Lens, YouTube (adaptive bitrate), Google Duo (audio-only fallback), Google Pay India — all demonstrate skeleton loaders, priority-based loading, and in-app status messaging.

## Related references

- [Material Design 2 — Offline states](https://m2.material.io/design/communication/offline-states.html) — named component-level patterns for the fully offline case
- [GOV.UK — Service unavailable pages](https://design-system.service.gov.uk/patterns/service-unavailable-pages/) — server-side unavailability pattern
- [GOV.UK — Problem with the service](https://design-system.service.gov.uk/patterns/problem-with-the-service-pages/) — unexpected outage pattern
