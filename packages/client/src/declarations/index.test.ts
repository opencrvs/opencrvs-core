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
import {
  createDeclaration,
  archiveDeclaration,
  storeDeclaration,
  IUserData,
  mergeDeclaredDeclarations,
  filterProcessingDeclarations,
  filterProcessingDeclarationsFromQuery
} from '.'
import { EventType, Status } from '@client/utils/gateway'
import { AppStore, createStore } from '@client/store'
import { mockDeclarationData, flushPromises } from '@client/tests/util'
import { storage } from '@client/storage'
import { vi } from 'vitest'
import { UserDetails } from '@client/utils/userUtils'

describe('query result filtering tests', () => {
  describe('.filterProcessingDeclarations()', () => {
    it(`return data if results isn't defined`, () => {
      const data = {}
      const returnVal = filterProcessingDeclarations(data, [''])
      expect(returnVal).toBe(data)
    })

    it(`removes null values from results`, () => {
      const data = { results: [{}, null, {}], totalItems: 3 }
      // @ts-ignore
      const returnVal = filterProcessingDeclarations(data, [''])
      expect(returnVal).toEqual({ results: [{}, {}], totalItems: 2 })
    })

    it(`filters out declarations with ids in the supplied array`, () => {
      const data = {
        results: [{ id: '111' }, { id: '222' }, { id: '333' }],
        totalItems: 3
      }
      const returnVal = filterProcessingDeclarations(data, ['222'])
      expect(returnVal).toEqual({
        results: [{ id: '111' }, { id: '333' }],
        totalItems: 2
      })
    })
  })

  describe('.filterProcessingDeclarationsFromQuery()', () => {
    it('filters out declarations in processing state from declaration query results', () => {
      const queryData = {
        inProgressTab: {
          results: [
            { id: 'DRAFT' },
            { id: 'READY_TO_SUBMIT' },
            { id: 'SUBMITTING' },
            { id: 'SUBMITTED' },
            { id: 'DRAFT' }
          ],
          totalItems: 5
        },
        notificationTab: {
          results: [
            { id: 'DRAFT' },
            { id: 'READY_TO_SUBMIT' },
            { id: 'SUBMITTING' },
            { id: 'SUBMITTED' },
            { id: 'DRAFT' }
          ],
          totalItems: 5
        },
        reviewTab: {
          results: [
            { id: 'READY_TO_REGISTER' },
            { id: 'REGISTERING' },
            { id: 'REGISTERED' },
            { id: 'FAILED_NETWORK' },
            { id: 'REGISTERING' }
          ],
          totalItems: 5
        },
        rejectTab: {
          results: [
            { id: 'READY_TO_REJECT' },
            { id: 'REJECTING' },
            { id: 'REJECTED' },
            { id: 'REJECTING' },
            { id: 'READY_TO_REJECT' }
          ],
          totalItems: 5
        },
        approvalTab: {
          results: [
            { id: 'READY_TO_APPROVE' },
            { id: 'APPROVING' },
            { id: 'APPROVED' },
            { id: 'READY_TO_APPROVE' },
            { id: 'APPROVING' }
          ],
          totalItems: 5
        },
        printTab: {
          results: [
            { id: 'READY_TO_CERTIFY' },
            { id: 'CERTIFYING' },
            { id: 'CERTIFIED' },
            { id: 'FAILED' },
            { id: 'CERTIFYING' }
          ],
          totalItems: 5
        },
        sentForReviewTab: {
          results: [
            { id: 'READY_TO_SUBMIT' },
            { id: 'SUBMITTING' },
            { id: 'SUBMITTED' },
            { id: 'FAILED' },
            { id: 'SUBMITTING' }
          ],
          totalItems: 5
        },
        externalValidationTab: {
          results: [{ id: 'WAITING_FOR_VALIDATION' }],
          totalItems: 1
        },
        issueTab: {
          results: [
            { id: 'READY_TO_ISSUE' },
            { id: 'ISSUING' },
            { id: 'ISSUED' },
            { id: 'FAILED' },
            { id: 'ISSUING' }
          ],
          totalItems: 5
        }
      }

      const storedDeclarations = [
        {
          id: 'DRAFT',
          submissionStatus: 'DRAFT'
        },
        {
          id: 'READY_TO_SUBMIT',
          submissionStatus: 'READY_TO_SUBMIT'
        },
        {
          id: 'SUBMITTING',
          submissionStatus: 'SUBMITTING'
        },
        {
          id: 'SUBMITTED',
          submissionStatus: 'SUBMITTED'
        },
        {
          id: 'READY_TO_APPROVE',
          submissionStatus: 'READY_TO_APPROVE'
        },
        {
          id: 'APPROVING',
          submissionStatus: 'APPROVING'
        },
        {
          id: 'APPROVED',
          submissionStatus: 'APPROVED'
        },
        {
          id: 'READY_TO_REGISTER',
          submissionStatus: 'READY_TO_REGISTER'
        },
        {
          id: 'REGISTERING',
          submissionStatus: 'REGISTERING'
        },
        {
          id: 'REGISTERED',
          submissionStatus: 'REGISTERED'
        },
        {
          id: 'READY_TO_REJECT',
          submissionStatus: 'READY_TO_REJECT'
        },
        {
          id: 'REJECTING',
          submissionStatus: 'REJECTING'
        },
        {
          id: 'REJECTED',
          submissionStatus: 'REJECTED'
        },
        {
          id: 'READY_TO_CERTIFY',
          submissionStatus: 'READY_TO_CERTIFY'
        },
        {
          id: 'CERTIFYING',
          submissionStatus: 'CERTIFYING'
        },
        {
          id: 'CERTIFIED',
          submissionStatus: 'CERTIFIED'
        },
        {
          id: 'FAILED',
          submissionStatus: 'FAILED'
        },
        {
          id: 'FAILED_NETWORK',
          submissionStatus: 'FAILED_NETWORK'
        },
        {
          id: 'READY_TO_ISSUE',
          submissionStatus: 'READY_TO_ISSUE'
        },
        {
          id: 'ISSUING',
          submissionStatus: 'ISSUING'
        },
        {
          id: 'ISSUED',
          submissionStatus: 'ISSUED'
        },
        {
          id: 'FAILED',
          submissionStatus: 'FAILED'
        },
        {
          id: 'FAILED_NETWORK',
          submissionStatus: 'FAILED_NETWORK'
        }
      ]

      const filteredResult = filterProcessingDeclarationsFromQuery(
        queryData,
        // @ts-ignore
        storedDeclarations
      )

      expect(filteredResult).toEqual({
        inProgressTab: {
          results: [{ id: 'DRAFT' }, { id: 'SUBMITTED' }, { id: 'DRAFT' }],
          totalItems: 3
        },
        notificationTab: {
          results: [{ id: 'DRAFT' }, { id: 'SUBMITTED' }, { id: 'DRAFT' }],
          totalItems: 3
        },
        reviewTab: {
          results: [{ id: 'REGISTERED' }, { id: 'FAILED_NETWORK' }],
          totalItems: 2
        },
        rejectTab: {
          results: [{ id: 'REJECTED' }],
          totalItems: 1
        },
        approvalTab: {
          results: [{ id: 'APPROVED' }],
          totalItems: 1
        },
        printTab: {
          results: [{ id: 'CERTIFIED' }, { id: 'FAILED' }],
          totalItems: 2
        },
        sentForReviewTab: {
          results: [{ id: 'SUBMITTED' }, { id: 'FAILED' }],
          totalItems: 2
        },
        externalValidationTab: {
          results: [{ id: 'WAITING_FOR_VALIDATION' }],
          totalItems: 1
        },
        issueTab: {
          results: [{ id: 'ISSUED' }, { id: 'FAILED' }],
          totalItems: 2
        }
      })
    })
  })
})

