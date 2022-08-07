/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import {
  submissionMiddleware,
  declarationReadyForStatusChange
} from './submissionMiddleware'
import {
  mockDeclarationData,
  createTestStore,
  ACTION_STATUS_MAP
} from '@client/tests/util'
import { Event } from '@client/utils/gateway'
import { SubmissionAction } from '@client/forms'
import { SUBMISSION_STATUS } from '.'
import { client } from '@client/utils/apolloClient'
import { ApolloError } from 'apollo-client'
import { GraphQLError } from 'graphql'

describe('Submission middleware', () => {
  const dispatch = jest.fn()
  const getState = jest.fn()
  const next = jest.fn()
  let mutateSpy: jest.SpyInstance

  const middleware = submissionMiddleware({
    dispatch,
    getState
  })(next)

  beforeEach(async () => {
    const { store } = await createTestStore()
    getState.mockImplementation(() => store.getState())
    mutateSpy = jest
      .spyOn(client, 'mutate')
      .mockImplementation(() => Promise.resolve())
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
      it(`should handle ${ACTION_STATUS_MAP[submissionAction]} ${event} declarations`, async () => {
        const action = declarationReadyForStatusChange({
          id: 'mockDeclaration',
          data: mockDeclarationData,
          event,
          action: submissionAction,
          submissionStatus: ACTION_STATUS_MAP[submissionAction]
        })
        await middleware(action)
        expect(mutateSpy.mock.calls.length).toBe(1)
        expect(dispatch.mock.calls.length).toBe(4)
        expect(dispatch.mock.calls[3][0].type).toContain('DELETE')
      })
    })
  })
})
