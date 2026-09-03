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
/* eslint-disable no-console */
import { bold, dim, green, red, yellow } from 'kleur/colors'
// Type-only import: erased at build time, so it adds no runtime dependency on
// @opencrvs/commons (which is a devDependency of the toolkit).
import type { TriggerEvent } from '@opencrvs/commons/notification'

const REQUEST_TIMEOUT_MS = 15000

/**
 * The country config service listens on port 3040 locally. This command is
 * meant to be run against that instance right after `opencrvs upgrade`, to
 * confirm the upgraded config still exposes the expected endpoints and keeps
 * the secured ones locked down.
 */
const DEFAULT_TARGET_URL = 'http://localhost:3040'

interface EndpointCheck {
  method: 'GET' | 'POST'
  /** Concrete path that is actually requested. */
  path: string
  /**
   * Route pattern to show in the output when `path` substitutes a concrete
   * value for a `{param}`. Defaults to `path` when omitted.
   */
  label?: string
}

/**
 * Publicly-served endpoints every country config must expose. The client and
 * login apps, and core services, fetch these before or without user
 * authentication, so they must respond with a 2xx status.
 *
 * `/fonts/{filename}` is handled separately: it is public but parameterised
 * with a country-specific filename we cannot know, so we probe a made-up name.
 */
const REQUIRED_PUBLIC_ENDPOINTS: readonly EndpointCheck[] = [
  { method: 'GET', path: '/client-config.js' },
  { method: 'GET', path: '/login-config.js' },
  { method: 'GET', path: '/handlebars.js' },
  { method: 'GET', path: '/content/client' },
  { method: 'GET', path: '/content/login' },
  { method: 'GET', path: '/content/map.geojson' },
  { method: 'GET', path: '/content/country-logo' },
  { method: 'GET', path: '/config/application' },
  { method: 'GET', path: '/config/workqueues' },
  { method: 'GET', path: '/config/locations' },
  { method: 'GET', path: '/config/roles' },
  { method: 'GET', path: '/config/events' }
]

/** Made-up path segment used to probe parameterised routes we can't enumerate. */
const PROBE_SEGMENT = 'verify-endpoints-probe'

/**
 * User-notification trigger events. Core forwards an authenticated token to
 * each of these, so a country config must never process them unauthenticated.
 *
 * Kept in sync with `TriggerEvent` in `@opencrvs/commons/notification` by the
 * compile-time guard below.
 */
const SECURED_TRIGGER_USER_EVENTS = [
  'user-created',
  'user-updated',
  'username-reminder',
  'reset-password',
  'reset-password-by-admin',
  'password-reset-link',
  'username-reminder-link',
  'resend-invite',
  '2fa',
  'all-user-notification',
  'change-phone-number',
  'change-email-address'
] as const satisfies readonly TriggerEvent[]

/**
 * Endpoints that must require authentication. Each must either be absent (404)
 * or reject an unauthenticated request (401/403) — never process it. Paths
 * with `{param}` segments use a throwaway concrete value; authentication is
 * enforced before the handler ever inspects the parameters (so `/certificates`
 * ids and the like do not need to be real).
 */
const SECURED_ENDPOINTS: readonly EndpointCheck[] = [
  ...SECURED_TRIGGER_USER_EVENTS.map(
    (event): EndpointCheck => ({
      method: 'POST',
      path: `/trigger/user/${event}`
    })
  ),
  { method: 'POST', path: '/trigger/telemetry' },
  { method: 'GET', path: '/trigger/system/ready' },
  {
    method: 'GET',
    path: `/certificates/${PROBE_SEGMENT}`,
    label: '/certificates/{id}'
  },
  { method: 'GET', path: '/certificates' },
  { method: 'GET', path: '/config/users' }
]

/**
 * Used only when `/config/events` cannot be fetched, so the event action
 * triggers are still checked against their route patterns.
 */
