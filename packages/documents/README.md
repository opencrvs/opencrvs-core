# @opencrvs/documents

Stores and serves the files that belong to records: attachments, signatures and avatars. It talks to an object store over the S3 API. Why the store is a choice from a closed list, and what a store must support, is in [ADR 0004](../../docs/adr/0004-documents-speaks-plain-s3.md).

## Configuration

Each setting reads `S3_<name>` first and falls back to the `MINIO_<name>` that deployments have always set, so an existing deployment needs no change. An empty value counts as unset.

| Setting | Falls back to | Default | Meaning |
|---|---|---|---|
| `S3_PROVIDER` | none | `minio` | One of `minio`, `seaweedfs`, `rustfs`, `aws`, `gcs`. Any other value stops the service at start. |
| `S3_HOST` | `MINIO_HOST` | `localhost` | Where the store answers the documents service. |
| `S3_PORT` | `MINIO_PORT` | `3535` | Port of the above. |
| `S3_USE_SSL` | none | `false` | `true` when the documents service reaches the store over TLS. |
| `S3_PUBLIC_URL` | `MINIO_URL` | `localhost:3535` | `host[:port]` that browsers use. Presigned URLs are signed for it. |
| `S3_PROTOCOL` | `MINIO_PROTOCOL` | `https:` in production, otherwise `http:` | Protocol of the public URL. |
| `S3_BUCKET_REGION` | `MINIO_BUCKET_REGION` | the provider's default | Region of the bucket. |
| `S3_ACCESS_KEY` | `MINIO_ACCESS_KEY` | `minioadmin` | |
| `S3_SECRET_KEY` | `MINIO_SECRET_KEY` | `minioadmin` | |
| `MINIO_BUCKET` | none | `ocrvs` | The bucket. It keeps this name because the events migration and the Helm chart read it too. |

The Helm chart and the Compose files still set the `MINIO_*` names, and still deploy MinIO.

## Supported object stores

A store is supported while the [conformance suite](#running-the-conformance-suite) passes against it. The service starts with any provider below, but logs a warning for one that has not yet passed, because its profile (`src/s3/providers.ts`) is then an expectation and not a result.

| Provider | Kind | Conformance suite | Last passed | Version it passed on |
|---|---|---|---|---|
| `minio` | open source, self-hosted | verified, runs in CI | 2026-10-16 | `ghcr.io/opencrvs/minio:release.2025-06-13t11-33-47z` |
| `seaweedfs` | open source, self-hosted | verified, runs in CI | 2026-10-16 | `chrislusf/seaweedfs:4.48` |
| `rustfs` | open source, self-hosted | verified, runs in CI | 2026-10-16 | `rustfs/rustfs:1.0.1` |
| `aws` | cloud service | not yet run | none | |
| `gcs` | cloud service, S3 interoperability API | not yet run | none | |

At least one open source, self-hostable store must stay on this list.

The three self-hosted stores passed with the profiles as first written, so no store needed a setting of its own. Being on the list is a statement about the checks below, and no more than that: it does not say that the store is the right one for a deployment, and the issue that asked for MinIO to be replaced ([#13348](https://github.com/opencrvs/opencrvs-core/issues/13348)) judged RustFS too young to be the bundled default. Which store the Helm chart ships is a separate decision.

### What the suite does not cover

- **CORS.** Browsers fetch presigned URLs, so the store must allow cross-origin reads from the client's origin. This is a setting of each store and is not checked.
- **Load, durability and backups.** The suite checks behaviour, not capacity or recovery. The backup and restore scripts in `charts/dependencies` are written for MinIO.
- **Other versions.** A pass is for the version in the table. A newer one may behave differently, so run the suite again when you upgrade the store.

### Adding or removing a store

1. Add its name to `S3_PROVIDERS` and a profile to `S3_PROVIDER_PROFILES` in `src/s3/providers.ts`.
2. Run the suite against it. A failing check means a change to the profile, or the store does not belong on the list.
3. Add it to `VERIFIED_S3_PROVIDERS`, record the date and the version above, and, for a store that CI can start, add it to `test/s3-conformance/docker-compose.yml` and to the matrix in `.github/workflows/documents-s3-conformance.yml`.

## Running the conformance suite

The suite is not part of `pnpm test`. It talks to a real store, with the settings above, and writes only under a `conformance/<uuid>/` prefix of its own in the bucket, which it removes afterwards. It also puts a public-read policy on the bucket for one check, and removes it again.

`test/s3-conformance/docker-compose.yml` starts each verified self-hosted store as the suite was run. Each answers on `localhost:3535` with the `minioadmin` credentials, which are the defaults of the service, so only `S3_PROVIDER` needs setting. Start one at a time, as they share the port:

```bash
docker compose -f packages/documents/test/s3-conformance/docker-compose.yml up -d seaweedfs
```

```bash
S3_PROVIDER=seaweedfs pnpm --filter @opencrvs/documents test:s3-conformance
```

```bash
docker compose -f packages/documents/test/s3-conformance/docker-compose.yml down -v
```

Use `minio` or `rustfs` in place of `seaweedfs` to run the others. For a store that is not in the compose file, set its connection and name it:

```bash
S3_PROVIDER=aws S3_HOST=s3.eu-west-1.amazonaws.com S3_PORT=443 S3_USE_SSL=true S3_PUBLIC_URL=s3.eu-west-1.amazonaws.com S3_PROTOCOL=https: S3_BUCKET_REGION=eu-west-1 MINIO_BUCKET=<a bucket made for the test> S3_ACCESS_KEY=... S3_SECRET_KEY=... pnpm --filter @opencrvs/documents test:s3-conformance
```

`S3_CONFORMANCE_OBJECTS` sets how many objects the pagination and batch-delete checks use (default 1100, which is more than one page and more than one `DeleteObjects`).
