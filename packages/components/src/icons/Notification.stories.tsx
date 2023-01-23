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
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { Notification } from './Notification'

export default {
  title: 'Deprecated/Icons/Notification',
  component: Notification
} as ComponentMeta<typeof Notification>

const Template: ComponentStory<typeof Notification> = () => (
  <span style={{ color: '#000' }}>
    <Notification />
  </span>
)

export const NotificationIcon = Template.bind({})
