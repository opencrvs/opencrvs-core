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

import React from 'react'
import { Summary } from './Summary'
import { ComponentMeta, ComponentStory } from '@storybook/react'

export default {
  title: 'Data/Summary',
  component: Summary,
  parameters: {
    docs: {
      description: {
        component:
          'Summary helps visualize data in a two-column table. Summary row values can also be hidden, to indicate data that the user has no access to.'
      }
    }
  }
} as ComponentMeta<typeof Summary>

export const Row: ComponentStory<typeof Summary.Row> = (args) => (
  <Summary.Row {...args} />
)
Row.args = {
  label: 'Event',
  value: 'Birth',
  placeholder: 'No event',
  locked: false
}

export const SummaryTable: ComponentStory<typeof Summary> = () => (
  <Summary>
    <Summary.Row
      data-testid="status"
      label="Status"
      value="Draft"
      placeholder="No status"
    />
    <Summary.Row label="Event" value="Birth" placeholder="No event" />
    <Summary.Row label="Tracking ID" placeholder="No tracking ID" />
    <Summary.Row label="Date of birth" locked={true} />
    <Summary.Row label="Place of birth" locked={true} />
    <Summary.Row label="Informant" locked={true} />
  </Summary>
)
SummaryTable.storyName = 'Summary'
