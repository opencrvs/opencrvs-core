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
  eventPayloadGenerator,
  getUUID,
  SCOPES
} from '@opencrvs/commons/client'
import { FetchUserQuery, Status } from '@client/utils/gateway'
/**
 * @returns a payload generator for creating events and actions with sensible defaults.
 */
export function testDataGenerator() {
  const user = {
    token: {
      /**
       * If you update the scopes or id values below,
       * you must regenerate the JWT tokens to match the new values.
       * To do this, run the script:
       *   packages/client/src/tests/token-generator.test.ts
       * Then copy the new tokens here.
       */
      fieldAgent:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQuZGVjbGFyZS1iaXJ0aCIsInJlY29yZC5kZWNsYXJlLWRlYXRoIiwicmVjb3JkLmRlY2xhcmUtbWFycmlhZ2UiLCJyZWNvcmQuZGVjbGFyYXRpb24tc3VibWl0LWluY29tcGxldGUiLCJyZWNvcmQuZGVjbGFyYXRpb24tc3VibWl0LWZvci1yZXZpZXciLCJzZWFyY2guYmlydGgiLCJzZWFyY2guZGVhdGgiLCJzZWFyY2gubWFycmlhZ2UiLCJ3b3JrcXVldWVbaWQ9YWxsLWV2ZW50c3xhc3NpZ25lZC10by15b3V8cmVjZW50fHJlcXVpcmVzLXVwZGF0ZXN8c2VudC1mb3ItcmV2aWV3XSJdLCJpYXQiOjE0ODcwNzY3MDgsImF1ZCI6Im9wZW5jcnZzOmdhdGV3YXktdXNlciIsImlzcyI6Im9wZW5jcnZzOmF1dGgtc2VydmljZSIsInN1YiI6IjY3ZWY3ZjgzZDZhOWNiOTJlOWVkYWE5OSJ9.p8TkRnoQ_S18jPN6PEfxQApVMwAEr2wZ0cefx4XSbM7I-By47hq7Tj9Dfjdr4uGLIty33M7cKEbHXDVFp2VbtvTHqMZfzrwiXc_dbbVIDz7MYiPeEcsSrtuUGDlbazTENwHqitAKecapp8e4IEmRv-gtbX2EvtEr4F0yd5kwhZXsE44UcSYnn0uLMhKywM-FTQ4soz-bB4pe3KD-Co9b_pPWxLwyZONrRAIOkgDlqBaYncI0f9Yupw4Z8AeSitUbJ74HBAvNCoVfMsAyQx36sq7YQDWtjoLZ9JRdMaEqlfDXhzPOj3pqgbF5BsTIMhK-T0Ql5yYwHyENcMe0ujZTh7B10bW5Bsv5SZEen-Mfdv6abAr4eyqD4uGP2-3jMrpbH7N6_q8tMrU-iXuhM8WFH7utw8c9BeCl-v13G7SuAEmV3mesHVclwAlG_Z-DdP_hTFDmR4lDu2IspoSlKYzgIKBnh7dvKDk0JPjgbladshjrMoT3s32ZqJgaULGYY-yrLy1uRrIAVctfvt_uIVs7pqhs7OUb0da3pQaK7ajfdxxHykWa_QhUxmEsDGvW2PSII4vApoRQkQBMls1JjnDfX7CxRmuYoei7vOBHQodRCB5pp6qbcoV8oxiy028F64aP5ymo1OxQ0E4l76IMizYWXdYgYDB95PrMnhrV_sms9g0',
      registrationAgent:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQucmVhZCIsInJlY29yZC5kZWNsYXJlLWJpcnRoIiwicmVjb3JkLmRlY2xhcmUtZGVhdGgiLCJyZWNvcmQuZGVjbGFyZS1tYXJyaWFnZSIsInJlY29yZC5kZWNsYXJhdGlvbi1lZGl0IiwicmVjb3JkLmRlY2xhcmF0aW9uLXN1Ym1pdC1mb3ItYXBwcm92YWwiLCJyZWNvcmQuZGVjbGFyYXRpb24tc3VibWl0LWZvci11cGRhdGVzIiwicmVjb3JkLmRlY2xhcmF0aW9uLWFyY2hpdmUiLCJyZWNvcmQuZGVjbGFyYXRpb24tcmVpbnN0YXRlIiwicmVjb3JkLnJlZ2lzdHJhdGlvbi1yZXF1ZXN0LWNvcnJlY3Rpb24iLCJyZWNvcmQuZGVjbGFyYXRpb24tcHJpbnQtc3VwcG9ydGluZy1kb2N1bWVudHMiLCJyZWNvcmQuZXhwb3J0LXJlY29yZHMiLCJyZWNvcmQucmVnaXN0cmF0aW9uLXByaW50Jmlzc3VlLWNlcnRpZmllZC1jb3BpZXMiLCJwZXJmb3JtYW5jZS5yZWFkIiwicGVyZm9ybWFuY2UucmVhZC1kYXNoYm9hcmRzIiwib3JnYW5pc2F0aW9uLnJlYWQtbG9jYXRpb25zOm15LW9mZmljZSIsInNlYXJjaC5iaXJ0aCIsInNlYXJjaC5kZWF0aCIsInNlYXJjaC5tYXJyaWFnZSIsIndvcmtxdWV1ZVtpZD1hbGwtZXZlbnRzfGFzc2lnbmVkLXRvLXlvdXxyZWNlbnR8cmVxdWlyZXMtY29tcGxldGlvbnxyZXF1aXJlcy11cGRhdGVzfGluLXJldmlld3xzZW50LWZvci1hcHByb3ZhbHxpbi1leHRlcm5hbC12YWxpZGF0aW9ufHJlYWR5LXRvLXByaW50fHJlYWR5LXRvLWlzc3VlXSJdLCJpYXQiOjE0ODcwNzY3MDgsImF1ZCI6Im9wZW5jcnZzOmdhdGV3YXktdXNlciIsImlzcyI6Im9wZW5jcnZzOmF1dGgtc2VydmljZSIsInN1YiI6IjY3ZWY3ZjgzZDZhOWNiOTJlOWVkYWFhMSJ9.GLD80jrGC9NXzQoi74rmDs6b_ObNYml95wuTdPxsggP6jIOXiCEQaffJ_sRguxK0ZW1LpoEtmA_S379RDp1ldz01o7U6cwGmcAuZPcTT9stgsDh6f-qz9bqll_t4r8J3C2VDJI6YI6TGZrEIGfrjbayeWU9w0NUk_7o_R346EJjcAmoWxHBb3wRC4wgG03n5C9Tbi07y3VEFM3LGIWIP6_tpbpPo3UF0Ma1ICP44aeXLdyPYuhY_itSylWAG8gcLBhsZVzmeeQW7wd8S9X32v0_yjmA3dp1OL0dH_hIEJMA6LfYo7dcvXfMKR4oc2OpX1ktp7mh7oxtimesa1Jo79IOYpy8SIn7nz_PRzJtbZOL2oQxjpnM1VXJM2TPgBLgBMf5PtA8bVgfjjZW38vdfSRgqUltUFewZEmajMQ73geAnJf4Ll5eS29815X4kUDpfX4EKMCMp6V-1vWsPzrx8zdSciy5up5gfmXM549AGR6fXbsxCATjfYXc-Zqcw1kFUy0fVD03dQTxmp6UEdnMQjpxDLjc2HsbVxvgpAmJizNfUBPHM0uvu4tLu-gG1BCRjk8bzBUANF1SPPIrfaERlFREEDHUeTFIwVCfoGhTK0kj037FVg1q810knmV1QqWBQKczljtFJ7fDklnlUSAluBRyml5BNvUQXhx5IT28aL5I',
      localRegistrar:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQucmVhZCIsInJlY29yZC5kZWNsYXJlLWJpcnRoIiwicmVjb3JkLmRlY2xhcmUtZGVhdGgiLCJyZWNvcmQuZGVjbGFyZS1tYXJyaWFnZSIsInJlY29yZC5kZWNsYXJhdGlvbi1lZGl0IiwicmVjb3JkLmRlY2xhcmF0aW9uLXN1Ym1pdC1mb3ItdXBkYXRlcyIsInJlY29yZC5yZXZpZXctZHVwbGljYXRlcyIsInJlY29yZC5kZWNsYXJhdGlvbi1hcmNoaXZlIiwicmVjb3JkLmRlY2xhcmF0aW9uLXJlaW5zdGF0ZSIsInJlY29yZC5yZWdpc3RlciIsInJlY29yZC5yZWdpc3RyYXRpb24tY29ycmVjdCIsInJlY29yZC5kZWNsYXJhdGlvbi1wcmludC1zdXBwb3J0aW5nLWRvY3VtZW50cyIsInJlY29yZC5leHBvcnQtcmVjb3JkcyIsInJlY29yZC51bmFzc2lnbi1vdGhlcnMiLCJyZWNvcmQucmVnaXN0cmF0aW9uLXByaW50Jmlzc3VlLWNlcnRpZmllZC1jb3BpZXMiLCJyZWNvcmQuY29uZmlybS1yZWdpc3RyYXRpb24iLCJyZWNvcmQucmVqZWN0LXJlZ2lzdHJhdGlvbiIsInBlcmZvcm1hbmNlLnJlYWQiLCJwZXJmb3JtYW5jZS5yZWFkLWRhc2hib2FyZHMiLCJwcm9maWxlLmVsZWN0cm9uaWMtc2lnbmF0dXJlIiwib3JnYW5pc2F0aW9uLnJlYWQtbG9jYXRpb25zOm15LW9mZmljZSIsInNlYXJjaC5iaXJ0aCIsInNlYXJjaC5kZWF0aCIsInNlYXJjaC5tYXJyaWFnZSIsIndvcmtxdWV1ZVtpZD1hbGwtZXZlbnRzfGFzc2lnbmVkLXRvLXlvdXxyZWNlbnR8cmVxdWlyZXMtY29tcGxldGlvbnxyZXF1aXJlcy11cGRhdGVzfGluLXJldmlldy1hbGx8aW4tZXh0ZXJuYWwtdmFsaWRhdGlvbnxyZWFkeS10by1wcmludHxyZWFkeS10by1pc3N1ZV0iXSwiaWF0IjoxNDg3MDc2NzA4LCJhdWQiOiJvcGVuY3J2czpnYXRld2F5LXVzZXIiLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI2ODIxYzE3NWRjZTRkNzg4NmQ0ZTgyMTAifQ.OUhGrFf9qQeMk2UZyXsMpmlCNfqYET4bFGtEzIcRFIlMBnR3vsURWVdhpPe-LlYCATFejcB7n0ET0pXeWwiQkVvhiBvvNKUeYrwLHAofkbDpuTPF-dboieBbk-8UjYBf7BWeGEacfN53QyhpL_B3PSqakj_0SfI6gFnoFBQBqQ4VyNPf8By54ipgzurlMZ0xgJ-UKdEx-69hp5VzK6OJbWWK1Pe0teqYLbAva-OYaTTRZirc9WZecBTQ5tpW9ett0jQf1-LBwct9pUTx05aa_n3AjymC-9hWvTsvvD4bAjKDe-uzz6k0Kp7ZRfkOKrMxNoiIRC-MSSMrdsYC6ZrJpGrfvZHhZyh5cTNYBf1w995quT6aHfmWPkYKa7kguB6e2tOW6U9d7gaLl9LhGa7jshie0p8AEvwoUtRQIgPPCVJbfBHyUW5A0rqXhW6BN7DZVy1sgeT-nU0cR3pQenyLw5wWcVZjTU7PsI78RGqK0Ykr0T8-NIltvQ7Yab03DjakcaBQ_NizXU_FRa8AqmkRkKmN7F-UySYgYZ_0HV6SfcO-xZXqNAkY316PZBAhlmeyLV4OEmypmG4VC98dHfibKMEz79dBXcXT75xq8J-rplZcZa1RO8OfsedPp-AkCoy98MicPMkCOSdbPCa-vWxQ2BCcr8LpY8wz1jgEU-qHIoQ'
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
        'workqueue[id=all-events|assigned-to-you|recent|requires-completion|requires-updates|in-review-all|in-external-validation|ready-to-print|ready-to-issue]'
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
        'workqueue[id=all-events|assigned-to-you|recent|requires-completion|requires-updates|in-review|sent-for-approval|in-external-validation|ready-to-print|ready-to-issue]'
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
        'workqueue[id=all-events|assigned-to-you|recent|requires-updates|sent-for-review]'
      ]
    }
  }

  return { event: eventPayloadGenerator, user }
}
