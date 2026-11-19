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
import type { GitHubPort, ScopeState } from '../github/port'
import type { LocalServerPort } from '../local/port'
import { githubName, type Bindings, type SourceName } from './bindings'
import { parseWith } from './parsers'
import { readFileCandidates, type Candidate, type ScannedPaths } from './read'

const EMPTY: ScopeState = { variables: {}, secretNames: [] }

// What GitHub holds for the questions of the form. Variables give values; secrets can only
// be reported as defined, because GitHub never returns their values.
export function readGitHubCandidates(
  repository: ScopeState,
  environment: ScopeState,
  bindings: Bindings
): { candidates: Record<string, Candidate[]>; definedSecrets: string[] } {
  const candidates: Record<string, Candidate[]> = {}
  const definedSecrets = new Set<string>()

  for (const [question, binding] of Object.entries(bindings.bindings)) {
    for (const target of binding.targets) {
      if (target.source !== 'github') continue
      const state = target.scope === 'repository' ? repository : environment
      const names = [githubName(question, target), ...(target.legacy ?? [])]

      if (target.kind === 'secret') {
        if (names.some((name) => state.secretNames.includes(name))) definedSecrets.add(question)
        continue
      }

      const name = names.find((candidate) => candidate in state.variables)
      if (name === undefined) continue
      const value = parseWith(target.parse, state.variables[name])
      if (value !== undefined) (candidates[question] ??= []).push({ source: 'github', origin: name, value })
    }
  }
  return { candidates, definedSecrets: [...definedSecrets] }
}

interface Conflict {
  question: string
  winner: Candidate
  others: Candidate[]
}

export interface Snapshot {
  environment: string
  // Whether the environment was found on GitHub / among the local files.
  exists: { github: boolean; files: boolean }
  // Form values by question name. Never contains a secret value.
  values: Record<string, unknown>
  // Where each value came from, e.g. "KUBE_API_HOST" or "inventory.yml".
  origins: Record<string, string>
  // Secret questions that GitHub reports as set.
  definedSecrets: string[]
  // What GitHub held when this was read, as it is: the plan compares new values against it.
  // Absent when GitHub was skipped.
  github?: { repository: ScopeState; environment: ScopeState }
  // Values that sources disagree about; the winner is the one in `values`.
  conflicts: Conflict[]
}

interface SnapshotInput {
  environment: string
  github?: { exists: boolean; repository: ScopeState; environment: ScopeState }
  files?: { exists: boolean; contents: Record<string, string> }
}

interface SnapshotOptions {
  // Overrides the default order in bindings.yml: the first source with a value wins.
  precedence?: SourceName[]
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

export function buildSnapshot(
  input: SnapshotInput,
  bindings: Bindings,
  scanned: ScannedPaths,
  options: SnapshotOptions = {}
): Snapshot {
  const fromGitHub = input.github
    ? readGitHubCandidates(input.github.repository, input.github.environment, bindings)
    : { candidates: {}, definedSecrets: [] }
  const fromFiles = input.files ? readFileCandidates(input.files.contents, bindings, scanned) : {}

  const snapshot: Snapshot = {
    environment: input.environment,
    exists: { github: input.github?.exists ?? false, files: input.files?.exists ?? false },
    values: {},
    origins: {},
    definedSecrets: fromGitHub.definedSecrets,
    github: input.github ? { repository: input.github.repository, environment: input.github.environment } : undefined,
    conflicts: []
  }

  const questions = new Set([...Object.keys(fromGitHub.candidates), ...Object.keys(fromFiles)])
  for (const question of questions) {
    // The binding's own order, then the caller's, then the default.
    const order = bindings.bindings[question]?.precedence ?? options.precedence ?? bindings.precedence
    const all = [...(fromGitHub.candidates[question] ?? []), ...(fromFiles[question] ?? [])]
    // Stable sort: inside one source, targets keep the order they have in bindings.yml.
    const ranked = all
      .map((candidate, index) => ({ candidate, index }))
      .sort((a, b) => order.indexOf(a.candidate.source) - order.indexOf(b.candidate.source) || a.index - b.index)
      .map(({ candidate }) => candidate)

    const [winner, ...rest] = ranked
    if (!winner) continue
    snapshot.values[question] = winner.value
    snapshot.origins[question] = winner.origin
    const others = rest.filter((candidate) => !same(candidate.value, winner.value))
    if (others.length) snapshot.conflicts.push({ question, winner, others })
  }
  return snapshot
}

export interface Sources {
  // Absent when the user skipped GitHub (no token).
  github?: GitHubPort
  local: LocalServerPort
}

// Reads one environment from every available source and merges what was found.
export async function loadSnapshot(
  environment: string,
  sources: Sources,
  bindings: Bindings,
  scanned: ScannedPaths,
  options: SnapshotOptions = {}
): Promise<Snapshot> {
  let github: SnapshotInput['github']
  if (sources.github) {
    const exists = (await sources.github.listEnvironments()).includes(environment)
    github = {
      exists,
      repository: await sources.github.readRepository(),
      environment: exists ? await sources.github.readEnvironment(environment) : EMPTY
    }
  }

  const known = (await sources.local.listEnvironments()).names.includes(environment)
  const files = { exists: known, contents: known ? await sources.local.readEnvironmentFiles(environment) : {} }

  return buildSnapshot({ environment, github, files }, bindings, scanned, options)
}
