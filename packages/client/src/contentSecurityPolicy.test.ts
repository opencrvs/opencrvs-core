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
import * as fs from 'fs'
import * as path from 'path'
import { describe, expect, it } from 'vitest'

/*
 * The Content-Security-Policy served by nginx has historically been widened in small
 * ad-hoc commits with no test to notice. Burkina Faso's ANSSI audit (#13246) turned the
 * policy into a compliance commitment, so these assertions exist to make any further
 * loosening a deliberate, reviewed act rather than a silent one.
 *
 * Any change here needs a matching answer to "what does the audit report say now?".
 */
const nginxConf = fs.readFileSync(
  path.join(__dirname, '..', 'nginx.conf'),
  'utf8'
)

function getDirectives(conf: string): Record<string, string[]> {
  const header = conf.match(/add_header Content-Security-Policy "([^"]+)"/)?.[1]

  if (!header) {
    throw new Error('No Content-Security-Policy header found in nginx.conf')
  }

  return Object.fromEntries(
    header
      .split(';')
      .map((directive) => directive.trim())
      .filter(Boolean)
      .map((directive) => {
        const [name, ...sources] = directive.split(/\s+/)
        return [name, sources]
      })
  )
}

describe('client Content-Security-Policy', () => {
  const directives = getDirectives(nginxConf)

  it('defines the directives the ANSSI audit requires', () => {
    // frame-ancestors mirrors X-Frame-Options: SAMEORIGIN, which is also still sent
    expect(directives['frame-ancestors']).toEqual(["'self'"])
    expect(directives['base-uri']).toEqual(["'self'"])
    expect(directives['form-action']).toEqual(["'self'"])
    expect(directives['object-src']).toEqual(["'none'"])
  })

  it('does not allow plain-http images', () => {
    // 'http:' in img-src permits mixed content on an https deployment
    expect(directives['img-src']).not.toContain('http:')
  })

  /*
   * Asserted whole, so any new source fails here. 'unsafe-eval' is a known exception —
   * the client compiles JavaScript at runtime (see nginx.conf and #13246) — and the
   * wildcard loads handlebars.js from the country config. No third-party host belongs
   * here; the Sentry dialog was the only one that ever did, and it is gone (#13460).
   */
  it('loads scripts only from itself, the country config and eval', () => {
    expect(directives['script-src']).toEqual([
      "'self'",
      "'unsafe-eval'",
      '{{CONTENT_SECURITY_POLICY_WILDCARD}}'
    ])
  })
})
