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
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'

import superjson from 'superjson'
import {
  tennisClueMembershipEventDocument,
  tennisClubMembershipEvent,
  DEFAULT_FORM
} from '@client/v2-events/features/events/fixtures'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { AppRouter, TRPCProvider } from '@client/v2-events/trpc'

import { Review } from './Review'
import React from 'react'
import { within } from '@storybook/test'
import {
  eventConfig,
  declarationForm
} from '../registered-fields/Address.stories'

const meta: Meta<typeof Review.Body> = {
  title: 'Review',
  component: Review.Body,
  args: {
    eventConfig: tennisClubMembershipEvent,
    formConfig: DEFAULT_FORM,
    form: {
      'applicant.firstname': 'John',
      'applicant.surname': 'Doe',
      'applicant.dob': '1990-01-01',
      'applicant.address': {
        country: 'FAR',
        province: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c',
        street: '123 Tennis Club Avenue',
        number: '123',
        zipCode: 'Z12345',
        urbanOrRural: 'RURAL',
        town: 'Tennisville',
        village: 'Tennisville'
      }
    },
    onEdit: () => {},
    title: 'Member declaration for John Doe'
  },
  beforeEach: () => {
    useEventFormData.getState().clear()
  },
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}

export default meta

type Story = StoryObj<typeof Review.Body>
const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

export const ReviewWithoutChanges: Story = {
  parameters: {
    msw: {
      handlers: {
        event: [
          tRPCMsw.event.get.query(() => {
            return tennisClueMembershipEventDocument
          })
        ]
      }
    }
  }
}
