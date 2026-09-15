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
/* eslint-disable no-console */
import { bold, green, red, yellow } from 'kleur/colors'
import { check } from '../translations/check'
import { DEFAULT_TARGET_URL, runVerifyEndpoints } from './endpoints'
import { runVerifyScopes } from './scopes'

interface Section {
  name: string
  failures: number
  /** Shown under the summary when the section failed. */
  remedy: string
}

/**
 * Every message the country config declares must have a translation row, or the
 * UI falls back to the English `defaultMessage`. Static, so this needs no
 * running service — unlike the other two sections.
 */
function verifyTranslations(cwd: string): Section {
  console.log(bold('Translations\n'))

  const { missing, dynamicIds } = check(cwd)

  for (const file of dynamicIds) {
    console.log(
      '  ' +
        yellow(
          `${file} declares a message whose id is built at runtime; ids have to be hardcoded to be checked.`
        )
    )
  }

  if (missing.length === 0) {
    console.log(
      '  ' +
        green('✓') +
        ' Every message declared in src has a translation row.'
    )
  } else {
    console.log(
      '  ' +
        red('✗') +
        ` ${missing.length} message(s) declared in src have no row in src/translations/countryconfig.csv.`
    )
    for (const { id } of missing.slice(0, 10)) {
      console.log(`      ${id}`)
    }
    if (missing.length > 10) {
      console.log(`      +${missing.length - 10} more`)
    }
  }

  console.log()

  return {
    name: 'Translations',
    failures: missing.length === 0 ? 0 : 1,
    remedy: 'Run `opencrvs check-translations --write` to add the missing rows.'
  }
}

/**
 * Runs every post-upgrade check there is and reports them together.
 *
 * The point of gathering them behind one command is that an upgrade is only
 * finished when all of them pass, and an operator should not have to know which
 * individual commands exist — or remember to run them — to find that out.
 *
 * Expects to run in the country config directory, with the upgraded country
 * config running (locally by default, see `target`).
 *
 * @returns the total number of failed checks.
 */
export async function runVerifyUpgrade(
  target: string = DEFAULT_TARGET_URL,
  cwd: string = process.cwd()
): Promise<number> {
  const sections: Section[] = []

  sections.push(verifyTranslations(cwd))

  sections.push({
    name: 'Scopes added this release',
    failures: await runVerifyScopes(target),
    remedy:
      'Assign each unheld scope to the role(s) that should have it in src/data-seeding/roles/roles.ts.'
  })

  console.log()

  sections.push({
    name: 'Endpoints',
    failures: await runVerifyEndpoints(target),
    remedy:
      'See the lines marked ✗ above. A missing public endpoint or a secured one that answers without a token both need fixing before deploying.'
  })

  const total = sections.reduce((sum, section) => sum + section.failures, 0)

  console.log()
  console.log(bold('Upgrade verification summary'))
  console.log()

  for (const section of sections) {
    const mark = section.failures === 0 ? green('✓') : red('✗')
    const detail =
      section.failures === 0 ? 'passed' : `${section.failures} problem(s)`
    console.log(`  ${mark} ${section.name}: ${detail}`)
  }

  console.log()

  if (total === 0) {
    console.log(green(bold('✓ This country config looks ready to deploy.')))
    return 0
  }

  console.log(red(bold(`✗ ${total} problem(s) to fix before deploying:`)))
  console.log()

  for (const section of sections.filter((s) => s.failures > 0)) {
    console.log(`  ${bold(section.name)}: ${section.remedy}`)
  }

  return total
}
