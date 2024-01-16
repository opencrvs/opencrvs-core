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

import { setTrackingId } from '@workflow/features/registration/fhir/fhir-bundle-modifier'
import {
  getSubjectName,
  getCRVSOfficeName,
  getSharedContactMsisdn,
  getTrackingId
} from '@workflow/features/registration/fhir/fhir-utils'
import {
  testFhirBundle,
  testMarriageFhirBundle,
  officeMock,
  testDeathFhirTaskBundle
} from '@workflow/test/utils'
import { cloneDeep } from 'lodash'
import * as fetchAny from 'jest-fetch-mock'
import { Bundle } from '@workflow/../../commons/build/dist/types'

const fetch = fetchAny as any

describe('Verify getSharedContactMsisdn', () => {
  it('Returned shared contact number properly', async () => {
    const phoneNumber = await getSharedContactMsisdn(testFhirBundle)
    expect(phoneNumber).toEqual('+8801622688231')
  })

  it('Returns null when phonenumber is missing for shared contact', async () => {
    const fhirBundle = cloneDeep(testFhirBundle)
    if (
      fhirBundle &&
      fhirBundle.entry &&
      fhirBundle.entry[1] &&
      fhirBundle.entry[1].resource &&
      fhirBundle.entry[1].resource.extension &&
      fhirBundle.entry[1].resource.extension[1] &&
      fhirBundle.entry[1].resource.extension[1].url
    ) {
      fhirBundle.entry[1].resource.extension[1].url = 'INVALID'
      expect(await getSharedContactMsisdn(fhirBundle)).toEqual(null)
    } else {
      throw new Error('Failed')
    }
  })
})

describe('Verify getSubjectName', () => {
  it('Returned informant name properly', async () => {
    const informantName = await getSubjectName(testFhirBundle)
    expect(informantName).toEqual('অনিক অনিক')
  })

  it("Throws error when child's bn name block is missing", async () => {
    const fhirBundle = cloneDeep(testFhirBundle)
    fhirBundle.entry[2].resource.name = []
    await expect(getSubjectName(fhirBundle)).rejects.toThrow(
      "Couldn't find informant's name: bn"
    )
  })
})

describe('Verify getCRVSOfficeName', () => {
  it('Returned informant name properly', async () => {
    fetch.mockResponse(officeMock)
    const officeName = await getCRVSOfficeName(testFhirBundle)
    expect(officeName).toEqual('নকল অফিস')
  })

  it('Throws error when last reg office info is missing', async () => {
    const fhirBundle = cloneDeep(testFhirBundle)
    fhirBundle.entry[1].resource.extension = []
    await expect(getCRVSOfficeName(fhirBundle)).rejects.toThrow(
      'No last registration office found on the bundle'
    )
  })
})

describe('Verify getTrackingId', () => {
  it('Returned tracking id properly for birth', async () => {
    fetch.mockResponseOnce(null, { status: 404 })
    const trackingid = getTrackingId(await setTrackingId(testFhirBundle, '123'))
    if (trackingid) {
      expect(trackingid).toMatch(/^B/)
      expect(trackingid.length).toBe(7)
    } else {
      throw new Error('Failed')
    }
  })

  it('Returned tracking id properly for death', async () => {
    fetch.mockResponseOnce(null, { status: 404 })
    const trackingid = getTrackingId(
      await setTrackingId(testDeathFhirTaskBundle as Bundle, '123')
    )
    if (trackingid) {
      expect(trackingid).toMatch(/^D/)
      expect(trackingid.length).toBe(7)
    } else {
      throw new Error('Failed')
    }
  })

  it('Returned tracking id properly for marriage', async () => {
    fetch.mockResponseOnce(null, { status: 404 })
    const trackingid = getTrackingId(
      await setTrackingId(testMarriageFhirBundle, '123')
    )
    if (trackingid) {
      expect(trackingid).toMatch(/^M/)
      expect(trackingid.length).toBe(7)
    } else {
      throw new Error('Failed')
    }
  })
})
