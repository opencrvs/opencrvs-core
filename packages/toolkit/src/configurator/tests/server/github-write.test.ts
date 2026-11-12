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
import sodium from 'libsodium-wrappers'
import { describe, expect, it } from 'vitest'
import { createFakeGitHub, type FakeGitHubState } from '../../server/fakeGitHub'
import { GitHubClient } from '../../server/github'
import { sealSecret } from '../../server/seal'

const TOKEN = 'ghp_super_secret_token_value'
const SECRET_VALUE = 'correct horse "battery" staple $HOME ünïcödé 🔑'

function setup(overrides: Partial<FakeGitHubState['repos'][string]> = {}, token = TOKEN) {
  const fake = createFakeGitHub({
    tokens: { [TOKEN]: { login: 'octocat', scopes: ['repo', 'workflow'] } },
    repos: {
      'acme/infra': {
        permissions: { admin: true, push: true, pull: true },
        repository: { variables: { REGISTRY_HOST: 'docker.io' }, secretNames: ['REGISTRY_TOKEN'] },
        environments: { qa: { variables: { DOMAIN: 'old.example.org' }, secretNames: ['SMTP_HOST'] } },
        ...overrides
      }
    }
  })
  const github = new GitHubClient({ token, owner: 'acme', repo: 'infra', baseUrl: 'https://api.github.test', fetch: fake.fetch })
  return { fake, github, repo: fake.state.repos['acme/infra']! }
}

describe('sealSecret', () => {
  it('produces a sealed box that only the key pair can open', async () => {
    await sodium.ready
    const pair = sodium.crypto_box_keypair()
    const sealed = await sealSecret(sodium.to_base64(pair.publicKey, sodium.base64_variants.ORIGINAL), SECRET_VALUE)
    expect(sealed).not.toContain('battery')
    const opened = sodium.crypto_box_seal_open(sodium.from_base64(sealed, sodium.base64_variants.ORIGINAL), pair.publicKey, pair.privateKey)
    expect(sodium.to_string(opened)).toBe(SECRET_VALUE)
  })

  it('gives a different result each time, even for the same value', async () => {
    await sodium.ready
    const key = sodium.to_base64(sodium.crypto_box_keypair().publicKey, sodium.base64_variants.ORIGINAL)
    expect(await sealSecret(key, 'same')).not.toBe(await sealSecret(key, 'same'))
  })
})

describe('createEnvironment', () => {
  it('creates a missing environment and leaves an existing one alone', async () => {
    const { github, repo } = setup()
    await github.createEnvironment('staging')
    expect(Object.keys(repo.environments)).toEqual(['qa', 'staging'])
    repo.environments.qa!.variables.KEEP = 'me'
    await github.createEnvironment('qa')
    expect(repo.environments.qa!.variables.KEEP).toBe('me')
  })

  it('needs admin access', async () => {
    const { github } = setup({ permissions: { admin: false, push: true, pull: true } })
    await expect(github.createEnvironment('staging')).rejects.toThrow('admin access')
  })
})

describe('putVariable', () => {
  it('creates a new variable, in an environment or in the repository', async () => {
    const { github, repo } = setup()
    await github.putVariable({ scope: 'environment', environment: 'qa', name: 'KUBE_API_HOST', value: '10.0.0.1' })
    await github.putVariable({ scope: 'repository', name: 'NEW_REPO_VAR', value: 'x' })
    expect(repo.environments.qa!.variables.KUBE_API_HOST).toBe('10.0.0.1')
    expect(repo.repository.variables.NEW_REPO_VAR).toBe('x')
  })

  it('updates an existing one', async () => {
    const { github, repo, fake } = setup()
    await github.putVariable({ scope: 'environment', environment: 'qa', name: 'DOMAIN', value: 'new.example.org' }, true)
    expect(repo.environments.qa!.variables.DOMAIN).toBe('new.example.org')
    expect(fake.log.map((entry) => entry.method)).toEqual(['PATCH'])
  })

  it('recovers when the plan was wrong about whether it exists', async () => {
    const { github, repo, fake } = setup()
    await github.putVariable({ scope: 'environment', environment: 'qa', name: 'DOMAIN', value: 'a.example.org' }) // exists, said "new"
    await github.putVariable({ scope: 'environment', environment: 'qa', name: 'FRESH', value: 'b' }, true) // missing, said "exists"
    expect(repo.environments.qa!.variables).toMatchObject({ DOMAIN: 'a.example.org', FRESH: 'b' })
    expect(fake.log.map((entry) => entry.method)).toEqual(['POST', 'PATCH', 'PATCH', 'POST'])
  })

  it('reports an environment that does not exist, and a refusal', async () => {
    await expect(setup().github.putVariable({ scope: 'environment', environment: 'nope', name: 'A', value: 'b' })).rejects.toThrow('“nope” does not exist')
    const readonly = setup({ permissions: { admin: false, push: false, pull: true } })
    await expect(readonly.github.putVariable({ scope: 'repository', name: 'A', value: 'b' })).rejects.toThrow('not allowed to change')
  })
})

