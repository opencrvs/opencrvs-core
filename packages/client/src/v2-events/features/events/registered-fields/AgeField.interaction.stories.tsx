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
import { expect, fireEvent, fn } from '@storybook/test'
import { userEvent, waitFor, within } from '@storybook/testing-library'
import React, { Suspense } from 'react'
import styled from 'styled-components'
import { AgeField, field, FieldType } from '@opencrvs/commons/client'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { TRPCProvider } from '@client/v2-events/trpc'
import { withValidatorContext } from '../../../../../.storybook/decorators'

const meta: Meta<typeof FormFieldGenerator> = {
  title: 'Inputs/Age/Interaction',
  args: { onChange: fn() },
  decorators: [
    (Story, context) => (
      <TRPCProvider>
        <Suspense fallback={<div>Loading...</div>}>
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

const fields = [
  {
    id: 'storybook.age',
    type: FieldType.AGE,
    required: true,
    label: {
      id: 'storybook.age.label',
      defaultMessage: 'Age',
      description: 'The title for the age input'
    },
    configuration: {
      asOfDate: { $$field: 'storybook.dateOfBirth' }
    },
    validation: [
      {
        validator: field('storybook.age').asAge().isBetween(12, 120),
        message: {
          defaultMessage: 'Age must be between 12 and 120',
          description: 'Error message for invalid age',
          id: 'event.action.declare.form.section.person.field.age.error'
        }
      }
    ]
  } satisfies AgeField
]

export const Foo = {}

export const AgeFieldInteractionLeadingZero: StoryObj<
  typeof FormFieldGenerator
> = {
  name: 'Leading Zero (00020)',
  parameters: {
    layout: 'centered',
    chromatic: { disableSnapshot: true }
  },
  render: function Component(args) {
    return (
      <StyledFormFieldGenerator
        {...args}
        fields={fields}
        id="my-form"
        onChange={(data) => {
          args.onChange(data)
        }}
      />
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const ageInput = await canvas.findByTestId('age__storybook____age')
    await userEvent.clear(ageInput)
    await fireEvent.change(ageInput, { target: { value: '0020' } })
    ageInput.blur()
    await expect(ageInput).toHaveValue(20)
    await userEvent.click(ageInput)
    ageInput.blur()
  }
}

export const AgeFieldInteractionDecimal: StoryObj<typeof FormFieldGenerator> = {
  name: 'Decimal (12.6)',
  parameters: {
    layout: 'centered',
    chromatic: { disableSnapshot: true }
  },
  render: function Component(args) {
    return (
      <StyledFormFieldGenerator
        {...args}
        fields={fields}
        id="my-form"
        onChange={(data) => {
          args.onChange(data)
        }}
      />
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const ageInput = await canvas.findByTestId('age__storybook____age')
    await userEvent.clear(ageInput)
    await userEvent.type(ageInput, '12.6')
    ageInput.blur()
    await expect(ageInput).toHaveValue(126)
    await userEvent.click(ageInput)
    ageInput.blur()
  }
}

export const AgeFieldInteractionExponential: StoryObj<
  typeof FormFieldGenerator
> = {
  name: 'Exponential (1e2)',
  parameters: {
    layout: 'centered',
    chromatic: { disableSnapshot: true }
  },
  render: function Component(args) {
    return (
      <StyledFormFieldGenerator
        {...args}
        fields={fields}
        id="my-form"
        onChange={(data) => {
          args.onChange(data)
        }}
      />
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const ageInput = await canvas.findByTestId('age__storybook____age')
    await userEvent.clear(ageInput)
    await userEvent.type(ageInput, '1e2')
    ageInput.blur()
    await expect(ageInput).toHaveValue(12)
  }
}

export const AgeFieldInteractionSmaller: StoryObj<typeof FormFieldGenerator> = {
  name: ' < 12',
  parameters: {
    layout: 'centered',
    chromatic: { disableSnapshot: true }
  },
  render: function Component(args) {
    return (
      <StyledFormFieldGenerator
        {...args}
        fields={fields}
        id="my-form"
        onChange={(data) => {
          args.onChange(data)
        }}
      />
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const ageInput = await canvas.findByTestId('age__storybook____age')
    await userEvent.clear(ageInput)
    await userEvent.type(ageInput, '10')
    ageInput.blur()
    await expect(ageInput).toHaveValue(10)
    await userEvent.click(ageInput)
    ageInput.blur()
    await expect(
      canvas.findByText('Age must be between 12 and 120')
    ).resolves.toBeInTheDocument()
  }
}

export const AgeFieldInteractionGreater: StoryObj<typeof FormFieldGenerator> = {
  name: ' > 120',
  parameters: {
    layout: 'centered',
    chromatic: { disableSnapshot: true }
  },
  render: function Component(args) {
    return (
      <StyledFormFieldGenerator
        {...args}
        fields={fields}
        id="my-form"
        onChange={(data) => {
          args.onChange(data)
        }}
      />
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const ageInput = await canvas.findByTestId('age__storybook____age')
    await userEvent.clear(ageInput)
    await userEvent.type(ageInput, '150')
    ageInput.blur()
    await expect(ageInput).toHaveValue(150)
    await userEvent.click(ageInput)
    ageInput.blur()
    await expect(
      canvas.findByText('Age must be between 12 and 120')
    ).resolves.toBeInTheDocument()
  }
}

export const AgeFieldInteractionEmpty: StoryObj<typeof FormFieldGenerator> = {
  name: 'Empty (required)',
  parameters: {
    layout: 'centered',
    chromatic: { disableSnapshot: true }
  },
  render: function Component(args) {
    return (
      <StyledFormFieldGenerator
        {...args}
        fields={fields}
        id="my-form"
        onChange={(data) => {
          args.onChange(data)
        }}
      />
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const ageInput = await canvas.findByTestId('age__storybook____age')
    await userEvent.clear(ageInput)
    await userEvent.click(ageInput)
    ageInput.blur()
    await expect(canvas.findByText('Required')).resolves.toBeInTheDocument()
  }
}

export const AgeFieldInteractionDigits: StoryObj<typeof FormFieldGenerator> = {
  name: '5 digits',
  parameters: {
    layout: 'centered',
    chromatic: { disableSnapshot: true }
  },
  render: function Component(args) {
    return (
      <StyledFormFieldGenerator
        {...args}
        fields={fields}
        id="my-form"
        onChange={(data) => {
          args.onChange(data)
        }}
      />
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const ageInput = await canvas.findByTestId('age__storybook____age')
    await userEvent.clear(ageInput)
    await userEvent.type(ageInput, '12345')
    ageInput.blur()
    await expect(ageInput).toHaveValue(123)
  }
}
