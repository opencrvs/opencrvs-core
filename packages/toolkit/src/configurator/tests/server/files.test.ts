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
import { readFileSync } from 'node:fs'
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { FIXTURES, renderFixture } from '../../scripts/fixtures'
import { fileTargets, listEnvironmentNames, readEnvironmentFiles } from '../../server/environments'
import { renderEnvironmentFiles, writeEnvironmentFiles } from '../../server/files'
import { bindings, scanned } from '../../ui/bindings/load'
import { FORMATTERS } from '../../ui/bindings/parsers'
import { readFileCandidates } from '../../ui/bindings/read'
import { answersFor } from '../plan/answers'

const readTemplate = (path: string) => readFileSync(join(__dirname, '../../templates', path), 'utf8')
const render = (environment: string, values: Record<string, unknown>) =>
  renderEnvironmentFiles({ environment, values, bindings, readTemplate })

describe('renderEnvironmentFiles', () => {
  // The fixtures are what the CLI's own templates produce for these values, so this is the proof
  // that the answers are turned into template values the way the CLI does.
  it.each(['qa', 'uat', 'prod'])('reproduces the CLI-rendered files of %s byte for byte', (environment) => {
    expect(render(environment, answersFor(environment))).toEqual(renderFixture(environment, readTemplate))
  })

  it.each(Object.keys(FIXTURES))('reads back what it wrote (%s)', (environment) => {
    const answers = answersFor(environment)
    const read = readFileCandidates(render(environment, answers), bindings, scanned)
    for (const [question, value] of Object.entries(answers)) {
      // the mode is not in the file: the template only has the two flags derived from it (they are read from GitHub)
      if (question === 'BACKUP_OR_RESTORE' || question === 'TRAEFIK_MODE' || (Array.isArray(value) && value.length === 0)) continue
      const expected = question === 'USERS' ? (value as { name: string }[]).map((user) => user.name) : value
      const actual = read[question]?.[0]?.value
      expect(question === 'USERS' ? (actual as { name: string }[]).map((user) => user.name) : actual).toEqual(expected)
    }
  })

  it('writes the environment name into the chart, and defaults for what the form does not ask', () => {
    const files = render('my-env', {})
    const values = files['dependencies/values.yaml']!
    expect(values).toContain('- opencrvs-my-env')
    expect(values).toContain('backup_server_dir: /home/backup/my-env')
    expect(values).toMatch(/monitoring:\n  enabled: true/)
    expect(values).toMatch(/rustfs:\n  enabled: true/)
    expect(values).not.toContain('host_data_path') // s3 migration off by default
  })

  it('writes the services file: type, 2FA, OpenTelemetry and the hosts of the dependencies', () => {
    const services = (values: Record<string, unknown>) => render('my-env', values)['opencrvs-services/values.yaml']!
    const defaults = services({})
    expect(defaults).toContain('host: elasticsearch.opencrvs-deps-my-env.svc.cluster.local')
    expect(defaults).toContain('host: rustfs-0.rustfs.opencrvs-deps-my-env.svc.cluster.local')
    expect(defaults).toContain('host: redis-0.redis.opencrvs-deps-my-env.svc.cluster.local')
    expect(defaults).toContain('host: postgres-0.postgres.opencrvs-deps-my-env.svc.cluster.local')
    expect(defaults).toContain('OPENCRVS_ENVIRONMENT: my-env')
    // no endpoint question is on screen for the built-in collector
    expect(defaults).toContain('exporter_otlp_endpoint: "http://opentelemetry-collector.opencrvs-deps-my-env.svc.cluster.local:4317"')

    const own = services({
      ENVIRONMENT_TYPE: 'production',
      TWO_FA_ENABLED: true,
      MONITORING_ENABLED: true,
      OTEL_ENABLED: true,
      OTEL_COLLECTOR_ENDPOINT: 'https://otel.example.org:4318',
      POSTGRES_HOST: 'db.example.org',
      S3_HOST: 's3.example.org'
    })
    expect(own).toContain('environment_type: production')
    expect(own).toMatch(/otel:\n  enabled: true/)
    expect(own).toContain('exporter_otlp_endpoint: "https://otel.example.org:4318"')
    expect(services({ OTEL_ENABLED: false })).toMatch(/otel:\n  enabled: false/)
    expect(own).toContain('TWO_FA_ENABLED: true')
    expect(own).toContain('host: db.example.org')
    expect(own).toContain('host: s3.example.org')
    expect(own).toContain('host: elasticsearch.opencrvs-deps-my-env.svc.cluster.local') // still built in
  })

  it('writes each "Use built-in component" checkbox as the enabled key of its dependency', () => {
    const chart = (values: Record<string, unknown>) => render('my-env', values)['dependencies/values.yaml']!
    const enabled = (text: string, key: string) => text.match(new RegExp(`^${key}:\\n  enabled: (\\w+)`, 'm'))![1]

    const builtIn = chart({})
    for (const key of ['elasticsearch', 'rustfs', 'postgres', 'redis']) expect(enabled(builtIn, key)).toBe('true')
    expect(builtIn).toContain('host: elasticsearch.opencrvs-deps-my-env.svc.cluster.local')

    const external = chart({
      USE_BUILTIN_ELASTICSEARCH: false,
      USE_BUILTIN_RUSTFS: false,
      USE_BUILTIN_POSTGRES: true,
      USE_BUILTIN_REDIS: false,
      ELASTICSEARCH_HOST: 'es.example.org'
    })
    expect([enabled(external, 'elasticsearch'), enabled(external, 'rustfs'), enabled(external, 'postgres'), enabled(external, 'redis')]).toEqual([
      'false',
      'false',
      'true',
      'false'
    ])
    expect(external).toContain('host: es.example.org')
    expect(external).toMatch(/minio:\n  enabled: false/) // MinIO is never deployed
  })

  it('reads the checkboxes back from the dependencies chart', () => {
    const files = render('my-env', { USE_BUILTIN_REDIS: false, USE_BUILTIN_POSTGRES: true })
    const read = readFileCandidates(files, bindings, scanned)
    expect(read.USE_BUILTIN_REDIS?.[0]?.value).toBe(false)
    expect(read.USE_BUILTIN_POSTGRES?.[0]?.value).toBe(true)
  })

  it('writes the monitoring switch into the dependencies chart and the Traefik tracing', () => {
    const files = (monitoring: boolean) => render('my-env', { MONITORING_ENABLED: monitoring })
    expect(files(true)['dependencies/values.yaml']).toMatch(/monitoring:\n  enabled: true/)
    expect(files(true)['traefik/values.yaml']).toContain('serviceName: traefik')
    expect(files(false)['dependencies/values.yaml']).toMatch(/monitoring:\n  enabled: false/)
    expect(files(false)['traefik/values.yaml']).not.toContain('serviceName: traefik')
  })

  it('leaves unanswered values empty, never "undefined"', () => {
    for (const text of Object.values(render('my-env', {}))) expect(text).not.toContain('undefined')
  })

  it('derives single_node from workers and the backup server', () => {
    const singleNode = (values: Record<string, unknown>) => render('x', values)['inventory.yml']!.match(/single_node: (\w+)/)![1]
    expect(singleNode({})).toBe('true')
    expect(singleNode({ WORKER_NODES: [{ ip: '10.0.0.2' }] })).toBe('false')
    expect(singleNode({ BACKUP_HOST: '203.0.113.9' })).toBe('false')
    expect(singleNode({ WORKER_NODES: [{ ip: '' }] })).toBe('true') // an empty row is not a worker
  })

  it('writes backup and restore sections only for the chosen mode', () => {
    const chart = (values: Record<string, unknown>) => render('x', values)['dependencies/values.yaml']!
    expect(chart({ BACKUP_OR_RESTORE: 'backup', BACKUP_HOST: '1.1.1.1', BACKUP_ENVIRONMENT_MODE: 'dump' })).toMatch(/backup:\n  enabled: true/)
    expect(chart({ BACKUP_OR_RESTORE: 'none' })).toMatch(/backup:\n  enabled: false/)
    expect(chart({ BACKUP_OR_RESTORE: 'restore', RESTORE_HOST: '2.2.2.2', RESTORE_ENVIRONMENT_NAME: 'prod' })).toMatch(/restore:\n  enabled: true/)
  })
})

