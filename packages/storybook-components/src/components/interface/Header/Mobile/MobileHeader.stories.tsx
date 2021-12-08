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
import { Hamburger, SearchDark } from '../../../icons'
import { MobileHeader, IMobileHeaderProps } from './MobileHeader'

export default {
  title: 'Components/Interface/Header/Mobile/MobileHeader',
  component: MobileHeader
} as Meta

const Template: Story<IMobileHeaderProps> = args => <MobileHeader {...args} />
export const MobileHeaderView = Template.bind({})
MobileHeaderView.args = {
  id: 'register_mobile_header',
  mobileLeft: {
    icon: () => <Hamburger />,
    handler: () => alert('left menu clicked')
  },
  title: 'Mobile header',
  mobileRight: {
    icon: () => <SearchDark />,
    handler: () => alert('right menu clicked')
  }
}
