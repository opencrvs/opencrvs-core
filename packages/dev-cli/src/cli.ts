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
import * as fs from 'node:fs'
import { parseArgs } from './args'
import {
  EnvironmentIndexIdentity,
  indexIdentityFromEnvironment,
  selectEnvironmentIndices
} from './clear'
import { runDepsDown } from './deps-command'
import { indexSelectionSkipReason, planDestroy } from './destroy'
import { runDestroy } from './destroy-command'
import {
  createDockerDestroyServices,
  discoverEnvironmentsFromPostgres
} from './destroy-services'
import { runList } from './list-command'
import { runLookup } from './lookup'
import { createRegistry, Registry } from './registry'
import { runResolve } from './resolve-command'
import { inspectWorktree } from './worktree'

export interface Verb {
  summary: string
  usage: string
  run(argv: string[]): number
}

/**
 * Parse `--flag value` and `--flag=value` pairs. Unknown flags are reported
 * rather than ignored, so a typo never silently resolves the wrong
 * environment.
 */
export function parseFlags(
  argv: string[],
  known: string[]
): Record<string, string> {
  const flags: Record<string, string> = {}

  for (let index = 0; index < argv.length; index++) {
    const token = argv[index]

    if (!token.startsWith('--')) {
      throw new Error(`Unexpected argument "${token}".`)
    }

    const [name, inlineValue] = splitFlag(token)

    if (!known.includes(name)) {
      throw new Error(
        `Unknown option "--${name}". Known options: ${known
          .map((option) => `--${option}`)
          .join(', ')}.`
      )
    }

    if (inlineValue !== undefined) {
      flags[name] = inlineValue
      continue
    }

    const next = argv[index + 1]

    if (next === undefined || next.startsWith('--')) {
      throw new Error(`Option "--${name}" needs a value.`)
    }

    flags[name] = next
    index++
  }

  return flags
}

function splitFlag(token: string): [string, string | undefined] {
  const body = token.slice(2)
  const equals = body.indexOf('=')

  return equals === -1
    ? [body, undefined]
    : [body.slice(0, equals), body.slice(equals + 1)]
}

const resolveVerb: Verb = {
  summary:
    'Print this worktree’s environment as `export VAR=value` lines to source.',
  usage: 'resolve [--env <name>]',
  run(argv) {
    const flags = parseFlags(argv, ['env'])
    const worktree = inspectWorktree()

    const { exports, warnings } = runResolve({
      envOverride: flags.env,
      worktreePath: worktree.path,
      isPrimaryWorktree: worktree.isPrimary,
      registry: createRegistry()
    })

    // Warnings go to stderr so `eval "$(... resolve)"` stays safe to source.
    for (const warning of warnings) {
      process.stderr.write(`${warning}\n`)
    }
    process.stdout.write(`${exports}\n`)

    return 0
  }
}

const lookupVerb: Verb = {
  summary:
    'Print an existing environment’s contract to source. Creates nothing.',
  usage: 'lookup [--env <name>]',
  run(argv) {
    const flags = parseFlags(argv, ['env'])
    const worktree = inspectWorktree()

    const { exports } = runLookup({
      envOverride: flags.env,
      worktreePath: worktree.path,
      isPrimaryWorktree: worktree.isPrimary,
      registry: createRegistry()
    })

    process.stdout.write(`${exports}\n`)

    return 0
  }
}

const indicesVerb: Verb = {
  summary:
    'Filter the index names on stdin down to the ones this environment owns.',
  usage: 'indices [--env <name>]',
  run(argv) {
    const flags = parseFlags(argv, ['env'])
    const registry = createRegistry()
    /*
     * The registry knows about slots, not about what exists. Postgres is asked
     * as well, so an environment whose registry entry was released (or never
     * existed on this machine) still has its indices protected.
     */
    const discovery = discoverEnvironmentsFromPostgres()

    if (discovery.failure !== undefined) {
      // stderr, so the caller's `$(...)` still yields an empty selection.
      process.stderr.write(
        `${indexSelectionSkipReason(
          flags.env ?? process.env.OPENCRVS_ENV_NAME ?? 'this environment',
          discovery
        )}\n`
      )
    }

    for (const index of selectEnvironmentIndices(
      readIndexNames(),
      environmentIndexIdentity(flags.env, registry),
      registry.read(),
      discovery
    )) {
      process.stdout.write(`${index}\n`)
    }

    return 0
  }
}

/**
 * Whose indices to select.
 *
 * An explicit `--env` always wins. Otherwise a contract already exported into
 * this process (by `development-environment/environment.sh`) is used as-is,
 * because `--env` is not recoverable after the fact: the primary worktree's own
 * directory name means the *default* environment when derived and a *separate*
 * environment when passed as `--env`. Only with neither is the environment
 * looked up from scratch.
 */
