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
import { bindings, scanned } from '../../ui/bindings/load'
import { loadSnapshot } from '../../ui/bindings/snapshot'
import { MockGitHub } from '../../ui/github/mock'
import type { WriteTarget } from '../../ui/github/port'
import { MockLocalServer } from '../../ui/local/mock'
import { buildSteps, runSteps, type StepState } from '../../ui/plan/apply'
import { buildPlan } from '../../ui/plan/plan'
import { answersFor } from './answers'

const SECRET = 'a very private value'
const SECRET_NAMES = ['SMTP_PASSWORD', 'ENCRYPTION_KEY', 'REGISTRY_TOKEN']

class FlakyGitHub extends MockGitHub {
  failOnce = new Set<string>()
  override putVariable(target: WriteTarget, exists?: boolean) {
    if (this.failOnce.delete(target.name)) return Promise.reject(new Error(`GitHub answered with HTTP 500 for ${target.name}.`))
    return super.putVariable(target, exists)
  }
}

async function prepare(
  environment: string,
  values: Record<string, unknown>,
  options: { github?: MockGitHub | null; local?: MockLocalServer } = {}
) {
  const github = options.github === null ? undefined : (options.github ?? new MockGitHub('existing', 0))
  const local = options.local ?? new MockLocalServer()
  const snapshot = await loadSnapshot(environment, { github, local }, bindings, scanned)
  const plan = buildPlan({ environment, values, snapshot, bindings })
  const publicValues = Object.fromEntries(Object.entries(values).filter(([name]) => !SECRET_NAMES.includes(name)))
  const files = await local.renderFiles(environment, publicValues)
  return { github, local, plan, steps: buildSteps({ plan, files, publicValues, github, local }) }
}

const values = { ...answersFor('qa'), DOMAIN: 'd.example', REGISTRY_TOKEN: SECRET, ENCRYPTION_KEY: SECRET }

function reporter() {
  const states: Record<string, StepState> = {}
  const history: string[] = []
  return {
    states,
    history,
    report: (id: string, state: StepState) => {
      states[id] = state
      history.push(`${id.split(':').pop()}:${state.status}`)
    }
  }
}

describe('buildSteps', () => {
  it('creates the environment, then repository items, then the environment items, then the files', async () => {
    const { steps } = await prepare('brand-new', values)
    expect(steps.map((step) => step.label)).toEqual([
      'Create the GitHub environment “brand-new”',
      'Set secret REGISTRY_TOKEN (repository)',
      'Set variable DOMAIN (environment “brand-new”)',
      'Set variable TWO_FA_ENABLED (environment “brand-new”)',
      'Set variable KUBE_API_HOST (environment “brand-new”)',
      'Set variable TRAEFIK_MODE (environment “brand-new”)',
      'Set variable MONITORING_ENABLED (environment “brand-new”)',
      'Set variable OTEL_ENABLED (environment “brand-new”)',
      'Set secret ENCRYPTION_KEY (environment “brand-new”)',
      'Write environments/brand-new/inventory.yml, environments/brand-new/dependencies/values.yaml, environments/brand-new/traefik/values.yaml and environments/brand-new/opencrvs-services/values.yaml'
    ])
    expect(new Set(steps.map((step) => step.id)).size).toBe(steps.length)
  })

  it('never puts a secret value in a label', async () => {
    const { steps } = await prepare('brand-new', values)
    expect(JSON.stringify(steps.map((step) => step.label))).not.toContain(SECRET)
  })

  it('does not create an environment that exists, and says "Update" for what exists', async () => {
    const { steps } = await prepare('qa', { DOMAIN: 'new.example.org', KUBE_API_HOST: '10.1.0.77' })
    expect(steps.map((step) => step.label)).toEqual(['Update variable DOMAIN (environment “qa”)', expect.stringContaining('Write ')])
  })

  it('writes only the files when GitHub was skipped', async () => {
    const { steps } = await prepare('qa', values, { github: null })
    expect(steps.map((step) => step.id)).toEqual(['files'])
  })

  it('has no file step when the files would not change', async () => {
    const local = new MockLocalServer()
    await local.writeFiles('qa', answersFor('qa'))
    const { steps } = await prepare('qa', answersFor('qa'), { github: null, local })
    expect(steps).toEqual([])
  })
})

