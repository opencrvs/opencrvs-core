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
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import {
  TestUserRole,
  User,
  V2_DEFAULT_MOCK_LOCATIONS
} from '@opencrvs/commons/client'
import { AppRouter } from '@client/v2-events/trpc'
import { routesConfig } from '@client/v2-events/routes'
import * as V1_LEGACY_ROUTES from '@client/navigation/routes'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { TeamPage } from './Team'

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: '/api/events' })],
  transformer: { input: superjson, output: superjson }
})

const generator = testDataGenerator()
const officeId = V2_DEFAULT_MOCK_LOCATIONS.find(
  (location) => location.name === 'Ibombo District Office'
)?.id
const localSystemAdmin = generator.user.localSystemAdmin().v2

const usersWithEachStatus: User[] = [
  { ...generator.user.localRegistrar().v2, status: 'active' },
  { ...generator.user.registrationAgent().v2, status: 'deactivated' },
  { ...generator.user.fieldAgent().v2, status: 'pending' },
  { ...localSystemAdmin, status: 'active' }
]

const mockRoles = [
  { id: TestUserRole.enum.LOCAL_REGISTRAR, scopes: [] },
  { id: TestUserRole.enum.REGISTRATION_AGENT, scopes: [] },
  { id: TestUserRole.enum.FIELD_AGENT, scopes: [] },
  { id: TestUserRole.enum.LOCAL_SYSTEM_ADMIN, scopes: [] }
]

/** Returns the number of lines that the text of an element takes. */
function countLines(element: Element) {
  const range = document.createRange()
  range.selectNodeContents(element)
  return range.getClientRects().length
}

const meta: Meta<typeof TeamPage> = {
  title: 'Team/StatusColumn',
  parameters: {
    userRole: TestUserRole.enum.LOCAL_SYSTEM_ADMIN,
    chromatic: { disableSnapshot: true },
    msw: {
      handlers: {
        user: [
          tRPCMsw.user.search.query(() => usersWithEachStatus),
          tRPCMsw.user.get.query(
            (id) =>
              usersWithEachStatus.find((user) => user.id === id) ??
              localSystemAdmin
          ),
          tRPCMsw.user.roles.list.query(() => mockRoles)
        ]
      }
    },
    reactRouter: {
      router: routesConfig,
      initialPath: V1_LEGACY_ROUTES.TEAM_USER_LIST + `?locationId=${officeId}`
    }
  }
}

export default meta
type Story = StoryObj<typeof TeamPage>

/**
 * The status pill and the menu of a user share the actions column. Some rows
 * have no menu, for example the row of the user who is signed in.
 */
export const StatusPillsLineUp: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Wait for user list to load', async () => {
      await canvas.findAllByRole('row')
      await canvas.findByText('Deactivated')
    })

    const userList = within(
      canvasElement.querySelector<HTMLElement>('#user_list') ?? canvasElement
    )
    const pills = ['Active', 'Deactivated', 'Pending'].flatMap((status) =>
      userList.getAllByText(status)
    )
    const menus = Array.from(
      canvasElement.querySelectorAll('#user_list button[popovertarget]')
    )
    const actionCells = Array.from(
      canvasElement.querySelectorAll<HTMLElement>(
        '#user_list td[data-testid$="-actions"]'
      )
    )

    await step('Some rows have a menu and some rows do not', async () => {
      await expect(pills).toHaveLength(usersWithEachStatus.length)
      await expect(menus.length).toBeGreaterThan(0)
      await expect(menus.length).toBeLessThan(usersWithEachStatus.length)
    })

    await step('Each pill shows its label on one line', async () => {
      for (const pill of pills) {
        await expect({ [pill.textContent]: countLines(pill) }).toEqual({
          [pill.textContent]: 1
        })
      }
    })
  }
}