const FALLBACK_EVENT_TRIGGERS: readonly EndpointCheck[] = [
  {
    method: 'POST',
    path: `/trigger/events/${PROBE_SEGMENT}/actions/${PROBE_SEGMENT}`,
    label: '/trigger/events/{event}/actions/{action}'
  },
  {
    method: 'POST',
    path: `/trigger/events/birth/actions/${PROBE_SEGMENT}`,
    label: '/trigger/events/birth/actions/{action}'
  },
  {
    method: 'POST',
    path: `/trigger/events/death/actions/${PROBE_SEGMENT}`,
    label: '/trigger/events/death/actions/{action}'
  }
]

type CheckStatus = number | 'error'

const isSuccess = (status: CheckStatus): boolean =>
  status !== 'error' && status >= 200 && status < 300

const requiresAuthOrAbsent = (status: CheckStatus): boolean =>
  status === 401 || status === 403 || status === 404

/**
 * Issues a single request and returns its HTTP status, or `'error'` when the
 * request could not be completed (DNS failure, connection refused, timeout).
 */
async function requestStatus(
  url: string,
  method: 'GET' | 'POST'
): Promise<CheckStatus> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const response = await fetch(url, {
      method,
      signal: controller.signal,
      // Sent without an Authorization header on purpose. A secured route
      // rejects with 401/403 before ever reading the body.
      headers:
        method === 'POST' ? { 'Content-Type': 'application/json' } : undefined,
      body: method === 'POST' ? '{}' : undefined
    })
    return response.status
  } catch {
    return 'error'
  } finally {
    clearTimeout(timer)
  }
}

interface EventTriggerConfig {
  id: string
  actions: string[]
}

function toEventTriggerConfig(value: unknown): EventTriggerConfig | null {
  if (typeof value !== 'object' || value === null) {
    return null
  }
  const record = value as Record<string, unknown>
  if (typeof record.id !== 'string') {
    return null
  }
  const actions = Array.isArray(record.actions)
    ? Array.from(
        new Set(
          record.actions
            .map((action) => {
              if (typeof action !== 'object' || action === null) {
                return null
              }
              const type = (action as Record<string, unknown>).type
              return typeof type === 'string' ? type : null
            })
            .filter((type): type is string => type !== null)
        )
      )
    : []
  return { id: record.id, actions }
}

/**
 * Fetches the event configuration so the event action triggers can be checked
 * against the real event ids and action types. Returns `null` if the endpoint
 * is unreachable or does not return the expected shape.
 */
async function fetchEventConfigs(
  baseUrl: string
): Promise<EventTriggerConfig[] | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const response = await fetch(`${baseUrl}/config/events`, {
      signal: controller.signal
    })
    if (!response.ok) {
      return null
    }
    const body: unknown = await response.json()
    if (!Array.isArray(body)) {
      return null
    }
    return body
      .map(toEventTriggerConfig)
      .filter((config): config is EventTriggerConfig => config !== null)
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Normalises the CLI argument into a base URL. Accepts either a bare domain
 * (`example.org`, assumed https) or a full URL, and strips any trailing slash.
 */
function resolveBaseUrl(input: string): string {
  const withProtocol = /^https?:\/\//i.test(input) ? input : `https://${input}`
  return withProtocol.replace(/\/+$/, '')
}

function describeStatus(status: CheckStatus): string {
  return status === 'error' ? 'no response' : `HTTP ${status}`
}

function endpointLabel(check: EndpointCheck): string {
  const shown = check.label ?? check.path
  const suffix = check.label ? dim(` → ${check.path}`) : ''
  return `${check.method} ${shown}${suffix}`
}

function line(ok: boolean, label: string, detail: string): string {
  const mark = ok ? green('✓') : red('✗')
  return `  ${mark} ${label} ${dim(`(${detail})`)}`
}

function securedDetail(status: CheckStatus): string {
  if (status === 401 || status === 403) {
    return `${describeStatus(status)} — auth required`
  }
  if (status === 404) {
    return `${describeStatus(status)} — not implemented`
  }
  if (status === 'error') {
    return `${describeStatus(status)} — request failed`
  }
  return `${describeStatus(status)} — INSECURE: ensure this endpoint requires authentication!`
}

