/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import {
  createPrng,
  eventPayloadGenerator,
  getUUID,
  SCOPES as Scopes
} from '@opencrvs/commons/client'
import { FetchUserQuery, Status } from '@client/utils/gateway'
import { generateToken } from './util'

const SCOPES = {
  ...Scopes,
  SEARCH_SCOPES_BIRTH: 'search[event=v2.birth,access=all]',
  SEARCH_SCOPES_DEATH: 'search[event=v2.death,access=all]',
  SEARCH_SCOPES_TENNIS_CLUB: 'search[event=tennis-club-membership,access=all]',
  SEARCH_SCOPES_FOOTBALL_CLUB:
    'search[event=FOOTBALL_CLUB_MEMBERSHIP,access=all]',
  WORKQUEUE_LOCAL_REGISTRAR:
    'workqueue[id=all-events|assigned-to-you|recent|requires-completion|requires-updates|in-review-all|in-external-validation|ready-to-print|ready-to-issue]',
  WORKQUEUE_REGISTRATION_AGENT:
    'workqueue[id=all-events|assigned-to-you|recent|requires-completion|requires-updates|in-review|sent-for-approval|in-external-validation|ready-to-print|ready-to-issue]',
  WORKQUEUE_FIELD_AGENT:
    'workqueue[id=all-events|assigned-to-you|recent|requires-updates|sent-for-review]'
}

/**
 * @returns a payload generator for creating events and actions with sensible defaults.
 */
