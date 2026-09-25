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
 * Codemod: replace the Dockerfiles and the Tilt setup with the v2.1 country
 * config template's.
 *
 * v2.1 moved the Tilt library from opencrvs-helm-charts into the country
 * config (`tilt/`), and the Helm charts into opencrvs-core: the Tiltfile now
 * sparse-checks-out `charts/` from core into `.opencrvs-core-charts` instead of
 * cloning opencrvs-helm-charts next to the country config. The Dockerfiles
 * install with pnpm and build the assets image from `assets/`.
 *
 * What it does:
 *   1. Writes `Dockerfile` from the template.
 *   2. Unless `--docker-swarm`: writes `Dockerfile.assets`, `Tiltfile`,
 *      `.tiltignore` and everything under `tilt/` from the template. The
 *      Tiltfile keeps the country's `countryconfig_image_name` and
 *      `countryconfig_image_tag`.
 *   3. Adds the `start:tilt` script the Tiltfile starts the container with:
 *      the country's `start` script without its `setup-*` steps, which need a
 *      local Postgres container Tilt does not run.
 *   4. Ignores `.opencrvs-core-charts` in git.
 *
 * Caveats:
 *   - Runs after `migrate-to-pnpm`, and does nothing while the country config
 *     is still on yarn: the template's files install with pnpm.
 *   - Local changes to these files are replaced, not merged. Review them with
 *     `git diff` and bring back what is still needed.
 *   - The template's `.pnpmfile.cjs` works around the TypeScript 7 compiler,
 *     which a country config upgraded from v2.0 does not use. It is not copied,
 *     and the references to it are taken out of the Dockerfile and Tiltfile.
 *   - Files a country added to `tilt/` itself are left alone.
 */

import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync
} from 'fs'
import path from 'path'
import {
  listTemplateFiles,
  readPackageJson,
  readTemplateFile,
  writePackageJson
} from './countryconfig-template'

const PNPMFILE = '.pnpmfile.cjs'

const CHARTS_DIR = '.opencrvs-core-charts'

/** Tiltfile settings that are the country's to choose. */
const TILTFILE_SETTINGS = [
  'countryconfig_image_name',
  'countryconfig_image_tag'
]

const PNPMFILE_COMMENT =
  /^# Install dependencies\. \.pnpmfile\.cjs too:.*\n(?:#.*ERR_PNPM_LOCKFILE_CONFIG_MISMATCH.*\n)?/m

/**
 * Takes `.pnpmfile.cjs` out of a template file, for a country config that does
 * not have one. Returns undefined when a reference is left that it did not
 * know how to remove — writing the file would then break the build.
 */
