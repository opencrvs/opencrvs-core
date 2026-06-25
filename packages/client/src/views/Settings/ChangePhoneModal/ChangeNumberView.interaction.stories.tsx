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
import { expect, fireEvent, userEvent, waitFor, within } from '@storybook/test'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import { TRPCError } from '@trpc/server'
import { setNavigatorOnline } from '@client/tests/storybook-utils'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { AppRouter } from '@client/v2-events/trpc'
import { addUserToQueryData } from '@client/v2-events/features/events/useEvents/api'
import { ChangeNumberView } from './ChangeNumberView'

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: '/api/events' })],
  transformer: { input: superjson, output: superjson }
})

const generator = testDataGenerator()

// Must match window.config.PHONE_NUMBER_PATTERN (^01[1-9][0-9]{8}$ in the
// storybook mock config). The default fixture mobile (+260933333333) cannot
// be entered into the type="number" input, so the current user is overridden
// with a number the test can type.
const currentUserMobile = '01711111111'
const currentUserWithTypeableMobile = {
  ...generator.user.localRegistrar().v2,
  mobile: currentUserMobile
}

const meta: Meta<typeof ChangeNumberView> = {
  title: 'Settings/ChangeNumberView/Interaction',
  component: ChangeNumberView,
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

type Story = StoryObj<typeof ChangeNumberView>

export const ContinueButtonDisabledWhenGoingOffline: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Enter a valid phone number while online', async () => {
      // The phone input is type="number", which has the spinbutton role.
      // Must match window.config.PHONE_NUMBER_PATTERN (^01[1-9][0-9]{8}$
      // in the storybook mock config). fireEvent.change is used instead of
      // userEvent.type because the number input drops the leading zero when
      // typed key by key.
      await fireEvent.change(await canvas.findByRole('spinbutton'), {
        target: { value: '01711111111' }
      })
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

export const DuplicatePhoneShowsToast: Story = {
  parameters: {
    msw: {
      handlers: {
        requestPhoneChange: [
          tRPCMsw.user.requestPhoneChange.mutation(() => {
            throw new TRPCError({ code: 'CONFLICT' })
          })
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const newPhone = '01722222222'

    await step(
      'Enter a valid new phone number and click Continue',
      async () => {
        await fireEvent.change(await canvas.findByRole('spinbutton'), {
          target: { value: newPhone }
        })
        await expect(
          canvas.getByRole('button', { name: 'Continue' })
        ).toBeEnabled()
        await userEvent.click(canvas.getByRole('button', { name: 'Continue' }))
      }
    )

    await step('Duplicate phone toast appears', async () => {
      await waitFor(
        async () => {
          await expect(
            canvas.getByText(
              `${newPhone} is already used by another user. Please use a different phone number`
            )
          ).toBeVisible()
        },
        { timeout: 5000 }
      )
    })

    await step('Entering a new number dismisses the toast', async () => {
      await fireEvent.change(canvas.getByRole('spinbutton'), {
        target: { value: '01733333333' }
      })
      await waitFor(() => {
        expect(
          canvas.queryByText(
            `${newPhone} is already used by another user. Please use a different phone number`
          )
        ).not.toBeInTheDocument()
      })
    })
  }
}

export const ContinueButtonDisabledWhenMobileNumberUnchanged: Story = {
  loaders: [
    async () => {
      addUserToQueryData(currentUserWithTypeableMobile)
    }
  ],
  parameters: {
    msw: {
      handlers: {
        userGet: [tRPCMsw.user.get.query(() => currentUserWithTypeableMobile)]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step(
      'Enter the current phone number — unchanged error shown, continue disabled',
      async () => {
        await fireEvent.change(await canvas.findByRole('spinbutton'), {
          target: { value: currentUserMobile }
        })
        await expect(
          await canvas.findByText(
            'This is already your phone number. Please enter a different phone number'
          )
        ).toBeVisible()
        await expect(
          canvas.getByRole('button', { name: 'Continue' })
        ).toBeDisabled()
      }
    )

    await step(
      'Enter a different valid phone number — error clears, continue enabled',
      async () => {
        await fireEvent.change(canvas.getByRole('spinbutton'), {
          target: { value: '01722222222' }
        })
        await waitFor(async () => {
          await expect(
            canvas.queryByText(
              'This is already your phone number. Please enter a different phone number'
            )
          ).not.toBeInTheDocument()
          await expect(
            canvas.getByRole('button', { name: 'Continue' })
          ).toBeEnabled()
        })
      }
    )
  }
}
