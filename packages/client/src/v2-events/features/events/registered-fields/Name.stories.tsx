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
import React from 'react'
import styled from 'styled-components'
import { FieldType, NameField } from '@opencrvs/commons/client'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { TRPCProvider } from '@client/v2-events/trpc'
import { FormFieldGeneratorProps } from '@client/v2-events/components/forms/FormFieldGenerator/FormFieldGenerator'
import { ValueOutput } from '../components/Output'
import { withValidatorContext } from '../../../../../.storybook/decorators'

const nameField = {
  id: 'storybook.name',
  type: FieldType.NAME,
  label: {
    id: 'storybook.name.label',
    defaultMessage: 'Name',
    description: 'The title for the name input'
  },
  configuration: {
    name: {
      firstname: { required: true },
      surname: { required: true }
    }
  }
} satisfies NameField

const StyledFormFieldGenerator = styled(FormFieldGenerator)`
  width: 400px;
`

const meta: Meta<FormFieldGeneratorProps> = {
  title: 'Inputs/Name',
  component: FormFieldGenerator,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    validatorContext: { control: false }
  },
  args: {
    fields: [nameField]
  },
  render: (args) => {
    const [form, setForm] = React.useState(args.formValues)
    const [touched, setTouched] = React.useState(args.formTouched)
    return (
      <StyledFormFieldGenerator
        {...args}
        formTouched={touched}
        formValues={form}
        id="name-form"
        onFormChange={setForm}
        onTouchedChange={setTouched}
      />
    )
  },
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

type Story = StoryObj<typeof FormFieldGenerator>

export const Basic: Story = {
  name: 'First Name and Last name required, no Middle name'
}

export const WithRequiredErrorsShown: Story = {
  name: 'Required errors visible',
  args: {
    formTouched: {
      'storybook.name': {
        firstname: true,
        surname: true
      }
    }
  }
}

export const OptionalMiddleName: Story = {
  name: 'First Name and Last name required with optional Middle name',
  args: {
    fields: [
      {
        ...nameField,
        configuration: {
          ...nameField.configuration,
          name: {
            ...nameField.configuration.name,
            middlename: { required: false }
          }
        }
      }
    ]
  }
}

export const WithAllOptions: Story = {
  name: 'With custom label and field ordering',
  parameters: {
    layout: 'centered'
  },
  args: {
    formValues: {
      'storybook.name': {
        firstname: '',
        surname: ''
      }
    }
  },
  render: function Component(args) {
    const [form, setForm] = React.useState(args.formValues)
    const [touched, setTouched] = React.useState(args.formTouched)

    const field: NameField = {
      ...nameField,
      configuration: {
        order: ['surname', 'firstname', 'middlename'],
        name: {
          firstname: {
            required: false,
            label: {
              id: 'storybook.name.custom.firstname.label',
              defaultMessage: 'My firstname label',
              description: 'The title for the name input'
            }
          },
          middlename: {
            required: false,
            label: {
              id: 'storybook.name.custom.middlename.label',
              defaultMessage: 'My middlename label',
              description: 'The title for the name input'
            }
          },
          surname: {
            required: false,
            label: {
              id: 'storybook.name.custom.surname.label',
              defaultMessage: 'My surname label',
              description: 'The title for the name input'
            }
          }
        }
      }
    }

    return (
      <div>
        <strong>{'Current Value:'}</strong>
        <ValueOutput config={field} value={form['storybook.name'] ?? {}} />
        <br />
        <br />
        <strong>{'Form:'}</strong>

        <StyledFormFieldGenerator
          {...args}
          formTouched={touched}
          formValues={form}
          id="name-form"
          onFormChange={setForm}
          onTouchedChange={setTouched}
        />
      </div>
    )
  }
}
