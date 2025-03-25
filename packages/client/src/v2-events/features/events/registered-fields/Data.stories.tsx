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
import { noop } from 'lodash'
import { FieldType, tennisClubMembershipEvent } from '@opencrvs/commons/client'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { TRPCProvider } from '@client/v2-events/trpc'

const meta: Meta<typeof FormFieldGenerator> = {
  title: 'Inputs/Data',
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

export const DataDisplay: StoryObj<typeof FormFieldGenerator> = {
  name: 'Data display field',
  parameters: {
    layout: 'centered'
  },
  render: function Component() {
    return (
      <StyledFormFieldGenerator
        eventConfig={tennisClubMembershipEvent}
        eventDeclarationData={{
          'applicant.firstname': 'Tanya',
          'applicant.id': '2370934578',
          'applicant.surname': 'McQuaid',
          'applicant.dob': '1975-01-02'
        }}
        fields={[
          {
            id: 'storybook.data',
            type: FieldType.DATA,
            label: {
              id: 'storybook.data.label',
              defaultMessage: 'Applicant details',
              description: ''
            },
            configuration: {
              subtitle: {
                id: 'storybook.data.subtitle',
                defaultMessage: 'Some subtitle',
                description: ''
              },
              data: [
                {
                  fieldId: 'applicant.firstname'
                },
                {
                  fieldId: 'applicant.surname'
                },
                {
                  fieldId: 'applicant.dob'
                },
                {
                  fieldId: 'applicant.idVerification',
                  customValue: {
                    label: {
                      defaultMessage: 'ID',
                      description: 'This is the label for the field',
                      id: 'v2.event.tennis-club-membership.action.print.verify.id.label'
                    },
                    value: 'National ID | {applicant.id}'
                  }
                }
              ]
            }
          }
        ]}
        formData={{}}
        id="my-form"
        setAllFieldsDirty={false}
        onChange={noop}
      />
    )
  }
}
