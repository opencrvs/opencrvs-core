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
import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import { createServer } from '@resources/index'
import * as locationsService from '@resources/bgd/features/administrative/service/service'

describe('administrative handler receives a request', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
  })

  describe('service returns locations json to client', () => {
    const mockReturn: locationsService.ILocationDataResponse = {
      data: [
        {
          id: 'ba819b89-57ec-4d8b-8b91-e8865579a40f',
          name: 'Barisal',
          alias: 'বরিশাল',
          physicalType: 'Jurisdiction',
          jurisdictionType: 'DIVISION',
          type: 'ADMIN_STRUCTURE',
          partOf: 'Location/0'
        }
      ]
    }
    it('returns a location array', async () => {
      jest
        .spyOn(locationsService, 'getLocations')
        .mockReturnValue(Promise.resolve(mockReturn))

      const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:resources-user'
      })

      const res = await server.server.inject({
        method: 'GET',
        url: '/bgd/locations',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      expect(JSON.parse(res.payload).data[0].id).toBe(
        'ba819b89-57ec-4d8b-8b91-e8865579a40f'
      )
    })
  })
})
