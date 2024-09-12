# Changelog

## 1.6.0 (TBD)

### New features

- Certificate handlebar for registration fees `registrationFees` [#6817](https://github.com/opencrvs/opencrvs-core/issues/6817)
- Logged in user details handlebar `loggedInUser` [#6529](https://github.com/opencrvs/opencrvs-core/issues/6529)
- Supporting document fields can now be made required
- If there is only one option in the document uploader select, then it stays hidden and only the upload button is showed with the only option being selected by default

- #### ElasticSearch reindexing

  Allows reindexing ElasticSearch via a new search-service endpoint `reindex`. We're replacing the original `ocrvs` index with timestamped ones. This is done automatically when upgrading and migrating, but this is an important architectural change that should be noted. More details in [#7033](https://github.com/opencrvs/opencrvs-core/pull/7033).

- Introduce a new certificate handlebar "preview" which can be used to conditionally render some svg element when previewing the certificate e.g. background image similar to security paper

### Improvements

- Internally we were storing the `family` name field as a required property which was limiting what how you could capture the name of a person in the forms. Now we are storing it as an optional property which would make more flexible.

### Breaking changes

- Remove `DEL /elasticIndex` endpoint due reindexing changes.
- Gateways searchEvents `operationHistories` only returns `operationType` & `operatedOn` due to the other fields being unused in OpenCRVS
- Core used to provide review/preview section by default which are now removed and need to be provided from countryconfig. The signature field definitions (e.g. informant signature, bride signature etc.) were hard coded in core which also have now been removed. The signatures can now be added through the review/preview sections defined in countryconfig just like any other field. You can use the following section definition as the default which is without any additional fields. We highly recommend checking out our reference country repository which has the signature fields in it's review/preview sections

```
{
  id: 'preview',
  viewType: 'preview',
  name: {
    defaultMessage: 'Preview',
    description: 'Form section name for Preview',
    id: 'register.form.section.preview.name'
  },
  title: {
    defaultMessage: 'Preview',
    description: 'Form section title for Preview',
    id: 'register.form.section.preview.title'
  },
  groups: [
    {
      id: 'preview-view-group',
      fields: []
    }
  ]
}
```

## 1.5.1

## Improvements

- Fetch child identifier in view record
- Home screen application’s name and icons are to be configured from country configuration package as manifest.json and app icon files are moved from core to country config (check `opencrvs-countryconfig/src/client-static` folder)

## Bug fixes

- On slow connections or in rare corner cases, it was possible that the same record got saved to the database twice. This was caused by a bug in how the unique technical identifier we generate were stored as FHIR. The backend now ensures every record is submitted only once. [#7477](https://github.com/opencrvs/opencrvs-core/issues/7477)
- Fixed an issue where address line fields (e.g., address line 1, address line 2, etc.) were not being updated correctly when a user attempted to update a record's event location, such as place of birth or place of death. [#7531](https://github.com/opencrvs/opencrvs-core/issues/7531)
- Handle label params used in form inputs when rendering in review section view
- Fix probable migration issues for countries migrating from 1.2 [#7464](https://github.com/opencrvs/opencrvs-core/issues/7464)
- When a declaration(birth/death) is created the event location information was not being parsed to ElasticSearch which caused the Advanced search feature to not work when searching for records by event location.[7494](https://github.com/opencrvs/opencrvs-core/issues/7494)
- When any user's role was updated, incorrect role was shown for that user's actions in the history section of a declaration's record audit page. [#7495](https://github.com/opencrvs/opencrvs-core/issues/7495)
- Registration agent was unable to download declarations that were previously corrected by registrar. [#7582](https://github.com/opencrvs/opencrvs-core/issues/7582)
- When a user updates a marriage declaration editing the signature of the bride, groom, witness one or witness two, handle the changed value of the signature properly. [#7462](https://github.com/opencrvs/opencrvs-core/issues/7462)
- The internal function we used to check if all the location references listed in the encounter are included in the bundle had incorrect logic which resulted in location details missing in ElasticSearch which broke Advanced search. [7494](https://github.com/opencrvs/opencrvs-core/issues/7494)

## 1.5.0 (TBD)

## Breaking changes

- #### Upgrade node version to 18

  This version enforces environment to have Node 18 installed (supported until April 2025) and removes support for Node 16

  - Supports node version `18.19.x`
  - Specified operating systems in js modules as `darwin, linux`
  - Dev scripts and Vite run with an environment variable `NODE_OPTIONS=--dns-result-order=ipv4first` to resolve ipv4 addresses for `localhost` to support systems that resolves ipv6 addresses by default in Node versions >=17

- #### Update the certificate preview mechanism

  In effort of minimizing JavaScript-bundle size, we have streamlined the way how review certificate -page renders certificates. In case the images in your certificates are previewing blurry, you need to update your SVG-certificates to print QR-codes and other images directly with `<image width="36" height="36" xlink:href="{{qrCode}}" x="500" y="770"></image>` instead of the more complicated `<rect fill="url(#pattern)"></rect>` -paradigm. This doesn't affect printed certificates as they are still created as previously.

- #### Remove unused GraphQL resolvers locationById and locationsByParent

- #### Remove unused GraphQL type `user.catchmentArea` in favor of `user.primaryOffice`

- #### Move default address generation to country-config

  We are dropping support for 'agentDefault' to be used as initial value for SELECT_WITH_DYNAMIC_OPTIONS type of fields. The country config package now must return the form with prepopulated initial values to show default addresses. [#6871](https://github.com/opencrvs/opencrvs-core/issues/6871)

- #### Remove system admin UI items: Application, Certificates, User roles, Informant notifications

  We have now moved to configuring these items directly from country configuration repository.

## New features

- Add loading spinners before JavaScript bundle has loaded for both login and client
- Add loading bar before javaScript bundle has loaded for client and when fetching records [#6641](https://github.com/opencrvs/opencrvs-core/issues/6641)
- Support for landscape certificate templates
- Allow defining maxLength attribute for number type fields [#6356](https://github.com/opencrvs/opencrvs-core/issues/6356)
- Introduce two new properties to the form field `DOCUMENT_UPLOADER_WITH_OPTION`
  - `compressImagesToSizeMB` : An optional prop of number type to define a compressed size. Compression is ignored when the input file is already smaller or equal of the given value or a falsy given value.
  - `maxSizeMB`: An optional validation prop to prevent input of a file bigger than a defined value.
- Metabase default credentials now must be configured via countryconfig repository environment variables and secrets otherwise the dashboard service won't start [#6578](https://github.com/opencrvs/opencrvs-core/issues/6578)
- Introduce rate limiting to routes that could potentially be bruteforced or extracted PII from [#6145](https://github.com/opencrvs/opencrvs-core/pull/6145)

## Improvements

- Development time logs are now much tidier and errors easier to point out. Production logging will still remain as is. [#7022](https://github.com/opencrvs/opencrvs-core/pull/7022)
- Mask emails and phone numbers from notification logs [#7204](https://github.com/opencrvs/opencrvs-core/pull/7204)

## Bug fixes

- Handle back button click after issuing a declaration [#6424](https://github.com/opencrvs/opencrvs-core/issues/6424)
- Fix certificate verification QR code for a death declaration [#6230](https://github.com/opencrvs/opencrvs-core/issues/6230#issuecomment-1996766125)
- Fix certificate verification QR code crashing when gender is unknown [#6422](https://github.com/opencrvs/opencrvs-core/issues/6422)
- Fix certificate verification page missing registration center and the name of registrar [#6614](https://github.com/opencrvs/opencrvs-core/issues/6614)
- Amend certificate verification showing the certifying date instead of records creation date [#7098](https://github.com/opencrvs/opencrvs-core/pull/7098)
- Fix records not getting issued [#6216] (https://github.com/opencrvs/opencrvs-core/issues/6216)
- Fix record correction e2e failing due to stale data getting saved on redux
- Convert eventDates to LocalDate before formatting [#6719](https://github.com/opencrvs/opencrvs-core/issues/6719)
- In advance search, any status tag is showing archived after search [#6678](https://github.com/opencrvs/opencrvs-core/issues/6678)
- Fix first name issues when creating a user [#6631](https://github.com/opencrvs/opencrvs-core/issues/6631)
- Show correct record option in certificate preview page when trying to print by RA [#6224](https://github.com/opencrvs/opencrvs-core/issues/6224)
- Fix certificate templates not getting populated for health facility event locations & ADMIN_LEVEL > 2
- Fix download failure for incomplete (without date of death) death declarations [#6807](https://github.com/opencrvs/opencrvs-core/issues/6807)
- Fix search result declaration record audit unassign issue [#5781](https://github.com/opencrvs/opencrvs-core/issues/5781)
- In review page, Eliminating the 'No supporting documents' and 'upload' prompts when documents are already uploaded [#6231] (https://github.com/opencrvs/opencrvs-core/issues/6231)
- Fix Registrar of any location should be able to review a correction request [#6247](https://github.com/opencrvs/opencrvs-core/issues/6247)
- remove upload button when no supporting docs are configured [#5944](https://github.com/opencrvs/opencrvs-core/issues/5944)
- Fix issues of invisible inputs when navigating from can't login link in login page [#6163](https://github.com/opencrvs/opencrvs-core/issues/6163)
- Fix the "Continue" button being disabled when changes in correction form is made [#6780](https://github.com/opencrvs/opencrvs-core/issues/6780)
- Remove leading slash from `resendAuthenticationCode` in login to fix resend email button [#6987](https://github.com/opencrvs/opencrvs-core/issues/6987) [#7037](https://github.com/opencrvs/opencrvs-core/issues/7037)
- Fix dashboard cron jobs not working [#7016](https://github.com/opencrvs/opencrvs-core/issues/7016)
- Fix client modal glitches on integrations page [#7002] (https://github.com/opencrvs/opencrvs-core/issues/7002)
- Fix 'Place of Certification' is showing wrong in certificate [#7060] (https://github.com/opencrvs/opencrvs-core/issues/7060)
- Fix Check for valid date to handle incomplete marriage declarations [#7017](https://github.com/opencrvs/opencrvs-core/issues/7017)
- Fix session expiration when user tries to change phone number [#7003](https://github.com/opencrvs/opencrvs-core/pull/7025)
- Fix French translation missing for relationship to informant when trying to correct record, print and issue record [#6341] (https://github.com/opencrvs/opencrvs-core/issues/6341)
- Fix print record page for an unsaved declaration [#6893](https://github.com/opencrvs/opencrvs-core/issues/6893)
- Fix Reset pagination to default page (1) when location changes in UserList [#6481](https://github.com/opencrvs/opencrvs-core/issues/6481)
- Fix unassign action not appearing in audit history [#7035](https://github.com/opencrvs/opencrvs-core/pull/7072)
- Fix client modal glitches on integrations page [#7002](https://github.com/opencrvs/opencrvs-core/issues/7002)
- Fix address property handling and corrected country data transformation logic [#6989](https://github.com/opencrvs/opencrvs-core/issues/6989)
- Fix "Print and issue to groom|bride" is added to a different variable [#7066](https://github.com/opencrvs/opencrvs-core/pull/7066)
- Fix search query is not being saved in the advanced search results [#7110](https://github.com/opencrvs/opencrvs-core/pull/7117)
- Fix Removed duplicateTrackingId check in createDuplicateTask method [#7081](https://github.com/opencrvs/opencrvs-core/pull/7081)
- Fix Disabling 'Mark as duplicate' button when duplicate reason is empty too [#7083](https://github.com/opencrvs/opencrvs-core/pull/7083)
- Fix correction done from a certificate preview page [#7065](https://github.com/opencrvs/opencrvs-core/pull/7093)
- Fix certificate overflowing in preview certificate view [#7157](https://github.com/opencrvs/opencrvs-core/pull/7157)
- Fix records going completely missing when an unexpected error happens in the backend [#7021](https://github.com/opencrvs/opencrvs-core/pull/7021)
- Fix search indexing BRN's in place of identifiers. Adds spouseIdentifier to search with [#7189](https://github.com/opencrvs/opencrvs-core/pull/7189)
- Rename `farajaland-map.geojson` in dashboards to `map.geojson` to not tie opencrvs-core into a specific country implementation name [#7251](https://github.com/opencrvs/opencrvs-core/pull/7251)
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
