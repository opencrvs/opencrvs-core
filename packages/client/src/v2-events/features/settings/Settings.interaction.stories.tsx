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
import { userEvent, within, expect, fireEvent } from '@storybook/test'
import { TestUserRole } from '@opencrvs/commons/client'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { SettingsPage } from './Settings'

const meta: Meta<typeof SettingsPage> = {
  title: 'Settings/Interaction'
}

export default meta

type Story = StoryObj<typeof SettingsPage>

export const ChangePhoneNumber: Story = {
  parameters: {
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
      await fireEvent.change(input, { target: { value: '0734834834' } })

      await userEvent.click(
        await canvas.findByRole('button', { name: 'Continue' })
      )
    })

    await step('Enter verification code', async () => {
      await canvas.findByText('Enter 6 digit verification code')

      await canvas.findByText(
        'A confirmational SMS has been sent to kalushabwalya1.7@gmail.com'
      )
    })

    await expect(
      await canvas.findByRole('button', { name: 'Verify' })
    ).toBeDisabled()

    const input = await canvas.findByRole('spinbutton', { name: '' })

    await fireEvent.change(input, { target: { value: '000000' } })

    await userEvent.click(await canvas.findByRole('button', { name: 'Verify' }))

    await canvas.findByText('Phone number updated')
  }
}

export const ChangeEmailAddress: Story = {
  parameters: {
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

      const input = await canvas.findByRole('textbox', { name: '' })

      await userEvent.type(input, 'opencrvs@opencrvs.org')

      await userEvent.click(
        await canvas.findByRole('button', { name: 'Continue' })
      )
    })

    await step('Enter verification code', async () => {
      await canvas.findByText('Enter 6 digit verification code')

      await canvas.findByText(
        'A confirmational SMS has been sent to opencrvs@opencrvs.org'
      )
    })

    await expect(
      await canvas.findByRole('button', { name: 'Verify' })
    ).toBeDisabled()

    const input = await canvas.findByRole('spinbutton', { name: '' })

    await fireEvent.change(input, { target: { value: '000000' } })

    await userEvent.click(await canvas.findByRole('button', { name: 'Verify' }))

    await canvas.findByText('Email Address updated')
  }
}