function environmentIndexIdentity(
  envOverride: string | undefined,
  registry: Registry
): EnvironmentIndexIdentity {
  const ambient =
    envOverride === undefined
      ? indexIdentityFromEnvironment(process.env)
      : undefined

  if (ambient !== undefined) {
    return ambient
  }

  const worktree = inspectWorktree()
  const { descriptor } = runLookup({
    envOverride,
    worktreePath: worktree.path,
    isPrimaryWorktree: worktree.isPrimary,
    registry
  })

  return {
    name: descriptor.name,
    esPrefix: descriptor.esPrefix,
    esReindexingStatusIndex: descriptor.esReindexingStatusIndex
  }
}

/** One index name per line on stdin, as `_cat/indices?h=index` prints them. */
function readIndexNames(): string[] {
  if (process.stdin.isTTY) {
    throw new Error(
      'Nothing on stdin. Pipe Elasticsearch’s index list in, for example:\n' +
        '  curl -s "http://localhost:9200/_cat/indices?h=index" | ' +
        'pnpm --filter @opencrvs/dev-cli --silent env:indices'
    )
  }

  return fs
    .readFileSync(0, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '')
}

const destroyVerb: Verb = {
  summary:
    'Delete an environment’s database, indices, bucket and Redis DB, and free its slot.',
  usage: 'destroy <name> [--force]',
  run(argv) {
    const { positionals, switches } = parseArgs(argv, {
      booleanFlags: ['force'],
      positionals: 1
    })
    const [name] = positionals

    if (name === undefined) {
      throw new Error(
        'Which environment? Usage: `pnpm env:destroy <name>`. Run ' +
          '`pnpm env:list` to see what is registered.'
      )
    }

    const registry = createRegistry()
    const snapshot = registry.read()
    const entry = snapshot[name] ?? snapshot[name.replace(/-/g, '_')]

    const plan = planDestroy({
      name,
      snapshot,
      // Postgres, not just the registry, decides which environments exist and
      // therefore which indices must be left alone. See `EnvironmentDiscovery`.
      discovery: discoverEnvironmentsFromPostgres(),
      /*
       * Whether the *registered* worktree is the primary checkout — not the one
       * this command happens to be run from. Destroying the default
       * environment must be refused wherever the developer types it.
       */
      registeredWorktreeIsPrimary:
        entry === undefined
          ? false
          : inspectWorktree(entry.worktreePath).isPrimary,
      force: switches.force === true
    })

    const outcome = runDestroy({
      plan,
      services: createDockerDestroyServices({ registry }),
      out: (message) => process.stdout.write(`${message}\n`),
      err: (message) => process.stderr.write(`${message}\n`)
    })

    return outcome.exitCode
  }
}

const depsDownVerb: Verb = {
  summary: 'Stop the shared dependency singleton; -v also wipes its volumes.',
  usage: 'deps:down [-v|--volumes]',
  run(argv) {
    const { switches } = parseArgs(argv, {
      booleanFlags: ['volumes'],
      aliases: { v: 'volumes' }
    })

    // The compose files are repo-root-relative, and this verb is normally run
    // from `packages/dev-cli` via pnpm, so the root has to be resolved.
    return runDepsDown({
      volumes: switches.volumes === true,
      cwd: inspectWorktree().path,
      out: (message) => process.stderr.write(`${message}\n`)
    })
  }
}

const listVerb: Verb = {
  summary: 'Show every registered environment with its slot and ports.',
  usage: 'list',
  run(argv) {
    parseArgs(argv, {})

    const { table } = runList({ registry: createRegistry() })

    process.stdout.write(`${table}\n`)

    return 0
  }
}

/** Verbs are registered here; adding one needs no other change. */
export const VERBS: Record<string, Verb> = {
  resolve: resolveVerb,
  lookup: lookupVerb,
  indices: indicesVerb,
  list: listVerb,
  destroy: destroyVerb,
  'deps:down': depsDownVerb
}

function usage(): string {
  const verbs = Object.entries(VERBS)
    .map(([name, verb]) => `  ${verb.usage.padEnd(24)}${verb.summary}`)
    .concat(Object.keys(VERBS).length === 0 ? ['  (none)'] : [])
    .join('\n')

  return `usage: dev-cli <verb> [options]\n\nverbs:\n${verbs}\n`
}

export function main(argv: string[]): number {
  const [verbName, ...rest] = argv

  if (verbName === undefined || verbName === '--help' || verbName === '-h') {
    process.stdout.write(usage())
    return verbName === undefined ? 1 : 0
  }

  const verb = VERBS[verbName]

  if (!verb) {
    process.stderr.write(`Unknown verb "${verbName}".\n\n${usage()}`)
    return 1
  }

  try {
    return verb.run(rest)
  } catch (error) {
    process.stderr.write(`${(error as Error).message}\n`)
    return 1
  }
}

if (require.main === module) {
  process.exit(main(process.argv.slice(2)))
}
