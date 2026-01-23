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

import type { StoryObj } from '@storybook/react'
import { expect, userEvent, within } from '@storybook/test'
import React from 'react'
import styled from 'styled-components'
import { IntlProvider } from 'react-intl'
import { FieldType } from '@opencrvs/commons/client'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { TRPCProvider } from '@client/v2-events/trpc'
import { padZero } from '@client/v2-events/utils'

function IntlDecorator(messages: Record<string, string>) {
  return (Story: React.ComponentType) => (
    <IntlProvider locale="en" messages={messages}>
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    </IntlProvider>
  )
}

const StyledFormFieldGenerator = styled(FormFieldGenerator)`
  width: 400px;
`

const messages24Hour = {
  'configuration.timeField.outputFormat': 'HH:mm',
  'storybook.time.label': 'Time input (24-hour)',
  'storybook.time.label.description': 'The title for the time input'
}

// Original TimeInput story with 24-hour format
export const TimeInput: StoryObj<typeof FormFieldGenerator> = {
  decorators: [IntlDecorator(messages24Hour)],
  parameters: {
    layout: 'centered'
  },
  play: async ({ canvasElement, step }) => {
    await step('Accept input time', async () => {
      const canvas = within(canvasElement)
      const today = new Date()
      const hour = padZero(today.getHours())
      const minute = padZero(today.getMinutes())

      const hourInput = (await canvas.findByTestId(
        'storybook____time-hh-twentyfour'
      )) as HTMLInputElement

      const minuteInput = (await canvas.findByTestId(
        'storybook____time-mm-twentyfour'
      )) as HTMLInputElement

      void expect(hourInput.value).toBe(hour)
      void expect(minuteInput.value).toBe(minute)

      await userEvent.clear(hourInput)
      await userEvent.clear(minuteInput)

      await userEvent.type(await canvas.findByPlaceholderText('hh'), '9')

      await userEvent.click(await canvas.findByText('Time input (24-hour)'))

      await userEvent.type(await canvas.findByPlaceholderText('mm'), '30')
    })
  },
  render: function Component(args) {
    const [formData, setFormData] = React.useState({})

    return (
      <StyledFormFieldGenerator
        {...args}
        fields={[
          {
            id: 'storybook.time',
            type: FieldType.TIME,
            // value of now() will be resolve to { $$now: true }
            defaultValue: {
              $$now: true
            },
            label: {
              id: 'storybook.time.label',
              defaultMessage: 'Time input (24-hour)',
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