describe('Utilty functions', () => {
  it('fetch declared declarations', () => {})
  it('merges declarations', () => {
    const declarations = [
      {
        id: '1',
        data: {},
        event: EventType.Birth,
        compositionId: '1'
      },
      {
        id: '2',
        data: {},
        event: EventType.Death,
        compositionId: '2'
      }
    ]
    const declaredDeclarations = [
      {
        id: '2'
      },
      {
        id: '3'
      }
    ]

    mergeDeclaredDeclarations(declarations, declaredDeclarations)

    expect(declarations).toHaveLength(3)
  })
})

describe('archiveDeclaration tests', () => {
  let store: AppStore
  const declaration = createDeclaration(EventType.Birth, mockDeclarationData)
  let indexedDB: { USER_DATA: string; USER_DETAILS: string }

  beforeEach(() => {
    store = createStore().store
    store.dispatch(storeDeclaration(declaration))

    const currentUserData: IUserData = {
      userID: '123',
      declarations: [declaration]
    }

    const currentUserDetails: Partial<UserDetails> = {
      userMgntUserID: '123',
      id: '123',
      practitionerId: '123',
      status: 'active' as Status,
      creationDate: '2133213212',
      mobile: '09123433',
      role: {
        label: {
          id: 'userRoles.fieldAgent',
          defaultMessage: 'Field Agent',
          description: 'Field Agent'
        }
      },
      name: [],
      localRegistrar: {
        name: [],
        role: 'FIELD_AGENT'
      }
    }

    indexedDB = {
      USER_DATA: JSON.stringify([currentUserData]),
      USER_DETAILS: JSON.stringify(currentUserDetails)
    }

    // Mocking storage reading
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    storage.getItem = vi.fn<[string], Promise<any | null>>(
      <T = string>(key: string): Promise<T | null> => {
        switch (key) {
          case 'USER_DATA':
          case 'USER_DETAILS':
            return Promise.resolve(indexedDB[key] as T)
          default:
            return Promise.resolve(null)
        }
      }
    )

    // Mocking storage writing
    storage.setItem = vi.fn(<T = string>(key: string, value: T): Promise<T> => {
      switch (key) {
        case 'USER_DATA':
        case 'USER_DETAILS':
          indexedDB[key] = value as string // Cast to string to match the logic
          return Promise.resolve(value)
        default:
          return Promise.resolve(value)
      }
    })
  })

  it('should make an application ready to be archived', async () => {
    store.dispatch(archiveDeclaration(declaration.id))
    await flushPromises()
    const declarations = JSON.parse(indexedDB.USER_DATA)[0].declarations

    expect(declarations[0].submissionStatus).toBe('READY_TO_ARCHIVE')
  })
})
