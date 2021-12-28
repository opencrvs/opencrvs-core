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
import { SearchInput, ISerachInputCustomProps } from '.'
import React from 'react'

const Template: Story<
  ISerachInputCustomProps & React.InputHTMLAttributes<HTMLInputElement>
> = (args) => <SearchInput {...args} />

export const SearchInputView = Template.bind({})
SearchInputView.args = {
  buttonLabel: 'Search',
  onSubmit: (searchText: string) => alert(searchText)
}
export default {
  title: 'Components/Interface/SearchInput',
  component: SearchInput
} as Meta
