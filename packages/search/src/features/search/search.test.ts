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

  describe('quick name search', () => {
    it('finds several hits with identical scores when searching with only a first name John', async () => {
      const t = await setupTestCases(setup)

      const dataset = [
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'John Smith',
          childFirstNames: 'John',
          childFamilyName: 'Smith'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'John Johnson',
          childFirstNames: 'John',
          childFamilyName: 'Johnson'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'John Williams',
          childFirstNames: 'John',
          childFamilyName: 'Williams'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'Jane Doe',
          childFirstNames: 'Jane',
          childFamilyName: 'Doe'
        }
      ]

      await addRecords({ records: dataset, client: t.elasticClient })

      const searchParams = await formatSearchParams(
        {
          parameters: {
            name: 'John'
          }
        },
        false
      )

      const searchResult = await t.elasticClient.search(searchParams)

      const hits = searchResult.hits.hits.map((hit) => ({
        name: (hit._source as { name: string }).name,
        score: hit._score
      }))

      expect(hits).toEqual([
        { name: 'John Smith', score: 1.0700248 },
        { name: 'John Johnson', score: 1.0700248 },
        { name: 'John Williams', score: 1.0700248 }
      ])
    })
    it('finds several relevant hits when searching with a name that has a typo in it: Jonh instead of John', async () => {
      const t = await setupTestCases(setup)

      const dataset = [
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'John Smith',
          childFirstNames: 'John',
          childFamilyName: 'Smith'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'John Johnson',
          childFirstNames: 'John',
          childFamilyName: 'Johnson'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'John Williams',
          childFirstNames: 'John',
          childFamilyName: 'Williams'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'Jane Doe',
          childFirstNames: 'Jane',
          childFamilyName: 'Doe'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'Michael Jackson',
          childFirstNames: 'Michael',
          childFamilyName: 'Jackson'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'Peter Pan',
          childFirstNames: 'Peter',
          childFamilyName: 'Pan'
        }
      ]

      await addRecords({ records: dataset, client: t.elasticClient })

      const searchParams = await formatSearchParams(
        {
          parameters: {
            name: 'Jonh'
          }
        },
        false
      )

      const searchResult = await t.elasticClient.search(searchParams)

      const hits = searchResult.hits.hits.map((hit) => ({
        name: (hit._source as { name: string }).name,
        score: hit._score
      }))

      expect(hits).toEqual([
        { name: 'John Smith', score: 1.5595812 },
        { name: 'John Johnson', score: 1.5595812 },
        { name: 'John Williams', score: 1.5595812 }
      ])
    })
    it('finds several hits when searching with a more specific name John Smith, but the score for John Smith is higher than other hits', async () => {
      const t = await setupTestCases(setup)

      const dataset = [
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'John Smith',
          childFirstNames: 'John',
          childFamilyName: 'Smith'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'John Johnson',
          childFirstNames: 'John',
          childFamilyName: 'Johnson'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'John Williams',
          childFirstNames: 'John',
          childFamilyName: 'Williams'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'Jane Doe',
          childFirstNames: 'Jane',
          childFamilyName: 'Doe'
        }
      ]

      await addRecords({ records: dataset, client: t.elasticClient })

      const searchParams = await formatSearchParams(
        {
          parameters: {
            name: 'John Smith'
          }
        },
        false
      )

      const searchResult = await t.elasticClient.search(searchParams)

      const hits = searchResult.hits.hits.map((hit) => ({
        name: (hit._source as { name: string }).name,
        score: hit._score
      }))

      expect(hits).toEqual([
        { name: 'John Smith', score: 4.6819434 },
        { name: 'John Johnson', score: 1.0700248 },
        { name: 'John Williams', score: 1.0700248 }
      ])
    })
    it('finds relevant hits when searching with a more specific name that has a typo: Jon Smyth instead of John Smith', async () => {
      const t = await setupTestCases(setup)

      const dataset = [
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'John Smith',
          childFirstNames: 'John',
          childFamilyName: 'Smith'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'John Johnson',
          childFirstNames: 'John',
          childFamilyName: 'Johnson'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'John Williams',
          childFirstNames: 'John',
          childFamilyName: 'Williams'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'Jane Doe',
          childFirstNames: 'Jane',
          childFamilyName: 'Doe'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'Michael Jackson',
          childFirstNames: 'Michael',
          childFamilyName: 'Jackson'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'Peter Pan',
          childFirstNames: 'Peter',
          childFamilyName: 'Pan'
        }
      ]

      await addRecords({ records: dataset, client: t.elasticClient })

      const searchParams = await formatSearchParams(
        {
          parameters: {
            name: 'Jon Smyth'
          }
        },
        false
      )

      const searchResult = await t.elasticClient.search(searchParams)

      const hits = searchResult.hits.hits.map((hit) => ({
        name: (hit._source as { name: string }).name,
        score: hit._score
      }))

      expect(hits).toEqual([
        { name: 'John Smith', score: 5.0833626 },
        { name: 'John Johnson', score: 1.3862941 },
        { name: 'John Williams', score: 1.3862941 }
      ])
    })
    it('finds the Marriage event with a lower score when only the witness name is used for search', async () => {
      const t = await setupTestCases(setup)

      const dataset = [
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'John Smith',
          childFirstNames: 'John',
          childFamilyName: 'Smith'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'John Johnson',
          childFirstNames: 'John',
          childFamilyName: 'Johnson'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'John Williams',
          childFirstNames: 'John',
          childFamilyName: 'Williams'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'Jane Doe',
          childFirstNames: 'Jane',
          childFamilyName: 'Doe'
        },
        {
          compositionId: uuid(),
          event: EVENT.MARRIAGE,
          brideFirstNames: 'Grace',
          brideFamilyName: 'Collins',
          groomFirstNames: 'James',
          groomFamilyName: 'Ford',
          witnessOneFirstNames: 'Michael',
          witnessOneFamilyName: 'Andrews'
        }
      ]

      await addRecords({ records: dataset, client: t.elasticClient })

      const searchParams = await formatSearchParams(
        {
          parameters: {
            name: 'Michael Andrews'
          }
        },
        false
      )

      const searchResult = await t.elasticClient.search(searchParams)

      const hits = searchResult.hits.hits.map((hit) => {
        const {
          brideFirstNames,
          brideFamilyName,
          groomFirstNames,
          groomFamilyName
        } = hit._source as {
          brideFirstNames: string
          brideFamilyName: string
          groomFirstNames: string
          groomFamilyName: string
        }
        return {
          brideFirstNames,
          brideFamilyName,
          groomFirstNames,
          groomFamilyName,
          score: hit._score
        }
      })

      expect(hits).toEqual([
        {
          brideFirstNames: 'Grace',
          brideFamilyName: 'Collins',
          groomFirstNames: 'James',
          groomFamilyName: 'Ford',
          score: 0.2876821
        }
      ])
    })
    it('finds the Marriage event with a typo in the witness name: Micheal Andreus instead of Michael Andrews', async () => {
      const t = await setupTestCases(setup)

      const dataset = [
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'John Smith',
          childFirstNames: 'John',
          childFamilyName: 'Smith'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'John Johnson',
          childFirstNames: 'John',
          childFamilyName: 'Johnson'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'John Williams',
          childFirstNames: 'John',
          childFamilyName: 'Williams'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'Jane Doe',
          childFirstNames: 'Jane',
          childFamilyName: 'Doe'
        },
        {
          compositionId: uuid(),
          event: EVENT.MARRIAGE,
          brideFirstNames: 'Grace',
          brideFamilyName: 'Collins',
          groomFirstNames: 'James',
          groomFamilyName: 'Ford',
          witnessOneFirstNames: 'Michael',
          witnessOneFamilyName: 'Andrews'
        }
      ]

      await addRecords({ records: dataset, client: t.elasticClient })

      const searchParams = await formatSearchParams(
        {
          parameters: {
            name: 'Micheal Andreus'
          }
        },
        false
      )

      const searchResult = await t.elasticClient.search(searchParams)

      const hits = searchResult.hits.hits.map((hit) => {
        const {
          brideFirstNames,
          brideFamilyName,
          groomFirstNames,
          groomFamilyName
        } = hit._source as {
          brideFirstNames: string
          brideFamilyName: string
          groomFirstNames: string
          groomFamilyName: string
        }
        return {
          brideFirstNames,
          brideFamilyName,
          groomFirstNames,
          groomFamilyName,
          score: hit._score
        }
      })

      expect(hits).toEqual([
        {
          brideFirstNames: 'Grace',
          brideFamilyName: 'Collins',
          groomFirstNames: 'James',
          groomFamilyName: 'Ford',
          score: 0.24658465
        }
      ])
    })
    it('finds the same Marriage event with a higher score when bride and groom names are used for search', async () => {
      const t = await setupTestCases(setup)

      const dataset = [
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'John Smith',
          childFirstNames: 'John',
          childFamilyName: 'Smith'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'John Johnson',
          childFirstNames: 'John',
          childFamilyName: 'Johnson'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'John Williams',
          childFirstNames: 'John',
          childFamilyName: 'Williams'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'Jane Doe',
          childFirstNames: 'Jane',
          childFamilyName: 'Doe'
        },
        {
          compositionId: uuid(),
          event: EVENT.MARRIAGE,
          brideFirstNames: 'Grace',
          brideFamilyName: 'Collins',
          groomFirstNames: 'James',
          groomFamilyName: 'Ford',
          witnessOneFirstNames: 'Michael',
          witnessOneFamilyName: 'Andrews'
        }
      ]

      await addRecords({ records: dataset, client: t.elasticClient })

      const searchParams = await formatSearchParams(
        {
          parameters: {
            name: 'Grace Collins James Ford'
          }
        },
        false
      )

      const searchResult = await t.elasticClient.search(searchParams)

      const hits = searchResult.hits.hits.map((hit) => {
        const {
          brideFirstNames,
          brideFamilyName,
          groomFirstNames,
          groomFamilyName
        } = hit._source as {
          brideFirstNames: string
          brideFamilyName: string
          groomFirstNames: string
          groomFamilyName: string
        }
        return {
          brideFirstNames,
          brideFamilyName,
          groomFirstNames,
          groomFamilyName,
          score: hit._score
        }
      })
      expect(hits).toEqual([
        {
          brideFirstNames: 'Grace',
          brideFamilyName: 'Collins',
          groomFirstNames: 'James',
          groomFamilyName: 'Ford',
          score: 1.7260926
        }
      ])
    })
    it('finds the same Marriage event with a typo in bride and groom names used for search: Greece Colins James Fjord instead of Grace Collins James Ford', async () => {
      const t = await setupTestCases(setup)

      const dataset = [
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'John Smith',
          childFirstNames: 'John',
          childFamilyName: 'Smith'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'John Johnson',
          childFirstNames: 'John',
          childFamilyName: 'Johnson'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'John Williams',
          childFirstNames: 'John',
          childFamilyName: 'Williams'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'Jane Doe',
          childFirstNames: 'Jane',
          childFamilyName: 'Doe'
        },
        {
          compositionId: uuid(),
          event: EVENT.MARRIAGE,
          brideFirstNames: 'Grace',
          brideFamilyName: 'Collins',
          groomFirstNames: 'James',
          groomFamilyName: 'Ford',
          witnessOneFirstNames: 'Michael',
          witnessOneFamilyName: 'Andrews'
        }
      ]

      await addRecords({ records: dataset, client: t.elasticClient })

      const searchParams = await formatSearchParams(
        {
          parameters: {
            name: 'Greece Colins James Fjord'
          }
        },
        false
      )

      const searchResult = await t.elasticClient.search(searchParams)

      const hits = searchResult.hits.hits.map((hit) => {
        const {
          brideFirstNames,
          brideFamilyName,
          groomFirstNames,
          groomFamilyName
        } = hit._source as {
          brideFirstNames: string
          brideFamilyName: string
          groomFirstNames: string
          groomFamilyName: string
        }
        return {
          brideFirstNames,
          brideFamilyName,
          groomFirstNames,
          groomFamilyName,
          score: hit._score
        }
      })
      expect(hits).toEqual([
        {
          brideFirstNames: 'Grace',
          brideFamilyName: 'Collins',
          groomFirstNames: 'James',
          groomFamilyName: 'Ford',
          score: 1.7260926
        }
      ])
    })
    it('finds two hits across Birth and Death events when searching with only a last name Smith', async () => {
      const t = await setupTestCases(setup)

      const dataset = [
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'John Smith',
          childFirstNames: 'John',
          childFamilyName: 'Smith'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'John Johnson',
          childFirstNames: 'John',
          childFamilyName: 'Johnson'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'John Williams',
          childFirstNames: 'John',
          childFamilyName: 'Williams'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'Jane Doe',
          childFirstNames: 'Jane',
          childFamilyName: 'Doe'
        },
        {
          compositionId: uuid(),
          event: EVENT.DEATH,
          name: 'Robert Smith',
          deceasedFirstNames: 'Robert',
          deceasedFamilyName: 'Smith',
          informantFirstNames: 'George',
          informantFamilyName: 'Pope',
          spouseFirstNames: 'Lily',
          spouseFamilyName: 'Smith'
        }
      ]

      await addRecords({ records: dataset, client: t.elasticClient })

      const searchParams = await formatSearchParams(
        {
          parameters: {
            name: 'Smith'
          }
        },
        false
      )

      const searchResult = await t.elasticClient.search(searchParams)

      const hits = searchResult.hits.hits.map((hit) => ({
        name: (hit._source as { name: string }).name,
        score: hit._score
      }))

      expect(hits).toEqual([
        { name: 'John Smith', score: 2.6264062 },
        { name: 'Robert Smith', score: 2.6264062 }
      ])
    })
    it('finds a Death event with a lower score when searching with only an informant name', async () => {
      const t = await setupTestCases(setup)

      const dataset = [
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'John Smith',
          childFirstNames: 'John',
          childFamilyName: 'Smith'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'John Johnson',
          childFirstNames: 'John',
          childFamilyName: 'Johnson'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'John Williams',
          childFirstNames: 'John',
          childFamilyName: 'Williams'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'Jane Doe',
          childFirstNames: 'Jane',
          childFamilyName: 'Doe'
        },
        {
          compositionId: uuid(),
          event: EVENT.DEATH,
          name: 'Robert Smith',
          deceasedFirstNames: 'Robert',
          deceasedFamilyName: 'Smith',
          informantFirstNames: 'George',
          informantFamilyName: 'Pope',
          spouseFirstNames: 'Lily',
          spouseFamilyName: 'Smith'
        }
      ]

      await addRecords({ records: dataset, client: t.elasticClient })

      const searchParams = await formatSearchParams(
        {
          parameters: {
            name: 'George Pope'
          }
        },
        false
      )

      const searchResult = await t.elasticClient.search(searchParams)

      const hits = searchResult.hits.hits.map((hit) => ({
        name: (hit._source as { name: string }).name,
        score: hit._score
      }))

      expect(hits).toEqual([{ name: 'Robert Smith', score: 0.2876821 }])
    })
    it('finds a Death event when searching with only an informant name that has a typo: Jorge Pipe instead of George Pope', async () => {
      const t = await setupTestCases(setup)

      const dataset = [
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'John Smith',
          childFirstNames: 'John',
          childFamilyName: 'Smith'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'John Johnson',
          childFirstNames: 'John',
          childFamilyName: 'Johnson'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'John Williams',
          childFirstNames: 'John',
          childFamilyName: 'Williams'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'Jane Doe',
          childFirstNames: 'Jane',
          childFamilyName: 'Doe'
        },
        {
          compositionId: uuid(),
          event: EVENT.DEATH,
          name: 'Robert Smith',
          deceasedFirstNames: 'Robert',
          deceasedFamilyName: 'Smith',
          informantFirstNames: 'George',
          informantFamilyName: 'Pope',
          spouseFirstNames: 'Lily',
          spouseFamilyName: 'Smith'
        }
      ]

      await addRecords({ records: dataset, client: t.elasticClient })

      const searchParams = await formatSearchParams(
        {
          parameters: {
            name: 'Jorge Pipe'
          }
        },
        false
      )

      const searchResult = await t.elasticClient.search(searchParams)

      const hits = searchResult.hits.hits.map((hit) => ({
        name: (hit._source as { name: string }).name,
        score: hit._score
      }))

      expect(hits).toEqual([{ name: 'Robert Smith', score: 0.21576157 }])
    })
    it('finds the same Death event with a higher score when searching with name of deceased', async () => {
      const t = await setupTestCases(setup)

      const dataset = [
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'John Smith',
          childFirstNames: 'John',
          childFamilyName: 'Smith'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'John Johnson',
          childFirstNames: 'John',
          childFamilyName: 'Johnson'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'John Williams',
          childFirstNames: 'John',
          childFamilyName: 'Williams'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'Jane Doe',
          childFirstNames: 'Jane',
          childFamilyName: 'Doe'
        },
        {
          compositionId: uuid(),
          event: EVENT.DEATH,
          name: 'Robert Smith',
          deceasedFirstNames: 'Robert',
          deceasedFamilyName: 'Smith',
          informantFirstNames: 'George',
          informantFamilyName: 'Pope',
          spouseFirstNames: 'Lily',
          spouseFamilyName: 'Smith'
        }
      ]

      await addRecords({ records: dataset, client: t.elasticClient })

      const searchParams = await formatSearchParams(
        {
          parameters: {
            name: 'Robert Smith'
          }
        },
        false
      )

      const searchResult = await t.elasticClient.search(searchParams)

      const hits = searchResult.hits.hits.map((hit) => ({
        name: (hit._source as { name: string }).name,
        score: hit._score
      }))

      expect(hits).toEqual([
        { name: 'Robert Smith', score: 6.7852893 },
        { name: 'John Smith', score: 2.6264062 }
      ])
    })
    it('finds the same Death event with typo in name of deceased: Robber Smyth instead of Robert Smith', async () => {
      const t = await setupTestCases(setup)

      const dataset = [
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'John Smith',
          childFirstNames: 'John',
          childFamilyName: 'Smith'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'John Johnson',
          childFirstNames: 'John',
          childFamilyName: 'Johnson'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'John Williams',
          childFirstNames: 'John',
          childFamilyName: 'Williams'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'Jane Doe',
          childFirstNames: 'Jane',
          childFamilyName: 'Doe'
        },
        {
          compositionId: uuid(),
          event: EVENT.DEATH,
          name: 'Robert Smith',
          deceasedFirstNames: 'Robert',
          deceasedFamilyName: 'Smith',
          informantFirstNames: 'George',
          informantFamilyName: 'Pope',
          spouseFirstNames: 'Lily',
          spouseFamilyName: 'Smith'
        }
      ]

      await addRecords({ records: dataset, client: t.elasticClient })

      const searchParams = await formatSearchParams(
        {
          parameters: {
            name: 'Robber Smyth'
          }
        },
        false
      )

      const searchResult = await t.elasticClient.search(searchParams)

      const hits = searchResult.hits.hits.map((hit) => ({
        name: (hit._source as { name: string }).name,
        score: hit._score
      }))

      expect(hits).toEqual([
        { name: 'Robert Smith', score: 4.8737135 },
        { name: 'John Smith', score: 2.101125 }
      ])
    })
    it('does not find any hits when searching with a name that does not match any of the name fields', async () => {
      const t = await setupTestCases(setup)

      const dataset = [
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'John Smith',
          childFirstNames: 'John',
          childFamilyName: 'Smith'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'John Johnson',
          childFirstNames: 'John',
          childFamilyName: 'Johnson'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'John Williams',
          childFirstNames: 'John',
          childFamilyName: 'Williams'
        },
        {
          compositionId: uuid(),
          event: EVENT.BIRTH,
          name: 'Jane Doe',
          childFirstNames: 'Jane',
          childFamilyName: 'Doe'
        },
        {
          compositionId: uuid(),
          event: EVENT.DEATH,
          name: 'Robert Smith',
          deceasedFirstNames: 'Robert',
          deceasedFamilyName: 'Smith',
          informantFirstNames: 'George',
          informantFamilyName: 'Pope',
          spouseFirstNames: 'Lily',
          spouseFamilyName: 'Smith'
        }
      ]

      await addRecords({ records: dataset, client: t.elasticClient })

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

const addRecords = async ({
  records,
  client
}: {
  records: any[]
  client: elasticsearch.Client
}) => {
  const bulkOperations = records.flatMap((doc) => [
    { index: { _index: OPENCRVS_INDEX_NAME, _id: doc.compositionId } },
    doc
  ])

  try {
    const bulkResponse = await client.bulk({ body: bulkOperations })

    if (bulkResponse.errors) {
      // eslint-disable-next-line no-console
      console.error('Some records failed to index:', bulkResponse.items)
    } else {
      await client.indices.refresh({ index: OPENCRVS_INDEX_NAME })
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to perform bulk insert:', error)
  }
}
