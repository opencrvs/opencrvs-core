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
  fieldId: 'birth.myField',
  label: [
    {
      lang: 'en',
      descriptor: {
        id: 'test',
        description: 'test',
        defaultMessage: 'test'
      }
    }
  ],
  placeholder: [
    {
      lang: 'en',
      descriptor: {
        id: 'test',
        description: 'test',
        defaultMessage: 'test'
      }
    }
  ],
  description: [
    {
      lang: 'en',
      descriptor: {
        id: 'test',
        description: 'test',
        defaultMessage: 'test'
      }
    }
  ],
  tooltip: [
    {
      lang: 'en',
      descriptor: {
        id: 'test',
        description: 'test',
        defaultMessage: 'test'
      }
    }
  ],
  errorMessage: [
    {
      lang: 'en',
      descriptor: {
        id: 'test',
        description: 'test',
        defaultMessage: 'test'
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
} as IQuestion

describe('createQuestion handler', () => {
  let server: any

  beforeEach(async () => {
    mockingoose.resetAll()
    server = await createServer()
  })

  it('creates and saves question using mongoose', async () => {
    mockingoose(Question).toReturn(mockQuestion, 'save')

    const res = await server.server.inject({
      method: 'POST',
      url: '/question',
      payload: mockQuestion,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(201)
  })
})
