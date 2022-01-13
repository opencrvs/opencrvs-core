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
import React from 'react'
import { Meta, Story } from '@storybook/react'
import { List, IListProps } from '.'

export default {
  title: 'Components/Typography/List',
  component: List
} as Meta

const Template: Story<IListProps> = (args) => <List {...args} />

export const ListView = Template.bind({})
ListView.args = {
  id: 'ListView',
  list: ['Item1', 'Item2', 'Item3']
}
