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
import { expect, userEvent, within } from '@storybook/test'
import * as selectEvent from 'react-select-event'
import React from 'react'
import styled from 'styled-components'
import {
  FieldType,
  FieldConfig,
  EventState,
  generateTranslationConfig,
  user,
  AddressType,
  TestUserRole
} from '@opencrvs/commons/client'

import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { TRPCProvider } from '@client/v2-events/trpc'
import { getTestValidatorContext } from '../../../../../.storybook/decorators'

const meta: Meta<typeof FormFieldGenerator> = {
  title: 'AdministrativeArea/Interaction',
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
  width: '400px';
`

const fields = [
  {
    id: 'applicant.address',
    type: FieldType.ADDRESS,
    label: generateTranslationConfig('Applicant Address'),
    configuration: {
      streetAddressForm: [
        {
          id: 'street',
          type: FieldType.TEXT,
          label: generateTranslationConfig('Street'),
          required: false
        }
      ],
      allowedLocations: user.jurisdiction(
        user.scope('record.create').attribute('placeOfEvent')
      )
    },
    defaultValue: {
      country: 'FAR',
      addressType: AddressType.DOMESTIC,
      administrativeArea: user('primaryOfficeId').locationLevel('village')
    }
  }
] satisfies FieldConfig[]

const declaration = {
  'applicant.address': {
    country: 'FAR',
    addressType: AddressType.DOMESTIC,
    administrativeArea: '1d4e5f6a-7b8c-4912-8efa-345678901234'
  }
} satisfies EventState

export const AdministrativeAreaWithCommunityLeader: StoryObj<
  typeof FormFieldGenerator
> = {
  parameters: {
    layout: 'centered',
    userRole: TestUserRole.enum.COMMUNITY_LEADER,
    chromatic: { disableSnapshot: true },
    reactRouter: {
      router: {
        path: '/event/:eventId',
        element: (
          <StyledFormFieldGenerator
            fields={fields}
            formValues={declaration}
            id="my-form"
            validatorContext={getTestValidatorContext(
              TestUserRole.enum.COMMUNITY_LEADER
            )}
          />
        )
      },
      initialPath: '/event/123-kalsnk-213'
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step(
      'Province is disabled and selected with value Central',
      async () => {
        const province = await canvas.findByLabelText('Province')
        await expect(province).toBeDisabled()
        const provinceValue = canvasElement.querySelector(
          '#searchable-select-province'
        )
        await expect(provinceValue).toHaveTextContent('Central')
      }
    )

    await step(
      'District is disabled and selected with value Ibombo',
      async () => {
        const district = await canvas.findByLabelText('District')
        await expect(district).toBeDisabled()
        const districtValue = canvasElement.querySelector(
          '#searchable-select-district'
        )
        await expect(districtValue).toHaveTextContent('Ibombo')
      }
    )

    await step('Village is disabled and selected with value Klow', async () => {
      const village = await canvas.findByLabelText('Village')
      await expect(village).toBeDisabled()
      const villageValue = canvasElement.querySelector(
        '#searchable-select-village'
      )
      await expect(villageValue).toHaveTextContent('Klow')
    })
  }
}
export const AdministrativeAreaWithLocalRegistrar: StoryObj<
  typeof FormFieldGenerator
> = {
  parameters: {
    layout: 'centered',
    userRole: TestUserRole.enum.LOCAL_REGISTRAR,
    chromatic: { disableSnapshot: true },
    reactRouter: {
      router: {
        path: '/event/:eventId',
        element: (
          <StyledFormFieldGenerator
            fields={fields}
            formValues={declaration}
            id="my-form"
            validatorContext={getTestValidatorContext(
              TestUserRole.enum.LOCAL_REGISTRAR
            )}
          />
        )
      },
      initialPath: '/event/123-kalsnk-213'
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step(
      'Province is disabled and selected with value Central',
      async () => {
        const province = await canvas.findByLabelText('Province')
        await expect(province).toBeDisabled()
        const provinceValue = canvasElement.querySelector(
          '#searchable-select-province'
        )
        await expect(provinceValue).toHaveTextContent('Central')
      }
    )

    await step(
      'District is disabled and selected with value Ibombo',
      async () => {
        const district = await canvas.findByLabelText('District')
        await expect(district).toBeDisabled()
        const districtValue = canvasElement.querySelector(
          '#searchable-select-district'
        )
        await expect(districtValue).toHaveTextContent('Ibombo')
      }
    )

    await step('Village is enabled — select Olani', async () => {
      const village = await canvas.findByLabelText('Village')
      await expect(village).not.toBeDisabled()
      await userEvent.click(village)
      await canvas.findByText('Olani')
      await selectEvent.select(village, 'Olani')
      await expect(
        canvasElement.querySelector('#searchable-select-village')
      ).toHaveTextContent('Olani')
    })
  }
}
export const AdministrativeAreaWithProvincialRegistrar: StoryObj<
  typeof FormFieldGenerator
> = {
  parameters: {
    layout: 'centered',
    userRole: TestUserRole.enum.PROVINCIAL_REGISTRAR,
    chromatic: { disableSnapshot: true },
    reactRouter: {
      router: {
        path: '/event/:eventId',
        element: (
          <StyledFormFieldGenerator
            fields={fields}
            formValues={declaration}
            id="my-form"
            validatorContext={getTestValidatorContext(
              TestUserRole.enum.PROVINCIAL_REGISTRAR
            )}
          />
        )
      },
      initialPath: '/event/123-kalsnk-213'
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step(
      'Province is disabled and selected with value Central',
      async () => {
        const province = await canvas.findByLabelText('Province')
        await expect(province).toBeDisabled()
        const provinceValue = canvasElement.querySelector(
          '#searchable-select-province'
        )
        await expect(provinceValue).toHaveTextContent('Central')
      }
    )

    await step('District is enabled — select Isamba', async () => {
      const district = await canvas.findByLabelText('District')
      await expect(district).not.toBeDisabled()
      await userEvent.click(district)
      await canvas.findByText('Isamba')
      await selectEvent.select(district, 'Isamba')
      await expect(
        canvasElement.querySelector('#searchable-select-district')
      ).toHaveTextContent('Isamba')
    })

    await step('Village is enabled — select Ndoki', async () => {
      const village = await canvas.findByLabelText('Village')
      await expect(village).not.toBeDisabled()
      await userEvent.click(village)
      await canvas.findByText('Ndoki')
      await selectEvent.select(village, 'Ndoki')
      await expect(
        canvasElement.querySelector('#searchable-select-village')
      ).toHaveTextContent('Ndoki')
    })
  }
}
