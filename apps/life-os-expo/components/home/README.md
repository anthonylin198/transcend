# Home Feature Overview

This folder contains Home-specific UI and hooks.

## App entry and auth routing

The app flow starts in `app/_layout.tsx`.

- `useAuthBootstrap()` is called inside `AppRouter`.
- `useAuthBootstrap()` combines Convex auth state + `api.home.bootstrap`.
- While auth/bootstrap/fonts are loading, `AppRouter` renders `null`, so the splash screen stays visible.
- `useAuthBootstrap` is part of that gate: until bootstrap is ready, routing does not render.
- Once ready:
  - unauthenticated users are routed to `(public)`
  - authenticated users are routed to `(authenticated)`

In short: `app/_layout.tsx` is the gatekeeper for auth state and decides which route tree the user can access.

## Authenticated tab flow

Inside `app/(authenticated)/(tabs)/_layout.tsx`, the tab shell is rendered and `index` is the Home tab.

`app/(authenticated)/(tabs)/index.tsx` currently:

- fetches `api.home.bootstrap` for profile-derived flags (for example, `calendarSyncEnabled`)
- builds pager days (`-7` to `+7`) around today
- fetches calendar data on the client via `useCalendarEvents` (Home-specific hook)
- passes day-specific calendar events into `CalendarSection`

## Calendar data strategy (current)

Calendar fetching is intentionally top-level in Home (not inside `CalendarSection`):

- `useCalendarEvents` fetches one visible date range up front
- events are normalized and grouped by day key
- each pager page receives pre-grouped events for its date

This keeps day swipes lightweight (render-only) instead of refetching on each page change.
