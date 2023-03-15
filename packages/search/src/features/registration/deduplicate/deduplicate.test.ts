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
import { OPENCRVS_INDEX_NAME } from '@search/constants'
import {
  compareForBirthDuplication,
  compareForDeathDuplication,
  startContainer,
  stopContainer
} from './test-util'
import * as elasticsearch from '@elastic/elasticsearch'

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

afterEach(async () => {
  try {
    await client.indices.delete({
      index: OPENCRVS_INDEX_NAME
    })
  } catch (error) {}
})

afterAll(async () => {
  try {
    await client.close()
  } catch (error) {
  } finally {
    await stopContainer(container)
  }
})

describe('deduplication tests', () => {
  it('checks elasticsearch is up', async () => {
    await client.ping()
  })

  describe('standard check', () => {
    it('finds a duplicate with very similar details', async () => {
      await expect(
        compareForBirthDuplication(
          {
            // Similar child's firstname(s)
            childFirstNames: ['John', 'Jonh'],
            // Similar child's lastname
            childFamilyName: ['Smith', 'Smith'],
            // Date of birth within 5 days
            childDoB: ['2011-11-11', '2011-11-13'],
            // Similar Mother’s firstname(s)
            motherFirstNames: ['Mother', 'Mothera'],
            // Similar Mother’s lastname.
            motherFamilyName: ['Smith', 'Smith'],
            // Similar Mother’s date of birth or Same Age of mother
            motherDoB: ['2000-11-11', '2000-11-12'],
            // Same mother’s NID
            motherIdentifier: ['23412387', '23412387']
          },
          client
        )
      ).resolves.toHaveLength(1)
    })

    it('finds no duplicate with different mother nid', async () => {
      await expect(
        compareForBirthDuplication(
          {
            childFirstNames: ['John', 'John'],
            childFamilyName: ['Smith', 'Smith'],
            childDoB: ['2011-11-11', '2011-11-11'],
            motherFirstNames: ['Mother', 'Mother'],
            motherFamilyName: ['Smith', 'Smith'],
            motherDoB: ['2000-11-12', '2000-11-12'],
            // Different mother’s NID
            motherIdentifier: ['23412387', '23412388']
          },
          client
        )
      ).resolves.toHaveLength(0)
    })

    it('finds no duplicates with very different details', async () => {
      await expect(
        compareForBirthDuplication(
          {
            childFirstNames: ['John', 'Mathew'],
            childFamilyName: ['Smith', 'Wilson'],
            childDoB: ['2011-11-11', '1980-11-11'],
            motherFirstNames: ['Mother', 'Harriet'],
            motherFamilyName: ['Smith', 'Wilson'],
            motherDoB: ['2000-11-12', '1992-11-12'],
            motherIdentifier: ['23412387', '123123']
          },
          client
        )
      ).resolves.toHaveLength(0)
    })
  })

  describe('same mother two births within 9 months of each other', () => {
    it('finds a duplicate with same mother two births within 9 months', async () => {
      await expect(
        compareForBirthDuplication(
          {
            childFirstNames: ['John', 'Janet'],
            childFamilyName: ['Smith', 'Smith'],
            childDoB: ['2011-11-11', '2011-12-01'],
            motherFirstNames: ['Mother', 'Mother'],
            motherFamilyName: ['Smith', 'Smith'],
            motherDoB: ['2000-11-12', '2000-11-12'],
            motherIdentifier: ['23412387', '23412387']
          },
          client
        )
      ).resolves.toHaveLength(1)
    })

    it('finds no duplicate with the same mother details if two births more than 9 months apart', async () => {
      await expect(
        compareForBirthDuplication(
          {
            childFirstNames: ['John', 'Janet'],
            childFamilyName: ['Smith', 'Smith'],
            childDoB: ['2011-11-11', '2012-10-01'],
            motherFirstNames: ['Mother', 'Mother'],
            motherFamilyName: ['Smith', 'Smith'],
            motherDoB: ['2000-11-12', '2000-11-12'],
            motherIdentifier: ['23412387', '23412387']
          },
          client
        )
      ).resolves.toHaveLength(0)
    })
  })

  describe('child age increase/decrease', () => {
    it('performs a duplicate check child increase and decrease. finds a duplicate for fraudulent records', async () => {
      await expect(
        compareForBirthDuplication(
          {
            childFirstNames: ['John', 'John'],
            childFamilyName: ['Smith', 'Smith'],
            childDoB: ['2011-11-11', '2012-11-01'],
            motherFirstNames: ['Mother', 'Mother'],
            motherFamilyName: ['Smith', 'Smith'],
            motherDoB: ['2000-11-12', '2000-11-12'],
            motherIdentifier: ['23412387', '23412387']
          },
          client
        )
      ).resolves.toHaveLength(1)
    })
  })
})

describe('deduplication tests for death', () => {
  it('death:checks elasticsearch is up', async () => {
    await client.ping()
  })

  describe('standard check for death duplication', () => {
    it.only('finds a duplicate with very similar details', async () => {
      await expect(
        compareForDeathDuplication(
          {
            deceasedFirstNames: ['John', 'jhon'],
            deceasedFamilyName: ['koly', 'koly'],
            deceasedIdentifier: ['23412387', '23412387'],
            deathDate: ['2000-11-12', '2000-11-17']
          },
          client
        )
      ).resolves.toHaveLength(1)
    })
  })
})
