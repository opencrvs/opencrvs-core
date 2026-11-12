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

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { isScalar, isSeq, parseDocument, stringify } from 'yaml'
import {
  ENVIRONMENTS_DIR,
  INVENTORY_FILE_NAME,
  WORKFLOWS_DIR,
  isDirectory
} from './paths'

/** Workflows that act on a server: they list the environments that have an inventory. */
export const INFRASTRUCTURE_WORKFLOWS = [
  'provision.yml',
  'reset-2fa.yml'
] as const

/** Workflows that act on the cluster: they list the environments that have Helm values. */
export const APPLICATION_WORKFLOWS = [
  'deploy-dependencies.yml',
  'deploy-opencrvs.yml',
  'clear-all-data.yml',
  'seed-data.yml',
  'reindex.yml',
  'github-to-k8s-sync-env.yml'
] as const

const ENVIRONMENT_INPUT = [
  'on',
  'workflow_dispatch',
  'inputs',
  'environment'
] as const

/** A workflow file does not have the `environment` choice input this tool maintains. */
export class WorkflowFormatError extends Error {}

export interface Environments {
  /** Environments with an `inventory.yml`. */
  infrastructure: string[]
  /** Environments with an `opencrvs-services` folder. */
  application: string[]
}

export function listEnvironments(root: string): Environments {
  const directory = join(root, ENVIRONMENTS_DIR)
  const names = isDirectory(directory)
    ? readdirSync(directory)
        .filter((name) => isDirectory(join(directory, name)))
        .sort()
    : []

  return {
    infrastructure: names.filter((name) =>
      existsSync(join(directory, name, INVENTORY_FILE_NAME))
    ),
    application: names.filter((name) =>
      isDirectory(join(directory, name, 'opencrvs-services'))
    )
  }
}

export interface OptionsUpdate {
  content: string
  warnings: string[]
}

/**
 * Sets the options of the `environment` input of a workflow file to
 * `environments`, and leaves every other byte of the file alone.
 *
 * Only the `environment` list is touched, wherever it is in the file: workflows
 * such as `provision.yml` have other `options` lists (the tags) as well.
 *
 * Environments already in the list keep their order and new ones are appended
 * in the order given, so a list that holds exactly these environments, in any
 * order, is not rewritten at all. When it is, comments inside the list are lost.
 */
export function updateEnvironmentOptions(
  content: string,
  environments: readonly string[]
): OptionsUpdate {
  const document = parseDocument(content)
  if (document.errors.length > 0) {
    throw new WorkflowFormatError(
      `Invalid YAML: ${document.errors[0]!.message}`
    )
  }

  const options = document.getIn([...ENVIRONMENT_INPUT, 'options'], true)
  if (!isSeq(options)) {
    throw new WorkflowFormatError(
      'Expected a list at on.workflow_dispatch.inputs.environment.options'
    )
  }
  if (options.flow || !options.range) {
    throw new WorkflowFormatError(
      'on.workflow_dispatch.inputs.environment.options has to be a block list, one "- name" per line'
    )
  }

  const warnings: string[] = []
  const fallback = document.getIn([...ENVIRONMENT_INPUT, 'default'])
  if (typeof fallback === 'string' && !environments.includes(fallback)) {
    warnings.push(
      `the default environment "${fallback}" is not one of the options`
    )
  }

  // Environments that are still there keep their place, new ones follow. A list somebody ordered by
  // hand (the default first, say) is therefore not reshuffled, and an added environment is one line.
  const current = options.items.map((item) =>
    String(isScalar(item) ? item.value : item)
  )
  const target = [
    ...current.filter(
      (name, i) => environments.includes(name) && current.indexOf(name) === i
    ),
    ...environments.filter((name) => !current.includes(name))
  ]
  if (
    target.length === current.length &&
    target.every((name, i) => name === current[i])
  ) {
    return { content, warnings }
  }

  // The list runs from its first "-" to the end of its last line, line break included.
  const [start, end] = options.range
  const indentation = content.slice(
    content.lastIndexOf('\n', start - 1) + 1,
    start
  )
  if (indentation.trim() !== '') {
    throw new WorkflowFormatError(
      'on.workflow_dispatch.inputs.environment.options is not on its own lines'
    )
  }

  const eol = content.includes('\r\n') ? '\r\n' : '\n'
  const endsWithLineBreak = content.slice(start, end).endsWith('\n')
  const items = target
    .map((name) => `- ${stringify(name, { lineWidth: 0 }).trimEnd()}`)
    .join(eol + indentation)

  return {
    content:
      content.slice(0, start) +
      items +
      (endsWithLineBreak ? eol : '') +
      content.slice(end),
    warnings
  }
}

export type WorkflowStatus =
  | 'updated'
  | 'unchanged'
  /** The repository does not have this workflow. */
  | 'not-found'
  /** There is no environment to list, so the workflow is left as it is. */
  | 'no-environments'

export interface WorkflowChange {
  /** Relative to the repository root. */
  file: string
  environments: string[]
  status: WorkflowStatus
  before: string
  after: string
  warnings: string[]
}

function planWorkflow(
  root: string,
  workflow: string,
  environments: string[]
): WorkflowChange {
  const file = join(WORKFLOWS_DIR, workflow)
  const path = join(root, file)
  const change = {
    file,
    environments,
    before: '',
    after: '',
    warnings: [] as string[]
  }

  if (!existsSync(path)) return { ...change, status: 'not-found' }

  const before = readFileSync(path, 'utf8')
  if (environments.length === 0)
    return { ...change, status: 'no-environments', before, after: before }

  try {
    const { content, warnings } = updateEnvironmentOptions(before, environments)
    return {
      ...change,
      status: content === before ? 'unchanged' : 'updated',
      before,
      after: content,
      warnings
    }
  } catch (error) {
    if (error instanceof WorkflowFormatError) {
      throw new WorkflowFormatError(`${file}: ${error.message}`)
    }
    throw error
  }
}

/**
 * Works out what every workflow needs, writing nothing. It throws on the first
 * workflow that does not have the expected `environment` input, so that nothing
 * is written when one of them cannot be updated.
 */
export function planWorkflowUpdates(root: string): WorkflowChange[] {
  const { infrastructure, application } = listEnvironments(root)

  return [
    ...INFRASTRUCTURE_WORKFLOWS.map((workflow) =>
      planWorkflow(root, workflow, infrastructure)
    ),
    ...APPLICATION_WORKFLOWS.map((workflow) =>
      planWorkflow(root, workflow, application)
    )
  ]
}

/** Writes the workflows of a plan that are `updated`. Returns their paths. */
export function applyWorkflowUpdates(
  root: string,
  changes: readonly WorkflowChange[]
): string[] {
  const updated = changes.filter((change) => change.status === 'updated')
  for (const change of updated) {
    writeFileSync(join(root, change.file), change.after, 'utf8')
  }
  return updated.map((change) => change.file)
}
