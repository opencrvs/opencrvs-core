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
import { expect, fireEvent, fn, userEvent, within } from '@storybook/test'
import React from 'react'
import styled from 'styled-components'
import {
  ConditionalType,
  field,
  FieldType,
  not,
  FieldConfig,
  EventState,
  generateTranslationConfig
} from '@opencrvs/commons/client'

import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { TRPCProvider } from '@client/v2-events/trpc'

const meta: Meta<typeof FormFieldGenerator> = {
  title: 'FormFieldGenerator/Interaction',
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
  width: '400px';
`

const fields = [
  {
    id: 'tennis-member.dob',
    type: FieldType.DATE,
    required: true,
    label: {
      defaultMessage: 'Date of birth',
      description: 'This is the label for the field',
      id: 'v2.event.birth.action.declare.form.section.person.field.dob.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: not(field('tennis-member.dobUnknown').isEqualTo(true))
      }
    ]
  },
  {
    id: 'tennis-member.dobUnknown',
    type: FieldType.CHECKBOX,
    required: false,
    label: {
      defaultMessage: 'Exact date of birth unknown',
      description: 'This is the label for the field',
      id: 'v2.event.birth.action.declare.form.section.person.field.age.checkbox.label'
    }
  },
  {
    id: 'tennis-member.age',
    type: FieldType.NUMBER,
    required: true,
    label: {
      defaultMessage: 'Age of the member',
      description: 'This is the label for the field',
      id: 'v2.event.birth.action.declare.form.section.tennis-member.field.age.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('tennis-member.dobUnknown').isEqualTo(true)
      }
    ]
  }
] satisfies FieldConfig[]

const declaration = {
  'tennis-member.dob': '2020-11-12',
  'tennis-member.dobUnknown': false
} satisfies EventState

/**
 * Test case for a bug where conditional values were not being updated correctly due to the wrong apply order of items.
 */
export const UpdateCondtionalValues: StoryObj<typeof FormFieldGenerator> = {
  name: 'Updating existing declaration with conditional values',
  parameters: {
    layout: 'centered',
    chromatic: { disableSnapshot: true }
  },
  render: function Component(args) {
    const [formData, setFormData] = React.useState<EventState>(declaration)
    return (
      <StyledFormFieldGenerator
        declaration={declaration}
        fields={fields}
        form={formData}
        id="my-form"
        initialValues={formData}
        setAllFieldsDirty={false}
        onChange={(data) => {
          args.onChange(data)
          setFormData(data)
        }}
      />
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Renders the form with correct initial values', async () => {
      await canvas.findByText('Date of birth')
      await canvas.findByDisplayValue(2020)
      await canvas.findByDisplayValue(11)
      await canvas.findByDisplayValue(12)

      await canvas.findByText('Exact date of birth unknown')
    })

    await step(
      'Hides date input when conditional checkbox is checked',
      async () => {
        await fireEvent.click(
          await canvas.findByText('Exact date of birth unknown')
        )

        await canvas.findByText('Age of the member')

        await expect(
          canvas.queryByText('Date of birth')
        ).not.toBeInTheDocument()
        await expect(canvas.queryByDisplayValue(2020)).not.toBeInTheDocument()
        await expect(canvas.queryByDisplayValue(11)).not.toBeInTheDocument()
        await expect(canvas.queryByDisplayValue(12)).not.toBeInTheDocument()
      }
    )

    await step('fills in age input', async () => {
      await userEvent.type(
        await canvas.findByTestId('number__tennis-member____age'),
        '75'
      )
    })

    await step(
      'Previous values are visible when checkbox is unchecked',
      async () => {
        await fireEvent.click(
          await canvas.findByText('Exact date of birth unknown')
        )
        await canvas.findByText('Date of birth')
        await canvas.findByDisplayValue(2020)
        await canvas.findByDisplayValue(11)
        await canvas.findByDisplayValue(12)

        await canvas.findByText('Exact date of birth unknown')
      }
    )
  }
}

const styles = ['defensive', 'allrounder', 'hard-hitter'] as const

const tennisStyleFields = [
  {
    id: 'tennis.style',
    type: FieldType.SELECT,
    required: true,
    label: generateTranslationConfig('tennis style'),
    options: [
      {
        label: generateTranslationConfig('defensive'),
        value: 'defensive'
      },
      {
        label: generateTranslationConfig('allrounder'),
        value: 'allrounder'
      },
      {
        label: generateTranslationConfig('hard-hitter'),
        value: 'hard-hitter'
      }
    ]
  },
  {
    id: `tennis.style.firstname`,
    type: FieldType.TEXT,
    required: true,
    label: generateTranslationConfig('first name'),
    parent: field('tennis.style')
  }
]

export const EmptiesWhenParentChanges: StoryObj<typeof FormFieldGenerator> = {
  name: 'Toggling parent field resets children',
  parameters: {
    layout: 'centered',
    chromatic: { disableSnapshot: true }
  },
  render: function Component(args) {
    const [formData, setFormData] = React.useState<EventState>({
      'tennis.style': 'defensive',
      'tennis.style.firstname': 'Roger'
    })
    return (
      <StyledFormFieldGenerator
        declaration={declaration}
        fields={tennisStyleFields}
        form={formData}
        id="my-form"
        initialValues={formData}
        setAllFieldsDirty={false}
        onChange={(data) => {
          args.onChange(data)
          setFormData(data)
        }}
      />
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Renders the form with correct initial values', async () => {
      await canvas.findByText('tennis style')
      await canvas.findByText('defensive')

      await canvas.findByText('first name')
      await canvas.findByDisplayValue('Roger')
    })

    await step(
      'Shows new, empty firstname input when selecting a different style',
      async () => {
        await userEvent.click(await canvas.findByText('defensive'))
        await userEvent.click(await canvas.findByText('allrounder'))

        await canvas.findByText('tennis style')
        await canvas.findByText('allrounder')
        await expect(canvas.queryByText('defensive')).not.toBeInTheDocument()

        await canvas.findByText('first name')
        await expect(
          canvas.queryByDisplayValue('Roger')
        ).not.toBeInTheDocument()
      }
    )

    await step('fills in first name for allrounder player', async () => {
      await userEvent.type(
        await canvas.findByTestId('text__tennis____style____firstname'),
        'Serena'
      )
    })

    await step(
      'Previous values are removed when selecting defensive style again',
      async () => {
        await userEvent.click(await canvas.findByText('allrounder'))
        await userEvent.click(await canvas.findByText('defensive'))

        await canvas.findByText('tennis style')
        await canvas.findByText('defensive')

        await expect(canvas.queryByText('allrounder')).not.toBeInTheDocument()

        await canvas.findByText('first name')

        await expect(
          canvas.queryByDisplayValue('Roger')
        ).not.toBeInTheDocument()
        await expect(
          canvas.queryByDisplayValue('Serena')
        ).not.toBeInTheDocument()
      }
    )
  }
}

export const RemovesErrorOnParentChange: StoryObj<typeof FormFieldGenerator> = {
  name: 'Error is reset when parent field changes',
  parameters: {
    layout: 'centered',
    chromatic: { disableSnapshot: true }
  },
  render: function Component(args) {
    const [formData, setFormData] = React.useState<EventState>({
      'tennis.style': 'defensive'
    })
    return (
      <StyledFormFieldGenerator
        declaration={declaration}
        fields={tennisStyleFields}
        form={formData}
        id="my-form"
        initialValues={formData}
        setAllFieldsDirty={false}
        onChange={(data) => {
          args.onChange(data)
          setFormData(data)
        }}
      />
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Renders error for required field', async () => {
      await canvas.findByText('tennis style')
      await canvas.findByText('defensive')

      await userEvent.click(
        await canvas.findByTestId('text__tennis____style____firstname')
      )
      await userEvent.click(await canvas.findByText('first name'))

      await canvas.findByText('Required for registration')
    })

    await step('Empties error when selecting a different style', async () => {
      await userEvent.click(await canvas.findByText('defensive'))
      await userEvent.click(await canvas.findByText('allrounder'))

      await canvas.findByText('tennis style')
      await canvas.findByText('allrounder')
      await expect(canvas.queryByText('defensive')).not.toBeInTheDocument()

      await expect(
        canvas.queryByText('Required for registration')
      ).not.toBeInTheDocument()
    })
  }
}
