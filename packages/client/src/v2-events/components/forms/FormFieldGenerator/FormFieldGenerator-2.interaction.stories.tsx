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
    id: 'form.header',
    type: FieldType.PAGE_HEADER,
    label: generateTranslationConfig('Form Header'),
    defaultValue: 'Membership Application Form'
  },

  {
    id: 'form.divider',
    type: FieldType.DIVIDER,
    label: generateTranslationConfig('Section Divider')
  },

  {
    id: 'applicant.name',
    type: FieldType.NAME,
    label: generateTranslationConfig('Applicant Name'),
    defaultValue: {
      firstname: 'John',
      middlename: 'Michael',
      surname: 'Doe'
    },
    configuration: {
      name: {
        firstname: {
          required: true,
          label: generateTranslationConfig('First Name')
        },
        middlename: {
          required: false,
          label: generateTranslationConfig('Middle Name')
        },
        surname: {
          required: true,
          label: generateTranslationConfig('Surname')
        }
      },
      order: ['firstname', 'middlename', 'surname'],
      maxLength: 100,
      prefix: generateTranslationConfig('Full Legal Name'),
      postfix: generateTranslationConfig('Match your ID documents')
    }
  },

  {
    id: 'applicant.age',
    type: FieldType.NUMBER,
    label: generateTranslationConfig('Age'),
    defaultValue: 30,
    configuration: {
      min: 10,
      max: 60,
      prefix: generateTranslationConfig('Years'),
      postfix: generateTranslationConfig('Old')
    }
  },

  {
    id: 'applicant.bio',
    type: FieldType.TEXTAREA,
    label: generateTranslationConfig('Biography'),
    defaultValue: 'Short biography about the applicant...',
    configuration: {
      maxLength: 1000,
      rows: 4,
      cols: 100,
      prefix: generateTranslationConfig('Start with your background'),
      postfix: generateTranslationConfig('Keep it under 1000 characters')
    }
  },

  {
    id: 'applicant.photo',
    type: FieldType.FILE,
    label: generateTranslationConfig('Applicant Photo'),
    defaultValue: {
      path: '/uploads/photo.png',
      type: 'image/png',
      originalFilename: 'profile.png'
    },
    configuration: {
      maxFileSize: 1024,
      acceptedFileTypes: ['image/png'],
      style: { width: 'full' },
      fileName: generateTranslationConfig('Upload a recent passport-size photo')
    }
  },

  {
    id: 'applicant.signature',
    type: FieldType.SIGNATURE,
    label: generateTranslationConfig('Signature'),
    signaturePromptLabel: generateTranslationConfig(
      'Please sign inside the box'
    ),
    defaultValue: 'Signed by Applicant',
    configuration: { maxFileSize: 1024, acceptedFileTypes: ['image/png'] }
  },

  {
    id: 'applicant.email',
    type: FieldType.EMAIL,
    label: generateTranslationConfig('Email'),
    configuration: { maxLength: 100 },
    defaultValue: 'applicant@example.com'
  },

  {
    id: 'applicant.phone',
    type: FieldType.PHONE,
    label: generateTranslationConfig('Phone Number'),
    defaultValue: '+8801712345678'
  },

  {
    id: 'applicant.password',
    type: FieldType.TEXT,
    label: generateTranslationConfig('Password'),
    defaultValue: 'StrongPassword123!',
    configuration: {
      maxLength: 100
    }
  },

  {
    id: 'applicant.nationalId',
    type: FieldType.ID,
    label: generateTranslationConfig('National ID'),
    defaultValue: '1234567890'
  },

  {
    id: 'applicant.country',
    type: FieldType.COUNTRY,
    label: generateTranslationConfig('Country'),
    defaultValue: 'Bangladesh'
  },

  {
    id: 'applicant.region',
    type: FieldType.ADMINISTRATIVE_AREA,
    label: generateTranslationConfig('Region'),
    defaultValue: 'Dhaka',
    configuration: {
      partOf: { $declaration: 'country' },
      type: 'ADMIN_STRUCTURE'
    }
  },

  {
    id: 'applicant.address',
    type: FieldType.ADDRESS,
    label: generateTranslationConfig('Applicant Address'),
    configuration: {
      lineSeparator: ', ',
      fields: ['country', 'administrativeArea'],
      administrativeLevels: ['LEVEL_1', 'LEVEL_2'],
      streetAddressForm: [
        {
          id: 'street',
          type: 'TEXT',
          label: generateTranslationConfig('Street'),
          required: false
        }
      ]
    },
    defaultValue: {
      country: 'Bangladesh',
      addressType: 'DOMESTIC'
    }
  },

  {
    id: 'applicant.documents',
    type: FieldType.FILE_WITH_OPTIONS,
    label: generateTranslationConfig('Supporting Documents'),
    options: [
      {
        label: generateTranslationConfig('National ID Copy'),
        value: 'nidCopy'
      },
      {
        label: generateTranslationConfig('Passport Copy'),
        value: 'passportCopy'
      }
    ],
    defaultValue: [
      {
        path: '/uploads/nid.png',
        type: 'image/png',
        originalFilename: 'nid.png',
        option: 'nidCopy'
      }
    ],
    configuration: {
      maxFileSize: 1000000,
      acceptedFileTypes: ['image/png', 'image/jpeg']
    }
  },

  {
    id: 'membership.type',
    type: FieldType.RADIO_GROUP,
    label: generateTranslationConfig('Membership Type'),
    defaultValue: 'standard',
    options: [
      { label: generateTranslationConfig('Standard'), value: 'standard' },
      { label: generateTranslationConfig('Premium'), value: 'premium' }
    ],
    configuration: { styles: { size: 'NORMAL' } }
  },

  {
    id: 'membership.level',
    type: FieldType.SELECT,
    label: generateTranslationConfig('Membership Level'),
    defaultValue: 'silver',
    options: [
      { label: generateTranslationConfig('Bronze'), value: 'bronze' },
      { label: generateTranslationConfig('Silver'), value: 'silver' },
      { label: generateTranslationConfig('Gold'), value: 'gold' }
    ]
  },

  {
    id: 'membership.startDate',
    type: FieldType.DATE,
    label: generateTranslationConfig('Start Date'),
    defaultValue: '2025-01-01',
    configuration: {
      notice: generateTranslationConfig(
        'Membership will be active from this date'
      )
    }
  },

  {
    id: 'membership.startTime',
    type: FieldType.TIME,
    label: generateTranslationConfig('Start Time'),
    defaultValue: '09:00',
    configuration: {
      notice: generateTranslationConfig('Preferred starting time for services')
    }
  },

  {
    id: 'membership.duration',
    type: FieldType.DATE_RANGE,
    label: generateTranslationConfig('Membership Duration'),
    defaultValue: { start: '2025-01-01', end: '2025-12-31' },
    configuration: {
      notice: generateTranslationConfig('Select the full membership duration')
    }
  },

  {
    id: 'membership.trainingPeriod',
    type: FieldType.SELECT_DATE_RANGE,
    label: generateTranslationConfig('Training Period'),
    defaultValue: 'last30Days',
    options: [
      { label: generateTranslationConfig('Last 7 Days'), value: 'last7Days' },
      { label: generateTranslationConfig('Last 30 Days'), value: 'last30Days' }
    ]
  },

  {
    id: 'membership.facility',
    type: FieldType.FACILITY,
    label: generateTranslationConfig('Facility'),
    defaultValue: 'Gym Hall'
  },

  {
    id: 'membership.office',
    type: FieldType.OFFICE,
    label: generateTranslationConfig('Membership Office'),
    defaultValue: 'Head Office'
  },

  {
    id: 'membership.apiCheck',
    type: FieldType.HTTP,
    label: generateTranslationConfig('API Membership Check'),
    defaultValue: { loading: false, data: null, error: null },
    configuration: {
      trigger: { $$field: 'membership.type' },
      url: '/api/membership/check',
      method: 'GET',
      headers: { Authorization: 'Bearer token' },
      body: {},
      params: { membershipId: '12345' },
      timeout: 5000
    }
  },

  {
    id: 'club.rules',
    type: FieldType.PARAGRAPH,
    label: generateTranslationConfig('Club Rules'),
    defaultValue: 'All members must follow club guidelines and regulations.',
    configuration: {
      styles: { fontVariant: 'reg12', hint: true }
    }
  },

  {
    id: 'club.benefits',
    type: FieldType.BULLET_LIST,
    label: generateTranslationConfig('Club Benefits'),
    defaultValue: 'Exclusive access to facilities',
    items: [
      generateTranslationConfig('Discounted events'),
      generateTranslationConfig('Priority bookings')
    ],
    configuration: { styles: { fontVariant: 'reg12' } }
  },

  {
    id: 'club.dataSummary',
    type: FieldType.DATA,
    label: generateTranslationConfig('Data Summary'),
    configuration: {
      subtitle: generateTranslationConfig('Membership Overview'),
      data: [
        {
          value: 'Active',
          label: generateTranslationConfig('Status')
        },
        { fieldId: 'membership.type' }
      ]
    }
  },

  {
    id: 'consent.termsAccepted',
    type: FieldType.CHECKBOX,
    label: generateTranslationConfig('Accept Terms & Conditions'),
    defaultValue: false
  }
] satisfies FieldConfig[]

