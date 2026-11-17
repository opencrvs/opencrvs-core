# A repeated seed replaces a location's history rather than merging into it

Seeding is only reachable while system initialisation is incomplete, so a location's history at that point has exactly one author: the country config. Re-applying seed-data therefore replaces each location's history outright with what that seed-data declares, instead of merging into what a previous attempt wrote. The replace is a property of the storage upsert, reached when seed-data arrives carrying ids that already exist — not something the seed job triggers by being run a second time.

## Consequences

- Re-running a failed initialisation requires clearing the seeded data first; the replace does not rescue it. The seed job mints fresh UUIDs for identity rows on every run, so a second run's rows never conflict on `id` and instead violate the `external_id` unique constraint. The replace applies only where a caller re-applies seed-data with stable ids.
- The decision stands, but no path through the seed job currently triggers it. Only direct calls supplying stable ids reach the replace, which is what the tests exercise (`initialisation/initialisation.locations.set.test.ts`).
- The replace is only sound because of the initialisation gate. If seeding ever becomes reachable on a live system, this becomes a data-loss path — it would discard every version added since, with no audit entry, while the audit log still asserts those versions were created.
- Seeding and withdrawal are asymmetric, and deliberately so. Withdrawal refuses to remove a version whose `effectiveFrom` has passed and writes an audit entry; a repeated seed rewrites effective versions and writes none. Reading either path in isolation makes the other look like a bug.
