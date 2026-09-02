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
 * login.<domain> was the host ANSSI scanned in the Burkina Faso audit (#13246), so this
 * app's policy is the one under external commitment. The parser is duplicated from the
 * client's equivalent test on purpose: the login app deliberately depends on neither
 * @opencrvs/commons nor the client, which is also why it needs no 'unsafe-eval'.
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

describe('login Content-Security-Policy', () => {
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
   * Login loads only its own bundle and login-config.js, proxied same-origin via
   * /api/countryconfig/: no wildcard (ANSSI flagged it as over-broad), no third-party
   * host since the Sentry dialog was removed (#13460). Asserted whole, so 'unsafe-eval'
   * or 'unsafe-inline' also fails here — login compiles no JavaScript at runtime.
   */
  it('loads scripts from this origin only', () => {
    expect(directives['script-src']).toEqual(["'self'"])
  })
})

describe('login runtime without eval', () => {
  /*
   * google-libphonenumber bundles Google Closure's debug module loader and transpiler,
   * which between them contain three eval() calls — vite warns about them on every build.
   * They belong to the load-modules-from-source path, which a prebuilt dist never takes,
   * so they should be unreachable. This asserts that, because if they ever do become
   * reachable the login app silently needs 'unsafe-eval' back and the header above stops
   * matching reality.
   *
   * The import happens before the stubs so they cover the call path, including
   * PhoneNumberUtil's lazy metadata initialisation on first use.
   */
  it('formats a phone number with eval and the Function constructor disabled', async () => {
    const { convertToMSISDN } = await import('@login/utils/dataCleanse')

    const realEval = globalThis.eval
    const RealFunction = globalThis.Function

    const blockedEval = () => {
      throw new EvalError('eval blocked by Content-Security-Policy')
    }
    const blockedFunction = function () {
      throw new EvalError(
        'Function constructor blocked by Content-Security-Policy'
      )
    } as unknown as FunctionConstructor
    // keep instanceof/bind working for everything that isn't compiling a string
    Object.defineProperty(blockedFunction, 'prototype', {
      value: RealFunction.prototype
    })

    let result: string
    try {
      globalThis.eval = blockedEval as unknown as typeof globalThis.eval
      globalThis.Function = blockedFunction
      result = convertToMSISDN('0733333333', 'FAR')
    } finally {
      globalThis.eval = realEval
      globalThis.Function = RealFunction
    }

    expect(result).toBe('+260733333333')
  })
})
