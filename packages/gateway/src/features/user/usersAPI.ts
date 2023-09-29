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

import { USER_MANAGEMENT_URL } from '@gateway/constants'
import { RESTDataSource, RequestOptions } from 'apollo-datasource-rest'

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

  async getUserByEmail(email: string) {
    const cacheKey = `${this.baseURL}/getUser:mobile:${email}`

    const cachedResponse = this.memoizedResults.get(cacheKey)

    if (cachedResponse) {
      return cachedResponse
    }

    const response = this.post('getUser', { email })

    this.memoizedResults.set(cacheKey, response)

    return response
  }

  async getUserByMobile(mobile: string) {
    const cacheKey = `${this.baseURL}/getUser:mobile:${mobile}`

    const cachedResponse = this.memoizedResults.get(cacheKey)

    if (cachedResponse) {
      return cachedResponse
    }

    const response = this.post('getUser', { mobile })

    this.memoizedResults.set(cacheKey, response)

    return response
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
