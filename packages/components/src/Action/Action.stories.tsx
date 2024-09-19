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
import { ComponentMeta, Story } from '@storybook/react'
import React from 'react'
import { Action } from './Action'
import { Icon } from '../Icon'

export default {
  title: 'Controls/Action',
  component: Action,
  parameters: {
    docs: {
      description: {
        component: `This \`<Action />\` component lists all actions you have the scope for that can be applied on the current declaration / record. 
        \nAn action is disabled if you need to be assigned to perform the action.`
      }
    }
  }
} as ComponentMeta<typeof Action>

const Template: Story = () => (
  <div style={{ position: 'relative', width: '300px', height: '300px' }}>
    <Action
      id="action"
      menuItems={[
        {
          icon: <Icon name="Eye" size="large" />,
          label: 'View record',
          handler: () => alert('View record')
        },
        {
          icon: <Icon name="Printer" size="large" />,
          label: 'Print certified copy',
          handler: () => alert('Print certified copy'),
          isDisabled: true
        },
        {
          icon: <Icon name="NotePencil" size="large" />,
          label: 'Correct record',
          handler: () => alert('Correct record'),
          isDisabled: true
        },
        {
          icon: <Icon name="ArchiveBox" size="large" />,
          label: 'Revoke registration',
          handler: () => alert('Revoke registration'),
          isDisabled: true
        },
        {
          icon: <Icon name="ArrowCircleDown" size="large" />,
          label: 'Unassign',
          handler: () => alert('Unassign')
        }
      ]}
      headerText="Assigned to Felix Katongo at Ibombo District Office"
    />
  </div>
)

export const ActionView = Template.bind({})
ActionView.args = {
  recordStatus: 'Declared',
  userScopes: ['declare', 'register'],
  isAssigned: true
}
