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
import type { IncomingMessage, ServerResponse } from 'node:http'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Bindings } from '../ui/bindings/bindings.ts'
import { fileTargets, listEnvironmentNames, parseGitRemote, readEnvironmentFiles, readGitRemote, SAFE_NAME } from './environments.ts'
import { renderEnvironmentFiles, writeEnvironmentFiles } from './files.ts'
import { GitHubClient, GitHubError, type ConnectResult, type WriteTarget } from './github.ts'
import { generateSSHKeyPair } from './sshKeys.ts'

// The GitHub connection of this dev server. The token is kept here, in memory, for as long as the
// server runs or until disconnect; it is never written anywhere or sent back to the page.
export class GitHubSession {
  private client: GitHubClient | undefined
  private readonly baseUrl: string | undefined
  private readonly fetchImpl: typeof fetch | undefined

  constructor(options: { baseUrl?: string; fetch?: typeof fetch } = {}) {
    this.baseUrl = options.baseUrl
    this.fetchImpl = options.fetch
  }

  async connect(token: string, owner: string, repo: string): Promise<ConnectResult> {
    const client = new GitHubClient({ token, owner, repo, baseUrl: this.baseUrl, fetch: this.fetchImpl })
    const result = await client.connect()
    this.client = result.ok ? client : undefined
    return result
  }

  disconnect() {
    this.client = undefined
  }

  get current() {
    return this.client
  }
}

interface ApiOptions {
  // Folder that holds the environments, and the folder whose git remote names the repository.
  environmentsDir: string
  projectDir: string
  github: GitHubSession
  // What is needed to render the environment files; without it those routes answer 501.
  files?: { bindings: Bindings; templatesDir: string }
  // Test hook: overrides the `git remote get-url origin` lookup.
  gitRemote?: () => Promise<string | undefined>
}

export interface ApiRequest {
  method?: string
  body?: unknown
  // The request's Host and Origin headers, for the cross-site checks.
  host?: string
  origin?: string
}

interface ApiResult {
  status: number
  body: unknown
}

const LOCAL_HOST = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/
const NAME = /^[A-Za-z0-9_.-]{1,100}$/
// GitHub variable and secret names: letters, digits and underscores, not starting with a digit.
const VARIABLE_NAME = /^[A-Za-z_][A-Za-z0-9_]{0,99}$/
// GitHub's limit for a secret is 48 KB.
const MAX_VALUE = 49_152

const fail = (status: number, error: string): ApiResult => ({ status, body: { error } })

// This server can act with the user's GitHub token, so a page from another site must not be able
// to use it: the Host must be local (against DNS rebinding) and a browser-supplied Origin must be
// this same server. Writes also need JSON, which makes browsers send a preflight first.
function crossSiteProblem(request: ApiRequest): string | undefined {
  const host = request.host ?? 'localhost'
  if (!LOCAL_HOST.test(host)) return 'Only local requests are accepted.'
  if (request.origin !== undefined && request.origin !== `http://${host}`) return 'Requests from other sites are not accepted.'
  return undefined
}

const mapGitHubError = (error: unknown): ApiResult =>
  error instanceof GitHubError ? fail(error.status === 401 ? 401 : 502, error.message) : fail(502, 'Could not reach GitHub.')

// One write per request, so the page can show progress and retry a single item. Answers say
// whether it worked and never repeat the value.
async function githubWrite(path: string, body: unknown, session: GitHubSession): Promise<ApiResult> {
  const client = session.current
  if (!client) return fail(409, 'Not connected to GitHub.')
  const input = (body ?? {}) as Record<string, unknown>

  try {
    if (path === '/api/github/environment') {
      if (typeof input.name !== 'string' || !NAME.test(input.name)) return fail(400, 'Invalid environment name.')
      await client.createEnvironment(input.name)
      return { status: 200, body: { ok: true } }
    }

    const { scope, environment, name, value } = input
    if (scope !== 'environment' && scope !== 'repository') return fail(400, 'Scope must be environment or repository.')
    if (scope === 'environment' && (typeof environment !== 'string' || !NAME.test(environment))) return fail(400, 'Invalid environment name.')
    if (typeof name !== 'string' || !VARIABLE_NAME.test(name)) return fail(400, 'Invalid variable or secret name.')
    if (typeof value !== 'string' || value === '' || value.length > MAX_VALUE) return fail(400, 'The value must be 1 to 49152 characters.')
    const target: WriteTarget = { scope, name, value, ...(scope === 'environment' ? { environment: environment as string } : {}) }

    if (path === '/api/github/variable') await client.putVariable(target, typeof input.exists === 'boolean' ? input.exists : undefined)
    else await client.putSecret(target)
    return { status: 200, body: { ok: true } }
  } catch (error) {
    return mapGitHubError(error)
  }
}

async function githubRoute(path: string, method: string, body: unknown, options: ApiOptions): Promise<ApiResult | null> {
  const session = options.github

  if (path === '/api/github/status' && method === 'GET') {
    const client = session.current
    return { status: 200, body: client ? { connected: true, owner: client.owner, repo: client.repo } : { connected: false } }
  }

  if (path === '/api/github/connect' && method === 'POST') {
    const { token, owner, repo } = (body ?? {}) as Record<string, unknown>
    if (typeof token !== 'string' || !token.trim() || token.length > 500) return fail(400, 'Enter a token.')
    if (typeof owner !== 'string' || !NAME.test(owner) || typeof repo !== 'string' || !NAME.test(repo)) {
      return fail(400, 'Enter the repository owner and name.')
    }
    // The answer never includes the token.
    return { status: 200, body: await session.connect(token.trim(), owner, repo) }
  }

  if (path === '/api/github/disconnect' && method === 'POST') {
    session.disconnect()
    return { status: 200, body: { ok: true } }
  }

  const writeRoutes = ['/api/github/environment', '/api/github/variable', '/api/github/secret']
  if (method === 'POST' && writeRoutes.includes(path)) return githubWrite(path, body, session)

  const reads = ['/api/github/environments', '/api/github/repository']
  const environment = path.match(/^\/api\/github\/environments\/([^/]+)$/)
  if (method === 'GET' && (reads.includes(path) || environment)) {
    const client = session.current
    if (!client) return fail(409, 'Not connected to GitHub.')
    try {
      if (path === '/api/github/environments') return { status: 200, body: { names: await client.listEnvironments() } }
      if (path === '/api/github/repository') return { status: 200, body: await client.readRepository() }
      return { status: 200, body: await client.readEnvironment(decodeURIComponent(environment![1]!)) }
    } catch (error) {
      return mapGitHubError(error)
    }
  }
  return null
}

