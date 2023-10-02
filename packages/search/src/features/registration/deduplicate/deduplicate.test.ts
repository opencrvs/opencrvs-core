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

    it('finds no duplicate if both the firstName & familyName for child is not given', async () => {
      await expect(
        compareForBirthDuplication(
          {
            childFirstNames: ['John', ''],
            childFamilyName: ['Smith', ''],
            childDoB: ['2011-11-11', '2014-11-01'],
            motherFirstNames: ['Mother', 'Mother'],
            motherFamilyName: ['Smith', 'Smith'],
            motherDoB: ['2000-11-12', '2000-11-12']
          },
          client
        )
      ).resolves.toHaveLength(0)
    })

    it('finds a duplicate even if the firstName of child is not given', async () => {
      await expect(
        compareForBirthDuplication(
          {
            childFirstNames: ['John', ''],
            childFamilyName: ['Smith', 'Smiht'],
            childDoB: ['2011-11-11', '2011-11-01'],
            motherFirstNames: ['Mother', 'Mother'],
            motherFamilyName: ['Smith', 'Smith'],
            motherDoB: ['2000-11-12', '2000-11-12']
          },
          client
        )
      ).resolves.toHaveLength(1)
    })

    it('finds no duplicate if a required field is missing', async () => {
      await expect(
        compareForBirthDuplication(
          {
            childFirstNames: ['John', 'Jhon'],
            childFamilyName: ['Smith', 'Smith'],
            childDoB: ['2011-11-11', ''],
            motherDoB: ['2000-11-12', '2000-11-12'],
            motherFirstNames: ['Mother', 'Mother'],
            motherFamilyName: ['Smith', 'Smith']
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
            childDoB: ['2011-11-11', '2014-11-01'],
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
    it('finds a duplicate with very similar details', async () => {
      await expect(
        compareForDeathDuplication(
          {
            deceasedFirstNames: ['John', 'jhon'],
            deceasedFamilyName: ['koly', 'koly'],
            deceasedIdentifier: ['23412387', '23412387'],
            deathDate: ['2000-11-12', '2000-11-17'],
            deceasedDoB: ['2020-11-12', '2020-11-10']
          },
          client
        )
      ).resolves.toHaveLength(1)
    })

    it('finds no duplicate if a required field is missing', async () => {
      await expect(
        compareForDeathDuplication(
          {
            deceasedFirstNames: ['John', 'Jhon'],
            deceasedFamilyName: ['koly', 'koly'],
            deathDate: ['2000-11-12', '2000-11-12'],
            deceasedDoB: ['2020-11-12', '']
          },
          client
        )
      ).resolves.toHaveLength(0)
    })

    it('finds no duplicate if both the firstName & familyName of deceased is not given', async () => {
      await expect(
        compareForDeathDuplication(
          {
            deceasedFirstNames: ['John', ''],
            deceasedFamilyName: ['koly', ''],
            deceasedIdentifier: ['23412387', '23412387'],
            deathDate: ['2000-11-12', '2000-11-17'],
            deceasedDoB: ['2020-11-12', '2020-11-10']
          },
          client
        )
      ).resolves.toHaveLength(0)
    })

    it('finds duplicate even if the familyName of deceased is not given', async () => {
      await expect(
        compareForDeathDuplication(
          {
            deceasedFirstNames: ['John', 'Jonh'],
            deceasedFamilyName: ['koly', ''],
            deceasedIdentifier: ['23412387', '23412387'],
            deathDate: ['2000-11-12', '2000-11-17'],
            deceasedDoB: ['2020-11-12', '2020-11-10']
          },
          client
        )
      ).resolves.toHaveLength(1)
    })
  })
})
