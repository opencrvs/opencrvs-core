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

import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor } from 'storybook/test'
import { userEvent, within } from 'storybook/test'
import React, { Suspense } from 'react'
import styled from 'styled-components'
import { FieldType, NumberField } from '@opencrvs/commons/client'
import {
  FormFieldGenerator,
  FormFieldGeneratorPropsWithoutRef
} from '@client/v2-events/components/forms/FormFieldGenerator'
import { TRPCProvider } from '@client/v2-events/trpc'
import { withValidatorContext } from '../../../../../.storybook/decorators'
import { Number } from './Number'

const meta: Meta<FormFieldGeneratorPropsWithoutRef> = {
  title: 'Inputs/Number/Interaction',
  decorators: [
    (Story, context) => (
      <TRPCProvider>
        <Suspense fallback={<div>{'Loading...'}</div>}>
          <Story {...context} />
        </Suspense>
      </TRPCProvider>
    ),
    withValidatorContext
  ]
}

export default meta

const StyledFormFieldGenerator = styled(FormFieldGenerator)`
  width: 400px;
`

type Story = StoryObj<FormFieldGeneratorPropsWithoutRef>

const integerLabel = {
  id: 'storybook.number.label',
  defaultMessage: 'Integer number',
  description: 'The title for the number input'
}

const integerFields = [
  {
    id: 'storybook.number',
    type: FieldType.NUMBER,
    label: integerLabel,
    configuration: { integer: true }
  }
]

const decimalFields = [
  {
    id: 'storybook.number',
    type: FieldType.NUMBER,
    label: { ...integerLabel, defaultMessage: 'Decimal number' },
    configuration: {}
  }
]

