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
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import { FieldType, tennisClubMembershipEvent } from '@opencrvs/commons/client'
import { ROUTES } from '@client/v2-events/routes'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { AppRouter, TRPCProvider } from '@client/v2-events/trpc'

import { noop } from '@client/v2-events'
import { tennisClubMembershipEventDocument } from '../fixtures'
import { getTestValidatorContext } from '../../../../../.storybook/decorators'

const meta: Meta<typeof FormFieldGenerator> = {
  title: 'Inputs/AlphaPrintButton',
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

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

const StyledFormFieldGenerator = styled(FormFieldGenerator)`
  width: 400px;
`
export const Default: StoryObj<typeof FormFieldGenerator> = {
  parameters: {
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
                }
              }
            ]}
            id="my-form"
            validatorContext={getTestValidatorContext()}
            onChange={() => noop()}
          />
        )
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
