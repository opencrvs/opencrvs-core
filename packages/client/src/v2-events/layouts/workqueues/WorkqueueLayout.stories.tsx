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
import React from 'react'
import { TRPCProvider } from '@client/v2-events/trpc'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { WorkqueueLayout } from './index'

const meta: Meta<typeof WorkqueueLayout> = {
  title: 'WorkqueueLayout',
  component: WorkqueueLayout,
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}

export default meta
type Story = StoryObj<typeof WorkqueueLayout>

// has 'record.create[event=birth|death|tennis-club-membership]' scope
const tokenWithCreateScopeForAllEventTypes =
  testDataGenerator().user.token.registrationAgent

// doesnt have 'record.create' scope
const tokenWithNoCreateScope =
  testDataGenerator().user.token.nationalSystemAdmin

export const LayoutWithCreateAllowed: Story = {
  loaders: [
    async () => {
      window.localStorage.setItem(
        'opencrvs',
        tokenWithCreateScopeForAllEventTypes
      )

      // Ensure state is stable before seeding the mutation cache
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  ]
}

export const LayoutWithNoCreateAllowed: Story = {
  loaders: [
    async () => {
      window.localStorage.setItem('opencrvs', tokenWithNoCreateScope)

      // Ensure state is stable before seeding the mutation cache
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  ]
}
