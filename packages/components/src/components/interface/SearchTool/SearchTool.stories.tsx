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
import { PlusTransparent } from '../../icons'
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

export default {
  title: 'Components/Interface/SearchTool',
  component: SearchTool
}

const Template: Story<ISearchToolProps> = (args) => <SearchTool {...args} />
export const SearchToolView = Template.bind({})
SearchToolView.args = {
  searchTypeList: [
    {
      label: 'Dhaka',
      value: 'Dhaka',
      icon: () => <PlusTransparent />,
      invertIcon: () => <PlusTransparent />,
      placeHolderText: 'Dhaka'
    },
    {
      label: 'Chittagong',
      value: 'Chittagong',
      icon: () => <PlusTransparent />,
      invertIcon: () => <PlusTransparent />,
      placeHolderText: 'Chittagong'
    }
  ],
  searchHandler: (searchText: string, searchType: string) => alert(searchText),
  dropDownIsVisible: false,
  language: 'english',
  searchParam: 'String'
}
