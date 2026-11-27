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
import { createServer, type Server, type ServerResponse } from 'node:http'
import { readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize, resolve } from 'node:path'
import { parse } from 'yaml'
import { GitHubSession, middleware } from './plugin.ts'

// Serves the built page and the local /api, without Vite.
// In a container use host 0.0.0.0 and publish the port on the host's loopback only
// (-p 127.0.0.1:4173:4173); requests whose Host is not local are refused anyway.

export interface ServerOptions {
  /** The infrastructure repository: its environments/ folder holds the environments and its git remote names the GitHub repository. */
  projectDir: string
  /** Where the built page (ui/), forms/bindings.yml and templates/ are. */
  assetsDir: string
  port?: number
  host?: string
}

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.json': 'application/json'
}

async function serveStatic(staticDir: string, urlPath: string, response: ServerResponse) {
  const relative = normalize(decodeURIComponent(urlPath)).replace(/^([/\\])+/, '')
  let file = join(staticDir, relative)
  if (!file.startsWith(staticDir)) file = join(staticDir, 'index.html')
  let body: Buffer
  try {
    body = await readFile(file)
  } catch {
    // Not a file: the single page answers every other path.
    file = join(staticDir, 'index.html')
    body = await readFile(file)
  }
  response.setHeader('Content-Type', TYPES[extname(file)] ?? 'application/octet-stream')
  response.end(body)
}

/** Starts listening and resolves with the server once it does. */
export function startServer(options: ServerOptions): Promise<Server> {
  const projectDir = resolve(options.projectDir)
  const assetsDir = resolve(options.assetsDir)
  const staticDir = join(assetsDir, 'ui')

  const api = middleware({
    environmentsDir: process.env.ENVIRONMENTS_DIR ?? join(projectDir, 'environments'),
    projectDir,
    github: new GitHubSession({ baseUrl: process.env.GITHUB_API_URL }),
    files: {
      bindings: parse(readFileSync(join(assetsDir, 'forms', 'bindings.yml'), 'utf8')),
      templatesDir: join(assetsDir, 'templates')
    }
  })

  const server = createServer((request, response) => {
    api(request, response, () => {
      const path = new URL(request.url ?? '/', 'http://localhost').pathname
      serveStatic(staticDir, path, response).catch(() => {
        response.statusCode = 500
        response.end('The page is not built. Build the toolkit first.')
      })
    }).catch(() => {
      response.statusCode = 500
      response.end()
    })
  })

  return new Promise((resolveListening, reject) => {
    server.once('error', reject)
    server.listen(options.port ?? 4173, options.host ?? '127.0.0.1', () => resolveListening(server))
  })
}