describe('formatters (the reverse of the parsers)', () => {
  it('turns table rows into the shapes the templates and GitHub need', () => {
    expect(FORMATTERS['ip-rows']!([{ ip: '10.0.0.1' }, { ip: ' ' }, { ip: '10.0.0.2' }])).toEqual(['10.0.0.1', '10.0.0.2'])
    expect(FORMATTERS['csv-to-ip-rows']!([{ ip: '10.0.0.1' }, { ip: '10.0.0.2' }])).toBe('10.0.0.1,10.0.0.2')
    expect(FORMATTERS['csv-to-ip-rows']!([])).toBe('')
    expect(FORMATTERS.boolean!(true)).toBe(true)
    expect(FORMATTERS.boolean!('false')).toBe(false)
    expect(FORMATTERS.string!(' a ')).toBe('a')
    expect(FORMATTERS.users!([{ name: 'a', role: 'admin', state: 'present', ssh_keys: 'k1\n# c\nk2' }, { name: ' ' }])).toEqual([
      { name: 'a', role: 'admin', state: 'present', ssh_keys: ['k1', 'k2'] }
    ])
  })
})

describe('writeEnvironmentFiles', () => {
  let dir: string
  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'env-init-'))
  })
  afterEach(() => rm(dir, { recursive: true, force: true }))

  it('writes the known files into a new environment folder', async () => {
    const files = render('qa', answersFor('qa'))
    expect(await writeEnvironmentFiles(dir, 'qa', files)).toEqual(['qa/inventory.yml', 'qa/dependencies/values.yaml', 'qa/traefik/values.yaml', 'qa/opencrvs-services/values.yaml'])
    expect(await readFile(join(dir, 'qa', 'inventory.yml'), 'utf8')).toBe(files['inventory.yml'])
    expect(await readFile(join(dir, 'qa', 'dependencies', 'values.yaml'), 'utf8')).toBe(files['dependencies/values.yaml'])
  })

  it('leaves values.override.yaml and other files alone', async () => {
    await mkdir(join(dir, 'qa', 'dependencies'), { recursive: true })
    await writeFile(join(dir, 'qa', 'dependencies', 'values.override.yaml'), 'mine: true\n')
    await writeFile(join(dir, 'qa', 'notes.txt'), 'keep\n')
    await writeEnvironmentFiles(dir, 'qa', render('qa', {}))
    expect(await readFile(join(dir, 'qa', 'dependencies', 'values.override.yaml'), 'utf8')).toBe('mine: true\n')
    expect(await readFile(join(dir, 'qa', 'notes.txt'), 'utf8')).toBe('keep\n')
  })

  it.each(['../evil', 'a/b', '..', '', '.hidden'])('refuses the environment name %j', async (name) => {
    await expect(writeEnvironmentFiles(dir, name, render('x', {}))).rejects.toThrow('Invalid environment name')
  })

  it.each(['../outside.yml', 'dependencies/values.override.yaml', 'inventory.yml/../../x', '/etc/passwd'])('refuses the path %j', async (path) => {
    await expect(writeEnvironmentFiles(dir, 'qa', { [path]: 'x' })).rejects.toThrow('Refusing to write')
  })

})

