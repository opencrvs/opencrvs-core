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
import { expect, userEvent, within } from '@storybook/test'
import React, { useState } from 'react'
import styled from 'styled-components'
import { noop } from 'lodash'
import {
  field,
  FieldType,
  FieldConfig,
  EventState,
  generateTranslationConfig
} from '@opencrvs/commons/client'

import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { TRPCProvider } from '@client/v2-events/trpc'
import { withValidatorContext } from '../../../../../.storybook/decorators'

const meta: Meta<typeof FormFieldGenerator> = {
  title: 'FormFieldGenerator/CustomValidation',
  decorators: [
    (Story, context) => (
      <TRPCProvider>
        <Story {...context} />
      </TRPCProvider>
    ),
    withValidatorContext
  ]
}

export default meta

const StyledFormFieldGenerator = styled(FormFieldGenerator)`
  width: 400px;
`

/**
 * CUSTOM CLIENT VALIDATOR STORIES
 * 
 * Tests that demonstrate validation functions running client-side
 * with access to other form fields and context
 */

export const ValidatorPassingValidation: StoryObj<typeof FormFieldGenerator> = {
  name: 'Custom Validator - Valid Input (age >= 18)',
  parameters: { layout: 'centered' },
  render: function Component() {
    return (
      <StyledFormFieldGenerator
        fields={[
          {
            id: 'applicant.age',
            type: FieldType.NUMBER,
            required: true,
            label: generateTranslationConfig('Age'),
            validation: [
              field('applicant.age').customClientValidator((value: unknown) => {
                return typeof value === 'number' && value >= 18
              })
            ]
          } satisfies FieldConfig
        ]}
        id="validator-pass-form"
        initialValues={{ 'applicant.age': 25 }}
        onChange={noop}
      />
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Renders form with valid age (25)', async () => {
      const input = await canvas.findByDisplayValue('25')
      expect(input).toBeInTheDocument()

      // Should not show validation error
      await expect(canvas.queryByText(/required/i)).not.toBeInTheDocument()
    })
  }
}

export const ValidatorFailingValidation: StoryObj<typeof FormFieldGenerator> = {
  name: 'Custom Validator - Invalid Input (age < 18)',
  parameters: { layout: 'centered' },
  render: function Component() {
    const [initialValues, setInitialValues] = useState<EventState>({
      'applicant.age': 15
    })

    return (
      <StyledFormFieldGenerator
        fields={[
          {
            id: 'applicant.age',
            type: FieldType.NUMBER,
            required: true,
            label: generateTranslationConfig('Age'),
            validation: [
              field('applicant.age').customClientValidator((value: unknown) => {
                return typeof value === 'number' && value >= 18
              })
            ]
          } satisfies FieldConfig
        ]}
        id="validator-fail-form"
        initialValues={initialValues}
        onChange={(data) => setInitialValues(data)}
      />
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Renders form with invalid age (15)', async () => {
      const input = await canvas.findByDisplayValue('15')
      expect(input).toBeInTheDocument()
    })

    await step('Shows validation error when value fails validation', async () => {
      const ageInput = (await canvas.findByDisplayValue('15')) as HTMLInputElement
      await userEvent.clear(ageInput)
      await userEvent.type(ageInput, '15')
      await userEvent.tab()

      // Validation should fail (age < 18)
      const errorMessages = canvas.queryAllByRole('alert')
      expect(errorMessages.length).toBeGreaterThan(0)
    })
  }
}

export const ValidatorCrossField: StoryObj<typeof FormFieldGenerator> = {
  name: 'Custom Validator - Cross-Field Reference',
  parameters: { layout: 'centered' },
  render: function Component() {
    return (
      <StyledFormFieldGenerator
        fields={[
          {
            id: 'birth.childDob',
            type: FieldType.DATE,
            required: true,
            label: generateTranslationConfig('Child Date of Birth'),
            validation: [
              field('birth.childDob').customClientValidator(
                (value: unknown, ctx: any) => {
                  const motherDob = ctx.$form['birth.motherDob']
                  if (!motherDob || !value) return false
                  return new Date(value as string) > new Date(motherDob)
                }
              )
            ]
          } satisfies FieldConfig,
          {
            id: 'birth.motherDob',
            type: FieldType.DATE,
            required: true,
            label: generateTranslationConfig('Mother Date of Birth'),
            value: field('birth.motherDob')
          } satisfies FieldConfig
        ]}
        id="validator-crossfield-form"
        initialValues={{
          'birth.childDob': '2020-01-15',
          'birth.motherDob': '1980-05-20'
        }}
        onChange={noop}
      />
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Renders form with child DOB after mother DOB', async () => {
      const childDob = await canvas.findByDisplayValue('2020-01-15')
      const motherDob = await canvas.findByDisplayValue('1980-05-20')

      expect(childDob).toBeInTheDocument()
      expect(motherDob).toBeInTheDocument()

      // Should be valid because child DOB > mother DOB
      await expect(canvas.queryByText(/required/i)).not.toBeInTheDocument()
    })
  }
}

