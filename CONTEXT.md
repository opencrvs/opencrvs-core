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
