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

import { spawnSync } from 'child_process'
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  writeFileSync
} from 'fs'
import { homedir } from 'os'
import path from 'path'
import { isDeepStrictEqual } from 'util'
import * as yaml from 'js-yaml'
import kleur from 'kleur'
import { error, log, success, warn } from './logger'
import { isKubectlInstalled, warnIfNativeWindowsShell } from './platform'

export const ADD_K8S_CONTEXT_USAGE = `
Usage: opencrvs environment add-k8s-context <kubeconfig-file>

Add the cluster, user and context from a kubeconfig file copied from an
OpenCRVS Kubernetes server to your local kubeconfig.

The local kubeconfig is the first existing file listed in KUBECONFIG, or
~/.kube/config when KUBECONFIG is not set. A backup is taken before it is
changed. Nothing is changed if an entry with the same name already exists.

Arguments:
  <kubeconfig-file>   Path to the kubeconfig file, e.g. /tmp/kubeconfig

Options:
  -h, --help          Show this message.
`.trim()

interface NamedEntry {
  name: string
  [key: string]: unknown
}

export interface Kubeconfig {
  apiVersion?: string
  kind?: string
  clusters?: NamedEntry[] | null
  contexts?: NamedEntry[] | null
  users?: NamedEntry[] | null
  'current-context'?: string
  [key: string]: unknown
}

const SECTIONS = [
  { key: 'contexts', label: 'context' },
  { key: 'clusters', label: 'cluster' },
  { key: 'users', label: 'user' }
] as const

type Section = (typeof SECTIONS)[number]['key']

export interface Conflict {
  section: Section
  label: string
  name: string
}

export class KubeconfigConflictError extends Error {
  constructor(
    public readonly targetPath: string,
    public readonly conflicts: Conflict[]
  ) {
    const headline = conflicts.some(({ section }) => section === 'contexts')
      ? `Context already exists in ${targetPath}.`
      : `Entries with the same name already exist in ${targetPath}.`
    super(
      [
        headline,
        'Conflicting entries:',
        ...conflicts.map(({ label, name }) => `  - ${label} "${name}"`),
        '',
        'Nothing was changed. Remove or rename the existing entries and run the command again, e.g.:',
        ...conflicts.map(
          ({ label, name }) => `  kubectl config delete-${label} ${name}`
        )
      ].join('\n')
    )
  }
}

export function getLocalKubeconfigPath(
  env: NodeJS.ProcessEnv = process.env,
  home = homedir()
) {
  // Same rule kubectl uses for new entries: the first file in KUBECONFIG that exists
  const paths = (env.KUBECONFIG ?? '').split(path.delimiter).filter(Boolean)
  if (paths.length > 0) {
    return paths.find((filePath) => existsSync(filePath)) ?? paths[0]
  }
  return path.join(home, '.kube', 'config')
}

function parseKubeconfig(content: string, filePath: string): Kubeconfig {
  let parsed: unknown
  try {
    parsed = yaml.load(content)
  } catch (err) {
    throw new Error(
      `${filePath} is not a valid YAML file: ${
        err instanceof Error ? err.message : err
      }`
    )
  }
  if (parsed === undefined || parsed === null) {
    return {}
  }
  if (typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`${filePath} is not a valid kubeconfig file`)
  }
  return parsed as Kubeconfig
}

function validateSourceKubeconfig(config: Kubeconfig, filePath: string) {
  if (config.kind !== undefined && config.kind !== 'Config') {
    throw new Error(
      `${filePath} is not a kubeconfig file (kind: ${config.kind})`
    )
  }
  for (const { key } of SECTIONS) {
    const entries = config[key]
    if (!Array.isArray(entries) || entries.length === 0) {
      throw new Error(
        `${filePath} is not a valid kubeconfig file: no ${key} found`
      )
    }
    if (entries.some((entry) => typeof entry?.name !== 'string')) {
      throw new Error(
        `${filePath} is not a valid kubeconfig file: every entry in ${key} must have a name`
      )
    }
  }
}

/**
 * Merges the entries of `source` into `target`.
 *
 * A context with an existing name is always a conflict. A cluster or user with
 * an existing name is a conflict only when it differs, so several users of the
 * same cluster can share its entry.
 */
export function mergeKubeconfig(
  target: Kubeconfig,
  source: Kubeconfig,
  targetPath: string
): Kubeconfig {
  const merged: Kubeconfig = {
    apiVersion: 'v1',
    kind: 'Config',
    preferences: {},
    ...target
  }
  const conflicts: Conflict[] = []

  for (const { key, label } of SECTIONS) {
    const existing = target[key] ?? []
    const additions: NamedEntry[] = []

    for (const entry of source[key] ?? []) {
      const match = existing.find(({ name }) => name === entry.name)
      if (!match) {
        additions.push(entry)
      } else if (key === 'contexts' || !isDeepStrictEqual(match, entry)) {
        conflicts.push({ section: key, label, name: entry.name })
      }
    }

    merged[key] = [...existing, ...additions]
  }

  if (conflicts.length > 0) {
    throw new KubeconfigConflictError(targetPath, conflicts)
  }

  if (!target['current-context'] && source['current-context']) {
    merged['current-context'] = source['current-context']
  }

  return merged
}

