/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { Meta, Story } from '@storybook/react'
import { LocationSearch, ISearchLocation } from './LocationSearch'
import React from 'react'

export default {
  title: 'Components/Interface/LocationSearch',
  component: LocationSearch
} as Meta

interface IProps {
  locationList: ISearchLocation[]
  selectedLocation?: ISearchLocation | undefined
  searchHandler?: (location: ISearchLocation) => void
  searchButtonHandler?: () => void
  id?: string
  onBlur?: (e: React.FocusEvent<any>) => void
  error?: boolean
  touched?: boolean
  className?: string
  dropDownIsVisible: boolean
  filteredList: ISearchLocation[]
  selectedText: string | null
  selectedItem: ISearchLocation | null
}
const Template: Story<IProps> = (args) => <LocationSearch {...args} />
export const LocationSearchView = Template.bind({})
LocationSearchView.args = {
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
