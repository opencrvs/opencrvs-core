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
import { expect, within } from '@storybook/test'
import React from 'react'
import styled from 'styled-components'
import {
  FieldType,
  FieldConfig,
  EventState,
  generateTranslationConfig,
  user,
  AddressType,
  TestUserRole,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'

import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { TRPCProvider } from '@client/v2-events/trpc'
import { getTestValidatorContext } from '../../../../../.storybook/decorators'

const meta: Meta<typeof FormFieldGenerator> = {
  title: 'AdministrativeArea/AddressJurisdictionForwarding',
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

function addressFields(): FieldConfig[] {
  return [
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
}

const declaration = {
  'applicant.address': {
    country: 'BGD',
    addressType: AddressType.DOMESTIC,
    administrativeArea: '1d4e5f6a-7b8c-4912-8efa-345678901234'
  }
} satisfies EventState

type LevelState = 'enabled' | 'disabled'

async function assertLevels(
  canvas: ReturnType<typeof within>,
  expected: Record<'Province' | 'District' | 'Village', LevelState>
) {
  for (const [label, state] of Object.entries(expected)) {
    const field = await canvas.findByLabelText(label)
    if (state === 'disabled') {
      await expect(field, `${label} should be ${state}`).toBeDisabled()
    } else {
      await expect(field, `${label} should be ${state}`).not.toBeDisabled()
    }
  }
}

function scopeReferenceStory(
  userRole: TestUserRole,
  expected: Record<'Province' | 'District' | 'Village', LevelState>
): StoryObj<typeof FormFieldGenerator> {
  return {
    parameters: {
      layout: 'centered',
      userRole,
      chromatic: { disableSnapshot: true },
      reactRouter: {
        router: {
          path: '/event/:eventId',
          element: (
            <StyledFormFieldGenerator
              eventConfig={tennisClubMembershipEvent}
              fields={addressFields()}
              formValues={declaration}
              id="my-form"
              validatorContext={getTestValidatorContext(userRole)}
            />
          )
        },
        initialPath: '/event/123-kalsnk-213'
      }
    },
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement)
      await assertLevels(canvas, expected)
    }
  }
}

// The PROVINCIAL_REGISTRAR test token carries
// { type: 'record.create', options: { placeOfEvent: 'administrativeArea' }}
// so, the province is locked to the user's own administrative area.
export const ProvincialRegistrarAll = scopeReferenceStory(
  TestUserRole.enum.PROVINCIAL_REGISTRAR,
  { Province: 'disabled', District: 'enabled', Village: 'enabled' }
)
// The LOCAL_REGISTRAR test token carries a plain
// { type: 'record.create' } scope, which defaults placeOfEvent to 'all',
// so every location level should be enabled.
export const LocalRegistrarAll = scopeReferenceStory(
  TestUserRole.enum.LOCAL_REGISTRAR,
  { Province: 'enabled', District: 'enabled', Village: 'enabled' }
)
