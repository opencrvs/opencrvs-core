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
              id: 'storybook.duration.label',
              defaultMessage: 'Duration',
              description: 'The title for the duration input'
            },
            required: true,
            placeholder: {
              id: 'storybook.duration.placeholder',
              defaultMessage: 'Time Unit',
              description: 'This is the placeholder for the duration input'
            },
            configuration: {
              url: 'http://localhost:3040/causes-of-death?terms='
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

export const ICDOutput: StoryFn = () => {
  return <Autocomplete.Output value={{ value: 'C809', label: 'Cancer' }} />
}
