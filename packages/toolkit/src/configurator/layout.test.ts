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

import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { findOldInventoryFiles, migrateLayout } from './layout'
import { createRepository, read, removeRepositories } from './testing'

afterEach(removeRepositories)

const OLD = 'infrastructure/server-setup/inventory'

describe('findOldInventoryFiles', () => {
  it('lists the yml files of the old directory in alphabetical order', () => {
    const root = createRepository({
      [`${OLD}/qa.yml`]: '',
      [`${OLD}/backup.yml`]: '',
      [`${OLD}/notes.txt`]: ''
    })

    expect(findOldInventoryFiles(root)).toEqual([
      `${OLD}/backup.yml`,
      `${OLD}/qa.yml`
    ])
  })

  it('finds nothing without the old directory', () => {
    expect(findOldInventoryFiles(createRepository())).toEqual([])
  })
})

describe('migrateLayout', () => {
  it('moves every inventory to its environment folder and removes the empty old directory', () => {
    const root = createRepository({
      [`${OLD}/qa.yml`]: 'qa inventory',
      [`${OLD}/production.yml`]: 'production inventory'
    })

    const result = migrateLayout(root)

    expect(result.moved).toEqual([
      {
        environment: 'production',
        from: `${OLD}/production.yml`,
        to: 'environments/production/inventory.yml'
      },
      {
        environment: 'qa',
        from: `${OLD}/qa.yml`,
        to: 'environments/qa/inventory.yml'
      }
    ])
    expect(result.skipped).toEqual([])
    expect(result.oldDirectoryRemoved).toBe(true)
    expect(read(root, 'environments/qa/inventory.yml')).toBe('qa inventory')
    expect(read(root, 'environments/production/inventory.yml')).toBe(
      'production inventory'
    )
    expect(existsSync(join(root, OLD))).toBe(false)
  })

  it('never overwrites an inventory that is already in place', () => {
    const root = createRepository({
      [`${OLD}/qa.yml`]: 'old qa',
      'environments/qa/inventory.yml': 'new qa'
    })

    const result = migrateLayout(root)

    expect(result.moved).toEqual([])
    expect(result.skipped.map((move) => move.environment)).toEqual(['qa'])
    expect(result.oldDirectoryRemoved).toBe(false)
    expect(read(root, 'environments/qa/inventory.yml')).toBe('new qa')
    expect(read(root, `${OLD}/qa.yml`)).toBe('old qa')
  })

  it('keeps the old directory when something else is in it', () => {
    const root = createRepository({
      [`${OLD}/qa.yml`]: 'qa',
      [`${OLD}/README.md`]: 'notes'
    })

    const result = migrateLayout(root)

    expect(result.moved).toHaveLength(1)
    expect(result.oldDirectoryRemoved).toBe(false)
    expect(read(root, `${OLD}/README.md`)).toBe('notes')
  })

  it('does nothing when the repository already uses the new layout', () => {
    const root = createRepository({ 'environments/qa/inventory.yml': 'qa' })

    expect(migrateLayout(root)).toEqual({
      moved: [],
      skipped: [],
      oldDirectoryRemoved: false
    })
    expect(read(root, 'environments/qa/inventory.yml')).toBe('qa')
  })

  it('can run twice', () => {
    const root = createRepository({ [`${OLD}/qa.yml`]: 'qa' })

    migrateLayout(root)

    expect(migrateLayout(root)).toEqual({
      moved: [],
      skipped: [],
      oldDirectoryRemoved: false
    })
    expect(read(root, 'environments/qa/inventory.yml')).toBe('qa')
  })
})
