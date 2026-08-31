# Changelog

## 2.1.0 Release Candidate

### Upgrade guidance

#### MongoDB fully removed — countries upgrading from 1.9.x must go through v2.0.0

**Upgrading from v2.0.0 → 2.1.0: nothing to do.** Your data was already migrated from MongoDB to PostgreSQL during the v2.0.0 upgrade, and this release simply deletes the now-unused MongoDB code.

**Upgrading from 1.9.x: you cannot skip straight to 2.1.0.** You must first upgrade to **v2.0.0**, which performs the one-time migration of MongoDB collections into PostgreSQL, and only then upgrade to 2.1.0. This release deletes the migration tooling (the legacy-data migration, its `mongo_fdw` SQL, and the `data-migration-legacy` Helm job/dependency chart/Swarm compose service), so v2.0.0 is the only release that can migrate your data.

How the migration runs during the v2.0.0 upgrade:

- **Helm/Kubernetes deployments**: automatically, as a `pre-install,pre-upgrade` hook (`data_migration_legacy.enabled: true` by default) on `helm upgrade`. If you disabled `data_migration_legacy`, re-enable it while on v2.0.0 before going to 2.1.0.
- **Docker Swarm deployments** (Countryconfig/Farajaland `docker-compose.deploy.yml`): also automatically — `deploy.sh` runs `docker stack deploy --prune -c ...`, which creates and runs the `legacy-data-migration` service the first time you deploy v2.0.0. If that service was pruned/removed before it ran, restore it from the v2.0.0 tag and run it manually while still on v2.0.0.

### Breaking changes

#### Registration confirmation no longer uses OAuth token exchange

The `/token` OAuth **token-exchange** grant (`urn:opencrvs:oauth:grant-type:token-exchange`) has been removed, along with the `record.confirm-registration` and `record.reject-registration` scopes it minted. Any authenticated user could exchange their token for a confirmation token targeting an arbitrary event/action, so a low-privilege user (e.g. a field agent) could drive the registration confirm/reject flow on records they should not control.

Confirming an asynchronous action (the `accept`/`reject` endpoints) now requires the **same scope as the action being confirmed** — e.g. `record.register` for a registration — checked with the same event-access rules as requesting the action. There is no separate confirmation scope.

Integrations that confirm registrations (e.g. MOSIP) must therefore:

- **be issued an OpenCRVS system client that holds the action's scope** (e.g. `record.register`) on the Integrations page, and authenticate the callback with their own `client_credentials` token — they no longer exchange the token issued at registration time;
- **include `eventId` in the MOSIP interop payload** (`MosipInteropPayloadSchema`). It previously travelled inside the exchanged token; countryconfig must now populate it when calling `mosip-api`'s `/events/registration`.

`mosip-api` now **requires `OPENCRVS_CLIENT_ID` and `OPENCRVS_CLIENT_SECRET`** and fails fast on startup (exit code 1) if the system client cannot authenticate or is missing `record.register`. It no longer stores confirmation tokens in its SQLite database (only the `eventId` ↔ MOSIP transaction correlation); the legacy `token` column is migrated automatically on first start.

The auth env var `CONFIG_ACTION_CONFIRMATION_TOKEN_EXPIRY_SECONDS` is removed.

#### `validUntil` removed from location APIs

The `Location` and `AdministrativeArea` wire models no longer include `validUntil`. Active/inactive state is now carried by each entity's `versions[]` array (see location versioning, [#6691](https://github.com/opencrvs/opencrvs-core/issues/6691)) and the resolved top-level `status` field. Consumers that read `validUntil` should derive end-of-validity from the `effectiveFrom` of the next version element instead.

#### `POST /locations` / `POST /administrative-areas` no longer upsert

In 2.0.1, `POST /locations` and `POST /administrative-areas` upserted a record by id — creating it if new, or overwriting its fields if it already existed. In 2.1.0 these same routes are create-only: posting an id that already exists with different values now returns a `CONFLICT` error instead of overwriting it. Updating an existing location or administrative area requires the new `PUT /locations/{id}` / `PUT /administrative-areas/{id}` endpoints, which append a version rather than overwrite in place. Integrators using the 2.0.1 upsert endpoint to update existing records must switch to `PUT`.

#### MongoDB removed

MongoDB, the `mongodb`/`mongoose` dependencies, the MongoDB Helm resources and dependency chart, and all MongoDB references in compose files, dev scripts, and CI have been removed. See "Upgrade guidance" above for the required upgrade path.

#### InfluxDB removed

InfluxDB, the InfluxDB Helm resources (StatefulSet, backup/restore/cleanup jobs), Docker services, and the one-time user-audit InfluxDB→Postgres migration have all been removed. No replacement is needed.

#### `ARCHIVE` no longer clears the `INCOMPLETE` flag

