# @opencrvs/documents

Stores and serves the files that belong to records: attachments, signatures and avatars. It talks to an object store over the S3 API. What a store must support is in [ADR 0004](../../docs/adr/0004-documents-speaks-plain-s3.md).

## Configuration

The service is configured with `S3_*` environment variables. It checks and does not start if one does not fit: an endpoint that does not start with `http://` or `https://`.

| Setting              | Default                                                           | Meaning                                                                                                                        |
| -------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `S3_ENDPOINT`        | `http://localhost:3535`, required when `NODE_ENV` is `production` | URL, with the protocol, where the documents service reaches the store.                                                         |
| `S3_PUBLIC_ENDPOINT` | `http://localhost:3535`, required when `NODE_ENV` is `production` | URL, with the protocol, that browsers use. Presigned URLs are signed for it. Set it even when it is the same as `S3_ENDPOINT`. |
| `S3_BUCKET`          | `ocrvs`                                                           | The bucket. The events migration reads it too, to strip it from stored paths, so give both the same value.                     |
| `S3_BUCKET_REGION`   | `local`                                                           | Region of the bucket.                                                                                                          |
| `S3_ACCESS_KEY`      | `minioadmin`                                                      |                                                                                                                                |
| `S3_SECRET_KEY`      | `minioadmin`                                                      |                                                                                                                                |

The defaults match the store that `docker-compose.dev-deps.yml` starts for development. The Helm chart sets these settings from its `s3` values.

## Object stores

The service has no code that is specific to a store, and does not check which one it talks to. It was tried by hand, once, against the stores below. Its unit tests run against RustFS, at the version in the table, in a container that `test/global-setup.ts` starts, so running them needs Docker. Nothing in CI runs it against the other stores, so a newer version, or a store that is not listed, may behave differently.

| Store     | Kind                     | Tried on   | Version                                               |
| --------- | ------------------------ | ---------- | ----------------------------------------------------- |
| MinIO     | open source, self-hosted | 2026-10-16 | `ghcr.io/opencrvs/minio:release.2025-06-13t11-33-47z` |
| SeaweedFS | open source, self-hosted | 2026-10-16 | `chrislusf/seaweedfs:4.48`                            |
| RustFS    | open source, self-hosted | 2026-10-16 | `rustfs/rustfs:1.0.1`                                 |

AWS S3 and Google Cloud Storage have not been tried. The table does not say that a store is the right one for a deployment, and the issue that asked for MinIO to be replaced ([#13348](https://github.com/opencrvs/opencrvs-core/issues/13348)) judged RustFS too young to be the bundled default. Which store the Helm chart ships is a separate decision.

When you move to another store, or upgrade the one you have, check these yourself:

- **The capabilities in the ADR.** Upload a large file, delete a prefix that holds more than 1000 files through the service, and open an attachment in the client.
- **CORS.** Browsers fetch presigned URLs, so the store must allow cross-origin reads from the client's origin.
- **Backups.** The backup, restore and data-cleanup jobs in `charts` are written for MinIO.
