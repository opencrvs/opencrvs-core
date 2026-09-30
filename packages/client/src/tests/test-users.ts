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
  encodeScope,
  JurisdictionFilter,
  TestUserRole,
  TokenUserType,
  UUID
} from '@opencrvs/commons/client'

/**
 * Test users shared by unit tests and Storybook.
 *
 * Pure data with no browser-only or Node-only dependencies: the client vite
 * config imports it in Node to sign `virtual:test-tokens`, and
 * `testDataGenerator()` imports it in the browser.
 */

export const userIds = {
  localRegistrar: 'aa13a268-ae48-4a30-9450-554aebaab203' as UUID,
  registrationAgent: '861fa044-c8cf-4d9d-9cbc-f7a2e1d5b94a' as UUID,
  fieldAgent: '8f8b431b-ef47-4068-b678-ef2dd93e9208' as UUID,
  localSystemAdmin: 'bb8c53ab-87a6-4491-9eff-2a429ee02a3a' as UUID,
  nationalSystemAdmin: 'b18b1cd4-85e3-4caf-b60f-537cb790f208' as UUID,
  communityLeader: 'c877dda0-0362-4af6-a88d-5ab8f358030e' as UUID,
  provincialRegistrar: 'f11558f2-ff57-4382-9875-d58f4206b47f' as UUID,
  /** `userDetails` in tests/util.tsx */
  legacyDefault: 'b77b78af-a259-4bc1-85d5-b1e8c1382273' as UUID
}

/**
 * Shared base scopes for communityLeader variants — excludes record.search so
 * each variant can inject its own registeredIn restriction.
 */
const communityLeaderBaseScopesWithoutSearch = [
  encodeScope({
    type: 'workqueue',
    options: {
      ids: [
        'all-events',
        'assigned-to-you',
        'recent',
        'requires-updates',
        'sent-for-review'
      ]
    }
  }),
  encodeScope({
    type: 'record.create',
    options: {
      event: ['birth', 'death', 'tennis-club-membership', 'child-onboarding'],
      placeOfEvent: JurisdictionFilter.enum.location
    }
  }),
  encodeScope({ type: 'record.read' }),
  encodeScope({ type: 'record.notify' }),
  encodeScope({ type: 'record.edit' })
]

