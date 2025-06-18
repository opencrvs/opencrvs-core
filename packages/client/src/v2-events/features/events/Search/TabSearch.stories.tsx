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
import { noop } from 'lodash'
import { EventState, tennisClubMembershipEvent } from '@opencrvs/commons/client'
import { TRPCProvider } from '@client/v2-events/trpc'
import { TabSearch } from './TabSearch'

const meta: Meta<typeof TabSearch> = {
  title: 'Components/TabSearch',
  component: TabSearch,
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

type Story = StoryObj<typeof TabSearch>

export const DefaultSearchResult: Story = {
  name: 'TabSearch',
  args: {
    currentEvent: tennisClubMembershipEvent,
    fieldValues: {
      'applicant.name.firstname': 'Danny',
      'applicant.dob': '1999-11-11'
    },
    onChange: (updateForm: EventState) => noop(updateForm)
  }
}
