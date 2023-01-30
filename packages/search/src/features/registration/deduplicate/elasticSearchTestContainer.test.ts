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
// @ts-ignore
import { IBirthCompositionBody } from '@search/elasticsearch/utils'
// @ts-ignore
import { indexComposition } from '@search/elasticsearch/dbhelper'
import * as elasticsearch from '@elastic/elasticsearch'
import { searchForDuplicates } from './service'
import { StartedElasticsearchContainer } from 'testcontainers'

jest.setTimeout(10 * 60 * 1000)

describe('Elastic Search Test Container Automation', () => {
  let container: StartedElasticsearchContainer
  let client: elasticsearch.Client
  beforeAll(async () => {
    container = await startContainer()
  })
  const exampleBirthRegistrationA: IBirthCompositionBody = {
    childFirstNames: 'John',
    childFamilyName: 'Smith',
    motherFirstNames: 'Marry',
    motherFamilyName: 'Smith'
  }
  const exampleBirthRegistrationB: IBirthCompositionBody = {
    childFirstNames: 'Maurice',
    childFamilyName: 'Black',
    motherFirstNames: 'Marry',
    motherFamilyName: 'Black'
  }

  it.only('should check elasticsearch is up', async () => {
    const host = container?.getHost() ?? '0.0.0.0'
    const port = container?.getMappedPort(9200) ?? 9200

    client = new elasticsearch.Client({
      node: `http://${host}:${port}`
    })

    await client.ping()
  })

  it('should makes sure similar names are marked as a duplicate', async () => {
    await indexComposition(
      'testBirthRegistrationId',
      exampleBirthRegistrationA,
      client
    )
    expect(
      (
        await searchForDuplicates(
          {
            ...exampleBirthRegistrationB,
            childFirstNames: 'John',
            childFamilyName: 'Smith'
          },
          client
        )
      ).body.hits.hits
    ).toHaveLength(1)
  })

  afterAll(async () => await stopContainer(container))
})
