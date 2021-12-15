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
import { Notification, NOTIFICATION_TYPE } from './Notification'

interface IProps {
  id?: string
  show: boolean
  type?: NOTIFICATION_TYPE
  callback?: (event: React.MouseEvent<HTMLDivElement>) => void
  className?: string
}

const Template: Story<IProps> = args => <Notification {...args} />
export const NotificationView = Template.bind({})
NotificationView.args = {
  id: 'string',
  show: true,
  type: NOTIFICATION_TYPE.SUCCESS,
  //callback?: (event: React.MouseEvent<HTMLDivElement>) => void
  className: 'Notification-Class'
}

export default {
  title: 'Components/Interface/Notification',
  component: Notification
} as Meta