describe('putSecret', () => {
  it('sends the secret encrypted, and GitHub can decrypt exactly what was entered', async () => {
    const { github, repo, fake } = setup()
    await github.putSecret({ scope: 'environment', environment: 'qa', name: 'SMTP_PASSWORD', value: SECRET_VALUE })
    expect(repo.writtenSecrets?.['environment/qa:SMTP_PASSWORD']).toBe(SECRET_VALUE)
    expect(repo.environments.qa!.secretNames).toContain('SMTP_PASSWORD')
    // no request ever carried the plain value
    expect(JSON.stringify(fake.log)).not.toContain('battery')
  })

  it('says the environment is missing, not the repository', async () => {
    await expect(setup().github.putSecret({ scope: 'environment', environment: 'nope', name: 'A', value: 'b' })).rejects.toThrow('does not exist yet')
    await expect(setup().github.putSecret({ scope: 'repository', name: 'A', value: 'b' })).resolves.toBeUndefined()
  })

  it('uses the key of the right scope, for the repository and for an environment', async () => {
    const { github, repo } = setup()
    await github.putSecret({ scope: 'repository', name: 'REGISTRY_TOKEN', value: 'repo-secret' })
    await github.putSecret({ scope: 'environment', environment: 'qa', name: 'ENCRYPTION_KEY', value: 'env-secret' })
    expect(repo.writtenSecrets).toEqual({ 'repository:REGISTRY_TOKEN': 'repo-secret', 'environment/qa:ENCRYPTION_KEY': 'env-secret' })
  })

  it('replaces an existing secret without listing it twice', async () => {
    const { github, repo } = setup()
    await github.putSecret({ scope: 'environment', environment: 'qa', name: 'SMTP_HOST', value: 'one' })
    await github.putSecret({ scope: 'environment', environment: 'qa', name: 'SMTP_HOST', value: 'two' })
    expect(repo.environments.qa!.secretNames.filter((name) => name === 'SMTP_HOST')).toHaveLength(1)
    expect(repo.writtenSecrets?.['environment/qa:SMTP_HOST']).toBe('two')
  })

  it('never lets the secret or the token into an error message', async () => {
    const readonly = setup({ permissions: { admin: false, push: false, pull: true } })
    const failures = await Promise.all([
      readonly.github.putSecret({ scope: 'repository', name: 'A', value: SECRET_VALUE }).catch((error: Error) => error.message),
      setup().github.putSecret({ scope: 'environment', environment: 'nope', name: 'A', value: SECRET_VALUE }).catch((error: Error) => error.message),
      setup({}, 'bad-token').github.putSecret({ scope: 'repository', name: 'A', value: SECRET_VALUE }).catch((error: Error) => error.message)
    ])
    for (const message of failures) {
      expect(message).toEqual(expect.any(String))
      expect(message).not.toContain('battery')
      expect(message).not.toContain(TOKEN)
    }
  })

  it('does not put the secret or the token in a URL', async () => {
    const { github, fake } = setup()
    await github.putSecret({ scope: 'environment', environment: 'qa', name: 'SMTP_PASSWORD', value: SECRET_VALUE })
    for (const entry of fake.log) {
      expect(entry.path).not.toContain('battery')
      expect(entry.path).not.toContain(TOKEN)
    }
  })
})
