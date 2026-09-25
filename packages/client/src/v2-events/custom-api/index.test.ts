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
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import { setupServer } from 'msw/node'
import superjson from 'superjson'
import {
  ActionStatus,
  ActionType,
  ConditionalType,
  EventConfig,
  field,
  FieldType,
  generateEventDocument,
  getUUID,
  PageTypes,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import { AppRouter } from '@client/v2-events/trpc'
import { makeCorrectionOnRequest } from './index'

const eventConfiguration = {
  ...tennisClubMembershipEvent,
  actions: tennisClubMembershipEvent.actions.map((action) =>
    action.type !== ActionType.REQUEST_CORRECTION
      ? action
      : {
          ...action,
          correctionForm: {
            ...action.correctionForm,
            pages: [
              {
                id: 'correction-evidence',
                type: PageTypes.enum.FORM,
                requireCompletionToContinue: false,
                title: {
                  id: 'correction.evidence.title',
                  defaultMessage: 'Evidence',
                  description: 'Evidence'
                },
                fields: [
                  {
                    id: 'correction.ageEvidence',
                    type: FieldType.TEXT,
                    label: {
                      id: 'correction.ageEvidence.label',
                      defaultMessage: 'Evidence of age',
                      description: 'Evidence of age'
                    },
                    conditionals: [
                      {
                        type: ConditionalType.SHOW,
                        conditional: field('applicant.dobUnknown').isEqualTo(
                          true
                        )
                      }
                    ]
                  }
                ]
              }
            ]
          }
        }
  )
} satisfies EventConfig

function declaredEvent(dobUnknown: boolean) {
  return generateEventDocument({
    configuration: eventConfiguration,
    actions: [
      { type: ActionType.CREATE },
      {
        type: ActionType.DECLARE,
        declarationOverrides: { 'applicant.dobUnknown': dobUnknown }
      }
    ]
  })
}

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: '/api/events' })],
  transformer: { input: superjson, output: superjson }
})

let sentAnnotation: unknown

const server = setupServer(
  tRPCMsw.event.actions.correction.request.request.mutation((input) => {
    sentAnnotation = input.annotation
    const event = declaredEvent(false)
    return {
      ...event,
      actions: [
        ...event.actions,
        {
          ...event.actions[0],
          type: ActionType.REQUEST_CORRECTION,
          status: ActionStatus.Rejected
        }
      ]
    }
  })
)

beforeAll(() => server.listen())
afterAll(() => server.close())

describe('makeCorrectionOnRequest', () => {
  it('keeps annotation fields shown by the corrected declaration', async () => {
    await makeCorrectionOnRequest({
      eventId: getUUID(),
      transactionId: getUUID(),
      declaration: { 'applicant.dobUnknown': true, 'applicant.age': 30 },
      annotation: { 'correction.ageEvidence': 'Birth certificate' },
      event: declaredEvent(false),
      eventConfiguration,
      context: {}
    })

    expect(sentAnnotation).toEqual({
      'correction.ageEvidence': 'Birth certificate'
    })
  })

  it('drops annotation fields hidden by the corrected declaration', async () => {
    await makeCorrectionOnRequest({
      eventId: getUUID(),
      transactionId: getUUID(),
      declaration: { 'applicant.dobUnknown': false, 'applicant.age': null },
      annotation: { 'correction.ageEvidence': 'Birth certificate' },
      event: declaredEvent(true),
      eventConfiguration,
      context: {}
    })

    expect(sentAnnotation).toEqual({})
  })
})
