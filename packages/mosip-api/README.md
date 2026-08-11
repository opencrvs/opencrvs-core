# OpenCRVS API for MOSIP

This repository provides an mediator/API layer that facilitates communication between OpenCRVS and MOSIP, enabling secure identity integration. Refer to [OpenCRVS documentation](https://documentation.opencrvs.org/technology/interoperability/national-id-client) for installation and deployment instructions.

## Prerequisites

- Node.js (see [`.nvmrc`](./.nvmrc) for version)
- Yarn (Node.js package manager)

## Development

```sh
# copy demo certs to gitignored location
cp -n docs/example-certs/* certs/

# install dependencies
yarn install

# create sqlite data directory
mkdir -p data/sqlite

# start the mosip-api and all the mocked servers
yarn dev

# optionally...
# use a `.env` file at repository root for custom config
touch .env
yarn dev

# only run the main server without mocks
yarn workspace @opencrvs/mosip-api run dev

# bump package.json versions
yarn set-version 1.7.0-alpha.16
```

This project uses a **SQLite** database to store the record-specific tokens that OpenCRVS Core uses to allow editing the records. See [`./packages/mosip-api/src/database.ts`](./packages/mosip-api/src/database.ts) for more information.

The **environment variables** the server uses can be found at [`./packages/mosip-api/src/constants.ts`](./packages/mosip-api/src/constants.ts). Create a `.env` file in the root of the repository, if you want to override the local values.

The **identities** for E-Signet and IDA Auth mocks are found at [`./docs/mock-identities.json`](./docs/mock-identities.json).

## API documentation (Swagger)

When `mosip-api` is running, Swagger UI is available at:

- `http://localhost:2024/documentation`

The OpenAPI JSON spec is available at:

- `http://localhost:2024/documentation/json`

Most API routes require a JWT. In Swagger UI, click **Authorize** and paste your token as:

- `Bearer <your-jwt-token>`

Use an **OpenCRVS Core access token** (JWT issued by the auth service and verifiable with the Core public key configured in this service).
