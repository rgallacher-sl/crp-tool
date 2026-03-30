---
name: performance-optimization
description: Use when performance requirements exist, when you suspect performance regressions, or when Core Web Vitals or load times need improvement.
metadata:
  source: original
---

# Performance Optimization

## Overview

Measure before optimizing. Performance work without measurement is guessing. Profile first, identify the actual bottleneck, fix it, measure again. Optimize only what measurements prove matters.

## When to Use

- Performance requirements exist in the spec
- Users or monitoring report slow behavior
- Core Web Vitals scores are below thresholds
- You suspect a change introduced a regression
- Building features that handle large datasets or high traffic

**When NOT to use:** Don't optimize before you have evidence of a problem.

## Core Web Vitals Targets

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP | ≤ 2.5s | ≤ 4.0s | > 4.0s |
| INP | ≤ 200ms | ≤ 500ms | > 500ms |
| CLS | ≤ 0.1 | ≤ 0.25 | > 0.25 |

## Performance Budget

| Resource | Budget |
|----------|--------|
| JavaScript bundle (gzipped, initial load) | < 200 KB |
| CSS (gzipped) | < 50 KB |
| Images (above fold) | < 200 KB per image |
| Fonts | < 100 KB total |
| API response time | < 200ms (p95) |
| Time to Interactive | < 3.5s on 4G |
| Lighthouse Performance score | ≥ 90 |

## The Optimization Workflow

1. MEASURE — Establish baseline with real data
2. IDENTIFY — Find the actual bottleneck (not assumed)
3. FIX — Address the specific bottleneck
4. VERIFY — Measure again, confirm improvement
5. GUARD — Add monitoring or tests to prevent regression

## Identify the Bottleneck

**Frontend:**

| Symptom | Likely Cause | Investigation |
|---------|-------------|---------------|
| Slow LCP | Large images, render-blocking resources, slow server | Check network waterfall, image sizes |
| High CLS | Images without dimensions, late-loading content, font shifts | Check layout shift attribution |
| Poor INP | Heavy JavaScript on main thread, large DOM updates | Check long tasks in Performance trace |
| Slow initial load | Large bundle, many network requests | Check bundle size, code splitting |

**Backend:**

| Symptom | Likely Cause | Investigation |
|---------|-------------|---------------|
| Slow API responses | N+1 queries, missing indexes | Check database query log |
| Memory growth | Leaked references, unbounded caches | Heap snapshot analysis |
| CPU spikes | Synchronous heavy computation | CPU profiling |
| High latency | Missing caching, redundant computation | Trace requests through the stack |

## Red Flags

- Optimization without profiling data to justify it
- N+1 query patterns in data fetching
- List endpoints without pagination
- Images without dimensions, lazy loading, or responsive sizes
- Bundle size growing without review
- No performance monitoring in production
- React.memo and useMemo everywhere (overusing is as bad as underusing)

## Verification

- [ ] Before and after measurements exist (specific numbers)
- [ ] The specific bottleneck is identified and addressed
- [ ] Core Web Vitals are within "Good" thresholds
- [ ] Bundle size hasn't increased significantly
- [ ] No N+1 queries in new data fetching code
- [ ] Existing tests still pass
