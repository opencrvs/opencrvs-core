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

import { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'
import { expect, waitFor, within } from 'storybook/test'
import { UserAuditHistory } from './UserAuditHistory'
import { TestUserRole } from '@opencrvs/commons/client'

import { TRPCProvider } from '../../v2-events/trpc'

const meta: Meta<typeof UserAuditHistory> = {
  title: 'UserAudit/UserAuditHistory',
  component: UserAuditHistory,
  parameters: {
    userRole: TestUserRole.enum.LOCAL_REGISTRAR
  },
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}

export default meta
type Story = StoryObj<typeof UserAuditHistory>

export const WithRecordReadScope: Story = {}

export const WithoutRecordReadScope: Story = {
  parameters: {
    userRole: TestUserRole.enum.LOCAL_SYSTEM_ADMIN
  }
}

/**
 * Regression test for: audit action labels wrap onto several lines in the narrow
 * action column, so their text must stay left aligned instead of inheriting the
 * alignment of the surrounding table cell.
 */
export const ActionLinksAreLeftAligned: Story = {
  tags: ['link-alignment-regression'],
  parameters: {
    chromatic: { disableSnapshot: true }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Wait for the audit list to load', async () => {
      await canvas.findByText('Logged out')
    })

    await step('Audit action link renders its text left aligned', async () => {
      const actionLink = await canvas.findByRole('button', {
        name: 'Logged out'
      })

      await waitFor(() =>
        expect(getComputedStyle(actionLink).textAlign).toBe('left')
      )
    })
  }
}
