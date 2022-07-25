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
import { AppStore, createStore } from '@client/store'
import { SubmissionController } from '@client/SubmissionController'
import { SUBMISSION_STATUS } from '@client/declarations'
import { SubmissionAction } from './forms'
import { flushPromises } from './tests/util'
import { declarationReadyForStatusChange } from './declarations/submissionMiddleware'

beforeEach(() => {
  Date.now = jest.fn(() => 1572408000000 + 2000000)
})

describe('Submission Controller', () => {
  it('starts the interval', () => {
    const originalInterval = window.setInterval
    window.setInterval = jest.fn()
    const { store } = createStore()
    new SubmissionController(store).start()
    expect(setInterval).toBeCalled()
    window.setInterval = originalInterval
    // @ts-ignore
    window.setTimeout = (fn: (...args: any[]) => void) => {
      return new Promise((resolve) => {
        fn()
        resolve(0)
      })
    }
  })

  it('does nothing if sync is already running', async () => {
    const store = {
      getState: () => ({
        declarationsState: {
          declarations: [
            {
              submissionStatus: SUBMISSION_STATUS.READY_TO_SUBMIT
            }
          ]
        },
        registerForm: {
          registerForm: {}
        }
      }),
      dispatch: jest.fn()
    }

    const subCon = new SubmissionController(store as unknown as AppStore)
    subCon.syncRunning = true
    subCon.sync()

    await flushPromises()

    expect(store.dispatch).not.toBeCalled()
  })

  it('changes status of drafts that are hanging for long time', async () => {
    const store = {
      getState: () => ({
        declarationsState: {
          declarations: [
            {
              modifiedOn: 1572408000000,
              action: SubmissionAction.SUBMIT_FOR_REVIEW,
              submissionStatus: SUBMISSION_STATUS.SUBMITTING
            }
          ]
        },
        registerForm: {
          registerForm: {}
        }
      }),
      dispatch: jest.fn()
    }

    const subCon = new SubmissionController(store as unknown as AppStore)
    subCon.requeueHangingDeclarations()

    expect(store.dispatch).toHaveBeenCalledTimes(1)
  })

  it('does nothing if offline', () => {
    const store = {
      getState: () => ({
        declarationsState: {
          declarations: [
            {
              submissionStatus: SUBMISSION_STATUS.READY_TO_SUBMIT
            }
          ]
        },
        registerForm: {
          registerForm: {}
        }
      }),
      dispatch: jest.fn()
    }

    // @ts-ignore
    const subCon = new SubmissionController(store)
    // @ts-ignore
    Object.defineProperty(global.navigator, 'onLine', {
      value: false,
      writable: true
    })
    subCon.sync()
    // @ts-ignore
    Object.defineProperty(global.navigator, 'onLine', {
      value: true,
      writable: true
    })

    expect(store.dispatch).not.toBeCalled()
  })

  it('syncs all ready to submit and network failed declarations but keeps the submitted declaration when having declare scope', async () => {
    const store = {
      getState: () => ({
        profile: {
          userDetails: {},
          tokenPayload: {
            scope: ['declare']
          }
        },
        offline: { userDetails: { role: 'FIELD_AGENT' } },
        declarationsState: {
          declarations: [
            {
              event: 'birth',
              action: SubmissionAction.SUBMIT_FOR_REVIEW,
              submissionStatus: SUBMISSION_STATUS.READY_TO_SUBMIT
            },
            {
              event: 'birth',
              action: SubmissionAction.SUBMIT_FOR_REVIEW,
              modifiedOn: 1572408000000,
              submissionStatus: SUBMISSION_STATUS.FAILED_NETWORK
            },
            {
              submissionStatus: SUBMISSION_STATUS.FAILED
            },
            {
              submissionStatus: SUBMISSION_STATUS.SUBMITTED
            }
          ]
        },
        registerForm: {
          registerForm: {}
        }
      }),
      dispatch: jest.fn()
    }

    // @ts-ignore
    const subCon = new SubmissionController(store)

    subCon.sync()
    expect(store.dispatch).toHaveBeenCalledTimes(2)
    expect(store.dispatch.mock.calls[0][0].payload.action).toBe(
      SubmissionAction.SUBMIT_FOR_REVIEW
    )
    expect(store.dispatch.mock.calls[0][0].type).toBe(
      declarationReadyForStatusChange.toString()
    )
    expect(store.dispatch.mock.calls[1][0].payload.action).toBe(
      SubmissionAction.SUBMIT_FOR_REVIEW
    )
    expect(store.dispatch.mock.calls[1][0].type).toBe(
      declarationReadyForStatusChange.toString()
    )
  })

  const STATUS_MAP = {
    [SubmissionAction.SUBMIT_FOR_REVIEW]: SUBMISSION_STATUS.READY_TO_SUBMIT,
    [SubmissionAction.APPROVE_DECLARATION]: SUBMISSION_STATUS.READY_TO_APPROVE,
    [SubmissionAction.REGISTER_DECLARATION]:
      SUBMISSION_STATUS.READY_TO_REGISTER,
    [SubmissionAction.REJECT_DECLARATION]: SUBMISSION_STATUS.READY_TO_REJECT,
    [SubmissionAction.REQUEST_CORRECTION_DECLARATION]:
      SUBMISSION_STATUS.READY_TO_REQUEST_CORRECTION,
    [SubmissionAction.COLLECT_CERTIFICATE]: SUBMISSION_STATUS.READY_TO_CERTIFY,
    [SubmissionAction.ARCHIVE_DECLARATION]: SUBMISSION_STATUS.READY_TO_ARCHIVE
  } as const

  Object.values(SubmissionAction).forEach((action) => {
    it(`syncs all ${STATUS_MAP[action]} declarations`, async () => {
      const store = {
        getState: () => ({
          declarationsState: {
            declarations: [
              {
                submissionStatus: STATUS_MAP[action],
                action
              }
            ]
          }
        }),
        dispatch: jest.fn()
      }

      // @ts-ignore
      const subCon = new SubmissionController(store)

      subCon.sync()

      expect(store.dispatch).toHaveBeenCalledTimes(1)
      expect(store.dispatch.mock.calls[0][0].payload.action).toBe(action)
      expect(store.dispatch.mock.calls[0][0].type).toBe(
        declarationReadyForStatusChange.toString()
      )
    })
  })
})
