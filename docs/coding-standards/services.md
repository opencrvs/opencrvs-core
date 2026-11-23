# Backend services

Read this page when a change touches a backend service. [Coding standards](README.md) has the rules for all code.

## Public and internal APIs

A **public API** is a procedure with an OpenAPI `.meta({ openapi })` block. The block makes the procedure a REST endpoint, and external systems use it. All other procedures are **internal APIs**: the tRPC procedures that only the client calls, and the routes in `internalRouter`.

| Rule                         | Public API                                                                     | Internal API                                      |
| ---------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------- |
| A change of format           | Deprecate first. See [countries.md](countries.md#deprecate-before-you-remove). | Change it, and update all callers in the same PR. |
| CHANGELOG entry              | Always                                                                         | Only when a country can see the effect            |
| Caller type                  | The procedure type that matches the external caller                            | `userOnlyProcedure` when only the client calls it |
| Validation and authorization | Always                                                                         | Always                                            |

- Add a REST endpoint as a tRPC procedure with the `.meta` block. A new endpoint needs no URL rewrite, no gateway code and no change to the tRPC context.
- An internal API stays internal. Keep internal routes out of the gateway.

## Authorization

### Check authorization in the service that owns the data

Every permission check happens in the service that owns the data, and the default is to deny. When the client hides a button, that is a UX choice and gives no security. If you find a check that exists only in the client, fix it or open an issue.

The access check of a route runs as middleware, separate from the service logic. In the events service, use the middleware in `packages/events/src/router/middleware`.

### Read the identity from the token

Get the acting user or system client from the token or the tRPC context. The payload is not a source of identity.

- If the payload must name a user, check that user against the scopes of the token.
- Design a route so that the scopes of the token can decide the access. `/:eventId/files` works like this. `/:eventId/:fileId` needs a second check that the file belongs to the event.

### Give "not found" and "forbidden" the same response

Check the permission before you check if the resource exists. Then a caller cannot test which ids exist.

### Validate every request

- The server validates every request, also when the client, another OpenCRVS service or the country config sent it.
- When the client sends input that is not valid, fix the client. The validation in core stays as strict as it was.
- For input that is not valid, return `BAD_REQUEST` with a message that says what is wrong.

### Read scopes only through the scope helpers

- Use `encodeScope` and `decodeScope` from `packages/commons/src/users/scopes.ts` instead of `startsWith` or `===` on scope strings.
- A user can have more than one scope of the same type. Use all of them.
- All the options of a scope are combined with AND.
- Before you add a new scope type, check if an option on an existing scope can do the job.

```ts
// Rejected: reads only one scope, and matches a string
const scope = scopes.find((s) => s.startsWith('type=record.reject'))

// Preferred: decode, and use every accepted scope
const accessLevels = acceptedScopes.map((s) =>
  getScopeOptionValue(s, 'accessLevel')
)
```

### Keep privilege and exposure small

- A destructive operation is narrow. For example, a delete accepts only the path prefixes that it owns.
- Service tokens are short-lived, and each token has the least privilege that it needs.
- Sensitive fields, such as signatures, stay out of list endpoints and the search index.
- Production has no insecure defaults, such as a fixed default password.

### Treat the audit log as critical

The service that does the operation writes the audit entry. If the write fails, the operation fails. Test what is written.

## Structure

- Keep routers thin. Access checks go in middleware, and the rules go in service functions.
- Store document paths as paths, not as full URLs. Only the documents service builds bucket URLs. See [ADR 0003](../adr/0003-a-records-prefix-owns-its-attachments.md) for the prefix of a record.
- Read environment variables with envalid `cleanEnv`. Use `devDefault` for a default that applies only in development.

## Calls to other systems

- Move calls out of loops. Send one call for many items when the API allows it.
- Use `Promise.all` only for independent reads, or for calls that are safe to retry. When one call fails, `Promise.all` rejects at once, but the other calls continue. Then some writes are done and some are not.
- Put a limit on an operation that can grow without limit, such as a list of keys, a prefix scan or an error message.
- Release a database lock before you wait for an external system.
