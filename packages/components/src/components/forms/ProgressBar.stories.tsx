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
import React from 'react'
import { ProgressBar } from './ProgressBar'

export default {
  title: 'Components/forms/ProgressBar',
  component: ProgressBar
} as Meta

interface IProgressBarProps {
  id?: string
  loading?: boolean
  title?: string
  color?: string
  width?: number
  shape?: ProgressBarShape
  totalPoints?: number
  currentPoints?: number
  disabled?: boolean
  onClick?: (event: React.MouseEvent<HTMLElement>) => void
}
type ProgressBarShape = 'square' | 'round' | 'butt'

const Template: Story<IProgressBarProps> = (args) => <ProgressBar {...args} />

export const ProgressBarView = Template.bind({})
ProgressBarView.args = {
  totalPoints: 900,
  currentPoints: 100
}
