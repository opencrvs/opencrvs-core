/* eslint-disable max-lines */
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
import { userEvent, waitFor, within } from '@storybook/testing-library'
import React from 'react'
import * as selectEvent from 'react-select-event'
import styled from 'styled-components'
import {
  AddressType,
  FieldType,
  and,
  not,
  field as createFieldCondition,
  ConditionalType
} from '@opencrvs/commons/client'
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

function isInternationalAddress() {
  return and(
    not(createFieldCondition('country').isUndefined()),
    createFieldCondition('addressType').isEqualTo(AddressType.INTERNATIONAL)
  )
}

function isDomesticAddress() {
  return and(
    not(createFieldCondition('country').isUndefined()),
    createFieldCondition('addressType').isEqualTo(AddressType.DOMESTIC)
  )
}

const streetAddressConfigs = [
  {
    id: 'town',
    required: false,
    parent: createFieldCondition('country'),
    label: {
      id: 'field.address.town.label',
      defaultMessage: 'Town',
      description: 'This is the label for the field'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          isDomesticAddress(),
          not(createFieldCondition('district').isUndefined())
        )
      }
    ],
    type: FieldType.TEXT
  },
  {
    id: 'residentialArea',
    required: false,
    parent: createFieldCondition('country'),
    label: {
      id: 'field.address.residentialArea.label',
      defaultMessage: 'Residential Area',
      description: 'This is the label for the field'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          isDomesticAddress(),
          not(createFieldCondition('district').isUndefined())
        )
      }
    ],
    type: FieldType.TEXT
  },
  {
    id: 'street',
    required: false,
    parent: createFieldCondition('country'),
    label: {
      id: 'field.address.street.label',
      defaultMessage: 'Street',
      description: 'This is the label for the field'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          isDomesticAddress(),
          not(createFieldCondition('district').isUndefined())
        )
      }
    ],
    type: FieldType.TEXT
  },
  {
    id: 'number',
    required: false,
    parent: createFieldCondition('country'),
    label: {
      id: 'field.address.number.label',
      defaultMessage: 'Number',
      description: 'This is the label for the field'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          isDomesticAddress(),
          not(createFieldCondition('district').isUndefined())
        )
      }
    ],
    type: FieldType.TEXT
  },
  {
    id: 'zipCode',
    required: false,
    parent: createFieldCondition('country'),
    label: {
      id: 'field.address.postcodeOrZip.label',
      defaultMessage: 'Postcode / Zip',
      description: 'This is the label for the field'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          isDomesticAddress(),
          not(createFieldCondition('district').isUndefined())
        )
      }
    ],
    type: FieldType.TEXT
  },
  {
    id: 'state',
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: isInternationalAddress()
      }
    ],
    parent: createFieldCondition('country'),
    required: true,
    label: {
      id: 'field.address.state.label',
      defaultMessage: 'State',
      description: 'This is the label for the field'
    },
    type: FieldType.TEXT
  },
  {
    id: 'district2',
    parent: createFieldCondition('country'),
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: isInternationalAddress()
      }
    ],
    required: true,
    label: {
      id: 'field.address.district2.label',
      defaultMessage: 'District',
      description: 'This is the label for the field'
    },
    type: FieldType.TEXT
  },
  {
    id: 'cityOrTown',
    parent: createFieldCondition('country'),
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: isInternationalAddress()
      }
    ],
    required: false,
    label: {
      id: 'field.address.cityOrTown.label',
      defaultMessage: 'City / Town',
      description: 'This is the label for the field'
    },
    type: FieldType.TEXT
  },
  {
    id: 'addressLine1',
    parent: createFieldCondition('country'),
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: isInternationalAddress()
      }
    ],
    required: false,
    label: {
      id: 'field.address.addressLine1.label',
      defaultMessage: 'Address Line 1',
      description: 'This is the label for the field'
    },
    type: FieldType.TEXT
  },
  {
    id: 'addressLine2',
    parent: createFieldCondition('country'),
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: isInternationalAddress()
      }
    ],
    required: false,
    label: {
      id: 'field.address.addressLine2.label',
      defaultMessage: 'Address Line 2',
      description: 'This is the label for the field'
    },
    type: FieldType.TEXT
  },
  {
    id: 'addressLine3',
    parent: createFieldCondition('country'),
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: isInternationalAddress()
      }
    ],
    required: false,
    label: {
      id: 'field.address.addressLine3.label',
      defaultMessage: 'Address Line 3',
      description: 'This is the label for the field'
    },
    type: FieldType.TEXT
  },
  {
    id: 'postcodeOrZip',
    parent: createFieldCondition('country'),
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: isInternationalAddress()
      }
    ],
    required: false,
    label: {
      id: 'field.address.postcodeOrZip.label',
      defaultMessage: 'Postcode / Zip',
      description: 'This is the label for the field'
    },
    type: FieldType.TEXT
  }
]

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

    await step('International fields are not visible', async () => {
      await expect(canvas.queryByTestId('text__district2')).toBeNull()
      await expect(canvas.queryByTestId('text__cityOrTown')).toBeNull()
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

    await step('Fill up domestic fields', async () => {
      await userEvent.type(await canvas.findByTestId('text__town'), 'Dhaka')
      await userEvent.type(
        await canvas.findByTestId('text__residentialArea'),
        'Mohakhali'
      )
      await userEvent.type(await canvas.findByTestId('text__street'), 'Road 4')
      await userEvent.type(
        await canvas.findByTestId('text__number'),
        'House 142'
      )
      await userEvent.type(await canvas.findByTestId('text__zipCode'), '3300')
    })
  },
  render: function Component(args) {
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
            },
            configuration: {
              streetAddressForm: streetAddressConfigs
            }
          }
        ]}
        id="my-form"
        onChange={(data) => {
          args.onChange(data)
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

    await step('Change country to Sweden', async () => {
      const country = await canvas.findByTestId('location__country')
      await userEvent.click(country)
      await selectEvent.select(country, 'Sweden')
    })

    await step('Expect address fields to be reset', async () => {
      await waitFor(async () => {
        await expect(canvas.queryByTestId('text__state')).toHaveValue('')
        await expect(canvas.queryByTestId('text__district2')).toHaveValue('')
        await expect(canvas.queryByTestId('text__cityOrTown')).toHaveValue('')
        await expect(canvas.queryByTestId('text__addressLine1')).toHaveValue('')
        await expect(canvas.queryByTestId('text__addressLine2')).toHaveValue('')
        await expect(canvas.queryByTestId('text__addressLine3')).toHaveValue('')
        await expect(canvas.queryByTestId('text__postcodeOrZip')).toHaveValue(
          ''
        )
      })
    })
  },
  render: function Component(args) {
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
            },
            configuration: {
              streetAddressForm: streetAddressConfigs
            }
          }
        ]}
        id="my-form"
        onChange={(data) => {
          args.onChange(data)
        }}
      />
    )
  }
}

export const AddressFieldInteractionDomesticToInternational: StoryObj<
  typeof FormFieldGenerator
> = {
  name: 'Switch between Domestic and International',
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

    await step('International fields are not visible', async () => {
      await expect(canvas.queryByTestId('text__state')).toBeNull()
      await expect(canvas.queryByTestId('text__district2')).toBeNull()
      await expect(canvas.queryByTestId('text__cityOrTown')).toBeNull()
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
      }
    )

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

    await step('Fill up domestic fields', async () => {
      await userEvent.type(await canvas.findByTestId('text__town'), 'Dhaka')
      await userEvent.type(
        await canvas.findByTestId('text__residentialArea'),
        'Mohakhali'
      )
      await userEvent.type(await canvas.findByTestId('text__street'), 'Road 4')
      await userEvent.type(
        await canvas.findByTestId('text__number'),
        'House 142'
      )
      await userEvent.type(await canvas.findByTestId('text__zipCode'), '3300')
    })
  },
  render: function Component(args) {
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
            },
            configuration: {
              streetAddressForm: streetAddressConfigs
            }
          }
        ]}
        id="my-form"
        onChange={(data) => {
          args.onChange(data)
        }}
      />
    )
  }
}