export function withoutPnpmfile(file: string, source: string) {
  const result =
    file === 'Tiltfile'
      ? source.replace(/^[ \t]*['"]\.\/\.pnpmfile\.cjs['"],?[ \t]*\n/gm, '')
      : source
          .replace(PNPMFILE_COMMENT, '# Install dependencies\n')
          .replace(/^(COPY\b.*?)[ \t]+\.pnpmfile\.cjs\b/gm, '$1')

  const leftover = result
    .split('\n')
    .some(
      (line) => !line.trimStart().startsWith('#') && line.includes(PNPMFILE)
    )

  return leftover ? undefined : result
}

/** Carries the country's own `TILTFILE_SETTINGS` over into the template. */
export function keepTiltfileSettings(template: string, local: string) {
  return TILTFILE_SETTINGS.reduce((result, name) => {
    const pattern = new RegExp(`^${name}[ \\t]*=.*$`, 'm')
    const value = local.match(pattern)?.[0]
    return value ? result.replace(pattern, () => value) : result
  }, template)
}

/**
 * The `start:tilt` script for a `start` script: the same command without the
 * `setup-*` steps, which `docker exec` into a Postgres container that exists
 * only outside Tilt.
 */
export function startTiltScript(start: string): string {
  return start
    .split('&&')
    .map((step) => step.trim())
    .filter(
      (step) => step && !/^(pnpm|yarn|npm run)\s+setup-[\w:-]+$/.test(step)
    )
    .join(' && ')
}

function writeIfChanged(cwd: string, file: string, contents: string) {
  const target = path.join(cwd, file)

  if (existsSync(target) && readFileSync(target, 'utf8') === contents) {
    return
  }

  mkdirSync(path.dirname(target), { recursive: true })
  writeFileSync(target, contents)
  console.log(`  ✓ ${file}`)
}

function addStartTiltScript(cwd: string) {
  const packageJson = readPackageJson(cwd)

  if (!packageJson || packageJson.scripts?.['start:tilt']) {
    return
  }

  const start = packageJson.scripts?.start

  if (!start) {
    console.warn(
      '  ⚠️  package.json has no start script to derive start:tilt from. Add a start:tilt script that starts the country config without the setup-* steps; the Tiltfile runs it.'
    )
    return
  }

  packageJson.scripts!['start:tilt'] = startTiltScript(start)
  writePackageJson(cwd, packageJson)
  console.log('  ✓ package.json: scripts.start:tilt')
}

function ignoreChartsDir(cwd: string) {
  const gitignore = path.join(cwd, '.gitignore')
  const current = existsSync(gitignore) ? readFileSync(gitignore, 'utf8') : ''

  if (
    current
      .split(/\r?\n/)
      .some((line) => line.trim().replace(/\/$/, '') === CHARTS_DIR)
  ) {
    return
  }

  const separator = current === '' || current.endsWith('\n') ? '' : '\n'
  appendFileSync(
    gitignore,
    `${separator}\n# Helm charts the Tiltfile checks out from opencrvs-core\n${CHARTS_DIR}\n`
  )
  console.log(`  ✓ .gitignore: ${CHARTS_DIR}`)
}

export async function main({ dockerSwarm }: { dockerSwarm: boolean }) {
  const cwd = process.cwd()

  console.log('\nUpdating the Dockerfiles and the Tilt setup...\n')

  if (
    !existsSync(path.join(cwd, 'pnpm-lock.yaml')) ||
    existsSync(path.join(cwd, 'yarn.lock'))
  ) {
    console.warn(
      '  ⚠️  The country config is not on pnpm yet, so the Dockerfiles and Tiltfile were left alone. Fix the warnings of the pnpm step above and run `opencrvs upgrade` again.'
    )
    return
  }

  const files = dockerSwarm
    ? ['Dockerfile']
    : [
        'Dockerfile',
        'Dockerfile.assets',
        'Tiltfile',
        '.tiltignore',
        ...listTemplateFiles('tilt')
      ]
  const hasPnpmfile = existsSync(path.join(cwd, PNPMFILE))

  for (const file of files) {
    let contents: string | undefined = readTemplateFile(file)

    if (file === 'Tiltfile' && existsSync(path.join(cwd, file))) {
      contents = keepTiltfileSettings(
        contents,
        readFileSync(path.join(cwd, file), 'utf8')
      )
    }

    if (!hasPnpmfile && (file === 'Dockerfile' || file === 'Tiltfile')) {
      contents = withoutPnpmfile(file, contents)

      if (contents === undefined) {
        console.warn(
          `  ⚠️  ${file} was left alone: the template's copy refers to ${PNPMFILE} in a way this step does not know how to remove.`
        )
        continue
      }
    }

    writeIfChanged(cwd, file, contents)
  }

  if (dockerSwarm) {
    console.log(
      '  Dockerfile.assets and the Tilt setup were left alone: with --docker-swarm, infrastructure/ stays where it is and the template reads assets/.'
    )
    return
  }

  addStartTiltScript(cwd)
  ignoreChartsDir(cwd)

  console.log(
    '\n  Local changes to the Dockerfiles and the Tiltfile were replaced. Review them with:\n' +
      '    git diff -- Dockerfile Dockerfile.assets Tiltfile tilt\n' +
      `  The Tiltfile no longer uses ../opencrvs-helm-charts; it checks the charts out from opencrvs-core into ${CHARTS_DIR}.\n`
  )
}
