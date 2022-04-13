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
import { createServer } from '@config/server'
import FormDraft from '@config/models/formDraft'
import Question from '@config/models/question'
import * as fetchMock from 'jest-fetch-mock'
import * as mockingoose from 'mockingoose'
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'

const token = jwt.sign(
  { scope: ['natlsysadmin', 'demo'] },
  readFileSync('../auth/test/cert.key'),
  {
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:config-user'
  }
)

const fetch = fetchMock as fetchMock.FetchMock

const mockFormDraft = [
  {
    status: 'DRAFT',
    _id: '623f30a18aef60124a72df14',
    event: 'death',
    comment: 'Modified previous death question',
    version: 2,
    createdAt: 1648308385612,
    updatedAt: 1648308396432,
    history: [
      {
        status: 'DRAFT',
        _id: '623f30ac8aef60124a72df1c',
        version: 1,
        comment: 'Added new death question',
        lastUpdateAt: 1648308385612
      }
    ],
    __v: 0
  },
  {
    status: 'DRAFT',
    _id: '623f30c18aef60124a72df28',
    event: 'birth',
    comment: 'Added new birth question',
    version: 1,
    createdAt: 1648308417889,
    updatedAt: 1648308457121,
    history: [],
    __v: 0
  }
]

const mockQuestion = [
  {
    _id: '123',
    fieldId: 'birth.myField',
    label: {
      id: '',
      description: '',
      defaultMessage: ''
    },
    placeholder: {
      id: '',
      description: '',
      defaultMessage: ''
    },
    maxLength: 32,
    fieldName: 'myField',
    fieldType: 'TEXT',
    preceedingFieldId: 'myPreviousFieldId',
    required: true,
    enabled: true,
    custom: true,
    initialValue: 'myValue'
  }
]

describe('deleteFormDraftHandler handler', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
    fetch.resetMocks()
    fetch.mockReject(new Error())
  })

  it('should return error if event is not provided', async () => {
    mockingoose(FormDraft).toReturn(null, 'findOne')
    const res = await server.server.inject({
      method: 'DELETE',
      url: '/draftQuestions',
      payload: {},
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(400)
  })

  it('should delete birth event draft history and all questions using mongoose', async () => {
    mockingoose(FormDraft).toReturn(mockFormDraft, 'findOne')
    mockingoose(Question).toReturn(mockQuestion, 'deleteMany')
    mockingoose(FormDraft).toReturn(mockFormDraft, 'updateOne')

    const res = await server.server.inject({
      method: 'DELETE',
      url: '/draftQuestions',
      payload: {
        event: 'birth'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(201)
  })

  it('should delete death event draft history and all questions using mongoose', async () => {
    mockingoose(FormDraft).toReturn(mockFormDraft, 'findOne')
    mockingoose(Question).toReturn(mockQuestion, 'deleteMany')
    mockingoose(FormDraft).toReturn(mockFormDraft, 'updateOne')

    const res = await server.server.inject({
      method: 'DELETE',
      url: '/draftQuestions',
      payload: {
        event: 'death'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(201)
  })

  it('should return error if any error occured on delete questions', async () => {
    mockingoose(FormDraft).toReturn(mockFormDraft, 'findOne')
    mockingoose(Question).toReturn(new Error('boom'), 'deleteMany')
    mockingoose(FormDraft).toReturn(mockFormDraft, 'updateOne')
    const res = await server.server.inject({
      method: 'DELETE',
      url: '/draftQuestions',
      payload: {
        event: 'birth'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(400)
  })

  it('should return error if any error occured on update form draft', async () => {
    mockingoose(FormDraft).toReturn(mockFormDraft, 'findOne')
    mockingoose(FormDraft).toReturn(new Error('boom'), 'updateOne')
    mockingoose(Question).toReturn(mockQuestion, 'deleteMany')

    const res = await server.server.inject({
      method: 'DELETE',
      url: '/draftQuestions',
      payload: {
        event: 'birth'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(400)
  })
})
