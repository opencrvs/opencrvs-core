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
// @ts-ignore
import {
  indexComposition,
  updateComposition,
  searchForDuplicates,
  searchByCompositionId
} from '@search/elasticsearch/dbhelper'
import { mockCompositionBody } from '@search/test/utils'
import { logger } from '@search/logger'
import { IBirthCompositionBody } from '@search/elasticsearch/utils'
import * as elasticsearch from '@elastic/elasticsearch'
import { StartedElasticsearchContainer } from 'testcontainers'
// @ts-ignore
import {
  startContainer,
  stopContainer
} from '@search/features/registration/deduplicate/elasticSearchTestContainer'

jest.setTimeout(10 * 60 * 1000)

describe('elasticsearch db helper', () => {
  let indexSpy: jest.SpyInstance<any, any[]>
  let updateSpy: jest.SpyInstance<any, any[]>
  let searchSpy: jest.SpyInstance<any, any[]>
  let container: StartedElasticsearchContainer
  let client: elasticsearch.Client

  describe('elasticsearch db helper', () => {
    beforeAll(async () => {
      logger.error = jest.fn()

      container = await startContainer()
      const host = container?.getHost() ?? '0.0.0.0'
      const port = container?.getMappedPort(9200) ?? 9200

      client = new elasticsearch.Client({
        node: `http://${host}:${port}`
      })
    })

    it('should check elasticsearch is up', async () => {
      await client.ping()
    })

    it('should index a composition with proper configuration', async () => {
      indexSpy = jest.spyOn(client, 'index')
      await indexComposition('testId', mockCompositionBody, client)

      expect(indexSpy).toBeCalled()
      expect(indexSpy).toBeCalledWith({
        body: mockCompositionBody,
        id: 'testId',
        index: 'ocrvs',
        type: 'compositions',
        refresh: 'wait_for'
      })
    })

    it('should update a composition with proper configuration', async () => {
      const body: IBirthCompositionBody = {
        childFirstNames: 'testValue'
      }
      updateSpy = jest.spyOn(client, 'update')
      await updateComposition('testId', body, client)
      expect(updateSpy).toBeCalled()
      expect(updateSpy).toBeCalledWith({
        index: 'ocrvs',
        type: 'compositions',
        id: 'testId',
        body: {
          doc: body
        },
        refresh: 'wait_for'
      })
    })

    it('should perform search for composition', async () => {
      searchSpy = jest.spyOn(client, 'search')
      await searchForDuplicates(mockCompositionBody, client)
      if (
        searchSpy.mock &&
        searchSpy.mock.calls[0] &&
        searchSpy.mock.calls[0][0]
      ) {
        expect(searchSpy.mock.calls[0][0].body.query).toBeDefined()
      } else {
        throw new Error('Failed')
      }
      expect(searchSpy).toBeCalled()
    })

    it('should perform search by composition id', async () => {
      await searchByCompositionId('r1324-sd6k2-12121-1212', client)
      expect(searchSpy.mock.calls[0][0].body.query).toBeDefined()
      expect(searchSpy).toBeCalled()
    })

    afterAll(async () => {
      try {
        indexSpy.mockRestore()
        searchSpy.mockRestore()
        await client.close()
      } catch (error) {
      } finally {
        await stopContainer(container)
      }
    })
  })
})
