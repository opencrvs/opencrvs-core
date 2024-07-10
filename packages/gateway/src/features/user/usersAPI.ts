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

import { USER_MANAGEMENT_URL } from '@gateway/constants'
import { RESTDataSource, RequestOptions } from 'apollo-datasource-rest'
import { AuthenticationError } from 'apollo-server-errors'
import { IUserModelData } from './type-resolvers'

type IAvatarResponse = {
  userName: string
  avatarURI?: string
}

export class UsersAPI extends RESTDataSource {
  constructor() {
    super()
    this.baseURL = USER_MANAGEMENT_URL
    this.memoizedResults = new Map()
  }

  protected willSendRequest(request: RequestOptions): void | Promise<void> {
    const { headers } = this.context
    const headerKeys = Object.keys(headers)
    for (const each of headerKeys) {
      request.headers.set(each, headers[each])
    }
  }

  async getUserAvatar(id: string): Promise<IAvatarResponse> {
    return this.get(`users/${id}/avatar`)
  }

  async getUserByEmail(email: string): Promise<IUserModelData | null> {
    const cacheKey = `${this.baseURL}/getUser:email:${email}`

    const cachedResponse = this.memoizedResults.get(cacheKey)

    if (cachedResponse) {
      return cachedResponse
    }

    try {
      const response = this.post('getUser', { email })

      this.memoizedResults.set(cacheKey, response)

      return await response
    } catch (e) {
      // Don't need to throw errors if unauthorized error is found for no user with this email
      if (e instanceof AuthenticationError) return null
      else throw e
    }
  }

  async getUserByMobile(mobile: string): Promise<IUserModelData | null> {
    const cacheKey = `${this.baseURL}/getUser:mobile:${mobile}`

    const cachedResponse = this.memoizedResults.get(cacheKey)

    if (cachedResponse) {
      return cachedResponse
    }

    try {
      const response = this.post('getUser', { mobile })

      this.memoizedResults.set(cacheKey, response)

      return await response
    } catch (e) {
      // Don't need to throw errors if unauthorized error is found for no user with this mobile
      if (e instanceof AuthenticationError) return null
      else throw e
    }
  }
  async getUserById(id: string) {
    const cacheKey = `${this.baseURL}/getUser:user:${id}`

    const cachedResponse = this.memoizedResults.get(cacheKey)

    if (cachedResponse) {
      return cachedResponse
    }

    const response = this.post('getUser', { userId: id })

    this.memoizedResults.set(cacheKey, response)

    return response
  }

  async getUserByPractitionerId(id: string) {
    const cacheKey = `${this.baseURL}/getUser:practitioner:${id}`

    const cachedResponse = this.memoizedResults.get(cacheKey)

    if (cachedResponse) {
      return cachedResponse
    }
    const response = this.post('getUser', { practitionerId: id })

    this.memoizedResults.set(cacheKey, response)

    return response
  }
}
