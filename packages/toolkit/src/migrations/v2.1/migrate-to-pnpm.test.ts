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
import { rewritePackageJson, rewriteYarnCommand } from './migrate-to-pnpm'

describe('rewriteYarnCommand', () => {
  it.each([
    ['yarn start', 'pnpm start'],
    [
      'yarn setup-analytics && yarn setup-reference-data && cross-env NODE_ENV=development nodemon',
      'pnpm setup-analytics && pnpm setup-reference-data && cross-env NODE_ENV=development nodemon'
    ],
    [
      'NODE_OPTIONS=--dns-result-order=ipv4first yarn playwright test --ui',
      'NODE_OPTIONS=--dns-result-order=ipv4first pnpm playwright test --ui'
    ],
    ["sh -c 'yarn extract:translations'", "sh -c 'pnpm extract:translations'"],
    ['yarn', 'pnpm install'],
    ['yarn --force', 'pnpm install --force'],
    [
      'yarn --frozen-lockfile && yarn build',
      'pnpm install --frozen-lockfile && pnpm build'
    ],
    ['yarn install --frozen-lockfile', 'pnpm install --frozen-lockfile']
  ])('%s -> %s', (command, expected) => {
    expect(rewriteYarnCommand(command)).toBe(expected)
  })

  it.each([
    'bash infrastructure/clear-all-data-dev.sh',
    'eslint -c .eslintrc.js',
    'cp yarn.lock backup/',
    'node ./scripts/yarn-audit.js'
  ])('leaves %s alone', (command) => {
    expect(rewriteYarnCommand(command)).toBe(command)
  })

  it.each([
    'yarn workspace foo build',
    'yarn global add x',
    'yarn --cwd e2e test'
  ])('refuses %s', (command) => {
    expect(rewriteYarnCommand(command)).toBeUndefined()
  })
})

describe('rewritePackageJson', () => {
  it('rewrites scripts and lint-staged commands, reporting what it could not', () => {
    const packageJson = {
      scripts: {
        dev: 'yarn start',
        lint: 'eslint .',
        other: 'yarn workspace foo build'
      },
      'lint-staged': {
        'src/**/*.ts': ['eslint --fix', 'git add'],
        'src/translations/*.csv': ['yarn sort-translations', 'git add'],
        '*.md': 'yarn prettier --write'
      }
    }

    const result = rewritePackageJson(packageJson)

    expect(packageJson).toEqual({
      scripts: {
        dev: 'pnpm start',
        lint: 'eslint .',
        other: 'yarn workspace foo build'
      },
      'lint-staged': {
        'src/**/*.ts': ['eslint --fix', 'git add'],
        'src/translations/*.csv': ['pnpm sort-translations', 'git add'],
        '*.md': 'pnpm prettier --write'
      }
    })
    expect(result).toEqual({
      changed: [
        'scripts.dev',
        'lint-staged["src/translations/*.csv"]',
        'lint-staged["*.md"]'
      ],
      unportable: ['scripts.other']
    })
  })
})
