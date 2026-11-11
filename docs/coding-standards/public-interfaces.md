# Public interfaces

Read this page when a change touches something that a country or an external system uses. [Coding standards](README.md) has the rules for all code.

## Public or internal

A **public interface** is one that core cannot change together with its users, because the users are in other repositories:

- The format of the country config: what `defineConfig`, `defineRoles` and the toolkit accept.
- The exports of `@opencrvs/toolkit`.
- The REST API: each procedure with an OpenAPI `.meta({ openapi })` block.
- Scopes, translation keys, and defaults that a country can see.

All other interfaces are **internal**: tRPC procedures that only the client calls, the routes in `internalRouter`, and functions that only core imports.

| Rule                         | Public interface                                      | Internal interface                                |
| ---------------------------- | ----------------------------------------------------- | ------------------------------------------------- |
| A change of format           | Deprecate first. Keep the old format for one release. | Change it, and update all callers in the same PR. |
| CHANGELOG entry              | Always                                                | Only when a country can see the effect            |
| Codemod in the toolkit       | When the config format changes                        | Never                                             |
| OpenAPI `.meta` block        | Always                                                | Never                                             |
| Validation and authorization | Always. See [services.md](services.md).               | Always. See [services.md](services.md).           |

An internal interface stays internal. Keep internal routes out of the gateway, and give a procedure only the caller type that uses it.

The rules below apply to public interfaces.

## Keep core generic

Core works for every country without changes in core. Read the values that a country configures from the country config. Examples are role names (`FIELD_AGENT`), location types (`CRVS_OFFICE`, `HEALTH_FACILITY`) and the phone number pattern. Logic that only one country needs belongs in the config of that country.

Core and the toolkit are independent of any one vendor or product. Countries cannot change the toolkit, so a dependency on Docker Hub there blocks every country that uses a different registry. In the same way, core services do not depend on MinIO, and events and client code do not name a specific product such as MOSIP.

## Keep the meaning of existing config

- Add a new field instead of giving an existing field a new meaning.
- A new option has a default that keeps the current behaviour for existing countries.
- One config option controls one thing. A boolean controls one behaviour.
- Each action has its own configuration.

## Deprecate before you remove

When the format of a public interface changes, keep the old format working for one release:

- Read the old format next to the new one, and log a deprecation warning.
- Add a toolkit codemod that rewrites the old format. The codemod logs a warning for every case that it cannot rewrite.
- Mark the old field `@deprecated`, and name the version that removes it.
- Mark temporary compatibility code with the version that removes it, and open an issue for the removal.

## Write a CHANGELOG entry for every change that a country implementer sees

- Put the entry under the correct release and section. Link the issue in the same format as the other entries.
- For a breaking change, say what to use instead, why, and the exact steps. A diff or a config example helps.
- Put a breaking change, or a change that needs manual steps, at the top of its section.
- When the PR changes behaviour, check that the existing entries are still correct.

## Update `countryconfig-template` and `testland` in the same PR

When core changes something that a country config uses, update `packages/countryconfig-template` and `packages/testland` in the same PR. This includes config, docs and the translation CSVs. If other repositories need a change (farajaland, infrastructure, e2e), link those PRs.

## Validate country config at build time

- Validate country config in `defineConfig` and `defineRoles`. Then the country sees an error when it builds its config, not after it deploys.
- Use one schema from commons. Then the events service, the toolkit and the seeder accept and reject the same config.
- The error message says what is wrong and where. For example, it names the event id and the version of the event config.

## Add a REST endpoint as a tRPC procedure

The OpenAPI `.meta({ openapi })` block makes the procedure a REST endpoint. A new endpoint needs no URL rewrite, no gateway code and no change to the tRPC context.
