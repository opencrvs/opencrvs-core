# Changelog

## 1.5.0

### Breaking changes

- **Removed dependency on OpenHIM.**&#x20;

  The performance of OpenHIM added an unexpected burden of 200 m/s to every interaction. Cumulatively, this was negatively affecting user experience and therefore we decided to deprecate it.&#x20;

  &#x20;Interested implementers are free to re-introduce OpenHIM should they wish to use it as an interoperability layer without affecting the performance of OpenCRVS now that our architecture no longer depends on it.

  The OpenHIM database is kept for backwards compatibility reasons and will be removed in v1.6. [OpenHIM](https://openhim.org/) is an Open Source middleware component designed for managing FHIR interoperability between disparate systems as part of the OpenHIE architectural specification. We had been using this component in a much more fundamental way to monitor microservice comms in a similar fashion to Amazon SQS. &#x20;

- **Upgrade node version to 18**

  This version enforces environment to have Node 18 installed (supported until April 2025) and removes support for Node 16

  - Use nvm to upgrade your local development environment to use node version `18.19.x.`
  - Specified operating systems in js modules as `darwin, linux`
  - Dev scripts and Vite run with an environment variable `NODE_OPTIONS=--dns-result-order=ipv4first` to resolve ipv4 addresses for `localhost` to support systems that resolves ipv6 addresses by default in Node versions >=17

- **Update the certificate preview mechanism** In effort of minimizing JavaScript-bundle size, we have streamlined the way how review certificate -page renders certificates. In case the images in your certificates are previewing blurry, you need to update your SVG-certificates to print QR-codes and other images directly with `<image width="36" height="36" xlink:href="{{qrCode}}" x="500" y="770"></image>` instead of the more complicated `<rect fill="url(#pattern)"></rect>` -paradigm. This doesn't affect printed certificates as they are still created as previously.
- **Generate default address according to logged-in user's location** We have dropped support for the 'agentDefault' prop which was used as initial value for SELECT_WITH_DYNAMIC_OPTIONS fields. If you have not made any changes to address generation, then this should not affect you. If you have, you can refer to this PR to see how agentDefault has been deprecated in an example country: [https://github.com/opencrvs/opencrvs-farajaland/pull/978](https://github.com/opencrvs/opencrvs-farajaland/pull/978)
- **Remove system admin UI items: Application, Certificates, User roles, Informant notifications** We have now moved to configuring these items away from the UI in favour of directly editing these from country configuration repository in code - specifically in application-config-default.ts.
- **Set Metabase default credentials.** These must be configured via countryconfig repository environment variables and secrets otherwise the dashboard service won't start
- **Check your Metabase map file.** For Metabase configuration, we renamed `farajaland-map.geojson` to `map.geojson` to not tie implementations into example country naming conventions.
- **Feature flags** In order to make application config settings more readable, we re-organised `src/api/application/application-config-default.ts` with a clear feature flag block like so. These are then used across the front and back end of the application to control configurable functionality. New feature flags DEATH_REGISTRATION allow you to optionally run off death registration if your country doesnt want to run its first pilot including death and PRINT_DECLARATION (see New Features) have been added.
  `FEATURES: {
  DEATH_REGISTRATION: true, 
  MARRIAGE_REGISTRATION: false,
  ...
} `
- **Improve rendering of addresses in review page where addresses match** When entering father's address details, some countries make use of a checkbox which says "Address is the same as the mothers. " which, when selected, makes the mother's address and fathers address the same. The checkbox has a programatic value of "Yes" or "No". As a result on the review page, the value "Yes" was displayed which didn't make grammatical sense as a response. We decided to use a custom label: "Same as mother's", which is what was asked on the form. This requires some code changes in the src/form/addresses/index.ts file to pull in the `hideInPreview` prop which will hide the value "Yes" on the review page and replace with a content managed label. Associated bug [#5086](https://github.com/opencrvs/opencrvs-core/issues/5086)

### Infrastructure breaking changes

More improvements have been made to the infrastructure provisioning and Github environment creation scripts and documentation. The complexity is somewhat reduced.

- **We removed the example Wireguard VPN set up as it was confusing.** Our intention was to ensure that all implementers were aware that OpenCRVS should be installed behind a VPN and used Wireguard as an example. But the configuration requirements for Wireguard confused implementers who are not using it. Therefore we decided to remove Wireguard as an example. &#x20;
- **We now have a "backup" Github environment and the backup server is automatically provisioned.** We moved the inventory file location to an explicit directory and removed parameters to scripts that can be automated. To migrate, move all inventory files (qa.yml, production.yml, staging.yml from `infrastructure/server-setup` to `infrastructure/server-setup/inventory` and configure `infrastructure/server-setup/inventory/backup.yml`. Run environment creator for your backup server `yarn environment:init --environment=backup`
- **You can configure the file path on the backup server where backups are stored.** We can also allow using staging to both periodically restore a production backup and also give it the capability if required to backup it's own data to a different location using `backup_server_remote_target_directory` and `backup_server_remote_source_directory` Ansible variables. This use case is mostly meant for OpenCRVS team internal use.
- **We now automate SSH key exchange between application and backup server.** For staging servers, automatically fetch production backup encryption key if periodic restore is enabled using `ansible_ssh_private_key_file` Ansible variables. Therefore documentation is simplified for a new server set-up.
- **In infrastructure Github workflows: SSH_PORT is new and required allowing you the ability to use a non-standard SSH port.** This Github Action environment variable must be added.
- **In infrastructure Github workflows: SSH_HOST** should be moved from being a Github Action environment secret to a Github Action environment variable before it is deprecated in 1.7.0
- **No longer an assumption made that production server Docker replicas and Mongo replica-sets are necessary.** In our Docker Compose files, we had originally assumed that a production deployment would always be deployed on a cluster to enable load balancing. We applied a [Mongo replica set](https://github.com/opencrvs/opencrvs-countryconfig/blob/48cf278bab9d17e07b60b427294a26c8f35bcc1b/infrastructure/docker-compose.production-deploy.yml#L170C3-L201C19) by default on production and set [replicas: 2](https://github.com/opencrvs/opencrvs-countryconfig/blob/48cf278bab9d17e07b60b427294a26c8f35bcc1b/infrastructure/docker-compose.production-deploy.yml#L124) on each microservice. However after experience in multiple countries running small scale pilots, a production deployment usually starts off as 1 server node and then scales into a cluster over time in order to save costs and resources. Therefore these replicas are a waste of resources. So you will notice that this has been deleted. You can always manually add your desired replicas back into you Docker Compose configuration if you want. In Docker Compose files, search for REPLICAS and update accordingly as well as attending to the linked examples.

Follow the descriptions in the migration notes to re-provision all servers safely.

### New features

- Introduced rate limiting to routes that could potentially be bruteforced or extracted PII from.
- The login and client application loading experience has improved. A loading bar appears before the javaScript bundle has loaded and this transitions when fetching records.&#x20;
- Development time logs are now much tidier and errors easier to point out. Production logging will still remain as is.&#x20;
- Masked emails and phone numbers from notification logs.
- Support for landscape certificate templates.
- Allow defining maxLength attribute for number type fields.
- A new certificate handlebar for registration fees has been added `registrationFees`
- A new certificate handlebar for logged-in user details has been added `loggedInUser`&#x20;
- Add support for image compression configuration. Two new properties to this form field are available: `DOCUMENT_UPLOADER_WITH_OPTION`
  - `compressImagesToSizeMB` : An optional prop of number type to define a compressed size. Compression is ignored when the input file is already smaller or equal of the given value or a falsy given value.
  - `maxSizeMB`: An optional validation prop to prevent input of a file bigger than a defined value.
- If a country doesnt wish to use Sentry for logging errors, the SENTRY_DSN variable is now optional and the LogRocket option has been deprecated due to lack of demand.
- Given that upon an upgrade between versions of OpenCRVS, that users cache is cleared, it is important to inform staff to submit any draft applications before the upgrade date. We introduced an "Email all users" feature so that National System Admins can send all staff messages. This feature can be used for any other all staff comms that are deemed required.

<figure><img src="../../.gitbook/assets/Screenshot 2024-06-25 at 17.12.54.png" alt=""><figcaption></figcaption></figure>

- Included an endpoint for serving individual certificates in development mode. This improves the developer experience when configuring certificates.
- Removed logrocket refrences.
- Enable gzip compression in client & login
- Use docker compose v2 in github workflows
- Added SMTP environment variables into the qa compose file to enable QA of SMTP servers.
- In the certificate, the 'Place of Certification' now accurately reflects the correct location.
- Groom's and Bride's name, printIssue translation variables updated [#124](https://github.com/opencrvs/opencrvs-countryconfig/pull/124)
- Add query mapper for International Postal Code field
- Add support for image compression configuration
- Provide env variables for metabase admin credentials
- Improved formatting of informant name for inProgress declaration emails
- There is now an option to print the review page of an event declaration form. The PRINT_DECLARATION feature flag in application config settings can enable this on or off.

### New content keys requiring translation

```
advancedSearch.form.recordStatusCorrectionRequested,Option for form field: status of record,Correction requested
config.emailAllUsers.modal.supportingCopy,Label for send email all users confirmation supporting copy,User will receive emails over the next 24 hours
config.emailAllUsers.modal.title,Label for send email all users confirmation title,Send email to all users?
config.emailAllUsers.subtitle,Subtitle for email all users,This email will be sent to all users you are active. Emails will be sent over the next 24 hours. Only one email can be sent per day
config.emailAllUsers.title,Title for email all users,Email all users
config.userRoles.language,Language name,"{language, select, en {English} fr {French} other {{language}}}"
constants.emailBody,Label for email body input,Message
constants.emailSubject,Label for email subject input,Subject
correction.correctionForApprovalDialog.actions.cancel,The cancel button for the dialog when record correction sent by registration agent for approval,Cancel
correction.correctionForApprovalDialog.actions.send,The send button for the dialog when record correction sent by registration agent for approval,Confirm
correction.correctionForApprovalDialog.description,The description for the dialog when record correction sent by registration agent for approval,The Registrar will be notified of this correction request and a record of this request will be recorded
correction.correctionForApprovalDialog.title,The title for the dialog when record correction sent by registration agent for approval,Send record correction for approval ?
correction.correctRecordDialog.description,The description for the dialog when record correction sent by a registrar,The informant will be notified of this correction and a record of this decision will be recorded
correction.correctRecordDialog.title,The title for the dialog when record correction sent by a registrar,Correct record ?
correction.summary.office,Office where certificate correction summary was submitted,Office
correction.summary.requestedOn,Date when certificate correction summary was submitted,Requested on
correction.summary.submitter,Submitter of certificate correction summary,Submitter
form.customField.label.numberOfDependants,,No. of dependants
form.customField.label.reasonForLateRegistrationBirth,,Reason for delayed registration
form.customField.label.reasonForLateRegistrationDeath,,Reason for late registration
form.field.helpertext.nid,Helper text for nid input field,The National ID can only be numeric and must be 10 digits long
form.field.label.addressLine1RuralOption,,Village
form.field.label.addressLine1UrbanOption,,Residential Area
form.field.label.addressLine2UrbanOption,,Street
form.field.label.app.certifyRecordTo.bride,,Print and issue to bride
form.field.label.app.certifyRecordTo.groom,,Print and issue to groom
form.field.label.attendantAtBirthLayperson,,Layperson
form.field.label.cityUrbanOption,Label for City,Town
form.field.label.empty,empty string,
form.field.label.informantsRelationWithChild,,Relationship to child
form.field.label.maritalStatusSeparated,,Separated
form.field.label.relationOtherFamilyMember,Label for other family member relation,Other family member
form.field.label.totalFees,Label for input Reason for Change,
form.field.nidVerificationOngoing,Label for indicating offline status for the user. NID verification is not currently available offline.,National ID authentication is currently not available offline.
form.section.deceased.relationship,,Relationship to deceased
form.section.witnessOne.name,Form section name for Witness one,Witness 1
form.section.witnessTwo.name,Form section name for Witness two,Witness 2
home.header.placeHolderId,,Search for an ID
misc.notif.emailAllUsersError,Label for Email all users error toast,Only one email can be sent per day
misc.notif.emailAllUsersSuccess,Label for Email all users success toast,Email sent to all users
navigation.emailAllUsers,Email all users label in navigation,Email all users
number.twelve,Minimum length password,12
phone.digit,,10
phone.start,Should starts with,0(4|5)
recordAudit.regAction.markedAsNotDuplicate,Marked not a duplicate status message for record audit,Marked not a duplicate
recordAudit.regAction.verified,Verified action,Certificate verified
recordAudit.regStatus.correctionRequested,Label for when someone requested correction,Correction requested
regHome.outbox.failed,Label for declaration status failed,Failed to send
regHome.outbox.retry,Label for Retry button in Outbox shown for records that failed to send,Retry
register.form.modal.desc.saveCorrectionConfirm,Description for save correction confirmation modal,The declarant will be notified of this correction and a record of this decision will be recorded
register.form.modal.desc.saveCorrectionReject,Description for reject correction modal,The declarant will be notified of this decision and a record of this decision will be recorded
register.form.modal.title.saveCorrectionConfirm,Title for save correction confirmation modal,Approve correction?
register.form.modal.title.saveCorrectionReject,Title for reject correction modal,Reject correction?
register.selectInformant.birthInformantTitle,Who is applying for birth registration,Informant type
system.user.settings.language,Language name,"{language, select, en {English} fr {Français} other {{language}}}"
user.profile.auditList.approvedCorrectionAuditAction,Description for record correction being approved,Approved correction request
user.profile.auditList.rejectedCorrectedAuditAction,Description for record correction being rejected,Rejected correction request
user.profile.auditList.requestedCorrectionAuditAction,Description for record correction being requested,Requested correction
validations.invalidDate,The error message that appears when a date field is invalid,Invalid date field
verifyCertificate.certifiedAt,Label for date of certification,Date of certification
```

## Bug fixes

- Handle back button click after issuing a declaration [#6424](https://github.com/opencrvs/opencrvs-core/issues/6424)
- Fix certificate verification QR code for a death declaration [#6230](https://github.com/opencrvs/opencrvs-core/issues/6230#issuecomment-1996766125)
- Fix certificate verification QR code crashing when gender is unknown [#6422](https://github.com/opencrvs/opencrvs-core/issues/6422)
- Fix certificate verification page missing registration center and the name of registrar [#6614](https://github.com/opencrvs/opencrvs-core/issues/6614)
- Amend certificate verification showing the certifying date instead of records creation date [#7098](https://github.com/opencrvs/opencrvs-core/pull/7098)
- Fix records not getting issued \[#6216] (https://github.com/opencrvs/opencrvs-core/issues/6216)
- Fix record correction e2e failing due to stale data getting saved on redux
- Convert eventDates to LocalDate before formatting [#6719](https://github.com/opencrvs/opencrvs-core/issues/6719)
- In advance search, any status tag is showing archived after search [#6678](https://github.com/opencrvs/opencrvs-core/issues/6678)
- Fix first name issues when creating a user [#6631](https://github.com/opencrvs/opencrvs-core/issues/6631)
- Show correct record option in certificate preview page when trying to print by RA [#6224](https://github.com/opencrvs/opencrvs-core/issues/6224)
- Fix certificate templates not getting populated for health facility event locations & ADMIN_LEVEL > 2
- Fix download failure for incomplete (without date of death) death declarations [#6807](https://github.com/opencrvs/opencrvs-core/issues/6807)
- Fix search result declaration record audit unassign issue [#5781](https://github.com/opencrvs/opencrvs-core/issues/5781)
- In review page, Eliminating the 'No supporting documents' and 'upload' prompts when documents are already uploaded [#6231](https://github.com/opencrvs/opencrvs-core/issues/6231)
- In record audit page, after 'Correction request approved' the “record corrected” action is removed from history [#6228](https://github.com/opencrvs/opencrvs-core/issues/6228)
- Fix Registrar of any location should be able to review a correction request [#6247](https://github.com/opencrvs/opencrvs-core/issues/6247)
- remove upload button when no supporting docs are configured [#5944](https://github.com/opencrvs/opencrvs-core/issues/5944)
- Fix issues of invisible inputs when navigating from can't login link in login page [#6163](https://github.com/opencrvs/opencrvs-core/issues/6163)
- Fix the "Continue" button being disabled when changes in correction form is made [#6780](https://github.com/opencrvs/opencrvs-core/issues/6780)
- Remove leading slash from `resendAuthenticationCode` in login to fix resend email button [#6987](https://github.com/opencrvs/opencrvs-core/issues/6987) [#7037](https://github.com/opencrvs/opencrvs-core/issues/7037)
- Fix 'Place of Certification' is showing wrong in certificate \[#7060] (https://github.com/opencrvs/opencrvs-core/issues/7060)
- Fix dashboard cron jobs not working [#7016](https://github.com/opencrvs/opencrvs-core/issues/7016)
- Fix Check for valid date to handle incomplete marriage declarations [#7017](https://github.com/opencrvs/opencrvs-core/issues/7017)
- Fix session expiration when user tries to change phone number [#7003](https://github.com/opencrvs/opencrvs-core/pull/7025)
- Fix French translation missing for relationship to informant when trying to correct record, print and issue record \[#6341] (https://github.com/opencrvs/opencrvs-core/issues/6341)
- Fix client modal glitches on integrations page [#7002](https://github.com/opencrvs/opencrvs-core/issues/7002)
- Fix print record page for an unsaved declaration [#6893](https://github.com/opencrvs/opencrvs-core/issues/6893)
- Fix Reset pagination to default page (1) when location changes in UserList [#6481](https://github.com/opencrvs/opencrvs-core/issues/6481)
- Fix Disabling 'Mark as duplicate' button when duplicate reason is empty too [#7083](https://github.com/opencrvs/opencrvs-core/pull/7083)
- Fix certificate overflowing in preview certificate view [#7157](https://github.com/opencrvs/opencrvs-core/pull/7157)
- Fix records going completely missing when an unexpected error happens in the backend [#7021](https://github.com/opencrvs/opencrvs-core/pull/7021)
- Fix correction done from a certificate preview page [#7065](https://github.com/opencrvs/opencrvs-core/pull/7093)
- Fix "Print and issue to groom|bride" is added to a different variable [#7046](https://github.com/opencrvs/opencrvs-core/issues/7046)
- Fix search query is not being saved in the advanced search results [#7110](https://github.com/opencrvs/opencrvs-core/pull/7117)
- Fix removed duplicateTrackingId check in createDuplicateTask method [#7024](https://github.com/opencrvs/opencrvs-core/issues/7024)
- Fix address property handling and corrected country data transformation logic [#6989](https://github.com/opencrvs/opencrvs-core/issues/6989)
- Fix search indexing BRN's in place of identifiers. Adds spouseIdentifier to search with [#7189](https://github.com/opencrvs/opencrvs-core/pull/7189)
- Rename `farajaland-map.geojson` in dashboards to `map.geojson` to not tie opencrvs-core into a specific country implementation name [#7251](https://github.com/opencrvs/opencrvs-core/pull/7251)
- Fix unassign action not appearing in audit history [#7035](https://github.com/opencrvs/opencrvs-core/pull/7072)
- Update advanced search list properly when assignments change [#7307](https://github.com/opencrvs/opencrvs-core/pull/7307)
- Update Content-Security-Policy to allow loading fonts from country configuration [#7296](https://github.com/opencrvs/opencrvs-core/pull/7296)
- Fix frontend crashing on 'Registration by Status' under performance due to missing translations [#7129](https://github.com/opencrvs/opencrvs-core/pull/7129)
- Fix email of practitioner to be saved in hearth. A migration is added to correct the email of practitoiner in existing db. [7315](https://github.com/opencrvs/opencrvs-core/pull/7315)

## Refactor

- Remove dependency on openhim. The openhim db is kept for backwards compatibility reasons and will be removed in v1.6. It has brought some major changes
  in how the microservices are communicating among them. More on this can be found on the updated [sequence diagrams](https://github.com/opencrvs/opencrvs-core/tree/develop/sequence-diagrams/backend)

## [1.3.4](https://github.com/opencrvs/opencrvs-core/compare/v1.3.3...v1.3.4)

## Bug fixes

- #### Include middlename when generating fullnames
  - Refactored out the scattered logic for generating fullnames and converged them into a single function
  - Make lastname optional for a registered declaration
- #### Recognize occupation as an optional field in informant section
- #### Fix download failure when `arrayToFieldTransormer` is used in template mapping
- #### Fix multiple records not being downloaded simultaneously [#6492](https://github.com/opencrvs/opencrvs-core/issues/6492#issuecomment-1961098936)
- #### Fix showing unassigned toast for reinstated declarations [#6492](https://github.com/opencrvs/opencrvs-core/issues/6492#issuecomment-1961098936)
- #### Fix system crash when opening the started action modal [#6551](https://github.com/opencrvs/opencrvs-core/issues/6551)
- #### Convert eventDates to LocalDate before formatting [#6719](https://github.com/opencrvs/opencrvs-core/issues/6719)

## [1.4.1](https://github.com/opencrvs/opencrvs-core/compare/v1.3.3...v1.4.1)

- Fix Metabase versions in Dashboards service. Previously the version used for local development wasn't the one built into the docker image, which caused the locally generated initialisation file to fail in deployed environments.
- Fix a seeding script bug, where it failed when done too quickly [#6553](https://github.com/opencrvs/opencrvs-core/issues/6553)
- Update minimum password length validation [#6559](https://github.com/opencrvs/opencrvs-core/issues/6559)
- Include middlename when generating fullnames
  - Refactored out the scattered logic for generating fullnames and converged them into a single function
  - Make lastname optional for a registered declaration
- Recognize occupation as an optional field in informant section
- Fix download failure when `arrayToFieldTransormer` is used in template mapping
- Fix multiple records not being downloaded simultaneously [#6492](https://github.com/opencrvs/opencrvs-core/issues/6492#issuecomment-1961098936)
- Fix showing unassigned toast for reinstated declarations [#6492](https://github.com/opencrvs/opencrvs-core/issues/6492#issuecomment-1961098936)
- Fix system crash when opening the started action modal [#6551](https://github.com/opencrvs/opencrvs-core/issues/6551)
- Make language names used in language select dropdowns configurable in country resource package copy
- Fix login to field agent when an incomplete record is previously retrieved by them [#6584](https://github.com/opencrvs/opencrvs-core/issues/6584)

## [1.4.0](https://github.com/opencrvs/opencrvs-core/compare/v1.3.3...v1.4.0)

In this release, we made **no changes** to OpenCRVS Core. All changes in this release apply only to the [OpenCRVS country configuration](https://github.com/opencrvs/opencrvs-countryconfig/releases/tag/v1.4.0) repository.

### Please note for 1.5.0 release

In the next OpenCRVS release v1.5.0, there will be two significant changes both in the country resource package and the infrastructure configuration inside of it:

- The `infrastructure` directory and related pipelines will be moved to a new repository.
- Both the new infrastructure repository and the OpenCRVS country resource package repositories will start following their own release cycles, mostly independent from the core's release cycle. From this release forward, both packages are released as "OpenCRVS minor compatible" releases, meaning that the OpenCRVS countryconfig 1.3.0-<incrementing release number> is compatible with OpenCRVS 1.3.0, 1.3.1, 1.3.2, etc. This allows for the release of new hotfix versions of the core without having to publish a new version of the infrastructure or countryconfig.

## [1.3.3](https://github.com/opencrvs/opencrvs-core/compare/v1.3.2...v1.3.3)

## Breaking changes

## New features

- #### New handlebars serving the location ids of the admin level locations
  Apart from the new handlebars, a couple more improvements were introduced:
  - stricter type for locations in client
  - **"location"** handlebar helper can now resolve offices & facilities
  - restrict the properties exposed through **"location"** handlebar helper
  - remove deprecated **DIVISION** & **UNION** from client

## Bug fixes

- #### Fix location seeding scripts throwing error when there are too many source locations from the country config
  Locations are now seeded in smaller segments instead of one big collection. The newer approach has improved performance to a significant extent and also clears the interruption caused for a large number of country config locations
- Filter user information such as usernames and authentication codes from server logs
- Core not recognizing "occupation" as an optional field for deceased
- Unassign declaration from a user if the declaration has already been proceeded through the workqueues by a separate user

## Dependency upgrades

- #### Metabase from v0.45.2.1 to v0.46.6.1

See [Releases](https://github.com/opencrvs/opencrvs-core/releases) for release notes of older releases.
