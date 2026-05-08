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
import { userEvent, within, expect, fireEvent, waitFor } from '@storybook/test'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import { TRPCError } from '@trpc/server'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { AppRouter } from '@client/v2-events/trpc'
import { SettingsPage } from './Settings'

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

const meta: Meta<typeof SettingsPage> = {
  title: 'Settings/Interaction',
  parameters: {
    msw: {
      handlers: {
        sendVerifyCode: [
          tRPCMsw.user.sendVerifyCode.mutation(() => ({
            nonce: '123'
          })),
          tRPCMsw.user.changeEmail.mutation(() => {
            return
          }),
          tRPCMsw.user.changePhone.mutation(() => {
            return
          })
        ]
      }
    }
  }
}

export default meta

type Story = StoryObj<typeof SettingsPage>

export const ChangePhoneNumber: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.SETTINGS.buildPath({})
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Change phone number', async () => {
      const changePhoneButton = await canvas.findAllByTestId(
        'change-phone-button'
      )
      await userEvent.click(changePhoneButton[0])

      await canvas.findByText('What is your new number?')

      await expect(
        await canvas.findByRole('button', { name: 'Continue' })
      ).toBeDisabled()

      const input = await canvas.findByRole('spinbutton', { name: '' })
      // NOTE: Using userEvent does not work for number inputs. It'll remove the leading 0 for you.
      await fireEvent.change(input, { target: { value: '01741234567' } })

      await userEvent.click(
        await canvas.findByRole('button', { name: 'Continue' })
      )
    })

    await step('Enter verification code', async () => {
      await canvas.findByText('Enter 6 digit verification code')

      await canvas.findByText(
        'Verification code has been sent to kalushabwalya1.7@gmail.com'
      )
    })

    await expect(
      await canvas.findByRole('button', { name: 'Continue' })
    ).toBeDisabled()

    const input = await canvas.findByRole('spinbutton', { name: '' })

    await fireEvent.change(input, { target: { value: '000000' } })

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Continue' })
    )

    await canvas.findByText('Phone number updated')
  }
}

export const ChangePasswordStateClears: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
    msw: {
      handlers: {
        changePassword: [
          tRPCMsw.user.changePassword.mutation(() => {
            throw new TRPCError({
              code: 'UNAUTHORIZED'
            })
          })
        ]
      }
    },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.SETTINGS.buildPath({})
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Open modal and trigger all validation states', async () => {
      await waitFor(async () =>
        expect(canvasElement.querySelector('#BtnChangePassword')).toBeEnabled()
      )
      await userEvent.click(
        canvasElement.querySelector('#BtnChangePassword') as HTMLElement
      )

      await canvas.findByText('Change password')

      await userEvent.type(
        canvasElement.querySelector('#CurrentPassword') as HTMLInputElement,
        'currentpassword'
      )

      await userEvent.type(
        canvasElement.querySelector('#NewPassword') as HTMLInputElement,
        'NewPass1234567'
      )

      await userEvent.type(
        canvasElement.querySelector('#ConfirmPassword') as HTMLInputElement,
        'WrongPass9999'
      )
      await canvas.findByText('Passwords do not match')

      await userEvent.clear(
        canvasElement.querySelector('#ConfirmPassword') as HTMLInputElement
      )
      await userEvent.type(
        canvasElement.querySelector('#ConfirmPassword') as HTMLInputElement,
        'NewPass1234567'
      )
      await canvas.findByText('Passwords match')

      await userEvent.click(
        await canvas.findByRole('button', { name: 'Confirm' })
      )
      await canvas.findByText(
        'Current password incorrect. Please try again.',
        {},
        {
          timeout: 5000
        }
      )
    })

    await step('Validation tick icons show passing rules', async () => {
      await expect(
        canvasElement.querySelectorAll('ellipse[fill="#49B78D"]').length
      ).toBeGreaterThan(0)
    })

    await step('Close modal', async () => {
      await userEvent.click(
        canvasElement.querySelector('#close-btn') as HTMLElement
      )
    })

    await step('Reopen modal — all state cleared', async () => {
      await userEvent.click(
        canvasElement.querySelector('#BtnChangePassword') as HTMLElement
      )

      await canvas.findByText('Change password')

      await expect(
        (canvasElement.querySelector('#CurrentPassword') as HTMLInputElement)
          .value
      ).toBe('')

      await expect(
        (canvasElement.querySelector('#NewPassword') as HTMLInputElement).value
      ).toBe('')

      await expect(
        (canvasElement.querySelector('#ConfirmPassword') as HTMLInputElement)
          .value
      ).toBe('')

      await expect(
        canvas.queryByText('Passwords match')
      ).not.toBeInTheDocument()

      await expect(
        canvas.queryByText('Passwords do not match')
      ).not.toBeInTheDocument()

      await expect(
        canvas.queryByText('Current password incorrect. Please try again.')
      ).not.toBeInTheDocument()

      await expect(
        canvasElement.querySelectorAll('ellipse[fill="#49B78D"]').length
      ).toBe(0)

      await expect(
        await canvas.findByRole('button', { name: 'Confirm' })
      ).toBeDisabled()
    })
  }
}

