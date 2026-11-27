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
import { execFileSync } from 'node:child_process'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { GitHubSession, handleApiRequest, type ApiRequest } from '../../server/plugin'
import { generateSSHKeyPair } from '../../server/sshKeys'

let dir: string
beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'env-init-'))
})
afterEach(() => rm(dir, { recursive: true, force: true }))

const call = (request: ApiRequest) =>
  handleApiRequest('/api/ssh-keypair', { environmentsDir: dir, projectDir: dir, github: new GitHubSession() }, request)

const hasSshKeygen = (() => {
  try {
    execFileSync('ssh-keygen', ['-?'], { stdio: 'ignore' })
    return true
  } catch (error) {
    // `ssh-keygen -?` exits with an error even where it exists; only a missing program is a no.
    return (error as NodeJS.ErrnoException).code !== 'ENOENT'
  }
})()

describe('generateSSHKeyPair', () => {
  it('makes an Ed25519 key pair like the CLI: an OpenSSH private key and a one-line public key', () => {
    const { privateKey, publicKey } = generateSSHKeyPair()
    expect(privateKey).toMatch(/^-----BEGIN OPENSSH PRIVATE KEY-----\n[A-Za-z0-9+/=\n]+\n-----END OPENSSH PRIVATE KEY-----\n$/)
    expect(publicKey).toMatch(/^ssh-ed25519 [A-Za-z0-9+/]+={0,3}$/)
  })

  it('makes a new pair every time', () => {
    const pairs = Array.from({ length: 5 }, () => generateSSHKeyPair())
    expect(new Set(pairs.map((pair) => pair.privateKey)).size).toBe(5)
    expect(new Set(pairs.map((pair) => pair.publicKey)).size).toBe(5)
  })

  // OpenSSH itself is the judge: it must read the private key and find the public key that was returned with it.
  it.skipIf(!hasSshKeygen)('is accepted by ssh-keygen, which derives the same public key', async () => {
    const { privateKey, publicKey } = generateSSHKeyPair()
    const file = join(dir, 'key')
    await writeFile(file, privateKey, { mode: 0o600 })
    expect(execFileSync('ssh-keygen', ['-y', '-f', file]).toString().trim()).toBe(publicKey)
  })
})

describe('POST /api/ssh-keypair', () => {
  it('returns a key pair', async () => {
    const result = await call({ method: 'POST', body: {} })
    expect(result?.status).toBe(200)
    const { privateKey, publicKey } = result!.body as { privateKey: string; publicKey: string }
    expect(privateKey).toContain('BEGIN OPENSSH PRIVATE KEY')
    expect(publicKey).toMatch(/^ssh-ed25519 /)
    expect(((await call({ method: 'POST', body: {} }))!.body as { privateKey: string }).privateKey).not.toBe(privateKey)
  })

  it('is only a POST, and not for a page from another site', async () => {
    expect(await call({ method: 'GET' })).toBeNull() // so it answers 404 and a prefetch cannot make keys
    const result = await call({ method: 'POST', body: {}, host: 'localhost:5173', origin: 'https://evil.example' })
    expect(result?.status).toBe(403)
    expect(JSON.stringify(result?.body)).not.toContain('PRIVATE KEY')
  })
})
