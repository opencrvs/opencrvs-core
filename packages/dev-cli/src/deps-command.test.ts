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
import { describe, expect, it } from 'vitest'
import { depsDownCommand, runDepsDown } from './deps-command'
import { CommandSpec, describe as describeCommand } from './exec'

describe('depsDownCommand', () => {
  it('addresses the same compose project and files as `compose:deps`', () => {
    expect(describeCommand(depsDownCommand())).toBe(
      'docker compose -p opencrvs-deps -f docker-compose.deps.yml ' +
        '-f docker-compose.dev-deps.yml down'
    )
  })

  it('adds -v, and only -v, when volumes are to be wiped', () => {
    expect(describeCommand(depsDownCommand({ volumes: true }))).toBe(
      'docker compose -p opencrvs-deps -f docker-compose.deps.yml ' +
        '-f docker-compose.dev-deps.yml down -v'
    )
  })

  it('keeps volumes unless asked, because they hold every environment’s data', () => {
    expect(depsDownCommand({ volumes: false }).args).not.toContain('-v')
    expect(depsDownCommand().args).not.toContain('-v')
  })

  it('resolves the compose files against the repository root', () => {
    expect(depsDownCommand({ cwd: '/home/dev/opencrvs-core' }).cwd).toBe(
      '/home/dev/opencrvs-core'
    )
  })
})

describe('runDepsDown', () => {
  function capturing() {
    const specs: CommandSpec[] = []

    return {
      specs,
      run: (spec: CommandSpec) => {
        specs.push(spec)
        return { status: 0, stdout: '', stderr: '' }
      }
    }
  }

  it('runs the stop command exactly once', () => {
    const { specs, run } = capturing()

    expect(runDepsDown({ run })).toBe(0)
    expect(specs).toHaveLength(1)
    expect(specs[0].args).not.toContain('-v')
  })

  it('warns that -v destroys every environment’s data, not just this one’s', () => {
    const { run } = capturing()
    const messages: string[] = []

    runDepsDown({ volumes: true, run, out: (m) => messages.push(m) })

    expect(messages.join('\n')).toMatch(/Every local environment/)
  })
})
