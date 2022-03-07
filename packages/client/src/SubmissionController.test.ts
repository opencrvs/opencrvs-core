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
import { Action } from './forms'
import { createMockClient } from 'mock-apollo-client'
import {
  SUBMIT_BIRTH_DECLARATION,
  APPROVE_BIRTH_DECLARATION,
  REGISTER_BIRTH_DECLARATION,
  REJECT_BIRTH_DECLARATION
} from '@client/views/DataProvider/birth/mutations'
import { ApolloError } from 'apollo-client'
import { flushPromises } from './tests/util'

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
    await subCon.requeueHangingDeclarations()

    expect(store.dispatch).toHaveBeenCalledTimes(2)
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
        declarationsState: {
          declarations: [
            {
              event: 'birth',
              action: Action.SUBMIT_FOR_REVIEW,
              submissionStatus: SUBMISSION_STATUS.READY_TO_SUBMIT
            },
            {
              event: 'birth',
              action: Action.SUBMIT_FOR_REVIEW,
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
    subCon.client = createMockClient()
    const mutationHandler = jest.fn().mockResolvedValue({
      data: {
        createBirthRegistration: {
          compositionId: '123',
          trackingId: 'Baaaaaa'
        }
      }
    })
    subCon.client.setRequestHandler(SUBMIT_BIRTH_DECLARATION, mutationHandler)

    await subCon.sync()

    expect(mutationHandler).toHaveBeenCalledTimes(2)
    expect(store.dispatch).toHaveBeenCalledTimes(10)
    expect(
      store.dispatch.mock.calls[0][0].payload.declaration.submissionStatus
    ).toBe(SUBMISSION_STATUS.SUBMITTED)
    expect(
      store.dispatch.mock.calls[1][0].payload.declaration.submissionStatus
    ).toBe(SUBMISSION_STATUS.SUBMITTED)
    expect(store.dispatch.mock.calls[9][0].type).toBe('DECLARATION/WRITE_DRAFT')
  })

  it('sync all ready to approve declaration and deletes approved declaration', async () => {
    const store = {
      getState: () => ({
        declarationsState: {
          declarations: [
            {
              event: 'birth',
              submissionStatus: SUBMISSION_STATUS.READY_TO_APPROVE,
              action: Action.APPROVE_DECLARATION
            }
          ]
        },
        registerForm: {
          registerForm: {}
        },
        profile: {
          tokenPayload: {
            scope: []
          }
        }
      }),
      dispatch: jest.fn()
    }

    // @ts-ignore
    const subCon = new SubmissionController(store)
    subCon.client = createMockClient()
    const mutationHandler = jest.fn().mockResolvedValue({
      data: { data: { markBirthAsValidated: {} } }
    })
    subCon.client.setRequestHandler(APPROVE_BIRTH_DECLARATION, mutationHandler)

    await subCon.sync()

    expect(mutationHandler).toHaveBeenCalledTimes(1)
    expect(store.dispatch).toHaveBeenCalledTimes(5)
    expect(
      store.dispatch.mock.calls[0][0].payload.declaration.submissionStatus
    ).toBe(SUBMISSION_STATUS.APPROVED)
    expect(store.dispatch.mock.calls[4][0].type).toBe(
      'DECLARATION/DELETE_DRAFT'
    )
  })

  it('sync all ready to register declaration and deletes registered declaration', async () => {
    const store = {
      getState: () => ({
        declarationsState: {
          declarations: [
            {
              event: 'birth',
              submissionStatus: SUBMISSION_STATUS.READY_TO_REGISTER,
              action: Action.REGISTER_DECLARATION
            }
          ]
        },
        registerForm: {
          registerForm: {}
        },
        profile: {
          tokenPayload: {
            scope: []
          }
        }
      }),
      dispatch: jest.fn()
    }

    // @ts-ignore
    const subCon = new SubmissionController(store)

    subCon.client = createMockClient()
    const mutationHandler = jest.fn().mockResolvedValue({
      data: { data: { markBirthAsValidated: {} } }
    })
    subCon.client.setRequestHandler(REGISTER_BIRTH_DECLARATION, mutationHandler)

    await subCon.sync()

    expect(mutationHandler).toHaveBeenCalledTimes(1)
    expect(store.dispatch).toHaveBeenCalledTimes(5)
    expect(
      store.dispatch.mock.calls[0][0].payload.declaration.submissionStatus
    ).toBe(SUBMISSION_STATUS.REGISTERED)
    expect(store.dispatch.mock.calls[4][0].type).toBe(
      'DECLARATION/DELETE_DRAFT'
    )
  })

  it('sync all ready to reject declaration and deletes rejected declaration', async () => {
    const store = {
      getState: () => ({
        declarationsState: {
          declarations: [
            {
              event: 'birth',
              submissionStatus: SUBMISSION_STATUS.READY_TO_REJECT,
              action: Action.REJECT_DECLARATION
            }
          ]
        },
        registerForm: {
          registerForm: {}
        },
        profile: {
          tokenPayload: {
            scope: []
          }
        }
      }),
      dispatch: jest.fn()
    }

    // @ts-ignore
    const subCon = new SubmissionController(store)

    subCon.client = createMockClient()
    const mutationHandler = jest.fn().mockResolvedValue({
      data: { data: { markBirthAsValidated: {} } }
    })
    subCon.client.setRequestHandler(REJECT_BIRTH_DECLARATION, mutationHandler)

    await subCon.sync()

    expect(mutationHandler).toHaveBeenCalledTimes(1)
    expect(store.dispatch).toHaveBeenCalledTimes(5)
    expect(
      store.dispatch.mock.calls[0][0].payload.declaration.submissionStatus
    ).toBe(SUBMISSION_STATUS.REJECTED)
    expect(store.dispatch.mock.calls[4][0].type).toBe(
      'DECLARATION/DELETE_DRAFT'
    )
  })

  it('fails a declaration that has a network error', async () => {
    const store = {
      getState: () => ({
        declarationsState: {
          declarations: [
            {
              event: 'birth',
              submissionStatus: SUBMISSION_STATUS.READY_TO_REJECT,
              action: Action.REJECT_DECLARATION
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

    const err = new ApolloError({ networkError: new Error('network boom') })
    subCon.client = createMockClient()
    const mutationHandler = jest.fn().mockImplementation(() => err)
    subCon.client.setRequestHandler(REJECT_BIRTH_DECLARATION, mutationHandler)

    await subCon.sync()

    expect(mutationHandler).toHaveBeenCalledTimes(1)
    expect(store.dispatch).toHaveBeenCalledTimes(4)
    expect(
      store.dispatch.mock.calls[0][0].payload.declaration.submissionStatus
    ).toBe(SUBMISSION_STATUS.FAILED_NETWORK)
  })

  it('fails a declaration that has an ordinary error', async () => {
    const store = {
      getState: () => ({
        declarationsState: {
          declarations: [
            {
              event: 'birth',
              submissionStatus: SUBMISSION_STATUS.READY_TO_REJECT,
              action: Action.REJECT_DECLARATION
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

    const err = new Error('boom')
    subCon.client = createMockClient()
    const mutationHandler = jest.fn().mockResolvedValue(() => err)
    subCon.client.setRequestHandler(REJECT_BIRTH_DECLARATION, mutationHandler)

    await subCon.sync()

    expect(mutationHandler).toHaveBeenCalledTimes(1)
    expect(store.dispatch).toHaveBeenCalledTimes(4)
    expect(
      store.dispatch.mock.calls[0][0].payload.declaration.submissionStatus
    ).toBe(SUBMISSION_STATUS.FAILED)
  })
})
