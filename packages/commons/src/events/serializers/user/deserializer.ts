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
import { QueryExpression, QueryType, User } from '../../../events'
import {
  CountryConfigQueryType,
  SerializedQueryExpression
} from '../../../events/CountryConfigQueryInput'
import { SerializedUserField } from './serializer'

export const UserWithPrimaryOffice = User.extend({
  primaryOfficeId: z.string()
})
export type UserWithPrimaryOffice = z.infer<typeof UserWithPrimaryOffice>

function userDeserializer(
  serializedUserField: SerializedUserField | string,
  user: UserWithPrimaryOffice
): string {
  if (typeof serializedUserField === 'string') {
    return serializedUserField
  }
  if (serializedUserField.$userField === 'id') {
    return user[serializedUserField.$userField]
  }
  if (serializedUserField.$userField === 'primaryOfficeId') {
    return user[serializedUserField.$userField]
  }
  return 'ToDo'
}

function deserializeQueryExpression(
  expression: SerializedQueryExpression,
  user: UserWithPrimaryOffice
): QueryExpression {
  return {
    ...expression,
    assignedTo: expression.assignedTo && {
      ...expression.assignedTo,
      term: userDeserializer(expression.assignedTo.term, user)
    },
    createdBy: expression.createdBy && {
      ...expression.createdBy,
      term: userDeserializer(expression.createdBy.term, user)
    },
    updatedBy: expression.updatedBy && {
      ...expression.updatedBy,
      term: userDeserializer(expression.updatedBy.term, user)
    },
    createdAtLocation:
      expression.createdAtLocation &&
      (expression.createdAtLocation.type === 'within'
        ? {
            ...expression.createdAtLocation,
            location: userDeserializer(
              expression.createdAtLocation.location,
              user
            )
          }
        : {
            ...expression.createdAtLocation,
            term: userDeserializer(expression.createdAtLocation.term, user)
          }),
    updatedAtLocation:
      expression.updatedAtLocation &&
      (expression.updatedAtLocation.type === 'within'
        ? {
            ...expression.updatedAtLocation,
            location: userDeserializer(
              expression.updatedAtLocation.location,
              user
            )
          }
        : {
            ...expression.updatedAtLocation,
            term: userDeserializer(expression.updatedAtLocation.term, user)
          })
  }
}

export function deserializeQuery(
  query: CountryConfigQueryType,
  user: UserWithPrimaryOffice
): QueryType {
  if (query.type === 'or') {
    return {
      type: 'or',
      clauses: query.clauses.map((clause) =>
        deserializeQueryExpression(clause, user)
      )
    }
  } else {
    return deserializeQueryExpression(query, user)
  }
}
