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
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQuZGVjbGFyYXRpb24tc3VibWl0LWZvci1yZXZpZXciLCJzZWFyY2guYmlydGgiLCJzZWFyY2guZGVhdGgiLCJzZWFyY2gubWFycmlhZ2UiLCJ3b3JrcXVldWVbaWQ9YWxsLWV2ZW50c3xhc3NpZ25lZC10by15b3V8cmVjZW50fHJlcXVpcmVzLXVwZGF0ZXN8c2VudC1mb3ItcmV2aWV3XSIsInNlYXJjaFtldmVudD12Mi5iaXJ0aCxhY2Nlc3M9YWxsXSIsInNlYXJjaFtldmVudD12Mi5kZWF0aCxhY2Nlc3M9YWxsXSIsInNlYXJjaFtldmVudD10ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwLGFjY2Vzcz1hbGxdIiwic2VhcmNoW2V2ZW50PUZPT1RCQUxMX0NMVUJfTUVNQkVSU0hJUCxhY2Nlc3M9YWxsXSIsInJlY29yZC5yZWFkW2V2ZW50PXYyLmJpcnRofHYyLmRlYXRofHRlbm5pcy1jbHViLW1lbWJlcnNoaXBdIiwicmVjb3JkLmRlY2xhcmVbZXZlbnQ9djIuYmlydGh8djIuZGVhdGh8dGVubmlzLWNsdWItbWVtYmVyc2hpcF0iLCJyZWNvcmQubm90aWZ5W2V2ZW50PXYyLmJpcnRofHYyLmRlYXRofHRlbm5pcy1jbHViLW1lbWJlcnNoaXBdIl0sImlhdCI6MTQ4NzA3NjcwOCwiYXVkIjoib3BlbmNydnM6Z2F0ZXdheS11c2VyIiwiaXNzIjoib3BlbmNydnM6YXV0aC1zZXJ2aWNlIiwic3ViIjoiNjdlZjdmODNkNmE5Y2I5MmU5ZWRhYTk5In0.e9Wkr3DjxRgs6p12ZeQWVXBoigWe3vFFIB3hgMzGkQkouZaELwvAMmHTbMf6cCs-3TG1dj7PFbUsm9SXptXCqBhdrgxb47BRVBQzai60wEOMJwCaF_NQdrGugFb60yLrmG0IUseOwXSt76FEQDpLXnE5tjz5u1lpJ03kV0kDvOPk8vraCOmkVOazZhcTrQ8cANFXSNV9TKE5E1uBQmgwTigWfogrTLMr79H0sgH8swmEEsKib_RaQ9P6fLytf8EboMgQ3ftoqhY32LgZOtAViiUu4mwJSP7sCUse6DNzZQDZTedQGbu3AXqjGBjZKdOf0fg3ovWiBeb6x2nkwBsNtjXmfyXYV3tFiBJYXDIRpEF-Ll_l_QOzl3SajY6X61X1nNPV99DvOuu3PHPFZYvo77SrgnAYR5tORnBKjOV-WHC_z_3sCVCrqLEsgmvqq_cKBQcddq0m_c2xMglm0HJ9qWonU4Zm8WPfgyINuPvqd0cponRdCLebpJrCYjWAnsOMco17lUPYeNvXHBgdf_vhF0Avmk4L9q451wjwcEW0l5OccdlTJYMFyEZupbqje1XQoDtrY29xLeTiGLzBZHxzZbh9BE3OPkVpg7pQC-mwmFL8OH3q7bdxvhPPbTOdUYXcfk0-LRW0DidODh8aS_MNhuttPmybyVS361CSYDyS3Hw',
      localRegistrar:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQuZGVjbGFyYXRpb24tZWRpdCIsInJlY29yZC5yZXZpZXctZHVwbGljYXRlcyIsInJlY29yZC5kZWNsYXJhdGlvbi1yZWluc3RhdGUiLCJyZWNvcmQuZGVjbGFyYXRpb24tcHJpbnQtc3VwcG9ydGluZy1kb2N1bWVudHMiLCJyZWNvcmQuZXhwb3J0LXJlY29yZHMiLCJyZWNvcmQudW5hc3NpZ24tb3RoZXJzIiwicmVjb3JkLmNvbmZpcm0tcmVnaXN0cmF0aW9uIiwicmVjb3JkLnJlamVjdC1yZWdpc3RyYXRpb24iLCJwZXJmb3JtYW5jZS5yZWFkIiwicGVyZm9ybWFuY2UucmVhZC1kYXNoYm9hcmRzIiwicHJvZmlsZS5lbGVjdHJvbmljLXNpZ25hdHVyZSIsIm9yZ2FuaXNhdGlvbi5yZWFkLWxvY2F0aW9uczpteS1vZmZpY2UiLCJzZWFyY2guYmlydGgiLCJzZWFyY2guZGVhdGgiLCJzZWFyY2gubWFycmlhZ2UiLCJ3b3JrcXVldWVbaWQ9YWxsLWV2ZW50c3xhc3NpZ25lZC10by15b3V8cmVjZW50fHJlcXVpcmVzLWNvbXBsZXRpb258cmVxdWlyZXMtdXBkYXRlc3xpbi1yZXZpZXctYWxsfGluLWV4dGVybmFsLXZhbGlkYXRpb258cmVhZHktdG8tcHJpbnR8cmVhZHktdG8taXNzdWVdIiwic2VhcmNoW2V2ZW50PXYyLmJpcnRoLGFjY2Vzcz1hbGxdIiwic2VhcmNoW2V2ZW50PXYyLmRlYXRoLGFjY2Vzcz1hbGxdIiwic2VhcmNoW2V2ZW50PXRlbm5pcy1jbHViLW1lbWJlcnNoaXAsYWNjZXNzPWFsbF0iLCJzZWFyY2hbZXZlbnQ9Rk9PVEJBTExfQ0xVQl9NRU1CRVJTSElQLGFjY2Vzcz1hbGxdIiwidXNlci5yZWFkOm9ubHktbXktYXVkaXQiLCJyZWNvcmQucmVhZFtldmVudD12Mi5iaXJ0aHx2Mi5kZWF0aHx0ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwXSIsInJlY29yZC5kZWNsYXJlW2V2ZW50PXYyLmJpcnRofHYyLmRlYXRofHRlbm5pcy1jbHViLW1lbWJlcnNoaXBdIiwicmVjb3JkLmRlY2xhcmVkLnJlamVjdFtldmVudD12Mi5iaXJ0aHx2Mi5kZWF0aHx0ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwXSIsInJlY29yZC5kZWNsYXJlZC5hcmNoaXZlW2V2ZW50PXYyLmJpcnRofHYyLmRlYXRofHRlbm5pcy1jbHViLW1lbWJlcnNoaXBdIiwicmVjb3JkLnJlZ2lzdGVyW2V2ZW50PXYyLmJpcnRofHYyLmRlYXRofHRlbm5pcy1jbHViLW1lbWJlcnNoaXBdIiwicmVjb3JkLnJlZ2lzdGVyZWQucHJpbnQtY2VydGlmaWVkLWNvcGllc1tldmVudD12Mi5iaXJ0aHx2Mi5kZWF0aHx0ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwXSIsInJlY29yZC5yZWdpc3RlcmVkLmNvcnJlY3RbZXZlbnQ9djIuYmlydGh8djIuZGVhdGh8dGVubmlzLWNsdWItbWVtYmVyc2hpcF0iXSwiaWF0IjoxNDg3MDc2NzA4LCJhdWQiOiJvcGVuY3J2czpnYXRld2F5LXVzZXIiLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI2ODIxYzE3NWRjZTRkNzg4NmQ0ZTgyMTAifQ.rG2ZMxyLDSTin5H3zPMYHNoJbxxzjk8oIt0QY0DD5fvS1awBWdE-P3Q1Wux5vB3_j6mlKYnCh5mzAKfG_QcFoyvC_O5qjsw-BJhYF9bGviPsHi-ZmLdxcucXa2IT8IqK7g6XFqd0uuV6WHXpbQ7yspvm_0vRDpyPIlwzjHppWzhR3b25e2naFr-KG9icOHDEC2Lx8NTRocd7PzHrbOZOKYYT4hy-maYa9CCdIDFxxUYGZVf5_4Hbftl93TQs-oOtMU-LDysryk3pB5DSzs-ZfzTrG6W8Wc1OIxkG3ik-CtfssHneBcpy5s_lHO0zHXisNoRTs2ucM7VEu7hCFLCNB-8VPe_YT9IALvOI_xGTUOhsuYR13Fs564ELsXIa_J00-G0q4H1kCKIcvT_6obvXp9AsTT8twDoWabAAvI4vszSTsk4qt3x97JbYkERIV6dK9yxzk_dBNN41KVZOd1l_gUsvoWKwSb1Vld1VPabeVH0eUEiH_XoDp-kkZZkoCVaoDHGUphWR5A0CDZyL8o7qr3KZpY2CznVAU8SE3pUbeH39JxFKEso9YjOht9Y9KxfSSbwfyL8wkgQWtFoKAFzHj_HnBpHeVjAOd7KrFp5ErHFzxRSI4i_Ly5lvzdR70crhuIiP-2aejnRvOhgf7ZsyhwzRd4wiqDg77nqrsALckH0',
      registrationAgent:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQuZGVjbGFyYXRpb24tZWRpdCIsInJlY29yZC5kZWNsYXJhdGlvbi1yZWluc3RhdGUiLCJyZWNvcmQuZGVjbGFyYXRpb24tcHJpbnQtc3VwcG9ydGluZy1kb2N1bWVudHMiLCJyZWNvcmQuZXhwb3J0LXJlY29yZHMiLCJwZXJmb3JtYW5jZS5yZWFkIiwicGVyZm9ybWFuY2UucmVhZC1kYXNoYm9hcmRzIiwib3JnYW5pc2F0aW9uLnJlYWQtbG9jYXRpb25zOm15LW9mZmljZSIsInVzZXIucmVhZDpvbmx5LW15LWF1ZGl0Iiwic2VhcmNoLmJpcnRoIiwic2VhcmNoLmRlYXRoIiwic2VhcmNoLm1hcnJpYWdlIiwid29ya3F1ZXVlW2lkPWFsbC1ldmVudHN8YXNzaWduZWQtdG8teW91fHJlY2VudHxyZXF1aXJlcy1jb21wbGV0aW9ufHJlcXVpcmVzLXVwZGF0ZXN8aW4tcmV2aWV3fHNlbnQtZm9yLWFwcHJvdmFsfGluLWV4dGVybmFsLXZhbGlkYXRpb258cmVhZHktdG8tcHJpbnR8cmVhZHktdG8taXNzdWVdIiwic2VhcmNoW2V2ZW50PXYyLmJpcnRoLGFjY2Vzcz1hbGxdIiwic2VhcmNoW2V2ZW50PXYyLmRlYXRoLGFjY2Vzcz1hbGxdIiwic2VhcmNoW2V2ZW50PXRlbm5pcy1jbHViLW1lbWJlcnNoaXAsYWNjZXNzPWFsbF0iLCJzZWFyY2hbZXZlbnQ9Rk9PVEJBTExfQ0xVQl9NRU1CRVJTSElQLGFjY2Vzcz1hbGxdIiwicmVjb3JkLnJlYWRbZXZlbnQ9djIuYmlydGh8djIuZGVhdGh8dGVubmlzLWNsdWItbWVtYmVyc2hpcF0iLCJyZWNvcmQuZGVjbGFyZVtldmVudD12Mi5iaXJ0aHx2Mi5kZWF0aHx0ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwXSIsInJlY29yZC5kZWNsYXJlZC52YWxpZGF0ZVtldmVudD12Mi5iaXJ0aHx2Mi5kZWF0aHx0ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwXSIsInJlY29yZC5kZWNsYXJlZC5yZWplY3RbZXZlbnQ9djIuYmlydGh8djIuZGVhdGh8dGVubmlzLWNsdWItbWVtYmVyc2hpcF0iLCJyZWNvcmQuZGVjbGFyZWQuYXJjaGl2ZVtldmVudD12Mi5iaXJ0aHx2Mi5kZWF0aHx0ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwXSIsInJlY29yZC5yZWdpc3RlcmVkLnByaW50LWNlcnRpZmllZC1jb3BpZXNbZXZlbnQ9djIuYmlydGh8djIuZGVhdGh8dGVubmlzLWNsdWItbWVtYmVyc2hpcF0iLCJyZWNvcmQucmVnaXN0ZXJlZC5yZXF1ZXN0LWNvcnJlY3Rpb25bZXZlbnQ9djIuYmlydGh8djIuZGVhdGh8dGVubmlzLWNsdWItbWVtYmVyc2hpcF0iXSwiaWF0IjoxNDg3MDc2NzA4LCJhdWQiOiJvcGVuY3J2czpnYXRld2F5LXVzZXIiLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI2N2VmN2Y4M2Q2YTljYjkyZTllZGFhYTEifQ.bgvWic2TiQiRCe5Zgayw5eSuN4AlQlL920YS8z1Ah6oXqxkztWjgWfKwxpJWmmDfPOGGaRcQrUPAcAAS4t4yNYsJQ8cceyeWp6AVvVgKrFsOc9kImbipynQU_mHPUm55PW8d9RcNPamfv-EnP6TdaXDOrVJIxRCMzebLp71dqsJiZ-B9r8YgmRh_AIjkKekgOuqCQb-DQ5mIJFIls-_ObpykK-DmCgJIWGjpQ4uqMaYrxQK2mJFKOLbuMSDgf89lSrrOjR70u-FJVZ8B7rnhJtQptnyC40pM5Fs_k-RKIocIVARihX_HPqKyLGvjL5D2y_6due3Q3cJGQIhAUO1TqkEsYL_Fw8sYuwA1Vdz-o1ONl-tckWdUA87X3h2ynNt8i77gWHozo72XMO995h9fADA5LMMe9vci36fE6LnT7XJ4VAFMEkDNI31nBQ1I_50KCuuOqqNQMwQj3ufbbVecREX8XXhQTozptTc9SzljU_SXOdskwJVKZw7M4h56LojYmQoywzPuTx216CjfdPc8_sdpPPV-O2iAsFyUY6nc56K1oh3UOPFxeE05r_BdJ5ZxIqXwYL-zTYPRBsUD_tuNMtHw-dOvXlqXxnBYCsuNXOdV45RCeSHaNpEKg9P6VvuAhlfkkfNgqt86xTKu-EJIPA8eTd15aT1cQ_qhrFjyGh0'
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
        'record.read[event=v2.birth|v2.death|tennis-club-membership]',
        'record.declare[event=v2.birth|v2.death|tennis-club-membership]',
        'record.declared.reject[event=v2.birth|v2.death|tennis-club-membership]',
        'record.declared.archive[event=v2.birth|v2.death|tennis-club-membership]',
        'record.register[event=v2.birth|v2.death|tennis-club-membership]',
        'record.registered.print-certified-copies[event=v2.birth|v2.death|tennis-club-membership]',
        'record.registered.correct[event=v2.birth|v2.death|tennis-club-membership]'
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
        'search[event=v2.birth,access=all]',
        'search[event=v2.death,access=all]',
        'search[event=tennis-club-membership,access=all]',
        'search[event=FOOTBALL_CLUB_MEMBERSHIP,access=all]',
        'record.read[event=v2.birth|v2.death|tennis-club-membership]',
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
        'record.read[event=v2.birth|v2.death|tennis-club-membership]',
        'record.declare[event=v2.birth|v2.death|tennis-club-membership]',
        'record.notify[event=v2.birth|v2.death|tennis-club-membership]'
      ]
    }
  }

  return { event: eventPayloadGenerator(prng), user }
}
