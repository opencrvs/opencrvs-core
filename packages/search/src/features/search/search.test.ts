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
import { OPENCRVS_INDEX_NAME } from '@search/constants'
import { formatSearchParams } from './service'
import { createHandlerSetup, SetupFn } from '@search/test/createHandlerSetup'
import { EVENT } from '@opencrvs/commons'
import * as elasticsearch from '@elastic/elasticsearch'
import { v4 as uuid } from 'uuid'

jest.setTimeout(10 * 60 * 1000)

const setupTestCases = async (setupFn: SetupFn) => {
  const { elasticClient } = await setupFn()

  return {
    elasticClient
  }
}

describe('search tests', () => {
  const { setup, cleanup, shutdown } = createHandlerSetup()
  afterEach(cleanup)
  afterAll(shutdown)

  describe('standard advanced search', () => {
    it('finds several hits with identical scores when searching with only a first name John', async () => {
      const t = await setupTestCases(setup)

      await addRecords({ client: t.elasticClient })

      const allDocumentsCountCheck = await t.elasticClient.search(
        {
          index: OPENCRVS_INDEX_NAME,
          body: {
            query: { match_all: {} }
          }
        },
        {
          meta: true,
          ignore: [404]
        }
      )

      expect(allDocumentsCountCheck).toHaveProperty('body.hits.total.value', 12)

      const searchParams = await formatSearchParams(
        {
          parameters: {
            name: 'John'
          }
        },
        false
      )

      const searchResult = await t.elasticClient.search(searchParams)

      expect(searchResult).toHaveProperty('hits.total.value', 3)

      const scores = searchResult.hits.hits.map((hit) => hit._score) as number[]

      expect(scores[0]).toEqual(scores[1])
      expect(scores[0]).toEqual(scores[2])
    })
    it('finds several hits when searching with a more specific name John Davis, but the score for John Davis is higher than other hits', async () => {
      const t = await setupTestCases(setup)

      await addRecords({ client: t.elasticClient })

      const allDocumentsCountCheck = await t.elasticClient.search(
        {
          index: OPENCRVS_INDEX_NAME,
          body: {
            query: { match_all: {} }
          }
        },
        {
          meta: true,
          ignore: [404]
        }
      )

      expect(allDocumentsCountCheck).toHaveProperty('body.hits.total.value', 12)

      const searchParams = await formatSearchParams(
        {
          parameters: {
            name: 'John Davis'
          }
        },
        false
      )

      const searchResult = await t.elasticClient.search(searchParams)

      expect(searchResult).toHaveProperty('hits.total.value', 3)

      const scores = searchResult.hits.hits.map((hit) => hit._score) as number[]

      expect(scores[0]).toBeGreaterThan(scores[1])
      expect(scores[0]).toBeGreaterThan(scores[2])
      expect(scores[1]).toEqual(scores[2])
    })
    it('finds a single hit when searching with a bride and groom name', async () => {
      const t = await setupTestCases(setup)

      await addRecords({ client: t.elasticClient })

      const allDocumentsCountCheck = await t.elasticClient.search(
        {
          index: OPENCRVS_INDEX_NAME,
          body: {
            query: { match_all: {} }
          }
        },
        {
          meta: true,
          ignore: [404]
        }
      )

      expect(allDocumentsCountCheck).toHaveProperty('body.hits.total.value', 12)

      const searchParams = await formatSearchParams(
        {
          parameters: {
            name: 'Jane Andrews James Ford'
          }
        },
        false
      )

      const searchResult = await t.elasticClient.search(searchParams)

      expect(searchResult).toHaveProperty('hits.total.value', 1)
    })
    it('finds two hits across Birth and Death events when searching with only a last name Smith', async () => {
      const t = await setupTestCases(setup)

      await addRecords({ client: t.elasticClient })

      const allDocumentsCountCheck = await t.elasticClient.search(
        {
          index: OPENCRVS_INDEX_NAME,
          body: {
            query: { match_all: {} }
          }
        },
        {
          meta: true,
          ignore: [404]
        }
      )

      expect(allDocumentsCountCheck).toHaveProperty('body.hits.total.value', 12)

      const searchParams = await formatSearchParams(
        {
          parameters: {
            name: 'Smith'
          }
        },
        false
      )

      const searchResult = await t.elasticClient.search(searchParams)

      expect(searchResult).toHaveProperty('hits.total.value', 2)
    })
    it('finds a single hit of a Death event when searching with only a spouse name Lily Pope', async () => {
      const t = await setupTestCases(setup)

      await addRecords({ client: t.elasticClient })

      const allDocumentsCountCheck = await t.elasticClient.search(
        {
          index: OPENCRVS_INDEX_NAME,
          body: {
            query: { match_all: {} }
          }
        },
        {
          meta: true,
          ignore: [404]
        }
      )

      expect(allDocumentsCountCheck).toHaveProperty('body.hits.total.value', 12)

      const searchParams = await formatSearchParams(
        {
          parameters: {
            name: 'Lily Pope'
          }
        },
        false
      )

      const searchResult = await t.elasticClient.search(searchParams)

      expect(searchResult).toHaveProperty('hits.total.value', 1)
    })
    it('does not find any hits when searching with a name that does not match any of the name fields', async () => {
      const t = await setupTestCases(setup)

      await addRecords({ client: t.elasticClient })

      const allDocumentsCountCheck = await t.elasticClient.search(
        {
          index: OPENCRVS_INDEX_NAME,
          body: {
            query: { match_all: {} }
          }
        },
        {
          meta: true,
          ignore: [404]
        }
      )

      expect(allDocumentsCountCheck).toHaveProperty('body.hits.total.value', 12)

      const searchParams = await formatSearchParams(
        {
          parameters: {
            name: 'Voldemort'
          }
        },
        false
      )

      const searchResult = await t.elasticClient.search(searchParams)

      expect(searchResult).toHaveProperty('hits.total.value', 0)
    })
  })
})

