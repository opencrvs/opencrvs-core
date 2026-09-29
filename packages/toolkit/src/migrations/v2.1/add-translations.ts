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

/**
 * Codemod: copy the translation keys core gained this version into this country
 * config.
 *
 * Unlike every other codemod, this one carries no list of what it changes, and
 * should not need editing again. Its input is `client.csv` and `login.csv` from
 * the country config template of the version being upgraded to, fetched from
 * GitHub; whatever rows those files have gained, this adds. A pull request that
 * introduces a translation key therefore only has to add it to the template —
 * `packages/countryconfig-template/src/translations/` — which the
 * check-missing-translation workflow makes it do anyway.
 *
 * `countryconfig.csv` is deliberately left alone. It holds the copy the country
 * config declares itself, which is nobody's business but the country's.
 *
 * Rows are rebuilt against the local file's own columns rather than copied
 * across, so a country config with languages the template does not have keeps
 * its shape: the template's value is used for a language they share, and an
 * empty cell for one it has nothing for.
 */

import path from 'path'
import {
  CsvFile,
  addRows,
  parseCsvLine,
  readCsvFile,
  toCsvLine,
  writeCsvFile
} from '../../csv'
import { candidateRefs, fetchTemplate } from '../../translations/template'

const APPLICATIONS = ['client', 'login']

/** The version this folder upgrades a country config to. */
const TARGET_VERSION = '2.1'

const skipped: string[] = []

function warnSkipped(message: string) {
  skipped.push(message)
  console.warn(`  ⚠️  ${message}`)
}

/**
 * The rows of the template that the local file has no id for, expressed in the
 * local file's columns.
 */
export function rowsToAdd(local: CsvFile, template: CsvFile): string[] {
  const localColumns = parseCsvLine(local.header)
  const templateColumns = parseCsvLine(template.header)

  return template.body
    .filter((line) => line !== '')
    .map((line) => {
      const values = parseCsvLine(line)

      return toCsvLine(
        localColumns.map((column) => {
          const index = templateColumns.indexOf(column)
          return index === -1 ? '' : (values[index] ?? '')
        })
      )
    })
}

async function updateApplication(
  cwd: string,
  refs: string[],
  application: string
) {
  const relativePath = `src/translations/${application}.csv`
  const local = readCsvFile(path.join(cwd, relativePath))

  if (!local) {
    warnSkipped(`${relativePath} not found; translations not added`)
    return
  }

  const fetched = await fetchTemplate(refs, application)

  if (!fetched) {
    warnSkipped(
      `No ${application}.csv found in the ${TARGET_VERSION} country config template on GitHub; ${application}.csv not updated`
    )
    return
  }

  const template = readTemplate(fetched.contents)
  const added = addRows(local, rowsToAdd(local, template))

  if (added.length === 0) {
    return
  }

  try {
    writeCsvFile(path.join(cwd, relativePath), local)
  } catch (error) {
    warnSkipped(
      `Could not write ${relativePath} (${(error as Error).message}); translations not added`
    )
    return
  }

  for (const id of added) {
    console.log(`  ✓ ${relativePath}: ${id}`)
  }
}

function readTemplate(contents: string): CsvFile {
  const lines = contents.replace(/\r?\n$/, '').split(/\r?\n/)

  return {
    header: lines[0],
    body: lines.slice(1),
    newline: '\n',
    trailingNewline: true
  }
}

/** Refs to read the template from. Undefined when GitHub cannot be asked. */
async function listRefs() {
  try {
    return await candidateRefs(TARGET_VERSION)
  } catch (error) {
    warnSkipped(
      `Could not list the ${TARGET_VERSION} refs on GitHub (${(error as Error).message}); translations not added`
    )
    return undefined
  }
}

async function main() {
  const cwd = process.cwd()

  console.log('Adding the translation keys core gained this version...\n')

  const refs = await listRefs()

  if (refs) {
    for (const application of APPLICATIONS) {
      try {
        await updateApplication(cwd, refs, application)
      } catch (error) {
        warnSkipped(
          `Could not read ${application}.csv from the country config template on GitHub (${(error as Error).message}); ${application}.csv not updated`
        )
      }
    }
  }

  if (skipped.length > 0) {
    console.warn(
      `\n⚠️  ${skipped.length} step(s) were skipped. Add the missing translations by hand before upgrading:`
    )
    for (const message of skipped) {
      console.warn(`  - ${message}`)
    }
  }
}

export { main }
