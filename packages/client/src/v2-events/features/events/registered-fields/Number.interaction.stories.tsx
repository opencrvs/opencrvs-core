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
import { expect } from '@storybook/test'
import { userEvent, within } from '@storybook/testing-library'
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
    await expect(input).toHaveValue(126)
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
    await expect(input).toHaveValue(12)
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
    await expect(input).toHaveValue(12.6)
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
