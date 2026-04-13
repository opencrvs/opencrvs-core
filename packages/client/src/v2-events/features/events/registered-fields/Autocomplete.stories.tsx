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
  not,
  ConditionalType
} from '@opencrvs/commons/client'
import {
  FormFieldGenerator,
  FormFieldGeneratorProps
} from '@client/v2-events/components/forms/FormFieldGenerator/FormFieldGenerator'
import { TRPCProvider } from '@client/v2-events/trpc'
import { withValidatorContext } from '../../../../../.storybook/decorators'
import { Autocomplete } from './Autocomplete'

const meta: Meta<FormFieldGeneratorProps> = {
  title: 'Inputs/Autocomplete',
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
export const ICD: StoryObj<typeof FormFieldGenerator> = {
  name: 'ICD10 Autocomplete',
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
            id: 'symptom.icd10',
            type: FieldType.AUTOCOMPLETE,
            label: {
              id: 'storybook.icd10.label',
              defaultMessage:
                'Type to search from a preconfigured list of 50 types of cancers',
              description: 'The title for the icd10 input'
            },
            required: true,
            placeholder: {
              id: 'storybook.duration.placeholder',
              defaultMessage: 'Time Unit',
              description: 'This is the placeholder for the duration input'
            },
            configuration: {
              url: '/api/causes-of-death?terms=',
              defaultOptions: [
                { label: 'Enter symptom manually', value: 'OTHER' }
              ]
            }
          },
          {
            id: `symptom.icd10.other`,
            type: FieldType.TEXTAREA,
            required: false,
            analytics: true,
            label: {
              defaultMessage:
                'Enter the diagnosis or condition not found in the list above',
              description: 'This is the label for the field',
              id: `symptom.icd10.other.label`
            },
            conditionals: [
              {
                type: ConditionalType.SHOW,
                conditional: field('symptom.icd10')
                  .get('value')
                  .isEqualTo('OTHER')
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

export const ICDOutput: StoryFn = () => {
  return <Autocomplete.Output value={{ value: 'C809', label: 'Cancer' }} />
}
