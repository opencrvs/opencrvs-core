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
import { Story } from '@storybook/react'
import { Icon } from '../Icon'
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
    storyCss: {
      height: '130px'
    }
  }
}

const Template: Story<ISearchToolProps> = (args) => <SearchTool {...args} />
export const SearchToolView = Template.bind({})
SearchToolView.args = {
  searchTypeList: [
    {
      icon: <Icon name="Target" size="small" />,
      label: 'Tracking ID',
      placeHolderText: 'Search',
      value: 'Tracking ID'
    },
    {
      icon: <Icon name="Medal" size="small" />,
      label: 'Registration No.',
      placeHolderText: 'Search',
      value: 'Registration No.'
    },
    {
      icon: <Icon name="Phone" size="small" />,
      label: 'Phone no.',
      placeHolderText: 'Search',
      value: 'Phone no.'
    }
  ],
  searchHandler: (searchText: string, searchType: string) => alert(searchText),
  dropDownIsVisible: false,
  language: 'english',
  searchParam: 'String'
}
