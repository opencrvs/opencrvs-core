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
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'fs'
import { tmpdir } from 'os'
import path from 'path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  addE2ETests,
  pointsIntoE2EDir,
  withE2EPackageEntries
} from './add-e2e-tests'

const TEMPLATE_DIR = path.resolve(
  __dirname,
  '../../../../countryconfig-template'
)

const PLAYWRIGHT_CONFIG_FILE = 'playwright.config.ts'

// Farajaland v2.0: core's e2e suite was removed, its Playwright config was not
const V2_0_PLAYWRIGHT_CONFIG = `
import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './e2e/testcases',
  retries: 3
})
`

describe('pointsIntoE2EDir', () => {
  it.each(['./e2e/testcases', 'e2e', './e2e'])('matches %s', (testDir) => {
    expect(pointsIntoE2EDir(`testDir: '${testDir}',`)).toBe(true)
  })

  it.each(['./tests', './e2e-legacy'])('does not match %s', (testDir) => {
    expect(pointsIntoE2EDir(`testDir: "${testDir}",`)).toBe(false)
  })

  it('does not match a config without testDir', () => {
    expect(pointsIntoE2EDir('export default defineConfig({})')).toBe(false)
  })
})

describe('withE2EPackageEntries', () => {
  const template = {
    scripts: { e2e: 'playwright test', 'e2e:ui': 'playwright test --ui' },
    devDependencies: { '@playwright/test': '1.61.1' }
  }

  it('adds the scripts and the Playwright dependency', () => {
    expect(
      withE2EPackageEntries(
        { scripts: { test: 'vitest' }, devDependencies: { vitest: '^4' } },
        template
      )
    ).toEqual({
      scripts: {
        test: 'vitest',
        e2e: 'playwright test',
        'e2e:ui': 'playwright test --ui'
      },
      devDependencies: { vitest: '^4', '@playwright/test': '1.61.1' }
    })
  })

  it('keeps existing scripts and Playwright versions', () => {
    const packageJson = {
      scripts: { e2e: 'yarn playwright test --ui' },
      devDependencies: { '@playwright/test': '^1.48.0' }
    }

    expect(withE2EPackageEntries(packageJson, template)).toEqual({
      scripts: {
        e2e: 'yarn playwright test --ui',
        'e2e:ui': 'playwright test --ui'
      },
      devDependencies: { '@playwright/test': '^1.48.0' }
    })
  })
})

describe('addE2ETests', () => {
  let cwd: string

  const read = (file: string) => readFileSync(path.join(cwd, file), 'utf8')
  const template = (file: string) =>
    readFileSync(path.join(TEMPLATE_DIR, file), 'utf8')
  const write = (file: string, contents: string) => {
    mkdirSync(path.dirname(path.join(cwd, file)), { recursive: true })
    writeFileSync(path.join(cwd, file), contents)
  }

  beforeEach(() => {
    cwd = mkdtempSync(path.join(tmpdir(), 'add-e2e-tests-'))
    vi.spyOn(console, 'log').mockImplementation(() => undefined)
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    write(
      'package.json',
      JSON.stringify({ scripts: { test: 'vitest' } }, null, 2) + '\n'
    )
  })

  afterEach(() => {
    rmSync(cwd, { recursive: true, force: true })
    vi.restoreAllMocks()
  })

  it('adds the sample suite to a v2.0 country config', () => {
    write(PLAYWRIGHT_CONFIG_FILE, V2_0_PLAYWRIGHT_CONFIG)
    write('.gitignore', 'node_modules\n')

    expect(addE2ETests(cwd, TEMPLATE_DIR)).toBe(true)

    expect(read('e2e/login.e2e.ts')).toBe(template('e2e/login.e2e.ts'))
    expect(read('e2e/constants.ts')).toBe(template('e2e/constants.ts'))
    expect(read(PLAYWRIGHT_CONFIG_FILE)).toBe(template(PLAYWRIGHT_CONFIG_FILE))
    expect(JSON.parse(read('package.json'))).toMatchObject({
      scripts: { test: 'vitest', e2e: 'playwright test' },
      devDependencies: { '@playwright/test': expect.any(String) }
    })
    expect(read('.gitignore')).toBe(
      'node_modules\nplaywright-report\ntest-results\n'
    )
  })

  it('leaves a Playwright config running other tests in place and warns', () => {
    const config = `export default { testDir: './tests' }\n`
    write(PLAYWRIGHT_CONFIG_FILE, config)

    addE2ETests(cwd, TEMPLATE_DIR)

    expect(read(PLAYWRIGHT_CONFIG_FILE)).toBe(config)
    expect(existsSync(path.join(cwd, 'e2e/login.e2e.ts'))).toBe(true)
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining(PLAYWRIGHT_CONFIG_FILE)
    )
  })

  it('leaves an existing e2e/ directory and everything else alone', () => {
    write('e2e/my-country.e2e.ts', '// country suite\n')
    write(PLAYWRIGHT_CONFIG_FILE, V2_0_PLAYWRIGHT_CONFIG)
    const packageJson = read('package.json')

    expect(addE2ETests(cwd, TEMPLATE_DIR)).toBe(false)

    expect(existsSync(path.join(cwd, 'e2e/login.e2e.ts'))).toBe(false)
    expect(read(PLAYWRIGHT_CONFIG_FILE)).toBe(V2_0_PLAYWRIGHT_CONFIG)
    expect(read('package.json')).toBe(packageJson)
    expect(existsSync(path.join(cwd, '.gitignore'))).toBe(false)
  })

  it('changes nothing when run a second time', () => {
    addE2ETests(cwd, TEMPLATE_DIR)
    const packageJson = read('package.json')

    expect(addE2ETests(cwd, TEMPLATE_DIR)).toBe(false)
    expect(read('package.json')).toBe(packageJson)
  })
})
