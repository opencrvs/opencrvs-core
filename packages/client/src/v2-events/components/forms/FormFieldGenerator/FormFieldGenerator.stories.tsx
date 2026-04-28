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
  FieldConfig,
  FieldType,
  generateTranslationConfig
} from '@opencrvs/commons/client'
import { FormFieldGenerator, FormFieldGeneratorPropsWithoutRef } from '@client/v2-events/components/forms/FormFieldGenerator'
import { TRPCProvider } from '@client/v2-events/trpc'
import { withValidatorContext } from '../../../../../.storybook/decorators'

const meta: Meta<typeof FormFieldGenerator> = {
  title: 'FormFieldGenerator/Helper Text',
  component: FormFieldGenerator,
  argTypes: {
    validatorContext: { control: false }
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

const StyledFormFieldGenerator = styled(FormFieldGenerator)`
  width: 400px;
`

const helperTextFields: FieldConfig[] = [
  {
    id: 'storybook.helperText.fullName',
    type: FieldType.TEXT,
    required: true,
    label: generateTranslationConfig('Full name'),
    helperText: generateTranslationConfig(
      'Enter your full legal name as shown on official documents.'
    )
  },
  {
    id: 'storybook.helperText.age',
    type: FieldType.NUMBER,
    label: generateTranslationConfig('Age'),
    helperText: generateTranslationConfig(
      'If exact date of birth is unknown, provide an estimated age.'
    )
  },
  {
    id: 'storybook.helperText.email',
    type: FieldType.EMAIL,
    label: generateTranslationConfig('Email'),
    helperText: generateTranslationConfig(
      'Use an email address that you can access for updates.'
    )
  },
  {
    id: 'storybook.helperText.phone',
    type: FieldType.PHONE,
    label: generateTranslationConfig('Phone number'),
    helperText: generateTranslationConfig(
      'Include country code, for example +880.'
    )
  },
  {
    id: 'storybook.helperText.notes',
    type: FieldType.TEXTAREA,
    label: generateTranslationConfig('Additional notes'),
    helperText: generateTranslationConfig(
      'Add context that may help a registrar review this declaration.'
    )
  },
  {
    id: 'storybook.helperText.relationship',
    type: FieldType.SELECT,
    label: generateTranslationConfig('Relationship to child'),
    options: [
      { label: generateTranslationConfig('Mother'), value: 'mother' },
      { label: generateTranslationConfig('Father'), value: 'father' },
      { label: generateTranslationConfig('Guardian'), value: 'guardian' }
    ],
    helperText: generateTranslationConfig(
      'Select the relationship of the informant.'
    )
  },
  {
    id: 'storybook.helperText.notificationPreference',
    type: FieldType.RADIO_GROUP,
    label: generateTranslationConfig('Notification preference'),
    options: [
      { label: generateTranslationConfig('SMS'), value: 'sms' },
      { label: generateTranslationConfig('Email'), value: 'email' }
    ],
    helperText: generateTranslationConfig(
      'Choose how you would like to receive status updates.'
    )
  },
  {
    id: 'storybook.helperText.birthDate',
    type: FieldType.DATE,
    label: generateTranslationConfig('Date of birth'),
    helperText: generateTranslationConfig(
      'Enter date in day, month, year format.'
    )
  },
  {
    id: 'storybook.helperText.birthTime',
    type: FieldType.TIME,
    label: generateTranslationConfig('Time of birth'),
    helperText: generateTranslationConfig(
      'Use 24-hour format when exact time is known.'
    )
  },
  {
    id: 'storybook.helperText.duration',
    type: FieldType.DATE_RANGE,
    label: generateTranslationConfig('Hospital stay period'),
    helperText: generateTranslationConfig(
      'Provide start and end dates for the hospital stay.'
    )
  }
]

export const HelperTextShowcase: StoryObj<FormFieldGeneratorPropsWithoutRef> = {
  parameters: {
    layout: 'centered'
  },
  render: function Component(args) {
    return (
      <StyledFormFieldGenerator
        {...args}
        fields={helperTextFields}
        id="storybook-helper-text-form"
      />
    )
  }
}
