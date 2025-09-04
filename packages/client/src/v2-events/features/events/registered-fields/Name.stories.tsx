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
import { fn } from '@storybook/test'
import React from 'react'
import styled from 'styled-components'
import { FieldType, NameField, NameFieldValue } from '@opencrvs/commons/client'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { TRPCProvider } from '@client/v2-events/trpc'
import { ValueOutput } from '../components/Output'

const meta: Meta<typeof FormFieldGenerator> = {
  title: 'Inputs/Name',
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
  width: 400px;
`

export const FirstNameLastNameRequired: StoryObj<typeof FormFieldGenerator> = {
  name: 'First Name and Last name required',
  parameters: {
    layout: 'centered'
  },
  render: function Component(args) {
    return (
      <StyledFormFieldGenerator
        fields={[
          {
            id: 'storybook.name',
            type: FieldType.NAME,
            label: {
              id: 'storybook.name.label',
              defaultMessage: 'Name',
              description: 'The title for the name input'
            }
          }
        ]}
        id="my-form"
        onChange={(data) => {
          args.onChange(data)
        }}
      />
    )
  }
}

export const FirstNameLastNameRequiredMiddleNameOptional: StoryObj<
  typeof FormFieldGenerator
> = {
  name: 'First Name and Last name required',
  parameters: {
    layout: 'centered'
  },
  render: function Component(args) {
    return (
      <StyledFormFieldGenerator
        fields={[
          {
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
                middlename: { required: false },
                surname: { required: true }
              }
            }
          }
        ]}
        id="my-form"
        onChange={(data) => {
          args.onChange(data)
        }}
      />
    )
  }
}

export const NameWithAllOptions: StoryObj<typeof FormFieldGenerator> = {
  name: 'With custom label and field ordering',
  parameters: {
    layout: 'centered'
  },
  render: function Component(args) {
    const [formState, setFormState] = React.useState<
      NameFieldValue | undefined
    >(undefined)

    const field: NameField = {
      id: 'storybook.name',
      type: FieldType.NAME,
      label: {
        id: 'storybook.name.label',
        defaultMessage: 'Name',
        description: 'The title for the name input'
      },
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
        <ValueOutput config={field} value={formState} />
        <br />
        <br />
        <strong>{'Form:'}</strong>

        <StyledFormFieldGenerator
          fields={[field]}
          id="storybook.name"
          onChange={(data) => {
            setFormState(data['storybook.name'] as NameFieldValue)
            args.onChange(data)
          }}
        />
      </div>
    )
  }
}
