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
import * as esClient from '@search/elasticsearch/client'
import { createHandlerSetup, SetupFn } from '@search/test/createHandlerSetup'
import { generateBearerTokenHeader } from '@search/test/utils'
import { ISearchCriteria } from './types'
import { ICountQueryParam } from './handler'
import { SearchDocument } from '@opencrvs/commons'
import * as searchService from './service'
import { OPENCRVS_INDEX_NAME } from '@search/constants'
import { SCOPES } from '@opencrvs/commons/authentication'
import * as fetchAny from 'jest-fetch-mock'
const fetch = fetchAny as fetchAny.FetchMock

jest.setTimeout(100000)

const setupTestCases = async (
  setup: SetupFn,
  apiScope: { scope?: string[] } = {}
) => {
  const { server, elasticClient } = await setup()

  const tokenHeader = generateBearerTokenHeader(apiScope)

  const callAdvancedRecordSearch = (payload: ISearchCriteria) =>
    server.server.inject<{
      body: any
    }>({
      method: 'POST',
      url: '/advancedRecordSearch',
      payload,
      headers: tokenHeader
    })

  const callStatusWiseRegistrationCount = (payload: ICountQueryParam) =>
    server.server.inject<SearchDocument>({
      method: 'POST',
      url: '/statusWiseRegistrationCount',
      payload,
      headers: tokenHeader
    })

  const createTestIndex = () =>
    elasticClient.indices.create({
      index: 'ocrvs-test',
      aliases: {
        [OPENCRVS_INDEX_NAME]: {}
      }
    })

  return {
    callAdvancedRecordSearch,
    callStatusWiseRegistrationCount,
    server,
    elasticClient,
    createTestIndex
  }
}

describe('Verify handlers', () => {
  const { setup, cleanup, shutdown } = createHandlerSetup()

  afterEach(cleanup)
  afterAll(shutdown)

  describe('Advanced search', () => {
    it('should return status code 403 if the token does not hold right scopes', async () => {
      const t = await setupTestCases(setup, {
        scope: [SCOPES.RECORD_DECLARE_BIRTH]
      })

      const res = await t.callAdvancedRecordSearch({
        parameters: {}
      })
      expect(res.statusCode).toBe(403)
    })

    // @todo: fix this to use proper http codes if these are not relie on anywhere
    it('should return status code 400 on error', async () => {
      const t = await setupTestCases(setup, { scope: [SCOPES.SEARCH_BIRTH] })

      jest.spyOn(searchService, 'advancedSearch').mockImplementationOnce(() => {
        throw new Error('error')
      })

      const res = await t.callAdvancedRecordSearch({
        parameters: {}
      })

      expect(res.statusCode).toBe(400)
    })

    it('advanced search should return a valid response as expected', async () => {
      const t = await setupTestCases(setup, { scope: [SCOPES.SEARCH_BIRTH] })

      await t.createTestIndex()
      const res = await t.callAdvancedRecordSearch({ parameters: {} })

      expect(res.statusCode).toBe(200)
      expect(res?.result?.body).toHaveProperty('_shards')
    })

    it('should return status code 200 when the token hold any or some of Register, Validate or Declare', async () => {
      const t = await setupTestCases(setup, {
        scope: [SCOPES.SEARCH_BIRTH]
      })

      const res = await t.callAdvancedRecordSearch({ parameters: {} })

      expect(res.statusCode).toBe(200)
    })
  })

  describe('/statusWiseRegistrationCount', () => {
    it('Should return 200 for valid payload', async () => {
      const t = await setupTestCases(setup, {
        scope: [SCOPES.PERFORMANCE_READ]
      })

      fetch.mockResponses([JSON.stringify([{ id: '123' }]), { status: 200 }])
      const res = await t.callStatusWiseRegistrationCount({
        declarationJurisdictionId: '123',
        status: ['REGISTERED']
      })

      expect(res.statusCode).toBe(200)
    })

    it('Should return 500 for an error', async () => {
      const t = await setupTestCases(setup, {
        scope: [SCOPES.PERFORMANCE_READ]
      })

      jest.spyOn(esClient, 'getOrCreateClient').mockReturnValue({
        search: async () => {
          throw new Error('error')
        }
      } as any)

      const res = await t.callStatusWiseRegistrationCount({
        declarationJurisdictionId: '123',
        status: ['REGISTERED']
      })

      expect(res.statusCode).toBe(500)
    })
  })
})
