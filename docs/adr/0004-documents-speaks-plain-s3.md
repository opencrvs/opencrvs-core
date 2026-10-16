# The documents service speaks plain S3 to a closed list of stores

The documents service stores files through the S3 API and nothing else. Which store answers is a deployment choice, made with `S3_PROVIDER` from a closed list: `minio`, `seaweedfs`, `rustfs`, `aws` and `gcs`. A store is on the list only while it passes the conformance suite in `packages/documents/test/s3-conformance`. We chose this when [#13348](https://github.com/opencrvs/opencrvs-core/issues/13348) asked for MinIO to be replaced and gave no replacement: the code could be made independent of the store at once, while the choice of a bundled store needs its own decision.

## What a store must do

The documents service needs these from a store. The conformance suite has one test for each, and it runs the same functions that the service runs.

- `HeadBucket`, `CreateBucket` with a region, and `DeleteBucketPolicy`, or an equivalent that leaves the bucket private.
- `PutObject` of a stream of unknown length, up to 50 MB, as a multipart upload where needed.
- User metadata (`created-by`) and `Content-Type` that come back as they were stored.
- `HeadObject` that answers 404 for a key that does not exist.
- `ListObjectsV2` with pagination, and `DeleteObjects` of up to 1000 keys per request.
- Path-style SigV4 presigned `GET` URLs, signed for the public host. Browsers fetch these, so the store must allow cross-origin reads from the client's origin.
- No anonymous reads. An unsigned `GET` for an existing key is refused.

## Considered options

**Any S3-compatible store.** Stores implement different parts of S3. A deployment on a store that lacks one of the calls above would work until the first sweep, or the first large upload, and then fail in the field. A list that says which stores were run through the suite is a promise we can keep.

**Keep the MinIO client.** It works against any S3 store and is Apache-2.0, as is the AWS SDK that replaces it. We changed because `sign.ts` imported a private path inside the MinIO package, `minio/dist/main/signing.js`, and because every handler spoke a vendor's API. The AWS SDK is only a protocol client here: the endpoint and credentials come from `S3_*`, so it makes no deployment depend on AWS.

**A provider flag per quirk, set by the operator.** One variable per difference (region, whether to remove the bucket policy, batch delete) would let an operator build a combination that nobody tested. A provider name picks a profile, `packages/documents/src/s3/providers.ts`, and the operator sets none of the quirks.

## Consequences

**`MINIO_*` stays as a fallback.** Every existing deployment sets `MINIO_HOST`, `MINIO_URL` and the rest, so each `S3_*` setting falls back to its `MINIO_*` name. `S3_PUBLIC_URL` replaces `MINIO_URL`. With no `S3_PROVIDER` the provider is `minio`, and an upgraded deployment behaves as before. `isMinioUrl` and `MINIO_REGEX` in `@opencrvs/commons` stay as deprecated aliases of `isS3Url` and `S3_URL_REGEX`, because country configs may import them.

**The bucket name stays `MINIO_BUCKET`.** The events migration that strips the bucket from stored paths, the Helm chart and CI all read it, and a second name could let them disagree with this service. It is renamed together with the chart.

**A provider's profile is an expectation until the suite has run.** `VERIFIED_S3_PROVIDERS` lists the providers that have passed. The service starts with any provider on the list, but logs a warning for one that is not verified. The README records, for each provider, when the suite last passed against it.

**One store on the list must be open source and self-hostable.** AWS S3 and Google Cloud Storage are closed services. For the Digital Public Goods Standard's platform independence indicator a closed component needs an open alternative, and MinIO, SeaweedFS and RustFS are those alternatives. If the open stores ever fall off the list, the list must not be left with only cloud services.

**The handlers know nothing of the SDK.** They call `putObject`, `statObjectIfExists`, `removeObjects`, `listObjectKeys` and `signFileUrl`. Switching the SDK, or adding a provider, touches `packages/documents/src/s3/` only.

**Presigning is asynchronous.** `signFileUrl` was synchronous and now returns a promise, so the two presign handlers are `async`. A key is signed for the public host and not the internal one, because the signature covers the host.

**A failed batch delete now fails.** `removeObjects` throws when the store reports a key it could not delete. The earlier call returned without looking, which let a sweep that deleted nothing look like one that succeeded, the failure that [ADR 0003](./0003-a-records-prefix-owns-its-attachments.md) already corrected for single deletes.

**Not decided here.** Which store ships in the Helm chart and Docker Compose files, and the move of the chart's `MINIO_*` variables to `S3_*`, are a separate decision. So are lifecycle rules for abandoned uploads and object versioning. The Helm charts, Compose files, backup and restore scripts, and the cleanup job still deploy MinIO.
