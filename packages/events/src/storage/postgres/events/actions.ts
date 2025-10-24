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

import { z } from 'zod'
import { ActionTypes } from '@opencrvs/commons'
import { getClient } from '@events/storage/postgres/events'

export const UserActionsQuery = z.object({
  userId: z.string(),
  skip: z.number().optional().default(0),
  count: z.number().optional().default(10),
  timeStart: z.string().optional(),
  timeEnd: z.string().optional(),
  // Delete action is not persisted.
  actionTypes: ActionTypes.exclude([ActionTypes.enum.DELETE]).array().optional()
})

export type UserActionsQuery = z.infer<typeof UserActionsQuery>

export async function getActionsByUserId({
  userId,
  skip = 0,
  count = 10,
  timeStart,
  timeEnd,
  actionTypes
}: UserActionsQuery) {
  const db = getClient()

  let query = db
    .selectFrom('eventActions')
    .leftJoin('events', 'eventActions.eventId', 'events.id')
    .selectAll()
    // I'm joining tracking ID here solely to serve the user audit view UI that requires it
    .select(['events.trackingId'])
    .where('eventActions.createdBy', '=', userId)

  if (timeStart) {
    query = query.where('eventActions.createdAt', '>=', timeStart)
  }

  if (timeEnd) {
    query = query.where('eventActions.createdAt', '<=', timeEnd)
  }

  if (actionTypes && actionTypes.length > 0) {
    query = query.where('eventActions.actionType', 'in', actionTypes)
  }

  query = query
    .orderBy('eventActions.createdAt', 'desc')
    .limit(count)
    .offset(skip)

  return query.execute()
}

export async function countActionsByUserId({
  userId,
  timeStart,
  timeEnd,
  actionTypes
}: Pick<
  UserActionsQuery,
  'userId' | 'timeStart' | 'timeEnd' | 'actionTypes'
>): Promise<number> {
  const db = getClient()

  let query = db
    .selectFrom('eventActions')
    .select(({ fn }) => [fn.count<string>('id').as('count')])
    .where('createdBy', '=', userId)

  if (timeStart) {
    query = query.where('createdAt', '>=', timeStart)
  }

  if (timeEnd) {
    query = query.where('createdAt', '<=', timeEnd)
  }

  if (actionTypes && actionTypes.length > 0) {
    query = query.where('eventActions.actionType', 'in', actionTypes)
  }

  const result = await query.executeTakeFirst()
  return result?.count ? Number(result.count) : 0
}
