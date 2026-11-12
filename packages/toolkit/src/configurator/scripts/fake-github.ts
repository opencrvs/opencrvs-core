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
// A local stand-in for api.github.com, for trying the app without a real token:
//
//   npm run fake-github                      (terminal 1)
//   npm run preview:fake                     (terminal 2, after npm run build)
//
// then connect with token  ghp_demo  (full access)  or  ghp_readonly  (a classic token without workflow access).
import { createServer } from 'node:http'
import { createFakeGitHub } from '../server/fakeGitHub.ts'

const port = Number(process.env.FAKE_GITHUB_PORT ?? 4599)
const base = `http://localhost:${port}`

const EMAIL = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USERNAME', 'SMTP_PASSWORD', 'SMTP_SECURE', 'SENDER_EMAIL_ADDRESS', 'ALERT_EMAIL']
const GENERATED = ['ENCRYPTION_KEY', 'POSTGRES_PASSWORD', 'KIBANA_PASSWORD', 'S3_ADMIN_SECRET_KEY', 'OPENCRVS_METABASE_ADMIN_PASSWORD']

const repository = process.env.FAKE_GITHUB_REPO ?? 'adskyiproger/poc-installer'
const fake = createFakeGitHub(
  {
    tokens: {
      ghp_demo: { login: 'octocat', scopes: ['repo', 'workflow'] },
      ghp_readonly: { login: 'octocat', scopes: ['repo'] }
    },
    repos: {
      [repository]: {
        permissions: { admin: true, push: true, pull: true },
        repository: { variables: { REGISTRY_HOST: 'ghcr.io' }, secretNames: [] },
        environments: {
          qa: {
            variables: { DOMAIN: 'qa.opencrvs.example', ACTIVATE_USERS: 'true', KUBE_API_HOST: '10.1.0.77', KUBE_WORKER_NODES: '' },
            secretNames: [...EMAIL, ...GENERATED]
          },
          staging: {
            variables: { DOMAIN: 'staging.opencrvs.example', ACTIVATE_USERS: 'false', KUBE_API_HOST: '10.9.0.5', KUBE_WORKER_NODES: '10.9.0.11,10.9.0.12' },
            secretNames: GENERATED
          },
          production: {
            variables: {
              DOMAIN: 'opencrvs.example',
              ACTIVATE_USERS: 'false',
              KUBE_WORKER_NODES: '10.3.0.11,10.3.0.12',
              BACKUP_HOST: '203.0.113.9',
              BACKUP_ENVIRONMENT_MODE: 'differential'
            },
            secretNames: [...EMAIL, ...GENERATED, 'BACKUP_SERVER_USER', 'BACKUP_HOST_PRIVATE_KEY', 'BACKUP_HOST_PUBLIC_KEY', 'BACKUP_ENCRYPTION_PASSPHRASE']
          }
        }
      }
    }
  },
  base
)

createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', base)

  // Demo-only helpers, not part of GitHub's API:
  //   GET  /__fake/state        what the fake holds, with the secrets it decrypted
  //   POST /__fake/permissions  {"admin": false, "push": false} changes what the repository allows
  if (url.pathname === '/__fake/state') {
    response.writeHead(200, { 'content-type': 'application/json' })
    return void response.end(JSON.stringify(fake.state.repos, null, 2))
  }
  if (url.pathname === '/__fake/permissions' && request.method === 'POST') {
    const chunks: Buffer[] = []
    for await (const chunk of request) chunks.push(chunk as Buffer)
    Object.assign(fake.state.repos[repository]!.permissions, JSON.parse(Buffer.concat(chunks).toString('utf8')))
    response.writeHead(200, { 'content-type': 'application/json' })
    return void response.end(JSON.stringify(fake.state.repos[repository]!.permissions))
  }

  const chunks: Buffer[] = []
  for await (const chunk of request) chunks.push(chunk as Buffer)
  const text = Buffer.concat(chunks).toString('utf8')
  const result = fake.handle(
    {
      method: request.method,
      path: url.pathname,
      query: url.searchParams,
      authorization: request.headers.authorization,
      body: text ? JSON.parse(text) : undefined
    },
    base
  )
  response.writeHead(result.status, { 'content-type': 'application/json', ...result.headers })
  response.end(result.status === 204 ? undefined : JSON.stringify(result.body))
}).listen(port, () => console.log(`fake GitHub for ${repository} on ${base}  (tokens: ghp_demo, ghp_readonly)`))
