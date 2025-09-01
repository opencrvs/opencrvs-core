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
    'workqueue[id=all-events|assigned-to-you|recent|requires-updates|sent-for-review]',
  RECORD_DECLARE:
    'record.declare[event=v2.birth|v2.death|tennis-club-membership]'
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
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQuZGVjbGFyZS1iaXJ0aCIsInJlY29yZC5kZWNsYXJlLWRlYXRoIiwicmVjb3JkLmRlY2xhcmUtbWFycmlhZ2UiLCJyZWNvcmQuZGVjbGFyYXRpb24tc3VibWl0LWluY29tcGxldGUiLCJyZWNvcmQuZGVjbGFyYXRpb24tc3VibWl0LWZvci1yZXZpZXciLCJzZWFyY2guYmlydGgiLCJzZWFyY2guZGVhdGgiLCJzZWFyY2gubWFycmlhZ2UiLCJ3b3JrcXVldWVbaWQ9YWxsLWV2ZW50c3xhc3NpZ25lZC10by15b3V8cmVjZW50fHJlcXVpcmVzLXVwZGF0ZXN8c2VudC1mb3ItcmV2aWV3XSIsInNlYXJjaFtldmVudD12Mi5iaXJ0aCxhY2Nlc3M9YWxsXSIsInNlYXJjaFtldmVudD12Mi5kZWF0aCxhY2Nlc3M9YWxsXSIsInNlYXJjaFtldmVudD10ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwLGFjY2Vzcz1hbGxdIiwic2VhcmNoW2V2ZW50PUZPT1RCQUxMX0NMVUJfTUVNQkVSU0hJUCxhY2Nlc3M9YWxsXSIsInJlY29yZC5kZWNsYXJlW2V2ZW50PXYyLmJpcnRofHYyLmRlYXRofHRlbm5pcy1jbHViLW1lbWJlcnNoaXBdIl0sImlhdCI6MTQ4NzA3NjcwOCwiYXVkIjoib3BlbmNydnM6Z2F0ZXdheS11c2VyIiwiaXNzIjoib3BlbmNydnM6YXV0aC1zZXJ2aWNlIiwic3ViIjoiNjdlZjdmODNkNmE5Y2I5MmU5ZWRhYTk5In0.G82l5qeRBwNkxhQIEzBjb0BMY4oQ9WK4tRlehtt_i3d3BVq97pCvCo45O514vmYpNqTvYNXvmNVHaAlj8peCIQgD7qBUzuoCXXChTixzT49f36DzGQXon089inlLUTESNkV9uggeThVfl4UFahT9EpQdVTKMwx9SCopwyP3EMkL484iRiUooXELCrbKEbbhrJe7SJHEg92eqMnE8li7n_9GGs6CRdV2MUfA-Bvpfn44i08Rfkl0RcARoxAitPA-OiWnlvll8jecai8ecCW0P-P4RBveRDf8jsZxXo6dGFatKD6wVpWioS6u55WdyYBJFVk8IcXBaWAvL8Zuphp_d7izec_25d29f1syOH7q8E8uTzwP_ptW-59j3fc5RdD3c2te3NFFkjhkP7wglhIJGT1Mhtr0uGowxfIFcihXHgycC-mEBg7eGAqVs6b5nTm9wx9KN-JqB3JSdtD7pMdQNcQ_AMz_A4Sk50MbmGelbGGTzHQUYE9iq-G_UXENRaylQuAPCycyJIQD3U5vR3Or3fifqjzXpKrVUC-CtzOzpwJHicQL5wdKAfOkSgT9fUXjZOfdkt789ownCCrloUg_qf66uIE-mPTJw4qfqzDus4ymuHKCclPh_G2-8KY7tXzATE5Y3Rl1I0bqctuPGXRi6CrWbrlBOYrg9z_iZ9FX-RCU',
      localRegistrar:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQucmVhZCIsInJlY29yZC5kZWNsYXJlLWJpcnRoIiwicmVjb3JkLmRlY2xhcmUtZGVhdGgiLCJyZWNvcmQuZGVjbGFyZS1tYXJyaWFnZSIsInJlY29yZC5kZWNsYXJhdGlvbi1lZGl0IiwicmVjb3JkLmRlY2xhcmF0aW9uLXN1Ym1pdC1mb3ItdXBkYXRlcyIsInJlY29yZC5yZXZpZXctZHVwbGljYXRlcyIsInJlY29yZC5kZWNsYXJhdGlvbi1hcmNoaXZlIiwicmVjb3JkLmRlY2xhcmF0aW9uLXJlaW5zdGF0ZSIsInJlY29yZC5yZWdpc3RlciIsInJlY29yZC5yZWdpc3RyYXRpb24tY29ycmVjdCIsInJlY29yZC5kZWNsYXJhdGlvbi1wcmludC1zdXBwb3J0aW5nLWRvY3VtZW50cyIsInJlY29yZC5leHBvcnQtcmVjb3JkcyIsInJlY29yZC51bmFzc2lnbi1vdGhlcnMiLCJyZWNvcmQucmVnaXN0cmF0aW9uLXByaW50Jmlzc3VlLWNlcnRpZmllZC1jb3BpZXMiLCJyZWNvcmQuY29uZmlybS1yZWdpc3RyYXRpb24iLCJyZWNvcmQucmVqZWN0LXJlZ2lzdHJhdGlvbiIsInBlcmZvcm1hbmNlLnJlYWQiLCJwZXJmb3JtYW5jZS5yZWFkLWRhc2hib2FyZHMiLCJwcm9maWxlLmVsZWN0cm9uaWMtc2lnbmF0dXJlIiwib3JnYW5pc2F0aW9uLnJlYWQtbG9jYXRpb25zOm15LW9mZmljZSIsInNlYXJjaC5iaXJ0aCIsInNlYXJjaC5kZWF0aCIsInNlYXJjaC5tYXJyaWFnZSIsIndvcmtxdWV1ZVtpZD1hbGwtZXZlbnRzfGFzc2lnbmVkLXRvLXlvdXxyZWNlbnR8cmVxdWlyZXMtY29tcGxldGlvbnxyZXF1aXJlcy11cGRhdGVzfGluLXJldmlldy1hbGx8aW4tZXh0ZXJuYWwtdmFsaWRhdGlvbnxyZWFkeS10by1wcmludHxyZWFkeS10by1pc3N1ZV0iLCJzZWFyY2hbZXZlbnQ9djIuYmlydGgsYWNjZXNzPWFsbF0iLCJzZWFyY2hbZXZlbnQ9djIuZGVhdGgsYWNjZXNzPWFsbF0iLCJzZWFyY2hbZXZlbnQ9dGVubmlzLWNsdWItbWVtYmVyc2hpcCxhY2Nlc3M9YWxsXSIsInNlYXJjaFtldmVudD1GT09UQkFMTF9DTFVCX01FTUJFUlNISVAsYWNjZXNzPWFsbF0iLCJ1c2VyLnJlYWQ6b25seS1teS1hdWRpdCIsInJlY29yZC5kZWNsYXJlW2V2ZW50PXYyLmJpcnRofHYyLmRlYXRofHRlbm5pcy1jbHViLW1lbWJlcnNoaXBdIl0sImlhdCI6MTQ4NzA3NjcwOCwiYXVkIjoib3BlbmNydnM6Z2F0ZXdheS11c2VyIiwiaXNzIjoib3BlbmNydnM6YXV0aC1zZXJ2aWNlIiwic3ViIjoiNjgyMWMxNzVkY2U0ZDc4ODZkNGU4MjEwIn0.Vvj2LGbcI7uTvP8AUy1b0tEzYXciGsaJtsUQDpoArChBKaEFE_y4qtDN9hPhXJuup4zaTAKFq3a_WkplH97TVcr2Qz_iiuSeKoD1KwKNq9aPlmFY4k0XtmG-Wb76lgYGTZjZFEyX-_PKloenQnnTNguZN2AXaVfUxXZJFpxlLEUmFAru0dqfVyj4smAlECRr5NAIRAyOMXVVYAEPfsjAhv33UbGZ1CgP1GzlEfDF37mJtNwg7HOUyujwZ3uh5BjC3xmV0pwjGu_P-cqgTcvTtGdZRFzJaHxR9-3GOkxRMxOx5LnM6zbycXlK2iH6GdTUB4E4hM7jNizV-6gSYUWWbAZiuyZtxx2HfZzFRvPUlh455O9IByxof5tTMjPX1JqNk732V-bGH_TOLLWURHv98r-HmpXCylMJ3-xcvJFltDtCkXtexkJ4QPr3Yfe5FzOZ_qEjZZitP7CjZQpFHetvaMITBa2sbo5EGjV4pQoKfWPs9op6AxopGZxJY7uCUMVll9MqnK-QPxq6c1JpZHf--kF0nDDNPhPt4QVHoRen88hSJ3EKwpfI718CkW-ZDPvpJ5MEz1vAqwAokJ6dcFpPxLczVe9XzQqQbP0HjSzthsnzNcgbOBEN5OYiAYrZP0SM_ip9rfL0HWY5hbyHs8-XZRfdVVbzPeZf9_Ls_ibMdJc',
      registrationAgent:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQucmVhZCIsInJlY29yZC5kZWNsYXJlLWJpcnRoIiwicmVjb3JkLmRlY2xhcmUtZGVhdGgiLCJyZWNvcmQuZGVjbGFyZS1tYXJyaWFnZSIsInJlY29yZC5kZWNsYXJhdGlvbi1lZGl0IiwicmVjb3JkLmRlY2xhcmF0aW9uLXN1Ym1pdC1mb3ItYXBwcm92YWwiLCJyZWNvcmQuZGVjbGFyYXRpb24tc3VibWl0LWZvci11cGRhdGVzIiwicmVjb3JkLmRlY2xhcmF0aW9uLWFyY2hpdmUiLCJyZWNvcmQuZGVjbGFyYXRpb24tcmVpbnN0YXRlIiwicmVjb3JkLnJlZ2lzdHJhdGlvbi1yZXF1ZXN0LWNvcnJlY3Rpb24iLCJyZWNvcmQuZGVjbGFyYXRpb24tcHJpbnQtc3VwcG9ydGluZy1kb2N1bWVudHMiLCJyZWNvcmQuZXhwb3J0LXJlY29yZHMiLCJyZWNvcmQucmVnaXN0cmF0aW9uLXByaW50Jmlzc3VlLWNlcnRpZmllZC1jb3BpZXMiLCJwZXJmb3JtYW5jZS5yZWFkIiwicGVyZm9ybWFuY2UucmVhZC1kYXNoYm9hcmRzIiwib3JnYW5pc2F0aW9uLnJlYWQtbG9jYXRpb25zOm15LW9mZmljZSIsInVzZXIucmVhZDpvbmx5LW15LWF1ZGl0Iiwic2VhcmNoLmJpcnRoIiwic2VhcmNoLmRlYXRoIiwic2VhcmNoLm1hcnJpYWdlIiwid29ya3F1ZXVlW2lkPWFsbC1ldmVudHN8YXNzaWduZWQtdG8teW91fHJlY2VudHxyZXF1aXJlcy1jb21wbGV0aW9ufHJlcXVpcmVzLXVwZGF0ZXN8aW4tcmV2aWV3fHNlbnQtZm9yLWFwcHJvdmFsfGluLWV4dGVybmFsLXZhbGlkYXRpb258cmVhZHktdG8tcHJpbnR8cmVhZHktdG8taXNzdWVdIiwic2VhcmNoW2V2ZW50PXYyLmJpcnRoLGFjY2Vzcz1hbGxdIiwic2VhcmNoW2V2ZW50PXYyLmRlYXRoLGFjY2Vzcz1hbGxdIiwic2VhcmNoW2V2ZW50PXRlbm5pcy1jbHViLW1lbWJlcnNoaXAsYWNjZXNzPWFsbF0iLCJzZWFyY2hbZXZlbnQ9Rk9PVEJBTExfQ0xVQl9NRU1CRVJTSElQLGFjY2Vzcz1hbGxdIiwicmVjb3JkLmRlY2xhcmVbZXZlbnQ9djIuYmlydGh8djIuZGVhdGh8dGVubmlzLWNsdWItbWVtYmVyc2hpcF0iXSwiaWF0IjoxNDg3MDc2NzA4LCJhdWQiOiJvcGVuY3J2czpnYXRld2F5LXVzZXIiLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI2N2VmN2Y4M2Q2YTljYjkyZTllZGFhYTEifQ.lhPQ7afBSBUeJi7925M_TqZtKeCxOoCVfHa5eA7ZOwJUPhCX4EnXp2nrVO5D11ePGs-Qm1nOhhML6sf6rqd2uyM1xNO5eulXm0qdTcLF7o5dkPzCphGYNDYP7lZKAkgwIVStFMRHOMNiT7ISYWJGrrVRF4OtoYr_TT98enZPcBh4C2KSvxHF5-iZbI7kucCfo9tPCX4xRCIEHT1WwZ4eYAc8cOjOxks3OW2B9keu_ySjFI7At7EGJMsDpV81Mqi-boGmLhBcFiJ0fDWUhpndOw5Cb8OUEPNKbn9yee2qyho_gvpak_z1_oXCAQmaqKL1t2McRhkORmztLy5hjbvxMZQX-5BJVY4h4ZutfWYS1gUnDBH-I1hmhe2gj7qWggBpufLZGMXW-V7iysbNKa80Mj23er5SbJWP0gT9lDBOmlqjvTm5EAcl87fWN7_ZYz7Ei_K4NP2487651tZRisCeDW9TpltN40xBdt4WJXNkV3jMT2Stb4ZXMqd40shEOYpf5sLjYGCmkDQ0BT8zQlY5vmHLuu5gNKY9Y0uvbXkH-44oeRhhj_fr_hXFcRyVneAY_VMQfpBa1yZe6K-STivUn1RjVJadQe3-541E65J-I1dw16O44IH7wIseWVPzgWcfipj7_kfMDupupwLRm0vlVgl32G5n2EumRLrhO44nuLI'
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
        SCOPES.SEARCH_SCOPES_FOOTBALL_CLUB,
        SCOPES.USER_READ_ONLY_MY_AUDIT,
        SCOPES.RECORD_DECLARE
      ],
      registrationAgent: [
        SCOPES.RECORD_READ,
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
        SCOPES.USER_READ_ONLY_MY_AUDIT,
        SCOPES.SEARCH_BIRTH,
        SCOPES.SEARCH_DEATH,
        SCOPES.SEARCH_MARRIAGE,
        SCOPES.WORKQUEUE_REGISTRATION_AGENT,
        SCOPES.SEARCH_SCOPES_BIRTH,
        SCOPES.SEARCH_SCOPES_DEATH,
        SCOPES.SEARCH_SCOPES_TENNIS_CLUB,
        SCOPES.SEARCH_SCOPES_FOOTBALL_CLUB,
        SCOPES.RECORD_DECLARE
      ],
      fieldAgent: [
        SCOPES.RECORD_SUBMIT_INCOMPLETE,
        SCOPES.RECORD_SUBMIT_FOR_REVIEW,
        SCOPES.SEARCH_BIRTH,
        SCOPES.SEARCH_DEATH,
        SCOPES.SEARCH_MARRIAGE,
        SCOPES.WORKQUEUE_FIELD_AGENT,
        SCOPES.SEARCH_SCOPES_BIRTH,
        SCOPES.SEARCH_SCOPES_DEATH,
        SCOPES.SEARCH_SCOPES_TENNIS_CLUB,
        SCOPES.SEARCH_SCOPES_FOOTBALL_CLUB,
        SCOPES.RECORD_DECLARE
      ]
    }
  }

  return { event: eventPayloadGenerator(prng), user }
}
