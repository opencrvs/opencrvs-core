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
import { http, HttpResponse } from 'msw'
import { FieldType, tennisClubMembershipEvent } from '@opencrvs/commons/client'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { FormFieldGeneratorProps } from '@client/v2-events/components/forms/FormFieldGenerator/FormFieldGenerator'
import { TRPCProvider } from '@client/v2-events/trpc'
import { withValidatorContext } from '../../../../../.storybook/decorators'
import { Review } from '../components/Review'

const meta: Meta<FormFieldGeneratorProps> = {
  title: 'Inputs/Custom',
  component: FormFieldGenerator,
  argTypes: {
    validatorContext: { control: false }
  },
  parameters: {
    msw: {
      handlers: {
        module: [
          http.get('http://localhost:6006/test.js?import', () => {
            return HttpResponse.text(
              `
               import React from 'react';
               console.log('React', React)
               export function Input(props) {
                console.log({props})
                const [count, setCount] = React.useState(props.value);
                return React.createElement('button', { onClick: () => setCount(count + 1) }, 'Clicked ' + count + ' times');
               }

               export function Output({value}) {
                 return React.createElement('div', null, 'Here is the value: ' + value);
               }
               `,
              {
                status: 200,
                headers: {
                  'content-type': 'application/javascript'
                }
              }
            )
          })
        ]
      }
    }
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
  width: '400px';
`

export const Input: StoryObj<typeof FormFieldGenerator> = {
  name: 'Input',
  parameters: {
    layout: 'centered'
  },
  render: (args) => {
    return (
      <StyledFormFieldGenerator
        {...args}
        eventConfig={tennisClubMembershipEvent}
        fields={[
          {
            id: 'storybook.data',
            type: FieldType._EXPERIMENTAL_CUSTOM,
            src: '/test.js',
            label: {
              id: 'foo.bar',
              description: '',
              defaultMessage: 'Custom Field'
            }
          }
        ]}
        id="my-form"
        initialValues={{
          'storybook.data': 3
        }}
      />
    )
  }
}
export const Output: StoryObj<typeof FormFieldGenerator> = {
  name: 'Output',
  parameters: {
    layout: 'centered'
  },
  render: (args) => {
    return (
      <div>
        <Review.Body
          {...args}
          form={{ 'storybook.data': 4212 }}
          formConfig={{
            label: {
              id: 'a.b.b',
              defaultMessage: 'Tennis club membership application',
              description: ''
            },
            pages: [
              {
                id: 'foo',
                type: 'FORM',
                title: {
                  id: 'a.b.c',
                  defaultMessage: 'Page with a custom output',
                  description: ''
                },
                fields: [
                  {
                    id: 'storybook.data',
                    type: FieldType._EXPERIMENTAL_CUSTOM,
                    src: '/test.js',
                    label: {
                      id: 'foo.bar',
                      description: '',
                      defaultMessage: 'Custom Field'
                    }
                  }
                ]
              }
            ]
          }}
          title="My test action"
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          onEdit={() => {}}
        ></Review.Body>
      </div>
    )
  }
}
