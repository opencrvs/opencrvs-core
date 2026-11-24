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
import { userEvent, within } from '@storybook/test'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import { TestUserRole } from '@opencrvs/commons/client'
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
const felix = generator.user.registrationAgent().v2
const kennedy = generator.user.localRegistrar().v2

const mockRoles = [
  { id: TestUserRole.enum.REGISTRATION_AGENT, scopes: [] },
  { id: TestUserRole.enum.LOCAL_REGISTRAR, scopes: [] }
]

/**
 * Find the ToggleMenu trigger button in the row containing the given user name.
 * Each user occupies its own <table>; the trigger is the only <button> with a
 * `popovertarget` attribute in that row.
 */
function findMenuTriggerForUser(
  container: HTMLElement,
  userName: string
): HTMLButtonElement {
  const profileLinks = Array.from(
    container.querySelectorAll<HTMLButtonElement>('#profile-link')
  )
  const nameCell = profileLinks.find(
    (el) => el.textContent?.trim() === userName
  )
  if (!nameCell) {
    throw new Error(`User row not found for: ${userName}`)
  }
  const row = nameCell.closest('tr')
  if (!row) {
    throw new Error(`Table row not found for: ${userName}`)
  }
  const trigger = row.querySelector<HTMLButtonElement>('button[popovertarget]')
  if (!trigger) {
    throw new Error(`Menu trigger not found in row for: ${userName}`)
  }
  return trigger
}

const meta: Meta<typeof TeamPage> = {
  title: 'Team/Interaction',
  parameters: {
    userRole: TestUserRole.enum.NATIONAL_SYSTEM_ADMIN,
    chromatic: { disableSnapshot: true },
    msw: {
      handlers: {
        user: [
          tRPCMsw.user.search.query(() => [felix, kennedy]),
          tRPCMsw.user.get.query((id) => (id === kennedy.id ? kennedy : felix)),
          tRPCMsw.user.roles.list.query(() => mockRoles),
          tRPCMsw.user.update.mutation((input) => {
            if (input.id === kennedy.id) {
              Object.assign(kennedy, input)
              return kennedy
            } else {
              Object.assign(felix, input)
              return felix
            }
          })
        ]
      }
    },
    reactRouter: {
      router: routesConfig,
      initialPath:
        V1_LEGACY_ROUTES.TEAM_USER_LIST + `?locationId=${felix.primaryOfficeId}`
    }
  }
}

export default meta
type Story = StoryObj<typeof TeamPage>

export const CancelDiscardsEdits: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Wait for user list to load', async () => {
      await canvas.findByText('Felix Katongo', { selector: '#profile-link' })
      await canvas.findByText('Kennedy Mweene', { selector: '#profile-link' })
    })

    await step(
      "Open Kennedy's action menu and click Edit details",
      async () => {
        const trigger = findMenuTriggerForUser(canvasElement, 'Kennedy Mweene')
        await userEvent.click(trigger)

        const popoverId = trigger.getAttribute('popovertarget')
        const popover = popoverId ? document.getElementById(popoverId) : null
        if (!popover) {
          throw new Error('Kennedy menu popover not found')
        }
        await userEvent.click(within(popover).getByText('Edit details'))
      }
    )

    await step('Wait for review page to load', async () => {
      await canvas.findByText('Kennedy Mweene', {
        selector: '[data-testid="row-value-name"]',
        exact: false
      })
    })

    await step('Click Edit on the email field', async () => {
      await userEvent.click(await canvas.findByTestId('change-button-email'))
    })

    await step('Modify the email field', async () => {
      const emailInput = await canvas.findAllByTestId('text__email')
      await userEvent.clear(emailInput[0])
      await userEvent.type(emailInput[0], 'modified@example.com')
      await userEvent.click(document.body)
    })

    await step('Modify the staff ID', async () => {
      const staffIdInput = await canvas.findAllByTestId('text__user____staffId')
      await userEvent.clear(staffIdInput[0])
      await userEvent.type(staffIdInput[0], 'modified-staff-id')
      await userEvent.click(document.body)
    })

    await step('Go to review page', async () => {
      await userEvent.click(await canvas.findByText('Continue'))
    })

    await step('Cancel (go back to review)', async () => {
      const backButton = await canvas.findByTestId('crcl-btn')
      await userEvent.click(backButton)
    })

    await step(
      "Open Kennedy's action menu and click Edit details",
      async () => {
        const trigger = findMenuTriggerForUser(canvasElement, 'Kennedy Mweene')
        await userEvent.click(trigger)

        const popoverId = trigger.getAttribute('popovertarget')
        const popover = popoverId ? document.getElementById(popoverId) : null
        if (!popover) {
          throw new Error('Kennedy menu popover not found')
        }
        await userEvent.click(within(popover).getByText('Edit details'))
      }
    )

    await step(
      'Verify email was not persisted (shows original value)',
      async () => {
        await canvas.findByText('kalushabwalya1.7@gmail.com', {
          selector: '[data-testid="row-value-email"]',
          exact: false
        })
        const backButton = await canvas.findByTestId('crcl-btn')
        await userEvent.click(backButton)
      }
    )
  }
}

