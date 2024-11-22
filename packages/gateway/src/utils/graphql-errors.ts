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

import { GraphQLError } from 'graphql'

export class UnassignError extends GraphQLError {
  constructor(message = 'You have been unassigned from this event') {
    super(message, {
      extensions: {
        code: 'UNASSIGNED'
      }
    })
  }
}
export class UserInputError extends GraphQLError {
  constructor(message = 'Invalid user input', invalidArgs = {}) {
    super(message, {
      extensions: {
        code: 'BAD_USER_INPUT',
        invalidArgs
      }
    })
  }
}

export class AuthenticationError extends GraphQLError {
  constructor(message = 'Unauthorized') {
    super(message, {
      extensions: {
        code: 'UNAUTHENTICATED'
      }
    })
  }
}
