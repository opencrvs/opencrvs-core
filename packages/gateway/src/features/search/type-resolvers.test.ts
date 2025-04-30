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
import { searchTypeResolvers as resolvers } from '@gateway/features/search/type-resolvers'
import { TestResolvers } from '@gateway/utils/testUtils'
import { EVENT } from '@opencrvs/commons'
import * as fetchAny from 'jest-fetch-mock'
const searchTypeResolvers = resolvers as unknown as TestResolvers
const fetch = fetchAny as any

beforeEach(() => {
  fetch.resetMocks()
})

describe('Search type resolvers', () => {
  it('return BirthEventSearchSet type', () => {
    const mock = {
      _source: {
        event: EVENT.BIRTH
      }
    }
    const res = searchTypeResolvers.EventSearchSet!.__resolveType(mock)
    expect(res).toEqual('BirthEventSearchSet')
  })
  it('return DeathEventSearchSet type', () => {
    const mock = {
      _source: {
        event: EVENT.DEATH
      }
    }
    const res = searchTypeResolvers.EventSearchSet!.__resolveType(mock)
    expect(res).toEqual('DeathEventSearchSet')
  })
  describe('type resolvers for birth event', () => {
    it('returns id from birth event search set', () => {
      const id = searchTypeResolvers.BirthEventSearchSet!.id({
        _id: '123'
      })
      expect(id).toBe('123')
    })
    it('returns type from birth event search set', () => {
      const type = searchTypeResolvers.BirthEventSearchSet!.type({
        _id: '123',
        _source: {
          event: EVENT.BIRTH
        }
      })
      expect(type).toBe(EVENT.BIRTH)
    })
    it('returns childName from birth event search set', () => {
      const name = searchTypeResolvers.BirthEventSearchSet!.childName({
        _id: '123',
        _source: {
          event: EVENT.BIRTH,
          childFirstNames: 'Bishal',
          childMiddleName: 'Bashak',
          childFamilyName: 'Papon',
          childFirstNamesLocal: 'বিশাল',
          childMiddleNameLocal: 'বসাক',
          childFamilyNameLocal: 'পাপন'
        }
      })
      expect(name).toEqual([
        {
          use: 'en',
          given: ['Bishal', 'Bashak'],
          family: 'Papon'
        },
        {
          use: 'bn',
          given: ['বিশাল', 'বসাক'],
          family: 'পাপন'
        }
      ])
    })
    it('returns null as childName from birth event search set if invalid data found', () => {
      const name = searchTypeResolvers.BirthEventSearchSet!.childName({})
      expect(name).toEqual(null)
    })
    it('returns null as given and family name in-case of missing required data', () => {
      const name = searchTypeResolvers.BirthEventSearchSet!.childName({
        _id: '123',
        _source: {
          event: EVENT.BIRTH
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
      const dob = searchTypeResolvers.BirthEventSearchSet!.dateOfBirth({
        _id: '123',
        _source: {
          event: EVENT.BIRTH,
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
      const dob = searchTypeResolvers.BirthEventSearchSet!.dateOfBirth({
        _id: '123',
        _source: {
          event: EVENT.BIRTH,
          childFirstNames: 'Anik',
          childFamilyName: 'Hoque',
          childFirstNamesLocal: 'অনিক',
          childFamilyNameLocal: 'হক'
        }
      })
      expect(dob).toBe(null)
    })
    it('returns _source info as registration from birth event search set', () => {
      const registration =
        searchTypeResolvers.BirthEventSearchSet!.registration({
          _id: '123',
          _source: {
            event: EVENT.BIRTH,
            childFirstNames: 'Anik',
            childFamilyName: 'Hoque',
            childFirstNamesLocal: 'অনিক',
            childFamilyNameLocal: 'হক',
            childDoB: '01-01-2019'
          }
        })
      expect(registration).toEqual({
        event: EVENT.BIRTH,
        childFirstNames: 'Anik',
        childFamilyName: 'Hoque',
        childFirstNamesLocal: 'অনিক',
        childFamilyNameLocal: 'হক',
        childDoB: '01-01-2019'
      })
    })
    it('returns _source.operationHistories as operationHistories from birth event search set', () => {
      const operationHistories =
        searchTypeResolvers.BirthEventSearchSet!.registration({
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
        })
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
      const id = searchTypeResolvers.DeathEventSearchSet!.id({
        _id: '123'
      })
      expect(id).toBe('123')
    })
    it('returns type from death event search set', () => {
      const type = searchTypeResolvers.DeathEventSearchSet!.type({
        _id: '123',
        _source: {
          event: EVENT.DEATH
        }
      })
      expect(type).toBe(EVENT.DEATH)
    })
    it('returns deceassedName from Death event search set', () => {
      const name = searchTypeResolvers.DeathEventSearchSet!.deceasedName({
        _id: '123',
        _source: {
          event: EVENT.DEATH,
          deceasedFirstNames: 'Bishal',
          deceasedMiddleName: 'Bashak',
          deceasedFamilyName: 'Papon',
          deceasedFirstNamesLocal: 'বিশাল',
          deceasedMiddleNameLocal: 'বসাক',
          deceasedFamilyNameLocal: 'পাপন'
        }
      })
      expect(name).toEqual([
        {
          use: 'en',
          given: ['Bishal', 'Bashak'],
          family: 'Papon'
        },
        {
          use: 'bn',
          given: ['বিশাল', 'বসাক'],
          family: 'পাপন'
        }
      ])
    })
    it('returns null as deceasedName from Death event search set if invalid data found', () => {
      const name = searchTypeResolvers.DeathEventSearchSet!.deceasedName({})
      expect(name).toEqual(null)
    })
    it('returns null as given and family name in-case of missing required data', () => {
      const name = searchTypeResolvers.DeathEventSearchSet!.deceasedName({
        _id: '123',
        _source: {
          event: EVENT.DEATH
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
      const dod = searchTypeResolvers.DeathEventSearchSet!.dateOfDeath({
        _id: '123',
        _source: {
          event: EVENT.DEATH,
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
      const dod = searchTypeResolvers.DeathEventSearchSet!.dateOfDeath({
        _id: '123',
        _source: {
          event: EVENT.DEATH,
          deceasedFirstNames: 'Anik',
          deceasedFamilyName: 'Hoque',
          deceasedFirstNamesLocal: 'অনিক',
          deceasedFamilyNameLocal: 'হক'
        }
      })
      expect(dod).toBe(null)
    })
    it('returns _source info as registration from Death event search set', () => {
      const registration =
        searchTypeResolvers.DeathEventSearchSet!.registration({
          _id: '123',
          _source: {
            event: EVENT.DEATH,
            deceasedFirstNames: 'Anik',
            deceasedFamilyName: 'Hoque',
            deceasedFirstNamesLocal: 'অনিক',
            deceasedFamilyNameLocal: 'হক',
            deathDate: '01-01-2019'
          }
        })
      expect(registration).toEqual({
        event: EVENT.DEATH,
        deceasedFirstNames: 'Anik',
        deceasedFamilyName: 'Hoque',
        deceasedFirstNamesLocal: 'অনিক',
        deceasedFamilyNameLocal: 'হক',
        deathDate: '01-01-2019'
      })
    })
    it('returns _source.operationHistories as operationHistories from death event search set', () => {
      const operationHistories =
        searchTypeResolvers.DeathEventSearchSet!.registration({
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
        })
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
      const status = searchTypeResolvers.RegistrationSearchSet!.status({
        event: EVENT.DEATH,
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
      const locationid =
        searchTypeResolvers.RegistrationSearchSet!.registeredLocationId({
          event: EVENT.DEATH,
          type: 'DECLARED',
          deceasedFirstNames: 'Anik',
          deceasedFamilyName: 'Hoque',
          deceasedFirstNamesLocal: 'অনিক',
          deceasedFamilyNameLocal: 'হক',
          deathDate: '01-01-2019',
          declarationLocationId: '112345'
        })
      expect(locationid).toEqual('112345')
    })
    it('returns eventLocationId from search set', () => {
      const eventLocationId =
        searchTypeResolvers.RegistrationSearchSet!.eventLocationId({
          event: EVENT.DEATH,
          type: 'DECLARED',
          deceasedFirstNames: 'Anik',
          deceasedFamilyName: 'Hoque',
          deceasedFirstNamesLocal: 'অনিক',
          deceasedFamilyNameLocal: 'হক',
          deathDate: '01-01-2019',
          declarationLocationId: '112345',
          eventLocationId: '12564-54687'
        })
      expect(eventLocationId).toEqual('12564-54687')
    })
    it('returns duplicates from search set', () => {
      const duplicates = searchTypeResolvers.RegistrationSearchSet!.duplicates({
        event: EVENT.DEATH,
        type: 'DECLARED',
        deceasedFirstNames: 'Anik',
        deceasedFamilyName: 'Hoque',
        deceasedFirstNamesLocal: 'অনিক',
        deceasedFamilyNameLocal: 'হক',
        deathDate: '01-01-2019',
        declarationLocationId: '112345',
        relatesTo: ['8a737727-a7db-4e77-865f-310dd7afb836']
      })
      expect(duplicates).toEqual(['8a737727-a7db-4e77-865f-310dd7afb836'])
    })
  })
  describe('type resolvers for EventProgressSet', () => {
    it('returns id', () => {
      const id = searchTypeResolvers.EventProgressSet!.id({
        _id: 'dummy_id'
      })

      expect(id).toEqual('dummy_id')
    })
    it('returns event type', () => {
      const type = searchTypeResolvers.EventProgressSet!.type({
        _source: {
          event: EVENT.BIRTH
        }
      })

      expect(type).toEqual(EVENT.BIRTH)
    })
    it('returns child name', () => {
      const childName = searchTypeResolvers.EventProgressSet!.name({
        _source: {
          event: EVENT.BIRTH,
          childFirstNames: 'Jon',
          childMiddleName: 'C.',
          childFamilyName: 'Doe',
          childFirstNamesLocal: 'জন',
          childMiddleNameLocal: 'সি.',
          childFamilyNameLocal: 'ডো'
        }
      })
      expect(childName).toEqual([
        {
          use: 'en',
          given: ['Jon', 'C.'],
          family: 'Doe'
        },
        {
          use: 'bn',
          given: ['জন', 'সি.'],
          family: 'ডো'
        }
      ])
    })
    it('returns deceased name', () => {
      const deceasedName = searchTypeResolvers.EventProgressSet!.name({
        _source: {
          event: EVENT.DEATH,
          deceasedFirstNames: 'Jon',
          deceasedMiddleName: 'C.',
          deceasedFamilyName: 'Doe',
          deceasedFirstNamesLocal: 'জন',
          deceasedMiddleNameLocal: 'সি.',
          deceasedFamilyNameLocal: 'ডো'
        }
      })
      expect(deceasedName).toEqual([
        {
          use: 'en',
          given: ['Jon', 'C.'],
          family: 'Doe'
        },
        {
          use: 'bn',
          given: ['জন', 'সি.'],
          family: 'ডো'
        }
      ])
    })
    it('returns date of birth', () => {
      const dateOfBirth = searchTypeResolvers.EventProgressSet!.dateOfEvent({
        _source: {
          event: EVENT.BIRTH,
          childDoB: '01-01-2019'
        }
      })
      expect(dateOfBirth).toEqual('01-01-2019')
    })
    it('returns date of death', () => {
      const dateOfDeath = searchTypeResolvers.EventProgressSet!.dateOfEvent({
        _source: {
          event: EVENT.DEATH,
          deathDate: '01-01-2019'
        }
      })
      expect(dateOfDeath).toEqual('01-01-2019')
    })
    it('return whole _source for registration', () => {
      const registration = searchTypeResolvers.EventProgressSet!.registration({
        _id: 'dummy_id',
        _source: {
          event: EVENT.BIRTH
        }
      })
      expect(registration).toEqual({
        event: EVENT.BIRTH
      })
    })
    it('return the startedAt from operationalHistories', () => {
      const startedAt = searchTypeResolvers.EventProgressSet!.startedAt({
        _id: 'dummy_id',
        _source: {
          event: EVENT.BIRTH,
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

    it('return progress report', async () => {
      fetch.resetMocks()
      fetch.mockResponse(
        JSON.stringify([
          {
            time: '123',
            status: 'dummy_status_1',
            durationInSeconds: '50'
          },

          {
            time: '456',
            status: 'dummy_status_2',
            durationInSeconds: '100'
          }
        ])
      )
      const progressReport =
        await searchTypeResolvers.EventProgressSet!.progressReport(
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
          durationInSeconds: '50'
        },

        {
          time: '456',
          status: 'dummy_status_2',
          durationInSeconds: '100'
        }
      ])
    })
  })
  describe('type resolvers for EventProgressData', () => {
    const timeLoggedData = [
      {
        time: 1,
        status: 'IN_PROGRESS',
        durationInSeconds: 50
      },

      {
        time: 2,
        status: 'DECLARED',
        durationInSeconds: 100
      },
      {
        time: 3,
        status: 'REJECTED',
        durationInSeconds: 150
      },
      {
        time: 4,
        status: 'VALIDATED',
        durationInSeconds: 200
      },
      {
        time: 5,
        status: 'WAITING_FOR_VALIDATION',
        durationInSeconds: 250
      },
      {
        time: 6,
        status: 'REGISTERED',
        durationInSeconds: 300
      }
    ]
    it('return time in progress', () => {
      const timeInProgress =
        searchTypeResolvers.EventProgressData!.timeInProgress(timeLoggedData)
      expect(timeInProgress).toEqual(50)
    })
    it('return time in ready for review', () => {
      const timeInReadyForReview =
        searchTypeResolvers.EventProgressData!.timeInReadyForReview(
          timeLoggedData
        )
      expect(timeInReadyForReview).toEqual(100)
    })
    it('return time in requires updates', () => {
      const timeInRequiresUpdates =
        searchTypeResolvers.EventProgressData!.timeInRequiresUpdates(
          timeLoggedData
        )
      expect(timeInRequiresUpdates).toEqual(150)
    })
    it('return time in waiting for approval', () => {
      const timeInWaitingForApproval =
        searchTypeResolvers.EventProgressData!.timeInWaitingForApproval(
          timeLoggedData
        )
      expect(timeInWaitingForApproval).toEqual(200)
    })
    it('return time in waiting for BRIS', () => {
      const timeInWaitingForBRIS =
        searchTypeResolvers.EventProgressData!.timeInWaitingForBRIS(
          timeLoggedData
        )
      expect(timeInWaitingForBRIS).toEqual(250)
    })
    it('return time in ready to print', () => {
      const timeInReadyToPrint =
        searchTypeResolvers.EventProgressData!.timeInReadyToPrint(
          timeLoggedData
        )
      expect(timeInReadyToPrint).toEqual(300)
    })
  })
})
