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
} from '../csv'

const REPOSITORY = 'opencrvs/opencrvs-core'
const TEMPLATE_TRANSLATIONS = 'packages/countryconfig-template/src/translations'
const APPLICATIONS = ['client', 'login']

/** The version this folder upgrades a country config to. */
const TARGET_VERSION = '2.1'

const skipped: string[] = []

function warnSkipped(message: string) {
  skipped.push(message)
  console.warn(`  ⚠️  ${message}`)
}

/**
 * The refs matching a prefix, newest patch first.
 *
 * Every patch gets its own release branch — `release/2.1.0`, `release/2.1.1` —
 * and a translation key added in a patch only exists on that patch's branch, so
 * the newest one is the one worth reading.
 */
async function matchingRefs(namespace: string, prefix: string) {
  const url = `https://api.github.com/repos/${REPOSITORY}/git/matching-refs/${namespace}/${prefix}`

  const response = await fetch(url, {
    headers: { accept: 'application/vnd.github+json' }
  })

  if (!response.ok) {
    return []
  }

  const refs = (await response.json()) as Array<{ ref: string }>

  const patchOf = (ref: string) => Number(ref.split('.').pop()) || 0

  return refs
    .map(({ ref }) => ref.replace(/^refs\/(heads|tags)\//, ''))
    .sort((a, b) => patchOf(b) - patchOf(a))
}

/**
 * Where to read the template from, most specific first: the newest release
 * branch of the target version, then its newest tag, then `develop` for anyone
 * running the codemod before the version has been cut.
 */
async function candidateRefs() {
  return [
    ...(await matchingRefs('heads', `release/${TARGET_VERSION}.`)),
    ...(await matchingRefs('tags', `v${TARGET_VERSION}.`)),
    'develop'
  ]
}

async function fetchTemplate(refs: string[], application: string) {
  for (const ref of refs) {
    const url = `https://raw.githubusercontent.com/${REPOSITORY}/${ref}/${TEMPLATE_TRANSLATIONS}/${application}.csv`
    const response = await fetch(url)

    if (response.ok) {
      return { ref, contents: await response.text() }
    }
  }

  warnSkipped(
    `No ${application}.csv found in the ${TARGET_VERSION} country config template on GitHub; ${application}.csv not updated`
  )
  return undefined
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
    return
  }

  const template = readTemplate(fetched.contents)
  const added = addRows(local, rowsToAdd(local, template))

  if (added.length === 0) {
    return
  }

  writeCsvFile(path.join(cwd, relativePath), local)

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

async function main() {
  const cwd = process.cwd()

  console.log('Adding the translation keys core gained this version...\n')

  try {
    const refs = await candidateRefs()

    for (const application of APPLICATIONS) {
      await updateApplication(cwd, refs, application)
    }
  } catch (error) {
    // An upgrade run on a machine that cannot reach GitHub should report what
    // it could not do and let the rest of the upgrade finish, rather than
    // failing the whole thing on a network error.
    warnSkipped(
      `Could not read the country config template from GitHub (${(error as Error).message}); translations not added`
    )
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
