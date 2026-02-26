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
import {
  ConditionalType,
  FieldConfig,
  FieldType,
  generateTranslationConfig,
  not,
  field
} from '@opencrvs/commons/client'

import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { TRPCProvider } from '@client/v2-events/trpc'
import { withValidatorContext } from '../../../../../.storybook/decorators'

const addressFields = [
  {
    id: 'storybook.address',
    type: FieldType.FIELD_GROUP,
    label: generateTranslationConfig('Address'),
    fields: [
      {
        id: 'country',
        type: FieldType.COUNTRY,
        required: true,
        label: generateTranslationConfig('Country')
      },
      {
        id: 'province',
        type: FieldType.ADMINISTRATIVE_AREA,
        required: true,
        label: generateTranslationConfig('Province'),
        parent: field('storybook.address').get('country'),
        configuration: {
          type: 'ADMIN_STRUCTURE'
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: field('storybook.address')
              .get('country')
              .isEqualTo('BGD')
          }
        ]
      },
      {
        id: 'district',
        type: FieldType.ADMINISTRATIVE_AREA,
        required: false,
        label: generateTranslationConfig('District'),
        parent: field('storybook.address').get('province'),
        configuration: {
          type: 'ADMIN_STRUCTURE',
          partOf: field('storybook.address').get('province')
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: not(
              field('storybook.address').get('province').isFalsy()
            )
          }
        ]
      }
    ]
  }
] satisfies FieldConfig[]

const StyledFormFieldGenerator = styled(FormFieldGenerator)`
  width: 400px;
`

const meta: Meta<typeof FormFieldGenerator> = {
  title: 'Inputs/FieldGroup',
  args: {
    id: 'address-form',
    fields: addressFields,
    formValues: {
      'storybook.address': {
        country: 'BGD',
        //The address value clashes with "ADDRESS" field value
        //@ts-ignore
        province: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c',
        district: '62a0ccb4-880d-4f30-8882-f256007dfff9'
      }
    }
  },
  parameters: {
    layout: 'centered'
  },
  decorators: [
    (Story, context) => (
      <TRPCProvider>
        <Story {...context} />
      </TRPCProvider>
    ),
    withValidatorContext
  ],
  component: StyledFormFieldGenerator
}

export default meta

type Story = StoryObj<typeof FormFieldGenerator>

export const Basic: Story = {
  name: 'Address field with optional location level'
}

export const WithOptionalLocationLevel: Story = {
  name: 'Address field with error shown',
  args: {
    formValues: {
      //The address value clashes with "ADDRESS" field value
      //@ts-ignore
      ['storybook.address']: {
        country: 'BGD'
      }
    },
    formTouched: {
      ['storybook.address']: {
        country: true,
        province: true
      }
    }
  }
}
