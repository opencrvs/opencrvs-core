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
import superjson from 'superjson'
import React from 'react'
import { TestUserRole } from '@opencrvs/commons/client'
import { AppRouter } from '@client/v2-events/trpc'
import { NotificationComponent } from '@client/components/Notification'
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
  },
  // NotificationComponent is the Redux-connected toast renderer used in App.tsx.
  // It must be included here so that success/error toasts dispatched by
  // AllUserEmail are actually mounted and visible within the story canvas.
  decorators: [
    (Story) => (
      <>
        <Story />
        <NotificationComponent />
      </>
    )
  ]
}

export default meta

type Story = StoryObj<typeof AllUserEmail>

// The label elements use `id` but no `for`/`htmlFor`, so testing-library cannot
// resolve accessible names via label text. Use findAllByRole to wait for the
// form to render, then destructure by DOM order: [0] = subject, [1] = body.
async function getFormInputs(canvas: ReturnType<typeof within>) {
  const [subjectInput, bodyInput] = await canvas.findAllByRole('textbox')
  return { subjectInput, bodyInput }
}

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
      const { subjectInput, bodyInput } = await getFormInputs(canvas)
      await userEvent.type(subjectInput, 'Important update')
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
      const { subjectInput, bodyInput } = await getFormInputs(canvas)
      await userEvent.type(subjectInput, 'Important update')
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
        announcement: [
          tRPCMsw.announcement.broadcast.mutation(() => ({
            success: true
          }))
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Fill, submit, and confirm', async () => {
      const { subjectInput, bodyInput } = await getFormInputs(canvas)
      await userEvent.type(subjectInput, 'Important update')
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
      const { subjectInput } = await getFormInputs(canvas)
      await expect(subjectInput).toHaveValue('')
    })
  }
}

export const ErrorToastOnFailure: Story = {
  parameters: {
    msw: {
      handlers: {
        announcement: [
          tRPCMsw.announcement.broadcast.mutation(() => {
            throw new Error('Service unavailable')
          })
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Fill, submit, and confirm', async () => {
      const { subjectInput, bodyInput } = await getFormInputs(canvas)
      await userEvent.type(subjectInput, 'Important update')
      await userEvent.type(bodyInput, 'This is the email body.')

      await userEvent.click(
        await canvas.findByRole('button', { name: /send/i })
      )

      await canvas.findByText('Send email to all users?')
      await userEvent.click(
        await canvas.findByRole('button', { name: /confirm/i })
      )
    })

    await canvas.findByText(
      'Only one email can be sent per day',
      {},
      { timeout: 5000 }
    )

    await step('Form is NOT reset after error', async () => {
      const { subjectInput } = await getFormInputs(canvas)
      await expect(subjectInput).toHaveValue('Important update')
    })
  }
}