const childFirstNames = [
  'John',
  'Emma',
  'Noah',
  'Olivia',
  'Aiden',
  'Ava',
  'Caden',
  'John',
  'John',
  'Johnny'
]

const motherFirstNames = [
  'Jessica',
  'Ashley',
  'Sarah',
  'Amanda',
  'Jennifer',
  'Emily',
  'Melissa',
  'Nicole',
  'Stephanie',
  'Elizabeth'
]

const familyNames = [
  'Smith',
  'Johnson',
  'Williams',
  'Brown',
  'Johnson',
  'Garcia',
  'Miller',
  'Davis',
  'Rodriguez',
  'Martinez'
]

const generateBirthRecord = (id: string, i: number) => {
  const familyName = familyNames[i]
  return {
    compositionId: id,
    childFirstNames: childFirstNames[i],
    childFamilyName: familyName,
    name: `${childFirstNames[i]} ${familyName}`,
    motherFirstNames: motherFirstNames[i],
    motherFamilyName: familyName,
    event: EVENT.BIRTH
  }
}

const addRecords = async ({ client }: { client: elasticsearch.Client }) => {
  const bulkOperations: any[] = []

  for (let i = 0; i < 10; i++) {
    const id = uuid()
    const record = generateBirthRecord(id, i)

    bulkOperations.push(
      { index: { _index: OPENCRVS_INDEX_NAME, _id: id } },
      record
    )
  }

  const deathRecordId = uuid()
  const deathRecord = {
    event: EVENT.DEATH,
    compositionId: deathRecordId,
    name: 'Robert Smith',
    deceasedFirstNames: 'Robert',
    deceasedFamilyName: 'Smith',
    informantFirstNames: 'George',
    informantFamilyName: 'Henry',
    spouseFirstNames: 'Lily',
    spouseFamilyName: 'Pope'
  }

  const marriageRecordId = uuid()
  const marriageRecord = {
    event: EVENT.MARRIAGE,
    compositionId: marriageRecordId,
    brideFirstNames: 'Jane',
    brideFamilyName: 'Andrews',
    groomFirstNames: 'James',
    groomFamilyName: 'Ford',
    witnessOneFirstNames: 'Michael',
    witnessOneFamilyName: 'Andrews'
  }

  bulkOperations.push(
    { index: { _index: OPENCRVS_INDEX_NAME, _id: deathRecordId } },
    deathRecord
  )
  bulkOperations.push(
    { index: { _index: OPENCRVS_INDEX_NAME, _id: marriageRecordId } },
    marriageRecord
  )

  try {
    const bulkResponse = await client.bulk({ body: bulkOperations })

    if (bulkResponse.errors) {
      console.error('Some records failed to index:', bulkResponse.items)
    } else {
      await client.indices.refresh({ index: OPENCRVS_INDEX_NAME })
    }
  } catch (error) {
    console.error('Failed to perform bulk insert:', error)
  }
}