// Rendering shows what would be written; writing renders again on the server, so the page can
// never choose what ends up in a file or where. Only answers on screen are sent, never secrets.
async function filesRoute(name: string, action: string, method: string, body: unknown, options: ApiOptions): Promise<ApiResult | null> {
  const wanted = action === 'render' ? 'POST' : 'PUT'
  if (method !== wanted) return null
  if (!options.files) return fail(501, 'File rendering is not configured.')
  if (!SAFE_NAME.test(name)) return fail(400, 'Invalid environment name.')
  const values = (body as { values?: unknown } | undefined)?.values
  if (!values || typeof values !== 'object' || Array.isArray(values)) return fail(400, 'Send the answers as { values }.')

  let rendered: Record<string, string>
  try {
    const { bindings, templatesDir } = options.files
    rendered = renderEnvironmentFiles({
      environment: name,
      values: values as Record<string, unknown>,
      bindings,
      readTemplate: (template) => readFileSync(join(templatesDir, template), 'utf8')
    })
  } catch {
    return fail(500, 'Could not render the files.')
  }

  const flat = options.files.bindings.flat
  if (action === 'render') {
    const existing = (await readEnvironmentFiles(options.environmentsDir, name, flat)) ?? {}
    const { layout, targets } = await fileTargets(options.environmentsDir, name, flat)
    return {
      status: 200,
      body: {
        layout,
        // `target` is where the file would be written, or null when the layout has no place for it.
        files: Object.entries(rendered).map(([path, text]) => ({
          path,
          text,
          existing: targets[path] === null ? null : (existing[path] ?? null),
          target: targets[path] ?? null
        }))
      }
    }
  }
  try {
    return { status: 200, body: { written: await writeEnvironmentFiles(options.environmentsDir, name, rendered, flat) } }
  } catch (error) {
    return fail(409, error instanceof Error ? error.message : 'Could not write the files.')
  }
}

// The whole API as a function of the request, so it can be tested without a server.
export async function handleApiRequest(
  path: string,
  options: ApiOptions,
  request: ApiRequest = {}
): Promise<ApiResult | null> {
  const method = request.method ?? 'GET'
  const problem = crossSiteProblem(request)
  if (problem) return fail(403, problem)

  if (path.startsWith('/api/github/')) return githubRoute(path, method, request.body, options)

  // A new SSH key pair for the backup server. A POST, so it is never cached and a page from another site
  // cannot trigger it; it is handed to the page once and stored nowhere here.
  if (path === '/api/ssh-keypair' && method === 'POST') return { status: 200, body: generateSSHKeyPair() }

  const fileRoute = path.match(/^\/api\/environments\/([^/]+)\/(render|files)$/)
  if (fileRoute) return filesRoute(decodeURIComponent(fileRoute[1]!), fileRoute[2]!, method, request.body, options)
  if (method !== 'GET') return null

  if (path === '/api/context') {
    const remote = await (options.gitRemote ?? (() => readGitRemote(options.projectDir)))()
    return { status: 200, body: { repository: remote ? parseGitRemote(remote) : null } }
  }

  if (path === '/api/environments') {
    return { status: 200, body: await listEnvironmentNames(options.environmentsDir) }
  }

  const match = path.match(/^\/api\/environments\/([^/]+)$/)
  if (match) {
    const files = await readEnvironmentFiles(options.environmentsDir, decodeURIComponent(match[1]!))
    return files ? { status: 200, body: { files } } : fail(404, 'Unknown environment')
  }

  return null
}

async function readJson(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of request) {
    size += (chunk as Buffer).length
    if (size > 300_000) throw new Error('too large')
    chunks.push(chunk as Buffer)
  }
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : undefined
}

export function middleware(options: ApiOptions) {
  return async (request: IncomingMessage, response: ServerResponse, next: () => void) => {
    // Everything under /api/ is ours; the rest belongs to the page.
    const path = new URL(request.url ?? '/', 'http://localhost').pathname
    if (!path.startsWith('/api/')) return next()

    let result: ApiResult
    try {
      const method = request.method ?? 'GET'
      const json = (request.headers['content-type'] ?? '').startsWith('application/json')
      const hasBody = method === 'POST' || method === 'PUT'
      if (hasBody && !json) {
        result = fail(415, 'Send JSON.')
      } else {
        result =
          (await handleApiRequest(path, options, {
            method,
            body: hasBody ? await readJson(request) : undefined,
            host: request.headers.host,
            origin: request.headers.origin
          })) ?? fail(404, 'Unknown API path')
      }
    } catch {
      result = fail(400, 'Bad request.')
    }
    response.statusCode = result.status
    response.setHeader('Content-Type', 'application/json')
    response.setHeader('Cache-Control', 'no-store')
    response.end(JSON.stringify(result.body))
  }
}
