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
import * as fetchMock from 'jest-fetch-mock'
import {
  fetchLocationByIdentifiers,
  fetchHierarchicalBangladeshLocations,
  fetchAllAddressLocations,
  getLastRegLocationFromFacility,
  postBundle
} from '@bgd-dhis2-mediator/features/fhir/api'
import {
  mockUnion,
  mockMunicipality,
  mockUnionFacility,
  mockMunicipalityFacility,
  mockUnknownUnionFacility
} from '@bgd-dhis2-mediator/test/locations'

let fetch: fetchMock.FetchMock

describe('FHIR API module tests', () => {
  beforeAll(() => {
    fetch = fetchMock as fetchMock.FetchMock
  })

  beforeEach(() => {
    fetch.resetMocks()
  })

  describe('.fetchLocationByIdentifiers()', () => {
    it('Sends correct request and return the first entry in the response', async () => {
      const mock = fetch.mockResponseOnce(
        JSON.stringify({
          resourceType: 'Bundle',
          entry: [{ resource: { id: '111' } }]
        })
      )

      await fetchLocationByIdentifiers(
        [
          { system: 'test1', value: 'test1' },
          { system: 'test2', value: 'test2' }
        ],
        'partof=Location/0',
        'bearer xyz'
      )

      expect(mock).toBeCalledWith(
        `http://localhost:5001/fhir/Location?identifier=test1|test1&identifier=test2|test2&partof=Location/0`,
        {
          method: 'GET',
          headers: {
            Authorization: 'bearer xyz',
            'Content-Type': 'application/fhir+json'
          }
        }
      )
    })

    it('Throws an error when error response code returned', async () => {
      fetch.mockResponseOnce('', { status: 401 })

      await expect(
        fetchLocationByIdentifiers(
          [
            { system: 'test1', value: 'test1' },
            { system: 'test2', value: 'test2' }
          ],
          'partof=Location/0',
          'bearer xyz'
        )
      ).rejects.toThrowError(
        'Error status code received in response, Unauthorized 401'
      )
    })

    it('Throws an error if no Location could be found in the returned bundle', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          resourceType: 'Bundle',
          entry: []
        })
      )

      await expect(
        fetchLocationByIdentifiers(
          [
            { system: 'test1', value: 'test1' },
            { system: 'test2', value: 'test2' }
          ],
          'partof=Location/0',
          'bearer xyz'
        )
      ).rejects.toThrowError(
        'Location not found, identifiers: [{"system":"test1","value":"test1"},{"system":"test2","value":"test2"}], query suffix: partof=Location/0'
      )
    })
  })

  describe('.fetchHierarchicalBangladeshLocations()', () => {
    it('Returns Location object for each code given', async () => {
      const mock = fetch.mockResponse(
        JSON.stringify({
          resourceType: 'Bundle',
          entry: [
            { resource: { id: '111', partOf: { reference: 'Location/xyz' } } }
          ]
        })
      )

      const locations = await fetchHierarchicalBangladeshLocations(
        {
          divisionCode: '00',
          cityCorpCode: '11',
          districtCode: '22',
          municipalityCode: '33',
          unionCode: '44',
          upazilaCode: '55',
          wardCode: '66'
        },
        'bearer xyz'
      )

      expect(locations).toMatchObject({
        division: expect.any(Object),
        district: expect.any(Object),
        upazila: expect.any(Object),
        union: expect.any(Object),
        municipality: expect.any(Object),
        cityCorp: expect.any(Object),
        ward: expect.any(Object)
      })
      expect(mock).toBeCalledTimes(7)
    })
  })

  describe.skip('.fetchAllAddressLocations()', () => {
    it('calls fetchHierarchicalBangladeshLocations with the correct ids from an address', async () => {
      fetch.mockResponse(
        JSON.stringify({
          resourceType: 'Bundle',
          entry: [
            { resource: { id: '111', partOf: { reference: 'Location/xyz' } } }
          ]
        })
      )

      await fetchAllAddressLocations(
        {
          division: { id: '00', name: '' },
          district: { id: '11', name: '' },
          upazila: { id: '22', name: '' },
          city_corporation: { id: '33', name: '' },
          municipality: { id: '44', name: '' },
          union: { id: '55', name: '' },
          ward: { id: '66', name: '' }
        },
        'bearer xyz'
      )
    })
  })

  describe('.postBundle()', () => {
    it('Posts the bundle and return the result', async () => {
      const mock = fetch.mockResponseOnce(JSON.stringify({}))
      const bundle = { resourceType: 'Bundle', entry: [], type: '' }

      const result = await postBundle(bundle, 'bearer xyz')

      expect(mock).toBeCalledWith('http://localhost:5001/fhir', {
        body: JSON.stringify(bundle),
        headers: {
          Authorization: 'bearer xyz',
          'Content-Type': 'application/fhir+json'
        },
        method: 'POST'
      })

      expect(result).toMatchObject({})
    })

    it('Throws an error if invalid response received', async () => {
      fetch.mockResponseOnce(JSON.stringify({}), { status: 401 })
      const bundle = { resourceType: 'Bundle', entry: [], type: '' }

      await expect(postBundle(bundle, 'bearer xyz')).rejects.toThrowError(
        'Error status code received in response, Unauthorized 401'
      )
    })
  })

  describe('.getLastRegLocationFromFacility()', () => {
    it('Retreives a union from a facility with a recognised union', async () => {
      fetch.mockResponses([JSON.stringify(mockUnion), { status: 200 }])

      const unionLocation = await getLastRegLocationFromFacility(
        mockUnionFacility.entry[0].resource,
        '',
        'bearer xyz'
      )
      expect(unionLocation).toEqual(mockUnion.entry[0].resource)
    })
    it('Retreives a municipality from a facility with a recognised municipality', async () => {
      fetch.mockResponses([JSON.stringify(mockMunicipality), { status: 200 }])

      const municipalityLocation = await getLastRegLocationFromFacility(
        mockMunicipalityFacility.entry[0].resource,
        '',
        'bearer xyz'
      )
      expect(municipalityLocation).toEqual(mockMunicipality.entry[0].resource)
    })
    it('Retreives a union from a facility with a hardcoded union', async () => {
      fetch.mockResponses([JSON.stringify(mockUnion), { status: 200 }])

      const unionLocation = await getLastRegLocationFromFacility(
        mockUnknownUnionFacility.entry[0].resource,
        'Mahishasura',
        'bearer xyz'
      )
      expect(unionLocation).toEqual(mockUnion.entry[0].resource)
    })
    it('Returns undefined if union or municipality cannot be found, or hardcoded string is invalid', async () => {
      fetch.mockResponses([JSON.stringify(mockUnion), { status: 200 }])

      const unionLocation = await getLastRegLocationFromFacility(
        mockUnknownUnionFacility.entry[0].resource,
        'sagaerg',
        'bearer xyz'
      )
      expect(unionLocation).toEqual(undefined)
    })
  })
})
