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
 * Checks that every message a country config declares has a row in
 * `countryconfig.csv`.
 *
 * The mirror of the check core runs over its own packages: core validates
 * `client.csv` and `login.csv` against the client and login sources, and this
 * validates `countryconfig.csv` against the country config's own source.
 * Without it, a form or event label added to a country config renders as a raw
 * id.
 *
 * `client.csv` and `login.csv` are read but never written: core owns them, and
 * `opencrvs upgrade` keeps them in sync.
 */

import { Node, ObjectLiteralExpression, Project } from 'ts-morph'
import path from 'path'
import {
  CsvFile,
  addRows,
  idOf,
  readCsvFile,
  toCsvLine,
  writeCsvFile
} from '../csv'

const TRANSLATIONS = 'src/translations'
const OWN_FILE = `${TRANSLATIONS}/countryconfig.csv`
const CORE_FILES = [`${TRANSLATIONS}/client.csv`, `${TRANSLATIONS}/login.csv`]

export type Message = {
  id: string
  defaultMessage: string
  description: string
}

export type CheckResult = {
  missing: Message[]
  /** Rows in countryconfig.csv that nothing in the source declares. */
  outdated: string[]
  /** Files declaring a message whose id is assembled at runtime. */
  dynamicIds: string[]
}

/**
 * The value of a property when the source says what it is outright. A template
 * literal with something interpolated into it does not count.
 */
function staticStringOf(node: ObjectLiteralExpression, name: string) {
  const property = node.getProperty(name)

  if (!property || !Node.isPropertyAssignment(property)) {
    return undefined
  }

  const initializer = property.getInitializer()

  return initializer &&
    (Node.isStringLiteral(initializer) ||
      Node.isNoSubstitutionTemplateLiteral(initializer))
    ? initializer.getLiteralValue()
    : undefined
}

function messagesDeclaredIn(cwd: string) {
  const project = new Project({ skipAddingFilesFromTsConfig: true })
  project.addSourceFilesAtPaths([
    path.join(cwd, 'src/**/*.ts'),
    path.join(cwd, 'src/**/*.tsx'),
    `!${path.join(cwd, 'src/**/*.test.ts')}`,
    `!${path.join(cwd, 'src/**/*.test.tsx')}`,
    `!${path.join(cwd, 'src/**/*.stories.ts')}`,
    `!${path.join(cwd, 'src/**/*.stories.tsx')}`
  ])

  const messages: Message[] = []
  const dynamicIds: string[] = []

  for (const sourceFile of project.getSourceFiles()) {
    sourceFile.forEachDescendant((node) => {
      if (!Node.isObjectLiteralExpression(node)) {
        return
      }

      if (!(node.getProperty('id') && node.getProperty('defaultMessage'))) {
        return
      }

      const id = staticStringOf(node, 'id')

      if (id === undefined) {
        dynamicIds.push(path.relative(cwd, sourceFile.getFilePath()))
        return
      }

      messages.push({
        id,
        defaultMessage: staticStringOf(node, 'defaultMessage') ?? '',
        description: staticStringOf(node, 'description') ?? ''
      })
    })
  }

  return { messages, dynamicIds: [...new Set(dynamicIds)] }
}

export function check(cwd: string): CheckResult {
  const { messages, dynamicIds } = messagesDeclaredIn(cwd)

  const own = readCsvFile(path.join(cwd, OWN_FILE))
  const covered = new Set(
    [own, ...CORE_FILES.map((file) => readCsvFile(path.join(cwd, file)))]
      .flatMap((csv: CsvFile | undefined) => csv?.body ?? [])
      .map(idOf)
  )

  // The same message is often declared in more than one place.
  const missing = [
    ...new Map(
      messages
        .filter(({ id }) => !covered.has(id))
        .map((message) => [message.id, message])
    ).values()
  ].sort((a, b) => (a.id < b.id ? -1 : 1))

  const declared = new Set(messages.map(({ id }) => id))
  const outdated = (own?.body ?? [])
    .map(idOf)
    .filter((id: string) => !declared.has(id))

  return { missing, outdated, dynamicIds }
}

/**
 * Adds a row per missing message, filling in only English — the rest is copy
 * somebody has to write. Returns the ids added.
 *
 * Creates countryconfig.csv if it doesn't exist yet.
 */
export function writeMissing(cwd: string, missing: Message[]) {
  const file = readCsvFile(path.join(cwd, OWN_FILE)) ?? {
    header: 'id,description,en',
    body: [],
    newline: '\n',
    trailingNewline: true
  }

  const columns = file.header.split(',')

  const rows = missing.map((message) =>
    toCsvLine(
      columns.map((column: string) => {
        if (column === 'id') return message.id
        if (column === 'description') return message.description
        return column === 'en' ? message.defaultMessage : ''
      })
    )
  )

  const added = addRows(file, rows)
  writeCsvFile(path.join(cwd, OWN_FILE), file)

  return added
}
