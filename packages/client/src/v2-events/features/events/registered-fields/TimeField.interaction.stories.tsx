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
import { expect, fn, userEvent, within } from '@storybook/test'
import React from 'react'
import styled from 'styled-components'
import { IntlProvider } from 'react-intl'
import { FieldType } from '@opencrvs/commons/client'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { TRPCProvider } from '@client/v2-events/trpc'
import { withValidatorContext } from '../../../../../.storybook/decorators'

const messages24Hour = {
  'configuration.timeFormat': 'HH:mm',
  'storybook.time.label': 'Time input (24-hour)',
  'storybook.time.label.description': 'The title for the time input'
}

const messages12Hour = {
  'configuration.timeFormat': 'hh:mm a',
  'storybook.time.label': 'Time input (12-hour)',
  'storybook.time.label.description': 'The title for the time input'
}

function IntlDecorator(messages: Record<string, string>) {
  return (Story: React.ComponentType) => (
    <IntlProvider locale="en" messages={messages}>
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    </IntlProvider>
  )
}

const meta: Meta<typeof FormFieldGenerator> = {
  title: 'Inputs/TimeField',
  args: { onChange: fn() },
  decorators: [withValidatorContext]
}

export default meta

const StyledFormFieldGenerator = styled(FormFieldGenerator)`
  width: 400px;
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
`

const OutputDisplay = styled.div`
  background: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 14px;
`

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FormData = Record<string, any>

// Original TimeInput story with 24-hour format
export const TimeInput: StoryObj<typeof FormFieldGenerator> = {
  decorators: [IntlDecorator(messages24Hour)],
  parameters: {
    layout: 'centered'
  },
  play: async ({ canvasElement, step }) => {
    await step('Accept input time', async () => {
      const canvas = within(canvasElement)
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

export const TimeInput24HourWithInitialValue: StoryObj<
  typeof FormFieldGenerator
> = {
  decorators: [IntlDecorator(messages24Hour)],
  parameters: {
    layout: 'centered'
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Verify initial value is displayed correctly', async () => {
      const hourInput = await canvas.findByDisplayValue('14')
      const minuteInput = await canvas.findByDisplayValue('30')
      await expect(hourInput).toBeInTheDocument()
      await expect(minuteInput).toBeInTheDocument()
    })

    await step('Change time value and verify output format', async () => {
      const hourInput = await canvas.findByDisplayValue('14')
      const minuteInput = await canvas.findByDisplayValue('30')

      await userEvent.clear(hourInput)
      await userEvent.type(hourInput, '23')

      await userEvent.clear(minuteInput)
      await userEvent.type(minuteInput, '45')

      const outputDisplay = await canvas.findByTestId('time-output')
      await expect(outputDisplay).toHaveTextContent('23:45')
    })
  },
  render: function Component(args) {
    const [formData, setFormData] = React.useState<FormData>({
      'storybook.time': '14:30'
    })

    return (
      <Container>
        <StyledFormFieldGenerator
          {...args}
          fields={[
            {
              id: 'storybook.time',
              type: FieldType.TIME,
              label: {
                id: 'storybook.time.label',
                defaultMessage: 'Time input (24-hour)',
                description: 'The title for the time input'
              },
              required: true
            }
          ]}
          id="my-form-24h"
          initialValues={formData}
          onChange={(data) => {
            args.onChange(data)
            setFormData(data)
          }}
        />
        <OutputDisplay data-testid="time-output">
          {'Output (always 24-hour): '}
          {formData['storybook.time'] || 'No value'}
        </OutputDisplay>
      </Container>
    )
  }
}

export const TimeInput12HourDisplay: StoryObj<typeof FormFieldGenerator> = {
  decorators: [IntlDecorator(messages12Hour)],
  parameters: {
    layout: 'centered'
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Enter afternoon time in 12-hour format', async () => {
      await userEvent.type(await canvas.findByPlaceholderText('hh'), '2')
      await userEvent.click(await canvas.findByText('Time input (12-hour)'))
      await userEvent.type(await canvas.findByPlaceholderText('mm'), '30')
    })

    await step('Verify output is in 24-hour format', async () => {
      const outputDisplay = await canvas.findByTestId('time-output-12h')
      await expect(outputDisplay).toBeInTheDocument()
      await expect(outputDisplay).toHaveTextContent('14:30')
    })
  },
  render: function Component(args) {
    const [formData, setFormData] = React.useState<FormData>({})

    return (
      <Container>
        <StyledFormFieldGenerator
          {...args}
          fields={[
            {
              id: 'storybook.time',
              type: FieldType.TIME,
              configuration: { use12HourFormat: true },
              label: {
                id: 'storybook.time.label',
                defaultMessage: 'Time input (12-hour)',
                description: 'The title for the time input'
              },
              required: true
            }
          ]}
          id="my-form-12h"
          initialValues={formData}
          onChange={(data) => {
            args.onChange(data)
            setFormData(data)
          }}
        />
        <OutputDisplay data-testid="time-output-12h">
          {'Output (always 24-hour): '}
          {formData['storybook.time'] || 'No value'}
        </OutputDisplay>
      </Container>
    )
  }
}

