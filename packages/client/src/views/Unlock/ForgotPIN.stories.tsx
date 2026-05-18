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
import { expect, fn, userEvent, within } from '@storybook/test'
import { TRPCError } from '@trpc/server'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import React, { useState } from 'react'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { AppRouter } from '@client/v2-events/trpc'
import { CreatePin } from '@client/views/PIN/CreatePin'
import { ForgotPIN } from './ForgotPIN'

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: '/api/events' })],
  transformer: { input: superjson, output: superjson }
})

const generator = testDataGenerator()
// Required in every handler override so fetchUserDetails can hydrate Redux userDetails,
// which WaitForUserDetails in the storybook Wrapper blocks on.
const userGetHandler = tRPCMsw.user.get.query(
  () => generator.user.localRegistrar().v2
)

const meta: Meta<typeof ForgotPIN> = {
  title: 'Unlock/ForgotPIN',
  component: ForgotPIN,
  args: {
    goBack: fn(),
    onVerifyPassword: fn()
  },
  parameters: {
    chromatic: { disableSnapshot: true }
  }
}

export default meta

type Story = StoryObj<typeof ForgotPIN>

export const VerifyPasswordError: Story = {
  parameters: {
    msw: {
      handlers: {
        user: [
          userGetHandler,
          tRPCMsw.user.verifyLoggedInUserPassword.mutation(() => {
            throw new TRPCError({ code: 'UNAUTHORIZED' })
          })
        ]
      }
    }
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    await userEvent.type(await canvas.findByDisplayValue(''), 'wrong-password')

    await userEvent.click(await canvas.findByRole('button', { name: 'Verify' }))

    await canvas.findByText('The password you entered was incorrect')

    await expect(args.onVerifyPassword).not.toHaveBeenCalled()
  }
}

export const EmptyPasswordValidation: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    await userEvent.click(await canvas.findByRole('button', { name: 'Verify' }))

    await canvas.findByText('This field is required')

    await expect(args.onVerifyPassword).not.toHaveBeenCalled()
  }
}

function ForgotPINFlow(args: React.ComponentProps<typeof ForgotPIN>) {
  const [passwordVerified, setPasswordVerified] = useState(false)

  if (passwordVerified) {
    return <CreatePin onComplete={() => {}} />
  }

  return (
    <ForgotPIN {...args} onVerifyPassword={() => setPasswordVerified(true)} />
  )
}

export const VerifyAndCreatePin: Story = {
  render: ForgotPINFlow,
  parameters: {
    msw: {
      handlers: {
        user: [
          userGetHandler,
          tRPCMsw.user.verifyLoggedInUserPassword.mutation(() => ({
            id: 'test-user-id',
            username: 'test.user',
            status: 'active',
            mobile: '+260978787878'
          }))
        ]
      }
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.type(
      await canvas.findByDisplayValue(''),
      'correct-password'
    )

    await userEvent.click(await canvas.findByRole('button', { name: 'Verify' }))

    await canvas.findByText('Create a PIN')
  }
}
