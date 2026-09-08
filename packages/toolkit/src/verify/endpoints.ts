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
import { idOf, parseCsvLine } from '../csv'
import { candidateRefs, fetchTemplate } from '../translations/template'

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
  try {
    const response = await fetch(url, {
      method,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      // Sent without an Authorization header on purpose. A secured route
      // rejects with 401/403 before ever reading the body.
      headers:
        method === 'POST' ? { 'Content-Type': 'application/json' } : undefined,
      body: method === 'POST' ? '{}' : undefined
    })
    return response.status
  } catch {
    return 'error'
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
  try {
    const response = await fetch(`${baseUrl}/config/events`, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
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

/**
 * The version of the country config template to check against. Bump it with
 * the toolkit's own major.minor: a toolkit release checks that a country config
 * serves the copy core requires *at that version*, which is the same template
 * the `add-translations` codemod adds rows from.
 */
const TEMPLATE_VERSION = '2.1'

/** The translation bundles a country config serves, one per CSV file core owns. */
const TRANSLATED_APPLICATIONS = ['client', 'login'] as const

interface TemplateTranslations {
  ids: string[]
  /** The column names other than `id` and `description`. */
  languages: string[]
}

function readTemplateTranslations(contents: string): TemplateTranslations {
  const lines = contents.replace(/\r?\n$/, '').split(/\r?\n/)

  return {
    ids: lines
      .slice(1)
      .filter((line) => line !== '')
      .map(idOf),
    languages: parseCsvLine(lines[0]).filter(
      (column) => column !== 'id' && column !== 'description'
    )
  }
}

interface ServedLanguage {
  lang: string
  messages: Record<string, string>
}

/**
 * The bundle `GET /content/{application}` serves, or `null` when it cannot be
 * read. An unreachable endpoint is already a failure in the public-endpoints
 * section above, so it is not counted twice here.
 */
async function fetchServedTranslations(
  baseUrl: string,
  application: string
): Promise<ServedLanguage[] | null> {
  try {
    const response = await fetch(`${baseUrl}/content/${application}`, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    })
    if (!response.ok) {
      return null
    }
    const body: unknown = await response.json()
    if (typeof body !== 'object' || body === null) {
      return null
    }
    const languages = (body as Record<string, unknown>).languages
    if (!Array.isArray(languages)) {
      return null
    }
    return languages
      .map((entry): ServedLanguage | null => {
        if (typeof entry !== 'object' || entry === null) {
          return null
        }
        const { lang, messages } = entry as Record<string, unknown>
        if (typeof lang !== 'string') {
          return null
        }
        return {
          lang,
          messages:
            typeof messages === 'object' && messages !== null
              ? (messages as Record<string, string>)
              : {}
        }
      })
      .filter((entry): entry is ServedLanguage => entry !== null)
  } catch {
    return null
  }
}

/** How many missing ids to print before summarising the rest. */
const MISSING_IDS_SHOWN = 10

/**
 * Checks that every message id the country config template carries is served
 * by the running country config.
 *
 * This is the API-side half of the translation checks: which files the copy is
 * kept in, and what shape they are, is the country config's own business — this
 * only asks whether the copy core needs comes back out of `/content/*`. A
 * country config checks its *own* messages against its *own* files itself; see
 * `check-translations.ts` in the country config template.
 *
 * An id is looked for across every language served rather than in one of them:
 * a row in a CSV yields an entry under each of that file's language columns, so
 * absent everywhere means absent from the files. Whether the copy is written is
 * a separate matter, and an empty cell is legitimate — the template itself ships
 * a few.
 *
 * Returns the number of failures.
 */
async function verifyTranslations(baseUrl: string): Promise<number> {
  let refs: string[]
  try {
    refs = await candidateRefs(TEMPLATE_VERSION)
  } catch (error) {
    console.log(
      '  ' +
        yellow(
          `Could not list the ${TEMPLATE_VERSION} refs on GitHub (${
            (error as Error).message
          }); translations not checked.`
        )
    )
    return 0
  }

  let failures = 0

  for (const application of TRANSLATED_APPLICATIONS) {
    const endpoint = `GET /content/${application}`

    let fetched: Awaited<ReturnType<typeof fetchTemplate>>
    try {
      fetched = await fetchTemplate(refs, application)
    } catch (error) {
      console.log(
        '  ' +
          yellow(
            `Could not read ${application}.csv from the country config template on GitHub (${
              (error as Error).message
            }); ${endpoint} not checked.`
          )
      )
      continue
    }

    if (!fetched) {
      console.log(
        '  ' +
          yellow(
            `No ${application}.csv in the ${TEMPLATE_VERSION} country config template on GitHub; ${endpoint} not checked.`
          )
      )
      continue
    }

    const template = readTemplateTranslations(fetched.contents)
    const served = await fetchServedTranslations(baseUrl, application)

    if (!served) {
      console.log(
        '  ' + yellow(`Could not read ${endpoint}; translations not checked.`)
      )
      continue
    }

    const servedIds = new Set(
      served.flatMap(({ messages }) => Object.keys(messages))
    )
    const missing = template.ids.filter((id) => !servedIds.has(id))
    const servedLanguages = new Set(served.map(({ lang }) => lang))
    const absentLanguages = template.languages.filter(
      (lang) => !servedLanguages.has(lang)
    )

    if (missing.length === 0) {
      console.log(
        line(
          true,
          endpoint,
          `all ${template.ids.length} id(s) from the ${fetched.ref} template served`
        )
      )
    } else {
      failures++
      console.log(
        line(
          false,
          endpoint,
          `${missing.length} of ${template.ids.length} id(s) from the ${fetched.ref} template not served`
        )
      )
      for (const id of missing.slice(0, MISSING_IDS_SHOWN)) {
        console.log(`      ${dim(id)}`)
      }
      if (missing.length > MISSING_IDS_SHOWN) {
        console.log(
          `      ${dim(`… and ${missing.length - MISSING_IDS_SHOWN} more`)}`
        )
      }
    }

    // A country dropping a language the template ships is its own decision, so
    // this is worth saying but is not a failure.
    if (absentLanguages.length > 0) {
      console.log(
        '    ' +
          yellow(
            `${application}: the template carries ${absentLanguages.join(
              ', '
            )}, which this country config does not serve.`
          )
      )
    }
  }

  return failures
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
  console.log(bold('Translations served (must cover the copy core requires):'))
  failures += await verifyTranslations(baseUrl)

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
