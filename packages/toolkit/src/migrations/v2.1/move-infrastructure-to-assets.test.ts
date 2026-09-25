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
import { describe, expect, it } from 'vitest'
import { MOVES, rewriteMovedPaths } from './move-infrastructure-to-assets'

describe('rewriteMovedPaths', () => {
  it.each([
    [
      'docker exec -i postgres bash -s < ./infrastructure/postgres/setup-analytics.sh',
      'docker exec -i postgres bash -s < ./assets/postgres/setup-analytics.sh'
    ],
    [
      'bash infrastructure/metabase/run-dev.sh',
      'bash assets/metabase/run-dev.sh'
    ],
    [
      'sh infrastructure/deployment/reindex.sh',
      'sh assets/elasticsearch/reindex.sh'
    ]
  ])('%s -> %s', (command, expected) => {
    expect(rewriteMovedPaths(command, MOVES)).toBe(expected)
  })

  it.each([
    // Not moved
    'bash infrastructure/clear-all-data-dev.sh',
    'bash infrastructure/deployment/deploy.sh',
    // A Swarm mount, not a path in this repository
    'cp /opt/opencrvs/infrastructure/metabase/run.sh /run.sh',
    // Only a prefix of the moved name
    'bash infrastructure/metabase-extra/run.sh'
  ])('leaves %s alone', (command) => {
    expect(rewriteMovedPaths(command, MOVES)).toBe(command)
  })
})
