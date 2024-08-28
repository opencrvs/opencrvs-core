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
import {
  indexComposition,
  updateComposition,
  searchByCompositionId
} from '@search/elasticsearch/dbhelper'
import { mockCompositionBody } from '@search/test/utils'
import { logger } from '@opencrvs/commons'
import { BirthDocument } from '@search/elasticsearch/utils'
import { searchForBirthDuplicates } from '@search/features/registration/deduplicate/service'
import { createHandlerSetup, SetupFn } from '@search/test/createHandlerSetup'

jest.setTimeout(100000)

const setupTestCases = async (setup: SetupFn) => {
  const { elasticClient } = await setup()

  return { elasticClient }
}

describe('elasticsearch db helper', () => {
  beforeAll(() => {
    logger.error = jest.fn()
  })

  const { setup, cleanup, shutdown } = createHandlerSetup()

  afterEach(cleanup)
  afterAll(shutdown)

  const identifier = 'testId'

  it('should index a composition with proper configuration', async () => {
    const t = await setupTestCases(setup)
    await indexComposition(identifier, mockCompositionBody, t.elasticClient)

    const result = await searchByCompositionId(identifier, t.elasticClient)
    expect(result?.body.hits?.hits[0]._source).toEqual(mockCompositionBody)
  })

  it('should update a composition with proper configuration', async () => {
    const t = await setupTestCases(setup)

    const updateBody: BirthDocument = {
      compositionId: mockCompositionBody.compositionId,
      childFirstNames: 'testValue'
    }

    await indexComposition(identifier, mockCompositionBody, t.elasticClient)
    await updateComposition(identifier, updateBody, t.elasticClient)
    const result = await searchByCompositionId(identifier, t.elasticClient)

    expect(result?.body.hits?.hits[0]._source).toEqual({
      ...mockCompositionBody,
      childFirstNames: updateBody.childFirstNames
    })
  })

  it('should perform search for composition', async () => {
    const t = await setupTestCases(setup)

    const duplicateIdentifier = 'duplicateId'
    await indexComposition(identifier, mockCompositionBody, t.elasticClient)
    await indexComposition(
      duplicateIdentifier,
      mockCompositionBody,
      t.elasticClient
    )

    const result = await searchForBirthDuplicates(
      mockCompositionBody,
      t.elasticClient
    )

    expect(result).toHaveLength(2)

    expect(result[0]._id).toEqual(identifier)
    expect(result[1]._id).toEqual(duplicateIdentifier)
  })
})