Archiving a NOTIFIED (incomplete) record used to clear `InherentFlags.INCOMPLETE` as a side effect. Since `UNARCHIVE` restores the record to its pre-archive status without amending flags, `ARCHIVE` is now consistent with it by default: the flag freezes across an archive/unarchive round trip and comes back exactly as it was. Country configs can still add/remove flags on either action explicitly via configuration. [#12782](https://github.com/opencrvs/opencrvs-core/issues/12782)

#### `/auth/verifyUser` no longer reveals account existence; `/auth/verifyNumber` removed

`POST /auth/verifyUser` was an unauthenticated account-enumeration oracle: `401` for an unknown email/mobile, `200` for a known one, and on the username-reminder flow it returned the user's security-question key with no proof the caller controlled the mailbox. It now always returns an empty `200` and, only when the identifier matches an account, emails or texts a time-limited, single-use recovery link instead of any account data.

- **Country configs must add two new notification templates, `password-reset-link` and `username-reminder-link`, before upgrading.** Without them the recovery notification cannot be sent, so account recovery fails closed for every user.
- **`POST /auth/verifyNumber` has been removed**, together with its gateway route. A client running a login bundle built before this release posts to a route that no longer exists and loses account recovery until it updates.
- **Recovery links are built from each country config's `LOGIN_URL`.** If that value is wrong for an environment, every recovery link emailed or texted in that environment 404s when clicked.
- **Operators may want to drop stale `retrieval_step_*` Redis keys at deploy.** Records written by the pre-branch flow used `redis.set` with no expiry at all, so any left over from before this upgrade persist indefinitely rather than aging out with a TTL. They are rejected on use regardless (a legacy record has no `retrieveFlow`), so this is hygiene rather than a required step.

[#12861](https://github.com/opencrvs/opencrvs-core/issues/12861)

#### The MOSIP integration now ships with core

The MOSIP integration used to be released from its own `opencrvs/mosip` repository, on its own schedule. It now lives in core as `packages/mosip-api`, `packages/mosip`, `packages/mosip-mock` and `packages/esignet-mock`, and is released with every core release. This removes a circular release dependency: the integration was pinned to an `@opencrvs/toolkit` release candidate published by core, while core's reference country config depended on `@opencrvs/mosip` from npm.

**The `opencrvs/mosip` repository is archived.** Open issues and pull requests should move to `opencrvs/opencrvs-core`.

For the integration's own release history prior to this move, see [`packages/mosip-api/CHANGELOG.md`](https://github.com/opencrvs/opencrvs-core/blob/develop/packages/mosip-api/CHANGELOG.md).

#### Backup/restore host moved out of the SSH secret into a plain variable

`BACKUP_HOST` / `PGBACKREST_REPO1_HOST` for the minio and postgres backup/restore charts used to be read from the `host` key of the backup-server SSH credentials secret. Since a hostname isn't sensitive, it's now read from `.Values.backup.host` / `.Values.restore.host` instead, populated from the `BACKUP_HOST` / `RESTORE_HOST` GitHub environment variables.

- **Restore fails if `RESTORE_HOST` is not defined.** Environments that had restore configured before this change carried the host inside the SSH secret; on upgrade, if `RESTORE_HOST` isn't set the restore job has no host to connect to.
- **Operators must run `yarn environment:init` for every environment that uses backup or restore (e.g. staging)** before deploying this change, so `BACKUP_HOST`/`RESTORE_HOST` get populated as GitHub environment variables.

[#13502](https://github.com/opencrvs/opencrvs-core/pull/13502)

### Deprecations

#### `POST /auth/token` parameters in the query string

The token endpoint reads its parameters from the request body _or_ the URL. Sending them in the URL puts the client secret into gateway and proxy access logs, Sentry breadcrumbs, and every intermediary on the way (CWE-598). RFC 6749 §2.3.1 requires them in the body, and **a future release will read them only from there** — so integrations still authenticating via the URL should move now. This affects both grants: `client_credentials` (`client_id`, `client_secret`) and `urn:opencrvs:oauth:grant-type:token-exchange` (`subject_token`, `subject_token_type`, `requested_token_type`, `event_id`, `action_id`).

```diff
-curl -X POST '<gateway>/auth/token?client_id=...&client_secret=...&grant_type=client_credentials'
+curl -X POST '<gateway>/auth/token' \
+  -H 'Content-Type: application/x-www-form-urlencoded' \
+  -d 'client_id=...&client_secret=...&grant_type=client_credentials'
```

Client IDs and secrets themselves keep working — only how they are transmitted changes.

Until the removal, behaviour depends on the environment, so the change surfaces in development rather than in production:

- **Production (`NODE_ENV=production`) keeps working**, but each such request logs an error naming the parameters, so operators can find the callers left to migrate. **Rotate any secret sent this way** — it may still be in retained logs.
- **Every other deployment rejects the request** with `400 invalid_request` naming the parameters to move, so integrations testing against dev or staging fail immediately.

### Improvements

- User avatars are now drawn by OpenCRVS itself rather than fetched from the third-party service `ui-avatars.com`. Previously each avatar sent the user's full name to that service and showed nothing at all offline; initials are now rendered locally, so avatars work offline and no user's name leaves the country's deployment [#3769](https://github.com/opencrvs/opencrvs-core/issues/3769)
- Private docker image registry support for Dependencies helm chart [#13090](https://github.com/opencrvs/opencrvs-core/issues/13090)
- Added infrastructure management script to toolkit [#12941](https://github.com/opencrvs/opencrvs-core/issues/12941)
- Moved Ansible inventory files into environment-specific folders so each environment is self-contained and portable [#13181](https://github.com/opencrvs/opencrvs-core/pull/13181)
- Replace Elastic APM tracing with OpenTelemetry [#12304](https://github.com/opencrvs/opencrvs-core/issues/12304)
- Advanced search keeps records at renamed or inactivated offices, facilities and admin areas findable — filters list historical names and, for offices/facilities, inactivated locations [#13146](https://github.com/opencrvs/opencrvs-core/issues/13146)
- Updates Kubernetes node networking and firewall configuration for multi-node clusters with private node communication [#353](https://github.com/opencrvs/infrastructure/pull/353)
- Enable OpenTelemetry for Traefik and NGINX [#10685](https://github.com/opencrvs/opencrvs-core/issues/10685)
- Keep filebeat index for 30 days by default [#13005](https://github.com/opencrvs/opencrvs-core/issues/13005)
- Reduce the amount of data sent to Elasticsearch by dropping unused and duplicate fields during Metricbeat processing [#10978](https://github.com/opencrvs/opencrvs-core/issues/10978)
- Remove direct calls to events service [#13399](https://github.com/opencrvs/opencrvs-core/issues/13399)
- `pnpm dev` now runs the MOSIP stack alongside the rest of core, so local registrations exercise the same MOSIP path as a real deployment. The testland `NO_MOSIP` escape hatch is gone — it only ever short-circuited local development, and production already defaulted to `false`.
- Record review, event summaries, team lists, settings and the duplicate comparison now draw their label-and-value rows from one shared component, so they present consistently and screen readers announce each value together with its row and column heading [#4024](https://github.com/opencrvs/opencrvs-core/issues/4024)
- Added Service account support for Managed Kubernetes [#13324](https://github.com/opencrvs/opencrvs-core/issues/13324)

### New features

#### Location and administrative area write API

Locations and administrative areas can now be created, renamed, recoded, and inactivated via `create`, `update`, and `withdrawVersion` endpoints — each change appends an effective-dated element to the entity's `versions[]` array rather than overwriting state; prior versions are never modified (see location versioning, [#6691](https://github.com/opencrvs/opencrvs-core/issues/6691)). A new `location.edit` scope guards these endpoints; country configs must assign it to the relevant role(s). All changes are recorded in the audit log.

#### Notification-based scope filtering

Added `notifiedIn` and `notifiedBy` scope options for record scopes (`record.read`, `record.edit`, `record.search`, etc.), mirroring the existing `declaredIn`/`declaredBy` and `registeredIn`/`registeredBy` patterns — enables role configurations to restrict access based on where or by whom an event was notified. [#11875](https://github.com/opencrvs/opencrvs-core/issues/11875)

#### Status-based scope filtering

Added a `status` scope option for record scopes (`record.edit`, `record.reject`, `record.archive`, `record.search`, etc.) — e.g. `{ type: 'record.edit', options: { status: ['DECLARED'] } }` restricts the scope to records currently in one of the given `EventStatus` values.

#### Flag-based scope filtering

Added a `flags` scope option for record scopes (`record.search`, `record.read`, `record.request-correction`, `record.correct`, `record.unassign-others`, `record.review-duplicates`, `record.custom-action`, `record.print-certified-copies`) — e.g. `{ type: 'record.search', options: { flags: { noneOf: ['REJECTED'] } } }` restricts the scope to records whose current flags satisfy the given `anyOf`/`noneOf`/`allOf` condition.

#### `APPROVE_CORRECTION` / `REJECT_CORRECTION` no longer inherit `REQUEST_CORRECTION`'s config

`getActionConfig()` used to alias `APPROVE_CORRECTION` and `REJECT_CORRECTION` to whatever was configured on `REQUEST_CORRECTION` (label, flags, conditionals). Each now resolves to its own independent config. If your country config relies on `REQUEST_CORRECTION`'s `conditionals` or `flags` also applying to approve/reject, add explicit `APPROVE_CORRECTION`/`REJECT_CORRECTION` entries with the same values.

#### All core actions are independently configurable

`DELETE`, `ASSIGN`, `UNASSIGN`, `MARK_AS_DUPLICATE`, `MARK_AS_NOT_DUPLICATE`, `APPROVE_CORRECTION`, `REJECT_CORRECTION`, and `DUPLICATE_DETECTED` can now be configured in `ActionConfig`, supporting `label`, `icon`, and `conditionals` (and `flags`, except on `ASSIGN`/`UNASSIGN`, which are meta actions excluded from flag resolution). See [ACTIONS.md](/ACTIONS.md).

#### `UNARCHIVE` core action

Added `ActionType.UNARCHIVE`, a new core action that restores an `ARCHIVED` record to its pre-archive status, guarded by a new `record.unarchive` scope. See "`ARCHIVE` no longer clears the `INCOMPLETE` flag" above for its flag-handling behavior. [#12782](https://github.com/opencrvs/opencrvs-core/issues/12782)

#### Configurable form fields on core action confirmation dialogs

The core `NOTIFY`, `DECLARE`, `REGISTER`, `ARCHIVE` and `REJECT` actions now accept an optional `form: FieldConfig[]` in the country configuration, matching the shape already used by custom actions. Configured fields are rendered on the action's confirmation dialog at every entry point (direct actions, quick actions, and "with edits" variants — a combined action such as direct registration shows only the final action's fields). Submitted values are stored in the action's `annotation` and displayed in the record's audit history. Mandatory fields disable the dialog's primary button until completed. [#11305](https://github.com/opencrvs/opencrvs-core/issues/11305)

#### `activeOnly` location field config option

`LOCATION`, `ADMINISTRATIVE_AREA`, and `ADDRESS` field configs accept an optional boolean, `activeOnly`, which offers only currently-active locations, excluding inactivated ones. Advanced search sets it itself for its address filters, so no country configuration is required for that behaviour; it is documented here as a new, optional part of the field config schema. [#13146](https://github.com/opencrvs/opencrvs-core/issues/13146)

#### `anchorToDateOfEvent` location field config option

`LOCATION`, `ADMINISTRATIVE_AREA`, and `ADDRESS` field configs accept an optional boolean, `anchorToDateOfEvent`, which resolves the field's displayed/selectable versions against the event's date-of-event instead of today (falling back to the record's creation date when that field is empty). It does not by itself exclude inactive versions — combine with `activeOnly` for that; when both are set, `activeOnly`'s active/inactive check is evaluated at the event-date anchor rather than today, so a location that has since become inactive can still be selected for a historical record, and one not yet active as at the event's date is excluded even if it's active today. A selection is automatically cleared if the date-of-event later changes such that it resolves to a different version than before. [#13143](https://github.com/opencrvs/opencrvs-core/issues/13143)

#### `separator` / `hideEmptyFields` field group config options

`FIELD_GROUP` field configs accept an optional `configuration` object with two settings that control how the group renders as output (record review, audit history, search criteria pills). `separator` joins the subfield values into a single line — e.g. `', '` — instead of the default one-per-line. `hideEmptyFields` leaves subfields without a value out of that output; pair it with a separator so the separator does not double up around the gaps. A group that sets neither renders exactly as before: one subfield per line, blanks included. [#13423](https://github.com/opencrvs/opencrvs-core/issues/13423)

#### Integration audit log retrieval

An integration's audit log can now be read through the `integrations.audit` endpoint which returns a paginated, newest-first list of the operations a single system client performed. The endpoint returns what the client itself did; an integration's lifecycle (who created, disabled or re-keyed it) stays in the audit logs of the administrators who performed those actions.

A new `integration.audit.read` scope guards it; country configs must assign it to the relevant role(s) before the endpoint is reachable. The endpoint is closed to system clients entirely — an integration cannot read any audit log, including its own — and, because system clients have no office or administrative area, access is national and carries no jurisdiction options. [#11909](https://github.com/opencrvs/opencrvs-core/issues/11909)

#### Daily usage telemetry

OpenCRVS can now share a small **daily usage summary** with the OpenCRVS status service — aggregate counts only (registrations, pending declarations, certificates printed, active users, uptime), never personal or record data. It is collected at most once per UTC day and only ever sent from production instances.

Enable it on the countryconfig service with `TELEMETRY_ENABLED=true`, and identify your instance with `COUNTRY_CODE`, `ORGANISATION`, and `ENVIRONMENT_NAME`. While disabled, countryconfig logs a startup notice explaining what would be shared and how to opt in.

- **New country configs** — `create-countryconfig` asks for your organisation, ISO alpha-3 country code, and whether to enable telemetry, then writes them as the env defaults.
- **Existing country configs** — `opencrvs upgrade` wires telemetry into a v2.0 config (the `/trigger/telemetry` handler, its route, and the new env vars). It asks whether to enable it and, if so, requires your country code and organisation.
- **Toolkit** — `@opencrvs/toolkit/telemetry` exposes `sendTelemetry(report)`, which owns the status service URL and payload schema so upgrades stay type-safe.

#### Pre-flight validation for the data seed job

The data seed job now validates the whole of the seed-data before it writes anything, and reports every problem it finds in one pass instead of stopping at the first bad record.

Validated up front: duplicate email, mobile and username within the seed-data; every mobile number against the country config's configured phone pattern (a pattern that is not a usable expression is itself reported); every user's primary office against the location seed-data the job has already fetched, which is both earlier and more accurate than a database lookup; and the location hierarchy's parent-existence and location-to-administrative-area checks. The five checks that already existed and each aborted the run on its own — user and role schema parse failures, an unknown role, duplicate role ids, and the requirement that at least one initial user carry the `config.update-all` scope — are folded into the same report, so a typo'd role name and a duplicate email now read alike.

Problems identify an initial user by its position in the seed-data and its username, and a validation failure always ends with `nothing was seeded`:

```
4 problems found; nothing was seeded.
  initial user 44 (k.mweene): email "k.mweene@x.com" duplicates initial user 12 — emails must be unique
```

Duplicate usernames are a hard error rather than a rename. The service renumbers colliding usernames when it creates a user, which is right for self-service creation but wrong at seed time.

Seed-data is held to a stricter shape, so mistakes surface here rather than part-way through a write. An initial user's username must satisfy the same rule the service applies when it creates one, and a username, password or name that is present but empty is a problem rather than something the database objects to later. A location version's `effectiveFrom` must be a plain date. Unrecognised keys on a location, a location version or an initial user are reported instead of being dropped in silence — a misspelled `verisons` previously cost a location its whole history without a word.

Validation narrows the failure window but cannot close it, so a write that still fails — a constraint violation, a network fault, configuration drift between validating and writing — now names the failing initial user and states that the database holds incomplete seed-data:

```
Seeding failed while creating initial users.

  initial user 44 (k.mweene): DUPLICATE_EMAIL — email "k.mweene@example.org" is already in use

The database now holds incomplete seed-data. Clear the database before you seed again.
```

Re-running after a partial failure requires clearing the data first. [#11207](https://github.com/opencrvs/opencrvs-core/issues/11207)

### Bug fixes

- Keep a number field's postfix/unit label (e.g. `Kilograms (kg)` on Weight at birth) on a single line instead of wrapping onto a second row [#13216](https://github.com/opencrvs/opencrvs-core/issues/13216)
- Bust the locally cached data when a user's office or role changes, so stale drafts and records from the previous office no longer appear after the change
- Stop showing an empty `Comment` section in the record audit history for archived records. Archiving from the action menu never asked for a comment, so the section only ever displayed a `-` placeholder. Records archived through the "mark as duplicate" flow still show the comment that was entered there [#13265](https://github.com/opencrvs/opencrvs-core/issues/13265)
- Stop `/auth/verifyUser` from revealing whether a submitted email or mobile number belongs to a registered account, and stop the username-reminder flow from returning the account's security-question key with no proof the caller controls the mailbox — see "Breaking changes" above for the required country-config migration [#12861](https://github.com/opencrvs/opencrvs-core/issues/12861)
- Stop offering custom actions (e.g. `ESCALATE`) on a draft. Executing one deleted the draft while leaving the event undeclared, making the record impossible to find again [#13245](https://github.com/opencrvs/opencrvs-core/issues/13245)
- Stop reporting an email or mobile number as already in use when it is merely contained in an existing one. Duplicate and existence checks on users matched substrings, so creating a user with the email `a@x.com` was rejected as a duplicate of an existing `ba@x.com`. Email, mobile and username now match whole values; email and username stay case-insensitive in effect. [#11207](https://github.com/opencrvs/opencrvs-core/issues/11207)
- Return a conflict naming the offending field, instead of an internal server error, when a write trips a unique constraint on a user's email, mobile or username. The application-level duplicate checks are broader than the constraints, so this is reachable only when two requests race — but the cause was masked in production and reached the caller as `Internal server error`. Covers creating a user as well as changing an existing user's email, phone number or name. [#11207](https://github.com/opencrvs/opencrvs-core/issues/11207)

## 2.0.1 Release

### Security fixes

- Every `/triggers/user/*` user-notification request sent to the country config now carries an `Authorization` header, so country configurations can require authentication on those routes. Previously the `all-user-notification` route was called without a token and country configurations shipped all of these routes with `auth: false`, letting anyone who could reach the service trigger 2FA codes, password-reset credentials and notification emails or SMS to arbitrary recipients. The background announcement worker now authenticates with an anonymous token, and the username-retrieval flow mints a system token instead of forwarding an `Authorization` header it never receives. [#13501](https://github.com/opencrvs/opencrvs-core/pull/13501)

  **Deployment notes:**

  - Country configurations must remove `auth: false` from every route in `src/config/routes/userNotificationRoutes.ts`. Until they do, the endpoints stay open — the core change alone does not close them. The routes then inherit the default `jwt` strategy, which accepts tokens with the `opencrvs:countryconfig-user` audience; every core caller now sends one.
  - Run `npx @opencrvs/toolkit verify-endpoints` against a locally-running country config to confirm the required public endpoints still respond and the secured ones reject unauthenticated requests. It exits non-zero if any check fails.

### Improvements

- Added `createdBy` as a config paramater to filter records created by the user [#13287](https://github.com/opencrvs/opencrvs-core/issues/13287)
- Added `createdIn` as a config parameter to filter records by the office or administrative area they were created in. Unlike `declaredIn` it is populated before the record is declared, and it is never reassigned by a later declaration [#13287](https://github.com/opencrvs/opencrvs-core/issues/13287)
- Expose `POST /locations` and `POST /administrative-areas` REST endpoints to create or update a single location or administrative area, for correcting individual data-seeding errors. Bulk seeding is unaffected and still uses the existing `locations.set`/`administrativeAreas.set` tRPC mutations. [#13336](https://github.com/opencrvs/opencrvs-core/pull/13336)
- The MOSIP charts now pass `OPENCRVS_AUTH_URL` to mosip-api and pin the mosip-api, mosip-mock and esignet-mock images to `2.0.1`. Implementations running the MOSIP integration should redeploy the `opencrvs-mosip` chart. [#13362](https://github.com/opencrvs/opencrvs-core/pull/13362)
- Make the Deployment rollout strategy configurable, and default it to `Recreate`, for OpenCRVS services [#11994](https://github.com/opencrvs/opencrvs-core/issues/11994)

### Bug fixes

- Fields guarded by a custom conditional are now saved when declaring, editing or registering a record. Previously they were stored as empty because the event was missing from the validator context. [#13167](https://github.com/opencrvs/opencrvs-core/issues/13167)
- Location fields restricted with `allowedLocations` now enable every dropdown for users whose scope grants `placeOfEvent: 'all'`, instead of behaving as if it were `administrativeArea`. [#13209](https://github.com/opencrvs/opencrvs-core/issues/13209)
- Declarations created offline with supporting documents no longer stay stuck in the Outbox after reconnecting, where the upload failed with "File not found". [#13303](https://github.com/opencrvs/opencrvs-core/issues/13303)
- Re-enable ARM-based images in the Tiltfile so local developers can run OpenCRVS on Apple silicon. [#13285](https://github.com/opencrvs/opencrvs-core/pull/13285)

## 1.9.16

### New features

- Third-party integrations (such as MOSIP) can now authenticate with their own client ID and secret instead of borrowing the requesting user's session. Integrations are registered on startup from the country configuration, so they keep working across service restarts and the audit trail attributes actions to the integration (e.g. "Registered — MOSIP") rather than to a person. Opt-in: configurations with no integrations are unaffected. [#12360](https://github.com/opencrvs/opencrvs-core/issues/12360)

- Form pages can now show a "Clear" button that resets every field on the page to its default value after a confirmation dialog, and select fields can be cleared without picking another option. Opt in per page with `showClearButton: true`. Country configurations need the `buttons.clear`, `clearForm.title.clearFormConfirm` and `clearForm.desc.clearFormConfirm` translation keys. [#10135](https://github.com/opencrvs/opencrvs-core/issues/10135)

### Improvements

- Hardened the Content Security Policy served by the client and login apps, following a vulnerability scan. The login app no longer allows `unsafe-eval` or wildcard-domain scripts, both apps now send `frame-ancestors`, `base-uri` and `form-action`, `img-src` no longer permits plain-HTTP images, and PDF previews disable pdf.js code generation. The client still requires `unsafe-eval` to compile configuration at runtime; the reasoning is documented next to the policy in `packages/client/nginx.conf`. [#13246](https://github.com/opencrvs/opencrvs-core/issues/13246)

  **Deployment notes:**

  - Images served over plain HTTP are now blocked in both apps. Serve those assets over HTTPS.
  - `CONTENT_SECURITY_POLICY_WILDCARD` defaults to `*.<domain>`, which trusts every subdomain. It is substituted verbatim, so an explicit space-separated origin list can be used instead; the minimum set is documented next to the policy in `packages/client/nginx.conf`. The login app no longer uses the wildcard at all — every origin it contacts is proxied same-origin through its own nginx.
  - Reverse-proxy TLS cipher suites are outside OpenCRVS core. Proxies without explicit TLS options often fall back to a TLS 1.2 list offering CBC suites with HMAC-SHA-1; restricting to AEAD suites satisfies guidance such as ANSSI-BP-035.

### Bug fixes

- Activating a user account now requires the caller to be the account owner. Previously any user holding `user.update` or `user.update[my-jurisdiction]` could set a pending user's password and security answers, allowing account takeover. Enforced in both the gateway and user management. [#13197](https://github.com/opencrvs/opencrvs-core/pull/13197)
- Changing a password now requires the caller to be the account owner, and the current password is always required. Administrators still reset passwords through "Reset password", which is unchanged.
- On mobile, uploading a file or signature no longer triggers the PIN re-lock screen. [#13124](https://github.com/opencrvs/opencrvs-core/issues/13124)

## 2.0.0 Release

### Upgrade guidance

To ensure a smooth upgrade to 2.0, we recommend upgrading to **v1.9.14** first before upgrading to 2.0. v1.9.14 includes fixes that allow the client to gracefully handle the transition window between versions, preventing users from seeing a blank screen or errors during the upgrade.

### Breaking changes

#### Scheduler service removed

The `scheduler` package and its Docker service have been removed. The service ran two nightly cron jobs (`refreshPerformanceData`, `runVSExport`) that called endpoints on the metrics service which have since been deprecated. No replacement is needed.

#### FieldType.PARAGRAPH configuration

- `FieldType.PARAGRAPH` field no longer takes in a fontVariant style configuration. If a fontVariant is required, please use the new `FieldType.HEADING` field instead.

#### Location APIs

- **Removed following endpoints from gateway:**
  | Path | Method |
  | ----------------- | ------ |
  | `/location` | `*` |
  | `/location/{id}` | `*` |
  | `/locations` | `GET` |
  | `/locations` | `POST` |
  | `/locations/{id}` | `*` |

V1 are deprecated. 2.0.0 onwards, locations are fetched from `events` service.

- **events-service location APIs changes**
  Administrative areas (v1 `locationType: 'ADMIN_STRUCTURE'`) are exposed from a separate endpoint. See the [definition of the administrative hierarchy](/ADMINISTRATIVE-HIERARCHY.md) 2.0.0 onwards.

#### Country config `GET /config/locations` response shape

The data-seeder now expects `GET /config/locations` to return a structured object instead of a flat array. Country configuration's locations endpoint needs to be updated accordingly.

**Before:**

```ts
Array<{
  id: string
  name: string
  alias?: string
  partOf: string
  locationType: 'ADMIN_STRUCTURE' | 'HEALTH_FACILITY' | 'CRVS_OFFICE'
}>
```

**After:**

```ts
{
  administrativeAreas: Array<{ id: string; name: string; partOf: string }>
  locations: Array<{
    id: string
    name: string
    partOf: string
    locationType: string
  }>
}
```

- `alias` has been removed and is no longer accepted.
- `locationType` in the `locations` array is now a free-form `string` — country configurations are no longer restricted to the three built-in values and may define custom location types.

#### Workqueue configurations

- `actions: [{ type: CtaActionType }]`. is deprecated in favor of `action: { type: CtaActionType }`
- The `conditionals` option has been removed from workqueue configuration under `action`. This option was previously present but had no effect.
- The `'DEFAULT'` value is no longer supported in workqueue `action` configuration. Please ensure you specify a valid `CtaActionType` (see [WorkqueueConfig.ts](https://github.com/opencrvs/opencrvs-core/blob/develop/packages/commons/src/events/WorkqueueConfig.ts)).
- Add support for querying by the declaring or registering user's role to workqueue `query`
  - `'legalStatuses.DECLARED.createdByRole': { type: 'anyOf', terms: ['MY_ROLE_ID', 'MY_OTHER_ROLE_ID'] }`
  - `'legalStatuses.REGISTERD.createdByRole': { type: 'anyOf', terms: ['MY_ROLE_ID', 'MY_OTHER_ROLE_ID'] }`

#### Dashboard configurations

- Added the `dashboard.view` scope which supports the `ids` parameter (e.g. `options: { ids: ['registrations', 'completeness', 'registry'] }`). When `ids` is specified, users are able to access the listed dashboards. For the timebeing, the pre-existing `performance.read-dashboards` is also required, but that will be deprecated in the future [#11599](https://github.com/opencrvs/opencrvs-core/issues/11599)

#### Inherent flags

- The inherent flag `InherentFlags.PENDING_CERTIFICATION` has been removed. Similar logic can be implemented in the country config with a custom flag, [see example](https://github.com/opencrvs/opencrvs-countryconfig/blob/81db21f4cf9ccbba90cb2c6e48648c9b258dc905/src/form/v2/birth/index.ts#L95-L102).

#### Webhook integration client removed

The Webhook integration client and its `webhooks` service have been removed and are **not** migrated to v2.0 automatically. Country configurations that previously consumed webhook subscriptions must instead react to events via the country config's [Action Confirmation API](https://github.com/opencrvs/opencrvs-countryconfig/blob/develop/src/api/action-confirmation.md), which is invoked for every supported action (`NOTIFY`, `DECLARE`, `REGISTER`, `REJECT`, `ARCHIVE`, `PRINT_CERTIFICATE`). If a webhook-style fan-out to external systems is still required, implement it directly inside the country configuration code from those handlers.

#### Event Notification API rename

`POST /api/events/events/notifications` has been renamed to `POST /api/events/events/{eventId}/notify`. The two-step "create event, then notify" flow is unchanged otherwise. A new single-request convenience endpoint `POST /api/events/events/notify` is also available for system clients that need to create and notify in one call. Integration clients must update their request paths.

#### Auth service no longer exposed on its own subdomain

The public `auth.{hostname}` Traefik route has been removed — the auth service is now reachable only through the gateway proxy at `gateway.{hostname}/auth/*`. Remove the `auth.*` DNS record and TLS certificate from your deployment. The gateway's `/auth/authenticate-super-user` route is now rate limited on a constant key (it previously keyed on a `username` field that super user auth does not send).

### New features

#### Rich text support in MessageDescriptor.defaultMessage

`TranslationTextWithFormatModifier` — use inline HTML-like tags directly in a `MessageDescriptor.defaultMessage` and render rich text via this component instead of wiring `intl.formatMessage` handlers manually. Supported tags: `<strong>`, `<b>`, `<em>`, `<i>`, `<u>`, `<mark>`, `<small>`, `<sub>`, `<sup>`, `<del>`, `<ins>`, `<code>`, `<kbd>`, `<q>`, `<br></br>`, `<tab></tab>`. Example message:

```
{
  id: 'id',
  description: 'Rich text example in translation',
  defaultMessage: '<strong>WARNING!</strong>: Record will be <strong>legally registered</strong> via the outbox.<br></br>Further amends require a legal correction process.'
}
```

Currently used to render `supportingCopy` in the action confirmation dialog (`useQuickActionModal`). [#12441](https://github.com/opencrvs/opencrvs-core/issues/12441)

#### Autocomplete Input

A select component enhanced with suggestions based on user search input. Works in conjunction with a countryconfig endpoint that returns suggestions based on user input. The list of suggestions are fetched from a table in the reference_data schema in events database.

#### HTTP Input

HTTP input now accepts `field('..')` references in the HTTP body definition.

#### Certificate template helpers

- Added `$join` Handlebars helper for certificate SVG templates. Joins values with a separator while filtering out empty or undefined values — useful for address hierarchies where some levels may be absent (e.g. `{{$join ", " district province country}}`).
- ADDRESS field certificate variables now include an `administrativeHierarchy` convenience field: admin levels joined most-specific-first with country for domestic addresses (e.g. `"Ibombo, Central, Farajaland"`), or just country for international addresses. Use as `{{$lookup $declaration "field.address.administrativeHierarchy"}}`.

#### Jurisdiction

- Elasticsearch now stores location IDs as a full administrative hierarchy, with the leaf representing the actual event location. This enables searching events by any jurisdiction level (district, province, office, health facility etc.).
- Added configurable placeOfEvent in EventConfig, allowing multiple location fields to be defined, with only one becoming the active place of event per document (based on conditionals), enabling jurisdiction-specific search by event location (e.g., birth location, child’s home address, death location).

### Improvements

- Refactor the tRPC context to allow defining public procedures that don't require authentication.
- Remove legacy mongo migration status outputs and skip typecheck which reduced the migration service startup time by 66%.
- The postgres migration files now get restored to their original state (i.e. without the environment variables being replaced) regardless of the migration passing or not
- Added experimental ALPHA_HIDDEN form field type, allowing configurable default/derived values and conditional inclusion in form submissions.
- Added OAuth2 support for `application/x-www-form-urlencoded` content type in auth-service access token endpoints, maintaining backwards compatibility with query parameters. [#11590](https://github.com/opencrvs/opencrvs-core/pull/11590)
- Change reindex call to make operation non-destructive. Create endpoint to track progress of reindex. [#11877](https://github.com/opencrvs/opencrvs-core/issues/11877)
- Fixed vulnerabilities on CSP HTTP Header for login page [#12094](https://github.com/opencrvs/opencrvs-core/issues/12094)
- Merged Helm charts as part of Monorepo [#12679](https://github.com/opencrvs/opencrvs-core/issues/12679)
- Change nginx log format to json for client and login containers [#10202](https://github.com/opencrvs/opencrvs-core/issues/10202)
- Reduce the amount of data sent to Elasticsearch by dropping unused and duplicate fields during Filebeat processing [#11232](https://github.com/opencrvs/opencrvs-core/issues/11232)
- The app now recovers automatically when the network changes (e.g. Ethernet → WiFi) or become online -> offline -> online again during app initialisation is halfway. If connectivity drops while the app is still loading and is then restored, the app reloads itself to finish loading, instead of getting stuck on the "Installing application…" screen and requiring a manual refresh. [#12898](https://github.com/opencrvs/opencrvs-core/issues/12898)

## 1.9.15

### Improvements

- Team page now shows a user-friendly "Too many requests" message when the `searchUsers` rate limit (20 req/min) is hit, instead of the generic query error. [#12990](https://github.com/opencrvs/opencrvs-core/issues/12990)
- Gateway locations endpoint now serves responses from an in-process cache backed by Redis, reducing memory allocations under concurrent load. Cached payloads are gzip-compressed so write buffers to Traefik are proportionally smaller during request spikes. [#12880](https://github.com/opencrvs/opencrvs-core/issues/12880)

## 1.9.14

### New features

- Two new toolkit methods allow country configurations to implement custom client-side logic that goes beyond the predefined `field()` methods. [#11653](https://github.com/opencrvs/opencrvs-core/issues/11653)

  **`field('id').customClientValidator(fn)`** — validate a field with an arbitrary inline function. The function is serialised into the form configuration and executed just-in-time during validation. All logic must be self-contained — external references such as lodash are not available — so the validator stays portable wherever the schema is evaluated.

  ```ts
  field('nid').customClientValidator((value) => {
    // LUHN check — all logic must be inline
    const digits = String(value).split('').reverse().map(Number)
    let sum = 0
    digits.forEach((d, i) => {
      const n = i % 2 === 0 ? d : d * 2
      sum += n > 9 ? n - 9 : n
    })
    return sum % 10 === 0
  })
  ```

  The result is a `JSONSchema` and can be used anywhere a conditional validator is accepted (field `validation[]`, page conditionals, etc.).

  **`field('id').customClientEvaluation(fn)`** — compute a derived value from one field and the full form context. Returns a `CodeToEvaluate` descriptor usable as `value`, `defaultValue`, or a `DATA` component entry.

  ```ts
  field('quantity').customClientEvaluation(
    (qty, ctx) => Number(qty) * Number(ctx.$form['unitPrice'])
  )
  ```

- Always display a "Go to review" button on every page of declaration form to allow easier navigation between the preview and the form fields. [#10132](https://github.com/opencrvs/opencrvs-core/issues/10132)

### Bug fixes

- Signature fields referenced in certificate templates via Handlebars now resolve correctly. Signatures captured during registration and on the review page were previously not rendered in printed certificates even when the template referenced them. [#12277](https://github.com/opencrvs/opencrvs-core/issues/12277)

## 1.9.13

### Breaking changes

- Redundant `defaultValue` removed from BULLET_LIST, FORM_HEADER and PARAGRAPH field types.
- `action.reject(...)` now by default unassigns the event from the last assigned user. To keep assignment, `keepAssignment: true` option must be explicitly passed when rejecting an action.

### New features

- Action confirmation tokens are now scoped with `record.read` access for the specific event, enabling the confirmation flow to fetch event data via the `event.get` tRPC endpoint. [#12350](https://github.com/opencrvs/opencrvs-core/issues/12350)
- Within a form page, `defaultValue` resolution is now ordered: each field can reference the resolved values of fields above it, enabling intra-page derived defaults. [#12350](https://github.com/opencrvs/opencrvs-core/issues/12350)
-

### Bug fixes

- Two mutually exclusive form pages can now share field IDs. Previously a field that appeared on a hidden page was always stripped from the event data, even if an identically-named field on a different visible page had a value. The system now only omits a field when it is hidden on every page it appears on. [#12350](https://github.com/opencrvs/opencrvs-core/issues/12350)
- Navigating to the next form page now uses the values the user just entered, not the previous render's state. This prevented correct page routing when the next page's visibility depended on a field filled on the current page. [#12350](https://github.com/opencrvs/opencrvs-core/issues/12350)
- Switching between form pages no longer briefly flashes stale values from the previous page. The Formik instance is now remounted on page change instead of being reset via a `useEffect`. [#12350](https://github.com/opencrvs/opencrvs-core/issues/12350)
- `CHECKBOX` and `BUTTON` field default values (booleans, numbers) are no longer silently dropped during form initialisation. [#12350](https://github.com/opencrvs/opencrvs-core/issues/12350)
- The `DATA` field now uses the first visible field config when multiple fields share the same ID, ensuring the correct field is displayed when fields are mutually exclusive. [#12350](https://github.com/opencrvs/opencrvs-core/issues/12350)
- Address field defaults no longer set `administrativeArea` to an empty string when the user reference cannot be resolved. This prevents empty address submission errors and correctly enables optional address sub-fields. [#12350](https://github.com/opencrvs/opencrvs-core/issues/12350)
- Health facilities and other non-administrative locations are no longer included in the administrative area hierarchy when resolving location ancestry. [#12485](https://github.com/opencrvs/opencrvs-core/issues/12485)
- The work queue list now automatically refreshes after a new event is created, without requiring a manual page reload. Previously the sidebar count updated immediately but the list itself stayed stale. [#12103](https://github.com/opencrvs/opencrvs-core/issues/12103)

### Improvements

- The sidebar navigation footer now displays the user's assigned office alongside their name and role. [#11421](https://github.com/opencrvs/opencrvs-core/issues/11421)
- The client now periodically polls `api/ping` every 5 seconds until all services are reachable, so users automatically recover from offline to online without a page reload. A `ConnectionStatus` indicator in the sidebar reflects real-time connectivity state. [#12055](https://github.com/opencrvs/opencrvs-core/issues/12055)
- Allow assignment to be controlled when rejecting an action both synchronously and asynchronously by passing an optional `keepAssignment` parameter to response body (during synchronous rejection) or to the `action.reject` function (during asynchronous rejection). [#12347](https://github.com/opencrvs/opencrvs-core/issues/12347)

## 1.9.12

### Infrastructure

- Introduced `CONFIG_ACTION_CONFIRMATION_TOKEN_EXPIRY_SECONDS` environment variable for the auth service to control the expiry of action confirmation tokens. Defaults to `604800` seconds (7 days).

### Improvements

- More expressive `ADDRESS` field configuration

The `fields` array in `ADDRESS` field configuration now accepts a field-override object, giving you per-level control over `required`, `conditionals`, and `label`. Only `id` and `type` are required — all other properties are optional and fall back to sensible defaults: labels default to the value from the country's admin structure configuration, and the country field falls back to a built-in "Country" label.

Previously only a fixed set of string values (`'country'` / `'administrativeArea'`) were accepted. The separate `administrativeLevels` array has been removed in favor of this unified `fields` array.

```ts
{
  id: 'applicant.address',
  type: FieldType.ADDRESS,
  configuration: {
    fields: [
      { id: 'country', type: FieldType.COUNTRY },           // uses default label
      {
        id: 'province',
        type: FieldType.ADMINISTRATIVE_AREA,
        required: true,
        label: { id: 'custom.province', defaultMessage: 'Province', description: '' } // optional override
      },
      {
        id: 'district',
        type: FieldType.ADMINISTRATIVE_AREA,
        required: false,
        conditionals: [{ type: ConditionalType.SHOW, conditional: ... }]
      }
    ]
  }
}
```

> [!IMPORTANT]
> The `id` of the object must match the administrative hierarchy id defined in `applicationConfig`.

- The `ADMINISTRATIVE_AREA` field's `configuration.partOf` now uses the standard typed `FieldReference` (produced by `field(...)`) instead of the previous ad-hoc `{ $declaration: string }` shape, and its `defaultValue` now accepts `user(...)` references in addition to plain strings.

### New features

- Support for conditional actions "ENABLE" and "SHOW" in SELECT field options to allow the options to be hidden/disabled conditionally.
- `COUNTRY` field now supports `optionOverrides` to conditionally hide or disable specific country options using "SHOW" and "ENABLE" conditionals. It can be used independently in a COUNTRY field or in a nested Address subfield.
- A composite field type (`FIELD_GROUP`) that groups related child fields into a single unit with a shared label, conditionals, and validation.

**Structure:**

```typescript
{
  id: 'person.address',
  type: fieldtype.field_group,
  fields: [
    { id: 'country', type: FieldType.COUNTRY },
    { id: 'province', type: FieldType.ADMINISTRATIVE_AREA, parent: field('person.address').get('country') },
    { id: 'district', type: FieldType.ADMINISTRATIVE_AREA, parent: field('person.address').get('province') }
  ]
}
```

N.B. Support for `DISPLAY_ON_REVIEW` conditionals in nested fields has not been implemented yet.

### Bug fixes

- Allow nested address fields to use the outer form values in conditionals.
- Skip hidden fields when generating default values. Note: `defaultValue` only applies on the first mount of a form page — after that the field's value takes precedence, even if the `defaultValue` changes across field versions. [#11476](https://github.com/opencrvs/opencrvs-core/issues/11476)
- Review page field conditionals have no access to form data, only review page form data. [#11410](https://github.com/opencrvs/opencrvs-core/issues/11410)

## 1.9.11

### New features

- Added support of `updatedByUserRole` for workqueue configuration.
  Workqueues can now be filtered by a specific role or `user('role')`. [#11848](https://github.com/opencrvs/opencrvs-core/issues/11848)

**Usage example**

```ts
query: {
  updatedByUserRole: { type: 'exact', term: user('role') }
}
```

### Bug fixes

- Fix newly created drafts in offline mode are not accessible [#11820](https://github.com/opencrvs/opencrvs-core/issues/11820)
- Fix the rendered date on the review page and the certificate display issue in negative UTC offset time zones. [#11955](https://github.com/opencrvs/opencrvs-core/issues/11955)

### Improvements

- Change reindex call to make operation non-destructive. Create endpoint to track progress of reindex. [#11877](https://github.com/opencrvs/opencrvs-core/issues/11877)

- Explicitly nullify hidden field values to prevent stale data in database and fix incorrect search results [#11695](https://github.com/opencrvs/opencrvs-core/pull/11849)
- Update accordion behavior on the review page so that only sections containing required or completed fields are expanded by default. [#10133](https://github.com/opencrvs/opencrvs-core/issues/10133)

## 1.9.10

### New features

- Added support for `event()` helper to access event metadata in `dateOfEvent` and `summary` configuration in EventConfig. This allows for more dynamic and flexible configurations based on event metadata.

Usage example:

For `dateOfEvent` configuration, you can now reference an event metadata field like this:

```ts
dateOfEvent: event('legalStatuses.REGISTERED.acceptedAt')
```

For `summary` configuration, you can use event metadata fields in the value of a custom field like this:

```ts
summary: {
  fields: [
    {
      id: 'registeredAt',
      label: {
        defaultMessage: 'Registration date',
        description: 'This is the label for the registration date',
        id: 'event.birth.summary.event.registeredAt.label'
      },
      value: '{event.legalStatuses.REGISTERED.acceptedAt, date, ::dd MMMM yyyy}'
    }
  ]
}
```

### Bug fixes

- Fix bug that requires users to log in when offline instead of unlocking with a PIN. [#11243](https://github.com/opencrvs/opencrvs-core/issues/11243)

### Improvements

- Improve BRN lookup experience by making the search field clearer and more intuitive, properly handling base/success/error states, and providing clearer, context-specific error messaging for users. [#11181](https://github.com/opencrvs/opencrvs-core/issues/11181)
- Extended the `record.registered.print-certified-copies[event=tennis-club-membership]` scope to support an optional `templates` parameter (e.g. `templates=v2.tennis-club-membership-certificate-alpha`). When `templates` is specified, users are restricted to printing only the listed certificate templates. If `templates` is omitted, all certificate templates for the event remain available, preserving existing behavior [#11753](https://github.com/opencrvs/opencrvs-core/issues/11753)

## 1.9.9

### Bug fixes

- Fix E-Signet integration breaking when using “Change” links on the review page [#11603](https://github.com/opencrvs/opencrvs-core/issues/11603)

## 1.9.8

### New features

- Introduced `showParentFieldError` flag in NAME field configuration to consolidate validation error messages at the parent field level (instead of displaying separate errors below firstname, middlename, and surname subfields), improving UX by providing clearer, centralized validation feedback

## 1.9.7

### New features

- In deduplication, the dateRange matcher now supports both `AGE` and `DATE` field.
- The dateRange matcher supports a new `matchAgainst` option, which can reference either a date field or an age field. When provided, the matcher compares the source field against the specified `matchAgainst` field instead of only matching against itself.

```ts
field('mother.dob').dateRangeMatches({
  days: 365,
  matchAgainst: 'mother.age'
})
```

### Bug fixes

- Ensure rejected actions are considered when detecting pending actions. [#11588](https://github.com/opencrvs/opencrvs-core/issues/11588)

## 1.9.6

### New features

- NUMBER_WITH_UNIT Input, which is a number input with a configurable selectable unit of measurement.
- `now()` magic function, which can be used as a dynamic `defaultValue` for DATE and TIME inputs and resolves to the current date/time at runtime.
- The document upload and preview feature now supports PDF files in addition to image formats (JPEG, PNG, JPG), allowing PDFs to be viewed alongside existing DECLARED and REGISTERED documents.

## 1.9.5

### New features

- Introduced new configuration option `maxImageSize` for `FILE` and `FILE_WITH_OPTIONS` type of form fields to limit the maximum size of uploaded images. If the uploaded image exceeds provide size in pixels, a crop and resize tool will be shown to the user to adjust the image before uploading. [#10324](https://github.com/opencrvs/opencrvs-core/issues/10324)

Usage example:

A file field that allows uploading an image with maximum size of 600x600 pixels:

```ts
{
  id: 'applicant.image',
  type: 'FILE', // or 'FILE_WITH_OPTIONS'
  ...
  configuration: {
    maxImageSize: { targetSize: { height: 600, width: 600 } }
  }
}
```

Uploaded image files can now be rendered in certificate svg templates using the `$lookup` Handlebars helper. Below is an example of rendering the uploaded applicant image added in declaration form through a `FILE` field in a certificate template:

```hbs
<image
  x='50'
  y='100'
  height='50'
  width='50'
  xlink:href='{{$lookup $declaration "applicant.image"}}'
/>
```

Also for `FILE_WITH_OPTIONS` fields, the selected option can be accessed using the following syntax, you just need to provide the option value as the last part of the path:

```hbs
<image
  x='50'
  y='100'
  height='50'
  width='100'
  xlink:href='{{$lookup $declaration "applicant.idImage.ID_FRONT"}}'
/>
```

Annotation data from actions can also be accessed in a similar way using the `$action` or `$actions` helpers. For example, to access an uploaded image in the `PRINT_CERTIFICATE` action annotation data:

```hbs
<image
  x='50'
  y='100'
  height='50'
  width='100'
  xlink:href='{{$lookup
    ($action "PRINT_CERTIFICATE")
    "annotation.collector.OTHER.signedAffidavit"
  }}'
/>
```

- Add registration number field to advanced search configuration so that documents can be searched by their `Registration Number`. [#10760](https://github.com/opencrvs/opencrvs-core/issues/10760)

### Bug fixes

- Fix quick search failing when configured with a large number of events and many searchable fields [#11397](https://github.com/opencrvs/opencrvs-core/issues/11397)

- In quick search, when searching with a valid email address, the search is performed only against email fields [[#11199](https://github.com/opencrvs/opencrvs-core/issues/11199)]

### Improvements

#### User default values in form fields

Form fields now support typed user(...) references as default values, replacing legacy string-based $user.\* template variables.

TEXT fields can use the following user references as default values:

- user('name')
- user('fullHonorificName')
- user('device')
- user('firstname')
- user('middlename')
- user('surname')
- user('role')

NAME fields now support user-based default values by assigning user references per name part. The recommended approach is:

```ts
defaultValue: {
  firstname: user('firstname'),
  middlename: user('middlename'), // optional
  surname: user('surname')
}
```

Using user('name') as a default value is only supported for FieldType.TEXT.
It represents the user’s full name and should not be used with FieldType.NAME, since full names may contain multiple words and cannot be reliably split into individual name parts.

Legacy string-based user template variables (e.g. $user.name) are now deprecated in favour of user(...) references.

## 1.9.4

### Bug fixes

- e-Signet authentication now populates print and correction forms. An issue with FieldConfig `parent` parameter not finding action annotation field references was fixed. [#11210](https://github.com/opencrvs/opencrvs-core/issues/11210)

## 1.9.3

### New features

- Introduced form page level config - `requireCompletionToContinue` to enforce full completion of the form page before moving to the next page.

### Improvements

- Add support for validating dates before/after another date field using `isBefore` and `isAfter` validators. [#11194](https://github.com/opencrvs/opencrvs-core/issues/11194)

Usage example:

```ts
// 6570 days before another field
field('mother.dob').isBefore().days(6570).fromDate(field('child.dob'))

// 6570 days after another field
field('mother.dateOfMarriage')
  .isAfter()
  .days(6570)
  .fromDate(field('mother.dob'))

// 45 days before now
field('child.dob').isBefore().days(45).fromNow()
```

### Bug fixes

- Fixes an issue where `event.hasAction` was not working in form configurations [#11074](https://github.com/opencrvs/opencrvs-core/issues/11074)

## 1.9.2

### New features

- Toolkit now exports `window().location.get` to country config that can be used as a template variable e.g. in HttpField request body.

## [1.9.1](https://github.com/opencrvs/opencrvs-core/compare/v1.9.0...v1.9.1)

### Breaking changes

- `QUERY_PARAM_READER` now returns picked params under a `data` object.
  For example, `code` and `state` are now accessed via `data.code` and `data.state`.

  Previously:
  field(<page>.query-params).get('code')
  Now:
  field(<page>.query-params).get('data.code')

- **Removed support for following scopes**
  - `NATLSYSADMIN`
  - `DECLARE`
  - `VALIDATE`
  - `CERTIFY`
  - `PERFORMANCE`
  - `SYSADMIN`
  - `TEAMS`
  - `CONFIG`
  - `RECORD_EXPORT_RECORDS`
  - `RECORD_DECLARATION_PRINT`
  - `RECORD_PRINT_RECORDS_SUPPORTING_DOCUMENTS`
  - `RECORD_REGISTRATION_PRINT`
  - `RECORD_PRINT_CERTIFIED_COPIES`
  - `RECORD_REGISTRATION_VERIFY_CERTIFIED_COPIES`
  - `PROFILE_UPDATE`

### New features

- Add multi-field search with a single component [#10617](https://github.com/opencrvs/opencrvs-core/issues/10617)
- **Search Field**: A new form field that allows searching previous records and using the data to pre-fill the current form. [#10131](https://github.com/opencrvs/opencrvs-core/issues/10131)
- HTTP input now accepts `field('..')` references in the HTTP body definition.
- **Searchable Select**: A new select component that allows searching through options. Useful for selects with a large number of options. Currently being used in address fields. [#10749](https://github.com/opencrvs/opencrvs-core/issues/10749)

### Bug fixes

- During user password reset, email address lookup is now case insensitive [#9869](https://github.com/opencrvs/opencrvs-core/issues/9869)
- Users cannot activate or reactivate users with roles not specified in the `user.edit` scope [#9933](https://github.com/opencrvs/opencrvs-core/issues/9933)
- Login page no longer show "Farajaland CRVS" before showing the correct title [#10958](https://github.com/opencrvs/opencrvs-core/issues/10958)
- `ALPHA_PRINT_BUTTON` does not get disabled after first print [#10953](https://github.com/opencrvs/opencrvs-core/issues/10953)

## [1.9.0](https://github.com/opencrvs/opencrvs-core/compare/v1.8.1...v1.9.0)

### Breaking changes

- Dashboard configuration through **Metabase** has been fully migrated to **countryconfig**, and the standalone dashboard package has been removed.
  For details on configuring dashboards and information about the latest updates, refer to the [ANALYTICS.md](https://github.com/opencrvs/opencrvs-countryconfig/blob/v1.9.0/ANALYTICS.md) documentation.

### New features

#### Events V2

We are excited to announce a major overhaul of our events system: **Events V2**.
This is a complete rewrite that introduces a new level of flexibility and configurability to how life events are defined and managed across the system.

The new Events V2 architecture is built around a set of core concepts designed to make event management more powerful and customizable.

##### Events

An **Event** represents a life event (or any kind of event), such as a birth or a marriage.
Each event is defined by a configuration that specifies the sequence of **Actions** required to register it.

##### Actions

###### Declaration Actions

Declaration actions are used to modify an event’s declaration.
These actions must be executed in a defined order and cannot be skipped.

1. **DECLARE**
2. **VALIDATE**
3. **REGISTER**

Each action must be accepted by **countryconfig** before the next one can be performed.

###### Rejecting and Archiving

After declaration, instead of proceeding with registration, an event may be either **rejected** or **archived**.

If **deduplication** is enabled for an action, performing that action may trigger a **DUPLICATE_DETECTED** action if duplicates are found.
When this occurs, two additional actions become available:

- **MARK_AS_DUPLICATE** – archives the event.
- **MARK_AS_NOT_DUPLICATE** – resumes the normal action flow.

If an event is rejected by a user, the preceding action must be repeated before continuing.

###### Actions Before Declaration

1. **NOTIFY** – a partial version of the `DECLARE` action.
2. **DELETE** – an event can be deleted only if no declaration action has yet been performed.

###### Actions After Registration

Once an event has been registered, a certificate may be printed.
If a correction is required due to an error in the registered declaration, a correction workflow must be initiated.

1. **PRINT_CERTIFICATE**
2. **REQUEST_CORRECTION**
3. **REJECT_CORRECTION**
4. **APPROVE_CORRECTION**

###### General / Meta Actions

1. **READ** – appended to the action trail whenever a complete event record is retrieved.
2. **ASSIGN** – required before any action can be performed. By default, the user is automatically unassigned after completing an action.
3. **UNASSIGN** – triggered either automatically by the system or manually by a user (if the record is assigned to themselves or if the user has the appropriate permission).

##### Forms, Pages, and Fields

Event data is collected through **Forms**, which come in two types:

- **Declaration Form** – collects data about the event itself
- **Action Form** – collects data specific to a particular action, also known as annotation data in the system

Forms are composed of **Pages**, and pages are composed of **Fields**.
Fields can be shown, hidden, or enabled dynamically based on the values of other fields, allowing for a responsive and intuitive user experience.

To simplify configuration, we’ve introduced a set of helper functions:

```ts
defineDeclarationForm()
defineActionForm()
definePage()
defineFormPage()
```

All of these are available in a **type-safe** manner via the new `@opencrvs/toolkit` npm package.

##### Conditionals & Validation

Validation has been significantly improved through the adoption of **AJV** and **JSON Schema**, providing standardized, robust, and extensible validation.

The `field` function (exported from `@opencrvs/toolkit`) includes a set of helpers for defining complex validation rules and conditional logic.

##### Available helpers include:

- **Boolean connectors**: `and`, `or`, `not`
- **Basic conditions**: `alwaysTrue`, `never`
- **Comparisons**: `isAfter`, `isBefore`, `isGreaterThan`, `isLessThan`, `isBetween`, `isEqualTo`
- **Field state checks**: `isFalsy`, `isUndefined`, `inArray`, `matches` (regex patterns)
- **Age-specific helpers**: `asAge`, `asDob` (to compare age or date of birth)
- **Nested fields**:

  ```ts
  field('parent.field.name').get('nested.field').isTruthy()
  ```

The `user` object, also exported from `@opencrvs/toolkit`, includes helpers for user-based conditions such as:

```ts
user.hasScope()
user.hasRole()
user.isOnline()
```

These conditions can control:

- `SHOW` – whether a component is visible
- `ENABLE` – whether a component is interactive
- `DISPLAY_ON_REVIEW` – whether a field appears on review pages

They can also be used to validate form data dynamically based on the current form state or user context.

#### Drafts

The new **Drafts** feature allows users to save progress on an event that has not yet been registered.
Drafts act as temporary storage for an action and are visible only to the user who created them.

#### Advanced Search

Advanced search is now configurable through the `EventConfig.advancedSearch` property, allowing different sections of an advanced search form to be defined.

You can search across:

- **Declaration Fields** – using the same `field` function from declaration forms with helpers such as `range`, `exact`, `fuzzy`, and `within`
- **Event Metadata** – using the `event` function to search against metadata such as:

  - `trackingId`
  - `status`
  - `legalStatuses.REGISTERED.acceptedAt`
  - `legalStatuses.REGISTERED.createdAtLocation`
  - `updatedAt`

More details about the metadata fields are available in `packages/commons/src/events/EventMetadata.ts`.

#### Deduplication

Event deduplication is now configurable **per action** via the `EventConfig.actions[].deduplication` property.
Helpers for defining deduplication logic—such as `and`, `or`, `not`, and `field`—are available from `@opencrvs/toolkit/events/deduplication`.

The `field` helper can reference declaration form fields and be combined with:

```ts
strictMatches()
fuzzyMatches()
dateRangeMatches()
```

to define precise deduplication rules.

#### Greater Control over Actions

Each action now progresses through three possible states: **`requested`**, **`accepted`**, and **`rejected`**.
When a user performs an action, it is first marked as **`requested`** and forwarded to **countryconfig** via the `/trigger/events/{event}/actions/{action}` route, with the complete event details included in the payload.

Countryconfig has full control over how the action is processed and may choose to **accept** or **reject** the action either **synchronously** or **asynchronously**.

By hooking into these action trigger routes, countryconfig can also:

- Send customized **Notifications**
- Access the full event data at the time an action is performed

#### Configurable Workqueues

Workqueues can now be configured from countryconfig using the `defineWorkqueues` function from `@opencrvs/toolkit/events`.
This enables the creation of role- or workflow-specific queues without requiring code changes in core.

- The **`actions`** property is used to define the default actions displayed for records within a workqueue.
- The **`query`** property is used to determine which events are included in the workqueue.
- The **`workqueue[id=workqueue-one|workqueue-two]`** scope is used to control the visibility of workqueues for particular roles.

Details on the available configuration options can be found in the `WorkqueueConfig.ts` file.

#### Event Overview

The configuration of the event overview page (formerly known as _Record Audit_) has been made customizable through the `EventConfig.summary` property.
The record details displayed on this page can be referenced directly from the declaration form or defined as custom fields that combine multiple form values. If some value contains PII data, they can optionally be hidden via the `secured` flag so that the data will only be visible once the record is assigned to the user.

#### Quick Search

The dropdown previously available in the search bar has been removed.
Any search performed through the **Quick Search** bar is now executed against common record properties such as names, tracking ID, and registration number by default, providing a more streamlined and consistent search experience.

#### Certificate Template Variables

The following variables are available for use within certificate templates:

- **`$declaration`** – Contains the latest raw declaration form data. Typically used with the `$lookup` Handlebars helper to resolve values into human-readable text.
- **`$metadata`** – Contains the `EventMetadata` object. Commonly used with the `$lookup` helper for resolving metadata fields into readable values.
- **`$review`** – A boolean flag indicating whether the certificate is being rendered in review mode.
- **`$references`** – Contains reference data for locations and users, accessible via `{{ $references.locations }}` and `{{ $references.users }}`.
  This is useful when manually resolving values from `$declaration`, `$metadata` or `action`.

##### Handlebars Helpers

The following helpers are supported within certificate templates:

- **`$lookup`** – Resolves values from `$declaration`, `$metadata`, or `action` data into a human-readable format.
- **`$intl`** – Dynamically constructs a translation key by joining multiple string parts.
  Example:

  ```hbs
  {{$intl 'constants.greeting' (lookup $declaration 'child.name')}}
  ```

- **`$intlWithParams`** – Enables dynamic translations with parameters.
  Takes a translation ID as the first argument, followed by parameter name–value pairs.
  Example:

  ```hbs
  {{$intlWithParams
    'constants.greeting'
    'name'
    (lookup $declaration 'child.name')
  }}
  ```

- **`$actions`** – Resolves all actions for a specified action type.
  Example:

  ```hbs
  {{$actions 'PRINT_CERTIFICATE'}}
  ```

- **`$action`** – Retrieves the latest action data for a specific action type.
  Example:

  ```hbs
  {{$action 'PRINT_CERTIFICATE'}}
  ```

- **`ifCond`** – Compares two values (`v1` and `v2`) using the specified operator and conditionally renders a block based on the result.
  **Supported operators:**

  - `'==='` – strict equality
  - `'!=='` – strict inequality
  - `'<'`, `'<='`, `'>'`, `'>='` – numeric or string comparisons
  - `'&&'` – both values must be truthy
  - `'||'` – at least one value must be truthy

  **Usage example:**

  ```hbs
  {{#ifCond value1 '===' value2}}
    ...
  {{/ifCond}}
  ```

- **`$or`** – Returns the first truthy value among the provided arguments.
- **`$json`** – Converts any value to its JSON string representation (useful for debugging).

Besides the ones introduced above, all built-in [Handlebars helpers](https://handlebarsjs.com/guide/builtin-helpers.html) are available.

Custom helpers can also be added by exposing functions from this [file](https://github.com/opencrvs/opencrvs-countryconfig/blob/develop/src/form/common/certificate/handlebars/helpers.ts#L0-L1).

---

To see Events V2 in action, check out the example configurations in the **countryconfig** repository.

---

- **Redis password support with authorization and authentication** [#9338](https://github.com/opencrvs/opencrvs-core/pull/9338). By default password is disabled for local development environment and enabled on server environments.
- **Switch back to default redis image** [#10173](https://github.com/opencrvs/opencrvs-core/issues/10173)
- **Certificate Template Conditionals**: Certificate template conditionals allow dynamic template selection based on print history using the template conditional helpers.. [#7585](https://github.com/opencrvs/opencrvs-core/issues/7585)
- Expose number of copies printed for a certificate template so it can be printed on the certificate. [#7586](https://github.com/opencrvs/opencrvs-core/issues/7586)
- Add Import/Export system client and `record.export` scope to enable data migrations [#10415](https://github.com/opencrvs/opencrvs-core/issues/10415)
- Add an Alpha version of configurable "Print" button that will be refactored in a later release - this button can be used to print certificates during declaration/correction flow. [#10039](https://github.com/opencrvs/opencrvs-core/issues/10039)
- Add bulk import endpoint [#10590](https://github.com/opencrvs/opencrvs-core/pull/10590)
- Add multi-field search with a single component [#10617](https://github.com/opencrvs/opencrvs-core/issues/10617)
- Add registration number field to advanced search configuration so that documents can be searched by their `Registration Number`. [#10760](https://github.com/opencrvs/opencrvs-core/issues/10760)

### Improvements

- **Upgrade node version to 22**

  This version enforces environment to have Node 22 installed (supported until 30 April 2027) and removes support for Node 18 for better performance and using [new features](https://github.com/nodejs/node/releases/tag/v22.0.0) offered by NodeJS

  - Use nvm to upgrade your local development environment to use node version `22.x.x.`

- **UI enhancements**

  - Replaced the `Download` icon with a `FloppyDisk` save icon when saving an event as draft.

- Use unprivileged version of nginx container image [#6501](https://github.com/opencrvs/opencrvs-core/issues/6501)

- **Upgraded MinIO** to RELEASE.2025-06-13T11-33-47Z and MinIO Client (mc) to RELEASE.2025-05-21T01-59-54Z and ensured compatibility across both amd64 and arm64 architectures.

- Add retry on deploy-to-feature-environment workflow at core repo [#9847](https://github.com/opencrvs/opencrvs-core/issues/9847)
- Save certificate templateId so it can be shown in task history and made available for conditional [#9959](https://github.com/opencrvs/opencrvs-core/issues/9959)
- Deprecate external id/ statistical id in V2. Remove external_id column from locations table and location seeding step [#9974](https://github.com/opencrvs/opencrvs-core/issues/9974)

- **Updated environment variable**

  - Renamed `COUNTRY_CONFIG_URL` → `COUNTRY_CONFIG_URL_EXTERNAL` in the auth service to make its purpose clearer and more explicit.

- Tiltfile: Improved Kubernetes support for development environment [#10672](https://github.com/opencrvs/opencrvs-core/issues/10672)

### Bug fixes

- Fix informant details not populating in API [#10311](https://github.com/opencrvs/opencrvs-core/issues/10311)

## [1.8.1](https://github.com/opencrvs/opencrvs-core/compare/v1.8.0...v1.8.1)

### Bug fixes

- Inactive health facilities still appear in the Place of birth / death select [#9311](https://github.com/opencrvs/opencrvs-core/issues/9311)
- After migrating to v1.7 task history shows legacy system role rather than new role based on alias [#9989](https://github.com/opencrvs/opencrvs-core/issues/9989)
- Setup hardened CSP for client and login containers [#9584](https://github.com/opencrvs/opencrvs-core/issues/9584)
- Apostrophes in role names are generated but are not supported [#10049](https://github.com/opencrvs/opencrvs-core/issues/10049)
- Reconfigured Content Security Policy (CSP) to be more restrictive, enhancing protection against unauthorized content sources [#9594](https://github.com/opencrvs/opencrvs-core/issues/9584)
- Ensure that place of birth/death only shows active facilities/offices on the form [#9311](https://github.com/opencrvs/opencrvs-core/issues/9311)
- Limit year past record `LIMIT_YEAR_PAST_RECORDS` forcing date of birth to start from the year 1900 has been addressed [#9326](https://github.com/opencrvs/opencrvs-core/pull/9326)

## [1.8.0](https://github.com/opencrvs/opencrvs-core/compare/v1.7.4...v1.8.0)

### New features

- **Kubernetes support for local development** Introduced Tiltfile for OpenCRVS deployment on local Kubernetes cluster. Check https://github.com/opencrvs/infrastructure for more information.
- Build OpenCRVS release images for arm devices [#9455](https://github.com/opencrvs/opencrvs-core/issues/9455)
- **New form components**

  - `ID_READER` - Parse the contents of a QR code and pre-populate some fields in the form
  - `HTTP` - Allows making HTTP requests to external APIs. Used in conjunction with `BUTTON` component to trigger the request & the response can be used to pre-populate fields in the form
  - `BUTTON` - Used to trigger actions in the form, such as a `HTTP` component
  - `LINK_BUTTON` - Redirect to a URL when clicked
  - `ID_VERIFICATION_BANNER` - A banner component that can be used to display information about the ID verification process

  More on how these components can be used can be found here: [In-form authentication/verification](https://documentation.opencrvs.org/technology/interoperability/national-id-client/in-form-authentication-verification)

### Bug fixes

- When the building the graphql payload from form data, we now check if a field was changed. If so then include it in the payload even if it might have been changed to an empty value.[#9369](https://github.com/opencrvs/opencrvs-core/issues/9369)

### Improvements

- Improved text color for disabled text inputs and dropdowns
- **Github runners upgraded** to latest Ubuntu LTS release 24.04 [#7045](https://github.com/opencrvs/opencrvs-core/issues/7045)
- **Switch to GitHub Packages** from Docker hub [#6910](https://github.com/opencrvs/opencrvs-core/issues/6910)
- **Upgrade Elasticsearch** to a AGPLv3 licensed version 8.16.4 [#8749](https://github.com/opencrvs/opencrvs-core/issues/8749)
- **`GH_TOKEN` secret is deprecated** and replaced with `GITHUB_GHCR_PUBLISH_TOKEN` and `E2E_WORKFLOWS_TOKEN` secrets. `GH_TOKEN` secret was widely used within workflows for manipulations with PRs and triggering e2e and deploy workflows in Country config template repositories. We segregated tokens with more restricted access. Please create following secrets in your repository:
  - Secret `GITHUB_GHCR_PUBLISH_TOKEN` is classic token with permissions `repo, write:packages`. Required to build and push OpenCRVS Core images.
  - Secret `E2E_WORKFLOWS_TOKEN` is fine-grained token scoped to your fork of country config template repository with permissions `Contents: Read and Write`.
- Created a standalone `data-seeder` Docker image to decouple seeding logic from the core repository. This improves GitHub Actions runtime by avoiding full repository clone and dependency installation during environment seeding. [#8976](https://github.com/opencrvs/opencrvs-core/issues/8976)

## [1.7.4](https://github.com/opencrvs/opencrvs-core/compare/v1.7.3...v1.7.4)

### Bug fixes

- Fixed historical roles displaying incorrectly in task history after migration to v1.7 [#9989](https://github.com/opencrvs/opencrvs-core/issues/9989)
- Remove special characters from role ids on generation [#10049](https://github.com/opencrvs/opencrvs-core/issues/10049)

## [1.7.3](https://github.com/opencrvs/opencrvs-core/compare/v1.7.2...v1.7.3)

### New features

### Bug fixes

- Allow booleanTransformer to be used as a certificate handlebar template transformer [#9631](https://github.com/opencrvs/opencrvs-core/issues/9631)
- Fix international to local number conversion from failing if the number was already local [#9634](https://github.com/opencrvs/opencrvs-core/issues/9634)
- Pre-select default certificate option in print certificate collector form [#9935](https://github.com/opencrvs/opencrvs-core/issues/9935)

## [1.7.2](https://github.com/opencrvs/opencrvs-core/compare/v1.7.1...v1.7.2)

### New features

- **TimeField component with AM/PM support**: The `TimeField` component now supports both 12-hour (AM/PM) and 24-hour formats through a new prop, `use12HourFormat: boolean`. The logic has been refactored into two separate components, `TimeInput24` and `TimeInput12`. The `TimeField` component automatically selects the appropriate component based on the prop. [#8336](https://github.com/opencrvs/opencrvs-core/issues/8336)
- **Configurable Scopes**: Introduce a new syntax for scopes which provides more customizability to the SI's via scopes. Two new scopes `user.create[role=a|b|c]` & `user.update[role=d|e|f]` are getting included in this release which can be used to restrict what the role of a newly created or updated user can be set to by the user of a particular role. Gradually most of the existing scopes will be migrated to use this new syntax.
- **New Full Honorific Name Field**: An optional `fullHonorificName` field has been added to the user management page to capture the complete name of a user including their title or honorific. This field can be used for display purposes, including rendering the name appropriately on certificates.

### Bug fixes

- Filter out inactive locations in the Organisations menu [#8782](https://github.com/opencrvs/opencrvs-core/issues/8782)
- Improve quick search results when searching by name [#9272](https://github.com/opencrvs/opencrvs-core/issues/9272)
- Fix practitioner role history entries from being created with every view and download [#9462](https://github.com/opencrvs/opencrvs-core/issues/9462)
- Fix a child's NID form field cannot be added either manually or via ESignet. A father section cannot be placed before a mother section if you wish to use a radio button to control mapping addresses from one individual to another to make data entry easier [#9582](https://github.com/opencrvs/opencrvs-core/issues/9582)
- Fixed deduplication for records created from event notifications with identical details. [#9532](https://github.com/opencrvs/opencrvs-core/pull/9532)
- Fix the role of the certifier unable to get resolved for new users which in turn caused the download of the declaration to fail [#9643](https://github.com/opencrvs/opencrvs-core/issues/9643)
- Fix one failing unassign blocking all other unassign actions from continuing [#9651](https://github.com/opencrvs/opencrvs-core/issues/9651)
- Fix record not getting unassigned when validating an already validated record again [#9648](https://github.com/opencrvs/opencrvs-core/issues/9648)

## [1.7.1](https://github.com/opencrvs/opencrvs-core/compare/v1.7.0...v1.7.1)

### Bug fixes

- Use the first role assigned to a user for record history entry if no role found at the point of time when the action was performed [#9300](https://github.com/opencrvs/opencrvs-core/issues/9300)

## [1.7.0](https://github.com/opencrvs/opencrvs-core/compare/v1.6.2...v1.7.0)

### Breaking changes

- **Dashboard:** Changes made to the dashboard configuration will reset after upgrading OpenCRVS.
- Removed unused searchBirthRegistrations and searchDeathRegistrations queries, as they are no longer used by the client.
- **Retrieve action deprecated:** Field agents & registration agents used to be able to retrieve records to view the audit history & PII. We are removing this in favor of audit capabilities that is planned for in a future release.

### New features

- Allow configuring the default search criteria for record search [#6924](https://github.com/opencrvs/opencrvs-core/issues/6924)
- Add checks to validate client and server are always on the same version. This prevents browsers with a cached or outdated client versions from making potentially invalid requests to the backend [#6695](https://github.com/opencrvs/opencrvs-core/issues/6695)
- Two new statuses of record are added: `Validated` and `Correction Requested` for advanced search parameters [#6365](https://github.com/opencrvs/opencrvs-core/issues/6365)
- A new field: `Time Period` is added to advanced search [#6365](https://github.com/opencrvs/opencrvs-core/issues/6365)
- Deploy UI-Kit Storybook to [opencrvs.pages.dev](https://opencrvs.pages.dev) to allow extending OpenCRVS using the component library
- Record audit action buttons are moved into action menu [#7390](https://github.com/opencrvs/opencrvs-core/issues/7390)
- Reoder the sytem user add/edit field for surname to be first, also change labels from `Last name` to `User's surname` and lastly remove the NID question from the form [#6830](https://github.com/opencrvs/opencrvs-core/issues/6830)
- Corrected the total amount displayed for _certification_ and _correction_ fees on the Performance Page, ensuring accurate fee tracking across certification and correction sequences. [#7793](https://github.com/opencrvs/opencrvs-core/issues/7793)
- Auth now allows registrar's token to be exchanged for a new token that strictly allows confirming or rejecting a specific record. Core now passes this token to country configuration instead of the registrar's token [#7728](https://github.com/opencrvs/opencrvs-core/issues/7728) [#7849](https://github.com/opencrvs/opencrvs-core/issues/7849)
- **Template Selection for Certified Copies**: Added support for multiple certificate templates for each event (birth, death, marriage). Users can now select a template during the certificate issuance process.
- **Template-based Payment Configuration**: Implemented payment differentiation based on the selected certificate template, ensuring the correct amount is charged.
- **Template Action Tracking**: Each template printed is tracked in the history table, showing which specific template was used.
- **Template Selection Dropdown**: Updated print workflow to include a dropdown menu for template selection when issuing a certificate.
- **QR code scanner**: A form field component allows pre-populating informant's details based on a ID card [#8196](https://github.com/opencrvs/opencrvs-core/pull/8196)
- Introduced a new customisable UI component: Banner [#8276](https://github.com/opencrvs/opencrvs-core/issues/8276)
- Auth now allows exchanging user's token for a new record-specific token [#7728](https://github.com/opencrvs/opencrvs-core/issues/7728)
- A new GraphQL mutation `upsertRegistrationIdentifier` is added to allow updating the patient identifiers of a registration record such as NID [#8034](https://github.com/opencrvs/opencrvs-core/pull/8034)
- A new GraphQL mutation `updateField` is added to allow updating any field in a record [#8291](https://github.com/opencrvs/opencrvs-core/pull/8291)
- Updated GraphQL mutation `confirmRegistration` to allow adding a `comment` for record audit [#8197](https://github.com/opencrvs/opencrvs-core/pull/8197)
- Add `isAgeInYearsBetween` validator to enable validation that will constraint a date to be only valid if it falls within a specified date range. The `isInformantOfLegalAge` validator is now deprecated and removed in favor of `isAgeInYearsBetween` validator [#7636](https://github.com/opencrvs/opencrvs-core/issues/7636)
- Allow countries to customise the format of the full name in the sytem for `sytem users` and `citizens` e.g `{LastName} {MiddleName} {Firstname}`, in any case where one of the name is not provided e.g no `MiddleName`, we'll simply render e.g `{LastName} {FirstName}` without any extra spaces if that's the order set in `country-config`. [#6830](https://github.com/opencrvs/opencrvs-core/issues/6830)

### Improvements

- Auth token, ip address, remote address redacted from server log
- **Align Patient data model with FHIR**: Previously we were using `string[]` for `Patient.name.family` field instead of `string` as mentioned in the FHIR standard. We've now aligned the field with the standard.
- **Certificate Fetching**: Removed certificates from the database, allowing them to be fetched directly from the country configuration via a simplified API endpoint.

### Deprecated

- `validator-api` & `age-verification-api` & `nationalId` scopes are deprecated as unused. Corresponding scopes are removed from the `systemScopes` and also removed from the audience when creating the token [#7904](https://github.com/opencrvs/opencrvs-core/issues/7904)

### Bug fixes

- Fix task history getting corrupted if a user views a record while it's in external validation [#8278](https://github.com/opencrvs/opencrvs-core/issues/8278)
- Fix health facilities missing from dropdown after correcting a record address [#7528](https://github.com/opencrvs/opencrvs-core/issues/7528)
- "Choose a new password" form now allows the user to submit the form using the "Enter/Return" key [#5502](https://github.com/opencrvs/opencrvs-core/issues/5502)
- Dropdown options now flow to multiple rows in forms [#7653](https://github.com/opencrvs/opencrvs-core/pull/7653)
- Only render units/postfix when field has a value [#7055](https://github.com/opencrvs/opencrvs-core/issues/7055)
- Only show items with values in review [#5192](https://github.com/opencrvs/opencrvs-core/pull/5192)
- Fix prefix text overlap issue in form text inputs
- Fix the informant column on the Perfomance page showing "Other family member" when `Someone else` is selected for a registration [#6157](https://github.com/opencrvs/opencrvs-core/issues/6157)
- Fix the event name displayed in email templates for death correction requests [#7703](https://github.com/opencrvs/opencrvs-core/issues/7703)
- Fix the "email all users" feature by setting the _To_ email to the logged user's email [#8343](https://github.com/opencrvs/opencrvs-core/issues/8343)

## [1.6.5](https://github.com/opencrvs/opencrvs-core/compare/v1.6.4...v1.6.5)

### Bug fixes

- Reconfigured Content Security Policy (CSP) to be more restrictive, enhancing protection against unauthorized content sources [#9594](https://github.com/opencrvs/opencrvs-core/issues/9584)
- Ensure that place of birth/death only shows active facilities/offices on the form [#9311](https://github.com/opencrvs/opencrvs-core/issues/9311)

### Breaking changes

- Limit year past record `LIMIT_YEAR_PAST_RECORDS` forcing date of birth to start from the year 1900 has been addressed [#9326](https://github.com/opencrvs/opencrvs-core/pull/9326)

## [1.6.4](https://github.com/opencrvs/opencrvs-core/compare/v1.6.3...v1.6.4)

### Bug fixes

- Fix migration issue discovered when restoring an OpenCRVS instance with a large number of records. `$push used too much memory and cannot spill to disk. Memory limit: 104857600 bytes` [#9116](https://github.com/opencrvs/opencrvs-core/issues/9116)

## [1.6.3](https://github.com/opencrvs/opencrvs-core/compare/v1.6.2...v1.6.3)

### Bug fixes

- Add 6th level support for addresses [#6956](https://github.com/opencrvs/opencrvs-core/issues/6956)
- Fix rendering of Custom Date fields [#8885](https://github.com/opencrvs/opencrvs-core/issues/8885)
- Fix slow render of location options [#8562](https://github.com/opencrvs/opencrvs-core/pull/8562)
- Fix a bug in the POST `{{gateway}}/locations` endpoint used to create new locations , the check to verify if a `statisticalId` was already used was broken so we've fixed that. This was picked when we were trying to seed a location for a country via the endpoint [#8606](https://github.com/opencrvs/opencrvs-core/issues/8606)
- Fix rendering of Custom Date fields [#8885](https://github.com/opencrvs/opencrvs-core/issues/8885)

### Improvements

- For countries where local phone numbers start with 0, we now ensure the prefix remains unchanged when converting to and from the international format.

## [1.6.2](https://github.com/opencrvs/opencrvs-core/compare/v1.6.1...v1.6.2)

### Deprecated

- `INFORMANT_SIGNATURE` & `INFORMANT_SIGNATURE_REQUIRED` are now deprecated and part of form config

### Bug fixes

- Fix task history getting corrupted if a user views a record while it's in external validation [#8278](https://github.com/opencrvs/opencrvs-core/issues/8278)
- Fix health facilities missing from dropdown after correcting a record address [#7528](https://github.com/opencrvs/opencrvs-core/issues/7528)
- Fix stale validations showing for document uploader with options form field
- Fix a bug in the POST `{{gateway}}/locations` endpoint used to create new locations, the check to verify if a `statisticalId` was already used was broken so we've fixed that. This was picked when we were trying to seed a location for a country via the endpoint [#8606](https://github.com/opencrvs/opencrvs-core/issues/8606)

### Improvements

- Support for 6th administrative level

## [1.6.1](https://github.com/opencrvs/opencrvs-core/compare/v1.6.0...v1.6.1)

### Bug fixes

- Maximum upload file size limit is now based on the size of the uploaded files after compression and not before. [#7840](https://github.com/opencrvs/opencrvs-core/issues/7840)
- Stops local sys admins creating national level users. [#7698](https://github.com/opencrvs/opencrvs-core/issues/7698)

### New features

- Add an optional configurable field in section `canContinue` which takes an expression. Falsy value of this expression will disable the continue button in forms. This can be used to work with fetch field which has a loading state and prevent the user to get past the section while the request is still in progress.

## [1.6.0](https://github.com/opencrvs/opencrvs-core/compare/v1.5.1...v1.6.0)

### Breaking changes

- Remove informant notification configuration from the UI and read notification configuration settings from `record-notification` endpoint in countryconfig
- Remove DEL /elasticIndex endpoint due to reindexing changes.
- **Gateways searchEvents API updated** `operationHistories` only returns `operationType` & `operatedOn` due to the other fields being unused in OpenCRVS
- **Config changes to review/preview and signatures** Core used to provide review/preview section by default which are now removed and need to be provided from countryconfig. The signature field definitions (e.g. informant signature, bride signature etc.) were hard coded in core which also have now been removed. The signatures can now be added through the review/preview sections defined in countryconfig just like any other field. You can use the following section definition as the default which is without any additional fields. We highly recommend checking out our reference country repository which has the signature fields in its review/preview sections

```
{
  id: 'preview',
  viewType: 'preview',
  name: {
    defaultMessage: 'Preview',
    description: 'Form section name for Preview',
    id: 'register.form.section.preview.name'
  },
  title: {
    defaultMessage: 'Preview',
    description: 'Form section title for Preview',
    id: 'register.form.section.preview.title'
  },
  groups: [
    {
      id: 'preview-view-group',
      fields: []
    }
  ]
}
```

- `hasChildLocation` query has been removed from gateway. We have created the query `isLeafLevelLocation` instead which is more descriptive on its intended use.

### New features

- **Conditional filtering for document select options** The select options for the DOCUMENT_UPLOADER_WITH_OPTION field can now be conditionally filtered similar to the SELECT_WITH_OPTIONS field using the `optionCondition` field
- Supporting document fields can now be made required
- If there is only one option in the document uploader select, then it stays hidden and only the upload button is showed with the only option being selected by default
- A new certificate handlebar "preview" has been added which can be used to conditionally render some svg element when previewing the certificate e.g. background image similar to security paper
- Add HTTP request creation ability to the form with a set of new form components (HTTP, BUTTON, REDIRECT) [#7489](https://github.com/opencrvs/opencrvs-core/issues/7489)

### Improvements

- **ElasticSearch reindexing** Allows reindexing ElasticSearch via a new search-service endpoint `reindex`. We're replacing the original `ocrvs` index with timestamped ones. This is done automatically when upgrading and migrating, but this is an important architectural change that should be noted. More details in [#7033](https://github.com/opencrvs/opencrvs-core/pull/7033).
- Internally we were storing the `family` name field as a required property which was limiting what how you could capture the name of a person in the forms. Now we are storing it as an optional property which would make more flexible.
- Remove the leftover features from the application config pages, such as certificates and informant notification. [#7156](https://github.com/opencrvs/opencrvs-core/issues/7156)
- **PDF page size** The generated PDF used to be defaulted to A4 size. Now it respects the SVG dimensions if specified
- Support html content wrapped in `foreignObject` used in svg template in certificate PDF output

### Bug fixes

- Custom form field validators from country config will work offline. [#7478](https://github.com/opencrvs/opencrvs-core/issues/7478)
- Registrar had to retry from outbox every time they corrected a record. [#7583](https://github.com/opencrvs/opencrvs-core/issues/7583)
- Local environment setup command (`bash setup.sh`) could fail in machines that didn't have a unrelated `compose` binary. Fixed to check for Docker Compose. [#7609](https://github.com/opencrvs/opencrvs-core/pull/7609)
- Fix wrong status shown in the Comparison View page of the duplicate record [#7439](https://github.com/opencrvs/opencrvs-core/issues/7439)
- Fix date validation not working correctly in Firefox [#7615](https://github.com/opencrvs/opencrvs-core/issues/7615)
- Fix layout issue that was causing the edit button on the AdvancedSearch's date range picker to not show on mobile view. [#7417](https://github.com/opencrvs/opencrvs-core/issues/7417)
- Fix hardcoded placeholder copy of input when saving a query in advanced search
- Handle label params used in form inputs when rendering in action details modal
- **Staged files getting reset on precommit hook failure** We were running lint-staged separately on each package using lerna which potentially created a race condition causing staged changes to get lost on failure. Now we are running lint-staged directly without depending on lerna. **_This is purely a DX improvement without affecting any functionality of the system_**
- Fix `informantType` missing in template object which prevented rendering informant relationship data in the certificates [#5952](https://github.com/opencrvs/opencrvs-core/issues/5952)
- Fix users hitting rate limit when multiple users authenticated the same time with different usernames [#7728](https://github.com/opencrvs/opencrvs-core/issues/7728)
- "Choose a new password" form now allows the user to submit the form using the "Enter/Return" key [#5502](https://github.com/opencrvs/opencrvs-core/issues/5502)
- Dropdown options now flow to multiple rows in forms [#7653](https://github.com/opencrvs/opencrvs-core/pull/7653)
- Only render units/postfix when field has a value [#7055](https://github.com/opencrvs/opencrvs-core/issues/7055)
- Only show items with values in review [#5192](https://github.com/opencrvs/opencrvs-core/pull/5192)
- Fix prefix text overlap issue in form text inputs

## 1.5.1

### Improvements

- Fetch child identifier in view record
- Home screen application’s name and icons are to be configured from country configuration package as manifest.json and app icon files are moved from core to country config (check `opencrvs-countryconfig/src/client-static` folder)

### Bug fixes

- On slow connections or in rare corner cases, it was possible that the same record got saved to the database twice. This was caused by a bug in how the unique technical identifier we generate were stored as FHIR. The backend now ensures every record is submitted only once. [#7477](https://github.com/opencrvs/opencrvs-core/issues/7477)
- Fixed an issue where address line fields (e.g., address line 1, address line 2, etc.) were not being updated correctly when a user attempted to update a record's event location, such as place of birth or place of death. [#7531](https://github.com/opencrvs/opencrvs-core/issues/7531)
- Handle label params used in form inputs when rendering in review section view
- Fix probable migration issues for countries migrating from 1.2 [#7464](https://github.com/opencrvs/opencrvs-core/issues/7464)
- When a declaration(birth/death) is created the event location information was not being parsed to ElasticSearch which caused the Advanced search feature to not work when searching for records by event location.[7494](https://github.com/opencrvs/opencrvs-core/issues/7494)
- When any user's role was updated, incorrect role was shown for that user's actions in the history section of a declaration's record audit page. [#7495](https://github.com/opencrvs/opencrvs-core/issues/7495)
- Registration agent was unable to download declarations that were previously corrected by registrar. [#7582](https://github.com/opencrvs/opencrvs-core/issues/7582)
- When a user updates a marriage declaration editing the signature of the bride, groom, witness one or witness two, handle the changed value of the signature properly. [#7462](https://github.com/opencrvs/opencrvs-core/issues/7462)
- Registration agent was unable to download declarations that were previously corrected by registrar. [#7582](https://github.com/opencrvs/opencrvs-core/issues/7582)
- The internal function we used to check if all the location references listed in the encounter are included in the bundle had incorrect logic which resulted in location details missing in ElasticSearch which broke Advanced search. [7494](https://github.com/opencrvs/opencrvs-core/issues/7494)

## [1.5.0](https://github.com/opencrvs/opencrvs-core/compare/v1.4.1...v1.5.0)

### Breaking changes

- **Removed dependency on OpenHIM**

  The performance of OpenHIM added an unexpected burden of 200 m/s to every interaction. Cumulatively, this was negatively affecting user experience and therefore we decided to deprecate it.&#x20;

  &#x20;Interested implementers are free to re-introduce OpenHIM should they wish to use it as an interoperability layer without affecting the performance of OpenCRVS now that our architecture no longer depends on it.

  The OpenHIM database is kept for backwards compatibility reasons and will be removed in v1.6. [OpenHIM](https://openhim.org/) is an Open Source middleware component designed for managing FHIR interoperability between disparate systems as part of the OpenHIE architectural specification. We had been using this component in a much more fundamental way to monitor microservice comms in a similar fashion to Amazon SQS. &#x20;

- **Upgrade node version to 18**

  This version enforces environment to have Node 18 installed (supported until April 2025) and removes support for Node 16

  - Use nvm to upgrade your local development environment to use node version `18.19.x.`
  - Specified operating systems in js modules as `darwin, linux`
  - Dev scripts and Vite run with an environment variable `NODE_OPTIONS=--dns-result-order=ipv4first` to resolve ipv4 addresses for `localhost` to support systems that resolves ipv6 addresses by default in Node versions >=17

- **Update the certificate preview mechanism** In effort of minimizing JavaScript-bundle size, we have streamlined the way how review certificate -page renders certificates. In case the images in your certificates are previewing blurry, you need to update your SVG-certificates to print QR-codes and other images directly with `<image width="36" height="36" xlink:href="{{qrCode}}" x="500" y="770"></image>` instead of the more complicated `<rect fill="url(#pattern)"></rect>` -paradigm. This doesn't affect printed certificates as they are still created as previously.
- **Generate default address according to logged-in user's location** We have dropped support for the 'agentDefault' prop which was used as initial value for SELECT_WITH_DYNAMIC_OPTIONS fields. If you have not made any changes to address generation, then this should not affect you. If you have, you can refer to this PR to see how agentDefault has been deprecated in an example country: [https://github.com/opencrvs/opencrvs-farajaland/pull/978](https://github.com/opencrvs/opencrvs-farajaland/pull/978)
- **Remove system admin UI items: Application, User roles** We have now moved to configuring these items away from the UI in favour of directly editing these from country configuration repository in code - specifically in application-config-default.ts.
- **Set Metabase default credentials.** These must be configured via countryconfig repository environment variables and secrets otherwise the dashboard service won't start: OPENCRVS_METABASE_ADMIN_EMAIL & OPENCRVS_METABASE_ADMIN_PASSWORD
- **Check your Metabase map file.** For Metabase configuration, we renamed `farajaland-map.geojson` to `map.geojson` to not tie implementations into example country naming conventions.
- **Feature flags** In order to make application config settings more readable, we re-organised `src/api/application/application-config-default.ts` with a clear feature flag block like so. These are then used across the front and back end of the application to control configurable functionality. New feature flags DEATH_REGISTRATION allow you to optionally run off death registration if your country doesnt want to run its first pilot including death and PRINT_DECLARATION (see New Features) have been added.
  `FEATURES: {
DEATH_REGISTRATION: true,
MARRIAGE_REGISTRATION: false,
...
} `
- **Improve rendering of addresses in review page where addresses match** When entering father's address details, some countries make use of a checkbox which says "Address is the same as the mothers. " which, when selected, makes the mother's address and fathers address the same. The checkbox has a programatic value of "Yes" or "No". As a result on the review page, the value "Yes" was displayed which didn't make grammatical sense as a response. We decided to use a custom label: "Same as mother's", which is what was asked on the form. This requires some code changes in the src/form/addresses/index.ts file to pull in the `hideInPreview` prop which will hide the value "Yes" on the review page and replace with a content managed label. Associated bug [#5086](https://github.com/opencrvs/opencrvs-core/issues/5086)

### Infrastructure breaking changes

More improvements have been made to the infrastructure provisioning and Github environment creation scripts and documentation. The complexity is somewhat reduced.

- **We removed the example Wireguard VPN set up as it was confusing.** Our intention was to ensure that all implementers were aware that OpenCRVS should be installed behind a VPN and used Wireguard as an example. But the configuration requirements for Wireguard confused implementers who are not using it. Therefore we decided to remove Wireguard as an example. &#x20;
- **We now have a "backup" Github environment and the backup server is automatically provisioned.** We moved the inventory file location to an explicit directory and removed parameters to scripts that can be automated. To migrate, move all inventory files (qa.yml, production.yml, staging.yml from `infrastructure/server-setup` to `infrastructure/server-setup/inventory` and configure `infrastructure/server-setup/inventory/backup.yml`. Run environment creator for your backup server `yarn environment:init --environment=backup`
- **You can configure the file path on the backup server where backups are stored.** We can also allow using staging to both periodically restore a production backup and also give it the capability if required to backup it's own data to a different location using `backup_server_remote_target_directory` and `backup_server_remote_source_directory` Ansible variables. This use case is mostly meant for OpenCRVS team internal use.
- **We now automate SSH key exchange between application and backup server.** For staging servers, automatically fetch production backup encryption key if periodic restore is enabled using `ansible_ssh_private_key_file` Ansible variables. Therefore documentation is simplified for a new server set-up.
- **In infrastructure Github workflows: SSH_PORT is new and required allowing you the ability to use a non-standard SSH port.** This Github Action environment variable must be added.
- **In infrastructure Github workflows: SSH_HOST** should be moved from being a Github Action environment secret to a Github Action environment variable before it is deprecated in 1.7.0
- **No longer an assumption made that production server Docker replicas and Mongo replica-sets are necessary.** In our Docker Compose files, we had originally assumed that a production deployment would always be deployed on a cluster to enable load balancing. We applied a [Mongo replica set](https://github.com/opencrvs/opencrvs-countryconfig/blob/48cf278bab9d17e07b60b427294a26c8f35bcc1b/infrastructure/docker-compose.production-deploy.yml#L170C3-L201C19) by default on production and set [replicas: 2](https://github.com/opencrvs/opencrvs-countryconfig/blob/48cf278bab9d17e07b60b427294a26c8f35bcc1b/infrastructure/docker-compose.production-deploy.yml#L124) on each microservice. However after experience in multiple countries running small scale pilots, a production deployment usually starts off as 1 server node and then scales into a cluster over time in order to save costs and resources. Therefore these replicas are a waste of resources. So you will notice that this has been deleted. You can always manually add your desired replicas back into you Docker Compose configuration if you want. In Docker Compose files, search for REPLICAS and update accordingly as well as attending to the linked examples.

Follow the descriptions in the migration notes to re-provision all servers safely.

### New features

- Introduced rate limiting to routes that could potentially be bruteforced or extracted PII from.
- The login and client application loading experience has improved. A loading bar appears before the javaScript bundle has loaded and this transitions when fetching records.&#x20;
- Development time logs are now much tidier and errors easier to point out. Production logging will still remain as is.&#x20;
- Masked emails and phone numbers from notification logs.
- Support for landscape certificate templates.
- Allow defining maxLength attribute for number type fields.
- A new certificate handlebar for registration fees has been added `registrationFees`
- A new certificate handlebar for logged-in user details has been added `loggedInUser`&#x20;
- Add support for image compression configuration. Two new properties to this form field are available: `DOCUMENT_UPLOADER_WITH_OPTION`
  - `compressImagesToSizeMB` : An optional prop of number type to define a compressed size. Compression is ignored when the input file is already smaller or equal of the given value or a falsy given value.
  - `maxSizeMB`: An optional validation prop to prevent input of a file bigger than a defined value.
- If a country doesnt wish to use Sentry for logging errors, the SENTRY_DSN variable is now optional and the LogRocket option has been deprecated due to lack of demand.
- Given that upon an upgrade between versions of OpenCRVS, that users cache is cleared, it is important to inform staff to submit any draft applications before the upgrade date. We introduced an "Email all users" feature so that National System Admins can send all staff messages. This feature can be used for any other all staff comms that are deemed required.

<figure><img src="../../.gitbook/assets/Screenshot 2024-06-25 at 17.12.54.png" alt=""><figcaption></figcaption></figure>

- Included an endpoint for serving individual certificates in development mode. This improves the developer experience when configuring certificates.
- Removed logrocket refrences.
- Enable gzip compression in client & login
- Use docker compose v2 in github workflows
- Added SMTP environment variables into the qa compose file to enable QA of SMTP servers.
- In the certificate, the 'Place of Certification' now accurately reflects the correct location.
- Groom's and Bride's name, printIssue translation variables updated [#124](https://github.com/opencrvs/opencrvs-countryconfig/pull/124)
- Add query mapper for International Postal Code field
- Provide env variables for metabase admin credentials
- Improved formatting of informant name for inProgress declaration emails
- There is now an option to print the review page of an event declaration form. The PRINT_DECLARATION feature flag in application config settings can enable this on or off.

### Bug fixes

- Handle back button click after issuing a declaration [#6424](https://github.com/opencrvs/opencrvs-core/issues/6424)
- Fix certificate verification QR code for a death declaration [#6230](https://github.com/opencrvs/opencrvs-core/issues/6230#issuecomment-1996766125)
- Fix certificate verification QR code crashing when gender is unknown [#6422](https://github.com/opencrvs/opencrvs-core/issues/6422)
- Fix certificate verification page missing registration center and the name of registrar [#6614](https://github.com/opencrvs/opencrvs-core/issues/6614)
- Amend certificate verification showing the certifying date instead of records creation date [#7098](https://github.com/opencrvs/opencrvs-core/pull/7098)
- Fix records not getting issued [#6216] (https://github.com/opencrvs/opencrvs-core/issues/6216)
- Fix record correction e2e failing due to stale data getting saved on redux
- Convert eventDates to LocalDate before formatting [#6719](https://github.com/opencrvs/opencrvs-core/issues/6719)
- In advance search, any status tag is showing archived after search [#6678](https://github.com/opencrvs/opencrvs-core/issues/6678)
- Fix first name issues when creating a user [#6631](https://github.com/opencrvs/opencrvs-core/issues/6631)
- Show correct record option in certificate preview page when trying to print by RA [#6224](https://github.com/opencrvs/opencrvs-core/issues/6224)
- Fix certificate templates not getting populated for health facility event locations & ADMIN_LEVEL > 2
- Fix download failure for incomplete (without date of death) death declarations [#6807](https://github.com/opencrvs/opencrvs-core/issues/6807)
- Fix search result declaration record audit unassign issue [#5781](https://github.com/opencrvs/opencrvs-core/issues/5781)
- In review page, Eliminating the 'No supporting documents' and 'upload' prompts when documents are already uploaded [#6231] (https://github.com/opencrvs/opencrvs-core/issues/6231)
- Fix Registrar of any location should be able to review a correction request [#6247](https://github.com/opencrvs/opencrvs-core/issues/6247)
- remove upload button when no supporting docs are configured [#5944](https://github.com/opencrvs/opencrvs-core/issues/5944)
- Fix issues of invisible inputs when navigating from can't login link in login page [#6163](https://github.com/opencrvs/opencrvs-core/issues/6163)
- Fix the "Continue" button being disabled when changes in correction form is made [#6780](https://github.com/opencrvs/opencrvs-core/issues/6780)
- Remove leading slash from `resendAuthenticationCode` in login to fix resend email button [#6987](https://github.com/opencrvs/opencrvs-core/issues/6987) [#7037](https://github.com/opencrvs/opencrvs-core/issues/7037)
- Fix dashboard cron jobs not working [#7016](https://github.com/opencrvs/opencrvs-core/issues/7016)
- Fix client modal glitches on integrations page [#7002] (https://github.com/opencrvs/opencrvs-core/issues/7002)
- Fix 'Place of Certification' is showing wrong in certificate [#7060] (https://github.com/opencrvs/opencrvs-core/issues/7060)
- Fix Check for valid date to handle incomplete marriage declarations [#7017](https://github.com/opencrvs/opencrvs-core/issues/7017)
- Fix session expiration when user tries to change phone number [#7003](https://github.com/opencrvs/opencrvs-core/pull/7025)
- Fix French translation missing for relationship to informant when trying to correct record, print and issue record [#6341] (https://github.com/opencrvs/opencrvs-core/issues/6341)
- Fix print record page for an unsaved declaration [#6893](https://github.com/opencrvs/opencrvs-core/issues/6893)
- Fix Reset pagination to default page (1) when location changes in UserList [#6481](https://github.com/opencrvs/opencrvs-core/issues/6481)
- Fix unassign action not appearing in audit history [#7035](https://github.com/opencrvs/opencrvs-core/pull/7072)
- Fix client modal glitches on integrations page [#7002](https://github.com/opencrvs/opencrvs-core/issues/7002)
- Fix address property handling and corrected country data transformation logic [#6989](https://github.com/opencrvs/opencrvs-core/issues/6989)
- Fix "Print and issue to groom|bride" is added to a different variable [#7066](https://github.com/opencrvs/opencrvs-core/pull/7066)
- Fix search query is not being saved in the advanced search results [#7110](https://github.com/opencrvs/opencrvs-core/pull/7117)
- Fix Removed duplicateTrackingId check in createDuplicateTask method [#7081](https://github.com/opencrvs/opencrvs-core/pull/7081)
- Fix Disabling 'Mark as duplicate' button when duplicate reason is empty too [#7083](https://github.com/opencrvs/opencrvs-core/pull/7083)
- Fix correction done from a certificate preview page [#7065](https://github.com/opencrvs/opencrvs-core/pull/7093)
- Fix certificate overflowing in preview certificate view [#7157](https://github.com/opencrvs/opencrvs-core/pull/7157)
- Fix records going completely missing when an unexpected error happens in the backend [#7021](https://github.com/opencrvs/opencrvs-core/pull/7021)
- Fix search indexing BRN's in place of identifiers. Adds spouseIdentifier to search with [#7189](https://github.com/opencrvs/opencrvs-core/pull/7189)
- Rename `farajaland-map.geojson` in dashboards to `map.geojson` to not tie opencrvs-core into a specific country implementation name [#7251](https://github.com/opencrvs/opencrvs-core/pull/7251)
- Update advanced search list properly when assignments change [#7307](https://github.com/opencrvs/opencrvs-core/pull/7307)
- Update Content-Security-Policy to allow loading fonts from country configuration [#7296](https://github.com/opencrvs/opencrvs-core/pull/7296)
- Fix frontend crashing on 'Registration by Status' under performance due to missing translations [#7129](https://github.com/opencrvs/opencrvs-core/pull/7129)
- Fix email of practitioner to be saved in hearth. A migration is added to correct the email of practitoiner in existing db. [7315](https://github.com/opencrvs/opencrvs-core/pull/7315)
- Fix inaccessible and only partly visible "Edit" button in "Advanced Search" - feature's date range list [7485](https://github.com/opencrvs/opencrvs-core/pull/7485)

## [1.3.4](https://github.com/opencrvs/opencrvs-core/compare/v1.3.3...v1.3.4)

### Bug fixes

- #### Include middlename when generating fullnames
  - Refactored out the scattered logic for generating fullnames and converged them into a single function
  - Make lastname optional for a registered declaration
- #### Recognize occupation as an optional field in informant section
- #### Fix download failure when `arrayToFieldTransormer` is used in template mapping
- #### Fix multiple records not being downloaded simultaneously [#6492](https://github.com/opencrvs/opencrvs-core/issues/6492#issuecomment-1961098936)
- #### Fix showing unassigned toast for reinstated declarations [#6492](https://github.com/opencrvs/opencrvs-core/issues/6492#issuecomment-1961098936)
- #### Fix system crash when opening the started action modal [#6551](https://github.com/opencrvs/opencrvs-core/issues/6551)
- #### Convert eventDates to LocalDate before formatting [#6719](https://github.com/opencrvs/opencrvs-core/issues/6719)

## [1.4.1](https://github.com/opencrvs/opencrvs-core/compare/v1.4.0...v1.4.1)

- Fix Metabase versions in Dashboards service. Previously the version used for local development wasn't the one built into the docker image, which caused the locally generated initialisation file to fail in deployed environments.
- Fix a seeding script bug, where it failed when done too quickly [#6553](https://github.com/opencrvs/opencrvs-core/issues/6553)
- Update minimum password length validation [#6559](https://github.com/opencrvs/opencrvs-core/issues/6559)
- Include middlename when generating fullnames
  - Refactored out the scattered logic for generating fullnames and converged them into a single function
  - Make lastname optional for a registered declaration
- Recognize occupation as an optional field in informant section
- Fix download failure when `arrayToFieldTransormer` is used in template mapping
- Fix multiple records not being downloaded simultaneously [#6492](https://github.com/opencrvs/opencrvs-core/issues/6492#issuecomment-1961098936)
- Fix showing unassigned toast for reinstated declarations [#6492](https://github.com/opencrvs/opencrvs-core/issues/6492#issuecomment-1961098936)
- Fix system crash when opening the started action modal [#6551](https://github.com/opencrvs/opencrvs-core/issues/6551)
- Make language names used in language select dropdowns configurable in country resource package copy
- Fix login to field agent when an incomplete record is previously retrieved by them [#6584](https://github.com/opencrvs/opencrvs-core/issues/6584)

## [1.4.0](https://github.com/opencrvs/opencrvs-core/compare/v1.3.3...v1.4.0)

In this release, we made **no changes** to OpenCRVS Core. All changes in this release apply only to the [OpenCRVS country configuration](https://github.com/opencrvs/opencrvs-countryconfig/releases/tag/v1.4.0) repository.

### Please note for 1.5.0 release

In the next OpenCRVS release v1.5.0, there will be two significant changes both in the country resource package and the infrastructure configuration inside of it:

- The `infrastructure` directory and related pipelines will be moved to a new repository.
- Both the new infrastructure repository and the OpenCRVS country resource package repositories will start following their own release cycles, mostly independent from the core's release cycle. From this release forward, both packages are released as "OpenCRVS minor compatible" releases, meaning that the OpenCRVS countryconfig 1.3.0-<incrementing release number> is compatible with OpenCRVS 1.3.0, 1.3.1, 1.3.2, etc. This allows for the release of new hotfix versions of the core without having to publish a new version of the infrastructure or countryconfig.

## [1.3.3](https://github.com/opencrvs/opencrvs-core/compare/v1.3.2...v1.3.3)

### New features

- **New handlebars serving the location ids of the admin level locations**

  Apart from the new handlebars, a couple more improvements were introduced:

  - stricter type for locations in client
  - **"location"** handlebar helper can now resolve offices & facilities
  - restrict the properties exposed through **"location"** handlebar helper
  - remove deprecated **DIVISION** & **UNION** from client

### Bug fixes

- #### Fix location seeding scripts throwing error when there are too many source locations from the country config
  Locations are now seeded in smaller segments instead of one big collection. The newer approach has improved performance to a significant extent and also clears the interruption caused for a large number of country config locations
- Filter user information such as usernames and authentication codes from server logs
- Core not recognizing "occupation" as an optional field for deceased
- Unassign declaration from a user if the declaration has already been proceeded through the workqueues by a separate user

### Dependency upgrades

- **Metabase from v0.45.2.1 to v0.46.6.1**

See [Releases](https://github.com/opencrvs/opencrvs-core/releases) for release notes of older releases.
