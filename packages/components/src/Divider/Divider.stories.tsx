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
import { Meta, Story } from '@storybook/react'
import { Divider, DividerProps } from './Divider'

export default {
  title: 'Components/Divider',
  component: Divider,
  argTypes: {
    ref: { table: { disable: true } },
    as: { table: { disable: true } },
    forwardedAs: { table: { disable: true } },
    theme: { table: { disable: true } }, // Exclude theme prop
    color: { control: 'color' } // Display color prop as a color picker in controls panel
  }
} as Meta

const Template: Story<DividerProps> = (args) => <Divider {...args} />

export const Default: Story<DividerProps> = (args) => <Template {...args} />
Default.args = {}

export const Customized: Story<DividerProps> = (args) => <Template {...args} />
Customized.args = {
  width: '50%',
  border: '2px',
  color: 'red'
}
