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
  getRMOCode,
  JURISDICTION_TYPE_DISTRICT,
  JURISDICTION_TYPE_UPAZILA,
  JURISDICTION_TYPE_UNION,
  JURISDICTION_TYPE_MUNICIPALITY,
  JURISDICTION_TYPE_CITY_CORPORATION
} from '@resources/bgd/features/utils'

describe('utils tests', () => {
  it('test setRmo for union', async () => {
    const jurisDictionalLocations = [
      {
        jurisdictionType: JURISDICTION_TYPE_DISTRICT,
        bbsCode: '30'
      },
      {
        jurisdictionType: JURISDICTION_TYPE_UPAZILA,
        bbsCode: '31'
      },
      {
        jurisdictionType: JURISDICTION_TYPE_UNION,
        bbsCode: '32'
      },
      {
        jurisdictionType: JURISDICTION_TYPE_MUNICIPALITY,
        bbsCode: ''
      },
      {
        jurisdictionType: JURISDICTION_TYPE_CITY_CORPORATION,
        bbsCode: ''
      }
    ]

    const rmoCode = getRMOCode(jurisDictionalLocations)

    expect(rmoCode).toEqual(1)
  })

  it('test setRmo for municipality', async () => {
    const jurisDictionalLocations = [
      {
        jurisdictionType: JURISDICTION_TYPE_DISTRICT,
        bbsCode: '30'
      },
      {
        jurisdictionType: JURISDICTION_TYPE_UPAZILA,
        bbsCode: '31'
      },
      {
        jurisdictionType: JURISDICTION_TYPE_UNION,
        bbsCode: ''
      },
      {
        jurisdictionType: JURISDICTION_TYPE_MUNICIPALITY,
        bbsCode: '33'
      },
      {
        jurisdictionType: JURISDICTION_TYPE_CITY_CORPORATION,
        bbsCode: ''
      }
    ]

    const rmoCode = getRMOCode(jurisDictionalLocations)

    expect(rmoCode).toEqual(2)
  })

  it('test setRmo for city corporation', async () => {
    const jurisDictionalLocations = [
      {
        jurisdictionType: JURISDICTION_TYPE_DISTRICT,
        bbsCode: '30'
      },
      {
        jurisdictionType: JURISDICTION_TYPE_UPAZILA,
        bbsCode: '31'
      },
      {
        jurisdictionType: JURISDICTION_TYPE_UNION,
        bbsCode: ''
      },
      {
        jurisdictionType: JURISDICTION_TYPE_MUNICIPALITY,
        bbsCode: ''
      },
      {
        jurisdictionType: JURISDICTION_TYPE_CITY_CORPORATION,
        bbsCode: '35'
      }
    ]

    const rmoCode = getRMOCode(jurisDictionalLocations)

    expect(rmoCode).toEqual(9)
  })
})
