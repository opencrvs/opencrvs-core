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

import { indexComposition } from '@search/elasticsearch/dbhelper'
import { BirthDocument, DeathDocument } from '@search/elasticsearch/utils'
import * as elasticsearch from '@elastic/elasticsearch'
import { searchForDeathDuplicates, searchForBirthDuplicates } from './service'

type ComparisonObject<T> = {
  [Key in keyof T]: [T[Key], T[Key]]
}
type Values<T> = T[keyof T]

export async function compareForBirthDuplication(
  registrationComparison: ComparisonObject<
    Omit<BirthDocument, 'compositionId'>
  >,
  client: elasticsearch.Client
) {
  const existingComposition = Object.fromEntries(
    Object.entries<Values<BirthDocument>[]>(registrationComparison).map(
      ([key, values]) => [key, values[0]]
    )
  )
  const newComposition = Object.fromEntries(
    Object.entries<Values<BirthDocument>[]>(registrationComparison).map(
      ([key, values]) => [key, values[1]]
    )
  )

  await indexComposition(
    '123-123-123-123',
    { compositionId: '123-123-123-123', ...existingComposition },
    client
  )
  const results = await searchForBirthDuplicates(newComposition, client)
  return results
}

export async function compareForDeathDuplication(
  registrationComparison: ComparisonObject<
    Omit<DeathDocument, 'compositionId'>
  >,
  client: elasticsearch.Client
) {
  const existingComposition = Object.fromEntries(
    Object.entries<Values<DeathDocument>[]>(registrationComparison).map(
      ([key, values]) => [key, values[0]]
    )
  )
  const newComposition = Object.fromEntries(
    Object.entries<Values<DeathDocument>[]>(registrationComparison).map(
      ([key, values]) => [key, values[1]]
    )
  )

  await indexComposition(
    '123-123-123-123',
    { compositionId: '123-123-123-123', ...existingComposition },
    client
  )
  const results = await searchForDeathDuplicates(newComposition, client)
  return results
}
