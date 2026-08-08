# OpenCRVS Core

Civil registration and vital statistics (CRVS) platform: records of vital events (births, deaths, marriages) registered against a versioned administrative hierarchy of locations.

## Language

### Location versioning

**Anchor date**:
The date at which a location reference is resolved to a version: the date of the fact the location describes. For a record's declaration fields that is the record's anchor — its date of event, falling back to the record's creation date when the date-of-event field is empty (same convention as `resolveDateOfEvent`). For action metadata (declared-at / registered-at office) it is that action's own date.
_Avoid_: as-of date, effective date (that's the version's own `effectiveFrom`)

**Version**:
One element of a location's history, carrying the name, status, and external id valid from its `effectiveFrom` (a plain date). A version's end is the next element's `effectiveFrom`; there is no effective-until.

**History**:
A location's ordered versions as a whole — the complete timeline of its name, status and external id. The country config declares it at seeding; after that it grows one version at a time through individual edits.
_Avoid_: version history, pre-built history, timeline, audit trail

**Identity row**:
The permanent, unversioned part of a location or administrative area: its UUID, its parent reference, and its location type. Records reference identity, never versions; the parent chain is fixed for life in 2.1.

**Withdrawal**:
Removing a not-yet-effective version from a history, so it never takes effect. Distinct from inactivation, which is a version whose status is `inactive` — an inactivated location stays on the timeline. A version whose `effectiveFrom` has passed cannot be withdrawn.
_Avoid_: deletion, cancellation, revocation

### Seeding

**Seeding**:
Establishing a system's starting state from the country config's seed-data, during system initialisation only — both the administrative hierarchy and the initial users. Refused once initialisation is marked complete.
_Avoid_: importing, re-seeding (nothing seeds a live system; later changes are edits)

**Seed-data**:
What the country config states the seeded state should be, served over HTTP for the seed to consume. The authority on which offices and roles exist, ahead of anything being written.
_Avoid_: declaration (that is a submitted record of a vital event, an unrelated concept), source data, fixtures

**Pre-flight validation**:
Checking a whole set of seed-data for validity before any part of it is written, so that rejected seed-data leaves no trace. Distinct from the per-record validation the write path performs on each individual create, which pre-flight validation reduces to a safety net rather than replaces.
_Avoid_: pre-seed validation, dry run (nothing is written even provisionally), verification

**Initial user**:
One of the users a seed creates, described by one record of the seed-data. Has no creator among the users — the seed brings the first ones into being — which is why username collisions matter differently here than for a user created by an administrator.
_Avoid_: employee, seeded user, default user

### Local environments

**Environment**:
An isolated instance of the OpenCRVS stack running on a developer machine — its own set of host node processes plus a logical slice of the shared dependencies. Identified by a `name`.
_Avoid_: instance, stack (when you mean a single isolated env)

**Name**:
The identifier for an environment, derived from the git worktree directory basename (sanitized, `-` → `_`). Keys all per-environment data — database name, Elasticsearch index prefix, MinIO bucket.

**Slot**:
A small integer (0–5) assigned to an environment by the registry. Determines the host port block (`base + slot * 10000`) and the Redis logical DB index. Slot 0 is the primary worktree and matches historical single-environment ports.

**Primary worktree**:
The main (non-linked) git checkout. Always maps to slot 0, preserving the original `pnpm dev` behaviour and data.

**Registry**:
The machine-level file (`~/.local/state/opencrvs/envs.json`) mapping each environment `name` to its `slot`.

**Dependency singleton**:
The single shared set of backing services (Postgres, Elasticsearch, Redis, MinIO) that all local environments share, run under docker compose project `opencrvs-deps`. Contrast with the per-environment node processes.
_Avoid_: deps stack, backend services

### Auditing

**Client**:
Whoever performed an audited operation — either a user or a system client. The two kinds share one identifier space, distinguished by client type.
_Avoid_: actor, caller, subject (the subject is who it was done _to_)

**Subject**:
The user an operation was performed upon, when that differs from the client who performed it. A deactivation has an administrator as its client and the deactivated user as its subject.
_Avoid_: target, actor, client

**System client**:
A non-human client: the credential an integration authenticates with, holding its own scopes. Has no office and no place in the administrative hierarchy, so it is national in reach and cannot be filtered by jurisdiction.
_Avoid_: system, integration (that is the configured relationship, not the credential), API key, service account

**Integration**:
The configured relationship with an external system — the arrangement an administrator sets up and names. Its credential is a system client, one per integration, which is why the API surface says integration where the data model says client.
_Avoid_: system, connection, third party

**Audit entry**:
One immutable record of a single operation by one client: what was called, the request data, a curated summary of the response, and when. The summary is deliberately not the raw response payload.
_Avoid_: audit log (that is the whole collection), history, trail
