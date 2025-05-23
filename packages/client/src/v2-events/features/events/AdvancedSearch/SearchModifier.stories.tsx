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
import * as React from 'react'
import { Meta, StoryObj } from '@storybook/react'
import { tennisClubMembershipEvent } from '@opencrvs/commons/client'
import { TRPCProvider } from '@client/v2-events/trpc'
import { SearchModifierComponent } from './SearchModifier'

const meta: Meta<typeof SearchModifierComponent> = {
  title: 'Components/SearchModifierComponent',
  component: SearchModifierComponent,
  parameters: {
    layout: 'centered'
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

type Story = StoryObj<typeof SearchModifierComponent>

const mockSearchParams = {
  'applicant.firstname': 'Danny',
  'applicant.dob': '1999-11-11'
}

export const DefaultSearchResult: Story = {
  name: 'SearchModifier',
  args: {
    eventConfig: tennisClubMembershipEvent,
    searchParams: mockSearchParams
  }
}