export const userScopes = {
  /**
   * scopes are same as countryconfig/src/data-seeding/roles/roles.ts
   * except for,
   *  - workque scope that has an extra workqueue: all-events
   *  - test admin scope that has extra user create and edit scopes
   */
  localRegistrar: [
    encodeScope({ type: 'performance.read' }),
    encodeScope({ type: 'performance.read-dashboards' }),
    encodeScope({ type: 'profile.electronic-signature' }),
    encodeScope({
      type: 'organisation.read-locations',
      options: { accessLevel: 'location' }
    }),
    encodeScope({
      type: 'workqueue',
      options: {
        ids: [
          'all-events',
          'assigned-to-you',
          'recent',
          'requires-completion',
          'requires-updates',
          'in-review-all',
          'in-external-validation',
          'ready-to-print',
          'ready-to-issue'
        ]
      }
    }),
    encodeScope({ type: 'user.read-only-my-audit' }),
    encodeScope({ type: 'record.search' }),
    encodeScope({ type: 'record.create' }),
    encodeScope({
      type: 'record.read',
      options: {
        event: [
          'birth',
          'death',
          'tennis-club-membership',
          'child-onboarding',
          'library-membership'
        ]
      }
    }),
    encodeScope({ type: 'record.declare' }),
    encodeScope({ type: 'record.reject' }),
    encodeScope({ type: 'record.archive' }),
    encodeScope({ type: 'record.unarchive' }),
    encodeScope({ type: 'record.register' }),
    encodeScope({ type: 'record.edit' }),
    encodeScope({ type: 'record.print-certified-copies' }),
    encodeScope({ type: 'record.correct' }),
    encodeScope({ type: 'record.unassign-others' }),
    encodeScope({ type: 'record.review-duplicates' }),
    encodeScope({
      type: 'record.custom-action',
      options: {
        event: ['tennis-club-membership'],
        customActionTypes: ['Approve']
      }
    })
  ],
  registrationAgent: [
    encodeScope({ type: 'performance.read' }),
    encodeScope({ type: 'performance.read-dashboards' }),
    encodeScope({
      type: 'organisation.read-locations',
      options: { accessLevel: 'location' }
    }),
    encodeScope({ type: 'user.read-only-my-audit' }),
    encodeScope({
      type: 'workqueue',
      options: {
        ids: [
          'all-events',
          'assigned-to-you',
          'recent',
          'requires-completion',
          'requires-updates',
          'in-review',
          'sent-for-approval',
          'in-external-validation',
          'ready-to-print',
          'ready-to-issue'
        ]
      }
    }),
    encodeScope({
      type: 'record.search'
    }),
    encodeScope({
      type: 'record.create',
      options: {
        event: ['birth', 'death', 'tennis-club-membership', 'child-onboarding']
      }
    }),
    encodeScope({ type: 'record.read' }),
    encodeScope({ type: 'record.declare' }),
    encodeScope({ type: 'record.reject' }),
    encodeScope({ type: 'record.edit' }),
    encodeScope({ type: 'record.archive' }),
    encodeScope({ type: 'record.unarchive' }),
    encodeScope({ type: 'record.print-certified-copies' }),
    encodeScope({ type: 'record.request-correction' })
  ],
  fieldAgent: [
    encodeScope({
      type: 'workqueue',
      options: {
        ids: [
          'all-events',
          'assigned-to-you',
          'recent',
          'requires-updates',
          'sent-for-review'
        ]
      }
    }),
    encodeScope({ type: 'record.search' }),
    encodeScope({ type: 'record.create' }),
    encodeScope({ type: 'record.read' }),
    encodeScope({ type: 'record.notify' }),
    encodeScope({ type: 'record.declare' }),
    encodeScope({ type: 'record.edit' })
  ],
  localSystemAdmin: [
    encodeScope({
      type: 'user.read',
      options: { accessLevel: 'administrativeArea' }
    }),
    encodeScope({
      type: 'user.edit',
      options: {
        accessLevel: 'administrativeArea',
        role: [
          'FIELD_AGENT',
          'POLICE_OFFICER',
          'SOCIAL_WORKER',
          'HEALTHCARE_WORKER',
          'LOCAL_LEADER',
          'REGISTRATION_AGENT',
          'LOCAL_REGISTRAR'
        ]
      }
    }),
    encodeScope({
      type: 'organisation.read-locations',
      options: { accessLevel: 'administrativeArea' }
    }),
    encodeScope({ type: 'performance.read' }),
    encodeScope({ type: 'performance.read-dashboards' }),
    encodeScope({ type: 'performance.vital-statistics-export' }),
    encodeScope({
      type: 'user.create',
      options: {
        accessLevel: 'administrativeArea',
        role: [
          'FIELD_AGENT',
          'POLICE_OFFICER',
          'SOCIAL_WORKER',
          'HEALTHCARE_WORKER',
          'LOCAL_LEADER',
          'REGISTRATION_AGENT',
          'LOCAL_REGISTRAR'
        ]
      }
    })
  ],
  /**
   * COMMUNITY_LEADER: jurisdiction locked to their specific office location.
   * record.create has placeOfEvent: 'location' so the field is fully locked.
   * Community leaders do NOT have record.declare — only record.notify.
   * They submit via the Declare form but the action is stored as NOTIFY.
   */
  communityLeader: [
    ...communityLeaderBaseScopesWithoutSearch,
    encodeScope({
      type: 'record.search',
      options: { placeOfEvent: 'administrativeArea' }
    })
  ],
  /** record.search restricted to user's own office only (registeredIn + placeOfEvent). */
  communityLeaderRegisteredInLocation: [
    ...communityLeaderBaseScopesWithoutSearch,
    encodeScope({
      type: 'record.search',
      options: {
        registeredIn: JurisdictionFilter.enum.location,
        placeOfEvent: JurisdictionFilter.enum.location
      }
    })
  ],
  /** record.search restricted to user's administrative area (registeredIn + placeOfEvent). */
  communityLeaderRegisteredInAdministrativeArea: [
    ...communityLeaderBaseScopesWithoutSearch,
    encodeScope({
      type: 'record.search',
      options: {
        registeredIn: JurisdictionFilter.enum.administrativeArea,
        placeOfEvent: JurisdictionFilter.enum.administrativeArea
      }
    })
  ],
  /**
   * Two record.search scopes: both registeredIn and placeOfEvent paired.
   * Most relaxed (administrativeArea) wins for each attribute.
   */
  communityLeaderMultipleSearchScopes: [
    ...communityLeaderBaseScopesWithoutSearch,
    encodeScope({
      type: 'record.search',
      options: {
        registeredIn: JurisdictionFilter.enum.location,
        placeOfEvent: JurisdictionFilter.enum.location
      }
    }),
    encodeScope({
      type: 'record.search',
      options: {
        registeredIn: JurisdictionFilter.enum.administrativeArea,
        placeOfEvent: JurisdictionFilter.enum.administrativeArea
      }
    })
  ],
  /**
   * Two record.search scopes: one without registeredIn (defaults to 'all') + registeredIn=location.
   * Most relaxed ('all') wins — same result as having no restriction.
   */
  communityLeaderSearchAllAndLocation: [
    ...communityLeaderBaseScopesWithoutSearch,
    encodeScope({
      type: 'record.search',
      options: { placeOfEvent: JurisdictionFilter.enum.location }
    }),
    encodeScope({
      type: 'record.search',
      options: { registeredIn: JurisdictionFilter.enum.location }
    })
  ],
  /**
   * PROVINCIAL_REGISTRAR: jurisdiction locked to their administrative area (province).
   * record.create has placeOfEvent: 'administrativeArea' so province is locked but districts are selectable.
   */
  provincialRegistrar: [
    encodeScope({ type: 'performance.read' }),
    encodeScope({ type: 'performance.read-dashboards' }),
    encodeScope({ type: 'profile.electronic-signature' }),
    encodeScope({
      type: 'organisation.read-locations',
      options: { accessLevel: 'location' }
    }),
    encodeScope({
      type: 'workqueue',
      options: {
        ids: [
          'all-events',
          'assigned-to-you',
          'recent',
          'requires-completion',
          'requires-updates',
          'in-review-all',
          'in-external-validation',
          'ready-to-print',
          'ready-to-issue'
        ]
      }
    }),
    encodeScope({ type: 'user.read-only-my-audit' }),
    encodeScope({ type: 'record.search' }),
    encodeScope({
      type: 'record.create',
      options: {
        event: ['birth', 'death', 'tennis-club-membership', 'child-onboarding'],
        placeOfEvent: JurisdictionFilter.enum.administrativeArea
      }
    }),
    encodeScope({ type: 'record.read' }),
    encodeScope({ type: 'record.declare' }),
    encodeScope({ type: 'record.reject' }),
    encodeScope({ type: 'record.archive' }),
    encodeScope({ type: 'record.unarchive' }),
    encodeScope({ type: 'record.register' }),
    encodeScope({ type: 'record.edit' }),
    encodeScope({ type: 'record.print-certified-copies' }),
    encodeScope({ type: 'record.correct' }),
    encodeScope({ type: 'record.unassign-others' }),
    encodeScope({ type: 'record.review-duplicates' })
  ],
  nationalSystemAdmin: [
    encodeScope({ type: 'config.update-all' }),
    encodeScope({ type: 'organisation.read-locations' }),
    encodeScope({ type: 'user.read' }),
    encodeScope({ type: 'performance.read' }),
    encodeScope({ type: 'performance.read-dashboards' }),
    encodeScope({ type: 'performance.vital-statistics-export' }),
    encodeScope({ type: 'record.reindex' }),
    encodeScope({
      type: 'user.create',
      options: {
        role: [
          'FIELD_AGENT',
          'HOSPITAL_CLERK',
          'COMMUNITY_LEADER',
          'REGISTRATION_AGENT',
          'LOCAL_REGISTRAR',
          'NATIONAL_REGISTRAR',
          'LOCAL_SYSTEM_ADMIN',
          'NATIONAL_SYSTEM_ADMIN',
          'PERFORMANCE_MANAGER'
        ]
      }
    }),
    encodeScope({
      type: 'user.edit',
      options: {
        role: [
          'FIELD_AGENT',
          'HOSPITAL_CLERK',
          'COMMUNITY_LEADER',
          'REGISTRATION_AGENT',
          'LOCAL_REGISTRAR',
          'NATIONAL_REGISTRAR',
          'LOCAL_SYSTEM_ADMIN',
          'NATIONAL_SYSTEM_ADMIN',
          'PERFORMANCE_MANAGER'
        ]
      }
    })
  ],
  testAdmin: [
    encodeScope({ type: 'user.read' }),
    encodeScope({
      type: 'user.create',
      options: { role: ['FIELD_AGENT'] }
    }),
    encodeScope({
      type: 'user.create',
      options: {
        accessLevel: 'administrativeArea',
        role: ['LOCAL_REGISTRAR']
      }
    }),
    encodeScope({
      type: 'user.create',
      options: { accessLevel: 'location', role: ['COMMUNITY_LEADER'] }
    }),
    encodeScope({
      type: 'user.edit',
      options: { role: ['REGISTRATION_AGENT'] }
    }),
    encodeScope({
      type: 'user.edit',
      options: {
        accessLevel: 'administrativeArea',
        role: ['LOCAL_SYSTEM_ADMIN']
      }
    }),
    encodeScope({
      type: 'user.edit',
      options: { accessLevel: 'location', role: ['PROVINCIAL_REGISTRAR'] }
    })
  ]
}