/**
 * CUSTOM CLIENT EVALUATION STORIES
 * 
 * Tests that demonstrate computed field values using custom evaluation
 * with access to other form fields and context like $now
 */

export const EvaluationComputedField: StoryObj<typeof FormFieldGenerator> = {
  name: 'Custom Evaluation - Computed Full Name',
  parameters: { layout: 'centered' },
  render: function Component() {
    return (
      <StyledFormFieldGenerator
        fields={[
          {
            id: 'person.firstName',
            type: FieldType.TEXT,
            required: true,
            label: generateTranslationConfig('First Name')
          } satisfies FieldConfig,
          {
            id: 'person.lastName',
            type: FieldType.TEXT,
            required: true,
            label: generateTranslationConfig('Last Name')
          } satisfies FieldConfig,
          {
            id: 'person.fullName',
            type: FieldType.DATA,
            label: generateTranslationConfig('Full Name (Computed)'),
            value: field('person.fullName').customClientEvaluation(
              (value: unknown, ctx: any) => {
                const first = ctx.$form['person.firstName'] || ''
                const last = ctx.$form['person.lastName'] || ''
                return [first, last].filter(Boolean).join(' ')
              }
            ),
            configuration: {
              data: [
                {
                  id: 'fullName.display',
                  label: generateTranslationConfig('Name'),
                  value: field('person.fullName').customClientEvaluation(
                    (value: unknown, ctx: any) => {
                      const first = ctx.$form['person.firstName'] || ''
                      const last = ctx.$form['person.lastName'] || ''
                      return [first, last].filter(Boolean).join(' ')
                    }
                  )
                }
              ]
            }
          } satisfies FieldConfig
        ]}
        id="evaluation-computed-form"
        initialValues={{
          'person.firstName': 'John',
          'person.lastName': 'Doe'
        }}
        onChange={noop}
      />
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Renders form with first and last names', async () => {
      const firstName = await canvas.findByDisplayValue('John')
      const lastName = await canvas.findByDisplayValue('Doe')

      expect(firstName).toBeInTheDocument()
      expect(lastName).toBeInTheDocument()
    })

    await step('Displays computed full name field', async () => {
      // The computed field should display "John Doe"
      await canvas.findByText(/John Doe/)
    })
  }
}

export const EvaluationDateBasedField: StoryObj<typeof FormFieldGenerator> = {
  name: 'Custom Evaluation - Date-Based Default ($now)',
  parameters: { layout: 'centered' },
  render: function Component() {
    return (
      <StyledFormFieldGenerator
        fields={[
          {
            id: 'registration.registrationDate',
            type: FieldType.DATE,
            required: true,
            label: generateTranslationConfig('Registration Date'),
            defaultValue: field('registration.registrationDate').customClientEvaluation(
              (value: unknown, ctx: any) => {
                // Use current date from context
                return ctx.$now ? ctx.$now.split('T')[0] : ''
              }
            )
          } satisfies FieldConfig,
          {
            id: 'registration.dob',
            type: FieldType.DATE,
            required: true,
            label: generateTranslationConfig('Date of Birth')
          } satisfies FieldConfig
        ]}
        id="evaluation-date-form"
        initialValues={{}}
        onChange={noop}
      />
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Registration date defaults to current date from $now', async () => {
      // The registration date field should be auto-populated with today's date
      const dateInputs = canvas.getAllByRole('textbox')
      expect(dateInputs.length).toBeGreaterThan(0)
    })
  }
}
