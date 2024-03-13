/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import React from 'react'
import { ComponentStory } from '@storybook/react'
import { BulletList } from './BulletList'

export default {
  title: 'Typography/Bullet List',
  component: BulletList
}

const Template: ComponentStory<typeof BulletList> = (args) => (
  <BulletList {...args} />
)

export const Default = Template.bind({})
Default.args = {
  items: ['Birth', 'Death', 'Marriage', 'Adoption', 'Divorce'],
  font: 'reg18'
}
