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
import * as Boom from '@hapi/boom'
import type * as Hapi from '@hapi/hapi'
import { createCoreKeyList } from './key-list'
import {
  FindPublicKey,
  matchesContentDigest,
  REJECTION,
  verifyCoreSignature
} from './signature'

const PLUGIN_NAME = '@opencrvs/core-request-auth'

export type CoreRequestAuthOptions =
  | { jwksUrl: string }
  | { findPublicKey: FindPublicKey }

export interface CoreCredentials {
  /** The key that signed the request. */
  keyid: string
}

const bodyChunksByRequest = new WeakMap<Hapi.Request, Buffer[]>()

/** Logs the reason and does not send it, so a caller learns only that core auth failed. */
function reject(request: Hapi.Request, reason: string) {
  request.log(['auth', 'core', 'error'], reason)
  return Boom.forbidden()
}

/**
 * The request target as the sender wrote it. Hapi may rewrite `request.url`
 * (trailing slashes, `setUrl`), but the signature covers what was sent. The
 * target can also be in absolute form (`http://host/path`).
 */
function requestTarget(request: Hapi.Request) {
  const target = request.raw.req.url ?? request.path
  if (!target.startsWith('/')) {
    const { pathname, search } = new URL(target)
    return { path: pathname, query: search }
  }
  const queryStart = target.indexOf('?')
  return queryStart === -1
    ? { path: target, query: '' }
    : { path: target.slice(0, queryStart), query: target.slice(queryStart) }
}

function coreScheme(findPublicKey: FindPublicKey): Hapi.ServerAuthScheme {
  return () => ({
    // The body must be read before the digest can be compared, so payload
    // authentication is required on every route that uses the strategy.
    options: { payload: true },

    async authenticate(request, h) {
      // A streamed body reaches the handler after `payload` runs, so its
      // digest could never be checked.
      if (request.route.settings.payload?.output === 'stream') {
        throw Boom.badImplementation(
          `Route ${request.route.path} streams its payload and cannot use auth: 'core'`
        )
      }

      const result = await verifyCoreSignature(
        {
          method: request.method,
          ...requestTarget(request),
          headers: request.headers
        },
        findPublicKey
      )
      if (!result.valid) {
        return h.unauthenticated(reject(request, result.reason))
      }

      // Hapi does not read a body for GET and HEAD, so the signed digest
      // must be the one of an empty body.
      if (
        ['get', 'head'].includes(request.method) &&
        !matchesContentDigest(request.headers, Buffer.alloc(0))
      ) {
        return h.unauthenticated(reject(request, REJECTION.WRONG_BODY))
      }

      // Keep the raw bytes as they arrive, before Hapi parses them. `payload`
      // compares them with the signed digest.
      const chunks: Buffer[] = []
      bodyChunksByRequest.set(request, chunks)
      request.events.on('peek', (chunk: Buffer | string) => {
        chunks.push(Buffer.from(chunk))
      })

      const credentials: CoreCredentials = { keyid: result.keyid }
      return h.authenticated({ credentials })
    },

    async payload(request, h) {
      const rawBody = Buffer.concat(bodyChunksByRequest.get(request) ?? [])
      if (!matchesContentDigest(request.headers, rawBody)) {
        throw reject(request, REJECTION.WRONG_BODY)
      }
      return h.continue
    }
  })
}

/**
 * Registers the `core` auth strategy: a route with `auth: 'core'` accepts
 * only requests that core signed (see `signCoreRequest`), and answers 403 to
 * anything else. `request.auth.credentials` is a `CoreCredentials`.
 */
export const coreRequestAuth: Hapi.Plugin<CoreRequestAuthOptions> = {
  name: PLUGIN_NAME,
  register(server, options) {
    let findPublicKey: FindPublicKey
    if ('findPublicKey' in options) {
      findPublicKey = options.findPublicKey
    } else {
      const onFetchError = (error: unknown) =>
        server.log(
          ['auth', 'core', 'error'],
          `Could not fetch the core request-signing keys: ${String(error)}`
        )
      const keyList = createCoreKeyList({
        jwksUrl: options.jwksUrl,
        onFetchError
      })
      // Not awaited: country config may start before auth.
      keyList.refresh().catch(onFetchError)
      findPublicKey = keyList.findPublicKey
    }

    server.auth.scheme('core-request-signature', coreScheme(findPublicKey))
    server.auth.strategy('core', 'core-request-signature')
  }
}
