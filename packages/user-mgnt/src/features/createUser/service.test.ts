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
import { generateUsername, sendCredentialsNotification } from './service'
import User from '@user-mgnt/model/user'
import * as mockingoose from 'mockingoose'
import fetchMock from 'jest-fetch-mock'
import jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'
import { logger } from '@opencrvs/commons'

const fetch = fetchMock as fetchMock.FetchMock
const mockUser = {
  username: 'je.doe'
}

const token = jwt.sign({ scope: ['system'] }, readFileSync('./test/cert.key'), {
  algorithm: 'RS256',
  issuer: 'opencrvs:auth-service',
  audience: 'opencrvs:user-mgnt-user'
})

describe('Username generation', () => {
  it('generates valid username with given and family names', async () => {
    mockingoose(User).toReturn(null, 'findOne')
    const names = [{ given: ['John', 'Evan'], family: 'Doe', use: 'en' }]
    const username = await generateUsername(names)
    expect(username).toBe('je.doe')
    mockingoose.resetAll()
  })

  it('generates valid username with given and family names with appended number', async () => {
    const finderMock = (query: { getQuery: () => Record<string, unknown> }) => {
      if (query.getQuery().username === 'je.doe') {
        return mockUser
      }
      return null
    }
    mockingoose(User).toReturn(finderMock, 'findOne')
    const names = [{ given: ['John', 'Evan'], family: 'Doe', use: 'en' }]
    const username = await generateUsername(names)
    expect(username).toBe('je.doe1')
    mockingoose.resetAll()
  })

  it('generates valid username with just family name', async () => {
    mockingoose(User).toReturn(null, 'findOne')
    const names = [{ given: [], family: 'Doe', use: 'en' }]
    const username = await generateUsername(names)
    expect(username).toBe('doe')
  })

  it('generates valid username with no spaces', async () => {
    const names = [
      { given: ['John Mark', 'Evan'], family: 'van der Linde', use: 'en' }
    ]
    const username = await generateUsername(names)
    expect(username).toBe('je.van-der-linde')
  })

  it('append 0s to make the length of username 3, if username has less than 3 characters', async () => {
    const names = [{ given: [], family: 'Wu', use: 'en' }]
    const username = await generateUsername(names)
    expect(username).toBe('wu0')
  })

  it('generates valid username with given and family names with appended number', async () => {
    mockingoose(User).toReturn(new Error(), 'findOne')
    const names = [{ given: ['John', 'Evan'], family: 'Doe', use: 'en' }]
    let error
    try {
      await generateUsername(names)
    } catch (err) {
      error = err
    }
    expect(error).toEqual(new Error('Failed username generation'))
    mockingoose.resetAll()
  })
})

describe('User credentials notification', () => {
  it('returns ok when successfully called', async () => {
    const spy = jest.spyOn(logger, 'error')
    fetch.mockResponse(
      JSON.stringify({
        status: 200
      })
    )

    await sendCredentialsNotification(
      [
        {
          use: 'en',
          family: 'Anik',
          given: ['Sadman']
        }
      ],
      'Name1',
      'Name2',
      {
        Authorization: `Bearer ${token}`
      },
      '01730037449'
    )

    expect(spy).not.toHaveBeenCalled()
  })

  it('thows error when operation is not successful', async () => {
    const spy = jest.spyOn(logger, 'error')
    fetch.mockImplementation(() => {
      throw new Error('error')
    })

    await sendCredentialsNotification(
      [
        {
          use: 'en',
          family: 'Anik',
          given: ['Sadman']
        }
      ],
      'Name1',
      'Name2',
      {
        Authorization: `Bearer ${token}`
      },
      '01730037449'
    )

    expect(spy).toHaveBeenCalled()
  })
})
