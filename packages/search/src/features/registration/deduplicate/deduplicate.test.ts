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

import { startContainer, stopContainer } from './deduplicate'
import { indexComposition } from '@search/elasticsearch/dbhelper'
import * as elasticsearch from '@elastic/elasticsearch'
import { searchForDuplicates } from './service'
import { StartedElasticsearchContainer } from 'testcontainers'

jest.setTimeout(10 * 60 * 1000)

let container: StartedElasticsearchContainer
let client: elasticsearch.Client

beforeAll(async () => {
  container = await startContainer()
  const host = container.getHost()
  const port = container.getMappedPort(9200)

  client = new elasticsearch.Client({
    node: `http://${host}:${port}`
  })
})

afterAll(async () => {
  try {
    await client.close()
  } catch (error) {
  } finally {
    await stopContainer(container)
  }
})
describe('Deduplication tests', () => {
  it('should check elasticsearch is up', async () => {
    await client.ping()
  })

  describe('Performs a duplicate check based on standard rules', () => {
    it('Finds a duplicate with birth date less than 5days', async () => {
      /*
       * Similar child's firstname(s)
       * Similar child's lastname
       * Date of birth within 5 days
       * Similar Mother’s firstname(s)
       * Similar Mother’s lastname.
       * Similar Mother’s date of birth or Same Age of mother
       * Same mother’s NID
       */

      await indexComposition(
        '123-123-123-123',
        {
          childFirstNames: 'John',
          childFamilyName: 'Smith',
          childDoB: '2011-11-11',
          motherFirstNames: 'Mother',
          motherFamilyName: 'Smith',
          motherDoB: '2000-11-11',
          motherIdentifier: '23412387'
        },
        client
      )
      expect(
        (
          await searchForDuplicates(
            {
              childFirstNames: 'Johnathan',
              childFamilyName: 'Smith',
              childDoB: '2011-11-13',
              motherFirstNames: 'Motherina',
              motherFamilyName: 'Smith',
              motherDoB: '2000-11-12',
              motherIdentifier: '23412387'
            },
            client
          )
        ).body.hits.hits
      ).toHaveLength(1)
    })

    it('Finds no duplicate with different motherNID', async () => {
      /*
       * Similar child's firstname(s)
       * Similar child's lastname
       * Date of birth within 5 days
       * Similar Mother’s firstname(s)
       * Similar Mother’s lastname.
       * Similar Mother’s date of birth or Same Age of mother
       * Same mother’s NID
       */

      await indexComposition(
        '123-123-123-123',
        {
          childFirstNames: 'John',
          childFamilyName: 'Smith',
          childDoB: '2011-11-11',
          motherFirstNames: 'Mother',
          motherFamilyName: 'Smith',
          motherDoB: '2000-11-11',
          motherIdentifier: '23412387'
        },
        client
      )
      expect(
        (
          await searchForDuplicates(
            {
              childFirstNames: 'Johnathan',
              childFamilyName: 'Smith',
              childDoB: '2011-11-13',
              motherFirstNames: 'Motherina',
              motherFamilyName: 'Smith',
              motherDoB: '2000-11-12',
              motherIdentifier: '23412389'
            },
            client
          )
        ).body.hits.hits
      ).toHaveLength(0)
    })
  })

  describe('performs a duplicate check based on two births in 9 months', () => {
    /*
     * Similar Mother’s firstname(s)
     *Similar Mother’s lastname
     * Similar Mother’s date of birth
     * Similar Mother’s date of birth
     * Same Mother’s NID
     * Child’s d.o.b in the last 9 months of each other
     */
    it('Finds a duplicate with Same mother two births within 9 months', async () => {
      await indexComposition(
        '123-123-123-123',
        {
          childFirstNames: 'John',
          childFamilyName: 'Smith',
          childDoB: '2020-01-01',
          motherFirstNames: 'Mother',
          motherFamilyName: 'Smith',
          motherDoB: '2000-11-11'
        },
        client
      )
      expect(
        (
          await searchForDuplicates(
            {
              childFirstNames: 'Martin',
              childFamilyName: 'Smith',
              childDoB: '2020-08-08',
              motherFirstNames: 'Mother',
              motherFamilyName: 'Smith',
              motherDoB: '2000-11-11'
            },
            client
          )
        ).body.hits.hits
      ).toHaveLength(1)
    })

    it('Finds no duplicate with Same mother two births more than 9 months apart', async () => {
      await indexComposition(
        '123-123-123-123',
        {
          childFirstNames: 'John',
          childFamilyName: 'Smith',
          childDoB: '2020-01-01',
          motherFirstNames: 'Mother',
          motherFamilyName: 'Smith',
          motherDoB: '2000-11-11'
        },
        client
      )
      expect(
        (
          await searchForDuplicates(
            {
              childFirstNames: 'Angelo',
              childFamilyName: 'Smith',
              childDoB: '2020-12-12',
              motherFirstNames: 'Mother',
              motherFamilyName: 'Smith',
              motherDoB: '2000-11-11'
            },
            client
          )
        ).body.hits.hits
      ).toHaveLength(0)
    })
  })

  it('performs a duplicate check child increase and decrease. Finds a duplicate for fraudulent records', async () => {
    /*
     * Similar child's firstname(s)
     * Similar child's lastname
     * Date of birth greater than 3 years
     * Similar Mother’s firstname(s)
     * Similar Mother’s lastname.
     * Same mother’s NID
     */
    await indexComposition(
      '123-123-123-123',
      {
        childFirstNames: 'John',
        childFamilyName: 'Smith',
        childDoB: '2011-11-11',
        motherFirstNames: 'Mother',
        motherFamilyName: 'Smith'
      },
      client
    )
    expect(
      (
        await searchForDuplicates(
          {
            childFirstNames: 'John',
            childFamilyName: 'Smith',
            childDoB: '2014-11-11',
            motherFirstNames: 'Mother',
            motherFamilyName: 'Smith'
          },
          client
        )
      ).body.hits.hits
    ).toHaveLength(1)
  })
})