export const IntegerBlocksDecimal: Story = {
  name: 'Integer blocks decimal (12.6 -> 126)',
  parameters: {
    layout: 'centered',
    chromatic: { disableSnapshot: true }
  },
  render: function Component(args) {
    return (
      <StyledFormFieldGenerator {...args} fields={integerFields} id="my-form" />
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const input = await canvas.findByTestId('number__storybook____number')
    await userEvent.clear(input)
    await userEvent.type(input, '12.6')
    input.blur()
    await expect(input).toHaveValue('126')
  }
}

export const IntegerBlocksExponent: Story = {
  name: 'Integer blocks exponent (1e2 -> 12)',
  parameters: {
    layout: 'centered',
    chromatic: { disableSnapshot: true }
  },
  render: function Component(args) {
    return (
      <StyledFormFieldGenerator {...args} fields={integerFields} id="my-form" />
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const input = await canvas.findByTestId('number__storybook____number')
    await userEvent.clear(input)
    await userEvent.type(input, '1e2')
    input.blur()
    await expect(input).toHaveValue('12')
  }
}

export const DecimalAllowsDecimal: Story = {
  name: 'Default allows decimal (12.6)',
  parameters: {
    layout: 'centered',
    chromatic: { disableSnapshot: true }
  },
  render: function Component(args) {
    return (
      <StyledFormFieldGenerator {...args} fields={decimalFields} id="my-form" />
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const input = await canvas.findByTestId('number__storybook____number')
    await userEvent.clear(input)
    await userEvent.type(input, '12.6')
    input.blur()
    await expect(input).toHaveValue('12.6')
  }
}

const positiveIntegerFields = [
  {
    id: 'storybook.number',
    type: FieldType.NUMBER,
    label: { ...integerLabel, defaultMessage: 'Positive integer' },
    configuration: { integer: true, min: 0 }
  }
]

export const IntegerBlocksAlphabetic: Story = {
  name: 'Integer blocks alphabetic (abc)',
  parameters: {
    layout: 'centered',
    chromatic: { disableSnapshot: true }
  },
  render: function Component(args) {
    return (
      <StyledFormFieldGenerator {...args} fields={integerFields} id="my-form" />
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const input = await canvas.findByTestId('number__storybook____number')
    await userEvent.clear(input)
    await userEvent.type(input, 'abc')
    await expect(input).toHaveValue('')
  }
}

export const DecimalBlocksAlphabetic: Story = {
  name: 'Decimal blocks alphabetic (1a.b2)',
  parameters: {
    layout: 'centered',
    chromatic: { disableSnapshot: true }
  },
  render: function Component(args) {
    return (
      <StyledFormFieldGenerator {...args} fields={decimalFields} id="my-form" />
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const input = await canvas.findByTestId('number__storybook____number')
    await userEvent.clear(input)
    await userEvent.type(input, '1a.b2')
    input.blur()
    await expect(input).toHaveValue('1.2')
  }
}

export const PositiveIntegerBlocksNegative: Story = {
  name: 'min 0 blocks negative (-5 -> 5)',
  parameters: {
    layout: 'centered',
    chromatic: { disableSnapshot: true }
  },
  render: function Component(args) {
    return (
      <StyledFormFieldGenerator
        {...args}
        fields={positiveIntegerFields}
        id="my-form"
      />
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const input = await canvas.findByTestId('number__storybook____number')
    await userEvent.clear(input)
    await userEvent.type(input, '-5')
    input.blur()
    await expect(input).toHaveValue('5')
  }
}

export const DecimalAllowsNegative: Story = {
  name: 'Default allows negative (-1.5)',
  parameters: {
    layout: 'centered',
    chromatic: { disableSnapshot: true }
  },
  render: function Component(args) {
    return (
      <StyledFormFieldGenerator {...args} fields={decimalFields} id="my-form" />
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const input = await canvas.findByTestId('number__storybook____number')
    await userEvent.clear(input)
    await userEvent.type(input, '-1.5')
    input.blur()
    await expect(input).toHaveValue('-1.5')
  }
}

const cappedIntegerFields = [
  {
    id: 'storybook.number',
    type: FieldType.NUMBER,
    label: { ...integerLabel, defaultMessage: 'Capped integer' },
    configuration: { integer: true, min: 0, max: 120 }
  }
]

export const MaxRejectsLargerValue: Story = {
  name: 'max 120 rejects 150 (-> 15)',
  parameters: {
    layout: 'centered',
    chromatic: { disableSnapshot: true }
  },
  render: function Component(args) {
    return (
      <StyledFormFieldGenerator
        {...args}
        fields={cappedIntegerFields}
        id="my-form"
      />
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const input = await canvas.findByTestId('number__storybook____number')
    await userEvent.clear(input)
    await userEvent.type(input, '150')
    input.blur()
    await expect(input).toHaveValue('15')
  }
}

export const DecimalClearsLoneMinusRepeatedly: Story = {
  name: 'Lone - clears on every blur',
  parameters: {
    layout: 'centered',
    chromatic: { disableSnapshot: true }
  },
  render: function Component(args) {
    return (
      <StyledFormFieldGenerator {...args} fields={decimalFields} id="my-form" />
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const input = await canvas.findByTestId('number__storybook____number')
    await userEvent.clear(input)
    await userEvent.type(input, '-')
    input.blur()
    await waitFor(async () => {
      await expect(input).toHaveValue('')
    })

    // The second round commits the same undefined, so nothing but the blur
    // itself can clear the input.
    await userEvent.click(input)
    await userEvent.type(input, '-')
    input.blur()
    await waitFor(async () => {
      await expect(input).toHaveValue('')
    })
  }
}

export const DecimalNormalisesTrailingSeparator: Story = {
  name: 'Trailing separator normalises on every blur (12. -> 12)',
  parameters: {
    layout: 'centered',
    chromatic: { disableSnapshot: true }
  },
  render: function Component(args) {
    return (
      <StyledFormFieldGenerator {...args} fields={decimalFields} id="my-form" />
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const input = await canvas.findByTestId('number__storybook____number')
    await userEvent.clear(input)
    await userEvent.type(input, '12.')
    input.blur()
    await waitFor(async () => {
      await expect(input).toHaveValue('12')
    })

    await userEvent.click(input)
    await userEvent.type(input, '.')
    input.blur()
    await waitFor(async () => {
      await expect(input).toHaveValue('12')
    })
  }
}

const outputConfig = {
  id: 'storybook.number',
  type: FieldType.NUMBER,
  label: integerLabel
} satisfies NumberField

export const OutputZero: StoryObj = {
  name: 'Output renders 0 (not empty)',
  parameters: {
    layout: 'centered',
    chromatic: { disableSnapshot: true }
  },
  render: () => <Number.Output config={outputConfig} value={0} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('0')).toBeInTheDocument()
  }
}
