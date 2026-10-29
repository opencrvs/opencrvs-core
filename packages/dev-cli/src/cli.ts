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
import { parseArgs } from './args'
import { runDepsDown } from './deps-command'
import { EnvironmentDiscovery, planClear, planDestroy } from './data-plan'
import {
  EnvironmentDataServices,
  runClear,
  runDestroy
} from './environment-data'
import {
  createDockerDataServices,
  discoverEnvironmentsFromPostgres
} from './docker-services'
import { formatExportLines, toEnvironmentVariables } from './env-contract'
import { CommandRunner, runCommand } from './exec'
import { runList } from './list-command'
import { createEnvironmentLocator } from './locator'
import { createRegistry, Registry } from './registry'
import { inspectWorktree, Worktree } from './worktree'

/**
 * Everything a verb reaches outside the process for. `main` takes these so a
 * test can run every verb end to end against a temp registry and a recording
 * data adapter; `realDeps` wires the real ones once.
 */
export interface CliDeps {
  registry: Registry
  inspectWorktree: (worktreePath?: string) => Worktree
  /** The process environment, for a contract an enclosing script exported. */
  ambient: NodeJS.ProcessEnv
  /** Which environments exist, asked of Postgres. See `EnvironmentDiscovery`. */
  discover: () => EnvironmentDiscovery
  dataServices: EnvironmentDataServices
  /** Runs `docker compose` for `deps:down`. */
  run: CommandRunner
  /** One line to stdout. */
  out: (line: string) => void
  /**
   * One line to stderr: warnings and errors, kept off stdout so what
   * `resolve` and `lookup` print stays safe to `eval`.
   */
  err: (line: string) => void
}

export function realDeps(): CliDeps {
  const registry = createRegistry()

  return {
    registry,
    inspectWorktree,
    ambient: process.env,
    discover: () => discoverEnvironmentsFromPostgres(),
    dataServices: createDockerDataServices({ registry }),
    run: runCommand,
    out: (line) => process.stdout.write(`${line}\n`),
    err: (line) => process.stderr.write(`${line}\n`)
  }
}

export interface Verb {
  summary: string
  usage: string
  run(argv: string[], deps: CliDeps): number
}

const resolveVerb: Verb = {
  summary:
    'Print this worktree’s environment as `export VAR=value` lines to source.',
  usage: 'resolve [--env <name>]',
  run(argv, deps) {
    const { options } = parseArgs(argv, { valueFlags: ['env'] })
    const { descriptor, warnings } = createEnvironmentLocator(deps).resolve(
      options.env
    )

    warnings.forEach(deps.err)
    deps.out(formatExportLines(toEnvironmentVariables(descriptor)))

    return 0
  }
}

const lookupVerb: Verb = {
  summary:
    'Print an existing environment’s contract to source. Creates nothing.',
  usage: 'lookup [--env <name>]',
  run(argv, deps) {
    const { options } = parseArgs(argv, { valueFlags: ['env'] })
    const descriptor = createEnvironmentLocator(deps).lookup(options.env)

    deps.out(formatExportLines(toEnvironmentVariables(descriptor)))

    return 0
  }
}

const clearVerb: Verb = {
  summary:
    'Empty an environment’s indices, bucket, token store and app/analytics schemas.',
  usage: 'clear [--env <name>]',
  run(argv, deps) {
    const { options } = parseArgs(argv, { valueFlags: ['env'] })
    const locator = createEnvironmentLocator(deps)

    runClear({
      plan: planClear({
        environment: locator.lookup(options.env),
        snapshot: deps.registry.read(),
        discovery: deps.discover()
      }),
      services: deps.dataServices,
      out: deps.out,
      err: deps.err
    })

    return 0
  }
}

const destroyVerb: Verb = {
  summary:
    'Delete an environment’s database, indices, bucket and Redis DB, and free its slot.',
  usage: 'destroy <name> [--force]',
  run(argv, deps) {
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

    const locator = createEnvironmentLocator(deps)

    const outcome = runDestroy({
      plan: planDestroy({
        environment: locator.locate(name),
        snapshot: deps.registry.read(),
        discovery: deps.discover(),
        force: switches.force === true
      }),
      services: deps.dataServices,
      out: deps.out,
      err: deps.err
    })

    return outcome.exitCode
  }
}

const depsDownVerb: Verb = {
  summary: 'Stop the shared dependency singleton; -v also wipes its volumes.',
  usage: 'deps:down [-v|--volumes]',
  run(argv, deps) {
    const { switches } = parseArgs(argv, {
      booleanFlags: ['volumes'],
      aliases: { v: 'volumes' }
    })

    // The compose files are repo-root-relative, and this verb is normally run
    // from `packages/dev-cli` via pnpm, so the root has to be resolved.
    return runDepsDown({
      volumes: switches.volumes === true,
      cwd: deps.inspectWorktree().path,
      run: deps.run,
      out: deps.err
    })
  }
}

const listVerb: Verb = {
  summary: 'Show every registered environment with its slot and ports.',
  usage: 'list',
  run(argv, deps) {
    parseArgs(argv, {})

    deps.out(runList({ registry: deps.registry }).table)

    return 0
  }
}

/** Verbs are registered here; adding one needs no other change. */
export const VERBS: Record<string, Verb> = {
  resolve: resolveVerb,
  lookup: lookupVerb,
  clear: clearVerb,
  list: listVerb,
  destroy: destroyVerb,
  'deps:down': depsDownVerb
}

function usage(): string {
  const width = Math.max(...Object.values(VERBS).map((v) => v.usage.length))
  const verbs = Object.values(VERBS)
    .map((verb) => `  ${verb.usage.padEnd(width + 2)}${verb.summary}`)
    .join('\n')

  return `usage: dev-cli <verb> [options]\n\nverbs:\n${verbs}`
}

export function main(argv: string[], deps: CliDeps = realDeps()): number {
  const [verbName, ...rest] = argv

  if (verbName === undefined || verbName === '--help' || verbName === '-h') {
    deps.out(usage())
    return verbName === undefined ? 1 : 0
  }

  const verb = VERBS[verbName]

  if (!verb) {
    deps.err(`Unknown verb "${verbName}".\n\n${usage()}`)
    return 1
  }

  try {
    return verb.run(rest, deps)
  } catch (error) {
    deps.err((error as Error).message)
    return 1
  }
}

if (require.main === module) {
  process.exit(main(process.argv.slice(2)))
}
