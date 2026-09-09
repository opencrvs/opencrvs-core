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

/**
 * A proxy view for the "registrations" Metabase dashboard.
 *
 * The client (`packages/client/src/v2-events/features/performance/Dashboard.tsx`)
 * embeds this page in an iframe and, when the dashboard config carries
 * `context.auth === 'REQUEST_AUTH_TOKEN'`, replies to a `REQUEST_AUTH_TOKEN`
 * message with an `AUTH_TOKEN` message carrying the logged-in user's access
 * token.
 *
 * This page waits for that token, resolves the user's primary office via
 * `GET /dashboards/primary-office`, then redirects itself to the real Metabase
 * dashboard with the office name passed as the `location` query parameter so
 * the dashboard is scoped to the user's office.
 */
import * as Hapi from '@hapi/hapi'
import decode from 'jwt-decode'
import { createClient } from '@opencrvs/toolkit/api'
import { UUID } from '@opencrvs/toolkit/events'
import { GATEWAY_URL } from '@countryconfig/constants'
import { getBearerToken } from '@countryconfig/utils'
import { logger } from '@countryconfig/logger'

/**
 * Resolves the name of the primary office of the user the request is
 * authenticated as.
 *
 * The user's access token is forwarded verbatim to the events service — the
 * same token the client uses — so `user.get` runs as that user and is allowed
 * to read their own record (see `userCanReadOtherUser`).
 */
export async function primaryOfficeHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  let token: `Bearer ${string}`
  try {
    token = getBearerToken(request.headers.authorization)
  } catch {
    return h.response({ error: 'Missing authorization header' }).code(401)
  }

  let sub: string | undefined
  try {
    sub = decode<{ sub?: string }>(token.replace('Bearer ', '')).sub
  } catch (error) {
    logger.error(`primaryOfficeHandler: failed to decode token: ${error}`)
    return h.response({ error: 'Invalid token' }).code(401)
  }

  if (!sub) {
    return h.response({ error: 'Token has no subject' }).code(401)
  }

  const client = createClient(new URL('events', GATEWAY_URL).toString(), token)

  try {
    const user = await client.user.get.query(sub as UUID)
    if (!user.primaryOfficeId) {
      return h.response({ error: 'User has no primary office' }).code(404)
    }
    const office = await client.locations.get.query({
      id: user.primaryOfficeId
    })
    return h
      .response({
        primaryOfficeId: office.id,
        primaryOfficeName: office.name
      })
      .code(200)
  } catch (error) {
    logger.error(`primaryOfficeHandler: failed to resolve user ${sub}: ${error}`)
    return h.response({ error: 'Failed to resolve primary office' }).code(502)
  }
}

/**
 * Serves the proxy HTML page. The real Metabase dashboard URL is passed in the
 * `target` query parameter (kept in the dashboard config, so the dashboard
 * UUID and Metabase host live in one place). It is validated to be an absolute
 * http(s) URL and handed to the page as a JSON-encoded string so it can never
 * break out into markup.
 */
export function dashboardProxyPageHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const rawTarget = request.query.target
  const target = typeof rawTarget === 'string' ? rawTarget : ''

  let validTarget = ''
  try {
    const url = new URL(target)
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      validTarget = target
    }
  } catch {
    // Left empty — the page renders an error instead of redirecting.
  }

  return h.response(renderProxyPage(validTarget)).type('text/html')
}

function renderProxyPage(target: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Registrations dashboard</title>
    <style>
      html, body { height: 100%; margin: 0; }
      body {
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: sans-serif;
        color: #555;
        background: #fff;
      }
      #status { text-align: center; padding: 1rem; }
      #status.error { color: #b00020; }
    </style>
  </head>
  <body>
    <div id="status">Loading dashboard…</div>
    <script>
      var TARGET = ${JSON.stringify(target)}
      var statusEl = document.getElementById('status')

      function fail(message) {
        statusEl.className = 'error'
        statusEl.textContent = message
      }

      if (!TARGET) {
        fail('Dashboard is misconfigured: no target URL was provided.')
      } else {
        // The parent (client Dashboard view) replies to REQUEST_AUTH_TOKEN with
        // an AUTH_TOKEN message carrying the logged-in user's access token.
        var handled = false

        function onMessage(event) {
          if (handled) return
          if (event.source !== window.parent) return
          if (!event.data || event.data.type !== 'AUTH_TOKEN') return
          if (!event.data.token) return
          handled = true
          window.removeEventListener('message', onMessage)
          resolveOfficeAndRedirect(event.data.token)
        }

        window.addEventListener('message', onMessage)
        window.parent.postMessage({ type: 'REQUEST_AUTH_TOKEN' }, '*')

        function resolveOfficeAndRedirect(token) {
          fetch('/dashboards/primary-office', {
            headers: { Authorization: 'Bearer ' + token }
          })
            .then(function (response) {
              if (!response.ok) {
                throw new Error('HTTP ' + response.status)
              }
              return response.json()
            })
            .then(function (body) {
              if (!body || !body.primaryOfficeName) {
                throw new Error('No primary office in response')
              }
              redirect(body.primaryOfficeName)
            })
            .catch(function (error) {
              fail('Could not load your office dashboard: ' + error.message)
            })
        }

        function redirect(primaryOfficeName) {
          // Preserve the target's existing query and hash (e.g. #bordered=false)
          // while adding the office name as the Metabase "location" parameter.
          var url = new URL(TARGET)
          url.searchParams.set('location', primaryOfficeName)
          window.location.replace(url.toString())
        }
      }
    </script>
  </body>
</html>`
}
