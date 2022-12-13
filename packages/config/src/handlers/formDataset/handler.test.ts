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
import FormDataset, { IDataSetModel } from '@config/models/formDataset'
import { createServer } from '@config/server'
import { readFileSync } from 'fs'
import * as fetchMock from 'jest-fetch-mock'
import * as jwt from 'jsonwebtoken'
import * as mockingoose from 'mockingoose'

const fetch = fetchMock as fetchMock.FetchMock
const token = jwt.sign(
  { scope: ['natlsysadmin'] },
  readFileSync('../auth/test/cert.key'),
  {
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:config-user'
  }
)
const mockFind = [
  {
    _id: '63903bdf6aff61e8652e3bc3',
    resource: 'LOCATION_LEVEL_5',
    fileName: 'Location Level 4',
    options: [],
    createdAt: '2022-12-07T08:19:19.317Z'
  }
] as unknown as IDataSetModel[]
const mockCountryConfig = {
  languages: [
    { lang: 'en', displayName: 'English', messages: {} },
    { lang: 'fr', displayName: 'Français', messages: {} }
  ]
}

describe('FormDatasetHandler ', () => {
  let server: any

  beforeEach(async () => {
    mockingoose.resetAll()
    server = await createServer()
    fetch.resetMocks()
  })

  it('Should return all available formDataset', async () => {
    mockingoose(FormDataset).toReturn(mockFind, 'find')

    const res = await server.server.inject({
      method: 'GET',
      url: '/getFormDataset',
      headers: {
        Authorization: `${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })

  it('Should create new formDataset', async () => {
    fetch.mockResponse(JSON.stringify(mockCountryConfig))
    mockingoose(FormDataset).toReturn(mockFind, 'create')
    const res = await server.server.inject({
      method: 'POST',
      url: '/createFormDataset',
      payload: {
        base64Data:
          'b3B0aW9uLGVuLGZyLHRyYW5zbGF0aW9uX2ZpCmdyZWVuLEdyZWVuLEdyw7ZuLFZpaHJlw6QKcmVkLFJlZCxSw7ZkYSxQdW5haW5lbgpibHVlLEJsdWUsQmzDpSxTaW5pbmVuCg==',
        fileName: 'Options.csv'
      },
      headers: {
        Authorization: `${token}`
      }
    })
    expect(res.result.msg).toBe('SUCCESSFULL')
  })

  it('Should throw NO_DATA_FOUND error while creating', async () => {
    fetch.mockResponse(JSON.stringify(mockCountryConfig))
    mockingoose(FormDataset).toReturn(mockFind, 'create')
    const res = await server.server.inject({
      method: 'POST',
      url: '/createFormDataset',
      payload: {
        base64Data: 'b3B0aW9uLGVuLGZyLHRyYW5zbGF0aW9uX2ZpCg==',
        fileName: 'Options.csv'
      },
      headers: {
        Authorization: `${token}`
      }
    })
    console.log(res.result)
    expect(res.result.msg).toBe('NO_DATA_FOUND')
  })

  it('Should throw TRANSLATION_MISSING error while creating', async () => {
    fetch.mockResponse(JSON.stringify(mockCountryConfig))
    mockingoose(FormDataset).toReturn(mockFind, 'create')
    const res = await server.server.inject({
      method: 'POST',
      url: '/createFormDataset',
      payload: {
        base64Data:
          'b3B0aW9uLGVuLGRlLHRyYW5zbGF0aW9uX2ZpCmdyZWVuLEdyZWVuLEdyw7ZuLFZpaHJlw6QKcmVkLFJlZCxSw7ZkYSxQdW5haW5lbgpibHVlLEJsdWUsQmzDpSxTaW5pbmVuCg==',
        fileName: 'Options.csv'
      },
      headers: {
        Authorization: `${token}`
      }
    })
    expect(res.result.msg).toBe('TRANSLATION_MISSING')
  })
})
