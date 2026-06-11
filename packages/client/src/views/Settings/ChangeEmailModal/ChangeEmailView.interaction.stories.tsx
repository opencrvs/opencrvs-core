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
import { setNavigatorOnline } from '@client/tests/storybook-utils'
import { ChangeEmailView } from './ChangeEmailView'

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
