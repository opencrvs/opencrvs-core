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

import type { Meta, StoryFn, StoryObj } from '@storybook/react'
import React from 'react'
import styled from 'styled-components'
import { fn } from '@storybook/test'
import {
  and,
  field,
  FieldType,
  SelectOption,
  not
} from '@opencrvs/commons/client'
import {
  FormFieldGenerator,
  FormFieldGeneratorProps
} from '@client/v2-events/components/forms/FormFieldGenerator/FormFieldGenerator'
import { TRPCProvider } from '@client/v2-events/trpc'
import { withValidatorContext } from '../../../../../.storybook/decorators'
import { NumberWithUnit } from './NumberWithUnit'

const meta: Meta<FormFieldGeneratorProps> = {
  title: 'Inputs/NumberWithUnit',
  component: FormFieldGenerator,
  args: { onChange: fn() },
  argTypes: {},
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

const unitOfTimeOptions: SelectOption[] = [
  {
    value: 'Years',
    label: {
      id: 'unit.years',
      defaultMessage: 'Years',
      description: 'Years'
    }
  },
  {
    value: 'Months',
    label: {
      id: 'unit.months',
      defaultMessage: 'Months',
      description: 'Months'
    }
  },
  {
    value: 'Weeks',
    label: {
      id: 'unit.weeks',
      defaultMessage: 'Weeks',
      description: 'Weeks'
    }
  },
  {
    value: 'Days',
    label: {
      id: 'unit.days',
      defaultMessage: 'Days',
      description: 'Days'
    }
  },
  {
    value: 'Hours',
    label: {
      id: 'unit.hours',
      defaultMessage: 'Hours',
      description: 'Hours'
    }
  },
  {
    value: 'Minutes',
    label: {
      id: 'unit.minutes',
      defaultMessage: 'Minutes',
      description: 'Minutes'
    }
  }
]

const unitOfCurrencyOptions: SelectOption[] = [
  {
    value: 'USD',
    label: {
      id: 'currency.usd',
      defaultMessage: 'USD',
      description: 'USD'
    }
  },
  {
    value: 'EUR',
    label: {
      id: 'currency.eur',
      defaultMessage: 'EUR',
      description: 'EUR'
    }
  },
  {
    value: 'GBP',
    label: {
      id: 'currency.gbp',
      defaultMessage: 'GBP',
      description: 'GBP'
    }
  }
]

export const SymptomDuration: StoryObj<typeof FormFieldGenerator> = {
  name: 'Symptom Duration',
  parameters: {
    layout: 'centered'
  },
  render: function Component(args) {
    const [formData, setFormData] = React.useState({})
    return (
      <StyledFormFieldGenerator
        {...args}
        fields={[
          {
            id: 'child.birthDuration',
            type: FieldType.NUMBER_WITH_UNIT,
            label: {
              id: 'storybook.duration.label',
              defaultMessage: 'Duration',
              description: 'The title for the duration input'
            },
            options: unitOfTimeOptions,
            required: true,
            placeholder: {
              id: 'storybook.duration.placeholder',
              defaultMessage: 'Time Unit',
              description: 'This is the placeholder for the duration input'
            },
            configuration: {
              min: 0,
              numberFieldPlaceholder: {
                id: 'storybook.duration.numberFieldPlaceholder',
                defaultMessage: 'Interval',
                description: 'This is the placeholder for the number field'
              }
            },
            validation: [
              {
                message: {
                  defaultMessage: 'Number and unit required for registration',
                  description: 'This is the error message for invalid duration',
                  id: 'event.birth.action.declare.form.section.child.field.birthDuration.error'
                },
                validator: and(
                  field('child.birthDuration')
                    .get('numericValue')
                    .isGreaterThan(0),
                  not(field('child.birthDuration').get('unit').isFalsy())
                )
              }
            ]
          }
        ]}
        id="my-form"
        onChange={(data) => {
          args.onChange(data)
          setFormData(data)
        }}
      />
    )
  }
}

export const Fees: StoryObj<typeof FormFieldGenerator> = {
  name: 'Fees',
  parameters: {
    layout: 'centered'
  },
  render: function Component(args) {
    const [formData, setFormData] = React.useState({})
    return (
      <StyledFormFieldGenerator
        {...args}
        fields={[
          {
            id: 'storybook.name',
            type: FieldType.NUMBER_WITH_UNIT,
            label: {
              id: 'storybook.fees.label',
              defaultMessage: 'Fees',
              description: 'The title for the fees input'
            },
            options: unitOfCurrencyOptions,
            placeholder: {
              id: 'storybook.currency.placeholder',
              defaultMessage: 'Currency',
              description: 'This is the placeholder for the currency input'
            },
            configuration: {
              min: 0,
              numberFieldPlaceholder: {
                id: 'storybook.fees.numberFieldPlaceholder',
                defaultMessage: 'Fees',
                description: 'This is the placeholder for the number field'
              }
            }
          }
        ]}
        id="my-form"
        onChange={(data) => {
          args.onChange(data)
          setFormData(data)
        }}
      />
    )
  }
}

export const SymptomDurationOutput: StoryFn = () => {
  return <NumberWithUnit.Output value={{ numericValue: 7, unit: 'Days' }} />
}

export const FeesOutput: StoryFn = () => {
  return <NumberWithUnit.Output value={{ numericValue: 10, unit: 'USD' }} />
}
