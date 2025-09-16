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
                  fieldId: 'applicant.name'
                },
                {
                  fieldId: 'applicant.dob'
                },
                {
                  fieldId: 'applicant'
                },
                {
                  label: {
                    defaultMessage: 'ID',
                    description: 'This is the label for the field',
                    id: 'event.tennis-club-membership.action.print.verify.id.label'
                  },
                  value: {
                    defaultMessage: `National ID | {applicant.id}`,
                    description: 'This is the label for the field',
                    id: 'event.tennis-club-membership.action.print.verify.id.label'
                  }
                }
              ]
            }
          }
        ]}
        id="my-form"
        initialValues={{
          'applicant.name': {
            firstname: 'Tanya',
            surname: 'McQuaid'
          },
          'applicant.id': '2370934578',
          'applicant.dob': '1975-01-02'
        }}
        onChange={noop}
      />
    )
  }
}

export const DataDisplayWithConditionallyHiddenFields: StoryObj<
  typeof FormFieldGenerator
> = {
  parameters: {
    layout: 'centered'
  },
  render: function Component() {
    return (
      <StyledFormFieldGenerator
        eventConfig={tennisClubMembershipEvent}
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
                  fieldId: 'applicant.name'
                },
                {
                  fieldId: 'recommender.none'
                },
                // recommender.name is not rendered, because recommender.none is true
                {
                  fieldId: 'recommender.name'
                }
              ]
            }
          }
        ]}
        id="my-form"
        initialValues={{
          'recommender.none': true,
          // @ts-ignore
          'recommender.name': {
            firstname: 'John',
            surname: ''
          },
          // @ts-ignore
          'applicant.name': {
            firstname: 'Rasheed',
            surname: ''
          }
        }}
        onChange={noop}
      />
    )
  }
}

export const DataDisplayWithConditionallyShownFields: StoryObj<
  typeof FormFieldGenerator
> = {
  parameters: {
    layout: 'centered'
  },
  render: function Component() {
    return (
      <StyledFormFieldGenerator
        eventConfig={tennisClubMembershipEvent}
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
                  fieldId: 'applicant.name'
                },
                // recommender.name is rendered, because recommender.none is false
                {
                  fieldId: 'recommender.name'
                }
              ]
            }
          }
        ]}
        id="my-form"
        initialValues={{
          'recommender.name': {
            firstname: 'John',
            surname: ''
          },
          'applicant.name': {
            firstname: 'Rasheed',
            surname: ''
          },
          'recommender.none': false
        }}
        onChange={noop}
      />
    )
  }
}
