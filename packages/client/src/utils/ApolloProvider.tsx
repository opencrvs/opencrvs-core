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
import * as React from 'react'
import {
  ApolloProvider as ApolloClientProvider,
  ApolloProviderProps
} from '@apollo/client/react/context'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'

export function ApolloProvider(
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  props: Omit<ApolloProviderProps<any>, 'client'> & {
    client: ApolloClient<NormalizedCacheObject> | null
  }
) {
  const { client, children } = props
  return client ? (
    <ApolloClientProvider client={client}>{children}</ApolloClientProvider>
  ) : (
    <></>
  )
}