export const TimeInput12HourDisplayWith24HourInitialValue: StoryObj<
  typeof FormFieldGenerator
> = {
  decorators: [IntlDecorator(messages12Hour)],
  parameters: {
    layout: 'centered'
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step(
      'Verify 24-hour initial value is correctly displayed a 24 hour value after being passed through a 12-hour format input',
      async () => {
        const outputDisplay = await canvas.findByTestId(
          'time-output-conversion'
        )
        await expect(outputDisplay).toHaveTextContent('14:30')
      }
    )

    await step('Test morning time conversion', async () => {
      const hourInput = await canvas.findByDisplayValue('02')
      await userEvent.clear(hourInput)
      await userEvent.type(hourInput, '09')
      await userEvent.tab()
    })

    await step('Test edge case: midnight and noon', async () => {
      const outputDisplay = await canvas.findByTestId('time-output-conversion')
      await expect(outputDisplay).toBeInTheDocument()
      await expect(outputDisplay).toHaveTextContent('21:30')
    })
  },
  render: function Component(args) {
    const [formData, setFormData] = React.useState<FormData>({
      'storybook.time': '14:30'
    })

    return (
      <Container>
        <StyledFormFieldGenerator
          {...args}
          fields={[
            {
              id: 'storybook.time',
              type: FieldType.TIME,
              configuration: { use12HourFormat: true },
              label: {
                id: 'storybook.time.label',
                defaultMessage: 'Time input (12-hour)',
                description:
                  'The title for the time input with 24-hour initial value'
              },
              required: true
            }
          ]}
          id="my-form-conversion"
          initialValues={formData}
          onChange={(data) => {
            args.onChange(data)
            setFormData(data)
          }}
        />
        <OutputDisplay data-testid="time-output-conversion">
          {'Output (always 24-hour): '}
          {formData['storybook.time'] || 'No value'}
        </OutputDisplay>
      </Container>
    )
  }
}

export const TimeFieldEdgeCases: StoryObj<typeof FormFieldGenerator> = {
  decorators: [IntlDecorator(messages24Hour)],
  parameters: {
    layout: 'centered'
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Test midnight (00:00)', async () => {
      await userEvent.type(await canvas.findByPlaceholderText('hh'), '00')
      await userEvent.click(await canvas.findByText('Time input (24-hour)'))
      await userEvent.type(await canvas.findByPlaceholderText('mm'), '00')

      await userEvent.click(await canvas.findByText('Time input (24-hour)'))
      const output = await canvas.findByTestId('time-output-edge')

      await expect(output).toHaveTextContent('00:00')
    })

    await step('Test end of day (23:59)', async () => {
      const hourInput = await canvas.findByPlaceholderText('hh')
      const minuteInput = await canvas.findByPlaceholderText('mm')

      await userEvent.clear(hourInput)
      await userEvent.type(hourInput, '23')

      await userEvent.clear(minuteInput)
      await userEvent.type(minuteInput, '59')

      const output = await canvas.findByTestId('time-output-edge')
      await expect(output).toHaveTextContent('23:59')
    })

    await step('Test invalid input handling', async () => {
      const hourInput = await canvas.findByDisplayValue('23')

      await userEvent.clear(hourInput)
      await userEvent.type(hourInput, '25')
    })
  },
  render: function Component(args) {
    const [formData, setFormData] = React.useState<FormData>({})

    return (
      <Container>
        <StyledFormFieldGenerator
          {...args}
          fields={[
            {
              id: 'storybook.time',
              type: FieldType.TIME,
              label: {
                id: 'storybook.time.label',
                defaultMessage: 'Time input (24-hour)',
                description: 'Test edge cases for time input'
              },
              required: true
            }
          ]}
          id="my-form-edge"
          initialValues={formData}
          onChange={(data) => {
            args.onChange(data)
            setFormData(data)
          }}
        />
        <OutputDisplay data-testid="time-output-edge">
          {'Output: '}
          {formData['storybook.time'] || 'No value'}
        </OutputDisplay>
        <OutputDisplay>
          {'Valid format: HH:mm (24-hour format, e.g., 00:00 to 23:59)'}
        </OutputDisplay>
      </Container>
    )
  }
}
