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
import { within, expect } from '@storybook/test'
import { userEvent } from '@storybook/testing-library'
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
  title: 'Inputs/SelectCountry',
  parameters: {
    chromatic: { disableSnapshot: true },
    layout: 'centered'
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

type Story = StoryObj<FormFieldGeneratorPropsWithoutRef>

export const WithHiddenOption: Story = {
  name: 'With hidden country option',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('textbox'))
    await expect(canvas.queryByText('Bangladesh')).toBeInTheDocument()
    await expect(canvas.queryByText('Canada')).not.toBeInTheDocument()
    await expect(
      canvas.queryByText('United States of America')
    ).toBeInTheDocument()
  },
  render: function Component(args) {
    return (
      <StyledFormFieldGenerator
        {...args}
        fields={[
          {
            id: 'storybook.country',
            type: FieldType.COUNTRY,
            label: {
              id: 'storybook.country.label',
              defaultMessage: 'Country',
              description: 'The label for the country select input'
            },
            optionOverrides: [
              {
                value: 'CAN',
                conditionals: [
                  {
                    type: ConditionalType.SHOW,
                    conditional: not(alwaysTrue())
                  }
                ]
              }
            ]
          }
        ]}
        id="my-form"
      />
    )
  }
}

export const WithAddressCountryOverride: Story = {
  name: 'Address field with hidden country option override',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('textbox'))
    await expect(canvas.queryByText('Bangladesh')).toBeInTheDocument()
    await expect(canvas.queryByText('Canada')).not.toBeInTheDocument()
  },
  render: function Component(args) {
    return (
      <StyledFormFieldGenerator
        {...args}
        fields={[
          {
            id: 'storybook.address',
            type: FieldType.ADDRESS,
            label: {
              id: 'storybook.address.label',
              defaultMessage: 'Address',
              description: 'The label for the address input'
            },
            configuration: {
              fields: [
                {
                  id: 'country',
                  type: FieldType.COUNTRY,
                  optionOverrides: [
                    {
                      value: 'CAN',
                      conditionals: [
                        {
                          type: ConditionalType.SHOW,
                          conditional: not(alwaysTrue())
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          }
        ]}
        id="my-form"
      />
    )
  }
}

export const WithDisabledOption: Story = {
  name: 'With disabled country option',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('textbox'))
    const canadaOption = canvas.queryByText('Canada')
    await expect(canadaOption).toBeInTheDocument()
    await expect(canadaOption).toHaveClass('react-select__option--is-disabled')
    await expect(canvas.queryByText('Bangladesh')).not.toHaveClass(
      'react-select__option--is-disabled'
    )
  },
  render: function Component(args) {
    return (
      <StyledFormFieldGenerator
        {...args}
        fields={[
          {
            id: 'storybook.country',
            type: FieldType.COUNTRY,
            label: {
              id: 'storybook.country.label',
              defaultMessage: 'Country',
              description: 'The label for the country select input'
            },
            optionOverrides: [
              {
                value: 'CAN',
                conditionals: [
                  {
                    type: ConditionalType.ENABLE,
                    conditional: not(alwaysTrue())
                  }
                ]
              }
            ]
          }
        ]}
        id="my-form"
      />
    )
  }
}
