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
import { ApolloError } from '@apollo/client'
import { SubmissionAction } from '@client/forms'
import {
  ACTION_STATUS_MAP,
  createTestStore,
  mockDeclarationData
} from '@client/tests/util'
import { createClient } from '@client/utils/apolloClient'
import { Event } from '@client/utils/gateway'
import { GraphQLError } from 'graphql'
import { SpyInstance, vi } from 'vitest'
import { SUBMISSION_STATUS } from '.'
import {
  declarationReadyForStatusChange,
  submissionMiddleware
} from './submissionMiddleware'

describe('Submission middleware', () => {
  const dispatch = vi.fn()
  const getState = vi.fn()
  const next = vi.fn()
  let mutateSpy: SpyInstance

  const middleware = submissionMiddleware({
    dispatch,
    getState
  })(next)

  beforeEach(async () => {
    const { store } = await createTestStore()
    const client = createClient(store)
    getState.mockImplementation(() => store.getState())
    mutateSpy = vi
      .spyOn(client, 'mutate')
      .mockImplementation(() => Promise.resolve({}))
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should do nothing if not declarationReadyForStatusChange action', () => {
    const action = { type: 'random action' }
    middleware(action)
    expect(dispatch.mock.calls.length).toBe(0)
  })

  it('should handle network error', async () => {
    const action = declarationReadyForStatusChange({
      id: 'mockDeclaration',
      data: mockDeclarationData,
      event: Event.Birth,
      action: SubmissionAction.SUBMIT_FOR_REVIEW,
      submissionStatus: SUBMISSION_STATUS.READY_TO_SUBMIT
    })
    mutateSpy.mockRejectedValueOnce(
      new ApolloError({ networkError: new Error('Network Error') })
    )
    await middleware(action)
    expect(mutateSpy.mock.calls.length).toBe(1)
    expect(dispatch.mock.calls.length).toBe(4)
    expect(dispatch.mock.calls[3][0].payload.declaration.submissionStatus).toBe(
      SUBMISSION_STATUS.FAILED_NETWORK
    )
  })

  it('should handle unassigned error', async () => {
    const action = declarationReadyForStatusChange({
      id: 'mockDeclaration',
      data: mockDeclarationData,
      event: Event.Birth,
      action: SubmissionAction.REJECT_DECLARATION,
      submissionStatus: SUBMISSION_STATUS.READY_TO_REJECT
    })

    mutateSpy.mockRejectedValueOnce(
      new ApolloError({
        graphQLErrors: [
          new GraphQLError(
            'GQL Error',
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            { code: 'UNASSIGNED' }
          )
        ]
      })
    )
    await middleware(action)
    expect(mutateSpy.mock.calls.length).toBe(1)
    expect(dispatch.mock.calls.length).toBe(4)
    expect(dispatch.mock.calls[3][0].type).toContain('DELETE')
  })

  it('should handle other errors', async () => {
    const action = declarationReadyForStatusChange({
      id: 'mockDeclaration',
      data: mockDeclarationData,
      event: Event.Birth,
      action: SubmissionAction.SUBMIT_FOR_REVIEW,
      submissionStatus: SUBMISSION_STATUS.READY_TO_SUBMIT
    })
    mutateSpy.mockRejectedValueOnce(new Error('Dummy Error'))
    await middleware(action)
    expect(mutateSpy.mock.calls.length).toBe(1)
    expect(dispatch.mock.calls.length).toBe(4)
    expect(dispatch.mock.calls[3][0].payload.declaration.submissionStatus).toBe(
      SUBMISSION_STATUS.FAILED
    )
  })

  Object.values(Event).forEach((event) => {
    Object.values(SubmissionAction).forEach((submissionAction) => {
      if (
        event === Event.Marriage &&
        [
          SubmissionAction.APPROVE_CORRECTION,
          SubmissionAction.REJECT_CORRECTION,
          SubmissionAction.MAKE_CORRECTION,
          SubmissionAction.REQUEST_CORRECTION
        ].includes(submissionAction)
      ) {
        return
      }

      it(`should handle ${ACTION_STATUS_MAP[submissionAction]} ${event} declarations`, async () => {
        mockDeclarationData.registration.certificates[0] = {
          collector: {
            relationship: 'OTHER',
            affidavit: {
              contentType: 'image/jpg',
              data: 'data:image/png;base64,2324256'
            },
            individual: {
              name: [{ firstNames: 'Doe', familyName: 'Jane', use: 'en' }],
              identifier: [{ id: '123456', type: 'PASSPORT' }]
            }
          },
          hasShowedVerifiedDocument: true,
          payments: [
            {
              paymentId: '1234',
              type: 'MANUAL',
              amount: 50,
              outcome: 'COMPLETED',
              date: '2018-10-22'
            }
          ],
          data: 'data:image/png;base64,2324256'
        }
        const action = declarationReadyForStatusChange({
          id: 'mockDeclaration',
          data: mockDeclarationData,
          event,
          action: submissionAction,
          submissionStatus: ACTION_STATUS_MAP[submissionAction]
        })
        await middleware(action)
        vi.runAllTimers()
        expect(mutateSpy.mock.calls.length).toBe(1)
        expect(dispatch.mock.calls.length).toBe(4)
        if (
          submissionAction === SubmissionAction.CERTIFY_AND_ISSUE_DECLARATION
        ) {
          expect(
            dispatch.mock.calls[3][0].payload.declaration.data.registration
              .certificates
          ).not.toHaveProperty('data')
          expect(
            dispatch.mock.calls[3][0].payload.declaration.data.registration
              .certificates
          ).not.toHaveProperty('payments')
          expect(dispatch.mock.calls[3][0].type).toContain('WRITE_DRAFT')
        } else {
          expect(dispatch.mock.calls[3][0].type).toContain('DELETE')
        }
      })
    })
  })
})
