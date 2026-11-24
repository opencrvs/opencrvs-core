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
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import type { Plugin } from 'vite'
import type { TestUserTokens } from './sign-test-tokens'

// Loaded from vite.config.ts as ESM, where `require` is not defined globally.
const require = createRequire(import.meta.url)

const signerPath = fileURLToPath(
  new URL('./sign-test-tokens.ts', import.meta.url)
)

/**
 * Signs the test user tokens in Node, and returns them with the files they
 * were built from.
 *
 * The signer is bundled to CJS because Node cannot load the ESM build of
 * `@opencrvs/commons/client` (extensionless imports); the CJS root entry
 * exports the same symbols.
 */
async function signTestTokens() {
  const signerRequire = createRequire(signerPath)
  /*
   * `packages: 'external'` leaves commons to Node's require cache, which
   * outlives a commons rebuild. Evict it so each call signs with the current
   * build, and report it as a source so a rebuild triggers a reload.
   */
  const commonsBuildDir = dirname(require.resolve('@opencrvs/commons'))
  const findCachedCommonsFiles = () =>
    Object.keys(signerRequire.cache).filter((file) =>
      file.startsWith(commonsBuildDir)
    )
  findCachedCommonsFiles().forEach((file) => {
    delete signerRequire.cache[file]
  })

  const { build } = await import('esbuild')
  const result = await build({
    entryPoints: [signerPath],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    packages: 'external',
    alias: { '@opencrvs/commons/client': '@opencrvs/commons' },
    // The signer's modules share its directory, so its URL resolves their relative paths.
    define: {
      'import.meta.url': JSON.stringify(pathToFileURL(signerPath).href)
    },
    metafile: true,
    write: false
  })

  const signer: { exports: typeof import('./sign-test-tokens') } = {
    exports: {} as typeof import('./sign-test-tokens')
  }
  new Function(
    'require',
    'module',
    'exports',
    '__filename',
    '__dirname',
    result.outputFiles[0].text
  )(signerRequire, signer, signer.exports, signerPath, dirname(signerPath))

  const tokens: TestUserTokens = signer.exports.signTestUserTokens()
  const sourceFiles = Object.keys(result.metafile.inputs)
    .map((file) => resolve(file))
    .concat(findCachedCommonsFiles())
  return { tokens, sourceFiles }
}

/**
 * Serves `virtual:test-tokens`: test user JWTs signed in Node, so that test
 * data used by Storybook in the browser needs no `jsonwebtoken`.
 * Only test and story code imports it, so app builds never load it.
 */
export function testTokensPlugin(): Plugin {
  const virtualId = 'virtual:test-tokens'
  const resolvedVirtualId = '\0' + virtualId
  /*
   * Files the tokens are built from. `addWatchFile` in `load` only makes the
   * dev server watch them; `hotUpdate` below is what reloads the tokens.
   */
  let sourceFiles = new Set<string>()
  return {
    name: 'test-tokens',
    resolveId(source) {
      if (source === virtualId) return resolvedVirtualId
    },
    hotUpdate({ file, modules }) {
      if (!sourceFiles.has(file)) return
      const tokensModule =
        this.environment.moduleGraph.getModuleById(resolvedVirtualId)
      return tokensModule ? [...modules, tokensModule] : modules
    },
    async load(id) {
      if (id !== resolvedVirtualId) return
      const signed = await signTestTokens()
      sourceFiles = new Set(signed.sourceFiles)
      sourceFiles.forEach((file) => this.addWatchFile(file))
      return `export default ${JSON.stringify(signed.tokens)}`
    }
  }
}
