# Reliable Notion article refresh

This change extends the collaborator's PR #32 (`b075d7e`), preserving its 60-second cache settings and refreshed Git snapshot. That release fixed cold starts, but still returned stale content during expiry refresh. A delayed-source regression test confirms the renderer could finish before the Notion refresh completed, allowing stale HTML to be cached again and serverless background work to be suspended.

Await one shared refresh on cold starts and cache expiry. Retain the last successful live snapshot on errors (Git backup on a cold-start error), and allow retries after one minute. Remove module-import background warm-up. This trades slower cold or expired renders for reliable updates; warm requests remain cached. No cron job, webhook secret, or additional service is needed.

The friend's Git snapshot and Notion publication rules remain unchanged. Successful refreshes replace the whole snapshot, so withdrawn articles are not merged back from the backup. During an outage the last available snapshot can still contain previously published content; this is availability fallback, not a guarantee of immediate withdrawal.

Validation: all 31 tests and targeted lint pass. Production build with the configured Notion connection succeeds, including both spiritual articles in both languages; it reports existing social-image metadata warnings. Regression tests cover new articles, edited title/body, withdrawal, delayed/concurrent refreshes, outages and recovery. GitHub Actions now runs tests on PRs and main pushes without secrets. Live Notion content was not edited for testing.

Deploy through the existing GitHub/Vercel integration and check the live list/detail routes. Rollback is a revert of the repair commits; no data migration or credential changes are required. Editorial instructions and expected update timing are in README.md.

## 2026-10-03 security correction

Public queries now require Published for every collection, including EventReg and Featured events. Keep the homepage featured and timeline selectors after that publication boundary. Check returned page status and archive flags before mapping as defense in depth.

When a parent is withdrawn, exclude dependent roles/media before parsing their fields; remove optional event term/series links and article event links to unavailable parents. Keep snapshot validation strict. Each completed source query records its allowed IDs (people also require consent). If a later query, Markdown retrieval or validation fails, apply those known restrictions to both live-cache and Git fallback copies before serving them. Subsequent outages retain this restricted copy. A total outage before the relevant query completes, a fresh process without knowledge of the revocation, and existing page/cache TTLs still prevent an immediate-withdrawal guarantee. No new service or data migration is introduced.

Logout controls now retain identity and report failure when Supabase returns or throws an error. Remove the nonfunctional Remember Me checkbox without changing persistence. Registration keeps confirmed identical submissions for the mounted form so a failed account-creation retry does not resend them; retain actionable provider errors. Notion schema fallbacks run only after explicit validation rejection and automatic write retries are disabled. Cross-reload/concurrent-client exactly-once registration remains outside this in-memory fix and requires durable idempotency storage.

Regression tests cover Published/Status select variants, draft EventReg/Featured records, consent and parent withdrawal, partially failed refreshes against warm/cold fallback, logout failures/success, registration retries and safe schema fallback. Use synthetic fixtures; never modify real consent or submit real registrations to test these cases.
