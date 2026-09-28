# Reliable Notion article refresh

Status: unpublished local repair. During investigation, the collaborator merged PR #32 as `b075d7e`. Its Vercel deployment succeeds and the new prayer is visible. It fixes awaited cold starts and uses a 60-second TTL, but leaves expiry refresh unawaited. Greg requested review of that work; this branch was not pushed or deployed and must be reconciled with PR #32 before use. All 29 local tests and targeted lint passed; production-mode build was not run.

The published `prayer-for-study` article is readable and valid in Notion, but production only displays `prayer-before-meals`. The production source at `8dd634e` returns the Git snapshot on cold starts and stale data after expiry, starting an unawaited Notion refresh. Vercel may suspend that work after the response; a route render can also cache the stale result again.

Await one shared refresh on cold starts and cache expiry. Keep the existing five-minute in-process cache and route revalidation, retain the last successful live snapshot on errors (Git backup on a cold-start error), and allow retries after one minute. Remove module-import background warm-up. This trades slower cold renders for reliable updates; warm requests remain cached. Do not add a cron job, webhook secret, or new service.

The existing Git snapshot deliberately stays unchanged so verification cannot pass merely by baking the missing prayer into the deployment. Notion publication rules and unpublished drafts remain unchanged.

Validation: regression tests reproduce cold-start, stale-render and recovery failures before the fix, then pass afterward; check a production-mode build against live Notion and verify the prayer list and detail page in the browser. Deploy through the existing GitHub/Vercel integration. Rollback is a revert of the repair commit; no content migration or credential changes are required.
