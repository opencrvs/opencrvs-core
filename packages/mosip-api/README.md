# OpenCRVS API for MOSIP

A mediator/API layer that facilitates communication between OpenCRVS and MOSIP,
enabling secure identity integration. Refer to the
[OpenCRVS documentation](https://documentation.opencrvs.org/technology/interoperability/national-id-client)
for installation and deployment instructions.

This package was developed in the separate `opencrvs/mosip` repository and moved
into core, together with:

- [`packages/mosip`](../mosip) — `@opencrvs/mosip`, the country-config-facing
  library, published to npm at core's version
- [`packages/mosip-mock`](../mosip-mock) — mock MOSIP server
- [`packages/esignet-mock`](../esignet-mock) — mock e-Signet server

All three services are deployed by the `charts/opencrvs-mosip` Helm chart, and
their images are published by core's service matrix as `ocrvs-mosip-api`,
`ocrvs-mosip-mock` and `ocrvs-esignet-mock`.

## Development

Dependencies come from the workspace install at the repository root, so there is
no separate install step. Tasks run through nx (see the root `CLAUDE.md`).

```sh
# copy demo certs to their gitignored location
cp -n packages/mosip-api/docs/example-certs/* packages/mosip-api/certs/

# run the tests (seeds the certs above automatically via pretest)
nx run @opencrvs/mosip-api:test

# start the mediator in watch mode
nx run @opencrvs/mosip-api:start

# start the mock servers alongside it, in separate shells
nx run @opencrvs/mosip-mock:start
nx run @opencrvs/esignet-mock:start
```

Use a `.env` file at the repository root to override local config; `start` reads
it if present.

Versions are bumped for every package at once by the release workflow, so there
is no per-package version command.

This service uses a **SQLite** database to store the record-specific tokens that
OpenCRVS Core uses to allow editing records. See
[`src/database.ts`](./src/database.ts) for more information.

The **environment variables** the server uses can be found in
[`src/constants.ts`](./src/constants.ts).

The **identities** for the e-Signet and IDA Auth mocks are in
[`docs/mock-identities.json`](./docs/mock-identities.json), which both mock
packages symlink to.

## API documentation (Swagger)

When `mosip-api` is running, Swagger UI is available at:

- `http://localhost:2024/documentation`

The OpenAPI JSON spec is available at:

- `http://localhost:2024/documentation/json`

Most API routes require a JWT. In Swagger UI, click **Authorize** and paste your
token as:

- `Bearer <your-jwt-token>`

Use an **OpenCRVS Core access token** (JWT issued by the auth service and
verifiable with the Core public key configured in this service).
