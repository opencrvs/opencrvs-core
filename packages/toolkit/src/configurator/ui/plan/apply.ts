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
import type { GitHubPort } from '../github/port'
import type { LocalServerPort, RenderedFile } from '../local/port'
import { writes, type Plan } from './plan'

interface Step {
  id: string
  // What the screen shows. Never contains a secret value.
  label: string
  run: () => Promise<void>
}

type StepStatus = 'pending' | 'running' | 'done' | 'failed'

export interface StepState {
  status: StepStatus
  error?: string
}

interface ApplyInput {
  plan: Plan
  // Files as rendered for the review; only the ones that change are written.
  files: RenderedFile[]
  // The answers on screen without secrets, which the server renders the files from.
  publicValues: Record<string, unknown>
  github?: GitHubPort
  local: LocalServerPort
}

// The environment first, then repository items, then the environment's, then the files.
export function buildSteps({ plan, files, publicValues, github, local }: ApplyInput): Step[] {
  const steps: Step[] = []

  if (plan.github && github) {
    if (plan.createEnvironment) {
      steps.push({
        id: `environment:${plan.environment}`,
        label: `Create the GitHub environment “${plan.environment}”`,
        run: () => github.createEnvironment(plan.environment)
      })
    }
    for (const item of writes(plan)) {
      const target = {
        scope: item.scope,
        name: item.name,
        value: item.value,
        ...(item.scope === 'environment' ? { environment: plan.environment } : {})
      }
      const where = item.scope === 'repository' ? 'repository' : `environment “${plan.environment}”`
      steps.push({
        id: item.id,
        label: `${item.status === 'new' ? 'Set' : 'Update'} ${item.kind} ${item.name} (${where})`,
        run: () => (item.kind === 'secret' ? github.putSecret(target) : github.putVariable(target, item.status === 'update'))
      })
    }
  }

  // Only files that have a place in the layout and would change.
  const changed = files.filter((file) => file.target !== null && file.existing !== file.text)
  if (changed.length > 0) {
    steps.push({
      id: 'files',
      label: `Write ${listOf(changed.map((file) => `environments/${file.target}`))}`,
      run: async () => void (await local.writeFiles(plan.environment, publicValues))
    })
  }
  return steps
}

// "a", "a and b", "a, b and c"
const listOf = (items: string[]) => (items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`)

// Runs steps one after another. A failure is recorded and the rest still run, so one bad item
// does not hide the others; `only` limits a retry to the steps that failed.
export async function runSteps(
  steps: Step[],
  report: (id: string, state: StepState) => void,
  only?: ReadonlySet<string>
): Promise<void> {
  for (const step of steps) {
    if (only && !only.has(step.id)) continue
    report(step.id, { status: 'running' })
    try {
      await step.run()
      report(step.id, { status: 'done' })
    } catch (error) {
      report(step.id, { status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }
}
