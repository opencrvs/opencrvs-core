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
import Question, { IQuestion } from '@config/models/question'
import * as mockingoose from 'mockingoose'
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'

const token = jwt.sign(
  { scope: ['natlsysadmin'] },
  readFileSync('../auth/test/cert.key'),
  {
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:config-user'
  }
)
const mockQuestion = {
  _id: '123',
  fieldId: 'birth.myField',
  label: [
    {
      lang: 'en',
      descriptor: {
        id: '',
        description: '',
        defaultMessage: ''
      }
    }
  ],
  placeholder: [
    {
      lang: 'en',
      descriptor: {
        id: '',
        description: '',
        defaultMessage: ''
      }
    }
  ],
  description: [
    {
      lang: 'en',
      descriptor: {
        id: '',
        description: '',
        defaultMessage: ''
      }
    }
  ],
  tooltip: [
    {
      lang: 'en',
      descriptor: {
        id: '',
        description: '',
        defaultMessage: ''
      }
    }
  ],
  errorMessage: [
    {
      lang: 'en',
      descriptor: {
        id: '',
        description: '',
        defaultMessage: ''
      }
    }
  ],
  maxLength: 32,
  fieldName: 'myField',
  fieldType: 'TEXT',
  preceedingFieldId: 'myPreviousFieldId',
  required: true,
  custom: true,
  initialValue: 'myValue'
} as unknown as IQuestion & { _id: string }

let mockQuestions = [mockQuestion]

describe('getQuestions', () => {
  let server: any

  beforeEach(async () => {
    mockingoose.resetAll()
    server = await createServer()
  })

  it('get question using mongoose', async () => {
    mockingoose(Question).toReturn(mockQuestions, 'find')

    const res = await server.server.inject({
      method: 'GET',
      url: '/questions',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })
})
