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
import styled from 'styled-components'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import { within, expect, waitFor } from '@storybook/test'
import { userEvent } from '@storybook/testing-library'
import {
  FieldType,
  TestUserRole,
  UserRoleField,
  UUID
} from '@opencrvs/commons/client'
import {
  FormFieldGenerator,
  FormFieldGeneratorPropsWithoutRef
} from '@client/v2-events/components/forms/FormFieldGenerator'
import { AppRouter, TRPCProvider } from '@client/v2-events/trpc'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { useUserFormState } from '@client/views/SysAdmin/Team/user/userEditor/UserEditor'
import { createTemporaryId } from '@client/v2-events/utils'
import { withValidatorContext } from '../../../../../.storybook/decorators'

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
  { id: TestUserRole.enum.FIELD_AGENT, scopes: [] },
  { id: 'POLICE_OFFICER', scopes: [] },
  { id: TestUserRole.enum.COMMUNITY_LEADER, scopes: [] },
  { id: 'HEALTHCARE_WORKER', scopes: [] },
  { id: TestUserRole.enum.REGISTRATION_AGENT, scopes: [] },
  { id: TestUserRole.enum.LOCAL_REGISTRAR, scopes: [] },
  { id: 'NATIONAL_REGISTRAR', scopes: [] }
]

const userRoleField = {
  id: 'storybook.userRole',
  type: FieldType.USER_ROLE,
  label: {
    id: 'storybook.userRole.label',
    defaultMessage: 'Role',
    description: 'The label for the user role select input'
  }
} satisfies UserRoleField

const StyledFormFieldGenerator = styled(FormFieldGenerator)`
  width: 400px;
`

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

const IBOMBO_DISTRICT_OFFICE_ID = '028d2c85-ca31-426d-b5d1-2cef545a4902' as UUID
const SULAKA_PROVINCIAL_OFFICE_ID =
  '2884f5b9-17b4-49ce-bf4d-f538228935df' as UUID

// A real (non-temporary) user ID to use as the subject in "edit user" stories.
// isTemporaryId checks for the 'tmp-' prefix; any stable UUID avoids the throw.
const SUBJECT_USER_ID = generator.user.registrationAgent().v2.id

const ibomboOfficeHierarchy: UUID[] = [
  CENTRAL_ADMIN_AREA_ID,
  IBOMBO_ADMIN_AREA_ID,
  IBOMBO_DISTRICT_OFFICE_ID
]

const sulakaOfficeHierarchy: UUID[] = [
  SULAKA_ADMIN_AREA_ID,
  SULAKA_PROVINCIAL_OFFICE_ID
]

