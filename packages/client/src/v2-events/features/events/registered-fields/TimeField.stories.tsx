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
import { fn, userEvent, within } from '@storybook/test'
import React from 'react'
import styled from 'styled-components'
import { FieldType } from '@opencrvs/commons/client'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { TRPCProvider } from '@client/v2-events/trpc'

const meta: Meta<typeof FormFieldGenerator> = {
  title: 'Inputs/TimeField',
  args: { onChange: fn() },
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}

export default meta

const StyledFormFieldGenerator = styled(FormFieldGenerator)`
  width: 400px;
`

export const TimeInput: StoryObj<typeof FormFieldGenerator> = {
  parameters: {
    layout: 'centered'
  },
  play: async ({ canvasElement, step }) => {
    await step('Accept input time', async () => {
      const canvas = within(canvasElement)
      await userEvent.type(await canvas.findByPlaceholderText('hh'), '9')

      await userEvent.click(await canvas.findByText('Time input'))

      await userEvent.type(await canvas.findByPlaceholderText('mm'), '30')
    })
  },
  render: function Component(args) {
    const [formData, setFormData] = React.useState({})

    return (
      <StyledFormFieldGenerator
        fields={[
          {
            id: 'storybook.time',
            type: FieldType.TIME,
            label: {
              id: 'storybook.time.label',
              defaultMessage: 'Time input',
              description: 'The title for the time input'
            },
            required: true
          }
        ]}
        id="my-form"
        initialValues={formData}
        onChange={(data) => {
          args.onChange(data)
          setFormData(data)
        }}
      />
    )
  }
}
