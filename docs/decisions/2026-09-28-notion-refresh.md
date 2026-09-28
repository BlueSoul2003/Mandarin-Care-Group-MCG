# Reliable Notion article refresh

This change extends the collaborator's PR #32 (`b075d7e`), preserving its 60-second cache settings and refreshed Git snapshot. That release fixed cold starts, but still returned stale content during expiry refresh. A delayed-source regression test confirms the renderer could finish before the Notion refresh completed, allowing stale HTML to be cached again and serverless background work to be suspended.

Await one shared refresh on cold starts and cache expiry. Retain the last successful live snapshot on errors (Git backup on a cold-start error), and allow retries after one minute. Remove module-import background warm-up. This trades slower cold or expired renders for reliable updates; warm requests remain cached. No cron job, webhook secret, or additional service is needed.

The friend's Git snapshot and Notion publication rules remain unchanged. Successful refreshes replace the whole snapshot, so withdrawn articles are not merged back from the backup. During an outage the last available snapshot can still contain previously published content; this is availability fallback, not a guarantee of immediate withdrawal.

Validation: all 31 tests and targeted lint pass. Production build with the configured Notion connection succeeds, including both spiritual articles in both languages; it reports existing social-image metadata warnings. Regression tests cover new articles, edited title/body, withdrawal, delayed/concurrent refreshes, outages and recovery. GitHub Actions now runs tests on PRs and main pushes without secrets. Live Notion content was not edited for testing.

Deploy through the existing GitHub/Vercel integration and check the live list/detail routes. Rollback is a revert of the repair commits; no data migration or credential changes are required. Editorial instructions and expected update timing are in README.md.
