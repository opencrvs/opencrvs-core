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

import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import { within, expect, waitFor, userEvent } from '@storybook/test'
import { TestUserRole, UUID } from '@opencrvs/commons/client'
import { FormFieldGeneratorPropsWithoutRef } from '@client/v2-events/components/forms/FormFieldGenerator'
import { AppRouter, TRPCProvider } from '@client/v2-events/trpc'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { ROUTES } from '@client/v2-events/routes/routes'
import { routesConfig } from '@client/v2-events/routes/config'
import { withValidatorContext } from '../../../../../../.storybook/decorators'
import { useUserFormState } from './useUserFormState'

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: '/api/events' })],
  transformer: { input: superjson, output: superjson }
})

const generator = testDataGenerator()

// Mix of roles the requesting user can edit and roles outside their scope.
// NATIONAL_SYSTEM_ADMIN's user.edit scope omits POLICE_OFFICER and
// HEALTHCARE_WORKER, so those rows are filtered out by
// getAvailableRolesForUserUpdatePayload before reaching the dropdown.
const mockRoles = [
  { id: TestUserRole.enum.FIELD_AGENT, scopes: [] }, // Field Agent
  { id: TestUserRole.enum.COMMUNITY_LEADER, scopes: [] }, // Community Leader
  { id: TestUserRole.enum.REGISTRATION_AGENT, scopes: [] }, // Registration Agent
  { id: TestUserRole.enum.LOCAL_REGISTRAR, scopes: [] }, // Local Registrar
  { id: TestUserRole.enum.PROVINCIAL_REGISTRAR, scopes: [] }, // Provincial Registrar
  { id: TestUserRole.enum.LOCAL_SYSTEM_ADMIN, scopes: [] }, // Administrator
  { id: 'POLICE_OFFICER', scopes: [] }, // Police Officer
  { id: 'HEALTHCARE_WORKER', scopes: [] } // Healthcare Worker
]

type RoleLabel =
  | 'Field Agent'
  | 'Community Leader'
  | 'Registration Agent'
  | 'Local Registrar'
  | 'Provincial Registrar'
  | 'Administrator'
  | 'Police Officer'
  | 'Healthcare Worker'
  | 'Unknown'

const AllRoles: RoleLabel[] = [
  'Field Agent',
  'Community Leader',
  'Registration Agent',
  'Local Registrar',
  'Provincial Registrar',
  'Administrator',
  'Police Officer',
  'Healthcare Worker',
  'Unknown'
]

/*
 * Administrative area IDs (from V2_DEFAULT_MOCK_ADMINISTRATIVE_AREAS):
 *   Central (a45b982a) — root province
 *     Ibombo (62a0ccb4) — district under Central
 *   Sulaka (c599b691) — separate root province
 *     Ilanga (8fbd09d2) — district under Sulaka
 *
 * Location IDs (from V2_DEFAULT_MOCK_LOCATIONS):
 *   Ibombo District Office  (028d2c85) — in Ibombo district
 *   Sulaka Provincial Office (2884f5b9) — in Sulaka province
 *
 * getLocationHierarchy returns the full chain from root admin area down to
 * the location itself, e.g. for Ibombo District Office:
 *   [Central, Ibombo, IbomboDistrictOffice]
 */
const CENTRAL_ADMIN_AREA_ID = 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c' as UUID
const IBOMBO_ADMIN_AREA_ID = '62a0ccb4-880d-4f30-8882-f256007dfff9' as UUID
const SULAKA_ADMIN_AREA_ID = 'c599b691-fd2d-45e1-abf4-d185de727fb5' as UUID
const KLOW_ADMIN_AREA_ID = '1d4e5f6a-7b8c-4912-8efa-345678901234' as UUID

const IBOMBO_DISTRICT_OFFICE_ID = '028d2c85-ca31-426d-b5d1-2cef545a4902' as UUID
const SULAKA_PROVINCIAL_OFFICE_ID =
  '2884f5b9-17b4-49ce-bf4d-f538228935df' as UUID
const KLOW_VILLAGE_OFFICE_ID = '1f4a5b6c-7d8e-4312-8abc-345678901234' as UUID

