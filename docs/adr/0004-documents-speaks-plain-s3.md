# The documents service uses only the S3 API

The documents service stores files through the S3 API. The service has no code that is specific to one store. The operator chooses the store. A store is supported when it passes the conformance suite. The conformance suite is a set of tests in `packages/documents/test/s3-conformance`. The README of the package lists each supported store and the version that passed.

We made this decision for issue [#13348](https://github.com/opencrvs/opencrvs-core/issues/13348). The issue asks us to replace MinIO, but it does not name a new store. The service can become independent of the store now. The choice of a store for the Helm chart needs a separate decision.

## What a store must do

The service needs these functions from a store. The conformance suite tests each function in this list, except cross-origin reads. The tests use the same code as the service.

- `HeadBucket` and `CreateBucket` with a region.
- `DeleteBucketPolicy`, or an equivalent function that keeps the bucket private.
- `PutObject` for a stream of unknown length, up to 50 MB. For a large file, the store must accept a multipart upload.
- User metadata, such as the `created-by` field, and `Content-Type`. The store returns both as they were stored.
- `HeadObject`, with the answer 404 for a key that does not exist.
- `ListObjectsV2` with pagination.
- `DeleteObjects` for up to 1000 keys in one request.
- Path-style SigV4 presigned `GET` URLs, signed for the public host.
- A refusal of an unsigned `GET` request for an existing key.
- Cross-origin reads from the origin of the client. Browsers fetch the presigned URLs. The suite does not test this function.

## Options that we rejected

**Any S3-compatible store.** Stores do not all implement the complete S3 API. A service can work with a store that lacks one function. Then the service fails at the first sweep or at the first large upload. A list of tested stores is a promise that we can keep.

**The MinIO client.** The MinIO client works with each S3 store. Its license is Apache-2.0, the same license as the AWS SDK that replaces it. We changed for two reasons.

First, `sign.ts` imported a private path in the MinIO package: `minio/dist/main/signing.js`. Second, each handler used the API of one vendor.

In the service, the AWS SDK is only a protocol client. The endpoint and the credentials come from the `S3_*` settings. No installation depends on AWS.

**A provider setting that selects a profile for each store.** We built the setting `S3_PROVIDER` with a profile for each store. A profile set the default region and three actions of the service. The actions were: send a location constraint, clear the bucket policy, and delete objects in a batch. We removed the setting.

The suite passes on MinIO, SeaweedFS and RustFS with the profile and the region of each of the other two stores. The code that selected the profiles guarded against differences that nobody found. If a store needs a difference, we add a setting at that time.

## Consequences

**The `MINIO_*` settings stay as a fallback.** Each installation sets `MINIO_HOST`, `MINIO_URL` and other `MINIO_*` variables. When an `S3_*` variable is not set, the service uses the `MINIO_*` variable with the same name. `S3_PUBLIC_URL` replaces `MINIO_URL`. An upgraded installation works as before.

**The old URL helpers stay as aliases.** Country configurations can import `isMinioUrl` and `MINIO_REGEX` from `@opencrvs/commons`. These names stay as deprecated aliases of `isS3Url` and `S3_URL_REGEX`.

**The bucket name stays `MINIO_BUCKET`.** The events migration reads this name. The migration removes the bucket from stored paths. The Helm chart and the CI also read the name. A second name can cause a different value in the service. We will rename the variable together with the chart.

**The list is a statement, not a check.** The service does not know which store it uses. The service does not refuse a store that is not in the table. Such a store can work. A store is supported when the README table shows the store, the date and the version that passed.

**One supported store must be open source and self-hosted.** AWS S3 and Google Cloud Storage are closed services, and we did not test them. The Digital Public Goods Standard has an indicator for platform independence. For this indicator, each closed component must have an open alternative. MinIO, SeaweedFS and RustFS are open alternatives. The table must always show at least one open store.

**The handlers do not use the SDK.** The handlers call `putObject`, `statObjectIfExists`, `removeObjects`, `listObjectKeys` and `signFileUrl`. A change of the SDK affects only `packages/documents/src/s3/`. A difference for one store also affects only this directory.

**The function `signFileUrl` is asynchronous.** The function was synchronous. Now the function returns a promise, and the two presign handlers are `async`. The signature covers the host. The service signs a key for the public host, not for the internal host.

**A failed batch delete now causes an error.** `removeObjects` throws an error when the store reports that it cannot delete a key. The earlier code did not look at the result. A sweep that deleted nothing then looked successful. [ADR 0003](./0003-a-records-prefix-owns-its-attachments.md) corrected the same problem for single deletes.

**We did not decide these points here.** Some points need separate decisions:

- The store for the Helm chart and the Compose files.
- The change of the chart variables from `MINIO_*` to `S3_*`.
- Lifecycle rules for abandoned uploads.
- Object versioning.

The Helm charts, the Compose files, the backup and restore scripts, and the cleanup job still use MinIO.