export const Navigation: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Wait for user list to load', async () => {
      await canvas.findByText('Felix Katongo', { selector: '#profile-link' })
      await canvas.findByText('Kennedy Mweene', { selector: '#profile-link' })
    })

    await step("Open Felix's action menu and click Edit details", async () => {
      const trigger = findMenuTriggerForUser(canvasElement, 'Felix Katongo')
      await userEvent.click(trigger)

      const popoverId = trigger.getAttribute('popovertarget')
      const popover = popoverId ? document.getElementById(popoverId) : null
      if (!popover) {
        throw new Error('Felix menu popover not found')
      }
      await userEvent.click(within(popover).getByText('Edit details'))
    })

    await step("Verify Felix's review page is shown", async () => {
      await canvas.findByText('Felix Katongo', {
        selector: '[data-testid="row-value-name"]',
        exact: false
      })
    })

    await step('Go back to user list', async () => {
      const backButton = await canvas.findByTestId('crcl-btn')
      await userEvent.click(backButton)
    })

    await step(
      "Open Kennedy's action menu and click Edit details",
      async () => {
        const trigger = findMenuTriggerForUser(canvasElement, 'Kennedy Mweene')
        await userEvent.click(trigger)

        const popoverId = trigger.getAttribute('popovertarget')
        const popover = popoverId ? document.getElementById(popoverId) : null
        if (!popover) {
          throw new Error('Kennedy menu popover not found')
        }
        await userEvent.click(within(popover).getByText('Edit details'))
      }
    )

    await step("Verify Kennedy's review page is shown", async () => {
      await canvas.findByText('Kennedy Mweene', {
        selector: '[data-testid="row-value-name"]',
        exact: false
      })
      const backButton = await canvas.findByTestId('crcl-btn')
      await userEvent.click(backButton)
    })
  }
}
export const SendUsernameReminder: Story = {
  parameters: {
    msw: {
      handlers: {
        user: [
          tRPCMsw.user.search.query(() => [felix, kennedy]),
          tRPCMsw.user.get.query((id) => (id === kennedy.id ? kennedy : felix)),
          tRPCMsw.user.roles.list.query(() => mockRoles),
          tRPCMsw.user.sendUsernameReminder.mutation(() => undefined)
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Wait for user list to load', async () => {
      await canvas.findByText('Felix Katongo', { selector: '#profile-link' })
      await canvas.findByText('Kennedy Mweene', { selector: '#profile-link' })
    })
    await step(
      "Open Kennedy's action menu and click Send username reminder",
      async () => {
        const trigger = findMenuTriggerForUser(canvasElement, 'Kennedy Mweene')
        await userEvent.click(trigger)

        const popoverId = trigger.getAttribute('popovertarget')
        const popover = popoverId ? document.getElementById(popoverId) : null
        if (!popover) {
          throw new Error('Kennedy menu popover not found')
        }
        await userEvent.click(
          within(popover).getByText('Send username reminder')
        )
      }
    )

    await step('Verify confirmation modal is shown', async () => {
      await canvas.findByText('Send username reminder?')
    })

    await step('Confirm send', async () => {
      await userEvent.click(await canvas.findByRole('button', { name: 'Send' }))
    })

    await step('Verify success toast is shown', async () => {
      await canvas.findByText('Username reminder sent to Kennedy Mweene')
    })
  }
}

export const SendResetPasswordInvite: Story = {
  parameters: {
    msw: {
      handlers: {
        user: [
          tRPCMsw.user.search.query(() => [felix, kennedy]),
          tRPCMsw.user.get.query((id) => (id === kennedy.id ? kennedy : felix)),
          tRPCMsw.user.roles.list.query(() => mockRoles),
          tRPCMsw.user.sendResetPasswordInvite.mutation(() => undefined)
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Wait for user list to load', async () => {
      await canvas.findByText('Felix Katongo', { selector: '#profile-link' })
      await canvas.findByText('Kennedy Mweene', { selector: '#profile-link' })
    })

    await step(
      "Open Kennedy's action menu and click Reset Password",
      async () => {
        const trigger = findMenuTriggerForUser(canvasElement, 'Kennedy Mweene')
        await userEvent.click(trigger)

        const popoverId = trigger.getAttribute('popovertarget')
        const popover = popoverId ? document.getElementById(popoverId) : null
        if (!popover) {
          throw new Error('Kennedy menu popover not found')
        }
        await userEvent.click(within(popover).getByText('Reset Password'))
      }
    )

    await step('Verify confirmation modal is shown', async () => {
      await canvas.findByText('Reset password?')
    })

    await step('Confirm send', async () => {
      await userEvent.click(await canvas.findByRole('button', { name: 'Send' }))
    })

    await step('Verify success toast is shown', async () => {
      await canvas.findByText('Temporary password sent to Kennedy Mweene')
    })
  }
}

export const ResendInvite: Story = {
  parameters: {
    msw: {
      handlers: {
        user: [
          tRPCMsw.user.search.query(() => [
            felix,
            { ...kennedy, status: 'pending' as const }
          ]),
          tRPCMsw.user.get.query((id) => (id === kennedy.id ? kennedy : felix)),
          tRPCMsw.user.roles.list.query(() => mockRoles),
          tRPCMsw.user.resendInvite.mutation(() => undefined)
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Wait for user list to load', async () => {
      await canvas.findByText('Felix Katongo', { selector: '#profile-link' })
      await canvas.findByText('Kennedy Mweene', { selector: '#profile-link' })
    })

    await step(
      "Open Kennedy's action menu and click Resend invite",
      async () => {
        const trigger = findMenuTriggerForUser(canvasElement, 'Kennedy Mweene')
        await userEvent.click(trigger)

        const popoverId = trigger.getAttribute('popovertarget')
        const popover = popoverId ? document.getElementById(popoverId) : null
        if (!popover) {
          throw new Error('Kennedy menu popover not found')
        }
        await userEvent.click(within(popover).getByText('Resend invite'))
      }
    )

    await step('Verify success toast is shown', async () => {
      await canvas.findByText('Invite sent')
    })
  }
}

export const ToggleUserActivation: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Wait for user list to load', async () => {
      await canvas.findByText('Felix Katongo', { selector: '#profile-link' })
      await canvas.findByText('Kennedy Mweene', { selector: '#profile-link' })
    })

    await step("Open Kennedy's action menu and click deactivate", async () => {
      const trigger = findMenuTriggerForUser(canvasElement, 'Kennedy Mweene')
      await userEvent.click(trigger)

      const popoverId = trigger.getAttribute('popovertarget')
      const popover = popoverId ? document.getElementById(popoverId) : null
      if (!popover) {
        throw new Error('Kennedy menu popover not found')
      }
      await userEvent.click(within(popover).getByText('Deactivate'))
    })

    await step('Verify deactivation modal is shown', async () => {
      await canvas.findByText('Deactivate Kennedy Mweene?')
      await canvas.findByText(
        'This will revoke Kennedy Mweene’s ability to login and access the system. The account can be reactivated at a later date.'
      )

      await canvas.findByRole('button', { name: 'Cancel' })
    })

    await step('Deactivate user', async () => {
      const deactivateButton = await canvas.findByRole('button', {
        name: 'Deactivate'
      })
      await userEvent.click(deactivateButton)

      await canvas.findByText(
        'Updated Kennedy Mweene\'s account status to "Deactivated"'
      )

      await canvas.findByText('Deactivated')
    })

    await step('Open reactivate user', async () => {
      const trigger = findMenuTriggerForUser(canvasElement, 'Kennedy Mweene')
      await userEvent.click(trigger)

      const popoverId = trigger.getAttribute('popovertarget')
      const popover = popoverId ? document.getElementById(popoverId) : null
      if (!popover) {
        throw new Error('Kennedy menu popover not found')
      }
      await userEvent.click(within(popover).getByText('Reactivate'))
    })

    await step('Verify reactivate modal is shown', async () => {
      await canvas.findByText('Reactivate Kennedy Mweene?')
      await canvas.findByText(
        'This will reactivate Kennedy Mweene’s ability to login and access the system.'
      )

      await canvas.findByRole('button', { name: 'Cancel' })

      await userEvent.click(
        await canvas.findByRole('button', { name: 'Reactivate' })
      )
    })

    await step('Reactivate user', async () => {
      await canvas.findByText(
        'Updated Kennedy Mweene\'s account status to "Active"'
      )

      await canvas.findAllByText('Active')
    })
  }
}
