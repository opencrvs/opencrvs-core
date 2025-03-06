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
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { tennisClueMembershipEventDocument } from '@client/v2-events/features/events/fixtures'
import { createTemporaryId } from '@client/v2-events/features/events/useEvents/api'
import { ROUTES } from '@client/v2-events/routes'
import { AppRouter } from '@client/v2-events/trpc'
import { ActionType } from '@opencrvs/commons/client'
import type { Meta, StoryObj } from '@storybook/react'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import superjson from 'superjson'
import * as Request from './index'
import { router } from './router'

const meta: Meta<typeof Request.Pages> = {
  title: 'CorrectionRequest'
}

export default meta

type Story = StoryObj<typeof Request.Pages>
const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

function FormClear() {
  const drafts = useDrafts()
  useEffect(() => {
    drafts.setLocalDraft({
      id: createTemporaryId(),
      eventId: tennisClueMembershipEventDocument.id,
      createdAt: new Date().toISOString(),
      transactionId: createTemporaryId(),
      action: {
        type: ActionType.REQUEST_CORRECTION,
        data: {
          'applicant.firstname': 'Max',
          'applicant.surname': 'McLaren',
          'applicant.dob': '2020-01-02',
          'recommender.none': true
        },
        metadata: {
          'correction.requester.relationship': 'ANOTHER_AGENT',
          'correction.request.reason': "Child's name was incorrect"
        },
        createdAt: new Date().toISOString(),
        createdBy: '',
        createdAtLocation: ''
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <Outlet />
}

export const ReviewWithChanges: Story = {
  parameters: {
    reactRouter: {
      router: {
        path: '/',
        element: <FormClear />,
        children: [router]
      },
      initialPath: ROUTES.V2.EVENTS.REQUEST_CORRECTION.REVIEW.buildPath({
        eventId: tennisClueMembershipEventDocument.id
      })
    },
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

export const AdditionalDetails: Story = {
  parameters: {
    reactRouter: {
      router: router,
      initialPath:
        ROUTES.V2.EVENTS.REQUEST_CORRECTION.ADDITIONAL_DETAILS_INDEX.buildPath({
          eventId: tennisClueMembershipEventDocument.id
        })
    },
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
export const Summary: Story = {
  parameters: {
    reactRouter: {
      router: {
        path: '/',
        element: <FormClear />,
        children: [router]
      },
      initialPath: ROUTES.V2.EVENTS.REQUEST_CORRECTION.SUMMARY.buildPath({
        eventId: tennisClueMembershipEventDocument.id
      })
    },
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
