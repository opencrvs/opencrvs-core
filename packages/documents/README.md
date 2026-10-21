# @opencrvs/documents

Stores and serves the files that belong to records: attachments, signatures and avatars. It talks to an object store over the S3 API. What a store must support, and why only some are listed as supported, is in [ADR 0004](../../docs/adr/0004-documents-speaks-plain-s3.md).

## Configuration

The service is configured with `S3_*` environment variables. An empty value counts as unset.

| Setting            | Default                                   | Meaning                                                                                                    |
| ------------------ | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `S3_HOST`          | `localhost`                               | Where the store answers the documents service.                                                             |
| `S3_PORT`          | `3535`                                    | Port of the above.                                                                                         |
| `S3_USE_SSL`       | `false`                                   | `true` when the documents service reaches the store over TLS.                                              |
| `S3_PUBLIC_URL`    | `localhost:3535`                          | `host[:port]` that browsers use. Presigned URLs are signed for it.                                         |
| `S3_PROTOCOL`      | `https:` in production, otherwise `http:` | Protocol of the public URL.                                                                                |
| `S3_BUCKET`        | `ocrvs`                                   | The bucket. The events migration reads it too, to strip it from stored paths, so give both the same value. |
| `S3_BUCKET_REGION` | `local`                                   | Region of the bucket.                                                                                      |
| `S3_ACCESS_KEY`    | `minioadmin`                              |                                                                                                            |
| `S3_SECRET_KEY`    | `minioadmin`                              |                                                                                                            |

The defaults match the store that `docker-compose.dev-deps.yml` starts for development. The Helm chart sets these settings from its `s3` values.

## Supported object stores

A store is supported once the [conformance suite](#running-the-conformance-suite) has passed against it and it is in this table. The service has no code that is specific to a store, and does not check which one it talks to: a store that is not listed may work, but nobody has checked.

| Store     | Kind                     | Last passed | Version it passed on                                  |
| --------- | ------------------------ | ----------- | ----------------------------------------------------- |
| MinIO     | open source, self-hosted | 2026-10-16  | `ghcr.io/opencrvs/minio:release.2025-06-13t11-33-47z` |
| SeaweedFS | open source, self-hosted | 2026-10-16  | `chrislusf/seaweedfs:4.48`                            |
| RustFS    | open source, self-hosted | 2026-10-16  | `rustfs/rustfs:1.0.1`                                 |

The three needed no setting of their own: the suite also passes on each of them with the region that the others use. Being in the table is a statement about the checks below, and no more than that. It does not say that a store is the right one for a deployment, and the issue that asked for MinIO to be replaced ([#13348](https://github.com/opencrvs/opencrvs-core/issues/13348)) judged RustFS too young to be the bundled default. Which store the Helm chart ships is a separate decision.

AWS S3 and Google Cloud Storage have not been tried. At least one open source, self-hostable store must stay in the table, because a cloud service is a closed component.

### What the suite does not cover

- **CORS.** Browsers fetch presigned URLs, so the store must allow cross-origin reads from the client's origin. This is a setting of each store and is not checked.
- **Load, durability and backups.** The suite checks behaviour, not capacity or recovery. The backup and restore jobs in `charts` are written for MinIO. The data-cleanup job and the job that migrates MinIO to SeaweedFS use the S3 API, and work with both.
- **Other versions.** A pass is for the version in the table. A newer one may behave differently, so run the suite again when you upgrade the store.

### Adding or removing a store

1. Run the suite against it. If a check fails, either the store does not belong in the table or the service needs a difference for it. Add that difference as a setting when a store needs it, and not before.
2. Add a row to the table with the date and the version, and, for a store that CI can start, a service in `test/s3-conformance/docker-compose.yml` and an entry in the matrix of `.github/workflows/documents-s3-conformance.yml`.

## Running the conformance suite

The suite is not part of `pnpm test`. It talks to a real store, with the settings above, and writes only under a `conformance/<uuid>/` prefix of its own in the bucket, which it removes afterwards. It also puts a public-read policy on the bucket for one check, and removes it again.

`test/s3-conformance/docker-compose.yml` starts each store in the table as the suite was run. Each answers on `localhost:3535` with the `minioadmin` credentials, which are the defaults of the service, so no setting is needed. Start one at a time, as they share the port:

```bash
docker compose -f packages/documents/test/s3-conformance/docker-compose.yml up -d seaweedfs
```

```bash
pnpm --filter @opencrvs/documents test:s3-conformance
```

```bash
docker compose -f packages/documents/test/s3-conformance/docker-compose.yml down -v
```

Use `minio` or `rustfs` in place of `seaweedfs` to run the others. For a store that is not in the compose file, set its connection with the settings above:

```bash
S3_HOST=s3.example.org S3_PORT=443 S3_USE_SSL=true S3_PUBLIC_URL=s3.example.org S3_PROTOCOL=https: S3_BUCKET=<a bucket made for the test> S3_ACCESS_KEY=... S3_SECRET_KEY=... pnpm --filter @opencrvs/documents test:s3-conformance
```

`S3_CONFORMANCE_OBJECTS` sets how many objects the pagination and batch-delete checks use (default 1100, which is more than one page and more than one `DeleteObjects`).
