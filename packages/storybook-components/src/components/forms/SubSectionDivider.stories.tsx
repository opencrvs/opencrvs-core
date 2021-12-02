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
import { MinusTransparent, PlusTransparent } from '../icons'
import { SubSectionDivider, ISubSectionProps } from './SubSectionDivider'

export default {
  title: 'Components/forms/SubSectionDivider',
  component: SubSectionDivider
} as Meta

const Template: Story<ISubSectionProps> = args => (
  <SubSectionDivider {...args} />
)

export const SubSectionView = Template.bind({})
SubSectionView.args = {
  label: 'title',
  optionalLabel: 'Optional'
}