describe('the flat layout (environments/<name>.yaml)', () => {
  let dir: string
  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'env-init-'))
    await writeFile(join(dir, 'staging.yaml'), 'old: true\n')
  })
  afterEach(() => rm(dir, { recursive: true, force: true }))

  it('puts the flat file in the one file of the environment and nothing else', async () => {
    const files = render('staging', answersFor('qa'))
    expect(await writeEnvironmentFiles(dir, 'staging', files, bindings.flat)).toEqual(['staging.yaml'])
    expect(await readFile(join(dir, 'staging.yaml'), 'utf8')).toBe(files['inventory.yml'])
    expect(await readdir(dir)).toEqual(['staging.yaml']) // no folder, no second file
  })

  it('creates a new environment as <name>.yaml', async () => {
    const files = render('qa', answersFor('qa'))
    expect(await writeEnvironmentFiles(dir, 'qa', files, bindings.flat)).toEqual(['qa.yaml'])
    expect(await readFile(join(dir, 'qa.yaml'), 'utf8')).toBe(files['inventory.yml'])
    expect((await listEnvironmentNames(dir)).names).toEqual(['qa', 'staging'])
  })

  it('keeps .yml when that is what the environment has, and prefers .yaml when both exist', async () => {
    await writeFile(join(dir, 'prod.yml'), 'old: true\n')
    expect(await writeEnvironmentFiles(dir, 'prod', render('prod', {}), bindings.flat)).toEqual(['prod.yml'])
    await writeFile(join(dir, 'both.yaml'), 'a: 1\n')
    await writeFile(join(dir, 'both.yml'), 'b: 2\n')
    expect(await readEnvironmentFiles(dir, 'both', bindings.flat)).toEqual({ 'inventory.yml': 'a: 1\n' }) // reading prefers .yaml
    expect(await writeEnvironmentFiles(dir, 'both', render('both', {}), bindings.flat)).toEqual(['both.yaml']) // and so does writing
    expect(await readFile(join(dir, 'both.yml'), 'utf8')).toBe('b: 2\n')
  })

  it('writes whichever rendered file `flat:` names', async () => {
    const files = render('staging', answersFor('qa'))
    await writeEnvironmentFiles(dir, 'staging', files, 'dependencies/values.yaml')
    expect(await readFile(join(dir, 'staging.yaml'), 'utf8')).toBe(files['dependencies/values.yaml'])
  })

  it('still refuses unknown paths and bad names', async () => {
    await expect(writeEnvironmentFiles(dir, 'staging', { 'other.yml': 'x' }, bindings.flat)).rejects.toThrow('Refusing to write')
    await expect(writeEnvironmentFiles(dir, '../x', render('x', {}), bindings.flat)).rejects.toThrow('Invalid environment name')
  })

  it('reads the flat file back as the inventory, so the answers come back', async () => {
    const answers = answersFor('prod')
    await writeEnvironmentFiles(dir, 'prod', render('prod', answers), bindings.flat)
    const read = readFileCandidates((await readEnvironmentFiles(dir, 'prod', bindings.flat))!, bindings, scanned)
    expect(read.KUBE_API_HOST?.[0]?.value).toBe('10.3.0.5')
    expect(read.WORKER_NODES?.[0]?.value).toEqual([{ ip: '10.3.0.11' }, { ip: '10.3.0.12' }])
    expect(read.BACKUP_HOST?.[0]?.value).toBe('203.0.113.9') // from the inventory; the chart is not part of a flat file
    expect(read.BACKUP_ENVIRONMENT_MODE).toBeUndefined() // lives only in the chart, which a flat file does not hold
  })
})

