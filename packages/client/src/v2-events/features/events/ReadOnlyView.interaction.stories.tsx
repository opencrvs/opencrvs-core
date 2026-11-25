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
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, screen, userEvent, waitFor, within } from 'storybook/test'
import { http, HttpResponse } from 'msw'
import {
  ActionType,
  DocumentPath,
  EventDocument,
  EventDocumentOnlyLastAction,
  generateActionDocument,
  generateActionDocuments,
  generateTrackingId,
  createPrng,
  getCurrentEventState,
  getUUID,
  INITIAL_EVENT_CONFIG_VERSION_ID,
  TENNIS_CLUB_MEMBERSHIP,
  tennisClubMembershipEvent,
  TestUserRole
} from '@opencrvs/commons/client'
import { CACHE_NAME } from '@client/v2-events/cache'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { tRPCMsw } from '../../../../.storybook/default-request-handlers'
import { TestPdf, passiveFileRoute } from './fixtures'
import { ReadonlyViewIndex } from './ReadOnlyView'

const meta: Meta<typeof ReadonlyViewIndex> = {
  title: 'ReadOnlyView/Interaction'
}

export default meta

const localRegistrar = testDataGenerator().user.localRegistrar()
const eventId = getUUID()

const assignAction = generateActionDocument({
  configuration: tennisClubMembershipEvent,
  action: ActionType.ASSIGN,
  defaults: {
    createdBy: localRegistrar.v2.id,
    assignedTo: localRegistrar.v2.id
  }
})

const unassignedEvent: EventDocument = {
  type: TENNIS_CLUB_MEMBERSHIP,
  id: eventId,
  trackingId: generateTrackingId(createPrng(14482)),
  configVersionId: INITIAL_EVENT_CONFIG_VERSION_ID,
  createdAt: new Date(Date.now() - 1000).toISOString(),
  updatedAt: new Date(Date.now() - 1000).toISOString(),
  actions: [
    generateActionDocument({
      configuration: tennisClubMembershipEvent,
      action: ActionType.CREATE,
      defaults: { createdBy: localRegistrar.v2.id }
    }),
    ...generateActionDocuments({
      configuration: tennisClubMembershipEvent,
      action: ActionType.DECLARE,
      defaults: { createdBy: localRegistrar.v2.id },
      declarationOverrides: {
        'applicant.image': {
          path: `events/${eventId}/proof.pdf` as DocumentPath,
          originalFilename: 'proof.pdf',
          type: 'application/pdf'
        }
      }
    })
  ]
}

let currentEvent = unassignedEvent

export const AssignOnRecordTabKeepsDocuments: StoryObj<
  typeof ReadonlyViewIndex
> = {
  name: 'Document still loads after the record is assigned on the Record tab',
  loaders: [
    async () => {
      await caches.delete(CACHE_NAME)
      await caches.open(CACHE_NAME)
    }
  ],
  beforeEach: () => {
    currentEvent = unassignedEvent
  },
  parameters: {
    chromatic: { disableSnapshot: true },
    userRole: TestUserRole.enum.LOCAL_REGISTRAR,
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.EVENT.RECORD.buildPath({ eventId })
    },
    msw: {
      handlers: {
        event: [
          tRPCMsw.event.search.query(() => ({
            total: 1,
            results: [
              getCurrentEventState(currentEvent, tennisClubMembershipEvent)
            ]
          })),
          tRPCMsw.event.get.query(() => currentEvent),
          tRPCMsw.event.actions.assignment.assign.mutation(() => {
            currentEvent = {
              ...unassignedEvent,
              actions: [...unassignedEvent.actions, assignAction]
            }
            return EventDocumentOnlyLastAction.parse({
              ...currentEvent,
              actions: [assignAction]
            })
          })
        ],
        files: [
          tRPCMsw.event.file.getPresignedUrl.query(() => ({
            presignedURL: 'http://localhost:3535/ocrvs/proof.pdf'
          })),
          http.get(
            'http://localhost:3535/ocrvs/:id',
            () =>
              new HttpResponse(TestPdf, {
                headers: { 'Content-Type': 'application/pdf' }
              })
          ),
          passiveFileRoute
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const documentLoaded = async () =>
      waitFor(
        async () => {
          await expect(
            canvas.queryByText('Failed to load PDF')
          ).not.toBeInTheDocument()
          await expect(
            canvasElement.querySelector('#document_section canvas')
          ).not.toBeNull()
        },
        { timeout: 5000 }
      )

    await step('The document shows on the Record tab', async () => {
      await documentLoaded()
    })

    await step('Assign the record', async () => {
      await userEvent.click(
        await canvas.findByRole('button', { name: 'Action' })
      )
      await userEvent.click(await canvas.findByText('Assign'))
      await userEvent.click(
        await screen.findByRole('button', { name: 'Assign' })
      )
      await userEvent.click(
        await canvas.findByRole('button', { name: 'Action' })
      )
      await canvas.findByText('Unassign')
      await userEvent.keyboard('{Escape}')
    })

    await step('The document loads again on the Record tab', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Summary' }))
      await userEvent.click(
        await canvas.findByRole('button', { name: 'Record' })
      )
      await documentLoaded()
    })
  }
}