describe('running the steps', () => {
  it('writes to GitHub and to the files, and reading it back shows the result', async () => {
    const { github, local, steps } = await prepare('brand-new', values)
    const { states, report } = reporter()
    await runSteps(steps, report)

    expect(Object.values(states).every((state) => state.status === 'done')).toBe(true)
    expect(await github!.listEnvironments()).toContain('brand-new')
    expect((await github!.readEnvironment('brand-new')).variables).toEqual({
      DOMAIN: 'd.example',
      TWO_FA_ENABLED: 'false',
      KUBE_API_HOST: '10.1.0.5',
      TRAEFIK_MODE: 'lets_encrypt',
      MONITORING_ENABLED: 'true',
      OTEL_ENABLED: 'true'
    })
    expect(github!.writtenSecrets).toEqual({ 'repository:REGISTRY_TOKEN': SECRET, 'environment/brand-new:ENCRYPTION_KEY': SECRET })
    expect(await local.readEnvironmentFiles('brand-new')).toHaveProperty(['inventory.yml'])
  })

  it('a second run changes nothing except the secrets that are entered again', async () => {
    const first = await prepare('brand-new', values)
    await runSteps(first.steps, () => undefined)
    const second = await prepare('brand-new', values, { github: first.github!, local: first.local })
    expect(second.steps.map((step) => step.label)).toEqual([
      'Update secret REGISTRY_TOKEN (repository)',
      'Update secret ENCRYPTION_KEY (environment “brand-new”)'
    ])
  })

  it('reports each step as running, then done, in order', async () => {
    const { steps } = await prepare('qa', { DOMAIN: 'new.example.org' })
    const { history, report } = reporter()
    await runSteps(steps, report)
    expect(history).toEqual(['DOMAIN:running', 'DOMAIN:done', 'files:running', 'files:done'])
  })

  it('carries on after a failure, and retries only what failed', async () => {
    const github = new FlakyGitHub('existing', 0)
    github.failOnce.add('DOMAIN')
    const { steps } = await prepare('brand-new', values, { github })
    const { states, history, report } = reporter()
    await runSteps(steps, report)

    const failed = Object.entries(states).filter(([, state]) => state.status === 'failed')
    expect(failed.map(([id]) => id)).toEqual(['environment:variable:DOMAIN'])
    expect(failed[0]![1].error).toContain('HTTP 500')
    expect(Object.values(states).filter((state) => state.status === 'done')).toHaveLength(steps.length - 1) // the rest went through
    expect((await github.readEnvironment('brand-new')).variables).toEqual({
      TWO_FA_ENABLED: 'false',
      KUBE_API_HOST: '10.1.0.5',
      TRAEFIK_MODE: 'lets_encrypt',
      MONITORING_ENABLED: 'true',
      OTEL_ENABLED: 'true'
    })

    history.length = 0
    await runSteps(steps, report, new Set(failed.map(([id]) => id)))
    expect(history).toEqual(['DOMAIN:running', 'DOMAIN:done'])
    expect((await github.readEnvironment('brand-new')).variables.DOMAIN).toBe('d.example')
    expect(Object.values(states).every((state) => state.status === 'done')).toBe(true)
  })

  it('records an error that is not an Error object', async () => {
    const { report, states } = reporter()
    await runSteps([{ id: 'x', label: 'x', run: () => Promise.reject('plain string') }], report)
    expect(states.x).toEqual({ status: 'failed', error: 'Unknown error' })
  })
})
