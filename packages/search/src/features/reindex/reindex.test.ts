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
import { Readable } from 'stream'
import * as recordsService from '@search/features/records/service'
import { IndexingStatus } from '@search/features/reindex/handler'
import { formatIndexName } from '@search/features/reindex/reindex'
import { OPENCRVS_INDEX_NAME } from '@search/constants'
import { createHandlerSetup, SetupFn } from '@search/test/createHandlerSetup'
import { generateBearerTokenHeader, getOrThrow } from '@search/test/utils'
import { BIRTH_BUNDLE } from '@opencrvs/commons/fixtures'

jest.setTimeout(120000)

const setupTestCases = async (setup: SetupFn) => {
  const { server, elasticClient } = await setup()

  jest
    .spyOn(recordsService, 'streamAllRecords')
    .mockReturnValue(Promise.resolve(Readable.from([BIRTH_BUNDLE])))

  const tokenHeader = generateBearerTokenHeader()

  const callRunReindexApi = () =>
    server.server.inject<{
      jobId: string
    }>({
      method: 'POST',
      url: '/reindex',
      headers: tokenHeader
    })

  const createReindexingJob = async () => {
    const reindexResponse = await callRunReindexApi()
    expect(reindexResponse.statusCode).toBe(202)

    return getOrThrow(reindexResponse.result?.jobId, 'Job ID not found')
  }

  const callGetReindexStatusApi = (jobId: string) =>
    server.server.inject<{
      message: string
      status: IndexingStatus
    }>({
      method: 'GET',
      url: `/reindex/status/${jobId}`,
      headers: tokenHeader
    })

  const waitForResponseStatus = async (
    jobId: string,
    status: IndexingStatus
  ) => {
    await new Promise<void>((resolve, reject) => {
      const intervalId = setInterval(async () => {
        try {
          const response = await callGetReindexStatusApi(jobId)

          if (
            response?.result?.status === status ||
            response?.result?.status === IndexingStatus.error
          ) {
            clearInterval(intervalId)
            resolve()
          }
        } catch (error) {
          clearInterval(intervalId)
          reject(error)
        }
      }, 1000)
    })
  }

  /**
   * @param previousIndex index name created before reindexing
   *
   * - Verifies latest index is not the same as the previousIndex
   * - Verifies latest index is bound to @see OPENCRVS_INDEX_NAME alias
   */
  const expectLatestIndexToRemain = async (previousIndex?: string) => {
    const allIndices = await elasticClient.cat.indices({
      format: 'json'
    })

    const indicesWithAlias = await elasticClient.cat.aliases({
      format: 'json',
      name: OPENCRVS_INDEX_NAME
    })

    expect(indicesWithAlias).toHaveLength(1)
    expect(allIndices).toHaveLength(1)

    expect(allIndices[0].index).toBe(indicesWithAlias[0].index)
    expect(indicesWithAlias[0].alias).toBe(OPENCRVS_INDEX_NAME)
    expect(indicesWithAlias[0].index).not.toBe(OPENCRVS_INDEX_NAME)

    if (previousIndex) {
      expect(indicesWithAlias[0].index).not.toBe(previousIndex)
    }
  }

  return {
    server,
    elasticClient,
    callRunReindexApi,
    callGetReindexStatusApi,
    waitForResponseStatus,
    expectLatestIndexToRemain,
    createReindexingJob
  }
}

describe('Search reindex flow', () => {
  const { setup, cleanup, shutdown } = createHandlerSetup()

  afterEach(cleanup)
  afterAll(shutdown)

  it('Reindexes on clear environment', async () => {
    const t = await setupTestCases(setup)

    const jobId = await t.createReindexingJob()
    await t.waitForResponseStatus(jobId, IndexingStatus.completed)

    await t.expectLatestIndexToRemain(OPENCRVS_INDEX_NAME)
  })

  it(`Reindexes when ${OPENCRVS_INDEX_NAME} index is present`, async () => {
    const t = await setupTestCases(setup)

    await t.elasticClient.indices.create(
      {
        index: OPENCRVS_INDEX_NAME,
        body: {
          settings: {
            number_of_shards: 1,
            number_of_replicas: 0
          }
        }
      },
      {
        meta: true
      }
    )

    const jobId = await t.createReindexingJob()
    await t.waitForResponseStatus(jobId, IndexingStatus.completed)

    await t.expectLatestIndexToRemain()

    const indicesWithAlias = await t.elasticClient.cat.aliases({
      format: 'json',
      name: OPENCRVS_INDEX_NAME
    })

    expect(indicesWithAlias[0].index?.includes('legacy-backup')).toBe(false)
  })

  it(`Reindexes when existing alias ${OPENCRVS_INDEX_NAME} with index is present`, async () => {
    const t = await setupTestCases(setup)

    const previousIndex = formatIndexName()
    await t.elasticClient.indices.create({
      index: previousIndex,
      settings: {
        number_of_shards: 1,
        number_of_replicas: 0
      }
    })

    await t.elasticClient.indices.updateAliases({
      actions: [
        {
          add: {
            index: previousIndex,
            alias: OPENCRVS_INDEX_NAME
          }
        }
      ]
    })

    const jobId = await t.createReindexingJob()
    await t.waitForResponseStatus(jobId, IndexingStatus.completed)

    await t.expectLatestIndexToRemain(previousIndex)
  })
})