export const TogglePasswordVisibility: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.SETTINGS.buildPath({})
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await waitFor(async () =>
      expect(canvasElement.querySelector('#BtnChangePassword')).toBeEnabled()
    )
    await userEvent.click(
      canvasElement.querySelector('#BtnChangePassword') as HTMLElement
    )

    await canvas.findByText('Change password')

    const getToggleButton = (inputId: string) => {
      const input = canvasElement.querySelector(
        `#${inputId}`
      ) as HTMLInputElement
      return input?.parentElement?.querySelector('button') as HTMLButtonElement
    }

    await step('Toggle CurrentPassword visibility', async () => {
      await userEvent.type(
        canvasElement.querySelector('#CurrentPassword') as HTMLInputElement,
        'somepassword'
      )

      const input = canvasElement.querySelector(
        '#CurrentPassword'
      ) as HTMLInputElement
      await expect(input.type).toBe('password')

      await userEvent.click(getToggleButton('CurrentPassword'))
      await expect(input.type).toBe('text')

      await userEvent.click(getToggleButton('CurrentPassword'))
      await expect(input.type).toBe('password')
    })

    await step('Toggle NewPassword visibility', async () => {
      await userEvent.type(
        canvasElement.querySelector('#NewPassword') as HTMLInputElement,
        'NewPass1234567'
      )

      const input = canvasElement.querySelector(
        '#NewPassword'
      ) as HTMLInputElement
      await expect(input.type).toBe('password')

      await userEvent.click(getToggleButton('NewPassword'))
      await expect(input.type).toBe('text')

      await userEvent.click(getToggleButton('NewPassword'))
      await expect(input.type).toBe('password')
    })

    await step('Toggle ConfirmPassword visibility', async () => {
      await userEvent.type(
        canvasElement.querySelector('#ConfirmPassword') as HTMLInputElement,
        'NewPass1234567'
      )

      const input = canvasElement.querySelector(
        '#ConfirmPassword'
      ) as HTMLInputElement
      await expect(input.type).toBe('password')

      await userEvent.click(getToggleButton('ConfirmPassword'))
      await expect(input.type).toBe('text')

      await userEvent.click(getToggleButton('ConfirmPassword'))
      await expect(input.type).toBe('password')
    })
  }
}

export const ConfirmPasswordPreservedOnNewPasswordChange: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.SETTINGS.buildPath({})
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await waitFor(async () =>
      expect(canvasElement.querySelector('#BtnChangePassword')).toBeEnabled()
    )
    await userEvent.click(
      canvasElement.querySelector('#BtnChangePassword') as HTMLElement
    )

    await canvas.findByText('Change password')

    await step('Type confirm password first', async () => {
      await userEvent.type(
        canvasElement.querySelector('#ConfirmPassword') as HTMLInputElement,
        'MyPass1234567'
      )
      await expect(
        (canvasElement.querySelector('#ConfirmPassword') as HTMLInputElement)
          .value
      ).toBe('MyPass1234567')
    })

    await step('Type matching new password — passwords match', async () => {
      await userEvent.type(
        canvasElement.querySelector('#NewPassword') as HTMLInputElement,
        'MyPass1234567'
      )
      await canvas.findByText('Passwords match')

      await expect(
        (canvasElement.querySelector('#ConfirmPassword') as HTMLInputElement)
          .value
      ).toBe('MyPass1234567')
    })

    await step(
      'Change new password — confirm password preserved, mismatch shown',
      async () => {
        await userEvent.clear(
          canvasElement.querySelector('#NewPassword') as HTMLInputElement
        )
        await userEvent.type(
          canvasElement.querySelector('#NewPassword') as HTMLInputElement,
          'DifferentPass1234567'
        )

        await canvas.findByText('Passwords do not match')

        await expect(
          (canvasElement.querySelector('#ConfirmPassword') as HTMLInputElement)
            .value
        ).toBe('MyPass1234567')
      }
    )
  }
}

export const ChangeEmailAddress: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.SETTINGS.buildPath({})
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Change email address', async () => {
      const changePhoneButton = await canvas.findAllByTestId(
        'change-email-address'
      )
      await userEvent.click(changePhoneButton[0])

      await canvas.findByText('What is your new email?')

      await expect(
        await canvas.findByRole('button', { name: 'Continue' })
      ).toBeDisabled()

      const modal = within(await canvas.findByRole('dialog'))
      const input = await modal.findByRole('textbox', {
        name: ''
      })

      await userEvent.type(input, 'opencrvs@opencrvs.org')

      await userEvent.click(
        await canvas.findByRole('button', { name: 'Continue' })
      )
    })

    await step('Enter verification code', async () => {
      await canvas.findByText('Enter 6 digit verification code')

      await canvas.findByText(
        'Verification code has been sent to opencrvs@opencrvs.org'
      )
    })

    await expect(
      await canvas.findByRole('button', { name: 'Continue' })
    ).toBeDisabled()

    const input = await canvas.findByRole('spinbutton', { name: '' })

    await fireEvent.change(input, { target: { value: '000000' } })

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Continue' })
    )

    await canvas.findByText('Email Address updated')
  }
}
