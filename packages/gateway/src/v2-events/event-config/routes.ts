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
import { env } from '@gateway/environment'
import { notFound } from '@hapi/boom'
import { ServerRoute } from '@hapi/hapi'
import { logger } from '@opencrvs/commons'

/**
 * The events service serves `internalRouter` under this path, see
 * `packages/events/src/server.ts`. Only other services call it, directly on
 * the events service, so the gateway does not forward it.
 */
const INTERNAL_ROUTER_PATH = '/internal'

function isInternalRouterPath(pathname: string) {
  return (
    pathname === INTERNAL_ROUTER_PATH ||
    pathname.startsWith(`${INTERNAL_ROUTER_PATH}/`)
  )
}

export const trpcProxy = [
  {
    method: '*',
    path: '/events/{path*}',
    handler: (req, h) => {
      logger.info(`Proxying request to ${req.params.path}`)

      // Prevent open redirect / SSRF attacks by ensuring the proxied URL is within env.EVENTS_URL
      const uri = new URL(env.EVENTS_URL)
      uri.pathname = req.params.path

      // The URL resolves `..` and `.`, so check the path after it does
      if (isInternalRouterPath(uri.pathname)) {
        throw notFound()
      }

      return h.proxy({
        uri: uri.toString() + req.url.search,
        passThrough: true
      })
    },
    options: {
      payload: {
        output: 'data',
        parse: false
      }
    }
  }
] satisfies Array<ServerRoute>
