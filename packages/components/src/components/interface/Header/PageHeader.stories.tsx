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
import { BackArrowDeepBlue, Cross } from '../../icons'
import { PageHeader } from './PageHeader'
import React from 'react'
import { CircleButton } from '../../buttons'

export default {
  title: 'Components/Interface/Header/PageHeader',
  component: PageHeader
} as Meta

interface IProps {
  id?: string
  mobileLeft?: React.ReactElement[]
  mobileTitle?: string
  mobileRight?: React.ReactElement[]
  desktopLeft?: React.ReactElement[]
  desktopTitle?: string
  desktopRight?: React.ReactElement[]
}

const Template: Story<IProps> = (args) => <PageHeader {...args} />
export const PageHeaderView = Template.bind({})
PageHeaderView.args = {
  id: 'register_app_header',
  mobileTitle: 'Mobile title',
  desktopTitle: 'Desktop title',
  mobileLeft: [
    <CircleButton key="back" onClick={() => alert('Mobile click')}>
      <BackArrowDeepBlue />
    </CircleButton>
  ],
  desktopLeft: [
    <CircleButton key="back" onClick={() => alert('Desktop click')}>
      <BackArrowDeepBlue />
    </CircleButton>
  ],
  desktopRight: [
    <CircleButton key="cross" onClick={() => alert('Desktop click')}>
      <Cross color="currentColor" />
    </CircleButton>
  ],
  mobileRight: [
    <CircleButton key="cross" onClick={() => alert('Mobile click')}>
      <Cross color="currentColor" />
    </CircleButton>
  ]
}
