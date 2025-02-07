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
import { fn, expect } from '@storybook/test'
import React from 'react'
import styled from 'styled-components'
import { within, userEvent } from '@storybook/testing-library'
import * as selectEvent from 'react-select-event'
import { TRPCProvider } from '@client/v2-events/trpc'
import { FormFieldGenerator } from './FormFieldGenerator'

const meta: Meta<typeof FormFieldGenerator> = {
  title: 'Form Field Generator',
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

export const AddressField: StoryObj<typeof FormFieldGenerator> = {
  parameters: {
    layout: 'centered'
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step(
      'Admin structure dropdowns are shown gradually as the inputs are filled',
      async () => {
        // Verify that `District` select is not visible initially
        await expect(
          await canvas.queryByTestId('location__district')
        ).toBeNull()

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
            type: 'ADDRESS',
            label: {
              id: 'storybook.address.label',
              defaultMessage: 'Address',
              description: 'The title for the address input'
            },
            initialValue: {
              country: 'FAR'
            }
          }
        ]}
        formData={formData}
        id="my-form"
        setAllFieldsDirty={false}
        onChange={(data) => {
          args.onChange(data)
          setFormData(data)
        }}
      />
    )
  }
}
