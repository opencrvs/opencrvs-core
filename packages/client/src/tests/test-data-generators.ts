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
  SCOPES
} from '@opencrvs/commons/client'
import { FetchUserQuery, Status } from '@client/utils/gateway'

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
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQuZGVjbGFyYXRpb24tc3VibWl0LWZvci1yZXZpZXciLCJzZWFyY2guYmlydGgiLCJzZWFyY2guZGVhdGgiLCJzZWFyY2gubWFycmlhZ2UiLCJ3b3JrcXVldWVbaWQ9YWxsLWV2ZW50c3xhc3NpZ25lZC10by15b3V8cmVjZW50fHJlcXVpcmVzLXVwZGF0ZXN8c2VudC1mb3ItcmV2aWV3XSIsInNlYXJjaFtldmVudD1iaXJ0aCxhY2Nlc3M9YWxsXSIsInNlYXJjaFtldmVudD1kZWF0aCxhY2Nlc3M9YWxsXSIsInNlYXJjaFtldmVudD10ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwLGFjY2Vzcz1hbGxdIiwic2VhcmNoW2V2ZW50PUZPT1RCQUxMX0NMVUJfTUVNQkVSU0hJUCxhY2Nlc3M9YWxsXSIsInJlY29yZC5jcmVhdGVbZXZlbnQ9YmlydGh8ZGVhdGh8dGVubmlzLWNsdWItbWVtYmVyc2hpcF0iLCJyZWNvcmQucmVhZFtldmVudD1iaXJ0aHxkZWF0aHx0ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwXSIsInJlY29yZC5kZWNsYXJlW2V2ZW50PWJpcnRofGRlYXRofHRlbm5pcy1jbHViLW1lbWJlcnNoaXBdIiwicmVjb3JkLm5vdGlmeVtldmVudD1iaXJ0aHxkZWF0aHx0ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwXSJdLCJpYXQiOjE0ODcwNzY3MDgsImF1ZCI6Im9wZW5jcnZzOmdhdGV3YXktdXNlciIsImlzcyI6Im9wZW5jcnZzOmF1dGgtc2VydmljZSIsInN1YiI6IjY3ZWY3ZjgzZDZhOWNiOTJlOWVkYWE5OSJ9.BJJbdLdJKrGrcdelz7ldo1apIBmbIfkvfLXDeIaye3AnPBFIHwpWNCpa_2ZuJb8NfALmJfor2zkurvj-BmHmuYGjKmdcF8EX-TzF37CrnxfGxae5CDGVJ_u5F3onwHWZfjFMPGel1YSn0nD6PeRej1gps0_Viqqn0rU4YGfCjvsQWMTpIjJU3TH4X9XENJQeBmoDwlVOBanAKLJp1GEPLmVv68r5zHGGe4vc9Hezfj1gEhD1CKt2UtenNY8f5jPQLpryv5mt6KNIw181hn08GE2Wv1xyOaza-MIDyQfHKwzSoz7u3xHQD-EvnbuvOh_SNbUPrk3CZKWtB-btPUgfNfiQqgyBhF7iOiDkT7Q_EYqiuUrCyelKT5z2iq1XrIpke5EBp9i37IhNaxBWLoJ0UbESa26NushnRQXd3fflBvjL-fTjXJQsOSMEJh85kBqlnAEPnNJunPAeFYj4uFtglGeB6g76tpLVhmPNRIzSQDH82kTePpJS9Q2wEXRCVD1_t1ReTIDg0Aa4cq7Ajs1x38HTCom4FPOSbsK3DT2gEFFATfPK7uiLSSLXO19oENOiPg66QVsm3sAXur5VeLV4XLMRXFd6NMqen8b7J7DusFFfAWyJdU2IWGnZs4d_9XsafP8b3yFcWiPIODIq-CU_vQBF9gcjkmwVWGYM1AO3lVY',
      localRegistrar:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQuZGVjbGFyYXRpb24tZWRpdCIsInJlY29yZC5yZXZpZXctZHVwbGljYXRlcyIsInJlY29yZC5kZWNsYXJhdGlvbi1yZWluc3RhdGUiLCJyZWNvcmQuZGVjbGFyYXRpb24tcHJpbnQtc3VwcG9ydGluZy1kb2N1bWVudHMiLCJyZWNvcmQuZXhwb3J0LXJlY29yZHMiLCJyZWNvcmQuY29uZmlybS1yZWdpc3RyYXRpb24iLCJyZWNvcmQucmVqZWN0LXJlZ2lzdHJhdGlvbiIsInBlcmZvcm1hbmNlLnJlYWQiLCJwZXJmb3JtYW5jZS5yZWFkLWRhc2hib2FyZHMiLCJwcm9maWxlLmVsZWN0cm9uaWMtc2lnbmF0dXJlIiwib3JnYW5pc2F0aW9uLnJlYWQtbG9jYXRpb25zOm15LW9mZmljZSIsInNlYXJjaC5iaXJ0aCIsInNlYXJjaC5kZWF0aCIsInNlYXJjaC5tYXJyaWFnZSIsIndvcmtxdWV1ZVtpZD1hbGwtZXZlbnRzfGFzc2lnbmVkLXRvLXlvdXxyZWNlbnR8cmVxdWlyZXMtY29tcGxldGlvbnxyZXF1aXJlcy11cGRhdGVzfGluLXJldmlldy1hbGx8aW4tZXh0ZXJuYWwtdmFsaWRhdGlvbnxyZWFkeS10by1wcmludHxyZWFkeS10by1pc3N1ZV0iLCJzZWFyY2hbZXZlbnQ9YmlydGgsYWNjZXNzPWFsbF0iLCJzZWFyY2hbZXZlbnQ9ZGVhdGgsYWNjZXNzPWFsbF0iLCJzZWFyY2hbZXZlbnQ9dGVubmlzLWNsdWItbWVtYmVyc2hpcCxhY2Nlc3M9YWxsXSIsInNlYXJjaFtldmVudD1GT09UQkFMTF9DTFVCX01FTUJFUlNISVAsYWNjZXNzPWFsbF0iLCJ1c2VyLnJlYWQ6b25seS1teS1hdWRpdCIsInJlY29yZC5jcmVhdGVbZXZlbnQ9YmlydGh8ZGVhdGh8dGVubmlzLWNsdWItbWVtYmVyc2hpcF0iLCJyZWNvcmQucmVhZFtldmVudD1iaXJ0aHxkZWF0aHx0ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwXSIsInJlY29yZC5kZWNsYXJlW2V2ZW50PWJpcnRofGRlYXRofHRlbm5pcy1jbHViLW1lbWJlcnNoaXBdIiwicmVjb3JkLmRlY2xhcmVkLnJlamVjdFtldmVudD1iaXJ0aHxkZWF0aHx0ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwXSIsInJlY29yZC5kZWNsYXJlZC5hcmNoaXZlW2V2ZW50PWJpcnRofGRlYXRofHRlbm5pcy1jbHViLW1lbWJlcnNoaXBdIiwicmVjb3JkLnJlZ2lzdGVyW2V2ZW50PWJpcnRofGRlYXRofHRlbm5pcy1jbHViLW1lbWJlcnNoaXBdIiwicmVjb3JkLnJlZ2lzdGVyZWQucHJpbnQtY2VydGlmaWVkLWNvcGllc1tldmVudD1iaXJ0aHxkZWF0aHx0ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwXSIsInJlY29yZC5yZWdpc3RlcmVkLmNvcnJlY3RbZXZlbnQ9YmlydGh8ZGVhdGh8dGVubmlzLWNsdWItbWVtYmVyc2hpcF0iLCJyZWNvcmQudW5hc3NpZ24tb3RoZXJzW2V2ZW50PWJpcnRofGRlYXRofHRlbm5pcy1jbHViLW1lbWJlcnNoaXBdIiwicmVjb3JkLmRlY2xhcmVkLnJldmlldy1kdXBsaWNhdGVzW2V2ZW50PWJpcnRofGRlYXRofHRlbm5pcy1jbHViLW1lbWJlcnNoaXBdIl0sImlhdCI6MTQ4NzA3NjcwOCwiYXVkIjoib3BlbmNydnM6Z2F0ZXdheS11c2VyIiwiaXNzIjoib3BlbmNydnM6YXV0aC1zZXJ2aWNlIiwic3ViIjoiNjgyMWMxNzVkY2U0ZDc4ODZkNGU4MjEwIn0.igK57dzDL0eY2caNuhrFXs7QSDtXitXIl0aMIkT7hCNAuGoxZogluB9-Ejy1-McNKFM9wRHsIWaUTmmZ09kgptTUEIB30Yc-NICAhlT5XcX9Droj5wkb_Ogx_hVtF6FCqfPklBuJA7oYeZ5IRAqI3iXVUoKxOeE9tqxwBayJhVlMm8wKJVWw3m6zCJcasCRYpRJwp2tm5DI9l_TCkPBUZw4sYNSthdDHqFA77Qp0M5EyNqqntEmdFfU8luDGYm3rmN_liGrd_yFipn8cEIGC4_zSJ5ea0ce5PHUF8QRm22iJqOOQTmlrC19UU55OMkVRxWIpckFCPDMwdainsIMFcx7RzzepLs3wPeeY30OT01hx_Qlk2RQL0veeKTnIl55kED-eEsnwFpXatUY2WDlZrywZDYrTqjntM2_DuAdMs2iG4Y2fDFmiI5NWyjN2XGHBr8Opc7jEwH9zcf52rI3Q3muVBLsE09swziHfi9O1V4Phy4qn68mZz1c6awtHknj87zKEp0ZTrzj6kNa8gcTPCgh9IwG5WpeT06GEs7RQFvFQI4oGnaHDGruaaKHnqJa8V7LJbq4ydMtKAeJYQs66XAo-rSZxDwCLUKcf6wV61tfpu3d4TKKpqRf1YPdcFFoeIuPiNpQzGL2mQPzCENhYniWfPZ_mxcQzZ2tqrMIv_b0',
      registrationAgent:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQuZGVjbGFyYXRpb24tZWRpdCIsInJlY29yZC5kZWNsYXJhdGlvbi1yZWluc3RhdGUiLCJyZWNvcmQuZGVjbGFyYXRpb24tcHJpbnQtc3VwcG9ydGluZy1kb2N1bWVudHMiLCJyZWNvcmQuZXhwb3J0LXJlY29yZHMiLCJwZXJmb3JtYW5jZS5yZWFkIiwicGVyZm9ybWFuY2UucmVhZC1kYXNoYm9hcmRzIiwib3JnYW5pc2F0aW9uLnJlYWQtbG9jYXRpb25zOm15LW9mZmljZSIsInVzZXIucmVhZDpvbmx5LW15LWF1ZGl0Iiwic2VhcmNoLmJpcnRoIiwic2VhcmNoLmRlYXRoIiwic2VhcmNoLm1hcnJpYWdlIiwid29ya3F1ZXVlW2lkPWFsbC1ldmVudHN8YXNzaWduZWQtdG8teW91fHJlY2VudHxyZXF1aXJlcy1jb21wbGV0aW9ufHJlcXVpcmVzLXVwZGF0ZXN8aW4tcmV2aWV3fHNlbnQtZm9yLWFwcHJvdmFsfGluLWV4dGVybmFsLXZhbGlkYXRpb258cmVhZHktdG8tcHJpbnR8cmVhZHktdG8taXNzdWVdIiwic2VhcmNoW2V2ZW50PWJpcnRoLGFjY2Vzcz1hbGxdIiwic2VhcmNoW2V2ZW50PWRlYXRoLGFjY2Vzcz1hbGxdIiwic2VhcmNoW2V2ZW50PXRlbm5pcy1jbHViLW1lbWJlcnNoaXAsYWNjZXNzPWFsbF0iLCJzZWFyY2hbZXZlbnQ9Rk9PVEJBTExfQ0xVQl9NRU1CRVJTSElQLGFjY2Vzcz1hbGxdIiwicmVjb3JkLmNyZWF0ZVtldmVudD1iaXJ0aHxkZWF0aHx0ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwXSIsInJlY29yZC5yZWFkW2V2ZW50PWJpcnRofGRlYXRofHRlbm5pcy1jbHViLW1lbWJlcnNoaXBdIiwicmVjb3JkLmRlY2xhcmVbZXZlbnQ9YmlydGh8ZGVhdGh8dGVubmlzLWNsdWItbWVtYmVyc2hpcF0iLCJyZWNvcmQuZGVjbGFyZWQudmFsaWRhdGVbZXZlbnQ9YmlydGh8ZGVhdGh8dGVubmlzLWNsdWItbWVtYmVyc2hpcF0iLCJyZWNvcmQuZGVjbGFyZWQucmVqZWN0W2V2ZW50PWJpcnRofGRlYXRofHRlbm5pcy1jbHViLW1lbWJlcnNoaXBdIiwicmVjb3JkLmRlY2xhcmVkLmFyY2hpdmVbZXZlbnQ9YmlydGh8ZGVhdGh8dGVubmlzLWNsdWItbWVtYmVyc2hpcF0iLCJyZWNvcmQucmVnaXN0ZXJlZC5wcmludC1jZXJ0aWZpZWQtY29waWVzW2V2ZW50PWJpcnRofGRlYXRofHRlbm5pcy1jbHViLW1lbWJlcnNoaXBdIiwicmVjb3JkLnJlZ2lzdGVyZWQucmVxdWVzdC1jb3JyZWN0aW9uW2V2ZW50PWJpcnRofGRlYXRofHRlbm5pcy1jbHViLW1lbWJlcnNoaXBdIl0sImlhdCI6MTQ4NzA3NjcwOCwiYXVkIjoib3BlbmNydnM6Z2F0ZXdheS11c2VyIiwiaXNzIjoib3BlbmNydnM6YXV0aC1zZXJ2aWNlIiwic3ViIjoiNjdlZjdmODNkNmE5Y2I5MmU5ZWRhYWExIn0.r3z1VPBaRTKucP_UE8wX1GJyNbtkK-PLSevq5Y3OwTOsSgBm_iw4mjjgTw1GsC9MnguekmsKjuVOEcky7U6x09VVPBP4xBVA-JWoXwxeUtn5lwyBq8ONkNmedaNKsYg9fTJFkBLovybjSOO3Www7kXCmrVtdPbkcTw10GXYvxmWCalxvwBMkYEwNFCqgfL8LUw59gf6KtG1-SsbRL0gjUJItaZoRHK6UpF3U7pQjeGYwOIMzfdfpcTMjd69VuU9iMjMiJx9nKFo2U8z6QyJf-hx67p7eiDMtPwpKJqTHFDvN6AVWqs2TeDKsO3Mz8vorIuiu5mmj7KVbAPvzv8pgx42sOfpzTE6IQV56Z9pio7ri3q-Fw6wWcCEM0WVRzDWWy_qRQA5ODHj-Athii7u3tV8giuF-B8zT0ghVaBW0YsB9dsolXwvRxpkwkNNbzNX_zriwycG1OnAqcOkhlt_p7AGMZSEcSZJHpPZgVExx9jABRgUEvUmZQ1Sb-ucpfpStynk4tRPbTr1gqVhRMT2J0zl1CxCBi_mCafjxgXeaGOXV5X2PMR69zH75B8J7DeonvddbrdZM-3qut7zwwcahhRiBqSAeV2cQdsYxtI70BUeuResW5L2Bi4TWHl9_joiLDRkfZ173onXJCGbZArnT1VUGKTOOwbUIqwY-J0zyDtU'
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
          id: 'SOCIAL_WORKER',
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
          id: 'REGISTRATION_AGENT',
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
          id: 'LOCAL_REGISTRAR',
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
        SCOPES.RECORD_DECLARATION_EDIT,
        SCOPES.RECORD_REVIEW_DUPLICATES,
        SCOPES.RECORD_DECLARATION_REINSTATE,
        SCOPES.RECORD_PRINT_RECORDS_SUPPORTING_DOCUMENTS,
        SCOPES.RECORD_EXPORT_RECORDS,
        SCOPES.RECORD_CONFIRM_REGISTRATION,
        SCOPES.RECORD_REJECT_REGISTRATION,
        SCOPES.PERFORMANCE_READ,
        SCOPES.PERFORMANCE_READ_DASHBOARDS,
        SCOPES.PROFILE_ELECTRONIC_SIGNATURE,
        SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE,
        SCOPES.SEARCH_BIRTH,
        SCOPES.SEARCH_DEATH,
        SCOPES.SEARCH_MARRIAGE,
        'workqueue[id=all-events|assigned-to-you|recent|requires-completion|requires-updates|in-review-all|in-external-validation|ready-to-print|ready-to-issue]',
        'search[event=birth,access=all]',
        'search[event=death,access=all]',
        'search[event=tennis-club-membership,access=all]',
        'search[event=FOOTBALL_CLUB_MEMBERSHIP,access=all]',
        SCOPES.USER_READ_ONLY_MY_AUDIT,
        'record.create[event=birth|death|tennis-club-membership]',
        'record.read[event=birth|death|tennis-club-membership]',
        'record.declare[event=birth|death|tennis-club-membership]',
        'record.declared.reject[event=birth|death|tennis-club-membership]',
        'record.declared.archive[event=birth|death|tennis-club-membership]',
        'record.register[event=birth|death|tennis-club-membership]',
        'record.registered.print-certified-copies[event=birth|death|tennis-club-membership]',
        'record.registered.correct[event=birth|death|tennis-club-membership]',
        'record.unassign-others[event=birth|death|tennis-club-membership]',
        'record.declared.review-duplicates[event=birth|death|tennis-club-membership]'
      ],
      registrationAgent: [
        SCOPES.RECORD_DECLARATION_EDIT,
        SCOPES.RECORD_DECLARATION_REINSTATE,
        SCOPES.RECORD_PRINT_RECORDS_SUPPORTING_DOCUMENTS,
        SCOPES.RECORD_EXPORT_RECORDS,
        SCOPES.PERFORMANCE_READ,
        SCOPES.PERFORMANCE_READ_DASHBOARDS,
        SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE,
        SCOPES.USER_READ_ONLY_MY_AUDIT,
        SCOPES.SEARCH_BIRTH,
        SCOPES.SEARCH_DEATH,
        SCOPES.SEARCH_MARRIAGE,
        'workqueue[id=all-events|assigned-to-you|recent|requires-completion|requires-updates|in-review|sent-for-approval|in-external-validation|ready-to-print|ready-to-issue]',
        'search[event=birth,access=all]',
        'search[event=death,access=all]',
        'search[event=tennis-club-membership,access=all]',
        'search[event=FOOTBALL_CLUB_MEMBERSHIP,access=all]',
        'record.create[event=birth|death|tennis-club-membership]',
        'record.read[event=birth|death|tennis-club-membership]',
        'record.declare[event=birth|death|tennis-club-membership]',
        'record.declared.validate[event=birth|death|tennis-club-membership]',
        'record.declared.reject[event=birth|death|tennis-club-membership]',
        'record.declared.archive[event=birth|death|tennis-club-membership]',
        'record.registered.print-certified-copies[event=birth|death|tennis-club-membership]',
        'record.registered.request-correction[event=birth|death|tennis-club-membership]'
      ],
      fieldAgent: [
        SCOPES.RECORD_SUBMIT_FOR_REVIEW,
        SCOPES.SEARCH_BIRTH,
        SCOPES.SEARCH_DEATH,
        SCOPES.SEARCH_MARRIAGE,
        'workqueue[id=all-events|assigned-to-you|recent|requires-updates|sent-for-review]',
        'search[event=birth,access=all]',
        'search[event=death,access=all]',
        'search[event=tennis-club-membership,access=all]',
        'search[event=FOOTBALL_CLUB_MEMBERSHIP,access=all]',
        'record.create[event=birth|death|tennis-club-membership]',
        'record.read[event=birth|death|tennis-club-membership]',
        'record.declare[event=birth|death|tennis-club-membership]',
        'record.notify[event=birth|death|tennis-club-membership]'
      ]
    }
  }

  return { event: eventPayloadGenerator(prng), user }
}
