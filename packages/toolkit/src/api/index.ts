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
import { CreateTRPCClient, createTRPCClient, httpBatchLink } from '@trpc/client'
import superjson from 'superjson'
import { AppRouter } from '@opencrvs/events/build/types/router'

/**
 * Creates a tRPC client with the specified base URL and authorization token.
 *
 * @param baseUrl - The base URL where the tRPC server can be found, e.g., 'https://farajaland.opencrvs.org/api/trpc'.
 * @param token - The authorization token to be used in the request headers.
 * @returns A tRPC client configured with the provided base URL and authorization token.
 */
export function createClient(
  baseUrl: string,
  token: `Bearer ${string}`
): CreateTRPCClient<AppRouter> {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: baseUrl,
        transformer: superjson,
        headers() {
          return {
            Authorization: token
          }
        }
      })
    ]
  })
}