// A real (non-temporary) user ID to use as the subject in "edit user" stories.
// isTemporaryId checks for the 'tmp-' prefix; any stable UUID avoids the throw.
const RegistrationAgentId = generator.user.registrationAgent().v2.id

const ibomboOfficeHierarchy: UUID[] = [
  CENTRAL_ADMIN_AREA_ID,
  IBOMBO_ADMIN_AREA_ID
]

const klowOfficeHierarchy: UUID[] = [
  CENTRAL_ADMIN_AREA_ID,
  IBOMBO_ADMIN_AREA_ID,
  KLOW_ADMIN_AREA_ID
]

const sulakaOfficeHierarchy: UUID[] = [
  SULAKA_ADMIN_AREA_ID,
  SULAKA_PROVINCIAL_OFFICE_ID
]

/**
 * user.create:
 *  - roles from accessLevel = 'location': COMMUNITY_LEADER
 *  - roles from accessLevel = 'administrativeArea': LOCAL_REGISTRAR
 *  - roles without accessLevel restriction : FIELD_AGENT
 *
 * user.edit:
 *  - roles from accessLevel = 'location': PROVINCIAL_REGISTRAR
 *  - roles from accessLevel = 'administrativeArea': LOCAL_SYSTEM_ADMIN
 *  - roles without accessLevel restriction : REGISTRATION_AGENT
 */

const meta: Meta<FormFieldGeneratorPropsWithoutRef> = {
  title: 'SysAdmin/UserEditor/RoleOptions',
  parameters: {
    layout: 'centered',
    userRole: TestUserRole.enum.NATIONAL_SYSTEM_ADMIN,
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.SETTINGS.USER.EDIT.buildPath({
        userId: RegistrationAgentId,
        pageId: 'user.details'
      })
    },
    msw: {
      handlers: {
        userRole: [
          tRPCMsw.user.roles.list.query(() => mockRoles),
          tRPCMsw.locations.getLocationHierarchy.query((input) => {
            if (input.locationId === IBOMBO_DISTRICT_OFFICE_ID) {
              return ibomboOfficeHierarchy
            }
            if (input.locationId === KLOW_VILLAGE_OFFICE_ID) {
              return klowOfficeHierarchy
            }
            if (input.locationId === SULAKA_PROVINCIAL_OFFICE_ID) {
              return sulakaOfficeHierarchy
            }
            return []
          })
        ]
      }
    }
  },
  decorators: [
    (Story, context) => (
      <TRPCProvider>
        <Story {...context} />
      </TRPCProvider>
    ),
    withValidatorContext
  ],
  beforeEach: () => {
    useUserFormState.getState().clear()
    window.localStorage.setItem('opencrvs', generator.user.token.testAdmin)
  }
}

export default meta

type Story = StoryObj<FormFieldGeneratorPropsWithoutRef>

async function openRoleDropdown(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  const combobox = await canvas.findByRole('combobox')
  await userEvent.click(combobox)
}

/**
 * For same office, it is allowed to edit roles to
 *  - roles from accessLevel = 'location': PROVINCIAL_REGISTRAR
 *  - roles from accessLevel = 'administrativeArea': LOCAL_SYSTEM_ADMIN
 *  - roles without accessLevel restriction : REGISTRATION_AGENT
 */

export const EditUserOfOffice: Story = {
  name: 'user.edit for same office',
  beforeEach: () => {
    useUserFormState.getState().setUserForm({
      primaryOfficeId: IBOMBO_DISTRICT_OFFICE_ID
    })
  },
  play: async ({ canvasElement, step }) => {
    await openRoleDropdown(canvasElement)

    const visibleRoles: RoleLabel[] = [
      'Registration Agent',
      'Provincial Registrar',
      'Administrator'
    ]

    for (const role of AllRoles) {
      if (visibleRoles.includes(role)) {
        await step(`${role} is visible`, async () => {
          await waitFor(() => {
            expect(within(document.body).getByText(role)).toBeInTheDocument()
          })
        })
      } else {
        await step(`${role} is not visible`, async () => {
          await waitFor(() => {
            expect(within(document.body).queryByText(role)).toBeNull()
          })
        })
      }
    }
  }
}

