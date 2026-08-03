# Reading a system client's audit log

`app.audit_log.client_id` is an untyped `text` column with no foreign key, shared by users and
system clients alike, so a read keyed only on that column cannot tell the two apart. We gate
`integrations.audit` behind a dedicated `integration.audit.read` scope, restrict it to human
callers, and require the endpoint to confirm the requested id exists in `app.system_clients`
before it queries — otherwise a holder of the scope could pass any user's UUID and read that
user's entire audit log without holding `user.read` at all, bypassing the authorization
`user.audit.list` requires.

## Considered options

- **Reuse `integration.create`.** Rejected: it conflates managing integrations with reviewing
  what they did, so read-only oversight cannot be granted on its own. It would have shipped
  working with no countryconfig change, which is the only reason it was tempting.
- **A generic `audit.read` scope**, as the originating issue proposed. Rejected: it claims a
  cross-cutting namespace for a single integration-specific endpoint, and a future reader would
  reasonably expect it to cover user audit logs too — those are gated by `user.read`.
- **Filtering the query on `client_type = 'system'`** instead of the existence check. Rejected
  because it does not actually work: `internal.user.audit.record` writes rows with
  `clientType: 'system'` and a _user's_ id in `clientId` (reached via
  `recordAnonymousUserAuditEvent`, currently for `user.username_reminder`), so user-keyed rows
  would still leak.
- **Jurisdiction-filtering the results**, mirroring `user.read[accessLevel=...]`. Not possible:
  `app.system_clients` has no office and no administrative area, so there is nothing to filter
  against. Access to system-client audit logs is national by construction.

## Consequences

- The `getSystemClientById` call at the top of the procedure looks like a redundant existence
  check. It is load-bearing security. Removing it reopens the escalation described above.
- Because the scope carries no jurisdiction options, anyone holding it reads every system
  client's log. That is a deliberate consequence of system clients being national, not an
  oversight to be "fixed" by adding options later — options would have nothing to bind to.
