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
  DocumentPath,
  eventPayloadGenerator,
  generateUuid,
  TestUserRole,
  TokenUserType,
  User,
  UserSummary,
  UUID
} from '@opencrvs/commons/client'
import { FetchUserQuery, Status } from '@client/utils/gateway-types'
import { Faker, en } from '@faker-js/faker'
import testUserTokens from 'virtual:test-tokens'
import { userIds, userScopes } from './test-users'

// Initialize faker with seed, so that the test data stays consistent
const faker = new Faker({ seed: 1001, locale: en })
export { faker }

/**
 * @returns a payload generator for creating events and actions with sensible defaults.
 */
export function testDataGenerator(rngSeed?: number) {
  const prng = createPrng(rngSeed ?? 1001)

  const user = {
    token: testUserTokens,
    id: userIds,
    fieldAgent: (): {
      summary: UserSummary
      v2: User
      v1: FetchUserQuery['getUser']
    } => ({
      summary: {
        id: user.id.fieldAgent,
        name: { firstname: 'Kalusha', surname: 'Bwalya' },
        role: TestUserRole.enum.FIELD_AGENT,
        fullHonorificName: undefined,
        primaryOfficeId: '028d2c85-ca31-426d-b5d1-2cef545a4902' as UUID,
        administrativeAreaId: '62a0ccb4-880d-4f30-8882-f256007dfff9' as UUID,
        avatar: undefined,
        type: TokenUserType.enum.user
      } satisfies UserSummary,
      v2: {
        id: userIds.fieldAgent,
        name: { firstname: 'Kalusha', surname: 'Bwalya' },
        role: 'HOSPITAL_CLERK',
        fullHonorificName: undefined,
        signature: undefined,
        avatar: undefined,
        status: Status.Active,
        type: TokenUserType.enum.user,
        mobile: '+260911111111',
        email: 'kalushabwalya17@gmail.com',
        administrativeAreaId: '62a0ccb4-880d-4f30-8882-f256007dfff9' as UUID,
        primaryOfficeId: '028d2c85-ca31-426d-b5d1-2cef545a4902' as UUID
      } satisfies User,
      v1: {
        id: userIds.fieldAgent,
        userMgntUserID: generateUuid(),
        fullHonorificName: null,
        creationDate: '1736421510056',
        username: 'k.bwalya',
        practitionerId: generateUuid(),
        mobile: '+260911111111',
        email: 'kalushabwalya17@gmail.com',
        role: {
          id: TestUserRole.enum.SOCIAL_WORKER,
          label: {
            id: 'userRole.hospitalClerk',
            defaultMessage: 'Hospital Clerk',
            description: 'Name for user role Hospital Clerk',
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
      } satisfies FetchUserQuery['getUser']
    }),
    registrationAgent: (): {
      summary: UserSummary
      v2: User
      v1: FetchUserQuery['getUser']
    } => ({
      summary: {
        id: user.id.registrationAgent,
        name: { firstname: 'Felix', surname: 'Katongo' },
        role: TestUserRole.enum.REGISTRATION_AGENT,
        fullHonorificName: 'Dr. Felix Katongo',
        primaryOfficeId: '028d2c85-ca31-426d-b5d1-2cef545a4902' as UUID,
        administrativeAreaId: '62a0ccb4-880d-4f30-8882-f256007dfff9' as UUID,
        avatar: 'path/to/avatar' as DocumentPath,
        type: TokenUserType.enum.user
      } satisfies UserSummary,
      v2: {
        id: user.id.registrationAgent,
        name: { firstname: 'Felix', surname: 'Katongo' },
        role: TestUserRole.enum.REGISTRATION_AGENT,
        avatar: 'path/to/avatar' as DocumentPath,
        signature: 'path/to/signature' as DocumentPath,
        fullHonorificName: 'Dr. Felix Katongo',
        status: 'active',
        primaryOfficeId: '028d2c85-ca31-426d-b5d1-2cef545a4902' as UUID,
        administrativeAreaId: '62a0ccb4-880d-4f30-8882-f256007dfff9' as UUID,
        mobile: '+260922222222',
        email: 'kalushabwalya17+@gmail.com',
        type: TokenUserType.enum.user
      } satisfies User,
      v1: {
        id: user.id.registrationAgent,
        userMgntUserID: generateUuid(),
        creationDate: '1736421510209',
        username: 'f.katongo',
        practitionerId: generateUuid(),
        mobile: '+260922222222',
        email: 'kalushabwalya17+@gmail.com',
        fullHonorificName: null,
        role: {
          id: TestUserRole.enum.REGISTRATION_AGENT,
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
      } satisfies FetchUserQuery['getUser']
    }),
    localRegistrar: (): {
      summary: UserSummary
      v2: User
      v1: FetchUserQuery['getUser']
    } => ({
      summary: {
        id: user.id.localRegistrar,
        name: { firstname: 'Kennedy', surname: 'Mweene' },
        role: TestUserRole.enum.LOCAL_REGISTRAR,
        fullHonorificName: '1st Order Honorable Kennedy Mweene',
        primaryOfficeId: '028d2c85-ca31-426d-b5d1-2cef545a4902' as UUID,
        administrativeAreaId: '62a0ccb4-880d-4f30-8882-f256007dfff9' as UUID,
        avatar: undefined,
        type: TokenUserType.enum.user
      },
      v2: {
        id: user.id.localRegistrar,
        name: { firstname: 'Kennedy', surname: 'Mweene' },
        role: TestUserRole.enum.LOCAL_REGISTRAR,
        fullHonorificName: '1st Order Honorable Kennedy Mweene',
        primaryOfficeId: '028d2c85-ca31-426d-b5d1-2cef545a4902' as UUID,
        administrativeAreaId: '62a0ccb4-880d-4f30-8882-f256007dfff9' as UUID,
        avatar: undefined,
        mobile: '+260933333333',
        email: 'kalushabwalya1.7@gmail.com',
        signature: undefined,
        status: Status.Active,
        type: TokenUserType.enum.user
      } satisfies User,
      v1: {
        id: userIds.localRegistrar,
        userMgntUserID: generateUuid(),
        creationDate: '1737725915295',
        username: 'k.mweene',
        practitionerId: generateUuid(),
        mobile: '+260933333333',
        email: 'kalushabwalya1.7@gmail.com',
        role: {
          id: TestUserRole.enum.LOCAL_REGISTRAR,
          label: {
            id: 'userRole.localRegistrar',
            defaultMessage: 'Local Registrar',
            description: 'Name for user role Local Registrar',
            __typename: 'I18nMessage'
          },
          __typename: 'UserRole'
        },
        status: Status.Active,
        fullHonorificName: '1st Order Honorable Kennedy Mweene',
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
      } satisfies FetchUserQuery['getUser']
    }),
    /**
     * Gift Phiri — COMMUNITY_LEADER at Klow Village Office (village level).
     */
    communityLeader: (): {
      summary: UserSummary
      v2: User
      v1: FetchUserQuery['getUser']
    } => ({
      summary: {
        id: userIds.communityLeader,
        name: { firstname: 'Gift', surname: 'Phiri' },
        role: TestUserRole.enum.COMMUNITY_LEADER,
        fullHonorificName: undefined,
        avatar: undefined,
        type: TokenUserType.enum.user,
        primaryOfficeId: '1f4a5b6c-7d8e-4312-8abc-345678901234' as UUID,
        administrativeAreaId: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c' as UUID
      } satisfies UserSummary,
      v2: {
        id: userIds.communityLeader,
        name: { firstname: 'Gift', surname: 'Phiri' },
        role: TestUserRole.enum.COMMUNITY_LEADER,
        fullHonorificName: undefined,
        signature: undefined,
        avatar: undefined,
        type: TokenUserType.enum.user,
        primaryOfficeId: '1f4a5b6c-7d8e-4312-8abc-345678901234' as UUID,
        mobile: '+260717456139',
        email: 'g.phiri@gmail.com',
        status: Status.Active
      } satisfies User,
      v1: {
        id: userIds.communityLeader,
        userMgntUserID: generateUuid(),
        creationDate: '1736421510057',
        username: 'g.phiri',
        practitionerId: generateUuid(),
        mobile: '+260717456139',
        email: 'g.phiri@gmail.com',
        fullHonorificName: null,
        role: {
          id: TestUserRole.enum.COMMUNITY_LEADER,
          label: {
            id: 'userRole.communityLeader',
            defaultMessage: 'Community Leader',
            description: 'Name for user role Community Leader',
            __typename: 'I18nMessage'
          },
          __typename: 'UserRole'
        },
        status: Status.Active,
        name: [
          {
            use: 'en',
            firstNames: 'Gift',
            familyName: 'Phiri',
            __typename: 'HumanName'
          }
        ],
        primaryOffice: {
          id: '1f4a5b6c-7d8e-4312-8abc-345678901234',
          name: 'Klow Village Office',
          alias: ['Klow Village Office'],
          status: 'active',
          __typename: 'Location'
        },
        localRegistrar: null,
        avatar: null,
        searches: [],
        __typename: 'User'
      } satisfies FetchUserQuery['getUser']
    }),
    /**
     * Mitchel Owen — PROVINCIAL_REGISTRAR at Central Province Office (province level).
     */
    provincialRegistrar: (): {
      summary: UserSummary
      v2: User
      v1: FetchUserQuery['getUser']
    } => ({
      summary: {
        id: userIds.provincialRegistrar,
        name: { firstname: 'Mitchel', surname: 'Owen' },
        role: TestUserRole.enum.PROVINCIAL_REGISTRAR,
        fullHonorificName: undefined,
        avatar: undefined,
        type: TokenUserType.enum.user,
        primaryOfficeId: '6f6186ce-cd5f-4a5f-810a-2d99e7c4ba12' as UUID
      },
      v2: {
        id: userIds.provincialRegistrar,
        name: { firstname: 'Mitchel', surname: 'Owen' },
        role: TestUserRole.enum.PROVINCIAL_REGISTRAR,
        fullHonorificName: undefined,
        signature: undefined,
        avatar: undefined,
        type: TokenUserType.enum.user,
        primaryOfficeId: '6f6186ce-cd5f-4a5f-810a-2d99e7c4ba12' as UUID,
        administrativeAreaId: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c' as UUID,
        email: 'kalushabwaly.a17@gmail.com',
        mobile: '+260921111111',
        status: Status.Active
      } satisfies User,
      v1: {
        id: userIds.provincialRegistrar,
        userMgntUserID: generateUuid(),
        creationDate: '1736421510058',
        username: 'm.owen',
        practitionerId: generateUuid(),
        mobile: '+260988085085',
        email: 'm.owen@gmail.com',
        fullHonorificName: null,
        role: {
          id: TestUserRole.enum.PROVINCIAL_REGISTRAR,
          label: {
            id: 'userRole.provincialRegistrar',
            defaultMessage: 'Provincial Registrar',
            description: 'Name for user role Provincial Registrar',
            __typename: 'I18nMessage'
          },
          __typename: 'UserRole'
        },
        status: Status.Active,
        name: [
          {
            use: 'en',
            firstNames: 'Mitchel',
            familyName: 'Owen',
            __typename: 'HumanName'
          }
        ],
        primaryOffice: {
          id: '6f6186ce-cd5f-4a5f-810a-2d99e7c4ba12',
          name: 'Central Province Office',
          alias: ['Central Province Office'],
          status: 'active',
          __typename: 'Location'
        },
        localRegistrar: null,
        avatar: null,
        searches: [],
        __typename: 'User'
      } satisfies FetchUserQuery['getUser']
    }),
    localSystemAdmin: (): {
      summary: UserSummary
      v2: User
      v1: FetchUserQuery['getUser']
    } => ({
      summary: {
        id: userIds.localSystemAdmin,
        name: { firstname: 'Alex', surname: 'Ngonga' },
        role: TestUserRole.enum.LOCAL_SYSTEM_ADMIN,
        fullHonorificName: undefined,
        avatar: undefined,
        type: TokenUserType.enum.user,
        primaryOfficeId: 'f403ca64-6a1d-4882-94c1-d8674df59a85' as UUID,
        administrativeAreaId: '62a0ccb4-880d-4f30-8882-f256007dfff9' as UUID
      } satisfies UserSummary,
      v1: {
        id: userIds.localSystemAdmin,
        userMgntUserID: '69179374-0447-4545-4545-454545454548',
        creationDate: '1758188143348',
        username: 'a.ngonga',
        practitionerId: '723819da-3ddd-49b0-b46c-43c8e34e1c25',
        mobile: '+260978787878',
        email: 'kalushab.walya17@gmail.com',
        fullHonorificName: null,
        role: {
          id: TestUserRole.enum.LOCAL_SYSTEM_ADMIN,
          label: {
            id: 'userRole.localSystemAdmin',
            defaultMessage: 'Local System Admin',
            description: 'Name for user role Local System Admin',
            __typename: 'I18nMessage'
          },
          __typename: 'UserRole'
        },
        status: Status.Active,
        name: [
          {
            use: 'en',
            firstNames: 'Alex',
            familyName: 'Ngonga',
            __typename: 'HumanName'
          }
        ],
        primaryOffice: {
          id: 'f403ca64-6a1d-4882-94c1-d8674df59a85',
          name: 'Ilanga District Office',
          alias: ['Ilanga District Office'],
          status: 'active',
          __typename: 'Location'
        },
        localRegistrar: null,
        avatar: null,
        searches: [],
        __typename: 'User'
      } satisfies FetchUserQuery['getUser'],
      v2: {
        id: userIds.localSystemAdmin,
        name: { firstname: 'Alex', surname: 'Ngonga' },
        role: TestUserRole.enum.LOCAL_SYSTEM_ADMIN,
        status: Status.Active,
        mobile: '+260978787878',
        email: 'kalushab.walya17@gmail.com',
        primaryOfficeId: 'f403ca64-6a1d-4882-94c1-d8674df59a85' as UUID,
        type: TokenUserType.enum.user
      }
    }),
    nationalSystemAdmin: (): {
      summary: UserSummary
      v2: User
      v1: FetchUserQuery['getUser']
    } => ({
      summary: {
        id: user.id.nationalSystemAdmin,
        name: { firstname: 'Jonathan', surname: 'Campbell' },
        role: TestUserRole.enum.NATIONAL_SYSTEM_ADMIN,
        fullHonorificName: undefined,
        avatar: undefined,
        type: TokenUserType.enum.user,
        primaryOfficeId: '8788d17c-b639-4aa0-89f0-ebc64263d81c' as UUID,
        administrativeAreaId: '62a0ccb4-880d-4f30-8882-f256007dfff9' as UUID
      } satisfies UserSummary,
      v2: {
        id: user.id.nationalSystemAdmin,
        name: { firstname: 'Jonathan', surname: 'Campbell' },
        role: TestUserRole.enum.NATIONAL_SYSTEM_ADMIN,
        status: Status.Active,
        mobile: '+260921111111',
        email: 'kalushabwaly.a17@gmail.com',
        primaryOfficeId: '8788d17c-b639-4aa0-89f0-ebc64263d81c' as UUID,
        type: TokenUserType.enum.user
      },
      v1: {
        id: user.id.nationalSystemAdmin,
        userMgntUserID: generateUuid(),
        creationDate: '1759483177946',
        username: 'j.campbell',
        practitionerId: generateUuid(),
        mobile: '+260921111111',
        email: 'kalushabwaly.a17@gmail.com',
        fullHonorificName: null,
        role: {
          id: TestUserRole.enum.NATIONAL_SYSTEM_ADMIN,
          label: {
            id: 'userRole.nationalAdministrator',
            defaultMessage: 'National Administrator',
            description: 'Name for user role National Administrator',
            __typename: 'I18nMessage'
          },
          __typename: 'UserRole'
        },
        status: Status.Active,
        name: [
          {
            use: 'en',
            firstNames: 'Jonathan',
            familyName: 'Campbell',
            __typename: 'HumanName'
          }
        ],
        primaryOffice: {
          id: '8788d17c-b639-4aa0-89f0-ebc64263d81c',
          name: 'HQ Office',
          alias: ['HQ Office'],
          status: 'active',
          __typename: 'Location'
        },
        localRegistrar: null,
        avatar: null,
        searches: [],
        __typename: 'User'
      }
    }),
    scopes: userScopes
    }
  }

  return { event: eventPayloadGenerator(prng), user }
}
