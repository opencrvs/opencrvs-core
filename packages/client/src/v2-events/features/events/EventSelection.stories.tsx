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
import { tennisClubMembershipEvent } from '@opencrvs/commons/client'
import { TRPCProvider } from '@client/v2-events/trpc'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { EventSelection } from './EventSelection'
import { addLocalEventConfig } from './useEvents/api'

const meta: Meta<typeof EventSelection> = {
  title: 'EventSelection',
  component: EventSelection,
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}

export default meta
type Story = StoryObj<typeof EventSelection>

const tokenWithCreateScopeForAllEventTypes =
  testDataGenerator().user.token.registrationAgent

const birthConfig = {
  ...tennisClubMembershipEvent,
  id: 'birth',
  label: {
    id: 'birth',
    defaultMessage: 'Birth',
    description: 'birth'
  }
}

// This is not shown because it is not in the scope
const randomConfig = {
  ...tennisClubMembershipEvent,
  id: 'foo',
  label: {
    id: 'foo',
    defaultMessage: 'Foo',
    description: 'Foo'
  }
}

export const EventSelectionWithCreateScopeForAllEventTypes: Story = {
  beforeEach: () => {
    addLocalEventConfig(birthConfig)
    addLocalEventConfig(randomConfig)
  },
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
