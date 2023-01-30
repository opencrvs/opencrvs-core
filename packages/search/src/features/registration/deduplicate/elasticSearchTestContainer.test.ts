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

import { startContainer, stopContainer } from './elasticSearchTestContainer'
// import { IBirthCompositionBody } from '@search/elasticsearch/utils'
import { indexComposition } from '@search/elasticsearch/dbhelper'
import * as elastic from '@elastic/elasticsearch'
import { searchForDuplicates } from './service'
import { StartedElasticsearchContainer } from 'testcontainers'

jest.setTimeout(10 * 60 * 1000)

let container: StartedElasticsearchContainer
let client: elastic.Client

beforeAll(async () => {
  container = await startContainer()
  const host = container?.getHost() ?? '0.0.0.0'
  const port = container?.getMappedPort(9200) ?? 9200

  client = new elastic.Client({
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

describe('Elastic Search Test Container Automation', () => {
  it('should check elasticsearch is up', async () => {
    await client.ping()
  })

  it('performs a duplicate check based on standard rules. Finds a duplicate with the exact same information', async () => {
    /*
     * Similar childs firstname(s)
     * Similar childs lastname
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
        motherDoB: '2000-11-11'
      },
      client
    )
    expect(
      (
        await searchForDuplicates(
          {
            childFirstNames: 'John',
            childFamilyName: 'Smith',
            childDoB: '2011-11-11',
            motherFirstNames: 'Mother',
            motherFamilyName: 'Smith',
            motherDoB: '2000-11-11'
          },
          client
        )
      ).body.hits.hits
    ).toHaveLength(1)
  })
})
