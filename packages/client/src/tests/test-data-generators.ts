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
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQuZGVjbGFyYXRpb24tc3VibWl0LWZvci1yZXZpZXciLCJzZWFyY2guYmlydGgiLCJzZWFyY2guZGVhdGgiLCJzZWFyY2gubWFycmlhZ2UiLCJ3b3JrcXVldWVbaWQ9YWxsLWV2ZW50c3xhc3NpZ25lZC10by15b3V8cmVjZW50fHJlcXVpcmVzLXVwZGF0ZXN8c2VudC1mb3ItcmV2aWV3XSIsInNlYXJjaFtldmVudD12Mi5iaXJ0aCxhY2Nlc3M9YWxsXSIsInNlYXJjaFtldmVudD12Mi5kZWF0aCxhY2Nlc3M9YWxsXSIsInNlYXJjaFtldmVudD10ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwLGFjY2Vzcz1hbGxdIiwic2VhcmNoW2V2ZW50PUZPT1RCQUxMX0NMVUJfTUVNQkVSU0hJUCxhY2Nlc3M9YWxsXSIsInJlY29yZC5kZWNsYXJlW2V2ZW50PXYyLmJpcnRofHYyLmRlYXRofHRlbm5pcy1jbHViLW1lbWJlcnNoaXBdIiwicmVjb3JkLm5vdGlmeVtldmVudD12Mi5iaXJ0aHx2Mi5kZWF0aHx0ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwXSJdLCJpYXQiOjE0ODcwNzY3MDgsImF1ZCI6Im9wZW5jcnZzOmdhdGV3YXktdXNlciIsImlzcyI6Im9wZW5jcnZzOmF1dGgtc2VydmljZSIsInN1YiI6IjY3ZWY3ZjgzZDZhOWNiOTJlOWVkYWE5OSJ9.U9fiIVzdQRsRp8AvjaOU22Sc_BTF4bbJ5-z38Pe1u50vJfo6SDb1n_AyE0LA4037An5-qmPPWVxgtkf4wkA-i0sRr2Yr0Mppf_7XlYpCciHpHclqgKJa9KxFT1HKEYjCMjR3tGpXOPQlTXU9NdHrcSFOce0W1jLtzFeMLroVgEGDSGegh2MXUbP91sOdIN5atZecToZTS2xIpcXz_7yEdlzz4R_2KccFygj1VaNbYE0Zr4QxzQT8WP52E06x_ZVp0VCb3Vf1o6cPQdHQJJiXVxpa5sAddLgRC-jdDNykWugmo3neC4WqGFB642smCQGJCdRsxCtD7Edjk3NZgGzF2OQb-UcYy8ajwxSeVz1EwE_lbajyHznhh6n8xwDMumSI4vXL06lLRdQbjkkGwBo9DOy5tP8uM5C82Na9EPKAc7hl6NZienSgCMl_3pdT6T-tBaYD7jmdlWC50WH4HgUpE7n188GLug9m2bMd6-nlNIpfLW9atada5_xtP3uJA3AaYnk47Dzpfn6fPJkPDvL91rBCbBz-8gU1Idlba4MIlgDzvWOW9ww3lG-TSKcRIu8ga918AxJcSURfm-Eorug76MJG9IZz7-A0lDvWvIdWTJgHpVz7Cf8uJ5ld5tK2fESAbUN1ghJuRCCMqqJuh6F6vwtjWdzCDSvOJLrjea2lJNY',
      localRegistrar:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQucmVhZCIsInJlY29yZC5kZWNsYXJhdGlvbi1lZGl0IiwicmVjb3JkLnJldmlldy1kdXBsaWNhdGVzIiwicmVjb3JkLmRlY2xhcmF0aW9uLXJlaW5zdGF0ZSIsInJlY29yZC5kZWNsYXJhdGlvbi1wcmludC1zdXBwb3J0aW5nLWRvY3VtZW50cyIsInJlY29yZC5leHBvcnQtcmVjb3JkcyIsInJlY29yZC51bmFzc2lnbi1vdGhlcnMiLCJyZWNvcmQuY29uZmlybS1yZWdpc3RyYXRpb24iLCJyZWNvcmQucmVqZWN0LXJlZ2lzdHJhdGlvbiIsInBlcmZvcm1hbmNlLnJlYWQiLCJwZXJmb3JtYW5jZS5yZWFkLWRhc2hib2FyZHMiLCJwcm9maWxlLmVsZWN0cm9uaWMtc2lnbmF0dXJlIiwib3JnYW5pc2F0aW9uLnJlYWQtbG9jYXRpb25zOm15LW9mZmljZSIsInNlYXJjaC5iaXJ0aCIsInNlYXJjaC5kZWF0aCIsInNlYXJjaC5tYXJyaWFnZSIsIndvcmtxdWV1ZVtpZD1hbGwtZXZlbnRzfGFzc2lnbmVkLXRvLXlvdXxyZWNlbnR8cmVxdWlyZXMtY29tcGxldGlvbnxyZXF1aXJlcy11cGRhdGVzfGluLXJldmlldy1hbGx8aW4tZXh0ZXJuYWwtdmFsaWRhdGlvbnxyZWFkeS10by1wcmludHxyZWFkeS10by1pc3N1ZV0iLCJzZWFyY2hbZXZlbnQ9djIuYmlydGgsYWNjZXNzPWFsbF0iLCJzZWFyY2hbZXZlbnQ9djIuZGVhdGgsYWNjZXNzPWFsbF0iLCJzZWFyY2hbZXZlbnQ9dGVubmlzLWNsdWItbWVtYmVyc2hpcCxhY2Nlc3M9YWxsXSIsInNlYXJjaFtldmVudD1GT09UQkFMTF9DTFVCX01FTUJFUlNISVAsYWNjZXNzPWFsbF0iLCJ1c2VyLnJlYWQ6b25seS1teS1hdWRpdCIsInJlY29yZC5kZWNsYXJlW2V2ZW50PXYyLmJpcnRofHYyLmRlYXRofHRlbm5pcy1jbHViLW1lbWJlcnNoaXBdIiwicmVjb3JkLmRlY2xhcmVkLnJlamVjdFtldmVudD12Mi5iaXJ0aHx2Mi5kZWF0aHx0ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwXSIsInJlY29yZC5kZWNsYXJlZC5hcmNoaXZlW2V2ZW50PXYyLmJpcnRofHYyLmRlYXRofHRlbm5pcy1jbHViLW1lbWJlcnNoaXBdIiwicmVjb3JkLnJlZ2lzdGVyW2V2ZW50PXYyLmJpcnRofHYyLmRlYXRofHRlbm5pcy1jbHViLW1lbWJlcnNoaXBdIiwicmVjb3JkLnJlZ2lzdGVyZWQucHJpbnQtY2VydGlmaWVkLWNvcGllc1tldmVudD12Mi5iaXJ0aHx2Mi5kZWF0aHx0ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwXSIsInJlY29yZC5yZWdpc3RlcmVkLmNvcnJlY3RbZXZlbnQ9djIuYmlydGh8djIuZGVhdGh8dGVubmlzLWNsdWItbWVtYmVyc2hpcF0iXSwiaWF0IjoxNDg3MDc2NzA4LCJhdWQiOiJvcGVuY3J2czpnYXRld2F5LXVzZXIiLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI2ODIxYzE3NWRjZTRkNzg4NmQ0ZTgyMTAifQ.RxWDbUiTy4bJ1EifSkVT36mmIIKb2WuiXPhOhlBlLHN-ciBZYAaVgyx4s5ACq-EIKMIGkJLS0RlkqqkyVZGS4byT_hFCO56vkFxx24oi6A9SVsf3iUsLs3NEkRwW5PNlf79bk0gucpOvshSUcc6ixnIVixAvWBD6WH2PtnrCCdUMGugT-KMHqh-V2r2u31JhlPdLwfTugkc-oDnUMskSZYrCq0VGUSdv2qdgjtpUW4oS1czT4AJkf1kyQVoSSFNY_oZsnpSNWmj5HUaFcthchu7yDqzTpwFbquU_v8WOSRZlKyYdukywoLs0aPffkY-A-dZPr6f14weRoxK8QfZ_bRCAGhwG-WBo4ZbxADep1nMTu8-r-iDbhbrHnxeXqyMxH_vCBEAuD60nzF6rklbfKJDiJ-PgVuT6XYNmPu02wDeBP2B-hBv-UbWRRfa0nGCyPG6Ci8LFApYmK_8dhGld_tL_lgfN2nCe1QM4LiLGMi18A_OrGBYrr4Jhq--tWFdwv470nlrm8pSvn2hwd6GrubyCw38QLj8ElxXbX0k3uhks3WP0wRdU3Cgc652olPdEG-Xn7scaAOYpx1zhbIkzmrO7jPueHrLBL1MkTqb3SQzoBuQl5xCNgH-vDar5llVXKC54SOa6Jo0Rf3wPY6nV00tmUkSpe10w-NDZLSiiCZ8',
      registrationAgent:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQucmVhZCIsInJlY29yZC5kZWNsYXJhdGlvbi1lZGl0IiwicmVjb3JkLmRlY2xhcmF0aW9uLXJlaW5zdGF0ZSIsInJlY29yZC5kZWNsYXJhdGlvbi1wcmludC1zdXBwb3J0aW5nLWRvY3VtZW50cyIsInJlY29yZC5leHBvcnQtcmVjb3JkcyIsInBlcmZvcm1hbmNlLnJlYWQiLCJwZXJmb3JtYW5jZS5yZWFkLWRhc2hib2FyZHMiLCJvcmdhbmlzYXRpb24ucmVhZC1sb2NhdGlvbnM6bXktb2ZmaWNlIiwidXNlci5yZWFkOm9ubHktbXktYXVkaXQiLCJzZWFyY2guYmlydGgiLCJzZWFyY2guZGVhdGgiLCJzZWFyY2gubWFycmlhZ2UiLCJ3b3JrcXVldWVbaWQ9YWxsLWV2ZW50c3xhc3NpZ25lZC10by15b3V8cmVjZW50fHJlcXVpcmVzLWNvbXBsZXRpb258cmVxdWlyZXMtdXBkYXRlc3xpbi1yZXZpZXd8c2VudC1mb3ItYXBwcm92YWx8aW4tZXh0ZXJuYWwtdmFsaWRhdGlvbnxyZWFkeS10by1wcmludHxyZWFkeS10by1pc3N1ZV0iLCJzZWFyY2hbZXZlbnQ9djIuYmlydGgsYWNjZXNzPWFsbF0iLCJzZWFyY2hbZXZlbnQ9djIuZGVhdGgsYWNjZXNzPWFsbF0iLCJzZWFyY2hbZXZlbnQ9dGVubmlzLWNsdWItbWVtYmVyc2hpcCxhY2Nlc3M9YWxsXSIsInNlYXJjaFtldmVudD1GT09UQkFMTF9DTFVCX01FTUJFUlNISVAsYWNjZXNzPWFsbF0iLCJyZWNvcmQuZGVjbGFyZVtldmVudD12Mi5iaXJ0aHx2Mi5kZWF0aHx0ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwXSIsInJlY29yZC5kZWNsYXJlZC52YWxpZGF0ZVtldmVudD12Mi5iaXJ0aHx2Mi5kZWF0aHx0ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwXSIsInJlY29yZC5kZWNsYXJlZC5yZWplY3RbZXZlbnQ9djIuYmlydGh8djIuZGVhdGh8dGVubmlzLWNsdWItbWVtYmVyc2hpcF0iLCJyZWNvcmQuZGVjbGFyZWQuYXJjaGl2ZVtldmVudD12Mi5iaXJ0aHx2Mi5kZWF0aHx0ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwXSIsInJlY29yZC5yZWdpc3RlcmVkLnByaW50LWNlcnRpZmllZC1jb3BpZXNbZXZlbnQ9djIuYmlydGh8djIuZGVhdGh8dGVubmlzLWNsdWItbWVtYmVyc2hpcF0iLCJyZWNvcmQucmVnaXN0ZXJlZC5yZXF1ZXN0LWNvcnJlY3Rpb25bZXZlbnQ9djIuYmlydGh8djIuZGVhdGh8dGVubmlzLWNsdWItbWVtYmVyc2hpcF0iXSwiaWF0IjoxNDg3MDc2NzA4LCJhdWQiOiJvcGVuY3J2czpnYXRld2F5LXVzZXIiLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI2N2VmN2Y4M2Q2YTljYjkyZTllZGFhYTEifQ.KjuamHMnUPQLmhQ46m6_0nD2QH8xCmfeeh-T9qa1nCQ8QWL6R57Ky3c2WKn5EST-1z1tTiRXsxHu_d5HrJqSgxZyCly5a7c5mM2gcGJABrl45247QVcPb04_dFYWgdKFfRv6Zf7tqDxV_v4YKQ3N_vd7Oe6QnDLARdFP9hKj5z6tOlTXdCWEe8bz1c2QyIKyg_o6jmurzpuD5ZbYCWOOPSqV874HCsxL5hMfNhRZo7zasl5jDnvnUWzfFEiJx5p2QlebYcs-uupNOx5TWuS4M0zO8NOka0G-3lce8_ochZ-1ZVpTImsQzn9TpiWRmVBoUUA9_5d6pcqrhYNgJXOgo1yQRuL58LFHTUtC-J_4-ytgdJDf_vCp0gEZlJc5kFlxEsI9v8fkVXWj-yZp18PeHD8lQUp_Rr4TRAeEPMOtRgOYwjv_t2wCNc5uaOoSr2lOYo7xVcDELIlmYgc84VacUWNmGxes-O7umCAdEiIqXUKT0ULIowIQUgNddjWO264-vZGwKqAW29d4zboubaZ2OiTlfgCOvOVjd4SFhomSFqgOvTh00x4AgVsQovoMdShjGmstfG_fSPHdKYOyrGI0c7RuubHf6tuZPelef3O31w4sFzWJ_A6WNT-juORqmCInY7GU86hwVEH8pfxpPqFe3bTttfe9nL1Vbu0Sfmx8KGI'
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
        SCOPES.RECORD_DECLARATION_EDIT,
        SCOPES.RECORD_REVIEW_DUPLICATES,
        SCOPES.RECORD_DECLARATION_REINSTATE,
        SCOPES.RECORD_PRINT_RECORDS_SUPPORTING_DOCUMENTS,
        SCOPES.RECORD_EXPORT_RECORDS,
        SCOPES.RECORD_UNASSIGN_OTHERS,
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
        'search[event=v2.birth,access=all]',
        'search[event=v2.death,access=all]',
        'search[event=tennis-club-membership,access=all]',
        'search[event=FOOTBALL_CLUB_MEMBERSHIP,access=all]',
        SCOPES.USER_READ_ONLY_MY_AUDIT,
        'record.declare[event=v2.birth|v2.death|tennis-club-membership]',
        'record.declared.reject[event=v2.birth|v2.death|tennis-club-membership]',
        'record.declared.archive[event=v2.birth|v2.death|tennis-club-membership]',
        'record.register[event=v2.birth|v2.death|tennis-club-membership]',
        'record.registered.print-certified-copies[event=v2.birth|v2.death|tennis-club-membership]',
        'record.registered.correct[event=v2.birth|v2.death|tennis-club-membership]'
      ],
      registrationAgent: [
        SCOPES.RECORD_READ,
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
        'search[event=v2.birth,access=all]',
        'search[event=v2.death,access=all]',
        'search[event=tennis-club-membership,access=all]',
        'search[event=FOOTBALL_CLUB_MEMBERSHIP,access=all]',
        'record.declare[event=v2.birth|v2.death|tennis-club-membership]',
        'record.declared.validate[event=v2.birth|v2.death|tennis-club-membership]',
        'record.declared.reject[event=v2.birth|v2.death|tennis-club-membership]',
        'record.declared.archive[event=v2.birth|v2.death|tennis-club-membership]',
        'record.registered.print-certified-copies[event=v2.birth|v2.death|tennis-club-membership]',
        'record.registered.request-correction[event=v2.birth|v2.death|tennis-club-membership]'
      ],
      fieldAgent: [
        SCOPES.RECORD_SUBMIT_FOR_REVIEW,
        SCOPES.SEARCH_BIRTH,
        SCOPES.SEARCH_DEATH,
        SCOPES.SEARCH_MARRIAGE,
        'workqueue[id=all-events|assigned-to-you|recent|requires-updates|sent-for-review]',
        'search[event=v2.birth,access=all]',
        'search[event=v2.death,access=all]',
        'search[event=tennis-club-membership,access=all]',
        'search[event=FOOTBALL_CLUB_MEMBERSHIP,access=all]',
        'record.declare[event=v2.birth|v2.death|tennis-club-membership]',
        'record.notify[event=v2.birth|v2.death|tennis-club-membership]'
      ]
    }
  }

  return { event: eventPayloadGenerator(prng), user }
}