/**
 * For office in the same administrative area, it is allowed to edit roles to
 *  - roles from accessLevel = 'administrativeArea': LOCAL_SYSTEM_ADMIN
 *  - roles without accessLevel restriction : REGISTRATION_AGENT
 */

export const EditUserOfLowerOffice: Story = {
  name: 'user.edit for lower office',
  beforeEach: () => {
    useUserFormState.getState().setUserForm({
      primaryOfficeId: KLOW_VILLAGE_OFFICE_ID
    })
  },
  play: async ({ canvasElement, step }) => {
    await openRoleDropdown(canvasElement)

    const visibleRoles: RoleLabel[] = ['Registration Agent', 'Administrator']

    for (const role of AllRoles) {
      if (visibleRoles.includes(role)) {
        await step(`${role} is visible`, async () => {
          await waitFor(() => {
            expect(within(document.body).getByText(role)).toBeInTheDocument()
          })
        })
      } else {
        await step(`${role} is not visible`, async () => {
          await waitFor(() => {
            expect(within(document.body).queryByText(role)).toBeNull()
          })
        })
      }
    }
  }
}

/**
 * For office in a different administrative area, it is allowed to edit roles to
 *  - roles without accessLevel restriction : REGISTRATION_AGENT
 */

export const EditUserOfDifferentAdminArea: Story = {
  name: 'user.edit for different Admin Area',
  beforeEach: () => {
    useUserFormState.getState().setUserForm({
      primaryOfficeId: SULAKA_PROVINCIAL_OFFICE_ID
    })
  },
  play: async ({ canvasElement, step }) => {
    await openRoleDropdown(canvasElement)

    const visibleRoles: RoleLabel[] = ['Registration Agent']

    for (const role of AllRoles) {
      if (visibleRoles.includes(role)) {
        await step(`${role} is visible`, async () => {
          await waitFor(() => {
            expect(within(document.body).getByText(role)).toBeInTheDocument()
          })
        })
      } else {
        await step(`${role} is not visible`, async () => {
          await waitFor(() => {
            expect(within(document.body).queryByText(role)).toBeNull()
          })
        })
      }
    }
  }
}

/**
 * For same office, it is allowed to create roles to
 *  - roles from accessLevel = 'location': COMMUNITY_LEADER
 *  - roles from accessLevel = 'administrativeArea': LOCAL_REGISTRAR
 *  - roles without accessLevel restriction : FIELD_AGENT
 */

export const CreateUserOfOffice: Story = {
  name: 'user.create for same office',
  parameters: {
    userRole: TestUserRole.enum.NATIONAL_SYSTEM_ADMIN,
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.SETTINGS.USER.EDIT.buildPath({
        userId: `tmp-${RegistrationAgentId}` as UUID,
        pageId: 'user.details'
      })
    },
    msw: {
      handlers: {
        userRole: [
          tRPCMsw.user.roles.list.query(() => mockRoles),
          tRPCMsw.locations.getLocationHierarchy.query((input) => {
            if (input.locationId === IBOMBO_DISTRICT_OFFICE_ID) {
              return ibomboOfficeHierarchy
            }
            if (input.locationId === KLOW_VILLAGE_OFFICE_ID) {
              return klowOfficeHierarchy
            }
            if (input.locationId === SULAKA_PROVINCIAL_OFFICE_ID) {
              return sulakaOfficeHierarchy
            }
            return []
          })
        ]
      }
    }
  },
  beforeEach: () => {
    useUserFormState.getState().setUserForm({
      primaryOfficeId: IBOMBO_DISTRICT_OFFICE_ID
    })
  },
  play: async ({ canvasElement, step }) => {
    await openRoleDropdown(canvasElement)

    const visibleRoles: RoleLabel[] = [
      'Field Agent',
      'Local Registrar',
      'Community Leader'
    ]

    for (const role of AllRoles) {
      if (visibleRoles.includes(role)) {
        await step(`${role} is visible`, async () => {
          await waitFor(() => {
            expect(within(document.body).getByText(role)).toBeInTheDocument()
          })
        })
      } else {
        await step(`${role} is not visible`, async () => {
          await waitFor(() => {
            expect(within(document.body).queryByText(role)).toBeNull()
          })
        })
      }
    }
  }
}

