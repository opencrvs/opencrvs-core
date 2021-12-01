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
import { Story, Meta } from '@storybook/react'
import { ListItemAction, IListItemActionProps } from './ListItemAction'
import { MinusTransparent, PlusTransparent } from '../icons'

export default {
  title: 'Components/Buttons/ListItemAction',
  component: ListItemAction
} as Meta

const Template: Story<IListItemActionProps> = args => (
  <ListItemAction {...args} />
)
export const SampleListItemAction = Template.bind({})
SampleListItemAction.args = {
  actions: [
    {
      label: 'string',
      handler: () => alert('plus'),
      icon: () => <PlusTransparent />
    },
    {
      label: 'string',
      handler: () => alert('minus'),
      icon: () => <MinusTransparent />
    }
  ]
}
