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
  EventDocument
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
    reactRouter: {
      router: {
        path: ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
          eventId: tennisClubMembershipEventDocument.id
        })
      },
      initialPath: ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
        eventId: tennisClubMembershipEventDocument.id
      })
    },
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

export const WithEnableCondition: StoryObj<{}> = {
  render: () => (
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
          conditionals: [
            {
              type: ConditionalType.ENABLE,
              conditional: and(
                user.hasRole(TestUserRole.Enum.LOCAL_REGISTRAR),
                not(event.hasAction(ActionType.DECLARE))
              )
            }
          ]
        }
      ]}
      id="my-form"
      validatorContext={getTestValidatorContext(
        TestUserRole.Enum.LOCAL_REGISTRAR,
        {
          ...tennisClubMembershipEventDocument,
          actions: tennisClubMembershipEventDocument.actions.filter(
            (action) => action.type === ActionType.CREATE
          )
        }
      )}
      onChange={() => noop()}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = await canvas.findByTestId('storybook____name')

    await expect(button).toBeEnabled()
  }
}

export const WithDisableCondition: StoryObj<{}> = {
  render: () => (
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
          conditionals: [
            {
              type: ConditionalType.ENABLE,
              conditional: and(
                user.hasRole(TestUserRole.Enum.LOCAL_REGISTRAR),
                not(event.hasAction(ActionType.DECLARE))
              )
            }
          ]
        }
      ]}
      id="my-form"
      validatorContext={getTestValidatorContext(
        TestUserRole.Enum.LOCAL_REGISTRAR,
        tennisClubMembershipEventDocument
      )}
      onChange={() => noop()}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = await canvas.findByTestId('storybook____name')

    await expect(button).toBeDisabled()
  }
}