describe('fileTargets', () => {
  let dir: string
  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'env-init-'))
  })
  afterEach(() => rm(dir, { recursive: true, force: true }))

  it('uses the tree layout for folders, and for an empty or missing folder', async () => {
    expect((await fileTargets(dir, 'qa')).targets).toEqual({
      'inventory.yml': 'qa/inventory.yml',
      'dependencies/values.yaml': 'qa/dependencies/values.yaml',
      'traefik/values.yaml': 'qa/traefik/values.yaml',
      'opencrvs-services/values.yaml': 'qa/opencrvs-services/values.yaml'
    })
    await mkdir(join(dir, 'dev'))
    expect((await fileTargets(dir, 'qa')).layout).toBe('folders')
    expect((await fileTargets(join(dir, 'missing'), 'qa')).layout).toBe('none')
  })

  it('gives the flat layout one target and no place for the other files', async () => {
    await writeFile(join(dir, 'staging.yaml'), 'a: 1\n')
    expect(await fileTargets(dir, 'qa', 'inventory.yml')).toEqual({
      layout: 'files',
      targets: { 'inventory.yml': 'qa.yaml', 'dependencies/values.yaml': null, 'traefik/values.yaml': null, 'opencrvs-services/values.yaml': null }
    })
  })

  it('uses the tree layout when both shapes are present, as when listing', async () => {
    await mkdir(join(dir, 'dev'))
    await writeFile(join(dir, 'staging.yaml'), 'a: 1\n')
    expect((await fileTargets(dir, 'qa')).layout).toBe('folders')
  })

})
