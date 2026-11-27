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
import { join } from 'node:path'
import { parse } from 'yaml'
import { describe, expect, it } from 'vitest'
import { readContainer, readPath, scanTemplate, type FilePath } from '../../ui/bindings/templateScan'

const template = (path: string) => readFileSync(join(__dirname, '../../templates', path), 'utf8')
const shape = (paths: FilePath[] | undefined) =>
  (paths ?? []).map((path) => path.segments.join('.') + (path.prefix ? `|prefix:${path.prefix}` : ''))

describe('scanTemplate on inventory.template.yml', () => {
  const scan = scanTemplate(template('inventory/inventory.template.yml'))

  it('finds plain values', () => {
    expect(shape(scan.paths.kube_api_host)).toEqual(['all.vars.kube_api_host'])
    expect(shape(scan.paths.backup_host)).toEqual(['all.children.backup.hosts.backup0.ansible_host'])
    expect(shape(scan.paths.single_node)).toEqual(['all.vars.single_node'])
  })

  it('turns a loop into a wildcard, including the generated worker0, worker1 keys', () => {
    expect(shape(scan.paths.kube_worker_nodes)).toEqual(['all.children.workers.hosts.*.ansible_host'])
  })

  it('finds the properties of list items and nested lists', () => {
    expect(shape(scan.paths['users.name'])).toEqual(['all.vars.users.*.name'])
    expect(shape(scan.paths['users.role'])).toEqual(['all.vars.users.*.role'])
    expect(shape(scan.paths['users.state'])).toEqual(['all.vars.users.*.state'])
    expect(shape(scan.paths['users.ssh_keys'])).toEqual(['all.vars.users.*.ssh_keys.*'])
  })

  it('reports a variable that is only used in a condition as unreadable', () => {
    expect(scan.unreadable).toEqual(['users'])
  })
})

describe('scanTemplate on the dependencies chart', () => {
  const scan = scanTemplate(template('charts-values/dependencies/values.yaml'))

  it('lists every place a repeated variable appears', () => {
    expect(shape(scan.paths.restore_type)).toEqual(['rustfs.restore.type', 'postgres.restore.type'])
    expect(shape(scan.paths.backup_type)).toEqual(['rustfs.backup.type', 'postgres.backup.type'])
  })

  it('reads a value that sits inside a longer string by its fixed prefix', () => {
    expect(shape(scan.paths.restore_environment_name)).toEqual(['restore.backup_server_dir|prefix:/home/backup/'])
  })

  it('finds booleans and hosts', () => {
    expect(shape(scan.paths.backup_enabled)).toEqual(['backup.enabled'])
    expect(shape(scan.paths.restore_host)).toEqual(['restore.host'])
    expect(shape(scan.paths.elasticsearch_host)).toEqual(['elasticsearch.host'])
  })

  it('reads the flag of each dependency from its `enabled` key', () => {
    expect(shape(scan.paths.elasticsearch_enabled)).toEqual(['elasticsearch.enabled'])
    expect(shape(scan.paths.rustfs_enabled)).toEqual(['rustfs.enabled'])
    expect(shape(scan.paths.postgres_enabled)).toEqual(['postgres.enabled'])
    expect(shape(scan.paths.redis_enabled)).toEqual(['redis.enabled'])
  })

  it('cannot read back flags that only switch sections on and off', () => {
    expect(scan.unreadable).toEqual(['s3_migrate_from_minio_to_rustfs'])
  })
})

describe('scanTemplate on small templates', () => {
  it('handles else branches and a value in the middle of a string', () => {
    const scan = scanTemplate('a: {{#if x}}1{{else}}{{y}}{{/if}}\nb: "pre-{{z}}-post"\n')
    expect(shape(scan.paths.y)).toEqual(['a'])
    expect(scan.paths.z).toEqual([{ segments: ['b'], prefix: 'pre-', suffix: '-post' }])
  })

  it('does not try to read a string with two variables', () => {
    const scan = scanTemplate('a: "{{p}}:{{q}}"\n')
    expect(scan.paths.p).toBeUndefined()
    expect(scan.unreadable).toEqual(['p', 'q'])
  })

  it('handles lists inside lists', () => {
    const scan = scanTemplate('rows:\n{{#each rows as |row|}}\n  - id: {{row.id}}\n    tags:\n{{#each row.tags as |tag|}}\n      - {{tag}}\n{{/each}}\n{{/each}}\n')
    expect(shape(scan.paths['rows.id'])).toEqual(['rows.*.id'])
    expect(shape(scan.paths['rows.tags'])).toEqual(['rows.*.tags.*'])
  })
})

describe('readPath and readContainer', () => {
  const document = parse('hosts:\n  w0: { ip: a }\n  w1: { ip: b }\nlist:\n  - { n: 1 }\n  - { n: 2 }\ndir: /home/backup/prod\nempty: /home/backup/\n')

  it('reads wildcards over keys and indexes', () => {
    expect(readPath(document, { segments: ['hosts', '*', 'ip'] })).toEqual(['a', 'b'])
    expect(readPath(document, { segments: ['list', '*', 'n'] })).toEqual([1, 2])
    expect(readPath(document, { segments: ['hosts', 'w9', 'ip'] })).toEqual([])
  })

  it('strips a fixed prefix and ignores values without anything after it', () => {
    expect(readPath(document, { segments: ['dir'], prefix: '/home/backup/' })).toEqual(['prod'])
    expect(readPath(document, { segments: ['empty'], prefix: '/home/backup/' })).toEqual([])
  })

  it('returns the list that a loop pattern belongs to', () => {
    expect(readContainer(document, { segments: ['list', '*', 'n'] })).toEqual([{ n: 1 }, { n: 2 }])
  })
})
