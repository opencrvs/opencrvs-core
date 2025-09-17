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
import React from 'react'
import { Outlet } from 'react-router-dom'
import {
  ActionType,
  generateActionDocument,
  generateEventDocument,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import { tennisClubMembershipEventDocument } from '@client/v2-events/features/events/fixtures'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { AppRouter } from '@client/v2-events/trpc'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { CERT_TEMPLATE_ID } from '@client/v2-events/features/events/useCertificateTemplateSelectorFieldConfig'
import * as PrintCertificate from './index'

const meta: Meta<typeof PrintCertificate.Review> = {
  title: 'Print Certificate'
}

export default meta

type Story = StoryObj<typeof PrintCertificate.Pages>
const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

export const CollectorForm: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.PRINT_CERTIFICATE.PAGES.buildPath({
        eventId: tennisClubMembershipEventDocument.id,
        pageId: 'collector'
      })
    },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          }),
          tRPCMsw.event.get.query(() => {
            return tennisClubMembershipEventDocument
          })
        ]
      }
    }
  }
}

const printActionWithSelections = generateActionDocument({
  configuration: tennisClubMembershipEvent,
  action: ActionType.PRINT_CERTIFICATE,
  defaults: {
    annotation: {
      [CERT_TEMPLATE_ID]: 'tennis-club-membership-certificate',
      'collector.requesterId': 'OTHER',
      'collector.identity.verify': true,
      templateId: 'tennis-club-membership-certificate'
    }
  }
})

const registeredEvent = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [
    ActionType.CREATE,
    ActionType.DECLARE,
    ActionType.VALIDATE,
    ActionType.REGISTER,
    ActionType.PRINT_CERTIFICATE
  ]
})

const alreadyPrintedEvent = {
  ...registeredEvent,
  actions: registeredEvent.actions.concat(printActionWithSelections)
}

export const FormSetup: Story = {
  name: 'Form is empty when printing second time',
  parameters: {
    offline: {
      events: [alreadyPrintedEvent]
    },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.PRINT_CERTIFICATE.PAGES.buildPath({
        eventId: alreadyPrintedEvent.id,
        pageId: 'collector'
      })
    }
  }
}

const generator = testDataGenerator()
export const FormSetupWithDraft: Story = {
  name: 'Form is filled from draft data',
  parameters: {
    offline: {
      events: [alreadyPrintedEvent],
      drafts: [
        generator.event.draft({
          eventId: alreadyPrintedEvent.id,
          actionType: ActionType.PRINT_CERTIFICATE,
          annotation: {
            [CERT_TEMPLATE_ID]: 'tennis-club-membership-certified-certificate',
            'collector.requesterId': 'INFORMANT',
            'collector.identity.verify': true,
            templateId: 'tennis-club-membership-certified-certificate'
          }
        })
      ]
    },
    reactRouter: {
      router: {
        initialPath: '/',
        element: <Outlet />,
        children: [routesConfig]
      },
      initialPath: ROUTES.V2.EVENTS.PRINT_CERTIFICATE.PAGES.buildPath({
        eventId: alreadyPrintedEvent.id,
        pageId: 'collector'
      })
    }
  }
}
export const Review: Story = {
  parameters: {
    offline: {
      events: [tennisClubMembershipEventDocument],
      drafts: [
        generator.event.draft({
          eventId: tennisClubMembershipEventDocument.id,
          actionType: ActionType.PRINT_CERTIFICATE,
          annotation: {
            [CERT_TEMPLATE_ID]: 'tennis-club-membership-certified-certificate',
            'collector.requesterId': 'INFORMANT',
            'collector.identity.verify': true,
            templateId: 'tennis-club-membership-certified-certificate'
          }
        })
      ]
    },
    reactRouter: {
      router: {
        initialPath: '/',
        element: <Outlet />,
        children: [routesConfig]
      },
      initialPath: ROUTES.V2.EVENTS.PRINT_CERTIFICATE.REVIEW.buildPath(
        {
          eventId: tennisClubMembershipEventDocument.id
        },
        {
          templateId: 'tennis-club-membership-certificate'
        }
      )
    }
  }
}
