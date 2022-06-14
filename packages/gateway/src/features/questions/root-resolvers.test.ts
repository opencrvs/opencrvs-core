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
import { resolvers } from '@gateway/features/questions/root-resolvers'
import * as fetchAny from 'jest-fetch-mock'
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'

const fetch = fetchAny as any

beforeEach(() => {
  fetch.resetMocks()
})

describe('getQuestions()', () => {
  let authHeaderSysAdmin: { Authorization: string }
  beforeEach(() => {
    fetch.resetMocks()
    const sysAdminToken = jwt.sign(
      { scope: ['natlsysadmin'] },
      readFileSync('../auth/test/cert.key'),
      {
        subject: 'ba7022f0ff4822',
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:gateway-user'
      }
    )
    authHeaderSysAdmin = {
      Authorization: `Bearer ${sysAdminToken}`
    }
  })
  const dummyQuestionList = [
    {
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
      enabled: 'true',
      custom: true,
      initialValue: 'myValue'
    },
    {
      fieldId: 'birth.myField2',
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
      fieldName: 'myField2',
      fieldType: 'TEXT',
      preceedingFieldId: 'myPreviousFieldId',
      required: true,
      enabled: 'true',
      custom: true,
      initialValue: 'myValue'
    }
  ]
  it('should returns full question list', async () => {
    fetch.mockResponseOnce(
      JSON.stringify({
        totalItems: dummyQuestionList.length,
        results: dummyQuestionList
      })
    )

    const response = await resolvers.Query.getQuestions(
      {},
      {},
      authHeaderSysAdmin
    )

    expect(response.totalItems).toBe(2)
    expect(response.results).toEqual(dummyQuestionList)
  })
})

describe('createOrUpdateQuestion mutation', () => {
  let authHeaderSysAdmin: { Authorization: string }
  let authHeaderRegister: { Authorization: string }
  beforeEach(() => {
    fetch.resetMocks()
    const sysAdminToken = jwt.sign(
      { scope: ['natlsysadmin'] },
      readFileSync('../auth/test/cert.key'),
      {
        subject: 'ba7022f0ff4822',
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:gateway-user'
      }
    )
    authHeaderSysAdmin = {
      Authorization: `Bearer ${sysAdminToken}`
    }
    const regsiterToken = jwt.sign(
      { scope: ['register'] },
      readFileSync('../auth/test/cert.key'),
      {
        subject: 'ba7022f0ff4822',
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:gateway-user'
      }
    )
    authHeaderRegister = {
      Authorization: `Bearer ${regsiterToken}`
    }
  })

  const question = {
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
    enabled: 'true',
    custom: true,
    initialValue: 'myValue'
  }

  it('creates question for sysadmin', async () => {
    fetch.mockResponseOnce(
      JSON.stringify({
        fieldId: 'birth.myField'
      }),
      { status: 201 }
    )

    const response = await resolvers.Mutation.createOrUpdateQuestion(
      {},
      { question },
      authHeaderSysAdmin
    )

    expect(response).toEqual({
      fieldId: 'birth.myField'
    })
  })

  it('updates an user for sysadmin', async () => {
    fetch.mockResponseOnce(
      JSON.stringify({
        fieldId: 'birth.myField'
      }),
      { status: 201 }
    )
    const response = await resolvers.Mutation.createOrUpdateQuestion(
      {},
      { question: { id: '79776844-b606-40e9-8358-7d82147f702a', ...question } },
      authHeaderSysAdmin
    )

    expect(response).toEqual({
      fieldId: 'birth.myField'
    })
  })

  it('should throw error for register', async () => {
    fetch.mockResponseOnce(
      JSON.stringify({
        statusCode: '201'
      }),
      { status: 400 }
    )

    expect(
      resolvers.Mutation.createOrUpdateQuestion(
        {},
        { question },
        authHeaderRegister
      )
    ).rejects.toThrowError(
      'Create or update question is only allowed for natlsysadmin'
    )
  })

  it('should throw error when /createOrUpdateQuestion sends anything but 201', async () => {
    fetch.mockResponseOnce(
      JSON.stringify({
        statusCode: '201'
      }),
      { status: 400 }
    )

    expect(
      resolvers.Mutation.createOrUpdateQuestion(
        {},
        { question },
        authHeaderSysAdmin
      )
    ).rejects.toThrowError(
      "Something went wrong on config service. Couldn't mofify question"
    )
  })
})
