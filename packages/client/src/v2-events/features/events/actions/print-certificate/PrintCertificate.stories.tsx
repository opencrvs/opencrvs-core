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
import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import {
  ActionType,
  generateActionDocument,
  generateEventDocument,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import {
  tennisClubMembershipEventIndex,
  tennisClubMembershipEventDocument
} from '@client/v2-events/features/events/fixtures'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { AppRouter } from '@client/v2-events/trpc'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
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
          }),
          tRPCMsw.event.list.query(() => {
            return [tennisClubMembershipEventIndex]
          })
        ]
      }
    }
  }
}

/**
 * Clears and sets the local draft with the event data.
 * Since Action.tsx runs before the component is mounted (and sets up both declaration & annotation form), we need to set the "test case" as draft.
 */
function SetAnnotationDraft({ eventId }: { eventId: string }) {
  const generator = testDataGenerator()
  const drafts = useDrafts()
  const draft = generator.event.draft({
    eventId,
    actionType: ActionType.PRINT_CERTIFICATE
  })

  useEffect(() => {
    drafts.setLocalDraft({
      ...draft,
      action: {
        ...draft.action,
        annotation: {
          [CERT_TEMPLATE_ID]: 'tennis-club-membership-certified-certificate',
          'collector.requesterId': 'INFORMANT',
          'collector.identity.verify': true,
          templateId: 'v2.tennis-club-membership-certified-certificate'
        }
      }
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <Outlet />
}

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

const printActionWithSelections = generateActionDocument({
  configuration: tennisClubMembershipEvent,
  action: ActionType.PRINT_CERTIFICATE,
  defaults: {
    annotation: {
      [CERT_TEMPLATE_ID]: 'tennis-club-membership-certificate',
      'collector.requesterId': 'OTHER',
      'collector.identity.verify': true,
      templateId: 'v2.tennis-club-membership-certificate'
    }
  }
})

const alreadyPrintedEvent = {
  ...registeredEvent,
  actions: registeredEvent.actions.concat(printActionWithSelections)
}

export const FormSetup: Story = {
  name: 'Form is empty when printing second time',
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.PRINT_CERTIFICATE.PAGES.buildPath({
        eventId: alreadyPrintedEvent.id,
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
            return alreadyPrintedEvent
          }),
          tRPCMsw.event.list.query(() => {
            return [tennisClubMembershipEventIndex]
          })
        ]
      }
    }
  }
}
export const FormSetupWithDraft: Story = {
  name: 'Form is filled from draft data',
  parameters: {
    reactRouter: {
      router: {
        initialPath: '/',
        element: <SetAnnotationDraft eventId={alreadyPrintedEvent.id} />,
        children: [routesConfig]
      },
      initialPath: ROUTES.V2.EVENTS.PRINT_CERTIFICATE.PAGES.buildPath({
        eventId: alreadyPrintedEvent.id,
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
            return alreadyPrintedEvent
          }),
          tRPCMsw.event.list.query(() => {
            return [tennisClubMembershipEventIndex]
          })
        ]
      }
    }
  }
}

export const Review: Story = {
  parameters: {
    reactRouter: {
      router: {
        initialPath: '/',
        element: (
          <SetAnnotationDraft eventId={tennisClubMembershipEventDocument.id} />
        ),
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
    },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          }),
          tRPCMsw.event.get.query(() => {
            return tennisClubMembershipEventDocument
          }),
          tRPCMsw.event.list.query(() => {
            return [tennisClubMembershipEventIndex]
          })
        ]
      }
    }
  }
}
