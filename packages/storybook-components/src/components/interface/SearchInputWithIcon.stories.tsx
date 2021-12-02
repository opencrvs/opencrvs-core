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
import { SearchInputWithIcon } from '.'

interface Props {
  searchText?: string
  placeHolderText: string
  error?: boolean
  touched?: boolean
  searchHandler: (searchText: string) => void
}

const Template: Story<Props> = args => (
  <SearchInputWithIcon {...args}>
    Section information populates here
  </SearchInputWithIcon>
)

export const SearchInputWithIconView = Template.bind({})
SearchInputWithIconView.args = {
  searchHandler: searchText => alert(searchText)
}
export default {
  title: 'Components/Interface/SearchInputWithIcon',
  component: SearchInputWithIcon
}
