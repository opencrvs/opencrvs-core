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
import { expect, fn } from '@storybook/test'
import { userEvent, within } from '@storybook/testing-library'
import React from 'react'
import * as selectEvent from 'react-select-event'
import styled from 'styled-components'
import { FieldType } from '@opencrvs/commons/client'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { TRPCProvider } from '@client/v2-events/trpc'

const meta: Meta<typeof FormFieldGenerator> = {
  title: 'Inputs/Address/Interaction',
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

export const AddressFieldInteraction: StoryObj<typeof FormFieldGenerator> = {
  name: 'Domestic',
  parameters: {
    layout: 'centered'
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await canvas.findByText(/Address/)

    await step('Select domestic country: Bangladesh', async () => {
      const country = await canvas.findByTestId('location__country')
      await userEvent.click(country)
      await selectEvent.select(country, 'Bangladesh')
    })

    await step(
      'Admin structure dropdowns are shown gradually as the inputs are filled',
      async () => {
        // Verify that `District` select is not visible initially
        await expect(canvas.queryByTestId('location__district')).toBeNull()

        // Select a province
        const province = await canvas.findByTestId('location__province')
        await userEvent.click(province)
        await selectEvent.select(province, 'Central')

        // Verify that `District` becomes visible
        const district = await canvas.findByTestId('location__district')
        await expect(district).toBeInTheDocument()

        // Select a district
        await userEvent.click(district)
        await selectEvent.select(district, 'Ibombo')
      }
    )

    await step(
      'Selecting "Rural" for address details type hides detailed street information',
      async () => {
        // Click on the "RURAL" radio option
        const ruralRadio = await canvas.findByTestId('radio-option__RURAL')
        await userEvent.click(ruralRadio)

        // Verify that the "village" input appears
        const villageInput = await canvas.findByTestId('text__village')
        await expect(villageInput).toBeInTheDocument()
      }
    )
  },
  render: function Component(args) {
    const [formData, setFormData] = React.useState({})
    return (
      <StyledFormFieldGenerator
        fields={[
          {
            id: 'storybook.address',
            type: FieldType.ADDRESS,
            label: {
              id: 'storybook.address.label',
              defaultMessage: 'Address',
              description: 'The title for the address input'
            }
          }
        ]}
        form={formData}
        id="my-form"
        onChange={(data) => {
          args.onChange(data)
          setFormData(data)
        }}
      />
    )
  }
}

export const GenericAddressFields: StoryObj<typeof FormFieldGenerator> = {
  name: 'International',
  parameters: {
    layout: 'centered'
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Select International country: Finland', async () => {
      const country = await canvas.findByTestId('location__country')
      await userEvent.click(country)
      await selectEvent.select(country, 'Finland')
    })

    await step('Domestic fields are not visible', async () => {
      await expect(canvas.queryByTestId('location__province')).toBeNull()
      await expect(canvas.queryByTestId('location__district')).toBeNull()
    })

    await step('Fill up international fields', async () => {
      await userEvent.type(await canvas.findByTestId('text__state'), 'Dhaka')
      await userEvent.type(
        await canvas.findByTestId('text__district2'),
        'Dhaka North'
      )
      await userEvent.type(
        await canvas.findByTestId('text__cityOrTown'),
        'Mohakhali'
      )
      await userEvent.type(
        await canvas.findByTestId('text__addressLine1'),
        'DOHS'
      )
      await userEvent.type(
        await canvas.findByTestId('text__addressLine2'),
        'Road 4'
      )
      await userEvent.type(
        await canvas.findByTestId('text__addressLine3'),
        'House 142'
      )
      await userEvent.type(
        await canvas.findByTestId('text__postcodeOrZip'),
        '3300'
      )
    })
  },
  render: function Component(args) {
    const [formData, setFormData] = React.useState({})
    return (
      <StyledFormFieldGenerator
        fields={[
          {
            id: 'storybook.address',
            type: FieldType.ADDRESS,
            label: {
              id: 'storybook.address.label',
              defaultMessage: 'Address',
              description: 'The title for the address input'
            }
          }
        ]}
        form={formData}
        id="my-form"
        onChange={(data) => {
          args.onChange(data)
          setFormData(data)
        }}
      />
    )
  }
}
