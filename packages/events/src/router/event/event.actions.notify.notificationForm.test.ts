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
import { http, HttpResponse } from 'msw'
import {
  ActionStatus,
  ActionType,
  ActionUpdate,
  AddressType,
  EventConfig,
  FieldType,
  getAcceptedActions,
  getActionConfig,
  getCurrentEventState,
  getUUID
} from '@opencrvs/commons'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import { createTestClient, setupTestCase } from '@events/tests/utils'
import { CreatedUser, payloadGenerator } from '@events/tests/generators'
import { mswServer } from '@events/tests/msw'
import { env } from '@events/environment'

const NOTIFY_ONLY_FIELD_ID = 'notifier.comment'

const notifyOnlyField = {
  id: NOTIFY_ONLY_FIELD_ID,
  type: FieldType.TEXT,
  label: {
    id: 'event.tennis-club-membership.action.notify.review.notifier.comment.label',
    defaultMessage: 'Comment of the notifier',
    description: 'Label of a notify-only review field'
  }
}

/**
 * The fixture is built with `defineConfig`, so its NOTIFY action carries the
 * notification form and review generated from the DECLARE action.
 */
const generatedNotifyAction = (() => {
  const action = getActionConfig({
    eventConfiguration: tennisClubMembershipEvent,
    actionType: ActionType.NOTIFY
  })

  if (action?.type !== ActionType.NOTIFY) {
    throw new Error('Expected a NOTIFY action')
  }

  return action
})()

function withNotifyReviewFields(
  fields: typeof generatedNotifyAction.review.fields
): EventConfig {
  return {
    ...tennisClubMembershipEvent,
    actions: tennisClubMembershipEvent.actions.map((action) =>
      action.type === ActionType.NOTIFY
        ? {
            ...generatedNotifyAction,
            review: { ...generatedNotifyAction.review, fields }
          }
        : action
    )
  }
}

const declaration = {
  'applicant.dob': '2024-02-01',
  'applicant.dobUnknown': false,
  'applicant.name': { firstname: 'John', surname: 'Doe' },
  'recommender.none': true,
  'applicant.address': {
    country: 'FAR',
    addressType: AddressType.DOMESTIC,
    administrativeArea: '27160bbd-32d1-4625-812f-860226bfb92a',
    streetLevelDetails: { state: 'state', district2: 'district2' }
  }
} satisfies ActionUpdate

const reviewAnnotation = {
  'review.comment': 'Notified at the health facility',
  'review.signature': {
    path: '4f095fc4-4312-4de2-aa38-86dcc0f71044.png',
    originalFilename: 'abcd.png',
    type: 'image/png'
  }
} satisfies ActionUpdate

describe('event.actions.notify with a notification form', () => {
  let user: CreatedUser
  let generator: ReturnType<typeof payloadGenerator>

  beforeEach(async () => {
    const testCase = await setupTestCase()
    user = testCase.user
    generator = testCase.generator
  })

  function useEventConfig(config: EventConfig) {
    mswServer.use(
      http.get(`${env.COUNTRY_CONFIG_URL}/config/events`, () =>
        HttpResponse.json([config])
      )
    )
  }

  test('an empty notification succeeds and keeps the review comment and signature in the action history', async () => {
    useEventConfig(tennisClubMembershipEvent)
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())

    const notifiedEvent = await client.event.actions.notify.request({
      type: ActionType.NOTIFY,
      eventId: event.id,
      transactionId: getUUID(),
      declaration: {},
      annotation: reviewAnnotation
    })

    const notifyAction = getAcceptedActions(notifiedEvent).find(
      (action) => action.type === ActionType.NOTIFY
    )
    expect(notifyAction).toMatchObject({
      status: ActionStatus.Accepted,
      annotation: reviewAnnotation
    })
  })

  test('a notify-only review field is stored only on the NOTIFY action annotation', async () => {
    const config = withNotifyReviewFields([
      ...generatedNotifyAction.review.fields,
      notifyOnlyField
    ])
    useEventConfig(config)
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())

    await client.event.actions.notify.request({
      type: ActionType.NOTIFY,
      eventId: event.id,
      transactionId: getUUID(),
      declaration: {},
      annotation: { [NOTIFY_ONLY_FIELD_ID]: 'Mother was discharged early' }
    })

    // A notified record is completed by editing it, then declaring it.
    await client.event.actions.assignment.assign(
      generator.event.actions.assign(event.id, { assignedTo: user.id })
    )
    await client.event.actions.edit.request(
      generator.event.actions.edit(event.id, {
        declaration,
        annotation: {},
        keepAssignment: true
      })
    )
    const declaredEvent = await client.event.actions.declare.request(
      generator.event.actions.declare(event.id, {
        declaration: {},
        annotation: reviewAnnotation
      })
    )

    const acceptedActions = getAcceptedActions(declaredEvent)
    const notifyAction = acceptedActions.find(
      (action) => action.type === ActionType.NOTIFY
    )
    const declareAction = acceptedActions.find(
      (action) => action.type === ActionType.DECLARE
    )

    expect(notifyAction?.annotation).toEqual({
      [NOTIFY_ONLY_FIELD_ID]: 'Mother was discharged early'
    })
    expect(declareAction?.annotation).not.toHaveProperty(NOTIFY_ONLY_FIELD_ID)
    expect(
      getCurrentEventState(declaredEvent, config).declaration
    ).not.toHaveProperty(NOTIFY_ONLY_FIELD_ID)
  })

  test('rejects annotation for fields that are not in the NOTIFY review or form', async () => {
    useEventConfig(withNotifyReviewFields([notifyOnlyField]))
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())

    await expect(
      client.event.actions.notify.request({
        type: ActionType.NOTIFY,
        eventId: event.id,
        transactionId: getUUID(),
        declaration: {},
        annotation: { 'review.comment': 'Only DECLARE has this field' }
      })
    ).rejects.toThrow(
      JSON.stringify([
        {
          message: 'Unexpected field',
          id: 'review.comment',
          value: 'Only DECLARE has this field'
        }
      ])
    )
  })
})
