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
import { Meta, StoryObj } from '@storybook/react'
import { ThemeProvider } from 'styled-components'
import { getTheme } from '@opencrvs/components'
import { SearchToolbar } from './SearchToolbar'

export default {
  title: 'Components/SearchToolbar',
  component: SearchToolbar,
  parameters: {
    layout: 'centered'
  }
} as Meta<typeof SearchToolbar>

type Story = StoryObj<typeof SearchToolbar>

export const Default: Story = {
  render: () => (
    <ThemeProvider theme={getTheme}>
      <SearchToolbar />
    </ThemeProvider>
  )
}
