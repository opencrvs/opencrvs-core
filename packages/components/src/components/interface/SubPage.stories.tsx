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
import { SubPage } from './SubPage'
import React from 'react'

interface IProps {
  title?: string
  emptyTitle: string
  goBack: () => void
}

const Template: Story<IProps> = (args) => (
  <SubPage {...args}>
    <div>Children Elements will go here</div>
  </SubPage>
)

export const SubPageView = Template.bind({})

SubPageView.args = {
  title: 'Birth Registration',
  emptyTitle: 'Empty Page',
  goBack: () => alert('Back Button Clicked')
}

export default {
  title: 'Components/Interface/SubPage',
  component: SubPage
} as Meta
