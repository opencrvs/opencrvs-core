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

import { describe, expect, test } from 'vitest'
import {
  eventQueryDataGenerator,
  isFieldSecured,
  isNonInteractiveFieldType
} from '@opencrvs/toolkit/events'
import { birthEvent } from './index'

/**
 * A sealed birth record must not expose any declaration data through the
 * search index: the index is stripped of secured fields only, and search is
 * available to users who are not allowed to view a sealed record
 * (`record.search` without a `flags.noneOf=[sealed]` restriction). Anything
 * left unsecured is therefore readable by them - see
 * https://github.com/opencrvs/opencrvs-core/issues/13289.
 *
 * @todo: Update tests as part of https://github.com/opencrvs/opencrvs-core/issues/13530
 *
 */
describe('sealed birth records', () => {
  const declarationFields = birthEvent.declaration.pages
    .flatMap((page) => page.fields)
    .filter((field) => !isNonInteractiveFieldType(field))

  test('every declaration field is secured once the record is sealed', () => {
    const sealedEvent = eventQueryDataGenerator({
      type: 'birth',
      flags: ['sealed']
    })

    const unsecured = declarationFields
      .filter((field) => !isFieldSecured(field, sealedEvent, {}))
      .map(({ id }) => id)

    expect(unsecured).toEqual([])
  })

  test('fields secured only by the seal are readable while the record is not sealed', () => {
    const unsealedEvent = eventQueryDataGenerator({
      type: 'birth',
      flags: []
    })

    const readable = declarationFields
      .filter((field) => !isFieldSecured(field, unsealedEvent, {}))
      .map(({ id }) => id)

    // Fields the search results and workqueues are built from stay readable
    // for as long as the record is not sealed.
    expect(readable).toEqual(
      expect.arrayContaining([
        'child.name',
        'mother.name',
        'mother.nid',
        'documents.proofOfBirth'
      ])
    )
  })
})
