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
import * as Hapi from '@hapi/hapi'
import { GATEWAY_URL } from '@countryconfig/constants'

/**
 * The search/create/update/withdraw proxy routes are identical in shape for
 * every versioned entity (locations, administrative areas, ...) — only the
 * REST path segment differs. `basePath` is that segment, e.g. `'locations'`
 * or `'administrative-areas'`; it is used both as the testland-side path and
 * as the upstream gateway path (`${GATEWAY_URL}/events/${basePath}`).
 */
export function createEntityWriteRoutes(basePath: string): Hapi.ServerRoute[] {
  const upstream = `${GATEWAY_URL}/events/${basePath}`

  return [
    {
      method: 'GET',
      path: `/${basePath}/search`,
      handler: (_request, h) => h.proxy({ uri: upstream, passThrough: true }),
      options: {
        auth: false,
        tags: ['qa-tool', basePath, 'proxy'],
        description: `Proxies the ${basePath} list to the gateway for search`
      }
    },
    {
      method: 'POST',
      path: `/${basePath}`,
      handler: (_request, h) => h.proxy({ uri: upstream, passThrough: true }),
      options: {
        auth: false,
        payload: {
          output: 'data',
          parse: false
        },
        tags: ['qa-tool', basePath, 'proxy'],
        description: `Proxies ${basePath} creation to the gateway`
      }
    },
    {
      method: 'PUT',
      path: `/${basePath}/{id}`,
      handler: (request, h) =>
        h.proxy({
          uri: `${upstream}/${request.params.id}`,
          passThrough: true
        }),
      options: {
        auth: false,
        payload: {
          output: 'data',
          parse: false
        },
        tags: ['qa-tool', basePath, 'proxy'],
        description: `Proxies ${basePath} version updates to the gateway`
      }
    },
    {
      method: 'DELETE',
      path: `/${basePath}/{id}/versions/{versionId}`,
      handler: (request, h) =>
        h.proxy({
          uri: `${upstream}/${request.params.id}/versions/${request.params.versionId}`,
          passThrough: true
        }),
      options: {
        auth: false,
        payload: {
          output: 'data',
          parse: false
        },
        tags: ['qa-tool', basePath, 'proxy'],
        description: `Proxies withdrawal of a pending ${basePath} version to the gateway`
      }
    }
  ]
}
