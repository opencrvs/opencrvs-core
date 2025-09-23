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
import React from 'react'
import styled from 'styled-components'
import { noop } from 'lodash'
import { FieldType } from '@opencrvs/commons/client'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { TRPCProvider } from '@client/v2-events/trpc'

const meta: Meta<typeof FormFieldGenerator> = {
  title: 'Inputs/Status',
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
            id: 'storybook.status',
            type: FieldType.STATUS,
            label: {
              id: 'storybook.status',
              defaultMessage: 'Verification status',
              description: 'The title for the status field label'
            },
            configuration: {
              icon: 'CircleWavyCheck',
              theme: 'default',
              text: {
                id: 'storybook.status.verified',
                defaultMessage: 'Verified',
                description: 'Status text when user is verified'
              }
            }
          }
        ]}
        id="my-form"
        onChange={noop}
      />
    )
  }
}
