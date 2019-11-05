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
import { detectDuplicates, buildQuery } from '@search/elasticsearch/utils'
import { mockSearchResponse, mockCompositionBody } from '@search/test/utils'
import { searchComposition } from '@search/elasticsearch/dbhelper'

jest.mock('@search/elasticsearch/dbhelper.ts')

describe('elastic search utils', () => {
  it('should return an array of duplicate identifiers for a composition', async () => {
    ;(searchComposition as jest.Mock).mockReturnValue(mockSearchResponse)
    const duplicates = await detectDuplicates(
      'c79e8d62-335e-458d-9fcc-45ec5836c404',
      mockCompositionBody
    )
    expect(duplicates[0]).toEqual('c99e8d62-335e-458d-9fcc-45ec5836c404')
  })

  it('should build the search query for a composition', async () => {
    const query = await buildQuery(mockCompositionBody)
    expect(query.bool.must).toHaveLength(4)
    expect(query.bool.should).toHaveLength(8)
  })
})
