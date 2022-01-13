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
import { ExpandableNotification } from './ExpandableNotification'
import React from 'react'

export default {
  title: 'Components/Interface/ExpandableNotification/ExpandableNotification',
  component: ExpandableNotification
} as Meta

interface IProps {
  processingText: string
  outboxText: string
  expand: boolean
}

const Template: Story<IProps> = (args) => <ExpandableNotification {...args} />
export const ExNotificationViewView = Template.bind({})
ExNotificationViewView.args = {
  processingText: 'Birth List',
  outboxText: 'Outbox',
  expand: false
}
