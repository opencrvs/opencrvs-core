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
  generateTrackingIdForEvents,
  convertStringToASCII,
  getMosipUINToken
} from '@workflow/features/registration/utils'
import {
  mosipDeceasedPatientMock,
  mosipSuccessMock
} from '@workflow/test/utils'
import * as fetchAny from 'jest-fetch-mock'
import { EVENT_TYPE } from '@workflow/features/registration/fhir/constants'
import { Bundle } from '@opencrvs/commons/types'
import { server as mswServer } from '@test/setupServer'
import { rest } from 'msw'
import { MOSIP_TOKEN_SEEDER_URL } from '@workflow/constants'

const fetch = fetchAny as any

describe('Verify utility functions', () => {
  beforeEach(async () => {
    fetch.resetMocks()
  })

  it('Generates proper birth tracking id successfully even if countryconfig returns 404', async () => {
    mswServer.use(
      rest.post('http://localhost:3040/tracking-id', (_, res, ctx) =>
        res(ctx.status(404))
      )
    )
    const trackingId = await generateTrackingIdForEvents(
      EVENT_TYPE.BIRTH,
      {} as Bundle,
      '123'
    )
    expect(trackingId).toBeDefined()
    expect(trackingId.length).toBe(7)
    expect(trackingId).toMatch(/^B/)
  })

  it('Generates proper death tracking id successfully even if countryconfig returns 404', async () => {
    mswServer.use(
      rest.post('http://localhost:3040/tracking-id', (_, res, ctx) =>
        res(ctx.status(404))
      )
    )
    const trackingId = await generateTrackingIdForEvents(
      EVENT_TYPE.DEATH,
      {} as Bundle,
      '123'
    )

    expect(trackingId).toBeDefined()
    expect(trackingId.length).toBe(7)
    expect(trackingId).toMatch(/^D/)
  })

  it('Generates proper marriage tracking id successfully even if countryconfig returns 404', async () => {
    mswServer.use(
      rest.post('http://localhost:3040/tracking-id', (_, res, ctx) =>
        res(ctx.status(404))
      )
    )
    const trackingId = await generateTrackingIdForEvents(
      EVENT_TYPE.MARRIAGE,
      {} as Bundle,
      '123'
    )

    expect(trackingId).toBeDefined()
    expect(trackingId.length).toBe(7)
    expect(trackingId).toMatch(/^M/)
  })

  it('Converts string to corresponding ascii successfully', async () => {
    const ascii = convertStringToASCII('B5WGYJE')

    expect(ascii).toBeDefined()
    expect(ascii).toBe('66538771897469')
  })
})

describe('getMosipUINToken functions', () => {
  beforeAll(() => {
    fetch.mockClear()
  })
  it('Calls mosip token seeder function and returns success', async () => {
    mswServer.use(
      rest.post(`${MOSIP_TOKEN_SEEDER_URL}/authtoken/json`, (_, res, ctx) =>
        res(ctx.json(mosipSuccessMock))
      )
    )
    const mosipResponse = await getMosipUINToken(mosipDeceasedPatientMock)
    expect(mosipResponse).toEqual(mosipSuccessMock)
  })
})
