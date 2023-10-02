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

/*
 * Notice that this component is bypassed in tests!
 * Tests use packages/client/src/tests/queryMock.tsx instead
 * This is because at the time of writing, we are running a very old version
 * of apollo client & react apollo and fetchPolicy isn't working with MockedProvider
 */

import * as React from 'react'
import {
  // eslint-disable-next-line no-restricted-imports
  Query as ApolloQuery,
  QueryComponentOptions
} from '@apollo/client/react/components'
// eslint-disable-next-line no-restricted-imports
import * as Sentry from '@sentry/react'

export function Query<T = any>(props: QueryComponentOptions<T>) {
  return (
    <ApolloQuery<T>
      onError={(error: Error) => {
        Sentry.captureException(error)
      }}
      {...props}
    />
  )
}
