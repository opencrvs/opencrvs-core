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
import { fn, userEvent, within } from '@storybook/test'
import React, { useEffect } from 'react'
import styled from 'styled-components'
import { noop } from 'lodash'
import { FieldType, TestUserRole } from '@opencrvs/commons/client'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { TRPCProvider } from '@client/v2-events/trpc'
import { getTestValidatorContext } from '../../../../../.storybook/decorators'

const meta: Meta<typeof FormFieldGenerator> = {
  title: 'Inputs/VerificationStatus',
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

export const Status: StoryObj<typeof FormFieldGenerator> = {
  parameters: {
    layout: 'centered'
  },
  render: function Component() {
    return (
      <StyledFormFieldGenerator
        fields={[
          {
            id: 'storybook.pending',
            type: FieldType.VERIFICATION_STATUS,
            label: {
              id: 'storybook.pending',
              defaultMessage: 'Pending verification status',
              description: 'The title for the status field label'
            },
            configuration: {
              status: {
                id: 'storybook.pending.pending',
                defaultMessage: 'Pending',
                description: 'Status text when the informant is pending'
              },
              description: {
                id: 'storybook.pending.pending.description',
                defaultMessage: 'ID pending with National ID system',
                description: 'Status description when the informant is pending'
              }
            }
          },
          {
            id: 'storybook.verified',
            type: FieldType.VERIFICATION_STATUS,
            label: {
              id: 'storybook.verified',
              defaultMessage: 'Verified verification status',
              description: 'The title for the status field label'
            },
            configuration: {
              status: {
                id: 'storybook.verified.verified',
                defaultMessage: 'Verified',
                description: 'Status text when the informant is verified'
              },
              description: {
                id: 'storybook.verified.verified.description',
                defaultMessage: 'ID verified with National ID system',
                description: 'Status description when the informant is verified'
              }
            }
          },
          {
            id: 'storybook.authenticated',
            type: FieldType.VERIFICATION_STATUS,
            label: {
              id: 'storybook.authenticated',
              defaultMessage: 'Authenticated verification status',
              description: 'The title for the status field label'
            },
            configuration: {
              status: {
                id: 'storybook.authenticated.authenticated',
                defaultMessage: 'Authenticated',
                description: 'Status text when the informant is authenticated'
              },
              description: {
                id: 'storybook.authenticated.authenticated.description',
                defaultMessage: 'ID authenticated with National ID system',
                description:
                  'Status description when the informant is authenticated'
              }
            }
          },
          {
            id: 'storybook.failed',
            type: FieldType.VERIFICATION_STATUS,
            label: {
              id: 'storybook.failed',
              defaultMessage: 'Failed verification status',
              description: 'The title for the status field label'
            },
            configuration: {
              status: {
                id: 'storybook.failed.failed',
                defaultMessage: 'Failed',
                description: 'Status text when the informant is failed'
              },
              description: {
                id: 'storybook.failed.failed.description',
                defaultMessage: 'ID verification failed',
                description: 'Status description when the informant is failed'
              }
            }
          }
        ]}
        id="my-form"
        initialValues={{
          'storybook.pending': 'pending',
          'storybook.verified': 'verified',
          'storybook.authenticated': 'authenticated',
          'storybook.failed': 'failed'
        }}
        validatorContext={getTestValidatorContext(
          TestUserRole.enum.LOCAL_REGISTRAR
        )}
        onChange={noop}
      />
    )
  }
}