function isSameFile(a: string, b: string) {
  try {
    return realpathSync(a) === realpathSync(b)
  } catch {
    return false
  }
}

function timestamp(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, '-')
}

export interface AddK8sContextResult {
  targetPath: string
  backupPath?: string
  contexts: string[]
  clusters: string[]
}

export function addK8sContext({
  sourcePath,
  targetPath
}: {
  sourcePath: string
  targetPath: string
}): AddK8sContextResult {
  if (!existsSync(sourcePath)) {
    throw new Error(`File not found: ${sourcePath}`)
  }
  if (isSameFile(sourcePath, targetPath)) {
    throw new Error(
      `${sourcePath} is already your local kubeconfig. If KUBECONFIG points to it, unset it (unset KUBECONFIG) and run the command again.`
    )
  }

  const source = parseKubeconfig(readFileSync(sourcePath, 'utf8'), sourcePath)
  validateSourceKubeconfig(source, sourcePath)

  const targetExists = existsSync(targetPath)
  const target = targetExists
    ? parseKubeconfig(readFileSync(targetPath, 'utf8'), targetPath)
    : {}

  const merged = mergeKubeconfig(target, source, targetPath)

  mkdirSync(path.dirname(targetPath), { recursive: true, mode: 0o700 })

  let backupPath: string | undefined
  if (targetExists) {
    backupPath = `${targetPath}.backup-${timestamp()}`
    copyFileSync(targetPath, backupPath)
    chmodSync(backupPath, 0o600)
  }

  writeFileSync(
    targetPath,
    yaml.dump(merged, { indent: 2, lineWidth: -1, noRefs: true }),
    { encoding: 'utf8', mode: 0o600 }
  )
  chmodSync(targetPath, 0o600)

  return {
    targetPath,
    backupPath,
    contexts: (source.contexts ?? []).map(({ name }) => name),
    clusters: (source.clusters ?? []).map(({ name }) => name)
  }
}

function verifyAccess(kubeconfigPath: string, context: string) {
  log(`\nVerifying access to the cluster using context "${context}"...`)
  const result = spawnSync(
    'kubectl',
    [
      '--kubeconfig',
      kubeconfigPath,
      '--context',
      context,
      '--request-timeout=10s',
      'get',
      'namespaces'
    ],
    { stdio: 'inherit' }
  )
  return !result.error && result.status === 0
}

export async function runAddK8sContext(args: string[]) {
  if (args.includes('--help') || args.includes('-h')) {
    log(ADD_K8S_CONTEXT_USAGE)
    return
  }

  const positional = args.filter((arg) => !arg.startsWith('-'))
  if (positional.length !== 1) {
    error(
      positional.length === 0
        ? 'Missing <kubeconfig-file> argument.\n'
        : `Unexpected extra argument(s): ${positional.slice(1).join(', ')}\n`
    )
    log(ADD_K8S_CONTEXT_USAGE)
    process.exit(1)
  }

  warnIfNativeWindowsShell()

  // Yarn runs scripts from the package root; INIT_CWD is where the user ran yarn
  const sourcePath = path.resolve(
    process.env.INIT_CWD ?? process.cwd(),
    positional[0]
  )
  const targetPath = getLocalKubeconfigPath()

  let result: AddK8sContextResult
  try {
    result = addK8sContext({ sourcePath, targetPath })
  } catch (err) {
    if (err instanceof KubeconfigConflictError) {
      error(err.message)
      process.exit(1)
    }
    throw err
  }

  for (const context of result.contexts) {
    success(`✅ Context "${context}" added to ${result.targetPath}`)
  }
  if (result.backupPath) {
    log(`Previous kubeconfig saved to ${result.backupPath}`)
  }

  const [context] = result.contexts
  if (!isKubectlInstalled()) {
    warn(
      kleur.yellow(
        '\nkubectl was not found. Install it to use the new context: https://kubernetes.io/docs/tasks/tools/'
      )
    )
  } else if (!verifyAccess(result.targetPath, context)) {
    warn(
      kleur.yellow(
        [
          '\nThe context was added, but the cluster could not be reached. Check that:',
          '  - you are connected to the VPN, if the cluster requires one',
          '  - port 6443/TCP of the Kubernetes API is reachable from your machine',
          `  - the server address is reachable; change it with: kubectl config set-cluster ${result.clusters[0]} --server=https://<host>:6443`
        ].join('\n')
      )
    )
  }

  log(
    `\nSwitch to the new context with:\n  kubectl config use-context ${context}`
  )
  log(
    kleur.yellow(
      `\n${sourcePath} contains credentials for the cluster. Delete it once you no longer need it:\n  rm ${sourcePath}`
    )
  )
}
