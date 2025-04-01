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

import { Meta, StoryObj } from '@storybook/react'
import { userEvent, within } from '@storybook/testing-library'
import React from 'react'
import { expect, fn } from '@storybook/test'
import { noop } from 'lodash'
import { generateTranslationConfig, PageTypes } from '@opencrvs/commons/client'
import { VerificationWizard } from './VerificationWizard'

const meta: Meta<typeof VerificationWizard> = {
  title: 'Components/VerificationWizard/Interaction'
}

export default meta

type Story = StoryObj<typeof VerificationWizard>

const onNextPageSpy = fn()
const onVerifyActionSpy = fn()
const onSubmitSpy = fn()

export const VerificationWizardModal: Story = {
  parameters: {
    chromatic: { disableSnapshot: true }
  },
  render: function Component() {
    return (
      <VerificationWizard
        currentPage={0}
        pageConfig={{
          id: 'verification',
          fields: [],
          title: generateTranslationConfig('Verification Wizard'),
          type: PageTypes.enum.VERIFICATION,
          actions: {
            verify: {
              label: {
                id: 'v2.buttons.verify',
                defaultMessage: 'Verify',
                description: 'Verify button label'
              }
            },
            cancel: {
              label: {
                id: 'v2.buttons.cancel',
                defaultMessage: 'Cancel',
                description: 'Cancel button label'
              },
              confirmation: {
                title: {
                  id: 'v2.buttons.cancel',
                  defaultMessage: 'Cancel',
                  description: 'Cancel button title'
                },
                body: {
                  id: 'v2.buttons.cancel',
                  defaultMessage: 'Are you sure you want to cancel?',
                  description: 'Cancel button body'
                }
              }
            }
          }
        }}
        pageTitle="Verification Wizard"
        showReviewButton={false}
        totalPages={1}
        onNextPage={onNextPageSpy}
        onPreviousPage={noop}
        onSubmit={onSubmitSpy}
        onVerifyAction={onVerifyActionSpy}
      />
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Modal opens on cancel button press', async () => {
      await userEvent.click(
        await canvas.findByRole('button', { name: 'Cancel' })
      )

      await expect(await canvas.findByRole('dialog')).toBeInTheDocument()
    })

    await step('Modal closes on cancel button press', async () => {
      const modal = await canvas.findByRole('dialog')
      await userEvent.click(
        await within(modal).findByRole('button', { name: 'Cancel' })
      )

      await expect(modal).not.toBeInTheDocument()
    })

    await step(
      'onSubmit and onVerifyAction is called on verify button press',
      async () => {
        await userEvent.click(
          await canvas.findByRole('button', { name: 'Verify' })
        )

        await expect(onSubmitSpy).toHaveBeenCalled()
        await expect(onVerifyActionSpy).toHaveBeenCalled()
      }
    )
  }
}
