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
import { parseArgs } from './args'

describe('parseArgs', () => {
  it('reads `--flag value` and `--flag=value` the same way', () => {
    expect(
      parseArgs(['--env', 'feature-a'], { valueFlags: ['env'] }).options
    ).toEqual({ env: 'feature-a' })
    expect(
      parseArgs(['--env=feature-a'], { valueFlags: ['env'] }).options
    ).toEqual({ env: 'feature-a' })
  })

  it('collects bare positional arguments up to the declared limit', () => {
    expect(parseArgs(['feature-a'], { positionals: 1 }).positionals).toEqual([
      'feature-a'
    ])
  })

  it('rejects a positional argument when the verb takes none', () => {
    expect(() => parseArgs(['feature-a'], {})).toThrow(
      'Unexpected argument "feature-a".'
    )
  })

  it('rejects more positional arguments than the verb takes', () => {
    expect(() => parseArgs(['a', 'b'], { positionals: 1 })).toThrow(
      'Unexpected argument "b".'
    )
  })

  it('reports unknown options rather than ignoring them', () => {
    expect(() => parseArgs(['--nope'], { valueFlags: ['env'] })).toThrow(
      'Unknown option "--nope". Known options: --env.'
    )
  })

  it('reports a value flag left without a value', () => {
    expect(() => parseArgs(['--env'], { valueFlags: ['env'] })).toThrow(
      'Option "--env" needs a value.'
    )
  })

  describe('boolean switches', () => {
    it('is false-by-absence and true when passed', () => {
      const spec = { booleanFlags: ['volumes'] }

      expect(parseArgs([], spec).switches.volumes).toBe(undefined)
      expect(parseArgs(['--volumes'], spec).switches.volumes).toBe(true)
    })

    it('accepts a declared short alias', () => {
      const parsed = parseArgs(['-v'], {
        booleanFlags: ['volumes'],
        aliases: { v: 'volumes' }
      })

      expect(parsed.switches.volumes).toBe(true)
    })

    it('does not swallow the next token as a value', () => {
      const parsed = parseArgs(['--force', 'feature-a'], {
        booleanFlags: ['force'],
        positionals: 1
      })

      expect(parsed.switches.force).toBe(true)
      expect(parsed.positionals).toEqual(['feature-a'])
    })

    it('rejects a value given to a switch', () => {
      expect(() =>
        parseArgs(['--volumes=yes'], { booleanFlags: ['volumes'] })
      ).toThrow('Option "--volumes" does not take a value.')
    })

    it('reports an unknown short alias', () => {
      expect(() => parseArgs(['-x'], { booleanFlags: ['volumes'] })).toThrow(
        'Unknown option "-x". Known options: --volumes.'
      )
    })
  })
})
