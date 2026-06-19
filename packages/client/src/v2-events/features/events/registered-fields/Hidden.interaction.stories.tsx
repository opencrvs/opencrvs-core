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
import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import styled from 'styled-components'
import { expect, within } from '@storybook/test'
import { TRPCProvider } from '@client/v2-events/trpc'
import { Hidden } from './Hidden'

const meta: Meta<typeof Hidden.Input> = {
  title: 'Inputs/Hidden',
  component: Hidden.Input,
  args: {},
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}

export default meta

const Box = styled.div`
  border: 2px solid #000;
  padding: 1rem;
`

function HiddenComponentBox({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <h2>
        {
          'Inside the box there is a hidden component, which is not rendered in the UI, but is present in the DOM'
        }
      </h2>
      <Box>{children}</Box>
    </div>
  )
}

export const HiddenInput: StoryObj<typeof Hidden.Input> = {
  args: {
    id: 'hidden-input',
    value: 'hidden value'
  },
  render: (args) => (
    <HiddenComponentBox>
      <Hidden.Input {...args} />
    </HiddenComponentBox>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const hiddenInput = await canvas.findByTestId('text__hidden-input')
    await expect(hiddenInput).toBeInTheDocument()
    await expect(hiddenInput).toHaveValue('hidden value')
  }
}
