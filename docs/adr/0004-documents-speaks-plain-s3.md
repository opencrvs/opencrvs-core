# The documents service uses only the S3 API

The documents service stores files through the S3 API. The service has no code that is specific to one store. We tried the same code by hand on MinIO, SeaweedFS and RustFS. If a store needs a difference, we add a setting at that time. The README of the package lists the stores that we tried and the version of each.

We made this decision for issue [#13348](https://github.com/opencrvs/opencrvs-core/issues/13348). The issue asks us to replace MinIO, but it does not name a new store. The service can become independent of the store now. The choice of a store for the Helm chart needs a separate decision.

## What a store must do

The service calls each function in this list. The unit tests of the service run them against RustFS. Nothing in CI runs them against another store, except MinIO in the end-to-end tests.

- `HeadBucket`, `CreateBucket` with a region, and `DeleteBucketPolicy` or an equivalent that keeps the bucket private.
- `PutObject` for a stream of unknown length, up to 50 MB. For a large file, the store must accept a multipart upload.
- User metadata, such as `created-by`, and `Content-Type`. The store returns both as they were stored.
- `HeadObject`, with the answer 404 for a key that does not exist.
- `ListObjectsV2` with pagination, and `DeleteObjects` for up to 1000 keys.
- Path-style SigV4 presigned `GET` URLs, signed for the public host.
- A refusal of an unsigned `GET` request for an existing key.
- Cross-origin reads from the origin of the client. We did not try this function.

## Options that we rejected

**Any S3-compatible store.** Some stores do not implement the complete S3 API. A service can work with such a store until the first sweep or the first large upload. Then the service fails. A list of the stores that we tried says no more than what we did.

**The MinIO client.** The MinIO client works with each S3 store, and its license is Apache-2.0, as is the license of the AWS SDK. We changed because `sign.ts` imported a private path in the MinIO package, and each handler used the API of one vendor. The AWS SDK is only a protocol client here. The endpoint and the credentials come from the `S3_*` settings, so no installation depends on AWS.

## Consequences

**The settings are `S3_*` only, and `MINIO_*` is gone.** The service reads `S3_ENDPOINT`, `S3_PUBLIC_ENDPOINT`, `S3_BUCKET` and the other `S3_*` variables, and does not read a `MINIO_*` variable. `S3_ENDPOINT` and `S3_PUBLIC_ENDPOINT` are URLs with the protocol, and replace `MINIO_HOST`, `MINIO_PORT`, `MINIO_URL` and `MINIO_PROTOCOL`. `S3_BUCKET` replaces `MINIO_BUCKET`. The events migration, the services Helm chart and the CI changed with it, because they must give the same bucket to the service and to the migration. An installation that sets `MINIO_*` must rename those variables when it upgrades. We did not keep a fallback, because a second name for each setting would have stayed in the service for as long as any installation used it.

**The old URL helpers are removed.** `isMinioUrl` and `MINIO_REGEX` in `@opencrvs/commons` are gone, and `isS3Url` and `S3_URL_REGEX` replace them. A country configuration that imports the old names must change them.

**The list is a record, not a check.** The service does not refuse a store that is not in the README table, and that store can work. The table shows what we tried and when. We did not keep an automated suite for it, apart from the unit tests that run against RustFS. A newer version of a store, or a change to the service, can break another store without a failing build.

**One listed store must be open source and self-hosted.** AWS S3 and Google Cloud Storage are closed services, and we did not test them. For the platform independence indicator of the Digital Public Goods Standard, each closed component must have an open alternative. MinIO, SeaweedFS and RustFS are open alternatives. The table should always show at least one open store.

**We did not decide these points here.** These points need separate decisions:

- The store for the Helm chart and the Compose files.
- Lifecycle rules for abandoned uploads.
- Object versioning.

The services Helm chart speaks of a generic `s3` store, but the dependencies chart still deploys MinIO, and the default `s3` values point at it. The Compose files, the backup and restore scripts, and the MinIO client in the cleanup job still belong to MinIO.
