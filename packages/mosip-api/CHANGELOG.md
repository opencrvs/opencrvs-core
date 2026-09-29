# Changelog

## Unreleased

- WebSub callbacks are now authenticated with the hub's `X-Hub-Signature` HMAC, and rejected with a 401 if it is missing or does not match. Previously nothing established that a callback came from MOSIP: the route is exempt from JWT auth, and successfully decrypting the credential only proves the sender had OpenCRVS's public certificate, which is not a secret. ([#12842](https://github.com/opencrvs/opencrvs-core/issues/12842))

  - **`MOSIP_WEBSUB_SECRET` must match the `hub.secret` the subscription was created with.** It was already sent when subscribing but never checked. If it drifts, every callback is rejected — look for `websub.credential-issued.unauthenticated` in the logs.

  - This replaces the credential's `RsaSignature2018` `proof` as the source check, and the proof verification code is removed along with the `canonicalize` dependency. The proof was verifying MOSIP's issuer signature, but the HMAC covers the entire delivery rather than only the subset of credential fields that survive RDF canonicalization, and both the hub and the issuer are MOSIP infrastructure. `MOSIP_VERIFIABLE_CREDENTIAL_ALLOWLIST` is no longer used and can be removed from country configurations.

## 2.0.0

- Support biographic updates to MOSIP via `updateBiographics`. ([#152](https://github.com/opencrvs/mosip/pull/152))

- Enabled `child.nid` creation support during birth correction flows. ([#151](https://github.com/opencrvs/mosip/pull/151))

  - To support this, the integration needs to fetch the record to know which action to confirm. Note that this adds a new record audit log row for `ActionType.VIEW`.

- Handles synchronous action acceptance flows gracefully. Previously, the flow used async/202 country config action confirmation flows, but now all flows are supported. ([#159](https://github.com/opencrvs/mosip/pull/159))

- Allow configuring which key in the verifiable credential (e.g., UIN, VID, NID) is used to populate `child.nid` in OpenCRVS. ([#156](https://github.com/opencrvs/mosip/pull/156))

- Allow returning `individual_id` from OIDP (E-Signet) user info response. It gets passed to `idType` as `NATIONAL_ID`, and `nid` as the individual id.

- Allow adding a custom `schemaJson` instead of hard-coded.

- Added `jti` claim to the E-Signet request as required by E-Signet.

- Aligned to E-Signet's new name handling in Collab. It now splits the name by ' ' instead of separate claims.

- Aligned service logging with redaction and structured events. ([#134](https://github.com/opencrvs/mosip/pull/134))

## 1.9.0

Before version 1.9, communication between country-config and mosip-api was handled via FHIR and GraphQL. OpenCRVS 1.9 introduces a refactored data model, new REST APIs, and new country configuration hooks such as onRegisterHandler. These changes require updates to country configurations, as the @opencrvs/mosip package has been updated accordingly. For detailed upgrade instructions, refer to [documentation.opencrvs.org](https://documentation.opencrvs.org).

### Country configuration changes

- `@opencrvs/mosip` now exposes `createMosipInteropClient`, which can be used to `register` and `verifyNid` based on custom rules.
- `@opencrvs/mosip` has deprecated `mosipRegistrationHandler` and `mosipRegistrationForReviewHandler` in favor of the new APIs.
- `@opencrvs/mosip` has deprecated `fhirBundleToMOSIPPayload`, as version 1.9 no longer uses FHIR.
