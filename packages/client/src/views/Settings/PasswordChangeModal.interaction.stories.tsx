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
import { expect, userEvent, waitFor } from '@storybook/test'
import { setNavigatorOnline } from '@client/tests/storybook-utils'
import { PasswordChangeModal } from './PasswordChangeModal'

const meta: Meta<typeof PasswordChangeModal> = {
  title: 'Settings/PasswordChangeModal/Interaction',
  component: PasswordChangeModal,
  args: {
    togglePasswordChangeModal: () => {},
    passwordChanged: () => {}
  },
  parameters: {
    chromatic: { disableSnapshot: true }
  }
}

export default meta

type Story = StoryObj<typeof PasswordChangeModal>

export const ConfirmButtonDisabledWhenGoingOffline: Story = {
  play: async ({ canvasElement, step }) => {
    // The password inputs are type="password", which has no implicit ARIA
    // role, so they cannot be queried through testing-library roles.
    const input = (id: string) => {
      const element = canvasElement.querySelector<HTMLInputElement>(`#${id}`)
      if (!element) {
        throw new Error(`Input #${id} not found`)
      }
      return element
    }
    const confirmButton = () =>
      canvasElement.querySelector<HTMLButtonElement>('#confirm-button')

    await step('Enter a valid password change while online', async () => {
      await waitFor(async () => {
        await expect(input('currentPassword')).toBeVisible()
      })
      await userEvent.type(input('currentPassword'), 'CurrentPass123')
      await userEvent.type(input('newPassword'), 'NewPassword12345')
      await userEvent.type(input('confirmPassword'), 'NewPassword12345')

      await expect(confirmButton()).toBeEnabled()
    })

    await step('Go offline — confirm button becomes disabled', async () => {
      setNavigatorOnline(false)

      await waitFor(async () => {
        await expect(confirmButton()).toBeDisabled()
      })
    })

    await step('Go online — confirm button becomes enabled', async () => {
      setNavigatorOnline(true)

      await waitFor(async () => {
        await expect(confirmButton()).toBeEnabled()
      })
    })
  }
}
