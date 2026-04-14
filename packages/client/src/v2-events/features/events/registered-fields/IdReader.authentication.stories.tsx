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

import { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { fn } from '@storybook/test'
import styled from 'styled-components'
import {
  field,
  FieldConfig,
  FieldType,
  FieldValue,
  not,
  TestUserRole
} from '@opencrvs/commons/client'
import { Stack, Text } from '@opencrvs/components'
import { TRPCProvider } from '@client/v2-events/trpc'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { getTestValidatorContext } from '../../../../../.storybook/decorators'

interface Args {
  onChange: (data: unknown) => void
}

const meta: Meta<Args> = {
  title: 'ID Authentication',
  argTypes: {},
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
  width: 600px;
`

const qrMethod = {
  id: 'storybook.id-reader.qr',
  type: FieldType.QR_READER,
  label: {
    id: 'storybook.id-reader.qr.label',
    defaultMessage: 'Scan QR code',
    description: 'Label for QR code reader option'
  }
} as const

const authMethod = {
  id: 'storybook.id-reader.authentication',
  type: FieldType.LINK_BUTTON,
  label: {
    id: 'storybook.id-reader.authentication.label',
    defaultMessage: 'Use authentication',
    description: 'Label for authentication option'
  },
  configuration: {
    icon: 'Globe',
    url: 'https://fake-auth-service.opencrvs.org',
    text: {
      id: 'storybook.id-reader.authentication.button.label',
      defaultMessage: 'Authenticate online',
      description: 'Authentication button label'
    }
  }
} as const

const idReaderWithAuth: FieldConfig = {
  id: 'storybook.id-reader',
  type: FieldType.ID_READER,
  label: {
    id: 'storybook.id-reader.label',
    defaultMessage: 'ID Reader',
    description: 'ID Reader label'
  },
  methods: [qrMethod, authMethod],
  helperText: {
    id: 'storybook.id-reader.helperText',
    defaultMessage:
      'Scan the QR code on the ID card or authenticate online to fetch details.',
    description: 'Helper text for ID reader with authentication option'
  }
}

function paragraph(text: string): FieldConfig {
  return {
    id: 'storybook.paragraph.' + text.toLowerCase().replace(/\s+/g, '-'),
    type: FieldType.PARAGRAPH,
    label: {
      id:
        'storybook.paragraph.' +
        text.toLowerCase().replace(/\s+/g, '-') +
        '.label',
      defaultMessage: text,
      description: ''
    },
    configuration: {}
  }
}

const idReaderWithoutAuth: FieldConfig = {
  id: 'storybook.id-reader',
  type: FieldType.ID_READER,
  label: {
    id: 'storybook.id-reader.label',
    defaultMessage: 'ID Reader',
    description: 'ID Reader label'
  },
  methods: [qrMethod]
}

const requiredIdReaderWithAuth: FieldConfig = {
  ...idReaderWithAuth,
  id: 'storybook.id-reader.required',
  required: true
}

const idReaderWithValidationError: FieldConfig = {
  ...idReaderWithAuth,
  id: 'storybook.id-reader.validation-error',
  required: true
}

const idReaderWithFetchFailureError: FieldConfig = {
  ...idReaderWithAuth,
  id: 'storybook.id-reader.fetch-failed',
  required: true,
  validation: [
    {
      message: {
        id: 'storybook.id-reader.fetch-failed.error',
        defaultMessage:
          'Failed to fetch authenticated details. Please try again.',
        description: 'Validation error when authenticated details are missing'
      },
      validator: not(
        field('storybook.id-reader.fetch-failed').get('data').isFalsy()
      )
    }
  ]
}

const fetchLoader: FieldConfig = {
  id: 'storybook.verify-nid-fetch-loader',
  type: FieldType.LOADER,
  variant: 'highlighted',
  label: {
    id: 'storybook.verify-nid-fetch-loader.label',
    defaultMessage: 'ID Reader',
    description: 'Label for ID fetch loading indicator'
  },
  configuration: {
    text: {
      id: 'storybook.verify-nid-fetch-loader.label',
      defaultMessage: "Fetching individual's information...",
      description: 'Loading text while fetching authenticated details'
    }
  }
}

const authenticationStatusConfiguration = {
  status: {
    id: 'storybook.verified.status.text',
    defaultMessage:
      '{value, select, authenticated {ID Authenticated} verified {ID Verified} failed {Unable to fetch details} pending {Pending verification} other {Invalid value}}',
    description: 'Status text shown on the authentication status banner'
  },
  description: {
    id: 'storybook.verified.status.description',
    defaultMessage:
      "{value, select, authenticated {This identity has been successfully authenticated with Farajaland's National ID System. To make edits, please remove the authentication first.} verified {This identity data has been successfully verified with Farajaland's National ID System.} pending {Identity pending verification with Farajaland's National ID System.} failed {There was a technical problem while fetching authenticated details. Please try again.} other {Invalid value}}",
    description: 'Description text shown on the authentication status banner'
  }
}

const authenticationStatusField: FieldConfig = {
  id: 'storybook.verification-status',
  type: FieldType.VERIFICATION_STATUS,
  required: true,
  label: {
    id: 'storybook.verification-status.label',
    defaultMessage: 'ID Reader',
    description: 'Authentication status label'
  },
  configuration: authenticationStatusConfiguration
}

const offlineNotice: FieldConfig = {
  id: 'storybook.id-reader.offline-notice',
  type: FieldType.PARAGRAPH,
  label: {
    id: 'storybook.id-reader.offline-notice.label',
    defaultMessage:
      'Authentication is unavailable while offline. Reconnect to continue.',
    description: 'Offline guidance shown for authentication flow'
  },
  configuration: {
    styles: {
      hint: true
    }
  }
}

const onChangeSpy = fn()

function AuthenticationStateStory({
  fields,
  initialValues,
  fieldsToShowValidationErrors,
  validateAllFields,
  onChange
}: {
  fields: FieldConfig[]
  initialValues?: Record<string, FieldValue>
  fieldsToShowValidationErrors?: FieldConfig[]
  validateAllFields?: boolean
  onChange: (data: unknown) => void
}) {
  return (
    <Stack direction="column" gap={4}>
      <StyledFormFieldGenerator
        fields={fields}
        fieldsToShowValidationErrors={fieldsToShowValidationErrors}
        id="id-reader-authentication-states"
        initialValues={initialValues}
        validateAllFields={validateAllFields}
        validatorContext={getTestValidatorContext(
          TestUserRole.enum.LOCAL_REGISTRAR
        )}
        onChange={onChange}
      />
    </Stack>
  )
}

export const Default: StoryObj<Args> = {
  render: ({ onChange }) => (
    <AuthenticationStateStory
      fields={[
        paragraph('Default'),
        idReaderWithAuth,

        paragraph('Required field'),
        requiredIdReaderWithAuth,

        paragraph('Required error'),
        idReaderWithValidationError,

        paragraph('Loading'),
        fetchLoader,

        paragraph('Success'),
        authenticationStatusField,

        paragraph('Failed to fetch'),
        idReaderWithFetchFailureError
      ]}
      fieldsToShowValidationErrors={[
        idReaderWithValidationError,
        idReaderWithFetchFailureError
      ]}
      initialValues={{
        'storybook.id-reader.required': { data: {} },
        'storybook.id-reader.fetch-failed': { data: null },
        'storybook.verification-status': 'authenticated'
      }}
      validateAllFields={true}
      onChange={onChange}
    />
  ),
  args: {
    onChange: onChangeSpy
  }
}

export const Offline: StoryObj<Args> = {
  render: ({ onChange }) => (
    <AuthenticationStateStory
      fields={[offlineNotice, idReaderWithoutAuth]}
      onChange={onChange}
    />
  ),
  args: {
    onChange: onChangeSpy
  }
}
