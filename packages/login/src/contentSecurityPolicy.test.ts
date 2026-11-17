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
  path.join(__dirname, '..', 'nginx.template.conf'),
  'utf8'
)

function getDirectives(conf: string): Record<string, string[]> {
  const header = conf.match(/add_header Content-Security-Policy "([^"]+)"/)?.[1]

  if (!header) {
    throw new Error(
      'No Content-Security-Policy header found in nginx.template.conf'
    )
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
    // Stricter than the X-Frame-Options: SAMEORIGIN header, which is also still sent.
    // The login form is never framed.
    expect(directives['frame-ancestors']).toEqual(["'none'"])
    expect(directives['base-uri']).toEqual(["'self'"])
    expect(directives['form-action']).toEqual(["'self'"])
    expect(directives['object-src']).toEqual(["'none'"])
  })

  it('serves images only from this origin', () => {
    // 'http:' permits mixed content on an https deployment; a blanket 'https:' is
    // unnecessary because every image login renders is proxied same-origin.
    expect(directives['img-src']).toEqual(["'self'", 'data:'])
  })

  /*
   * The login app compiles no JavaScript at runtime. If this fails, something new in the
   * bundle calls eval() or new Function — find and remove it rather than reinstating
   * 'unsafe-eval', because this is the policy the audit was run against.
   */
  it('does not allow eval or inline scripts', () => {
    expect(directives['script-src']).not.toContain("'unsafe-eval'")
    expect(directives['script-src']).not.toContain("'unsafe-inline'")
  })

  /*
   * Everything login fetches — its own bundle, login-config.js, public config, auth — is
   * proxied same-origin through this nginx, so no directive needs the deploy-time
   * *.<domain> wildcard, which the ANSSI report flagged as an over-broad source. Asserted
   * across the whole header rather than script-src alone: a wildcard in default-src is
   * inherited by every directive that isn't set explicitly, connect-src included.
   */
  it('names no wildcard origin in any directive', () => {
    expect(nginxConf).not.toMatch(
      /add_header Content-Security-Policy "[^"]*\{\{CONTENT_SECURITY_POLICY_WILDCARD\}\}/
    )
    expect(directives['default-src']).toEqual(["'self'"])
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
