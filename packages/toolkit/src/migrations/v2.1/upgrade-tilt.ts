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
 * Codemod: bring the local Tilt setup in line with the country config template.
 *
 * Up to v2.0 the Tiltfile cloned opencrvs/opencrvs-helm-charts into a sibling
 * `../opencrvs-helm-charts` directory and loaded its `tilt/opencrvs.tilt`. The
 * charts now live in opencrvs-core, and the Tilt helpers ship with the country
 * config itself under `tilt/`.
 *
 * What it does:
 *   1. Replaces `Tiltfile` with the template's, carrying over the country's
 *      `countryconfig_image_name`.
 *   2. Replaces every file under `tilt/` that core owns (the helpers and
 *      `tilt/examples/`) with the template's.
 *   3. Creates `tilt/helm/<chart>/values.yaml` when missing. These hold the
 *      country's own overrides and are never overwritten.
 *   4. Adds `.opencrvs-core-charts/` (the Tiltfile's charts checkout) to
 *      `.tiltignore` and `.gitignore`.
 *
 * The template files are bundled into the toolkit at build time, so they always
 * match the toolkit version being run.
 *
 * Caveats:
 *   - Local changes to the Tiltfile or to core owned files under `tilt/` are
 *     overwritten. Review them with `git diff -- Tiltfile tilt/` and move
 *     chart overrides into `tilt/helm/`.
 *   - Files under `tilt/` that the template does not have are left in place.
 */

import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync
} from 'fs'
import path from 'path'
import { findTemplateDir, listFiles } from './template-files'

/** Paths under `tilt/` the country owns: created when missing, never replaced. */
const COUNTRY_OWNED_DIR = 'tilt/helm/'

const CHARTS_CHECKOUT_DIR = '.opencrvs-core-charts'

const IMAGE_NAME_PATTERN = /^countryconfig_image_name\s*=\s*(["'])(.*?)\1/m

type Change = 'created' | 'updated' | 'unchanged'

function writeIfChanged(
  cwd: string,
  relativePath: string,
  contents: string,
  mode?: number
): Change {
  const target = path.join(cwd, relativePath)
  const existed = existsSync(target)

  if (existed && readFileSync(target, 'utf8') === contents) {
    return 'unchanged'
  }

  mkdirSync(path.dirname(target), { recursive: true })
  writeFileSync(target, contents)

  // Keeps shell scripts such as clear-all-data.sh executable
  if (mode !== undefined) {
    chmodSync(target, mode & 0o777)
  }

  return existed ? 'updated' : 'created'
}

function report(relativePath: string, change: Change) {
  if (change !== 'unchanged') {
    console.log(`  ✓ ${change} ${relativePath}`)
  }
}

/** TODO: ????? The template Tiltfile, keeping the image name the country already uses. */
export function renderTiltfile(template: string, existing?: string) {
  const imageName = existing?.match(IMAGE_NAME_PATTERN)?.[2]

  if (!imageName) {
    return template
  }

  return template.replace(
    IMAGE_NAME_PATTERN,
    (_line, quote: string) =>
      `countryconfig_image_name=${quote}${imageName}${quote}`
  )
}

/** `contents` with `line` appended, unless an equivalent entry is there already. */
export function withIgnoreEntry(contents: string, line: string) {
  const normalise = (entry: string) =>
    entry.trim().replace(/^\//, '').replace(/\/$/, '')

  const alreadyIgnored = contents
    .split(/\r?\n/)
    .some((entry) => normalise(entry) === normalise(line))

  if (alreadyIgnored) {
    return contents
  }

  const separator = contents === '' || contents.endsWith('\n') ? '' : '\n'
  return `${contents}${separator}${line}\n`
}

function ensureIgnored(cwd: string, file: string, line: string) {
  const target = path.join(cwd, file)
  const contents = existsSync(target) ? readFileSync(target, 'utf8') : ''
  report(file, writeIfChanged(cwd, file, withIgnoreEntry(contents, line)))
}

export function upgradeTilt(cwd: string, templateDir: string) {
  const tiltfilePath = path.join(cwd, 'Tiltfile')
  const existingTiltfile = existsSync(tiltfilePath)
    ? readFileSync(tiltfilePath, 'utf8')
    : undefined

  report(
    'Tiltfile',
    writeIfChanged(
      cwd,
      'Tiltfile',
      renderTiltfile(
        readFileSync(path.join(templateDir, 'Tiltfile'), 'utf8'),
        existingTiltfile
      )
    )
  )

  const templateFiles = listFiles(templateDir, 'tilt')

  for (const file of templateFiles) {
    const source = path.join(templateDir, file)
    const countryOwned = file.startsWith(COUNTRY_OWNED_DIR)

    if (countryOwned && existsSync(path.join(cwd, file))) {
      continue
    }

    report(
      file,
      writeIfChanged(
        cwd,
        file,
        readFileSync(source, 'utf8'),
        statSync(source).mode
      )
    )
  }

  const unknownFiles = listFiles(cwd, 'tilt').filter(
    (file) =>
      !file.startsWith(COUNTRY_OWNED_DIR) && !templateFiles.includes(file)
  )

  for (const file of unknownFiles) {
    console.warn(
      `  ⚠️  ${file} is not part of the template and was left in place. Move chart overrides into ${COUNTRY_OWNED_DIR}`
    )
  }

  ensureIgnored(cwd, '.tiltignore', `${CHARTS_CHECKOUT_DIR}/`)
  ensureIgnored(cwd, '.gitignore', CHARTS_CHECKOUT_DIR)

  if (existingTiltfile?.includes('opencrvs-helm-charts')) {
    console.log(
      `  ℹ️  The Tiltfile no longer uses ../opencrvs-helm-charts; charts are cloned into ${CHARTS_CHECKOUT_DIR}/ instead. The old checkout can be deleted.`
    )
  }
}

async function main() {
  console.log('Upgrading the local Tilt setup...\n')

  upgradeTilt(process.cwd(), findTemplateDir())

  console.log(
    '\n  Review local customisations with: git diff -- Tiltfile tilt/ .tiltignore .gitignore\n'
  )
}

export { main }
