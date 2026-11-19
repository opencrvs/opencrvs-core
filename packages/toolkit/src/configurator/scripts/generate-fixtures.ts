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
// Writes sample environments (dev, qa, uat, prod) into environments/ by rendering the
// vendored CLI templates. Existing files are left alone unless --force is given.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { FIXTURES, renderFixture } from './fixtures.ts'

const root = join(import.meta.dirname, '..')
const force = process.argv.includes('--force')
const readTemplate = (path: string) => readFileSync(join(root, 'templates', path), 'utf8')

for (const name of Object.keys(FIXTURES)) {
  for (const [file, text] of Object.entries(renderFixture(name, readTemplate))) {
    const target = join(root, 'environments', name, file)
    if (existsSync(target) && !force) {
      console.log(`  skipped ${name}/${file} (exists, use --force to overwrite)`)
      continue
    }
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, text)
    console.log(`  wrote   ${name}/${file}`)
  }
}