/**
 * JWT claims of each test user token. `virtual:test-tokens` signs one token
 * per key, so a new key here is all it takes to add a token.
 */
export const testUserTokenClaims = {
  /** Default token of legacy tests: `userDetails`, with no scopes. */
  legacyDefault: {
    scope: [],
    subject: userIds.legacyDefault,
    userType: TokenUserType.enum.user,
    role: TestUserRole.enum.FIELD_AGENT
  },
  fieldAgent: {
    scope: userScopes.fieldAgent,
    subject: userIds.fieldAgent,
    userType: TokenUserType.enum.user,
    role: TestUserRole.enum.FIELD_AGENT
  },
  registrationAgent: {
    scope: userScopes.registrationAgent,
    subject: userIds.registrationAgent,
    userType: TokenUserType.enum.user,
    role: TestUserRole.enum.REGISTRATION_AGENT
  },
  localRegistrar: {
    scope: userScopes.localRegistrar,
    subject: userIds.localRegistrar,
    userType: TokenUserType.enum.user,
    role: TestUserRole.enum.LOCAL_REGISTRAR
  },
  localSystemAdmin: {
    scope: userScopes.localSystemAdmin,
    subject: userIds.localSystemAdmin,
    userType: TokenUserType.enum.user,
    role: TestUserRole.enum.LOCAL_SYSTEM_ADMIN
  },
  nationalSystemAdmin: {
    scope: userScopes.nationalSystemAdmin,
    subject: userIds.nationalSystemAdmin,
    userType: TokenUserType.enum.user,
    role: TestUserRole.enum.NATIONAL_SYSTEM_ADMIN
  },
  communityLeader: {
    scope: userScopes.communityLeader,
    subject: userIds.communityLeader,
    userType: TokenUserType.enum.user,
    role: TestUserRole.enum.COMMUNITY_LEADER
  },
  communityLeaderRegisteredInLocation: {
    scope: userScopes.communityLeaderRegisteredInLocation,
    subject: userIds.communityLeader,
    userType: TokenUserType.enum.user,
    role: TestUserRole.enum.COMMUNITY_LEADER
  },
  communityLeaderRegisteredInAdministrativeArea: {
    scope: userScopes.communityLeaderRegisteredInAdministrativeArea,
    subject: userIds.communityLeader,
    userType: TokenUserType.enum.user,
    role: TestUserRole.enum.COMMUNITY_LEADER
  },
  communityLeaderMultipleSearchScopes: {
    scope: userScopes.communityLeaderMultipleSearchScopes,
    subject: userIds.communityLeader,
    userType: TokenUserType.enum.user,
    role: TestUserRole.enum.COMMUNITY_LEADER
  },
  communityLeaderSearchAllAndLocation: {
    scope: userScopes.communityLeaderSearchAllAndLocation,
    subject: userIds.communityLeader,
    userType: TokenUserType.enum.user,
    role: TestUserRole.enum.COMMUNITY_LEADER
  },
  provincialRegistrar: {
    scope: userScopes.provincialRegistrar,
    subject: userIds.provincialRegistrar,
    userType: TokenUserType.enum.user,
    role: TestUserRole.enum.PROVINCIAL_REGISTRAR
  },
  testAdmin: {
    scope: userScopes.testAdmin,
    subject: userIds.fieldAgent,
    userType: TokenUserType.enum.user,
    role: TestUserRole.enum.FIELD_AGENT
  }
} satisfies Record<
  string,
  {
    scope: string[]
    subject: UUID
    userType: TokenUserType
    role: TestUserRole
  }
>
