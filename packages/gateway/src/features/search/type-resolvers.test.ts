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
import { searchTypeResolvers } from '@gateway/features/search/type-resolvers'
import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any

beforeEach(() => {
  fetch.resetMocks()
})

describe('Search type resolvers', () => {
  it('return BirthEventSearchSet type', () => {
    const mock = {
      _type: 'compositions',
      _source: {
        event: 'Birth'
      }
    }
    const res = searchTypeResolvers.EventSearchSet.__resolveType(mock)
    expect(res).toEqual('BirthEventSearchSet')
  })
  it('return DeathEventSearchSet type', () => {
    const mock = {
      _type: 'compositions',
      _source: {
        event: 'Death'
      }
    }
    const res = searchTypeResolvers.EventSearchSet.__resolveType(mock)
    expect(res).toEqual('DeathEventSearchSet')
  })
  describe('type resolvers for birth event', () => {
    it('returns id from birth event search set', () => {
      const id = searchTypeResolvers.BirthEventSearchSet.id({
        _type: 'compositions',
        _id: '123'
      })
      expect(id).toBe('123')
    })
    it('returns type from birth event search set', () => {
      const type = searchTypeResolvers.BirthEventSearchSet.type({
        _type: 'compositions',
        _id: '123',
        _source: {
          event: 'Birth'
        }
      })
      expect(type).toBe('Birth')
    })
    it('returns childName from birth event search set', () => {
      const name = searchTypeResolvers.BirthEventSearchSet.childName({
        _type: 'compositions',
        _id: '123',
        _source: {
          event: 'Birth',
          childFirstNames: 'Anik',
          childFamilyName: 'Hoque',
          childFirstNamesLocal: 'অনিক',
          childFamilyNameLocal: 'হক'
        }
      })
      expect(name).toEqual([
        {
          use: 'en',
          given: ['Anik'],
          family: ['Hoque']
        },
        {
          use: 'bn',
          given: ['অনিক'],
          family: ['হক']
        }
      ])
    })
    it('returns null as childName from birth event search set if invalid data found', () => {
      const name = searchTypeResolvers.BirthEventSearchSet.childName({})
      expect(name).toEqual(null)
    })
    it('returns null as given and family name in-case of missing required data', () => {
      const name = searchTypeResolvers.BirthEventSearchSet.childName({
        _type: 'compositions',
        _id: '123',
        _source: {
          event: 'Birth'
        }
      })
      expect(name).toEqual([
        {
          use: 'en',
          given: null,
          family: null
        },
        {
          use: 'bn',
          given: null,
          family: null
        }
      ])
    })
    it('returns date of birth from birth event search set', () => {
      const dob = searchTypeResolvers.BirthEventSearchSet.dateOfBirth({
        _type: 'compositions',
        _id: '123',
        _source: {
          event: 'Birth',
          childFirstNames: 'Anik',
          childFamilyName: 'Hoque',
          childFirstNamesLocal: 'অনিক',
          childFamilyNameLocal: 'হক',
          childDoB: '01-01-2019'
        }
      })
      expect(dob).toBe('01-01-2019')
    })
    it('returns null as date of birth in case of missing required data', () => {
      const dob = searchTypeResolvers.BirthEventSearchSet.dateOfBirth({
        _type: 'compositions',
        _id: '123',
        _source: {
          event: 'Birth',
          childFirstNames: 'Anik',
          childFamilyName: 'Hoque',
          childFirstNamesLocal: 'অনিক',
          childFamilyNameLocal: 'হক'
        }
      })
      expect(dob).toBe(null)
    })
    it('returns _source info as registration from birth event search set', () => {
      const registration = searchTypeResolvers.BirthEventSearchSet.registration(
        {
          _type: 'compositions',
          _id: '123',
          _source: {
            event: 'Birth',
            childFirstNames: 'Anik',
            childFamilyName: 'Hoque',
            childFirstNamesLocal: 'অনিক',
            childFamilyNameLocal: 'হক',
            childDoB: '01-01-2019'
          }
        }
      )
      expect(registration).toEqual({
        event: 'Birth',
        childFirstNames: 'Anik',
        childFamilyName: 'Hoque',
        childFirstNamesLocal: 'অনিক',
        childFamilyNameLocal: 'হক',
        childDoB: '01-01-2019'
      })
    })
    it('returns _source.operationHistories as operationHistories from birth event search set', () => {
      const operationHistories = searchTypeResolvers.BirthEventSearchSet.registration(
        {
          _type: 'compositions',
          _id: '123',
          _source: {
            operationHistories: [
              {
                operatedOn: '2019-12-12T15:21:51.355Z',
                operatorFirstNames: 'Shakib',
                operatorFamilyName: 'Al Hasan',
                operatorOfficeName: 'Alokbali Union Parishad',
                operatorOfficeAlias: ['আলোকবালী  ইউনিয়ন পরিষদ'],
                operationType: 'DECLARED',
                operatorRole: 'FIELD_AGENT'
              },
              {
                operatedOn: '2019-12-12T15:23:21.280Z',
                operatorFirstNames: 'Tamim',
                operatorFamilyName: 'Iqbal',
                operatorOfficeName: 'Alokbali Union Parishad',
                operatorOfficeAlias: ['আলোকবালী  ইউনিয়ন পরিষদ'],
                operationType: 'VALIDATED',
                operatorRole: 'REGISTRATION_AGENT'
              },
              {
                operatedOn: '2019-12-12T15:24:53.586Z',
                operatorFirstNames: 'Mohammad',
                rejectReason: 'missing_supporting_doc',
                operatorFamilyName: 'Ashraful',
                rejectComment: 'No supporting documents provided.',
                operatorOfficeName: 'Alokbali Union Parishad',
                operatorOfficeAlias: ['আলোকবালী  ইউনিয়ন পরিষদ'],
                operationType: 'REJECTED',
                operatorRole: 'LOCAL_REGISTRAR'
              }
            ]
          }
        }
      )
      expect(operationHistories).toEqual({
        operationHistories: [
          {
            operatedOn: '2019-12-12T15:21:51.355Z',
            operatorFirstNames: 'Shakib',
            operatorFamilyName: 'Al Hasan',
            operatorOfficeName: 'Alokbali Union Parishad',
            operatorOfficeAlias: ['আলোকবালী  ইউনিয়ন পরিষদ'],
            operationType: 'DECLARED',
            operatorRole: 'FIELD_AGENT'
          },
          {
            operatedOn: '2019-12-12T15:23:21.280Z',
            operatorFirstNames: 'Tamim',
            operatorFamilyName: 'Iqbal',
            operatorOfficeName: 'Alokbali Union Parishad',
            operatorOfficeAlias: ['আলোকবালী  ইউনিয়ন পরিষদ'],
            operationType: 'VALIDATED',
            operatorRole: 'REGISTRATION_AGENT'
          },
          {
            operatedOn: '2019-12-12T15:24:53.586Z',
            operatorFirstNames: 'Mohammad',
            rejectReason: 'missing_supporting_doc',
            operatorFamilyName: 'Ashraful',
            rejectComment: 'No supporting documents provided.',
            operatorOfficeName: 'Alokbali Union Parishad',
            operatorOfficeAlias: ['আলোকবালী  ইউনিয়ন পরিষদ'],
            operationType: 'REJECTED',
            operatorRole: 'LOCAL_REGISTRAR'
          }
        ]
      })
    })
  })
  describe('type resolvers for death event', () => {
    it('returns id from death event search set', () => {
      const id = searchTypeResolvers.DeathEventSearchSet.id({
        _type: 'compositions',
        _id: '123'
      })
      expect(id).toBe('123')
    })
    it('returns type from death event search set', () => {
      const type = searchTypeResolvers.DeathEventSearchSet.type({
        _type: 'compositions',
        _id: '123',
        _source: {
          event: 'Death'
        }
      })
      expect(type).toBe('Death')
    })
    it('returns deceassedName from Death event search set', () => {
      const name = searchTypeResolvers.DeathEventSearchSet.deceasedName({
        _type: 'compositions',
        _id: '123',
        _source: {
          event: 'Death',
          deceasedFirstNames: 'Anik',
          deceasedFamilyName: 'Hoque',
          deceasedFirstNamesLocal: 'অনিক',
          deceasedFamilyNameLocal: 'হক'
        }
      })
      expect(name).toEqual([
        {
          use: 'en',
          given: ['Anik'],
          family: ['Hoque']
        },
        {
          use: 'bn',
          given: ['অনিক'],
          family: ['হক']
        }
      ])
    })
    it('returns null as deceasedName from Death event search set if invalid data found', () => {
      const name = searchTypeResolvers.DeathEventSearchSet.deceasedName({})
      expect(name).toEqual(null)
    })
    it('returns null as given and family name in-case of missing required data', () => {
      const name = searchTypeResolvers.DeathEventSearchSet.deceasedName({
        _type: 'compositions',
        _id: '123',
        _source: {
          event: 'Death'
        }
      })
      expect(name).toEqual([
        {
          use: 'en',
          given: null,
          family: null
        },
        {
          use: 'bn',
          given: null,
          family: null
        }
      ])
    })
    it('returns date of Death from Death event search set', () => {
      const dod = searchTypeResolvers.DeathEventSearchSet.dateOfDeath({
        _type: 'compositions',
        _id: '123',
        _source: {
          event: 'Death',
          deceasedFirstNames: 'Anik',
          deceasedFamilyName: 'Hoque',
          deceasedFirstNamesLocal: 'অনিক',
          deceasedFamilyNameLocal: 'হক',
          deathDate: '01-01-2019'
        }
      })
      expect(dod).toBe('01-01-2019')
    })
    it('returns null as date of death in case of missing required data', () => {
      const dod = searchTypeResolvers.DeathEventSearchSet.dateOfDeath({
        _type: 'compositions',
        _id: '123',
        _source: {
          event: 'Death',
          deceasedFirstNames: 'Anik',
          deceasedFamilyName: 'Hoque',
          deceasedFirstNamesLocal: 'অনিক',
          deceasedFamilyNameLocal: 'হক'
        }
      })
      expect(dod).toBe(null)
    })
    it('returns _source info as registration from Death event search set', () => {
      const registration = searchTypeResolvers.DeathEventSearchSet.registration(
        {
          _type: 'compositions',
          _id: '123',
          _source: {
            event: 'Death',
            deceasedFirstNames: 'Anik',
            deceasedFamilyName: 'Hoque',
            deceasedFirstNamesLocal: 'অনিক',
            deceasedFamilyNameLocal: 'হক',
            deathDate: '01-01-2019'
          }
        }
      )
      expect(registration).toEqual({
        event: 'Death',
        deceasedFirstNames: 'Anik',
        deceasedFamilyName: 'Hoque',
        deceasedFirstNamesLocal: 'অনিক',
        deceasedFamilyNameLocal: 'হক',
        deathDate: '01-01-2019'
      })
    })
    it('returns _source.operationHistories as operationHistories from death event search set', () => {
      const operationHistories = searchTypeResolvers.DeathEventSearchSet.registration(
        {
          _type: 'compositions',
          _id: '123',
          _source: {
            operationHistories: [
              {
                operatedOn: '2019-12-12T15:21:51.355Z',
                operatorFirstNames: 'Shakib',
                operatorFamilyName: 'Al Hasan',
                operatorOfficeName: 'Alokbali Union Parishad',
                operatorOfficeAlias: ['আলোকবালী  ইউনিয়ন পরিষদ'],
                operationType: 'DECLARED',
                operatorRole: 'FIELD_AGENT'
              },
              {
                operatedOn: '2019-12-12T15:23:21.280Z',
                operatorFirstNames: 'Tamim',
                operatorFamilyName: 'Iqbal',
                operatorOfficeName: 'Alokbali Union Parishad',
                operatorOfficeAlias: ['আলোকবালী  ইউনিয়ন পরিষদ'],
                operationType: 'VALIDATED',
                operatorRole: 'REGISTRATION_AGENT'
              },
              {
                operatedOn: '2019-12-12T15:24:53.586Z',
                operatorFirstNames: 'Mohammad',
                rejectReason: 'missing_supporting_doc',
                operatorFamilyName: 'Ashraful',
                rejectComment: 'No supporting documents provided.',
                operatorOfficeName: 'Alokbali Union Parishad',
                operatorOfficeAlias: ['আলোকবালী  ইউনিয়ন পরিষদ'],
                operationType: 'REJECTED',
                operatorRole: 'LOCAL_REGISTRAR'
              }
            ]
          }
        }
      )
      expect(operationHistories).toEqual({
        operationHistories: [
          {
            operatedOn: '2019-12-12T15:21:51.355Z',
            operatorFirstNames: 'Shakib',
            operatorFamilyName: 'Al Hasan',
            operatorOfficeName: 'Alokbali Union Parishad',
            operatorOfficeAlias: ['আলোকবালী  ইউনিয়ন পরিষদ'],
            operationType: 'DECLARED',
            operatorRole: 'FIELD_AGENT'
          },
          {
            operatedOn: '2019-12-12T15:23:21.280Z',
            operatorFirstNames: 'Tamim',
            operatorFamilyName: 'Iqbal',
            operatorOfficeName: 'Alokbali Union Parishad',
            operatorOfficeAlias: ['আলোকবালী  ইউনিয়ন পরিষদ'],
            operationType: 'VALIDATED',
            operatorRole: 'REGISTRATION_AGENT'
          },
          {
            operatedOn: '2019-12-12T15:24:53.586Z',
            operatorFirstNames: 'Mohammad',
            rejectReason: 'missing_supporting_doc',
            operatorFamilyName: 'Ashraful',
            rejectComment: 'No supporting documents provided.',
            operatorOfficeName: 'Alokbali Union Parishad',
            operatorOfficeAlias: ['আলোকবালী  ইউনিয়ন পরিষদ'],
            operationType: 'REJECTED',
            operatorRole: 'LOCAL_REGISTRAR'
          }
        ]
      })
    })
  })
  describe('type resolvers for event registration', () => {
    it('returns status from search set', () => {
      const status = searchTypeResolvers.RegistrationSearchSet.status({
        event: 'Death',
        type: 'DECLARED',
        deceasedFirstNames: 'Anik',
        deceasedFamilyName: 'Hoque',
        deceasedFirstNamesLocal: 'অনিক',
        deceasedFamilyNameLocal: 'হক',
        deathDate: '01-01-2019'
      })
      expect(status).toEqual('DECLARED')
    })
    it('returns locationid from search set', () => {
      const locationid = searchTypeResolvers.RegistrationSearchSet.registeredLocationId(
        {
          event: 'Death',
          type: 'DECLARED',
          deceasedFirstNames: 'Anik',
          deceasedFamilyName: 'Hoque',
          deceasedFirstNamesLocal: 'অনিক',
          deceasedFamilyNameLocal: 'হক',
          deathDate: '01-01-2019',
          applicationLocationId: '112345'
        }
      )
      expect(locationid).toEqual('112345')
    })
    it('returns eventLocationId from search set', () => {
      const eventLocationId = searchTypeResolvers.RegistrationSearchSet.eventLocationId(
        {
          event: 'Death',
          type: 'DECLARED',
          deceasedFirstNames: 'Anik',
          deceasedFamilyName: 'Hoque',
          deceasedFirstNamesLocal: 'অনিক',
          deceasedFamilyNameLocal: 'হক',
          deathDate: '01-01-2019',
          applicationLocationId: '112345',
          eventLocationId: '12564-54687'
        }
      )
      expect(eventLocationId).toEqual('12564-54687')
    })
    it('returns duplicates from search set', () => {
      const duplicates = searchTypeResolvers.RegistrationSearchSet.duplicates({
        event: 'Death',
        type: 'DECLARED',
        deceasedFirstNames: 'Anik',
        deceasedFamilyName: 'Hoque',
        deceasedFirstNamesLocal: 'অনিক',
        deceasedFamilyNameLocal: 'হক',
        deathDate: '01-01-2019',
        applicationLocationId: '112345',
        relatesTo: ['8a737727-a7db-4e77-865f-310dd7afb836']
      })
      expect(duplicates).toEqual(['8a737727-a7db-4e77-865f-310dd7afb836'])
    })
  })
  describe('type resolvers for event operation history', () => {
    it('returns operationHistories operator name as human name from birth event search set', () => {
      const operatorName = searchTypeResolvers.OperationHistorySearchSet.operatorName(
        {
          operatedOn: '2019-12-12T15:21:51.355Z',
          operatorFirstNames: 'Shakib',
          operatorFamilyName: 'Al Hasan',
          operatorOfficeName: 'Alokbali Union Parishad',
          operatorOfficeAlias: ['আলোকবালী  ইউনিয়ন পরিষদ'],
          operationType: 'DECLARED',
          operatorRole: 'FIELD_AGENT'
        }
      )
      expect(operatorName).toEqual([
        {
          given: ['Shakib'],
          family: ['Al Hasan'],
          use: 'en'
        },
        {
          given: null,
          family: null,
          use: 'bn'
        }
      ])
    })
  })
  describe('type resolvers for EventProgressSet', () => {
    it('returns id', () => {
      const id = searchTypeResolvers.EventProgressSet.id({
        _id: 'dummy_id'
      })

      expect(id).toEqual('dummy_id')
    })
    it('returns event type', () => {
      const type = searchTypeResolvers.EventProgressSet.type({
        _source: {
          event: 'Birth'
        }
      })

      expect(type).toEqual('Birth')
    })
    it('returns child name', () => {
      const childName = searchTypeResolvers.EventProgressSet.name({
        _source: {
          event: 'Birth',
          childFirstNames: 'Jon',
          childFamilyName: 'Doe',
          childFirstNamesLocal: 'জন',
          childFamilyNameLocal: 'ডো'
        }
      })
      expect(childName).toEqual([
        {
          use: 'en',
          given: ['Jon'],
          family: ['Doe']
        },
        {
          use: 'bn',
          given: ['জন'],
          family: ['ডো']
        }
      ])
    })
    it('returns deceased name', () => {
      const deceasedName = searchTypeResolvers.EventProgressSet.name({
        _source: {
          event: 'Death',
          deceasedFirstNames: 'Jon',
          deceasedFamilyName: 'Doe',
          deceasedFirstNamesLocal: 'জন',
          deceasedFamilyNameLocal: 'ডো'
        }
      })
      expect(deceasedName).toEqual([
        {
          use: 'en',
          given: ['Jon'],
          family: ['Doe']
        },
        {
          use: 'bn',
          given: ['জন'],
          family: ['ডো']
        }
      ])
    })
    it('returns date of birth', () => {
      const dateOfBirth = searchTypeResolvers.EventProgressSet.dateOfEvent({
        _source: {
          event: 'Birth',
          childDoB: '01-01-2019'
        }
      })
      expect(dateOfBirth).toEqual('01-01-2019')
    })
    it('returns date of death', () => {
      const dateOfDeath = searchTypeResolvers.EventProgressSet.dateOfEvent({
        _source: {
          event: 'Death',
          deathDate: '01-01-2019'
        }
      })
      expect(dateOfDeath).toEqual('01-01-2019')
    })
    it('return whole _source for registration', () => {
      const registration = searchTypeResolvers.EventProgressSet.registration({
        _id: 'dummy_id',
        _source: {
          event: 'Birth'
        }
      })
      expect(registration).toEqual({
        event: 'Birth'
      })
    })
    it('return the startedAt from operationalHistories', () => {
      const startedAt = searchTypeResolvers.EventProgressSet.startedAt({
        _id: 'dummy_id',
        _source: {
          event: 'Birth',
          operationHistories: [
            {
              operatedOn: '2019-12-12T15:21:51.355Z',
              operatorFirstNames: 'Shakib',
              operatorFamilyName: 'Al Hasan',
              operatorOfficeName: 'Alokbali Union Parishad',
              operatorOfficeAlias: ['আলোকবালী  ইউনিয়ন পরিষদ'],
              operationType: 'DECLARED',
              operatorRole: 'FIELD_AGENT'
            },
            {
              operatedOn: '2019-12-12T15:23:21.280Z',
              operatorFirstNames: 'Tamim',
              operatorFamilyName: 'Iqbal',
              operatorOfficeName: 'Alokbali Union Parishad',
              operatorOfficeAlias: ['আলোকবালী  ইউনিয়ন পরিষদ'],
              operationType: 'VALIDATED',
              operatorRole: 'REGISTRATION_AGENT'
            },
            {
              operatedOn: '2019-12-12T15:24:53.586Z',
              operatorFirstNames: 'Mohammad',
              rejectReason: 'missing_supporting_doc',
              operatorFamilyName: 'Ashraful',
              rejectComment: 'No supporting documents provided.',
              operatorOfficeName: 'Alokbali Union Parishad',
              operatorOfficeAlias: ['আলোকবালী  ইউনিয়ন পরিষদ'],
              operationType: 'REJECTED',
              operatorRole: 'LOCAL_REGISTRAR'
            }
          ]
        }
      })
      expect(startedAt).toBe('2019-12-12T15:21:51.355Z')
    })
    it('return user model data', async () => {
      fetch.resetMocks()
      fetch.mockResponse(
        JSON.stringify({
          id: 'dummy_user_id'
        })
      )
      const userModelData = await searchTypeResolvers.EventProgressSet.startedBy(
        {
          _source: {
            createdBy: 'dummy_practioner_id'
          }
        },
        {},
        {
          Authorization: 'dummy_token'
        }
      )
      expect(userModelData).toEqual({
        id: 'dummy_user_id'
      })
    })
    it('return progress report', async () => {
      fetch.resetMocks()
      fetch.mockResponse(
        JSON.stringify([
          {
            time: '123',
            status: 'dummy_status_1',
            timeSpentEditing: '50'
          },

          {
            time: '456',
            status: 'dummy_status_2',
            timeSpentEditing: '100'
          }
        ])
      )
      const progressReport = await searchTypeResolvers.EventProgressSet.progressReport(
        {
          _id: 'dummy_id'
        },
        {},
        {
          Authorization: 'dummy_token'
        }
      )
      expect(progressReport).toEqual([
        {
          time: '123',
          status: 'dummy_status_1',
          timeSpentEditing: '50'
        },

        {
          time: '456',
          status: 'dummy_status_2',
          timeSpentEditing: '100'
        }
      ])
    })
  })
  describe('type resolvers for EventProgressData', () => {
    const timeLoggedData = [
      {
        time: 1,
        status: 'IN_PROGRESS',
        timeSpentEditing: 50
      },

      {
        time: 2,
        status: 'DECLARED',
        timeSpentEditing: 100
      },
      {
        time: 3,
        status: 'REJECTED',
        timeSpentEditing: 150
      },
      {
        time: 4,
        status: 'VALIDATED',
        timeSpentEditing: 200
      },
      {
        time: 5,
        status: 'WAITING_FOR_VALIDATION',
        timeSpentEditing: 250
      },
      {
        time: 6,
        status: 'REGISTERED',
        timeSpentEditing: 300
      }
    ]
    it('return time in progress', () => {
      const timeInProgress = searchTypeResolvers.EventProgressData.timeInProgress(
        timeLoggedData
      )
      expect(timeInProgress).toEqual(50)
    })
    it('return time in ready for review', () => {
      const timeInReadyForReview = searchTypeResolvers.EventProgressData.timeInReadyForReview(
        timeLoggedData
      )
      expect(timeInReadyForReview).toEqual(100)
    })
    it('return time in requires updates', () => {
      const timeInRequiresUpdates = searchTypeResolvers.EventProgressData.timeInRequiresUpdates(
        timeLoggedData
      )
      expect(timeInRequiresUpdates).toEqual(150)
    })
    it('return time in waiting for approval', () => {
      const timeInWaitingForApproval = searchTypeResolvers.EventProgressData.timeInWaitingForApproval(
        timeLoggedData
      )
      expect(timeInWaitingForApproval).toEqual(200)
    })
    it('return time in waiting for BRIS', () => {
      const timeInWaitingForBRIS = searchTypeResolvers.EventProgressData.timeInWaitingForBRIS(
        timeLoggedData
      )
      expect(timeInWaitingForBRIS).toEqual(250)
    })
    it('return time in ready to print', () => {
      const timeInReadyToPrint = searchTypeResolvers.EventProgressData.timeInReadyToPrint(
        timeLoggedData
      )
      expect(timeInReadyToPrint).toEqual(300)
    })
  })
})
