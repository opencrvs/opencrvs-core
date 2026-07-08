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
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import { TRPCError } from '@trpc/server'
import { setNavigatorOnline } from '@client/tests/storybook-utils'
import { AppRouter } from '@client/v2-events/trpc'
import { ChangeEmailView } from './ChangeEmailView'

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: '/api/events' })],
  transformer: { input: superjson, output: superjson }
})

const meta: Meta<typeof ChangeEmailView> = {
  title: 'Settings/ChangeEmailView/Interaction',
  component: ChangeEmailView,
  args: {
    show: true,
    onSuccess: () => {},
    onClose: () => {}
  },
  parameters: {
    chromatic: { disableSnapshot: true }
  }
}

export default meta

type Story = StoryObj<typeof ChangeEmailView>

export const ContinueButtonDisabledWhenGoingOffline: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Enter a valid email while online', async () => {
      await userEvent.type(
        await canvas.findByRole('textbox'),
        'new.email@example.com'
      )
      await expect(
        canvas.getByRole('button', { name: 'Continue' })
      ).toBeEnabled()
    })

    await step('Go offline — continue button becomes disabled', async () => {
      setNavigatorOnline(false)

      await waitFor(async () => {
        await expect(
          canvas.getByRole('button', { name: 'Continue' })
        ).toBeDisabled()
      })
    })

    await step('Go online — continue button becomes enabled', async () => {
      setNavigatorOnline(true)

      await waitFor(async () => {
        await expect(
          canvas.getByRole('button', { name: 'Continue' })
        ).toBeEnabled()
      })
    })
  }
}

// The default storybook user (local registrar) has this email address.
const currentUserEmail = 'kalushabwalya1.7@gmail.com'

export const DuplicateEmailShowsToast: Story = {
  parameters: {
    msw: {
      handlers: {
        requestEmailChange: [
          tRPCMsw.user.requestEmailChange.mutation(() => {
            throw new TRPCError({ code: 'CONFLICT' })
          })
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const newEmail = 'already.taken@example.com'

    await step('Enter a valid new email and click Continue', async () => {
      await userEvent.type(await canvas.findByRole('textbox'), newEmail)
      await expect(
        canvas.getByRole('button', { name: 'Continue' })
      ).toBeEnabled()
      await userEvent.click(canvas.getByRole('button', { name: 'Continue' }))
    })

    await step('Duplicate email toast appears', async () => {
      await waitFor(
        async () => {
          await expect(
            canvas.getByText(
              `${newEmail} is already used by another user. Please use a different email`
            )
          ).toBeVisible()
        },
        { timeout: 5000 }
      )
    })

    await step('Typing a new email dismisses the toast', async () => {
      const input = canvas.getByRole('textbox')
      await userEvent.clear(input)
      await userEvent.type(input, 'other@example.com')
      await waitFor(() => {
        expect(
          canvas.queryByText(
            `${newEmail} is already used by another user. Please use a different email`
          )
        ).not.toBeInTheDocument()
      })
    })
  }
}

export const ContinueButtonDisabledWhenEmailUnchanged: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step(
      'Enter the current email — unchanged error shown, continue disabled',
      async () => {
        await userEvent.type(
          await canvas.findByRole('textbox'),
          currentUserEmail
        )
        await expect(
          await canvas.findByText(
            'This is already your email address. Please enter a different email address'
          )
        ).toBeVisible()
        await expect(
          canvas.getByRole('button', { name: 'Continue' })
        ).toBeDisabled()
      }
    )

    await step(
      'Current email in a different case still counts as unchanged',
      async () => {
        const input = canvas.getByRole('textbox')
        await userEvent.clear(input)
        await userEvent.type(input, currentUserEmail.toUpperCase())
        await expect(
          await canvas.findByText(
            'This is already your email address. Please enter a different email address'
          )
        ).toBeVisible()
        await expect(
          canvas.getByRole('button', { name: 'Continue' })
        ).toBeDisabled()
      }
    )

    await step(
      'Enter a different email — error clears, continue enabled',
      async () => {
        const input = canvas.getByRole('textbox')
        await userEvent.clear(input)
        await userEvent.type(input, 'new.email@example.com')
        await expect(
          canvas.queryByText(
            'This is already your email address. Please enter a different email address'
          )
        ).not.toBeInTheDocument()
        await expect(
          canvas.getByRole('button', { name: 'Continue' })
        ).toBeEnabled()
      }
    )
  }
}
