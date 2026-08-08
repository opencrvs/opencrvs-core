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
 * What one verb accepts. Everything is declared up front so that a typo is an
 * error rather than a silently ignored token: these verbs create and destroy
 * per-environment data, and an unnoticed `--evn` would act on the wrong
 * environment.
 */
export interface ArgSpec {
  /** Long flags that carry a value, e.g. `--env feature-a`. */
  valueFlags?: string[]
  /** Long flags that are on/off, e.g. `--force`. */
  booleanFlags?: string[]
  /** Short (or alternate) spelling → the declared flag it stands for. */
  aliases?: Record<string, string>
  /** How many bare arguments the verb takes. Absent means none. */
  positionals?: number
}

export interface ParsedArgs {
  /** Value flags that were given, keyed by their declared long name. */
  options: Record<string, string>
  /**
   * Boolean flags. Absent rather than `false` when not passed, so a caller can
   * tell "not given" from "given" if a default ever needs to depend on it.
   */
  switches: Record<string, boolean | undefined>
  positionals: string[]
}

/**
 * Parse a verb's argv against its declared shape.
 *
 * Deliberately hand-rolled instead of pulling in an argument-parsing
 * dependency: this package is the bootstrap step that runs before anything
 * else in a developer's checkout, so it stays dependency-free.
 */
export function parseArgs(argv: string[], spec: ArgSpec): ParsedArgs {
  const valueFlags = spec.valueFlags ?? []
  const booleanFlags = spec.booleanFlags ?? []
  const aliases = spec.aliases ?? {}
  const maxPositionals = spec.positionals ?? 0

  const options: Record<string, string> = {}
  const switches: Record<string, boolean | undefined> = {}
  const positionals: string[] = []

  for (let index = 0; index < argv.length; index++) {
    const token = argv[index]

    if (!token.startsWith('-')) {
      if (positionals.length >= maxPositionals) {
        throw new Error(`Unexpected argument "${token}".`)
      }

      positionals.push(token)
      continue
    }

    const [flag, inlineValue] = splitToken(token, aliases)

    if (booleanFlags.includes(flag)) {
      if (inlineValue !== undefined) {
        throw new Error(`Option "--${flag}" does not take a value.`)
      }

      switches[flag] = true
      continue
    }

    if (!valueFlags.includes(flag)) {
      throw new Error(unknownOptionMessage(token, valueFlags, booleanFlags))
    }

    if (inlineValue !== undefined) {
      options[flag] = inlineValue
      continue
    }

    const next = argv[index + 1]

    /*
     * A following token that itself looks like a flag is never consumed as a
     * value: `dev-cli destroy --env --force` is a forgotten value, not an
     * environment literally named `--force`.
     */
    if (next === undefined || next.startsWith('-')) {
      throw new Error(`Option "--${flag}" needs a value.`)
    }

    options[flag] = next
    index++
  }

  return { options, switches, positionals }
}

/**
 * Split `--flag=value`, `--flag`, `-f=value` and `-f` into the declared flag
 * name and its inline value, resolving aliases so the rest of the parser only
 * ever deals in declared long names.
 */
function splitToken(
  token: string,
  aliases: Record<string, string>
): [string, string | undefined] {
  const body = token.startsWith('--') ? token.slice(2) : token.slice(1)
  const equals = body.indexOf('=')
  const spelling = equals === -1 ? body : body.slice(0, equals)

  return [
    aliases[spelling] ?? spelling,
    equals === -1 ? undefined : body.slice(equals + 1)
  ]
}

/**
 * Names the option the way the developer typed it — short stays short — and
 * lists what the verb does accept, so the fix is visible without `--help`.
 */
function unknownOptionMessage(
  token: string,
  valueFlags: string[],
  booleanFlags: string[]
): string {
  const typed = token.split('=')[0]
  const known = [...valueFlags, ...booleanFlags].map((flag) => `--${flag}`)

  return known.length === 0
    ? `Unknown option "${typed}". This command takes no options.`
    : `Unknown option "${typed}". Known options: ${known.join(', ')}.`
}
