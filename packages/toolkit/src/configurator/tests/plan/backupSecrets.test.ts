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
import { MockGitHub } from '../../ui/github/mock'
import { MockLocalServer } from '../../ui/local/mock'
import type { LocalServerPort } from '../../ui/local/port'
import { renderEnvFile } from '../../ui/plan/envFile'
import { prepareReview } from '../../ui/plan/review'
import { answersFor } from './answers'

const KEYS = ['BACKUP_HOST_PRIVATE_KEY', 'BACKUP_HOST_PUBLIC_KEY']
const PASSPHRASE = 'BACKUP_ENCRYPTION_PASSPHRASE'

// In the "existing" mock, qa exists without any backup secret, production exists with all three (and backs up),
// and "brand-new" does not exist.
async function review(
  environment: string,
  answers: Record<string, unknown>,
  options: { github?: MockGitHub | false; local?: MockLocalServer } = {}
) {
  const local = options.local ?? new MockLocalServer()
  const values = { ...answersFor('prod'), ...answers }
  const result = await prepareReview({
    environment,
    values,
    publicValues: values,
    sources: { github: options.github === false ? undefined : (options.github ?? new MockGitHub('existing', 0)), local },
    bindings,
    scanned
  })
  const backup = result.plan.items.filter((item) => [...KEYS, PASSPHRASE].includes(item.name))
  const item = (name: string) => backup.find((candidate) => candidate.name === name)
  return { ...result, backup, item, names: backup.map((candidate) => candidate.name).sort(), local }
}

const backup = { BACKUP_OR_RESTORE: 'backup' }
const ALL = [PASSPHRASE, ...KEYS].sort()

describe('the backup secrets', () => {
  it('are all generated for a new environment, even when the checkbox is not ticked', async () => {
    const { backup: items, names, local, plan, item } = await review('brand-new', backup)
    expect(names).toEqual(ALL)
    expect(items.map((i) => [i.kind, i.scope, i.status])).toEqual(Array(3).fill(['secret', 'environment', 'new']))
    expect(local.keyPairs).toBe(1)
    expect(item('BACKUP_HOST_PRIVATE_KEY')?.value).toContain('mock-private-key-1')
    expect(item('BACKUP_HOST_PUBLIC_KEY')?.value).toBe('ssh-ed25519 mock-public-key-1')
    expect(item(PASSPHRASE)?.value).toMatch(/^[0-9a-zA-Z]{16}$/)
    expect(plan.createEnvironment).toBe(true)
  })

  it('are generated for an existing environment that has none yet, as in the CLI', async () => {
    const { names, local, backup: items } = await review('qa', backup)
    expect(names).toEqual(ALL)
    expect(local.keyPairs).toBe(1)
    expect(items.map((i) => i.status)).toEqual(['new', 'new', 'new'])
  })

  it('are all kept for an existing environment that has them, unless the checkbox is ticked', async () => {
    for (const ticked of [{}, { GENERATE_BACKUP_SSH_KEYS: false }]) {
      const { backup: items, local } = await review('production', { ...backup, ...ticked })
      expect(local.keyPairs).toBe(0)
      expect(items).toEqual([]) // nothing is written, so nothing is replaced
    }
  })

  it('replace the SSH key pair when the checkbox is ticked, and never the passphrase', async () => {
    const { names, local, backup: items } = await review('production', { ...backup, GENERATE_BACKUP_SSH_KEYS: true })
    expect(local.keyPairs).toBe(1)
    expect(names).toEqual(KEYS) // existing backups are encrypted with the passphrase: a new one would lock them
    expect(items.map((i) => i.status)).toEqual(['update', 'update'])
  })

  it('make only the passphrase when an environment has the key pair but no passphrase', async () => {
    const github = new MockGitHub('existing', 0)
    for (const name of KEYS) await github.putSecret({ scope: 'environment', environment: 'qa', name, value: 'x' })
    const { names, local, item } = await review('qa', backup, { github })
    expect(names).toEqual([PASSPHRASE])
    expect(local.keyPairs).toBe(0)
    expect(item(PASSPHRASE)?.status).toBe('new')
  })

  it('make only the key pair when an environment has the passphrase but no key pair', async () => {
    const github = new MockGitHub('existing', 0)
    await github.putSecret({ scope: 'environment', environment: 'qa', name: PASSPHRASE, value: 'x' })
    const { names, local } = await review('qa', backup, { github })
    expect(names).toEqual(KEYS)
    expect(local.keyPairs).toBe(1)
  })

  it('are made fresh for each review, and both halves of the pair come from the same call', async () => {
    const local = new MockLocalServer()
    const first = await review('brand-new', backup, { local })
    const second = await review('brand-new', backup, { local })
    const pair = (r: typeof first) => KEYS.map((name) => r.item(name)!.value.match(/mock-(?:private|public)-key-(\d+)/)![1])
    expect(pair(first)).toEqual(['1', '1'])
    expect(pair(second)).toEqual(['2', '2'])
    expect(first.item(PASSPHRASE)?.value).not.toBe(second.item(PASSPHRASE)?.value)
  })

  it('are not made unless the environment backs up, whatever was ticked before', async () => {
    for (const mode of ['none', 'restore']) {
      const { backup: items, local } = await review('brand-new', { BACKUP_OR_RESTORE: mode, GENERATE_BACKUP_SSH_KEYS: true })
      expect(local.keyPairs).toBe(0)
      expect(items).toEqual([])
    }
  })

  it('are not made without GitHub, which is the only place they could be kept', async () => {
    const { plan, local } = await review('brand-new', { ...backup, GENERATE_BACKUP_SSH_KEYS: true }, { github: false })
    expect(local.keyPairs).toBe(0)
    expect(plan.items).toEqual([])
  })

  it('go into the downloadable .env, which is the only copy of the private key and the passphrase', async () => {
    const { plan, item } = await review('brand-new', backup)
    const env = renderEnvFile(plan)
    expect(env).toContain('BACKUP_HOST_PRIVATE_KEY="-----BEGIN OPENSSH PRIVATE KEY-----\\nmock-private-key-1\\n-----END OPENSSH PRIVATE KEY-----\\n"')
    expect(env).toContain('BACKUP_HOST_PUBLIC_KEY="ssh-ed25519 mock-public-key-1"')
    expect(env).toContain(`${PASSPHRASE}=${item(PASSPHRASE)!.value}`)
  })

  it('fail the review, rather than write no key, when the dev server cannot make a key pair', async () => {
    const broken = new MockLocalServer()
    broken.generateSshKeyPair = () => Promise.reject(new Error('/api/ssh-keypair failed with 500'))
    await expect(review('brand-new', backup, { local: broken as LocalServerPort as MockLocalServer })).rejects.toThrow('ssh-keypair failed')
  })
})
