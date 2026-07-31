# A repeated seed replaces a location's history rather than merging into it

Seeding is only reachable while system initialisation is incomplete, so a location's history at that point has exactly one author: the country config. A repeated seed — the case that matters is re-running an initialisation that died partway — therefore replaces each location's history outright with what the config declares, instead of merging into what a previous attempt wrote.

## Consequences

- Re-running a failed initialisation is safe and complete: rows the previous attempt already inserted pick up the config's declared history rather than keeping the single default version they were created with.
- The replace is only sound because of the initialisation gate. If seeding ever becomes reachable on a live system, this becomes a data-loss path — it would discard every version added since, with no audit entry, while the audit log still asserts those versions were created.
- Seeding and withdrawal are asymmetric, and deliberately so. Withdrawal refuses to remove a version whose `effectiveFrom` has passed and writes an audit entry; a repeated seed rewrites effective versions and writes none. Reading either path in isolation makes the other look like a bug.
