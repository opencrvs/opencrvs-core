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
import { ErrorToastNotification } from './ErrorToastNotification'
import React from 'react'

interface IProps {
  retryButtonText: string
  retryButtonHandler?: (event: React.MouseEvent<HTMLDivElement>) => void
}

const Template: Story<IProps> = (args) => <ErrorToastNotification {...args} />
export const ErrorNotificationView = Template.bind({})
ErrorNotificationView.args = {
  retryButtonText: 'Retry',
  retryButtonHandler: () => alert('Retry Button Clicked')
}

export default {
  title: 'Components/Interface/ErrorToastNotification',
  component: ErrorToastNotification
} as Meta
