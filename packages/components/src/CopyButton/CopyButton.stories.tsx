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

import { Meta, Story } from '@storybook/react'
import { CopyButton, ICopyProps } from './CopyButton'
import { Stack } from '../Stack'
import React from 'react'

const Template: Story<ICopyProps> = (args) => {
  return (
    <Stack>
      <CopyButton {...args} />
    </Stack>
  )
}

export default {
  title: 'Controls/Copy button',
  component: CopyButton,
  parameters: {
    docs: {
      description: {
        component: 'Copy button is used for copying data to the clipboard.'
      }
    }
  }
} as Meta

export const Default = Template.bind({})
Default.args = {
  copiedLabel: 'Copied',
  copyLabel: 'Copy',
  data: 'Data to be copied',
  timeout: 3000
}
