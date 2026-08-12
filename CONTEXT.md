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

**Seeding**:
Establishing the administrative hierarchy from the country config's declaration, during system initialisation only. Retryable while initialisation is incomplete — a repeated seed is authoritative and replaces what the previous attempt wrote — and refused once initialisation is marked complete.
_Avoid_: importing, re-seeding (nothing seeds a live system; later changes are edits)

**Withdrawal**:
Removing a not-yet-effective version from a history, so it never takes effect. Distinct from inactivation, which is a version whose status is `inactive` — an inactivated location stays on the timeline. A version whose `effectiveFrom` has passed cannot be withdrawn.
_Avoid_: deletion, cancellation, revocation

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
