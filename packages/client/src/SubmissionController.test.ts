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
import { SUBMISSION_STATUS } from '@client/applications'
import { Action } from './forms'
import { createMockClient } from 'mock-apollo-client'
import {
  SUBMIT_BIRTH_APPLICATION,
  APPROVE_BIRTH_APPLICATION,
  REGISTER_BIRTH_APPLICATION,
  REJECT_BIRTH_APPLICATION,
  COLLECT_BIRTH_CERTIFICATE,
  ARCHIVE_BIRTH_DECLARATION,
  REINSTATE_BIRTH_APPLICATION
} from '@client/views/DataProvider/birth/mutations'
import {
  ARCHIVE_DEATH_DECLARATION,
  APPROVE_DEATH_APPLICATION,
  COLLECT_DEATH_CERTIFICATE,
  REGISTER_DEATH_APPLICATION,
  REJECT_DEATH_APPLICATION,
  REINSTATE_DEATH_APPLICATION
} from '@client/views/DataProvider/death/mutations'
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
    // @ts-ignore
    window.setTimeout = (fn: (...args: any[]) => void, duration: number) => {
      return new Promise((resolve) => {
        fn()
        resolve(0)
      })
    }
  })

  it('does nothing if sync is already running', async () => {
    const store = {
      getState: () => ({
        applicationsState: {
          applications: [
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
        applicationsState: {
          applications: [
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
    await subCon.requeueHangingApplications()

    expect(store.dispatch).toHaveBeenCalledTimes(2)
  })

  it('does nothing if offline', () => {
    const store = {
      getState: () => ({
        applicationsState: {
          applications: [
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

  it('syncs all ready to submit and network failed applications but keeps the submitted application when having declare scope', async () => {
    const store = {
      getState: () => ({
        profile: {
          userDetails: {},
          tokenPayload: {
            scope: ['declare']
          }
        },
        applicationsState: {
          applications: [
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
    subCon.client.setRequestHandler(SUBMIT_BIRTH_APPLICATION, mutationHandler)

    await subCon.sync()

    expect(mutationHandler).toHaveBeenCalledTimes(2)
    expect(store.dispatch).toHaveBeenCalledTimes(10)
    expect(
      store.dispatch.mock.calls[0][0].payload.application.submissionStatus
    ).toBe(SUBMISSION_STATUS.SUBMITTED)
    expect(
      store.dispatch.mock.calls[1][0].payload.application.submissionStatus
    ).toBe(SUBMISSION_STATUS.SUBMITTED)
    expect(store.dispatch.mock.calls[9][0].type).toBe('APPLICATION/WRITE_DRAFT')
  })

  it('syncs all ready to approve birth application and deletes approved application', async () => {
    const store = {
      getState: () => ({
        applicationsState: {
          applications: [
            {
              event: 'birth',
              submissionStatus: SUBMISSION_STATUS.READY_TO_APPROVE,
              action: Action.APPROVE_APPLICATION
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
    subCon.client.setRequestHandler(APPROVE_BIRTH_APPLICATION, mutationHandler)

    await subCon.sync()

    expect(mutationHandler).toHaveBeenCalledTimes(1)
    expect(store.dispatch).toHaveBeenCalledTimes(5)
    expect(
      store.dispatch.mock.calls[0][0].payload.application.submissionStatus
    ).toBe(SUBMISSION_STATUS.APPROVED)
    expect(store.dispatch.mock.calls[4][0].type).toBe(
      'APPLICATION/DELETE_DRAFT'
    )
  })

  it('syncs all ready to approve death application and deletes approved application', async () => {
    const store = {
      getState: () => ({
        applicationsState: {
          applications: [
            {
              event: 'death',
              submissionStatus: SUBMISSION_STATUS.READY_TO_APPROVE,
              action: Action.APPROVE_APPLICATION
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
      data: { data: { markDeathAsValidated: {} } }
    })
    subCon.client.setRequestHandler(APPROVE_DEATH_APPLICATION, mutationHandler)

    await subCon.sync()

    expect(mutationHandler).toHaveBeenCalledTimes(1)
    expect(store.dispatch).toHaveBeenCalledTimes(5)
    expect(
      store.dispatch.mock.calls[0][0].payload.application.submissionStatus
    ).toBe(SUBMISSION_STATUS.APPROVED)
    expect(store.dispatch.mock.calls[4][0].type).toBe(
      'APPLICATION/DELETE_DRAFT'
    )
  })

  it('syncs all ready to register birth application and deletes registered application', async () => {
    const store = {
      getState: () => ({
        applicationsState: {
          applications: [
            {
              event: 'birth',
              submissionStatus: SUBMISSION_STATUS.READY_TO_REGISTER,
              action: Action.REGISTER_APPLICATION
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
    subCon.client.setRequestHandler(REGISTER_BIRTH_APPLICATION, mutationHandler)

    await subCon.sync()

    expect(mutationHandler).toHaveBeenCalledTimes(1)
    expect(store.dispatch).toHaveBeenCalledTimes(5)
    expect(
      store.dispatch.mock.calls[0][0].payload.application.submissionStatus
    ).toBe(SUBMISSION_STATUS.REGISTERED)
    expect(store.dispatch.mock.calls[4][0].type).toBe(
      'APPLICATION/DELETE_DRAFT'
    )
  })

  it('syncs all ready to register death application and deletes registered application', async () => {
    const store = {
      getState: () => ({
        applicationsState: {
          applications: [
            {
              event: 'death',
              submissionStatus: SUBMISSION_STATUS.READY_TO_REGISTER,
              action: Action.REGISTER_APPLICATION
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
      data: { data: { markDeathAsValidated: {} } }
    })
    subCon.client.setRequestHandler(REGISTER_DEATH_APPLICATION, mutationHandler)

    await subCon.sync()

    expect(mutationHandler).toHaveBeenCalledTimes(1)
    expect(store.dispatch).toHaveBeenCalledTimes(5)
    expect(
      store.dispatch.mock.calls[0][0].payload.application.submissionStatus
    ).toBe(SUBMISSION_STATUS.REGISTERED)
    expect(store.dispatch.mock.calls[4][0].type).toBe(
      'APPLICATION/DELETE_DRAFT'
    )
  })

  it('syncs all ready to reject birth application and deletes rejected application', async () => {
    const store = {
      getState: () => ({
        applicationsState: {
          applications: [
            {
              event: 'birth',
              submissionStatus: SUBMISSION_STATUS.READY_TO_REJECT,
              action: Action.REJECT_APPLICATION
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
    subCon.client.setRequestHandler(REJECT_BIRTH_APPLICATION, mutationHandler)

    await subCon.sync()

    expect(mutationHandler).toHaveBeenCalledTimes(1)
    expect(store.dispatch).toHaveBeenCalledTimes(5)
    expect(
      store.dispatch.mock.calls[0][0].payload.application.submissionStatus
    ).toBe(SUBMISSION_STATUS.REJECTED)
    expect(store.dispatch.mock.calls[4][0].type).toBe(
      'APPLICATION/DELETE_DRAFT'
    )
  })

  it('syncs all ready to reject death application and deletes rejected application', async () => {
    const store = {
      getState: () => ({
        applicationsState: {
          applications: [
            {
              event: 'death',
              submissionStatus: SUBMISSION_STATUS.READY_TO_REJECT,
              action: Action.REJECT_APPLICATION
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
      data: { data: { markDeathAsValidated: {} } }
    })
    subCon.client.setRequestHandler(REJECT_DEATH_APPLICATION, mutationHandler)

    await subCon.sync()

    expect(mutationHandler).toHaveBeenCalledTimes(1)
    expect(store.dispatch).toHaveBeenCalledTimes(5)
    expect(
      store.dispatch.mock.calls[0][0].payload.application.submissionStatus
    ).toBe(SUBMISSION_STATUS.REJECTED)
    expect(store.dispatch.mock.calls[4][0].type).toBe(
      'APPLICATION/DELETE_DRAFT'
    )
  })

  it('syncs all ready to certify birth application', async () => {
    const store = {
      getState: () => ({
        applicationsState: {
          applications: [
            {
              event: 'birth',
              submissionStatus: SUBMISSION_STATUS.READY_TO_CERTIFY,
              action: Action.COLLECT_CERTIFICATE
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
      data: { data: { markBirthAsCertified: {} } }
    })
    subCon.client.setRequestHandler(COLLECT_BIRTH_CERTIFICATE, mutationHandler)

    await subCon.sync()

    expect(mutationHandler).toHaveBeenCalledTimes(1)
    expect(store.dispatch).toHaveBeenCalledTimes(5)
    expect(
      store.dispatch.mock.calls[0][0].payload.application.submissionStatus
    ).toBe(SUBMISSION_STATUS.CERTIFIED)
  })

  it('syncs all ready to certify death application', async () => {
    const store = {
      getState: () => ({
        applicationsState: {
          applications: [
            {
              event: 'death',
              submissionStatus: SUBMISSION_STATUS.READY_TO_CERTIFY,
              action: Action.COLLECT_CERTIFICATE
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
      data: { data: { markBirthAsCertified: {} } }
    })
    subCon.client.setRequestHandler(COLLECT_DEATH_CERTIFICATE, mutationHandler)

    await subCon.sync()

    expect(mutationHandler).toHaveBeenCalledTimes(1)
    expect(store.dispatch).toHaveBeenCalledTimes(5)
    expect(
      store.dispatch.mock.calls[0][0].payload.application.submissionStatus
    ).toBe(SUBMISSION_STATUS.CERTIFIED)
  })

  it('syncs all ready to archive birth applications', async () => {
    const store = {
      getState: () => ({
        applicationsState: {
          applications: [
            {
              event: 'birth',
              submissionStatus: SUBMISSION_STATUS.READY_TO_ARCHIVE,
              action: Action.ARCHIVE_DECLARATION
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
      data: { data: { markEventAsArchived: {} } }
    })
    subCon.client.setRequestHandler(ARCHIVE_BIRTH_DECLARATION, mutationHandler)

    await subCon.sync()
    await new Promise((resolve) => {
      setTimeout(resolve, 500)
    })
    expect(mutationHandler).toHaveBeenCalledTimes(1)
    expect(store.dispatch).toHaveBeenCalledTimes(5)
    expect(
      store.dispatch.mock.calls[0][0].payload.application.submissionStatus
    ).toBe(SUBMISSION_STATUS.ARCHIVED)
  })

  it('syncs all ready to reinstate birth applications', async () => {
    const store = {
      getState: () => ({
        applicationsState: {
          applications: [
            {
              event: 'birth',
              submissionStatus: SUBMISSION_STATUS.READY_TO_REINSTATE,
              action: Action.REINSTATE_APPLICATION
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
      data: {
        data: {
          markEventAsReinstated: {
            taskEntryResourceID: '12321fsfasf',
            registrationStatus: 'DECLARED'
          }
        }
      }
    })
    subCon.client.setRequestHandler(
      REINSTATE_BIRTH_APPLICATION,
      mutationHandler
    )

    await subCon.sync()

    expect(mutationHandler).toHaveBeenCalledTimes(1)
    expect(store.dispatch).toHaveBeenCalledTimes(4)
  })

  it('syncs all ready to reinstate death applications', async () => {
    const store = {
      getState: () => ({
        applicationsState: {
          applications: [
            {
              event: 'death',
              submissionStatus: SUBMISSION_STATUS.READY_TO_REINSTATE,
              action: Action.REINSTATE_APPLICATION
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
    const id = 'df3fb104-4c2c-486f-97b3-edbeabcd4422'
    subCon.client = createMockClient()
    const mutationHandler = jest.fn().mockResolvedValue({
      data: {
        data: {
          markEventAsReinstated: {
            taskEntryResourceID: id,
            registrationStatus: 'DECLARED'
          }
        }
      }
    })
    subCon.client.setRequestHandler(
      REINSTATE_BIRTH_APPLICATION,
      mutationHandler
    )

    await subCon.sync()

    expect(mutationHandler).toHaveBeenCalledTimes(1)
    expect(store.dispatch).toHaveBeenCalledTimes(4)
  })

  it('syncs all ready to archive death applications', async () => {
    const store = {
      getState: () => ({
        applicationsState: {
          applications: [
            {
              event: 'death',
              submissionStatus: SUBMISSION_STATUS.READY_TO_ARCHIVE,
              action: Action.ARCHIVE_DECLARATION
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
      data: { data: { markEventAsArchived: {} } }
    })
    subCon.client.setRequestHandler(ARCHIVE_DEATH_DECLARATION, mutationHandler)

    await subCon.sync()

    expect(mutationHandler).toHaveBeenCalledTimes(1)
    expect(store.dispatch).toHaveBeenCalledTimes(5)
    expect(
      store.dispatch.mock.calls[0][0].payload.application.submissionStatus
    ).toBe(SUBMISSION_STATUS.ARCHIVED)
  })

  it('fails a application that has a network error', async () => {
    const store = {
      getState: () => ({
        applicationsState: {
          applications: [
            {
              event: 'birth',
              submissionStatus: SUBMISSION_STATUS.READY_TO_REJECT,
              action: Action.REJECT_APPLICATION
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
    subCon.client.setRequestHandler(REJECT_BIRTH_APPLICATION, mutationHandler)

    await subCon.sync()

    expect(mutationHandler).toHaveBeenCalledTimes(1)
    expect(store.dispatch).toHaveBeenCalledTimes(4)
    expect(
      store.dispatch.mock.calls[0][0].payload.application.submissionStatus
    ).toBe(SUBMISSION_STATUS.FAILED_NETWORK)
  })

  it('fails a application that has an ordinary error', async () => {
    const store = {
      getState: () => ({
        applicationsState: {
          applications: [
            {
              event: 'birth',
              submissionStatus: SUBMISSION_STATUS.READY_TO_REJECT,
              action: Action.REJECT_APPLICATION
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
    subCon.client.setRequestHandler(REJECT_BIRTH_APPLICATION, mutationHandler)

    await subCon.sync()

    expect(mutationHandler).toHaveBeenCalledTimes(1)
    expect(store.dispatch).toHaveBeenCalledTimes(4)
    expect(
      store.dispatch.mock.calls[0][0].payload.application.submissionStatus
    ).toBe(SUBMISSION_STATUS.FAILED)
  })
})
