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
import React from 'react'
import type { Decorator } from '@storybook/react'
import {
  getOrThrow,
  getTokenPayload,
  LocationType,
  TestUserRole,
  ValidatorContext
} from '@opencrvs/commons/client'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { getLeafLocationIds } from '@client/v2-events/hooks/useLocations'
import { V2_DEFAULT_MOCK_LOCATIONS } from '../.storybook/default-request-handlers'

const generator = testDataGenerator()

/**
 *
 * @returns Stroybook decorator that provides a validator context based on the user role specified in the story parameters.
 *
 * @example Setting up meta for a story:
 *
 * const meta: Meta<FormFieldGeneratorProps> = {
    decorators: [
      (Story, context) => <TRPCProvider><Story {...context} /></TRPCProvider>,
      withValidatorContext
    ]
  }
 * @example Setting user role in a story:
export const DataDisplayWithConditionallyHiddenFields: StoryObj<
  typeof FormFieldGenerator
> = {
      parameters: {
        layout: 'centered',
        userRole: TestUserRole.Enum.REGISTRATION_AGENT
      }
    }
 */
export const withValidatorContext: Decorator = (Story, context) => {
  const validatorContext: ValidatorContext = getTestValidatorContext(
    context.parameters.userRole
  )

  return (
    <Story
      args={{ ...context.args, validatorContext }}
      validatorContext={validatorContext}
    />
  )
}
export function getTestValidatorContext(userRole?: TestUserRole) {
  let token

  if (userRole === TestUserRole.Enum.FIELD_AGENT) {
    token = generator.user.token.fieldAgent
  } else if (userRole === TestUserRole.Enum.LOCAL_SYSTEM_ADMIN) {
    token = generator.user.token.localSystemAdmin
  } else if (userRole === TestUserRole.Enum.REGISTRATION_AGENT) {
    token = generator.user.token.registrationAgent
  } else {
    token = generator.user.token.localRegistrar
  }

  const user = getOrThrow(
    getTokenPayload(token),
    'Token payload missing. User is not logged in'
  )

  const leafAdminStructureLocationIds = getLeafLocationIds(
    V2_DEFAULT_MOCK_LOCATIONS,
    [LocationType.enum.ADMIN_STRUCTURE]
  )

  return {
    user,
    leafAdminStructureLocationIds
  }
}
