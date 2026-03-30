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
import { expect, userEvent, within } from '@storybook/test'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import { TRPCClientError } from '@trpc/client'
import superjson from 'superjson'
import { TestUserRole } from '@opencrvs/commons/client'
import { AppRouter } from '@client/v2-events/trpc'
import AllUserEmail from './AllUserEmail'

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: '/api/events' })],
  transformer: { input: superjson, output: superjson }
})

const meta: Meta<typeof AllUserEmail> = {
  title: 'Communications/AllUserEmail/Interaction',
  component: AllUserEmail,
  args: {
    hideNavigation: true
  },
  parameters: {
    userRole: TestUserRole.enum.NATIONAL_SYSTEM_ADMIN,
    chromatic: { disableSnapshot: true }
  }
}

export default meta

type Story = StoryObj<typeof AllUserEmail>

export const SendButtonDisabledWhenFormEmpty: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const sendButton = await canvas.findByRole('button', { name: /send/i })
    await expect(sendButton).toBeDisabled()
  }
}

export const SendButtonEnabledWhenFormFilled: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Fill in subject and body', async () => {
      const subjectInput = await canvas.findByRole('textbox', {
        name: /subject/i
      })
      await userEvent.type(subjectInput, 'Important update')

      const bodyInput = await canvas.findByRole('textbox', { name: /message/i })
      await userEvent.type(bodyInput, 'This is the email body.')
    })

    const sendButton = await canvas.findByRole('button', { name: /send/i })
    await expect(sendButton).not.toBeDisabled()
  }
}

export const ConfirmationModalOpensOnSubmit: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Fill and submit the form', async () => {
      const subjectInput = await canvas.findByRole('textbox', {
        name: /subject/i
      })
      await userEvent.type(subjectInput, 'Important update')

      const bodyInput = await canvas.findByRole('textbox', { name: /message/i })
      await userEvent.type(bodyInput, 'This is the email body.')

      await userEvent.click(
        await canvas.findByRole('button', { name: /send/i })
      )
    })

    await canvas.findByText('Send email to all users?')
  }
}

export const SuccessToastOnConfirm: Story = {
  parameters: {
    msw: {
      handlers: {
        notification: [
          tRPCMsw.notification.broadcast.mutation(() => ({
            success: true
          }))
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Fill, submit, and confirm', async () => {
      const subjectInput = await canvas.findByRole('textbox', {
        name: /subject/i
      })
      await userEvent.type(subjectInput, 'Important update')

      const bodyInput = await canvas.findByRole('textbox', { name: /message/i })
      await userEvent.type(bodyInput, 'This is the email body.')

      await userEvent.click(
        await canvas.findByRole('button', { name: /send/i })
      )

      await canvas.findByText('Send email to all users?')
      await userEvent.click(
        await canvas.findByRole('button', { name: /confirm/i })
      )
    })

    await canvas.findByText('Email sent to all users')

    await step('Form is reset after success', async () => {
      const subjectInput = await canvas.findByRole('textbox', {
        name: /subject/i
      })
      await expect(subjectInput).toHaveValue('')
    })
  }
}

export const ErrorToastOnFailure: Story = {
  parameters: {
    msw: {
      handlers: {
        notification: [
          tRPCMsw.notification.broadcast.mutation(() => {
            throw new TRPCClientError('A broadcast has already been sent today')
          })
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Fill, submit, and confirm', async () => {
      const subjectInput = await canvas.findByRole('textbox', {
        name: /subject/i
      })
      await userEvent.type(subjectInput, 'Important update')

      const bodyInput = await canvas.findByRole('textbox', { name: /message/i })
      await userEvent.type(bodyInput, 'This is the email body.')

      await userEvent.click(
        await canvas.findByRole('button', { name: /send/i })
      )

      await canvas.findByText('Send email to all users?')
      await userEvent.click(
        await canvas.findByRole('button', { name: /confirm/i })
      )
    })

    await canvas.findByText('Only one email can be sent per day')

    await step('Form is NOT reset after error', async () => {
      const subjectInput = await canvas.findByRole('textbox', {
        name: /subject/i
      })
      await expect(subjectInput).toHaveValue('Important update')
    })
  }
}
