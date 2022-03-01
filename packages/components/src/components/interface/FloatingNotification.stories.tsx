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
import { FloatingNotification, NOTIFICATION_TYPE } from './FloatingNotification'
import React from 'react'

interface IProps {
  id?: string
  show: boolean
  type?: NOTIFICATION_TYPE
  callback?: (event: React.MouseEvent<HTMLDivElement>) => void
  className?: string
}

const Template: Story<IProps> = (args) => (
  <FloatingNotification {...args}>Test</FloatingNotification>
)
export const FloatingNotificationView = Template.bind({})
FloatingNotificationView.args = {
  show: true,
  type: NOTIFICATION_TYPE.SUCCESS
}

export default {
  title: 'Components/Interface/FloatingNotification',
  component: FloatingNotification
} as Meta
