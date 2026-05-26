# Changelog

## 2.0.0

- Support biographic updates to MOSIP via `updateBiographics`.

- Enabled `child.nid` creation support during birth correction flows.
  - To support this, the integration needs to fetch the record to know which action to confirm. Note that this adds a new record audit log row for `ActionType.VIEW`.

- Handles synchronous action acceptance flows gracefully. Previously, the flow used async/202 country config action confirmation flows, but now all flows are supported.

- Allow configuring which key in the verifiable credential (e.g., UIN, VID, NID) is used to populate `child.nid` in OpenCRVS.

## 1.9.0

Before version 1.9, communication between country-config and mosip-api was handled via FHIR and GraphQL. OpenCRVS 1.9 introduces a refactored data model, new REST APIs, and new country configuration hooks such as onRegisterHandler. These changes require updates to country configurations, as the @opencrvs/mosip package has been updated accordingly. For detailed upgrade instructions, refer to [documentation.opencrvs.org](https://documentation.opencrvs.org).

### Country configuration changes

- `@opencrvs/mosip` now exposes `createMosipInteropClient`, which can be used to `register` and `verifyNid` based on custom rules.
- `@opencrvs/mosip` has deprecated `mosipRegistrationHandler` and `mosipRegistrationForReviewHandler` in favor of the new APIs.
- `@opencrvs/mosip` has deprecated `fhirBundleToMOSIPPayload`, as version 1.9 no longer uses FHIR.
