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
import { Meta, ComponentStory } from '@storybook/react'
import { LocationSearch, ISearchLocation } from './LocationSearch'
import React from 'react'

export default {
  title: 'Input/Location search',
  component: LocationSearch
} as Meta

const Template: ComponentStory<typeof LocationSearch> = (args) => (
  <LocationSearch {...args} />
)
export const LocationSearchView = Template.bind({})
LocationSearchView.args = {
  buttonLabel: 'Search',
  locationList: [
    {
      id: '123',
      searchableText: 'Location one',
      displayLabel: 'Location one, Dhaka'
    },
    {
      id: '234',
      searchableText: 'Location two',
      displayLabel: 'Location two, Dhaka'
    },
    {
      id: '345',
      searchableText: 'Location three',
      displayLabel: 'Location three, Dhaka'
    }
  ],
  searchHandler: (location: ISearchLocation) => {
    alert(location.displayLabel)
  }
}
