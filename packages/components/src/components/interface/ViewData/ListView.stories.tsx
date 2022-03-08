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
import { ListView } from './ListView'
import { ActionType, IListRowProps } from './ListRow'
import React from 'react'

interface IProps {
  id?: string
  title: string
  items: IListRowProps[]
  responsiveContents?: React.ReactNode
}

export default {
  title: 'Components/Interface/ViewData/ListView',
  component: ListView
} as Meta

const Template: Story<IProps> = (args) => <ListView {...args} />
export const DataSectionView = Template.bind({})
DataSectionView.args = {
  title: 'Title',
  items: [
    {
      label: 'Name',
      value: 'Atiq Zaman',
      action: {
        label: 'Change',
        disabled: true
      }
    },
    {
      label: 'Phone Number',
      value: '+880xxxxxx',
      action: {
        label: 'Change',
        handler: () => alert('Change your phone number')
      }
    },
    {
      label: <div>Atiq Zaman</div>,
      value: <>Registrar</>,
      isLinkLabel: true,
      onClickLabelLink: () => alert('label link clicked'),
      action: {
        label: 'Change',
        handler: () => alert('Change your phone number')
      }
    },
    {
      label: <div>Atiq Zaman</div>,
      value: <>Registrar</>,
      isLinkLabel: true,
      onClickLabelLink: () => alert('label link clicked'),
      actionType: ActionType.ICON,
      action: {
        label: 'edit',
        handler: () => alert('Change your phone number')
      }
    },
    {
      label: <div>Atiq Zaman</div>,
      value: <>Registrar</>,
      isLinkLabel: true,
      onClickLabelLink: () => alert('label link clicked'),
      actionType: ActionType.BUTTON,
      action: {
        label: 'edit',
        handler: () => alert('Change your phone number')
      }
    }
  ]
}