/**
 * For office in the same administrative area, it is allowed to create roles to
 *  - roles from accessLevel = 'administrativeArea': LOCAL_REGISTRAR
 *  - roles without accessLevel restriction : FIELD_AGENT
 */

export const CreateUserOfLowerOffice: Story = {
  name: 'user.create for lower office',
  parameters: {
    userRole: TestUserRole.enum.NATIONAL_SYSTEM_ADMIN,
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.SETTINGS.USER.EDIT.buildPath({
        userId: `tmp-${RegistrationAgentId}` as UUID,
        pageId: 'user.details'
      })
    },
    msw: {
      handlers: {
        userRole: [
          tRPCMsw.user.roles.list.query(() => mockRoles),
          tRPCMsw.locations.getLocationHierarchy.query((input) => {
            if (input.locationId === IBOMBO_DISTRICT_OFFICE_ID) {
              return ibomboOfficeHierarchy
            }
            if (input.locationId === KLOW_VILLAGE_OFFICE_ID) {
              return klowOfficeHierarchy
            }
            if (input.locationId === SULAKA_PROVINCIAL_OFFICE_ID) {
              return sulakaOfficeHierarchy
            }
            return []
          })
        ]
      }
    }
  },
  beforeEach: () => {
    useUserFormState.getState().setUserForm({
      primaryOfficeId: KLOW_VILLAGE_OFFICE_ID
    })
  },
  play: async ({ canvasElement, step }) => {
    await openRoleDropdown(canvasElement)

    const visibleRoles: RoleLabel[] = ['Field Agent', 'Local Registrar']

    for (const role of AllRoles) {
      if (visibleRoles.includes(role)) {
        await step(`${role} is visible`, async () => {
          await waitFor(() => {
            expect(within(document.body).getByText(role)).toBeInTheDocument()
          })
        })
      } else {
        await step(`${role} is not visible`, async () => {
          await waitFor(() => {
            expect(within(document.body).queryByText(role)).toBeNull()
          })
        })
      }
    }
  }
}

/**
 * For office in a different administrative area, it is allowed to create roles to
 *  - roles without accessLevel restriction : FIELD_AGENT
 */

export const CreateUserOfDifferentAdminArea: Story = {
  name: 'user.create for different Admin Area',
  parameters: {
    userRole: TestUserRole.enum.NATIONAL_SYSTEM_ADMIN,
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.SETTINGS.USER.EDIT.buildPath({
        userId: `tmp-${RegistrationAgentId}` as UUID,
        pageId: 'user.details'
      })
    },
    msw: {
      handlers: {
        userRole: [
          tRPCMsw.user.roles.list.query(() => mockRoles),
          tRPCMsw.locations.getLocationHierarchy.query((input) => {
            if (input.locationId === IBOMBO_DISTRICT_OFFICE_ID) {
              return ibomboOfficeHierarchy
            }
            if (input.locationId === KLOW_VILLAGE_OFFICE_ID) {
              return klowOfficeHierarchy
            }
            if (input.locationId === SULAKA_PROVINCIAL_OFFICE_ID) {
              return sulakaOfficeHierarchy
            }
            return []
          })
        ]
      }
    }
  },
  beforeEach: () => {
    useUserFormState.getState().setUserForm({
      primaryOfficeId: SULAKA_PROVINCIAL_OFFICE_ID
    })
  },
  play: async ({ canvasElement, step }) => {
    await openRoleDropdown(canvasElement)

    const visibleRoles: RoleLabel[] = ['Field Agent']

    for (const role of AllRoles) {
      if (visibleRoles.includes(role)) {
        await step(`${role} is visible`, async () => {
          await waitFor(() => {
            expect(within(document.body).getByText(role)).toBeInTheDocument()
          })
        })
      } else {
        await step(`${role} is not visible`, async () => {
          await waitFor(() => {
            expect(within(document.body).queryByText(role)).toBeNull()
          })
        })
      }
    }
  }
}