const declaration = {
  'tennis-member.form.header': 'Membership Application Form',
  'tennis-member.form.divider': undefined,
  'tennis-member.applicant.firstname': 'John',
  'tennis-member.applicant.middlename': 'Michael',
  'tennis-member.applicant.surname': 'Doe',
  'tennis-member.applicant.age': 30,
  'tennis-member.applicant.bio': 'Short biography about the applicant...',
  'tennis-member.applicant.photo': {
    path: '/uploads/photo.png',
    type: 'image/png',
    originalFilename: 'profile.png'
  },
  'tennis-member.applicant.signature': 'Signed by Applicant',
  'tennis-member.applicant.email': 'applicant@example.com',
  'tennis-member.applicant.phone': '+8801712345678',
  'tennis-member.applicant.password': 'StrongPassword123!',
  'tennis-member.applicant.nationalId': '1234567890',
  'tennis-member.applicant.country': 'Bangladesh',
  'tennis-member.applicant.region': 'Dhaka',
  'tennis-member.applicant.address': {
    country: 'Bangladesh',
    addressType: 'DOMESTIC'
  },
  'tennis-member.applicant.documents': [
    {
      path: '/uploads/nid.png',
      type: 'image/png',
      originalFilename: 'nid.png',
      option: 'nidCopy'
    }
  ],
  'tennis-member.membership.type': 'standard',
  'tennis-member.membership.level': 'silver',
  'tennis-member.membership.startDate': '2025-01-01',
  'tennis-member.membership.startTime': '09:00',
  'tennis-member.membership.duration': {
    start: '2025-01-01',
    end: '2025-12-31'
  },
  'tennis-member.membership.trainingPeriod': 'last30Days',
  'tennis-member.membership.facility': 'Gym Hall',
  'tennis-member.membership.office': 'Head Office',
  'tennis-member.membership.apiCheck': {
    loading: false,
    data: null,
    error: null
  },
  'tennis-member.club.rules':
    'All members must follow club guidelines and regulations.',
  'tennis-member.club.benefits': 'Exclusive access to facilities',
  'tennis-member.club.dataSummary': undefined,
  'tennis-member.consent.termsAccepted': false
} satisfies EventState

