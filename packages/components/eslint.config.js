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
const baseConfig = require('../../eslint.config.js')

function importsFromOtherFolders(levelsBelowSrc) {
  const up = '\\.\\./'.repeat(levelsBelowSrc)
  return [
    {
      regex: `^@opencrvs/components(/.*)?$`,
      message:
        'Inside the package, import the folder relatively. Going through the package entry point creates import cycles.'
    },
    {
      regex: `^${'\\.\\./'.repeat(levelsBelowSrc - 1)}\\.\\.(/index)?/?$`,
      message:
        'This is the package root index. It re-exports everything, so importing it creates cycles. Import the folder by name.'
    },
    {
      regex: `^${up}[^./][^/]*/.+`,
      message:
        "Import another folder through its index.ts, e.g. '../Button', not a file inside it. Export what you need from that index."
    }
  ]
}

const levels = [1, 2, 3, 4]

module.exports = [
  { ignores: ['eslint*.js', 'check-public-surface.mjs', 'no-font-styles.js'] },
  ...baseConfig,
  {
    rules: {
      // Folders import each other through '../<Folder>'; the rules below say which
      // of those are allowed.
      'import/no-relative-parent-imports': 'off'
    }
  },
  ...levels.map((levelsBelowSrc) => ({
    files: [`src/${'*/'.repeat(levelsBelowSrc)}*.{ts,tsx}`],
    ignores: ['**/*.stories.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: importsFromOtherFolders(levelsBelowSrc) }
      ]
    }
  }))
]
