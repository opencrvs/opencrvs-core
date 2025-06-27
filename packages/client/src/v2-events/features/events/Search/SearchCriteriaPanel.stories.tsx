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
import { SearchCriteriaPanel } from '@client/v2-events/features/events/Search/SearchCriteriaPanel'

const meta: Meta<typeof SearchCriteriaPanel> = {
  title: 'Components/SearchCriteriaPanel',
  component: SearchCriteriaPanel,
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

type Story = StoryObj<typeof SearchCriteriaPanel>

const mockSearchParams = {
  'applicant.name': {
    firstname: 'Danny',
    surname: 'DeVito'
  },
  'applicant.dob': '1999-11-11'
}

export const DefaultSearchResult: Story = {
  name: 'SearchCriteriaPanel',
  args: {
    eventConfig: tennisClubMembershipEvent,
    searchParams: mockSearchParams
  }
}