export async function runVerifyEndpoints(
  target: string = DEFAULT_TARGET_URL
): Promise<void> {
  const baseUrl = resolveBaseUrl(target)
  console.log(bold(`Verifying country config endpoints at ${baseUrl}\n`))

  let failures = 0

  console.log(bold('Required public endpoints (must respond 2xx):'))
  for (const check of REQUIRED_PUBLIC_ENDPOINTS) {
    const status = await requestStatus(`${baseUrl}${check.path}`, check.method)
    const ok = isSuccess(status)
    if (!ok) {
      failures++
    }
    const detail =
      status === 404
        ? `${describeStatus(status)} — missing`
        : ok
          ? describeStatus(status)
          : `${describeStatus(status)} — unexpected`
    console.log(line(ok, endpointLabel(check), detail))
  }

  // `/fonts/{filename}` is public but the filename is country-specific and
  // cannot be automated, so we probe a made-up name. A registered public route
  // returns 404 (file not found) or 200 (if the name happens to exist); either
  // is acceptable. 401/403 would mean the route was wrongly put behind auth.
  {
    const path = `/fonts/${PROBE_SEGMENT}.ttf`
    const status = await requestStatus(`${baseUrl}${path}`, 'GET')
    const ok = status === 200 || status === 404
    if (!ok) {
      failures++
    }
    let detail: string
    if (status === 404) {
      detail = `${describeStatus(status)} — reachable (made-up filename)`
    } else if (status === 200) {
      detail = describeStatus(status)
    } else if (status === 401 || status === 403) {
      detail = `${describeStatus(status)} — must be public`
    } else {
      detail = `${describeStatus(status)} — unexpected`
    }
    console.log(line(ok, `GET /fonts/{filename}${dim(` → ${path}`)}`, detail))
  }

  console.log()
  console.log(bold('Secured endpoints (must be absent or require auth):'))
  for (const check of SECURED_ENDPOINTS) {
    const status = await requestStatus(`${baseUrl}${check.path}`, check.method)
    const ok = requiresAuthOrAbsent(status)
    if (!ok) {
      failures++
    }
    console.log(line(ok, endpointLabel(check), securedDetail(status)))
  }

  console.log()
  console.log(bold('Event action triggers (must be absent or require auth):'))
  const events = await fetchEventConfigs(baseUrl)
  if (!events) {
    console.log(
      '  ' +
        yellow(
          'Could not read /config/events; falling back to route-pattern checks.'
        )
    )
    for (const check of FALLBACK_EVENT_TRIGGERS) {
      const status = await requestStatus(
        `${baseUrl}${check.path}`,
        check.method
      )
      const ok = requiresAuthOrAbsent(status)
      if (!ok) {
        failures++
      }
      console.log(line(ok, endpointLabel(check), securedDetail(status)))
    }
  } else if (events.length === 0) {
    console.log('  ' + yellow('No events configured.'))
  } else {
    for (const event of events) {
      // Fall back to a made-up action when an event declares none, so the
      // route is still exercised.
      const actions = event.actions.length ? event.actions : [PROBE_SEGMENT]
      const failed: Array<{ action: string; status: CheckStatus }> = []
      for (const action of actions) {
        const status = await requestStatus(
          `${baseUrl}/trigger/events/${event.id}/actions/${action}`,
          'POST'
        )
        if (!requiresAuthOrAbsent(status)) {
          failed.push({ action, status })
        }
      }
      const pattern = `POST /trigger/events/${event.id}/actions/{action}`
      if (failed.length === 0) {
        console.log(
          line(true, pattern, `${actions.length} action(s) — all require auth`)
        )
      } else {
        for (const failure of failed) {
          failures++
          console.log(
            line(
              false,
              `POST /trigger/events/${event.id}/actions/${failure.action}`,
              securedDetail(failure.status)
            )
          )
        }
        const okCount = actions.length - failed.length
        if (okCount > 0) {
          console.log(
            line(true, pattern, `${okCount} other action(s) require auth`)
          )
        }
      }
    }
  }

  console.log()
  if (failures > 0) {
    console.log(
      red(bold(`✗ ${failures} check(s) failed.`)) +
        yellow(' See the lines marked ✗ above.')
    )
    process.exit(1)
  }
  console.log(green(bold('✓ All endpoint checks passed.')))
}
