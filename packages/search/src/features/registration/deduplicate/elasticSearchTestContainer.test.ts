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

import {
  ELASTIC_SEARCH_HTTP_PORT,
  elasticsearch,
  startContainer,
  stopContainer,
  watchForContainer
} from './elasticSearchTestContainer'
import { IBirthCompositionBody } from '@search/elasticsearch/utils'
import * as elastic from '@elastic/elasticsearch'
import { searchForDuplicates } from './service'
import { indexComposition } from '@search/elasticsearch/dbhelper'

describe('Elastic Search Test Container Automation', () => {
  beforeAll(async () => await startContainer())
  beforeEach(async () => watchForContainer())
  afterAll(async () => stopContainer())

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

  it('should check elasticsearch is up', async () => {
    const client = new elastic.Client({
      node: `https://${(await elasticsearch).getHost()}:${(
        await elasticsearch
      ).getMappedPort(ELASTIC_SEARCH_HTTP_PORT || 9200)}`
    })

    await client.cluster.health()
  })

  it('should makes sure similar names are marked as a duplicate', async () => {
    await indexComposition('testBirthRegistrationId', exampleBirthRegistrationA)
    expect(
      await searchForDuplicates({
        ...exampleBirthRegistrationB,
        childFirstNames: 'John',
        childFamilyName: 'Smith'
      })
    ).toHaveLength(1)
  })
})
