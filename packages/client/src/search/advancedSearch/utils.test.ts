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
  IBaseAdvancedSearchState,
  transformAdvancedSearchLocalStateToStoreData,
  transformStoreDataToAdvancedSearchLocalState
} from '@client/search/advancedSearch/utils'
import { mockOfflineData } from '@client/tests/mock-offline-data'
import { IAdvancedSearchParamState } from '@client/search/advancedSearch/reducer'
import { LocationType } from '@client/offline/reducer'
describe('Transforms advancedSearch local state to advancedSearch store state properly', () => {
  const mockLocalState: IBaseAdvancedSearchState = {
    event: 'birth',
    registrationStatuses: 'IN_REVIEW',
    eventCountry: 'FAR',
    eventLocationId:
      mockOfflineData.facilities['627fc0cc-e0e2-4c09-804d-38a9fa1807ee'].id,
    placeOfRegistration:
      mockOfflineData.offices['0d8474da-0361-4d32-979e-af91f012340a'].id,
    eventLocationType: LocationType.HEALTH_FACILITY,
    dateOfRegistration: {
      exact: '1995-09-19',
      isDateRangeActive: false,
      rangeStart: '2021-11-30T07:42:19.092Z',
      rangeEnd: '2022-11-30T17:59:59.999Z'
    },
    childDoB: {
      exact: '1994-08-20',
      isDateRangeActive: true,
      rangeStart: '2021-11-30T07:42:19.092Z',
      rangeEnd: '2022-11-30T17:59:59.999Z'
    }
  }
  const transformedStoreState = transformAdvancedSearchLocalStateToStoreData(
    mockLocalState,
    mockOfflineData
  )
  const transformedStoreStateWithAdminStructionLocations =
    transformAdvancedSearchLocalStateToStoreData(
      {
        ...mockLocalState,
        eventLocationType: LocationType.ADMIN_STRUCTURE,
        placeOfRegistration:
          mockOfflineData.locations['65cf62cb-864c-45e3-9c0d-5c70f0074cb4'].id
      },
      mockOfflineData
    )
  it('Converts registrationStatus to a transformed list of registration statuses ', () => {
    expect(transformedStoreState.registrationStatuses).toStrictEqual([
      'WAITING_VALIDATION',
      'VALIDATED',
      'DECLARED'
    ])
  })

  it('Selects exact date if dateRange is not active', () => {
    expect(transformedStoreState.dateOfRegistration).toBe('1995-09-19')
  })

  it('Selects and converts date ranges if dateRange is active', () => {
    expect(transformedStoreState.childDoBStart).toBe('2021-11-30T07:42:19.092Z')
    expect(transformedStoreState.childDoBEnd).toBe('2022-11-30T17:59:59.999Z')
  })

  it('Chooses placeOfRegistration as declarationLocationId if place of registration is office', () => {
    expect(transformedStoreState.declarationLocationId).toBe(
      mockOfflineData.offices['0d8474da-0361-4d32-979e-af91f012340a'].id
    )
  })

  it('Chooses placeOfRegistration as declarationJurisdictionId if place of registration is an admin structure', () => {
    expect(
      transformedStoreStateWithAdminStructionLocations.declarationJurisdictionId
    ).toBe(mockOfflineData.locations['65cf62cb-864c-45e3-9c0d-5c70f0074cb4'].id)
  })

  it('Inserts eventLocationId if place of event is facility', () => {
    expect(transformedStoreState.eventLocationId).toBe(
      mockOfflineData.facilities['627fc0cc-e0e2-4c09-804d-38a9fa1807ee'].id
    )
  })

  it('Inserts eventCountry and eventLocationLevels if place of event is residential address', () => {
    expect(transformedStoreStateWithAdminStructionLocations.eventCountry).toBe(
      'FAR'
    )
  })
})

describe('Transforms advancedSearch store state to advancedSearch local state  properly', () => {
  const mockStoreState: IAdvancedSearchParamState = {
    event: 'birth',
    registrationStatuses: ['WAITING_VALIDATION', 'VALIDATED', 'DECLARED'],
    declarationLocationId:
      mockOfflineData.offices['0d8474da-0361-4d32-979e-af91f012340a'].id,
    eventLocationId: '627fc0cc-e0e2-4c09-804d-38a9fa1807ee',
    eventLocationLevel1: '',
    eventLocationLevel2: '',
    dateOfRegistration: '1995-09-19',
    childDoBStart: '2021-11-30T07:42:19.092Z',
    childDoBEnd: '2022-11-30T17:59:59.999Z'
  }

  const transformedLocalState = transformStoreDataToAdvancedSearchLocalState(
    mockStoreState,
    mockOfflineData,
    'birth'
  )

  const transformedLocalStateWithFacilityAndOfficeLocations =
    transformStoreDataToAdvancedSearchLocalState(
      {
        ...mockStoreState,
        eventCountry: 'FAR',
        eventLocationId: '',
        declarationJurisdictionId:
          mockOfflineData.locations['65cf62cb-864c-45e3-9c0d-5c70f0074cb4'].id
      },
      mockOfflineData,
      'birth'
    )

  it('Converts registrationStatus list to a transformed registrationstatus value for dropdown options', () => {
    expect(transformedLocalState.registrationStatuses).toStrictEqual(
      'IN_REVIEW'
    )
  })

  it('Converts date with an isActive flag if dateRanges are undefined', () => {
    expect(transformedLocalState.dateOfRegistration?.isDateRangeActive).toBe(
      false
    )
  })

  it('Converts date ranges values and set isActive flag to true if dateRange are defined in store state', () => {
    expect(transformedLocalState.childDoB?.isDateRangeActive).toBe(true)
    expect(transformedLocalState.childDoB?.rangeStart).toBe(
      '2021-11-30T07:42:19.092Z'
    )
    expect(transformedLocalState.childDoB?.rangeEnd).toBe(
      '2022-11-30T17:59:59.999Z'
    )
  })

  it('Chooses declarationLocationId as placeOfRegistration if declarationLocationId is in redux store', () => {
    expect(transformedLocalState.placeOfRegistration).toBe(
      mockOfflineData.offices['0d8474da-0361-4d32-979e-af91f012340a'].id
    )
  })

  it('Chooses declarationJurisdictionId as placeOfRegistration if declarationJurisdictionId is in redux store', () => {
    expect(
      transformedLocalStateWithFacilityAndOfficeLocations.placeOfRegistration
    ).toBe(mockOfflineData.locations['65cf62cb-864c-45e3-9c0d-5c70f0074cb4'].id)
  })

  it('Chooses health institute as placeOfBirth if eventLocationId is in redux store', () => {
    expect(transformedLocalState.eventLocationId).toBe(
      mockOfflineData.facilities['627fc0cc-e0e2-4c09-804d-38a9fa1807ee'].id
    )
  })

  it('Chooses eventCountry and eventLocationLevels as placeOfBirth  if eventLocationId is invalid', () => {
    expect(
      transformedLocalStateWithFacilityAndOfficeLocations.eventCountry
    ).toBe('FAR')
  })
})
