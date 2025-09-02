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
    'record.declare[event=v2.birth|v2.death|tennis-club-membership]',
  RECORD_DECLARE_VALIDATE:
    'record.declared.validate[event=v2.birth|v2.death|tennis-club-membership]'
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
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQuZGVjbGFyYXRpb24tc3VibWl0LWluY29tcGxldGUiLCJyZWNvcmQuZGVjbGFyYXRpb24tc3VibWl0LWZvci1yZXZpZXciLCJzZWFyY2guYmlydGgiLCJzZWFyY2guZGVhdGgiLCJzZWFyY2gubWFycmlhZ2UiLCJ3b3JrcXVldWVbaWQ9YWxsLWV2ZW50c3xhc3NpZ25lZC10by15b3V8cmVjZW50fHJlcXVpcmVzLXVwZGF0ZXN8c2VudC1mb3ItcmV2aWV3XSIsInNlYXJjaFtldmVudD12Mi5iaXJ0aCxhY2Nlc3M9YWxsXSIsInNlYXJjaFtldmVudD12Mi5kZWF0aCxhY2Nlc3M9YWxsXSIsInNlYXJjaFtldmVudD10ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwLGFjY2Vzcz1hbGxdIiwic2VhcmNoW2V2ZW50PUZPT1RCQUxMX0NMVUJfTUVNQkVSU0hJUCxhY2Nlc3M9YWxsXSIsInJlY29yZC5kZWNsYXJlW2V2ZW50PXYyLmJpcnRofHYyLmRlYXRofHRlbm5pcy1jbHViLW1lbWJlcnNoaXBdIl0sImlhdCI6MTQ4NzA3NjcwOCwiYXVkIjoib3BlbmNydnM6Z2F0ZXdheS11c2VyIiwiaXNzIjoib3BlbmNydnM6YXV0aC1zZXJ2aWNlIiwic3ViIjoiNjdlZjdmODNkNmE5Y2I5MmU5ZWRhYTk5In0.Pgtv6XKEoHm-2vghbD_m2d0wViwpUVa510-kKKO7eyCLwVBGaP7fz0Y3yi0veVaL7xn-uRvhL4Mg8QnpYIz0TAysjLIsSwM8NqSXhg7GGtiaPRoAgm2vbdUIw2jSgkS92OR8_hSuVlOsytxKHTPQghtV-r5IcnX17Fptdi-FSZd9cRvbg-D35cpCbXeSx9l4WVajp7V2I0y_FcfDRvWl9hLnyn7Fyn4m8i7PaP8qHPzU9KGvZmZb8ugwDCADqYtHtp81gYAeX0wGsRVNuTFqAS4JePqrrQRo6VLf_zYj5xiKfEaezfj-l6Gb0VRG03R1iw_YYvAW-RK-EtN7L6AwToRx1gKFlfFZ4PhHmMHIZ8E96zlVq743sFG9I5g6pjq5ORGPvgW435pFbEuG_JowYQj53f5hxnd4M5D3BVEjFOfQJucndL646-gIhd9nxp79DRDRcLakqwTIyCAwAkBNUBtu7aYZyfnymR-woQF7jUU4cl-6hPkqbYY53ka0J2jWjuyQII6xCnvaYfmbxi8wX8qtXiulxBXli9LRCFsU7NXaGp5jRScr4z_NPSk9KyNzvdK3Fpwy7Ej-GFNS181IuAZBrVxFNvxit-sKJ6PKbx95SnB1ypb2sYOc8gdJCWd6N_KG42Tjt-fayDDaZXdhtWR10af362hUIh0D2200VA4',
      localRegistrar:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQucmVhZCIsInJlY29yZC5kZWNsYXJhdGlvbi1lZGl0IiwicmVjb3JkLmRlY2xhcmF0aW9uLXN1Ym1pdC1mb3ItdXBkYXRlcyIsInJlY29yZC5yZXZpZXctZHVwbGljYXRlcyIsInJlY29yZC5kZWNsYXJhdGlvbi1hcmNoaXZlIiwicmVjb3JkLmRlY2xhcmF0aW9uLXJlaW5zdGF0ZSIsInJlY29yZC5yZWdpc3RlciIsInJlY29yZC5yZWdpc3RyYXRpb24tY29ycmVjdCIsInJlY29yZC5kZWNsYXJhdGlvbi1wcmludC1zdXBwb3J0aW5nLWRvY3VtZW50cyIsInJlY29yZC5leHBvcnQtcmVjb3JkcyIsInJlY29yZC51bmFzc2lnbi1vdGhlcnMiLCJyZWNvcmQucmVnaXN0cmF0aW9uLXByaW50Jmlzc3VlLWNlcnRpZmllZC1jb3BpZXMiLCJyZWNvcmQuY29uZmlybS1yZWdpc3RyYXRpb24iLCJyZWNvcmQucmVqZWN0LXJlZ2lzdHJhdGlvbiIsInBlcmZvcm1hbmNlLnJlYWQiLCJwZXJmb3JtYW5jZS5yZWFkLWRhc2hib2FyZHMiLCJwcm9maWxlLmVsZWN0cm9uaWMtc2lnbmF0dXJlIiwib3JnYW5pc2F0aW9uLnJlYWQtbG9jYXRpb25zOm15LW9mZmljZSIsInNlYXJjaC5iaXJ0aCIsInNlYXJjaC5kZWF0aCIsInNlYXJjaC5tYXJyaWFnZSIsIndvcmtxdWV1ZVtpZD1hbGwtZXZlbnRzfGFzc2lnbmVkLXRvLXlvdXxyZWNlbnR8cmVxdWlyZXMtY29tcGxldGlvbnxyZXF1aXJlcy11cGRhdGVzfGluLXJldmlldy1hbGx8aW4tZXh0ZXJuYWwtdmFsaWRhdGlvbnxyZWFkeS10by1wcmludHxyZWFkeS10by1pc3N1ZV0iLCJzZWFyY2hbZXZlbnQ9djIuYmlydGgsYWNjZXNzPWFsbF0iLCJzZWFyY2hbZXZlbnQ9djIuZGVhdGgsYWNjZXNzPWFsbF0iLCJzZWFyY2hbZXZlbnQ9dGVubmlzLWNsdWItbWVtYmVyc2hpcCxhY2Nlc3M9YWxsXSIsInNlYXJjaFtldmVudD1GT09UQkFMTF9DTFVCX01FTUJFUlNISVAsYWNjZXNzPWFsbF0iLCJ1c2VyLnJlYWQ6b25seS1teS1hdWRpdCIsInJlY29yZC5kZWNsYXJlW2V2ZW50PXYyLmJpcnRofHYyLmRlYXRofHRlbm5pcy1jbHViLW1lbWJlcnNoaXBdIl0sImlhdCI6MTQ4NzA3NjcwOCwiYXVkIjoib3BlbmNydnM6Z2F0ZXdheS11c2VyIiwiaXNzIjoib3BlbmNydnM6YXV0aC1zZXJ2aWNlIiwic3ViIjoiNjgyMWMxNzVkY2U0ZDc4ODZkNGU4MjEwIn0.ASFBpXVzKIv5MwotFv5nJUM5o2aTLqMrHwiE_xliYtGW0kZ55yCRghd-Wh5FCUW3hZaDECi59q_cUAwYxq2sBF-8GruA5DGewRoykeSWHfaAZv3UhnAEbud1VCEit3lWuNTjKdfEhqA4QFzNFIt3hCbZZOd477TIORc_X0p9nvTLcdE7WK8I31dCl3VqIMtEwc72V0qA9nIqLX44odWMzIcJ8RLb7UQ3T7G4Lfu--hyCGZ9lJnuYfYquI8wyQXzGM6L5wENwFetaN5X5Bpi2cQqRwY68rUGlA9cH18gdTMQ0T61uKZ_Nb3ffTYWd-tvApi1wE9QDHhR6ZuR6e_Xug9mU-rXLIFlgQc71Q_rB8N3sQZUBaWV9LMBKysv_roF_9T6fLkswPzVradORb8-2eyaif0e1Exp8yV3cHe56pp9RjV35EoEkZtc-DnJlPg_xY50vRfdR8A4akg84x7XdQuo5xwtlZcKfyxaWmRN2u1dyTPxwjfsiPu76VjkRyBt0lorM4HIM84BKSWYcsjsKV4MGGVqcT9kpwMUZtPdyqqbYFpEcHfHBjrLyWzhLoKrKey-u35v3DcusTo9UMVNnSYZzkbcFCaIHu2Iha4rqyjfkmlT3IWkxE8APS8UJZ7TUDkHt1KzOV_IkafBaxuBk5KpKDiAYLCH5MKi4pQOKNeg',
      registrationAgent:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQucmVhZCIsInJlY29yZC5kZWNsYXJhdGlvbi1lZGl0IiwicmVjb3JkLmRlY2xhcmF0aW9uLXN1Ym1pdC1mb3ItdXBkYXRlcyIsInJlY29yZC5kZWNsYXJhdGlvbi1hcmNoaXZlIiwicmVjb3JkLmRlY2xhcmF0aW9uLXJlaW5zdGF0ZSIsInJlY29yZC5yZWdpc3RyYXRpb24tcmVxdWVzdC1jb3JyZWN0aW9uIiwicmVjb3JkLmRlY2xhcmF0aW9uLXByaW50LXN1cHBvcnRpbmctZG9jdW1lbnRzIiwicmVjb3JkLmV4cG9ydC1yZWNvcmRzIiwicmVjb3JkLnJlZ2lzdHJhdGlvbi1wcmludCZpc3N1ZS1jZXJ0aWZpZWQtY29waWVzIiwicGVyZm9ybWFuY2UucmVhZCIsInBlcmZvcm1hbmNlLnJlYWQtZGFzaGJvYXJkcyIsIm9yZ2FuaXNhdGlvbi5yZWFkLWxvY2F0aW9uczpteS1vZmZpY2UiLCJ1c2VyLnJlYWQ6b25seS1teS1hdWRpdCIsInNlYXJjaC5iaXJ0aCIsInNlYXJjaC5kZWF0aCIsInNlYXJjaC5tYXJyaWFnZSIsIndvcmtxdWV1ZVtpZD1hbGwtZXZlbnRzfGFzc2lnbmVkLXRvLXlvdXxyZWNlbnR8cmVxdWlyZXMtY29tcGxldGlvbnxyZXF1aXJlcy11cGRhdGVzfGluLXJldmlld3xzZW50LWZvci1hcHByb3ZhbHxpbi1leHRlcm5hbC12YWxpZGF0aW9ufHJlYWR5LXRvLXByaW50fHJlYWR5LXRvLWlzc3VlXSIsInNlYXJjaFtldmVudD12Mi5iaXJ0aCxhY2Nlc3M9YWxsXSIsInNlYXJjaFtldmVudD12Mi5kZWF0aCxhY2Nlc3M9YWxsXSIsInNlYXJjaFtldmVudD10ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwLGFjY2Vzcz1hbGxdIiwic2VhcmNoW2V2ZW50PUZPT1RCQUxMX0NMVUJfTUVNQkVSU0hJUCxhY2Nlc3M9YWxsXSIsInJlY29yZC5kZWNsYXJlW2V2ZW50PXYyLmJpcnRofHYyLmRlYXRofHRlbm5pcy1jbHViLW1lbWJlcnNoaXBdIiwicmVjb3JkLmRlY2xhcmVkLnZhbGlkYXRlW2V2ZW50PXYyLmJpcnRofHYyLmRlYXRofHRlbm5pcy1jbHViLW1lbWJlcnNoaXBdIl0sImlhdCI6MTQ4NzA3NjcwOCwiYXVkIjoib3BlbmNydnM6Z2F0ZXdheS11c2VyIiwiaXNzIjoib3BlbmNydnM6YXV0aC1zZXJ2aWNlIiwic3ViIjoiNjdlZjdmODNkNmE5Y2I5MmU5ZWRhYWExIn0.KLDSQ6NRZSNE1XI08TcYAMbPJT6QPo5XgxxeGssmRvGGmF62g9aJDznNYryeczHp1G4grm8RT7vCXYfsAu0NWJybAP5KCMGsidLnf87pUDJcJRZygbUJmmWWxb4WBxJlhttud-lchkqaPRcDgMaJtUxf1zQQtTqUW3st9sCpE3kdmoM2yiKCklbRaVVdka_cnZoumIWX0UNkCzWu5RCv4vxu5acZREEijceErDSr1XGfsgcsJsHDtypp-u7RqctItUjzBgKV3lkDFp1ljCEh4xmvW5lDFhS1xlzRX3MQQUsCZx_kVWC9eB3oYrQ84ngUUYpNpYUQ4XNAcUdmeoSF9grCTUcHqvwSfHq4LBhSTgARKVrvEs6CF9V_SXn3zub-yTlE0jZw-dC0vqHCFVdV7gZMMztSu-4SEbxbqB6KMIfxwMjI0CaC_z0yJsL3dJcEDDACFsYzt4lYrVNeQnb0_iKUk8NFSoyeWhjFUHBdhJAtECpXodM05XPVyHKtb20Z_gXPNODru9xqOq9X8Pg7G0rx0mrC0J5h_wSF2cQQDXnzVoU9VWrRjrOi09IdR0wj7U4YBju1sET92qIF4pTVMWridQzngSqMP0zwLP97NL3KQN8ydIIdw0Tv-pYlJfgDsoyATEBIFm93ZYRWErGxMh2T1upnPdcB4XFvD3RJgJU'
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
        SCOPES.RECORD_DECLARE,
        SCOPES.RECORD_DECLARE_VALIDATE
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
