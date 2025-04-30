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

import {
  Location,
  resourceIdentifierToUUID,
  SavedLocation
} from '@opencrvs/commons/types'
import { logger, UUID } from '@opencrvs/commons'
import { fetchFromHearth } from '@config/services/hearth'
import client from '@config/config/hearthClient'

export const resolveLocationChildren = async (
  id: UUID,
  type: string | undefined
) => {
  const db = client.db()

  const childQuery = [
    {
      $match: { id: id }
    },
    {
      $graphLookup: {
        from: 'Location_view_with_plain_ids',
        startWith: '$id',
        connectFromField: 'id',
        connectToField: 'partOf.reference',
        as: 'children'
      }
    },
    {
      $set: {
        children: {
          $cond: {
            if: { $gt: [type, undefined] },
            then: {
              $filter: {
                input: '$children',
                as: 'child',
                cond: {
                  $eq: [{ $arrayElemAt: ['$$child.type.coding.code', 0] }, type]
                }
              }
            },
            else: '$children'
          }
        }
      }
    },
    {
      $project: {
        children: {
          id: 1,
          name: 1,
          type: 1
        }
      }
    }
  ]

  try {
    const result = await db
      .collection<Location>('Location_view_with_plain_ids')
      .aggregate(childQuery)
      .toArray()

    return result.length ? result[0].children : []
  } catch (error) {
    logger.error(error)
    throw error
  }
}

/** Resolves any given location's parents multi-level up to the root node */
export const resolveLocationParents = async (
  locationId: UUID
): Promise<SavedLocation[]> => {
  const current = await fetchFromHearth<SavedLocation>(`Location/${locationId}`)

  if (!current) {
    return []
  }

  const id = current.partOf?.reference
    ? resourceIdentifierToUUID(current.partOf.reference)
    : null

  // Handle case where top level location is Location/0
  if (!id || id === '0') {
    return [current]
  }

  const parents = await resolveLocationParents(id)

  return [...parents, current]
}
