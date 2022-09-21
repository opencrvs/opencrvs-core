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
import { Story } from '@storybook/react'
import { BRN, TrackingID } from '../icons'
import { SearchTool, ISearchType } from './SearchTool'
import React from 'react'

interface ISearchToolProps {
  searchTypeList: ISearchType[]
  searchText?: string
  selectedSearchType?: string
  language: string
  searchHandler: (searchText: string, searchType: string) => void
  dropDownIsVisible: boolean
  searchParam: string
  onClearText?: () => void
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  title: 'Controls/Search',
  component: SearchTool,
  parameters: {
    storyHeight: 130
  }
}

const Template: Story<ISearchToolProps> = (args) => <SearchTool {...args} />
export const SearchToolView = Template.bind({})
SearchToolView.args = {
  searchTypeList: [
    {
      label: 'Tracking ID',
      value: 'Tracking ID',
      icon: <TrackingID />,
      invertIcon: <TrackingID />,
      placeHolderText: 'Search for Tracking ID'
    },
    {
      label: 'BRN/DRN',
      value: 'BRN/DRN',
      icon: <BRN />,
      invertIcon: <BRN />,
      placeHolderText: 'Search for BRN/DRN'
    }
  ],
  searchHandler: (searchText: string, searchType: string) => alert(searchText),
  dropDownIsVisible: false,
  language: 'english',
  searchParam: 'String'
}