export const DisabledFormFields: StoryObj<typeof FormFieldGenerator> = {
  name: 'Disable state with every type of field',
  parameters: {
    layout: 'centered',
    chromatic: { disableSnapshot: true }
  },
  render: function Component(args) {
    return (
      <StyledFormFieldGenerator
        fields={fields.map((f) => ({
          ...f,
          // Make all fields disabled
          disabled: true
        }))}
        id="my-form"
        initialValues={declaration}
        onChange={(data) => {
          args.onChange(data)
        }}
      />
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('All form fields should be disabled', async () => {
      // Find all kind of input fields and expect them to be disabled
      const formFields = [
        ...(await canvas.findAllByRole('textbox')),
        ...(await canvas.findAllByRole('spinbutton')),
        ...(await canvas.findAllByRole('checkbox')),
        ...(await canvas.findAllByRole('radio'))
      ]

      for (const f of formFields) {
        await expect(f).toBeDisabled()
      }
    })
  }
}

export const EnabledFormFields: StoryObj<typeof FormFieldGenerator> = {
  name: 'Enable state with every type of field',
  parameters: {
    layout: 'centered',
    chromatic: { disableSnapshot: true }
  },
  render: function Component(args) {
    return (
      <StyledFormFieldGenerator
        fields={fields.map((f) => {
          if (f.type === FieldType.DATE_RANGE) {
            return {
              ...f,
              defaultValue: '2025-12-31',
              disabled: false,
              configuration: { ...f.configuration, notice: undefined }
            }
          }
          return {
            ...f,
            // Make all fields disabled
            disabled: false
          }
        })}
        id="my-form"
        initialValues={declaration}
        onChange={(data) => {
          args.onChange(data)
        }}
      />
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('All form fields should be enable', async () => {
      // Find all kind of input fields and expect them to be disabled
      const formFields = [
        ...(await canvas.findAllByRole('textbox')),
        ...(await canvas.findAllByRole('spinbutton')),
        ...(await canvas.findAllByRole('checkbox')),
        ...(await canvas.findAllByRole('radio'))
      ]

      for (const f of formFields) {
        await expect(f).not.toBeDisabled()
      }
    })
  }
}
