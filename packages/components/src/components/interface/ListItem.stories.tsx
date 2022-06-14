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
import { StatusGray, StatusOrange } from '../icons'
import { IListItemProps, ListItem } from './ListItem'
import React from 'react'

const Template: Story<IListItemProps> = (args) => <ListItem {...args} />

const infoItems = [
  {
    label: 'Name',
    value: 'Moon Walker'
  },
  {
    label: 'D.o.B',
    value: '10.10.2018'
  },
  {
    label: 'Date of collection',
    value: '10.10.2018'
  },
  {
    label: 'Registration number',
    value: '1234567'
  }
]

const statusItems = [
  {
    icon: <StatusGray />,
    label: 'Birth'
  },
  {
    icon: <StatusOrange />,
    label: 'Declaration'
  }
]

const style = {
  width: '100%',
  height: '100px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}

export const ListItemView = Template.bind({})
ListItemView.args = {
  actions: [{ label: 'review', handler: () => alert('Review clicked') }],
  infoItems,
  statusItems,
  index: 1,
  expandedCellRenderer: () => (
    <div style={style}>
      <div>a expanded view</div>
    </div>
  )
}

export default {
  title: 'Components/Interface/ListItem',
  component: ListItem
} as Meta