const meta: Meta<FormFieldGeneratorPropsWithoutRef> = {
  title: 'Inputs/UserRole',
  parameters: {
    layout: 'centered',
    userRole: TestUserRole.enum.NATIONAL_SYSTEM_ADMIN,
    msw: {
      handlers: {
        userRole: [
          tRPCMsw.user.roles.list.query(() => mockRoles),
          tRPCMsw.locations.getLocationHierarchy.query(
            () => ibomboOfficeHierarchy
          )
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
  }
}

export default meta

type Story = StoryObj<FormFieldGeneratorPropsWithoutRef>

function RoleForm(args: FormFieldGeneratorPropsWithoutRef) {
  return (
    <StyledFormFieldGenerator
      {...args}
      fields={[userRoleField]}
      id="user-role-form"
    />
  )
}

async function openRoleDropdown(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  const combobox = await canvas.findByRole('combobox')
  await userEvent.click(combobox)
}

/**
 * NATIONAL_SYSTEM_ADMIN edits a user at Ibombo District Office.
 * NSA scope has no accessLevel filter — only the role whitelist applies.
 * POLICE_OFFICER and HEALTHCARE_WORKER are absent from NSA's user.edit role
 * list, so they are filtered out regardless of the subject's office location.
 */
export const RestrictedByEditScope: Story = {
  name: 'Role options restricted by user.edit scope',
  render: (args) => <RoleForm {...args} />,
  beforeEach: () => {
    useUserFormState.getState().setUserForm({
      id: SUBJECT_USER_ID,
      primaryOfficeId: IBOMBO_DISTRICT_OFFICE_ID
    })
  },
  play: async ({ canvasElement, step }) => {
    await openRoleDropdown(canvasElement)

    await step('Roles from the NSA user.edit whitelist appear', async () => {
      await waitFor(() => {
        expect(
          within(document.body).getByText('Field Agent')
        ).toBeInTheDocument()
        expect(
          within(document.body).getByText('Community Leader')
        ).toBeInTheDocument()
        expect(
          within(document.body).getByText('Registration Agent')
        ).toBeInTheDocument()
        expect(
          within(document.body).getByText('Local Registrar')
        ).toBeInTheDocument()
        expect(
          within(document.body).getByText('Registrar General')
        ).toBeInTheDocument()
      })
    })

    await step('Roles absent from the NSA whitelist are hidden', async () => {
      expect(within(document.body).queryByText('Police Officer')).toBeNull()
      expect(within(document.body).queryByText('Healthcare Worker')).toBeNull()
    })
  }
}

/**
 * LOCAL_SYSTEM_ADMIN whose jurisdiction covers Ibombo district edits a user
 * at Ibombo District Office — the subject's office IS inside the LSA's area.
 *
 * getLocationHierarchy returns [Central, Ibombo, IbomboDistrictOffice].
 * LSA's administrativeAreaId (Ibombo) appears in that chain → access granted.
 * Only roles present in both LSA's user.edit scope AND the system role list
 * are shown (COMMUNITY_LEADER and NATIONAL_REGISTRAR are outside LSA scope).
 */
export const LocalAdminOfficeInHierarchy: Story = {
  name: 'LSA: subject office inside jurisdiction — roles filtered by scope',
  parameters: {
    userRole: TestUserRole.enum.LOCAL_SYSTEM_ADMIN,
    msw: {
      handlers: {
        userRole: [
          tRPCMsw.user.roles.list.query(() => mockRoles),
          tRPCMsw.locations.getLocationHierarchy.query(
            () => ibomboOfficeHierarchy
          )
        ],
        user: [
          tRPCMsw.user.get.query(() => ({
            ...generator.user.localSystemAdmin().v2,
            administrativeAreaId: IBOMBO_ADMIN_AREA_ID
          }))
        ]
      }
    }
  },
  render: (args) => <RoleForm {...args} />,
  beforeEach: () => {
    useUserFormState.getState().setUserForm({
      id: SUBJECT_USER_ID,
      primaryOfficeId: IBOMBO_DISTRICT_OFFICE_ID
    })
  },
  play: async ({ canvasElement, step }) => {
    await openRoleDropdown(canvasElement)

    await step(
      'Roles in both LSA scope and the system role list appear',
      async () => {
        await waitFor(() => {
          expect(
            within(document.body).getByText('Field Agent')
          ).toBeInTheDocument()
          expect(
            within(document.body).getByText('Police Officer')
          ).toBeInTheDocument()
          expect(
            within(document.body).getByText('Healthcare Worker')
          ).toBeInTheDocument()
          expect(
            within(document.body).getByText('Registration Agent')
          ).toBeInTheDocument()
          expect(
            within(document.body).getByText('Local Registrar')
          ).toBeInTheDocument()
        })
      }
    )

    await step('Roles outside LSA scope are hidden', async () => {
      expect(within(document.body).queryByText('Community Leader')).toBeNull()
      expect(within(document.body).queryByText('Registrar General')).toBeNull()
    })
  }
}

/**
 * LOCAL_SYSTEM_ADMIN whose jurisdiction covers Ibombo district edits a user
 * at Sulaka Provincial Office — the subject's office is OUTSIDE the LSA's area.
 *
 * getLocationHierarchy returns [Sulaka, SulakaProvincialOffice].
 * LSA's administrativeAreaId (Ibombo) does NOT appear in that chain →
 * the accessLevel: 'administrativeArea' check fails for every role →
 * the dropdown is empty.
 */
export const LocalAdminOfficeOutsideHierarchy: Story = {
  name: 'LSA: subject office outside jurisdiction — dropdown is empty',
  parameters: {
    userRole: TestUserRole.enum.LOCAL_SYSTEM_ADMIN,
    msw: {
      handlers: {
        userRole: [
          tRPCMsw.user.roles.list.query(() => mockRoles),
          tRPCMsw.locations.getLocationHierarchy.query(
            () => sulakaOfficeHierarchy
          )
        ],
        user: [
          tRPCMsw.user.get.query(() => ({
            ...generator.user.localSystemAdmin().v2,
            administrativeAreaId: IBOMBO_ADMIN_AREA_ID
          }))
        ]
      }
    }
  },
  render: (args) => <RoleForm {...args} />,
  beforeEach: () => {
    useUserFormState.getState().setUserForm({
      id: SUBJECT_USER_ID,
      primaryOfficeId: SULAKA_PROVINCIAL_OFFICE_ID
    })
  },
  play: async ({ canvasElement, step }) => {
    await openRoleDropdown(canvasElement)

    await step(
      'No roles shown — subject office is outside LSA jurisdiction',
      async () => {
        await waitFor(() => {
          expect(within(document.body).queryByText('Field Agent')).toBeNull()
          expect(
            within(document.body).queryByText('Registration Agent')
          ).toBeNull()
        })
      }
    )
  }
}

/**
 * LOCAL_SYSTEM_ADMIN creating a NEW user (isTemporaryId = true) at Sulaka
 * Provincial Office — outside the LSA's Ibombo jurisdiction.
 *
 * Because isNewUser = true, the component uses 'user.create' scope instead of
 * 'user.edit'. LSA's user.create scope has no accessLevel restriction, so the
 * administrative-area check is skipped entirely. All roles in the create-scope
 * whitelist that exist in the system role list appear, regardless of location.
 */
export const LocalAdminNewUserOutsideHierarchy: Story = {
  name: 'LSA: new user outside jurisdiction — user.create bypasses location check',
  parameters: {
    userRole: TestUserRole.enum.LOCAL_SYSTEM_ADMIN,
    msw: {
      handlers: {
        userRole: [
          tRPCMsw.user.roles.list.query(() => mockRoles),
          tRPCMsw.locations.getLocationHierarchy.query(
            () => sulakaOfficeHierarchy
          )
        ],
        user: [
          tRPCMsw.user.get.query(() => ({
            ...generator.user.localSystemAdmin().v2,
            administrativeAreaId: IBOMBO_ADMIN_AREA_ID
          }))
        ]
      }
    }
  },
  render: (args) => <RoleForm {...args} />,
  beforeEach: () => {
    useUserFormState.getState().setUserForm({
      id: createTemporaryId(),
      primaryOfficeId: SULAKA_PROVINCIAL_OFFICE_ID
    })
  },
  play: async ({ canvasElement, step }) => {
    await openRoleDropdown(canvasElement)

    await step(
      'Roles appear despite office being outside jurisdiction (user.create has no location filter)',
      async () => {
        await waitFor(() => {
          expect(
            within(document.body).getByText('Field Agent')
          ).toBeInTheDocument()
          expect(
            within(document.body).getByText('Police Officer')
          ).toBeInTheDocument()
          expect(
            within(document.body).getByText('Healthcare Worker')
          ).toBeInTheDocument()
          expect(
            within(document.body).getByText('Registration Agent')
          ).toBeInTheDocument()
          expect(
            within(document.body).getByText('Local Registrar')
          ).toBeInTheDocument()
        })
      }
    )
  }
}
