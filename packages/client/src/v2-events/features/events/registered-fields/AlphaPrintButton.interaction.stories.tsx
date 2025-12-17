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
import { fn, within, expect } from '@storybook/test'
import React from 'react'
import styled from 'styled-components'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import {
  ActionType,
  and,
  ConditionalType,
  event,
  FieldType,
  tennisClubMembershipEvent,
  TestUserRole,
  user,
  not,
  EventDocument,
  FieldConditional,
  ValidatorContext
} from '@opencrvs/commons/client'
import { ROUTES } from '@client/v2-events/routes'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { AppRouter, TRPCProvider } from '@client/v2-events/trpc'

import { noop } from '@client/v2-events'
import { tennisClubMembershipEventDocument } from '../fixtures'
import { getTestValidatorContext } from '../../../../../.storybook/decorators'

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

const meta: Meta<typeof FormFieldGenerator> = {
  title: 'Inputs/AlphaPrintButton/Interaction',
  args: { onChange: fn() },
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ],
  parameters: {
    msw: {
      handlers: {
        event: [
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          })
        ]
      }
    }
  }
}

export default meta

const StyledFormFieldGenerator = styled(FormFieldGenerator)`
  width: 400px;
`
function createAlphaPrintButtonStoryParameters(
  conditional: FieldConditional,
  validatorContext: ValidatorContext
) {
  return {
    reactRouter: {
      router: {
        path: ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
          eventId: tennisClubMembershipEventDocument.id
        }),
        element: (
          <StyledFormFieldGenerator
            fields={[
              {
                id: 'storybook.name',
                type: FieldType.ALPHA_PRINT_BUTTON,
                label: {
                  id: 'storybook.name.label',
                  defaultMessage: 'Name',
                  description: 'The title for the name input'
                },
                configuration: {
                  template: 'simple-certificate'
                },
                conditionals: [conditional]
              }
            ]}
            id="my-form"
            validatorContext={validatorContext}
            onChange={() => noop()}
          />
        )
      },
      initialPath: ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
        eventId: tennisClubMembershipEventDocument.id
      })
    }
  }
}

export const WithEnableCondition: StoryObj<{}> = {
  parameters: createAlphaPrintButtonStoryParameters(
    {
      type: ConditionalType.ENABLE,
      conditional: and(
        user.hasRole(TestUserRole.enum.LOCAL_REGISTRAR),
        not(event.hasAction(ActionType.DECLARE))
      )
    },
    getTestValidatorContext(TestUserRole.enum.LOCAL_REGISTRAR, {
      ...tennisClubMembershipEventDocument,
      actions: tennisClubMembershipEventDocument.actions.filter(
        (action) => action.type === ActionType.CREATE
      )
    })
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = await canvas.findByTestId('storybook____name')

    await expect(button).toBeEnabled()
  }
}

export const WithDisableCondition: StoryObj<{}> = {
  parameters: createAlphaPrintButtonStoryParameters(
    {
      type: ConditionalType.ENABLE,
      conditional: and(
        user.hasRole(TestUserRole.enum.LOCAL_REGISTRAR),
        not(event.hasAction(ActionType.DECLARE))
      )
    },
    getTestValidatorContext(
      TestUserRole.enum.LOCAL_REGISTRAR,
      tennisClubMembershipEventDocument
    )
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = await canvas.findByTestId('storybook____name')

    await expect(button).toBeDisabled()
  }
}
