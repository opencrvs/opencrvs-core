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

import { QueryExpression, QueryType, User } from '../../../events'
import {
  CountryConfigQueryType,
  SerializedQueryExpression
} from '../../../events/CountryConfigQueryInput'
import { SerializedUserField } from './serializer'

function userDeSerializer(
  serializedUserField: SerializedUserField | string,
  user: User
): string {
  if (typeof serializedUserField === 'string') {
    return serializedUserField
  }
  if (serializedUserField.$userField === 'id') {
    return user[serializedUserField.$userField]
  }
  return 'ToDo'
}

function deserializeQueryExpression(
  expression: SerializedQueryExpression,
  user: User
): QueryExpression {
  return {
    ...expression,
    assignedTo: expression.assignedTo && {
      ...expression.assignedTo,
      term: userDeSerializer(expression.assignedTo.term, user)
    }
  }
}

export function deserializeQuery(
  query: CountryConfigQueryType,
  user: User
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
