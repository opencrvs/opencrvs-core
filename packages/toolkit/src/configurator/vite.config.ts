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
import react from '@vitejs/plugin-react'
import { parse } from 'yaml'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import { GitHubSession, middleware } from './server/plugin.ts'
import { yamlForms } from './yamlForms.ts'

// Builds the page that `opencrvs configurator init` serves, into dist/configurator-assets/ui (see build.sh).
// `vite --config src/configurator/vite.config.ts` runs it as a dev server with the same /api, working on the
// repository it is started in.

// Serves the local API in `vite` and `vite preview`. Both bind to localhost by default.
function environmentsApi(options: Omit<Parameters<typeof middleware>[0], 'github'> & { githubApiUrl?: string }): Plugin {
  const full = { ...options, github: new GitHubSession({ baseUrl: options.githubApiUrl }) }
  return {
    name: 'environments-api',
    configureServer: (server) => void server.middlewares.use(middleware(full)),
    configurePreviewServer: (server) => void server.middlewares.use(middleware(full))
  }
}

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  build: {
    outDir: fileURLToPath(new URL('../../dist/configurator-assets/ui', import.meta.url)),
    emptyOutDir: true
  },
  plugins: [
    react(),
    yamlForms(),
    environmentsApi({
      // Set ENVIRONMENTS_DIR to use another folder for the environments.
      environmentsDir: process.env.ENVIRONMENTS_DIR ?? `${process.cwd()}/environments`,
      projectDir: process.cwd(),
      // Defaults to https://api.github.com; set GITHUB_API_URL to point at another host (for example the fake in scripts/fake-github.ts).
      githubApiUrl: process.env.GITHUB_API_URL,
      // What is needed to render the environment files (read once at start-up).
      files: {
        bindings: parse(readFileSync(new URL('./forms/bindings.yml', import.meta.url), 'utf8')),
        templatesDir: fileURLToPath(new URL('./templates', import.meta.url))
      }
    })
  ]
})
