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
// import Question from '@config/models/question'
import * as fetchMock from 'jest-fetch-mock'
import * as mockingoose from 'mockingoose'
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'
import * as mongoose from 'mongoose'
import * as database from '@opencrvs/config/src/config/database'

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

// const mockFormDraft = {
//   status: 'DRAFT',
//   _id: '623f30a18aef60124a72df14',
//   event: 'death',
//   comment: 'Modified previous death question',
//   version: 2,
//   createdAt: 1648308385612,
//   updatedAt: 1648308396432,
//   history: [
//     {
//       status: 'DRAFT',
//       _id: '623f30ac8aef60124a72df1c',
//       version: 1,
//       comment: 'Added new death question',
//       lastUpdateAt: 1648308385612
//     }
//   ],
//   __v: 0
// }

// const mockQuestion = [
//   {
//     _id: '123',
//     fieldId: 'birth.myField',
//     label: {
//       id: '',
//       description: '',
//       defaultMessage: ''
//     },
//     placeholder: {
//       id: '',
//       description: '',
//       defaultMessage: ''
//     },
//     maxLength: 32,
//     fieldName: 'myField',
//     fieldType: 'TEXT',
//     preceedingFieldId: 'myPreviousFieldId',
//     required: true,
//     enabled: true,
//     custom: true,
//     initialValue: 'myValue'
//   }
// ]

describe('deleteFormDraftHandler handler', () => {
  let server: any
  beforeEach(async () => {
    server = await createServer()
    fetch.resetMocks()
    fetch.mockReject(new Error())
    jest
      .spyOn(database, 'getHearthDb')
      .mockResolvedValueOnce(mongoose.connection)
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
})
