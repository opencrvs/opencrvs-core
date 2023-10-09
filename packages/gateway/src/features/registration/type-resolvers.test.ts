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
import { typeResolvers as rootResolvers } from '@gateway/features/registration/type-resolvers'

import {
  mockPatient,
  mockTask,
  mockTaskDownloaded,
  mockTaskForDeath,
  mockTaskForError
} from '@gateway/utils/testUtils'

import LocationsAPI from '@gateway/features/fhir/locationsAPI'
import { GQLRegAction } from '@gateway/graphql/schema'
import * as fetchAny from 'jest-fetch-mock'
const typeResolvers = rootResolvers as any
const fetch = fetchAny as any
const mockGet = jest.fn()
jest.mock('apollo-datasource-rest', () => {
  class MockRESTDataSource {
    get = mockGet
  }
  return {
    RESTDataSource: MockRESTDataSource
  }
})

beforeEach(() => {
  fetch.resetMocks()
})

describe('Registration type resolvers', () => {
  afterEach(() => {
    mockGet.mockReset()
  })

  it('returns id from identifier', () => {
    const id = typeResolvers.IdentityType.id({
      value: '123456789',
      type: 'PASSPORT'
    })
    expect(id).toBe('123456789')
  })

  it('returns type from identifier', () => {
    const type = typeResolvers.IdentityType.type({
      value: '123456789',
      type: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/identifier-type',
            code: 'PASSPORT'
          }
        ]
      }
    })
    expect(type).toBe('PASSPORT')
  })

  it('returns otherType from identifier', () => {
    const type = typeResolvers.IdentityType.otherType({
      value: '123456789',
      type: 'OTHER',
      otherType: 'Office ID'
    })
    expect(type).toBe('Office ID')
  })

  it('returns id from identifier', () => {
    const id = typeResolvers.IdentityType.id({
      value: '123456789',
      type: 'PASSPORT'
    })
    expect(id).toBe('123456789')
  })

  it('returns first names part with one name', () => {
    // @ts-ignore
    const given = typeResolvers.HumanName.firstNames({
      use: 'test',
      given: ['John']
    })
    expect(given).toBe('John')
  })

  it('returns first names part with empty first name', () => {
    // @ts-ignore
    const given = typeResolvers.HumanName.firstNames({
      use: 'test',
      given: undefined
    })
    expect(given).toBe('')
  })

  it('returns first names part with multiple naems', () => {
    // @ts-ignore
    const given = typeResolvers.HumanName.firstNames({
      use: 'test',
      given: ['John', 'Dean']
    })
    expect(given).toBe('John Dean')
  })

  it('returns family part of name', () => {
    // @ts-ignore
    const family = typeResolvers.HumanName.familyName({
      use: 'test',
      family: ['Smith']
    })
    expect(family).toBe('Smith')
  })

  it('returns null if nationality not found', () => {
    // @ts-ignore
    const nationality = typeResolvers.Person.nationality({
      resourceType: 'Patient',
      extension: []
    })
    expect(nationality).toBeNull()
  })

  it('returns educationalAttainment', () => {
    // @ts-ignore
    const educationalAttainment =
      typeResolvers.Person.educationalAttainment(mockPatient)
    expect(educationalAttainment).toBe('SECOND_STAGE_TERTIARY_ISCED_6')
  })

  describe('History type resolver', () => {
    it('Should return action DOWNLOADED', async () => {
      const action = await typeResolvers.History.action(mockTaskDownloaded)
      expect(action).toEqual(GQLRegAction.DOWNLOADED)
    })

    it('Should return reject reason', async () => {
      const statusReason = await typeResolvers.History.statusReason(
        mockTaskDownloaded
      )
      expect(statusReason.text).toEqual('Rejected reason')
    })

    it('Should return date', () => {
      const date = typeResolvers.History.date(mockTaskDownloaded)
      expect(date).toBe('2016-10-31T09:45:05+10:00')
    })

    it('Should return comment', () => {
      const comment = typeResolvers.History.comments(mockTaskDownloaded)
      expect(comment[0].text).toBe('Comment')
    })
  })

  describe('Registration type', () => {
    it('returns birth tracking ID from the task object', async () => {
      const trackingID = await typeResolvers.Registration.trackingId(mockTask)

      expect(trackingID).toBe('123')
    })
    it('returns death tracking ID from the task object', async () => {
      const trackingID = await typeResolvers.Registration.trackingId(
        mockTaskForDeath
      )

      expect(trackingID).toBe('123')
    })
    it('returns birth registration number from the task object', async () => {
      const registrationNumber =
        await typeResolvers.Registration.registrationNumber(mockTask)

      expect(registrationNumber).toBe('123')
    })
    it('returns death registration number from the task object', async () => {
      const registrationNumber =
        await typeResolvers.Registration.registrationNumber(mockTaskForDeath)

      expect(registrationNumber).toBe('123')
    })

    it('returns contact relationship from the task if other contact person', async () => {
      const extensionOtherContactPerson = [
        {
          url: 'http://opencrvs.org/specs/extension/contact-person',
          valueString: 'OTHER'
        },
        {
          url: 'http://opencrvs.org/specs/extension/contact-relationship',
          valueString: 'Friend'
        },
        {
          url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
          valueString: '01733333333'
        }
      ]

      const mockTaskWithOtherContact = {
        ...mockTask,
        extension: extensionOtherContactPerson
      }
      const contact = await typeResolvers.Registration.contact(
        mockTaskWithOtherContact
      )
      const contactRelationship =
        await typeResolvers.Registration.contactRelationship(
          mockTaskWithOtherContact
        )
      expect(contact).toBe('OTHER')
      expect(contactRelationship).toBe('Friend')
    })

    it('returns contact person phone number from the task', async () => {
      // @ts-ignore
      const contactNumber = await typeResolvers.Registration.contactPhoneNumber(
        mockTask
      )

      expect(contactNumber).toEqual('01733333333')
    })

    it('returns business status of the task', async () => {
      // @ts-ignore
      const status = await typeResolvers.RegWorkflow.type(mockTask)

      expect(status).toBe('DECLARED | VERIFIED | REGISTERED | CERTIFIED')
    })

    it('returns null as office of the task', async () => {
      const office = await typeResolvers.RegWorkflow.office(
        mockTaskForError,
        undefined,
        { dataSources: { locationsAPI: new LocationsAPI() } }
      )
      expect(office).toBeNull()
    })

    it('returns timestamp of the task', async () => {
      // @ts-ignore
      const time = await typeResolvers.RegWorkflow.timestamp(mockTask)

      expect(time).toBe('2016-10-31T09:45:05+10:00')
    })

    it('returns null when there is no user extension in task', async () => {
      fetch.mockResponseOnce(JSON.stringify({}))
      // @ts-ignore
      const user = await typeResolvers.RegWorkflow.user(
        {
          resourceType: 'Task',
          extension: []
        },
        undefined,
        { headers: undefined }
      )

      expect(user).toBeNull()
    })

    it('returns null when there is no location ref in task extension', async () => {
      const taskLocation = await typeResolvers.RegWorkflow.location(
        {
          resourceType: 'Task',
          extension: []
        },
        undefined,
        { dataSources: { locationsAPI: new LocationsAPI() } }
      )

      expect(taskLocation).toBeNull()
    })
  })

  describe('Location type', () => {
    const location = {
      status: 'active',
      identifier: [
        {
          system: 'http://opencrvs.org/specs/id/jurisdiction-type',
          value: 'DIVISION'
        }
      ],
      name: 'village',
      position: {
        longitude: 18.4392,
        latitude: -34.08002
      }
    }
    it('returns name', () => {
      // @ts-ignore
      const name = typeResolvers.Location.name(location)
      expect(name).toBe('village')
    })
    it('returns identenfier having length 1', () => {
      const identifier = typeResolvers.Location.identifier(location)
      const identifierSystem = typeResolvers.Identifier.system(identifier[0])
      const identifierValue = typeResolvers.Identifier.value(identifier[0])
      expect(identifier).toHaveLength(1)
      expect(identifierSystem).toBe(
        'http://opencrvs.org/specs/id/jurisdiction-type'
      )
      expect(identifierValue).toBe('DIVISION')
    })
    it('returns status', () => {
      // @ts-ignore
      const status = typeResolvers.Location.status(location)
      expect(status).toBe('active')
    })
    it('returns longitude', () => {
      // @ts-ignore
      const longitude = typeResolvers.Location.longitude(location)
      expect(longitude).toBe(18.4392)
    })
    it('returns name', () => {
      // @ts-ignore
      const latitude = typeResolvers.Location.latitude(location)
      expect(latitude).toBe(-34.08002)
    })
  })
})
