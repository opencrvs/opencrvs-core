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
  FieldType,
  not,
  alwaysTrue
} from '@opencrvs/commons/client'
import {
  FormFieldGenerator,
  FormFieldGeneratorPropsWithoutRef
} from '@client/v2-events/components/forms/FormFieldGenerator'
import { TRPCProvider } from '@client/v2-events/trpc'
import { withValidatorContext } from '../../../../../.storybook/decorators'

const meta: Meta<FormFieldGeneratorPropsWithoutRef> = {
  title: 'Inputs/Select',
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

type Story = StoryObj<FormFieldGeneratorPropsWithoutRef>

export const WithHiddenOption: Story = {
  name: 'With hidden option',
  parameters: {
    layout: 'centered'
  },
  render: function Component(args) {
    return (
      <StyledFormFieldGenerator
        {...args}
        fields={[
          {
            id: 'storybook.select',
            type: FieldType.SELECT,
            label: {
              id: 'storybook.select.label',
              defaultMessage: 'Favourite fruit',
              description: 'The label for the select input'
            },
            options: [
              {
                value: 'apple',
                label: {
                  id: 'storybook.select.option.apple',
                  defaultMessage: 'Apple',
                  description: 'Apple option'
                }
              },
              {
                value: 'banana',
                label: {
                  id: 'storybook.select.option.banana',
                  defaultMessage: 'Banana',
                  description: 'Banana option'
                },
                conditionals: [
                  {
                    type: ConditionalType.SHOW,
                    conditional: not(alwaysTrue())
                  }
                ]
              },
              {
                value: 'cherry',
                label: {
                  id: 'storybook.select.option.cherry',
                  defaultMessage: 'Cherry',
                  description: 'Cherry option'
                }
              }
            ]
          }
        ]}
        id="my-form"
      />
    )
  }
}

export const WithDisabledOption: Story = {
  name: 'With disabled option',
  parameters: {
    layout: 'centered'
  },
  render: function Component(args) {
    return (
      <StyledFormFieldGenerator
        {...args}
        fields={[
          {
            id: 'storybook.select',
            type: FieldType.SELECT,
            label: {
              id: 'storybook.select.label',
              defaultMessage: 'Favourite fruit',
              description: 'The label for the select input'
            },
            options: [
              {
                value: 'apple',
                label: {
                  id: 'storybook.select.option.apple',
                  defaultMessage: 'Apple',
                  description: 'Apple option'
                }
              },
              {
                value: 'banana',
                label: {
                  id: 'storybook.select.option.banana',
                  defaultMessage: 'Banana',
                  description: 'Banana option'
                },
                conditionals: [
                  {
                    type: ConditionalType.ENABLE,
                    conditional: not(alwaysTrue())
                  }
                ]
              },
              {
                value: 'cherry',
                label: {
                  id: 'storybook.select.option.cherry',
                  defaultMessage: 'Cherry',
                  description: 'Cherry option'
                }
              }
            ]
          }
        ]}
        id="my-form"
      />
    )
  }
}
