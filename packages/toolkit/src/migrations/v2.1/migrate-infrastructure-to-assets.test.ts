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
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync
} from 'fs'
import { tmpdir } from 'os'
import path from 'path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  migrateInfrastructureToAssets,
  removeMigrated
} from './migrate-infrastructure-to-assets'
import { listFiles } from './template-files'

const REAL_TEMPLATE_DIR = path.resolve(
  __dirname,
  '../../../../countryconfig-template'
)

const lines = (...values: string[]) => values.join('\n') + '\n'

describe('migrateInfrastructureToAssets', () => {
  let cwd: string
  let templateDir: string
  let bases: Record<string, string>

  const write = (root: string, file: string, contents: string) => {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true })
    writeFileSync(path.join(root, file), contents)
  }
  const local = (file: string, contents: string) =>
    write(cwd, `infrastructure/${file}`, contents)
  const template = (file: string, contents: string) =>
    write(templateDir, `assets/${file}`, contents)
  const asset = (file: string) =>
    readFileSync(path.join(cwd, 'assets', file), 'utf8')
  const hasAsset = (file: string) => existsSync(path.join(cwd, 'assets', file))

  const migrate = () =>
    migrateInfrastructureToAssets(cwd, templateDir, (file) =>
      file in bases ? new TextEncoder().encode(bases[file]) : undefined
    )

  beforeEach(() => {
    cwd = mkdtempSync(path.join(tmpdir(), 'assets-country-'))
    templateDir = mkdtempSync(path.join(tmpdir(), 'assets-template-'))
    bases = {}
  })

  afterEach(() => {
    rmSync(cwd, { recursive: true, force: true })
    rmSync(templateDir, { recursive: true, force: true })
  })

  it('copies files only the template has', () => {
    template('README.md', 'custom assets\n')

    expect(migrate().outcomes).toEqual({ 'README.md': 'copied' })
    expect(asset('README.md')).toBe('custom assets\n')
  })

  it('takes the template version of a file the country never changed', () => {
    bases['postgres/setup-analytics.sh'] = 'v2.0\n'
    local('postgres/setup-analytics.sh', 'v2.0\n')
    template('postgres/setup-analytics.sh', 'v2.1\n')

    const { outcomes, migrated } = migrate()

    expect(outcomes['postgres/setup-analytics.sh']).toBe('copied')
    expect(asset('postgres/setup-analytics.sh')).toBe('v2.1\n')
    expect(migrated).toEqual(['postgres/setup-analytics.sh'])
  })

  it("keeps the country's version when only the country changed it", () => {
    bases['metabase/run.sh'] = 'v2.0\n'
    local('metabase/run.sh', 'country\n')
    template('metabase/run.sh', 'v2.0\n')

    expect(migrate().outcomes['metabase/run.sh']).toBe('kept')
    expect(asset('metabase/run.sh')).toBe('country\n')
  })

  it('merges changes made on both sides to different lines', () => {
    bases['postgres/setup.sh'] = lines('a', 'b', 'c', 'd', 'e')
    local('postgres/setup.sh', lines('a', 'country', 'c', 'd', 'e'))
    template('postgres/setup.sh', lines('a', 'b', 'c', 'd', 'template'))

    expect(migrate().outcomes['postgres/setup.sh']).toBe('merged')
    expect(asset('postgres/setup.sh')).toBe(
      lines('a', 'country', 'c', 'd', 'template')
    )
  })

  it('leaves conflict markers where both sides changed the same line', () => {
    bases['postgres/setup.sh'] = lines('a', 'b', 'c')
    local('postgres/setup.sh', lines('a', 'country', 'c'))
    template('postgres/setup.sh', lines('a', 'template', 'c'))

    expect(migrate().outcomes['postgres/setup.sh']).toBe('conflict')
    expect(asset('postgres/setup.sh')).toContain(
      '<<<<<<< infrastructure/postgres/setup.sh'
    )
    expect(asset('postgres/setup.sh')).toContain('>>>>>>> v2.1 template')
  })

  it("moves the country's own files across", () => {
    local('postgres/custom.sh', 'custom\n')

    expect(migrate().outcomes['postgres/custom.sh']).toBe('kept')
    expect(asset('postgres/custom.sh')).toBe('custom\n')
  })

  it('drops unchanged v2.0 files the template no longer has', () => {
    bases['metabase/_data/metabase.mv.db'] = 'db\0'
    local('metabase/_data/metabase.mv.db', 'db\0')

    const { outcomes, migrated } = migrate()

    expect(outcomes['metabase/_data/metabase.mv.db']).toBe('dropped')
    expect(hasAsset('metabase/_data/metabase.mv.db')).toBe(false)
    expect(migrated).toEqual(['metabase/_data/metabase.mv.db'])
  })

  it("keeps the country's version of a changed binary file", () => {
    bases['metabase/logo.png'] = 'v2.0\0'
    local('metabase/logo.png', 'country\0')
    template('metabase/logo.png', 'v2.1\0')

    expect(migrate().outcomes['metabase/logo.png']).toBe('kept')
    expect(asset('metabase/logo.png')).toBe('country\0')
  })

  it('builds elasticsearch/reindex.sh from a customised deployment/reindex.sh', () => {
    bases['deployment/reindex.sh'] = 'v2.0\n'
    local('deployment/reindex.sh', 'country\n')
    template('deployment/reindex.sh', 'v2.0\n')
    template('elasticsearch/reindex.sh', 'v2.0\n')

    const { migrated } = migrate()

    expect(asset('deployment/reindex.sh')).toBe('country\n')
    expect(asset('elasticsearch/reindex.sh')).toBe('country\n')
    expect(migrated).toEqual(['deployment/reindex.sh'])
  })

  it('never moves postgres/on-deploy.sh, which the analytics job would run', () => {
    bases['postgres/on-deploy.sh'] = 'v2.0\n'
    local('postgres/on-deploy.sh', 'v2.0\n')

    expect(migrate()).toEqual({
      outcomes: { 'postgres/on-deploy.sh': 'dropped' },
      migrated: ['postgres/on-deploy.sh']
    })
    expect(hasAsset('postgres/on-deploy.sh')).toBe(false)
  })

  it('leaves a customised postgres/on-deploy.sh in infrastructure/', () => {
    bases['postgres/on-deploy.sh'] = 'v2.0\n'
    local('postgres/on-deploy.sh', 'country\n')

    expect(migrate()).toEqual({
      outcomes: { 'postgres/on-deploy.sh': 'not-moved' },
      migrated: []
    })
    expect(hasAsset('postgres/on-deploy.sh')).toBe(false)
  })

  it('leaves Docker Swarm configuration alone', () => {
    local('docker-compose.deploy.yml', 'services: {}\n')
    local('server-setup/playbook.yml', '- hosts: all\n')

    expect(migrate()).toEqual({ outcomes: {}, migrated: [] })
    expect(hasAsset('docker-compose.deploy.yml')).toBe(false)
  })

  it('never overwrites an existing asset, and only removes identical originals', () => {
    write(cwd, 'assets/postgres/a.sh', 'same\n')
    write(cwd, 'assets/postgres/b.sh', 'hand edited\n')
    local('postgres/a.sh', 'same\n')
    local('postgres/b.sh', 'original\n')

    const { outcomes, migrated } = migrate()

    expect(outcomes).toEqual({
      'postgres/a.sh': 'exists',
      'postgres/b.sh': 'exists-differs'
    })
    expect(asset('postgres/b.sh')).toBe('hand edited\n')
    expect(migrated).toEqual(['postgres/a.sh'])
  })

  it('keeps scripts executable', () => {
    template('postgres/setup.sh', 'v2.1\n')
    chmodSync(path.join(templateDir, 'assets/postgres/setup.sh'), 0o755)

    migrate()

    expect(
      statSync(path.join(cwd, 'assets/postgres/setup.sh')).mode & 0o111
    ).not.toBe(0)
  })

  it('turns an unchanged v2.0 infrastructure/ into the template assets/', () => {
    const v20 = {
      'deployment/reindex.sh': 'reindex v2.0\n',
      'metabase/run.sh': 'run v2.0\n',
      'postgres/on-deploy.sh': 'on-deploy v2.0\n',
      'postgres/setup-analytics.sh': 'analytics v2.0\n'
    }
    for (const [file, contents] of Object.entries(v20)) {
      bases[file] = contents
      local(file, contents)
    }

    const { migrated } = migrateInfrastructureToAssets(
      cwd,
      REAL_TEMPLATE_DIR,
      (file) =>
        file in bases ? new TextEncoder().encode(bases[file]) : undefined
    )

    const templateAssets = listFiles(REAL_TEMPLATE_DIR, 'assets')
    expect(listFiles(cwd, 'assets').sort()).toEqual(templateAssets.sort())
    for (const file of templateAssets) {
      expect(readFileSync(path.join(cwd, file), 'utf8')).toBe(
        readFileSync(path.join(REAL_TEMPLATE_DIR, file), 'utf8')
      )
    }
    expect(migrated).toEqual(Object.keys(v20).sort())
  })
})

describe('removeMigrated', () => {
  it('removes migrated files and the directories they leave empty', () => {
    const cwd = mkdtempSync(path.join(tmpdir(), 'assets-remove-'))
    for (const file of [
      'postgres/a.sh',
      'metabase/run.sh',
      'docker-compose.yml'
    ]) {
      mkdirSync(path.dirname(path.join(cwd, 'infrastructure', file)), {
        recursive: true
      })
      writeFileSync(path.join(cwd, 'infrastructure', file), '')
    }

    removeMigrated(cwd, ['postgres/a.sh', 'metabase/run.sh'])

    expect(listFiles(cwd, 'infrastructure')).toEqual([
      'infrastructure/docker-compose.yml'
    ])

    removeMigrated(cwd, ['docker-compose.yml'])
    expect(existsSync(path.join(cwd, 'infrastructure'))).toBe(false)

    rmSync(cwd, { recursive: true, force: true })
  })
})