export function testDataGenerator(rngSeed?: number) {
  const prng = createPrng(rngSeed ?? 1001)
  const user = {
    token: {
      /**
       * IMPORTANT: If you update the scopes or id values below,
       * you MUST regenerate the JWT tokens so they match the new values.
       *
       * To regenerate tokens:
       *   1. Update the snapshot in:
       *        packages/client/src/tests/token-generator.test.ts
       *   2. Copy the new tokens from the updated snapshot into this file.
       *
       * Note: Token generation cannot be done here because it requires
       * `jsonwebtoken`, which depends on Node's `crypto` module and is
       * not supported in the browser.
       */
      fieldAgent:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQuZGVjbGFyZS1iaXJ0aCIsInJlY29yZC5kZWNsYXJlLWRlYXRoIiwicmVjb3JkLmRlY2xhcmUtbWFycmlhZ2UiLCJyZWNvcmQuZGVjbGFyYXRpb24tc3VibWl0LWluY29tcGxldGUiLCJyZWNvcmQuZGVjbGFyYXRpb24tc3VibWl0LWZvci1yZXZpZXciLCJzZWFyY2guYmlydGgiLCJzZWFyY2guZGVhdGgiLCJzZWFyY2gubWFycmlhZ2UiLCJ3b3JrcXVldWVbaWQ9YWxsLWV2ZW50c3xhc3NpZ25lZC10by15b3V8cmVjZW50fHJlcXVpcmVzLXVwZGF0ZXN8c2VudC1mb3ItcmV2aWV3XSIsInNlYXJjaFtldmVudD12Mi5iaXJ0aCxhY2Nlc3M9YWxsXSIsInNlYXJjaFtldmVudD12Mi5kZWF0aCxhY2Nlc3M9YWxsXSIsInNlYXJjaFtldmVudD10ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwLGFjY2Vzcz1hbGxdIiwic2VhcmNoW2V2ZW50PUZPT1RCQUxMX0NMVUJfTUVNQkVSU0hJUCxhY2Nlc3M9YWxsXSJdLCJpYXQiOjE0ODcwNzY3MDgsImF1ZCI6Im9wZW5jcnZzOmdhdGV3YXktdXNlciIsImlzcyI6Im9wZW5jcnZzOmF1dGgtc2VydmljZSIsInN1YiI6IjY3ZWY3ZjgzZDZhOWNiOTJlOWVkYWE5OSJ9.oRWlv_Psoc_-uzJh9-XZxHxRel-HRnqOLh4jrv2oMWzXzouf_CX2ksZm2f84Tdh_ZOl0Roo56vsEGkVmZIZXVcmjbzYBkeELDpG41LymUKtwyjlYc0I4iMzSNhgrIv0tHeyeHT-60opBAgN2kvhG-dKyypucb0SKz8HMDl0U0u3VjKqK_JEAGb4XG_DNaqNesw1gFuwswlGhKnDymAaObFBRhkpRY8SQrvib9Omr4T3NYIb-o8FMlEz9z-tLul3iSvwEwunXoA9voLqp8pxrZbcGoC_wzbm_DJk_RcWu7N03Ad2ibZRSknpWWOnWhbN7dGoV1eh3lTMl5g1vZZFMP64cfuixH1GJ_A-hJWtMqX6S55xbI_yBC56PtgTOsbR4MnCRp7gyWcyHBMD6m6JX5uufe3M7mDI2F7eVE65RJwlsuDSvhxGfrvKq6plPxpWPxDXV2teQy4aO3lO1tNf9mfOyQUFrJtNvSA7eWm9iMmhArF5m0MP20iSrQyr0YptPtH8jdhrNFI37L1XWvgkJr8sQLhKsQ5JCbWrd4KFEf51m8rxuQvgU-MiXptizJRfGbIccAWQ8d4uDCi1m3ypemsarYvVqGHp1Epru6CS0mmxaKVv8AYWE9n6QAewjNpIxpptXtzafjcX5uvuaVSw9E23-WP4p-p481I5to_9WHuk',
      registrationAgent:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQucmVhZCIsInJlY29yZC5kZWNsYXJlLWJpcnRoIiwicmVjb3JkLmRlY2xhcmUtZGVhdGgiLCJyZWNvcmQuZGVjbGFyZS1tYXJyaWFnZSIsInJlY29yZC5kZWNsYXJhdGlvbi1lZGl0IiwicmVjb3JkLmRlY2xhcmF0aW9uLXN1Ym1pdC1mb3ItdXBkYXRlcyIsInJlY29yZC5yZXZpZXctZHVwbGljYXRlcyIsInJlY29yZC5kZWNsYXJhdGlvbi1hcmNoaXZlIiwicmVjb3JkLmRlY2xhcmF0aW9uLXJlaW5zdGF0ZSIsInJlY29yZC5yZWdpc3RlciIsInJlY29yZC5yZWdpc3RyYXRpb24tY29ycmVjdCIsInJlY29yZC5kZWNsYXJhdGlvbi1wcmludC1zdXBwb3J0aW5nLWRvY3VtZW50cyIsInJlY29yZC5leHBvcnQtcmVjb3JkcyIsInJlY29yZC51bmFzc2lnbi1vdGhlcnMiLCJyZWNvcmQucmVnaXN0cmF0aW9uLXByaW50Jmlzc3VlLWNlcnRpZmllZC1jb3BpZXMiLCJyZWNvcmQuY29uZmlybS1yZWdpc3RyYXRpb24iLCJyZWNvcmQucmVqZWN0LXJlZ2lzdHJhdGlvbiIsInBlcmZvcm1hbmNlLnJlYWQiLCJwZXJmb3JtYW5jZS5yZWFkLWRhc2hib2FyZHMiLCJwcm9maWxlLmVsZWN0cm9uaWMtc2lnbmF0dXJlIiwib3JnYW5pc2F0aW9uLnJlYWQtbG9jYXRpb25zOm15LW9mZmljZSIsInNlYXJjaC5iaXJ0aCIsInNlYXJjaC5kZWF0aCIsInNlYXJjaC5tYXJyaWFnZSIsIndvcmtxdWV1ZVtpZD1hbGwtZXZlbnRzfGFzc2lnbmVkLXRvLXlvdXxyZWNlbnR8cmVxdWlyZXMtY29tcGxldGlvbnxyZXF1aXJlcy11cGRhdGVzfGluLXJldmlldy1hbGx8aW4tZXh0ZXJuYWwtdmFsaWRhdGlvbnxyZWFkeS10by1wcmludHxyZWFkeS10by1pc3N1ZV0iLCJzZWFyY2hbZXZlbnQ9djIuYmlydGgsYWNjZXNzPWFsbF0iLCJzZWFyY2hbZXZlbnQ9djIuZGVhdGgsYWNjZXNzPWFsbF0iLCJzZWFyY2hbZXZlbnQ9dGVubmlzLWNsdWItbWVtYmVyc2hpcCxhY2Nlc3M9YWxsXSIsInNlYXJjaFtldmVudD1GT09UQkFMTF9DTFVCX01FTUJFUlNISVAsYWNjZXNzPWFsbF0iXSwiaWF0IjoxNDg3MDc2NzA4LCJhdWQiOiJvcGVuY3J2czpnYXRld2F5LXVzZXIiLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI2ODIxYzE3NWRjZTRkNzg4NmQ0ZTgyMTAifQ.qP10-remcYa3vKRxpvgKbEoK4gNnpE4bklJywQLfR9SRbJvu_p4iVc_BAgUMPtP5XqanrA-FYy_gzmytsVyhASh7frGHgGQ6SNTja-lETsRcOUXbf2l8_WpUAUCZ7JmNNojQPCR1ne2chM5W8XRU6Zzb2cjdCRLi3DZSar59_IpeffQ8gMl96yE7R35czTSTiOMDjgT3h5IdRYkE5Pc2ZcGyyW18I7FvDpZesZiKdqBbfrcx8g6YXQsw3rPrp4B6-kOJFwFDpKY59kkxlce67V7LpcKTU831E9xn08aQHN9DmJZZe0YNILymugjgH-hBoh_C7juVYbxcEEp4BhZhzHrY4F3tw4Ttmihs24q34T36zKQl3jEkyuSzYWIdIMuzl0dKgZfReziQRWsOg5sOgtvZpkcBQ06Mt7RriVN9PjtHkGr52znVH1nM_YvMxyueduwTZoyVxgsiNWIW3mzWhcqgF1HJDaynnFa13pEgy14yP55l9p4GgX6PrrXRXGB5vSJhXD5rOyuHtpQndo2gnjWcnrCdJhJ5AZVF9p1xxhqu-uBQ3zUjnMc1FBKCcE9-wO5WkC3sGlMzAuTI-yZ2HboN3tl_1Vt8ZdDxtxtA8-lc9dE4_j9N3CYhDjyLz3cXUBbdkUyJDMuKishA_KaPRTkdNQDGa45bVF2ieqGPvGY',
      localRegistrar:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQucmVhZCIsInJlY29yZC5kZWNsYXJlLWJpcnRoIiwicmVjb3JkLmRlY2xhcmUtZGVhdGgiLCJyZWNvcmQuZGVjbGFyZS1tYXJyaWFnZSIsInJlY29yZC5kZWNsYXJhdGlvbi1lZGl0IiwicmVjb3JkLmRlY2xhcmF0aW9uLXN1Ym1pdC1mb3ItYXBwcm92YWwiLCJyZWNvcmQuZGVjbGFyYXRpb24tc3VibWl0LWZvci11cGRhdGVzIiwicmVjb3JkLmRlY2xhcmF0aW9uLWFyY2hpdmUiLCJyZWNvcmQuZGVjbGFyYXRpb24tcmVpbnN0YXRlIiwicmVjb3JkLnJlZ2lzdHJhdGlvbi1yZXF1ZXN0LWNvcnJlY3Rpb24iLCJyZWNvcmQuZGVjbGFyYXRpb24tcHJpbnQtc3VwcG9ydGluZy1kb2N1bWVudHMiLCJyZWNvcmQuZXhwb3J0LXJlY29yZHMiLCJyZWNvcmQucmVnaXN0cmF0aW9uLXByaW50Jmlzc3VlLWNlcnRpZmllZC1jb3BpZXMiLCJwZXJmb3JtYW5jZS5yZWFkIiwicGVyZm9ybWFuY2UucmVhZC1kYXNoYm9hcmRzIiwib3JnYW5pc2F0aW9uLnJlYWQtbG9jYXRpb25zOm15LW9mZmljZSIsInNlYXJjaC5iaXJ0aCIsInNlYXJjaC5kZWF0aCIsInNlYXJjaC5tYXJyaWFnZSIsIndvcmtxdWV1ZVtpZD1hbGwtZXZlbnRzfGFzc2lnbmVkLXRvLXlvdXxyZWNlbnR8cmVxdWlyZXMtY29tcGxldGlvbnxyZXF1aXJlcy11cGRhdGVzfGluLXJldmlld3xzZW50LWZvci1hcHByb3ZhbHxpbi1leHRlcm5hbC12YWxpZGF0aW9ufHJlYWR5LXRvLXByaW50fHJlYWR5LXRvLWlzc3VlXSIsInNlYXJjaFtldmVudD12Mi5iaXJ0aCxhY2Nlc3M9YWxsXSIsInNlYXJjaFtldmVudD12Mi5kZWF0aCxhY2Nlc3M9YWxsXSIsInNlYXJjaFtldmVudD10ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwLGFjY2Vzcz1hbGxdIiwic2VhcmNoW2V2ZW50PUZPT1RCQUxMX0NMVUJfTUVNQkVSU0hJUCxhY2Nlc3M9YWxsXSJdLCJpYXQiOjE0ODcwNzY3MDgsImF1ZCI6Im9wZW5jcnZzOmdhdGV3YXktdXNlciIsImlzcyI6Im9wZW5jcnZzOmF1dGgtc2VydmljZSIsInN1YiI6IjY3ZWY3ZjgzZDZhOWNiOTJlOWVkYWFhMSJ9.T7qRwyCZP1McvDPpeoWGkCF-6UjT2pVsq9H3nneAvazafqNkZX2G5PDFUpyMHwPVGGr_ekknYH0Hrq_F0WH2W7NZzhfr2u5cJ_yvQJ8HD59qvJXqm8nrxVEybu69JPPE07XeZMEKMOjf8Wo0yzgdYMvME_deyjsm4yT36XfsLnSPidG8ZYebDSo6nN8BkxOg-7jiVnb029BRjMMDCeqbsFq3ibCBscngnmjrgIRfLvKiIhLwAoGLiX9B7NzGH0VhlbAIiP1-i_1dNBrDOtOO7GpdAmo3w-WMwJia_R62ggiZ9XtXzEmarM5F9RjS-9Ysu6EFPJfJdUROtSIF9JvMqRLkZgTy7sGQvSilt2do6E0rDM-xZ1ALjtwtiBscIc6sEKNP1DwR9pNH7-Q5MtTtYTKCilFSnl_S7tdtIFz6H3Q8QQw3NOZJ0xS6511_SYWk5m8Ebbi0O1Awdd_Ivzk2vuJgLHf56tqnrzZCMAKKxB9-0IP8tUD6GAT8i7rXT3NfgVtG4nNZbikNOZaydZq-xsfIT0zdN7iIqoeDptIQcMvoz03PtEVf9YrMRS2wQKc64vkwn3yHS3WCM-z0X2d_DY4zrngM-X9mgjzjGHqNpneiKq45itJFNW_KXKb3B7bKVUt_8NyPsIn2GYFULi0XmyusmV6yfhn8esu-KR21Ju4'
    },
    id: {
      localRegistrar: '6821c175dce4d7886d4e8210',
      registrationAgent: '67ef7f83d6a9cb92e9edaaa1',
      fieldAgent: '67ef7f83d6a9cb92e9edaa99'
    },
    fieldAgent: () =>
      ({
        id: getUUID(),
        userMgntUserID: getUUID(),
        creationDate: '1736421510056',
        username: 'k.bwalya',
        practitionerId: getUUID(),
        mobile: '+260911111111',
        email: 'kalushabwalya17@gmail.com',
        role: {
          label: {
            id: 'userRole.socialWorker',
            defaultMessage: 'Social Worker',
            description: 'Name for user role Social Worker',
            __typename: 'I18nMessage'
          },
          __typename: 'UserRole'
        },
        status: Status.Active,
        name: [
          {
            use: 'en',
            firstNames: 'Kalusha',
            familyName: 'Bwalya',
            __typename: 'HumanName'
          }
        ],
        primaryOffice: {
          id: '028d2c85-ca31-426d-b5d1-2cef545a4902',
          name: 'Ibombo District Office',
          alias: ['Ibombo District Office'],
          status: 'active',
          __typename: 'Location'
        },
        localRegistrar: null,
        avatar: null,
        searches: [],
        __typename: 'User'
      }) satisfies FetchUserQuery['getUser'],
    registrationAgent: () =>
      ({
        id: getUUID(),
        userMgntUserID: getUUID(),
        creationDate: '1736421510209',
        username: 'f.katongo',
        practitionerId: getUUID(),
        mobile: '+260922222222',
        email: 'kalushabwalya17+@gmail.com',
        role: {
          label: {
            id: 'userRole.registrationAgent',
            defaultMessage: 'Registration Agent',
            description: 'Name for user role Registration Agent',
            __typename: 'I18nMessage'
          },
          __typename: 'UserRole'
        },
        status: Status.Active,
        name: [
          {
            use: 'en',
            firstNames: 'Felix',
            familyName: 'Katongo',
            __typename: 'HumanName'
          }
        ],
        primaryOffice: {
          id: '028d2c85-ca31-426d-b5d1-2cef545a4902',
          name: 'Ibombo District Office',
          alias: ['Ibombo District Office'],
          status: 'active',
          __typename: 'Location'
        },
        localRegistrar: null,
        avatar: null,
        searches: [],
        __typename: 'User'
      }) satisfies FetchUserQuery['getUser'],
    localRegistrar: () =>
      ({
        id: getUUID(),
        userMgntUserID: getUUID(),
        creationDate: '1737725915295',
        username: 'k.mweene',
        practitionerId: getUUID(),
        mobile: '+260933333333',
        email: 'kalushabwalya1.7@gmail.com',
        role: {
          label: {
            id: 'userRole.localRegistrar',
            defaultMessage: 'Local Registrar',
            description: 'Name for user role Local Registrar',
            __typename: 'I18nMessage'
          },
          __typename: 'UserRole'
        },
        status: Status.Active,
        name: [
          {
            use: 'en',
            firstNames: 'Kennedy',
            familyName: 'Mweene',
            __typename: 'HumanName'
          }
        ],
        primaryOffice: {
          id: '028d2c85-ca31-426d-b5d1-2cef545a4902',
          name: 'Ibombo District Office',
          alias: ['Ibombo District Office'],
          status: 'active',
          __typename: 'Location'
        },
        localRegistrar: {
          name: [
            {
              use: 'en',
              firstNames: 'Kennedy',
              familyName: 'Mweene',
              __typename: 'HumanName'
            }
          ],
          role: 'LOCAL_REGISTRAR',
          signature: null,
          __typename: 'LocalRegistrar'
        },
        avatar: null,
        searches: [],
        __typename: 'User'
      }) satisfies FetchUserQuery['getUser'],
    scopes: {
      /**
       * scopes are same as countryconfig/src/data-seeding/roles/roles.ts
       * except for workque scope that has an extra workqueue: all-events
       */
      localRegistrar: [
        SCOPES.RECORD_READ,
        SCOPES.RECORD_DECLARE_BIRTH,
        SCOPES.RECORD_DECLARE_DEATH,
        SCOPES.RECORD_DECLARE_MARRIAGE,
        SCOPES.RECORD_DECLARATION_EDIT,
        SCOPES.RECORD_SUBMIT_FOR_UPDATES,
        SCOPES.RECORD_REVIEW_DUPLICATES,
        SCOPES.RECORD_DECLARATION_ARCHIVE,
        SCOPES.RECORD_DECLARATION_REINSTATE,
        SCOPES.RECORD_REGISTER,
        SCOPES.RECORD_REGISTRATION_CORRECT,
        SCOPES.RECORD_PRINT_RECORDS_SUPPORTING_DOCUMENTS,
        SCOPES.RECORD_EXPORT_RECORDS,
        SCOPES.RECORD_UNASSIGN_OTHERS,
        SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES,
        SCOPES.RECORD_CONFIRM_REGISTRATION,
        SCOPES.RECORD_REJECT_REGISTRATION,
        SCOPES.PERFORMANCE_READ,
        SCOPES.PERFORMANCE_READ_DASHBOARDS,
        SCOPES.PROFILE_ELECTRONIC_SIGNATURE,
        SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE,
        SCOPES.SEARCH_BIRTH,
        SCOPES.SEARCH_DEATH,
        SCOPES.SEARCH_MARRIAGE,
        SCOPES.WORKQUEUE_LOCAL_REGISTRAR,
        SCOPES.SEARCH_SCOPES_BIRTH,
        SCOPES.SEARCH_SCOPES_DEATH,
        SCOPES.SEARCH_SCOPES_TENNIS_CLUB,
        SCOPES.SEARCH_SCOPES_FOOTBALL_CLUB
      ],
      registrationAgent: [
        SCOPES.RECORD_READ,
        SCOPES.RECORD_DECLARE_BIRTH,
        SCOPES.RECORD_DECLARE_DEATH,
        SCOPES.RECORD_DECLARE_MARRIAGE,
        SCOPES.RECORD_DECLARATION_EDIT,
        SCOPES.RECORD_SUBMIT_FOR_APPROVAL,
        SCOPES.RECORD_SUBMIT_FOR_UPDATES,
        SCOPES.RECORD_DECLARATION_ARCHIVE,
        SCOPES.RECORD_DECLARATION_REINSTATE,
        SCOPES.RECORD_REGISTRATION_REQUEST_CORRECTION,
        SCOPES.RECORD_PRINT_RECORDS_SUPPORTING_DOCUMENTS,
        SCOPES.RECORD_EXPORT_RECORDS,
        SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES,
        SCOPES.PERFORMANCE_READ,
        SCOPES.PERFORMANCE_READ_DASHBOARDS,
        SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE,
        SCOPES.SEARCH_BIRTH,
        SCOPES.SEARCH_DEATH,
        SCOPES.SEARCH_MARRIAGE,
        SCOPES.WORKQUEUE_REGISTRATION_AGENT,
        SCOPES.SEARCH_SCOPES_BIRTH,
        SCOPES.SEARCH_SCOPES_DEATH,
        SCOPES.SEARCH_SCOPES_TENNIS_CLUB,
        SCOPES.SEARCH_SCOPES_FOOTBALL_CLUB
      ],
      fieldAgent: [
        SCOPES.RECORD_DECLARE_BIRTH,
        SCOPES.RECORD_DECLARE_DEATH,
        SCOPES.RECORD_DECLARE_MARRIAGE,
        SCOPES.RECORD_SUBMIT_INCOMPLETE,
        SCOPES.RECORD_SUBMIT_FOR_REVIEW,
        SCOPES.SEARCH_BIRTH,
        SCOPES.SEARCH_DEATH,
        SCOPES.SEARCH_MARRIAGE,
        SCOPES.WORKQUEUE_FIELD_AGENT,
        SCOPES.SEARCH_SCOPES_BIRTH,
        SCOPES.SEARCH_SCOPES_DEATH,
        SCOPES.SEARCH_SCOPES_TENNIS_CLUB,
        SCOPES.SEARCH_SCOPES_FOOTBALL_CLUB
      ]
    }
  }

  return { event: eventPayloadGenerator(prng), user }
}
