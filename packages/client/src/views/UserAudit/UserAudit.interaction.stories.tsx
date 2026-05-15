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
import { expect, userEvent, waitFor, within } from '@storybook/test'
import { TRPCError } from '@trpc/server'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import { TestUserRole } from '@opencrvs/commons/client'
import { AppRouter } from '@client/v2-events/trpc'
import { ROUTES } from '@client/v2-events/routes/routes'
import { routesConfig } from '@client/v2-events/routes/config'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { UserAudit } from './UserAudit'

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: '/api/events' })],
  transformer: { input: superjson, output: superjson }
})

const generator = testDataGenerator()
const kennedy = generator.user.localRegistrar().v2

const HEADER_MENU_WRAPPER_ID = 'sub-page-header-munu-button-dropdownMenu'
const HEADER_MENU_POPOVER_ID = 'sub-page-header-munu-button-Dropdown-Content'

async function openHeaderMenu(canvasElement: HTMLElement) {
  const wrapper = canvasElement.querySelector<HTMLElement>(
    `#${HEADER_MENU_WRAPPER_ID}`
  )
  const trigger = wrapper?.querySelector<HTMLButtonElement>(
    `[popovertarget="${HEADER_MENU_POPOVER_ID}"]`
  )
  if (!trigger) {
    throw new Error('UserAudit header menu trigger not found')
  }
  await userEvent.click(trigger)

  const popover = document.getElementById(HEADER_MENU_POPOVER_ID)
  if (!popover) {
    throw new Error('UserAudit header menu popover not found')
  }
  return popover
}

const meta: Meta<typeof UserAudit> = {
  title: 'UserAudit/Interaction',
  parameters: {
    userRole: TestUserRole.enum.NATIONAL_SYSTEM_ADMIN,
    chromatic: { disableSnapshot: true },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.SETTINGS.USER.VIEW.buildPath({
        userId: kennedy.id
      })
    }
  }
}

export default meta
type Story = StoryObj<typeof UserAudit>

/**
 * Regression test for: deactivating an active user from the audit page must
 * open the UserActivationModal and the success toast must surface after
 * a successful user.update mutation.
 */
export const DeactivateActiveUserShowsSuccessToast: Story = {
  parameters: {
    msw: {
      handlers: {
        userUpdate: [
          tRPCMsw.user.get.query(() => kennedy),
          tRPCMsw.user.update.mutation((input) => {
            Object.assign(kennedy, input)
            return kennedy
          })
        ]
      }
    }
  },
  beforeEach: () => {
    kennedy.status = 'active'
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Wait for user audit page to load', async () => {
      await canvas.findByText('Kennedy Mweene')
    })

    await step('Open header menu and click Deactivate', async () => {
      const popover = await openHeaderMenu(canvasElement)
      await userEvent.click(within(popover).getByText('Deactivate'))
    })

    await step('UserActivationModal is shown', async () => {
      await canvas.findByText('Deactivate Kennedy Mweene?')
      await canvas.findByText(
        'This will revoke Kennedy Mweene’s ability to login and access the system. The account can be reactivated at a later date.'
      )
    })

    await step('Confirm deactivation', async () => {
      await userEvent.click(
        await canvas.findByRole('button', { name: 'Deactivate' })
      )
    })

    await step('Success toast surfaces', async () => {
      await waitFor(() =>
        expect(
          document.getElementById('activation_toggle_success')
        ).not.toBeNull()
      )
      expect(
        document.getElementById('activation_toggle_success')?.textContent
      ).toMatch(/Updated Kennedy Mweene.s account status to "Active"/)
    })
  }
}

/**
 * Regression test for: when the user.update mutation fails, the audit page
 * must surface the error toast wired up via UserActivationModal's onError.
 */
export const DeactivateActiveUserShowsErrorToast: Story = {
  parameters: {
    msw: {
      handlers: {
        userUpdate: [
          tRPCMsw.user.get.query(() => kennedy),
          tRPCMsw.user.update.mutation(() => {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
          })
        ]
      }
    }
  },
  beforeEach: () => {
    kennedy.status = 'active'
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Wait for user audit page to load', async () => {
      await canvas.findByText('Kennedy Mweene')
    })

    await step('Open header menu and click Deactivate', async () => {
      const popover = await openHeaderMenu(canvasElement)
      await userEvent.click(within(popover).getByText('Deactivate'))
    })

    await step('Confirm deactivation', async () => {
      await userEvent.click(
        within(document.getElementById('deactivate-user-modal')!).getByRole(
          'button',
          { name: 'Deactivate' }
        )
      )
    })

    await step('Modal closes after onError', async () => {
      await waitFor(
        () =>
          expect(document.getElementById('deactivate-user-modal')).toBeNull(),
        { timeout: 5000 }
      )
    })

    await step('Error toast surfaces', async () => {
      await waitFor(
        () =>
          expect(
            document.getElementById('activation_toggle_error')
          ).not.toBeNull(),
        { timeout: 5000 }
      )
      expect(
        document.getElementById('activation_toggle_error')?.textContent
      ).toMatch(
        /Failed to update Kennedy Mweene.s account status to "Deactivated"/
      )
    })
  }
}
