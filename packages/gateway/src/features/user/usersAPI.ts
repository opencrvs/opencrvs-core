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
import { Context } from '@gateway/graphql/context'
import { OpenCRVSRESTDataSource } from '@gateway/graphql/data-source'
import { IUserModelData } from './type-resolvers'
import { GraphQLError } from 'graphql'

export class UsersAPI extends OpenCRVSRESTDataSource {
  override baseURL = USER_MANAGEMENT_URL
  private memoizedResults: Map<string, Promise<IUserModelData>>

  constructor(options: { contextValue: Context }) {
    super(options)
    this.memoizedResults = new Map()
  }

  async getUserByEmail(email: string): Promise<IUserModelData | null> {
    const cacheKey = `${this.baseURL}/getUser:email:${email}`

    const cachedResponse = this.memoizedResults.get(cacheKey)

    if (cachedResponse) {
      return cachedResponse
    }

    try {
      const response = this.post('getUser', { body: { email } })

      this.memoizedResults.set(cacheKey, response)

      return await response
    } catch (e) {
      // Don't need to throw errors if unauthorized error is found for no user with this email
      if (e instanceof GraphQLError && e.extensions.code === 'UNAUTHENTICATED')
        return null
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
      const response = this.post('getUser', { body: { mobile } })

      this.memoizedResults.set(cacheKey, response)

      return await response
    } catch (e) {
      // Don't need to throw errors if unauthorized error is found for no user with this mobile
      if (e instanceof GraphQLError && e.extensions.code === 'UNAUTHENTICATED')
        return null
      else throw e
    }
  }
  async getUserById(id: string): Promise<IUserModelData> {
    const cacheKey = `${this.baseURL}/getUser:user:${id}`

    const cachedResponse = this.memoizedResults.get(cacheKey)

    if (cachedResponse) {
      return cachedResponse
    }

    const response = this.post('getUser', { body: { userId: id } })

    this.memoizedResults.set(cacheKey, response)

    return response
  }

  async getUserByPractitionerId(id: string): Promise<IUserModelData> {
    const cacheKey = `${this.baseURL}/getUser:practitioner:${id}`

    const cachedResponse = this.memoizedResults.get(cacheKey)

    if (cachedResponse) {
      return cachedResponse
    }
    const response = this.post('getUser', {
      body: { practitionerId: id }
    })

    this.memoizedResults.set(cacheKey, response)

    return response
  }
}
