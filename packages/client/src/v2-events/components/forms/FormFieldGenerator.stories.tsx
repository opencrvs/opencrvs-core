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
import { fn } from '@storybook/test'
import React from 'react'
import styled from 'styled-components'
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
