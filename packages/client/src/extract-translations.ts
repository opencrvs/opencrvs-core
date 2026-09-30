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
/* eslint-disable */
import * as fs from 'fs'
import glob from 'glob'
import chalk from 'chalk'
import csv2json from 'csv2json'
import { stringify } from 'csv-stringify'
import { promisify } from 'util'
import { sortBy } from 'lodash'
import ts from '@typescript/api'
import { MessageDescriptor } from 'react-intl'

async function writeJSONToCSV(
  filename: string,
  data: Array<Record<string, any>>
) {
  const csv = stringify(data, {
    header: true
  })
  return fs.promises.writeFile(filename, csv as any, 'utf8')
}

export async function readCSVToJSON<T>(filename: string) {
  return new Promise<T>((resolve, reject) => {
    const chunks: string[] = []
    fs.createReadStream(filename)
      .on('error', reject)
      .pipe(
        csv2json({
          separator: ','
        })
      )
      .on('data', (chunk: string) => chunks.push(chunk))
      .on('error', reject)
      .on('end', () => {
        resolve(JSON.parse(chunks.join('')))
      })
  })
}

type CSVRow = { id: string; description: string } & Record<string, string>

/**
 * Most descriptions contain a comma, and a row printed for someone to paste
 * into the file has to survive being pasted.
 */
function toCSVValue(value: string) {
  return /["\n,]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

const write = process.argv.includes('--write')
const outdated = process.argv.includes('--outdated')
const ci = process.argv.includes('--ci')

const COUNTRY_CONFIG_PATH = process.argv[2]

type LocalisationFile = CSVRow[]

function writeTranslations(data: LocalisationFile) {
  return writeJSONToCSV(
    `${COUNTRY_CONFIG_PATH}/src/translations/client.csv`,
    data
  )
}

function readTranslations() {
  return readCSVToJSON<CSVRow[]>(
    `${COUNTRY_CONFIG_PATH}/src/translations/client.csv`
  )
}

/**
 * The value of `node`'s `name` property, when the source gives it as a fixed
 * string. Reading the 'id' property of each of these:
 *
 *   { id: 'foo' }             -> 'foo'
 *   { id: `foo` }             -> 'foo'      backticks, nothing substituted in
 *   { id: `x.${country}` }    -> undefined  differs every time it runs
 *   { defaultMessage: 'foo' } -> undefined  no id property at all
 */
function staticStringOf(
  node: ts.ObjectLiteralExpression,
  name: string
): string | undefined {
  const property = node.properties.find(
    (p) => ts.isPropertyAssignment(p) && p.name.getText() === name
  )

  if (!property || !ts.isPropertyAssignment(property)) {
    return undefined
  }

  const { initializer } = property

  return ts.isStringLiteral(initializer) ||
    ts.isNoSubstitutionTemplateLiteral(initializer)
    ? initializer.text
    : undefined
}

function hasProperty(node: ts.ObjectLiteralExpression, name: string) {
  return node.properties.some(
    (p) => ts.isPropertyAssignment(p) && p.name.getText() === name
  )
}

/** Anything shaped like a react-intl message: `{ id, defaultMessage, ... }`. */
function isMessageDescriptor(
  node: ts.Node
): node is ts.ObjectLiteralExpression {
  return (
    ts.isObjectLiteralExpression(node) &&
    hasProperty(node, 'id') &&
    hasProperty(node, 'defaultMessage')
  )
}

/**
 * Every message declared in one file.
 *
 * The properties are read one at a time rather than by evaluating the object
 * as a whole. Evaluating it would drop the whole message the moment any one
 * property was interpolated, and `description` often is — harmlessly, since
 * nothing reads it at runtime. The key would then stop being checked, with
 * nothing to say so.
 */
function messagesDeclaredIn(
  filePath: string,
  sourceCode: string
): MessageDescriptor[] {
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  )
  const messages: MessageDescriptor[] = []

  function collect(node: ts.ObjectLiteralExpression) {
    const id = staticStringOf(node, 'id')

    if (id === undefined) {
      console.log(chalk.yellow.bold('Warning'))
      console.error(
        `Found a dynamic message identifier in file ${filePath}.`,
        'Message identifiers should never be dynamic and should always be hardcoded instead.',
        'This enables us to confidently verify that a country configuration has all required keys.',
        '\n',
        node.getText(sourceFile),
        '\n'
      )
      return
    }

    const defaultMessage = staticStringOf(node, 'defaultMessage')

    if (defaultMessage === undefined) {
      console.log(chalk.yellow.bold('Warning'))
      console.error(
        `Found a dynamic default message for ${id} in file ${filePath}.`,
        'The key is still checked, but --write cannot fill in its English copy.',
        '\n',
        node.getText(sourceFile),
        '\n'
      )
    }

    messages.push({
      id,
      defaultMessage: defaultMessage ?? '',
      description: staticStringOf(node, 'description') ?? ''
    })
  }

  function visit(node: ts.Node) {
    if (isMessageDescriptor(node)) {
      collect(node)
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)

  return messages
}

async function extractMessages() {
  let translations: LocalisationFile
  try {
    translations = await readTranslations()
  } catch (error: unknown) {
    const err = error as Error & { code: string }
    if (err.code === 'ENOENT') {
      console.error(err.message)
      console.error(
        `Your environment variables may not be set.
        Please add valid COUNTRY_CONFIG_PATH, as an environment variable.
        If they are set correctly, then something is wrong with
        this file: ${COUNTRY_CONFIG_PATH}/src/translations/client.csv`
      )
    } else {
      console.error(err)
    }
    process.exit(1)
  }

  const knownLanguages =
    translations.length > 0
      ? Object.keys(translations[0]).filter(
          (key) => !['id', 'description'].includes(key)
        )
      : ['en']

  console.log('Checking translations in application...')
  console.log()

  const files = await promisify(glob)('src/**/*.@(tsx|ts)', {
    ignore: [
      '**/*.test.@(tsx|ts)',
      'src/tests/**/*.*',
      'src/setupTests.ts',
      '**/*.stories.@(tsx|ts)'
    ]
  })

  const messagesParsedFromApp: MessageDescriptor[] = files
    .map((f) => {
      const contents = fs.readFileSync(f).toString()
      return messagesDeclaredIn(f, contents)
    })
    .flat()

  const reactIntlDescriptions: Record<string, string> = Object.fromEntries(
    messagesParsedFromApp.map(({ id, description }) => [id, description || ''])
  )

  const missingKeys = Object.keys(reactIntlDescriptions).filter(
    (key) => !translations.find(({ id }) => id === key)
  )

  if (outdated) {
    // Membership, not truthiness: a message with an empty description is still
    // a message, and reporting it as outdated sends people deleting live keys.
    const extractedIds = new Set(messagesParsedFromApp.map(({ id }) => id))
    const extraKeys = translations
      .map(({ id }) => id)
      .filter((key) => !extractedIds.has(key))

    console.log(chalk.yellow.bold('Potentially outdated translations'))
    console.log(
      'The following keys were not found in the code, but are part of the copy file:',
      '\n'
    )
    console.log(extraKeys.join('\n'))
  }

  if (missingKeys.length > 0) {
    console.log(chalk.red.bold('Missing translations '))
    if (ci) {
      const defaultsToBeAdded = missingKeys.map(
        (key): CSVRow => ({
          id: key,
          description: reactIntlDescriptions[key],
          ...Object.fromEntries(
            knownLanguages.map((lang) => [
              lang,
              lang === 'en'
                ? messagesParsedFromApp
                    .find(({ id }) => id === key)
                    ?.defaultMessage?.toString() || ''
                : ''
            ])
          )
        })
      )
      const message = defaultsToBeAdded
        .map((row) => Object.values(row).map(toCSVValue).join(','))
        .join('\n')
      console.log(`You are missing the following content keys from your country configuration package:\n
${chalk.white(message)}\n
 Add them to this file and run again:
${chalk.white(`${COUNTRY_CONFIG_PATH}/src/translations/client.csv`)}`)
    }

    if (!ci) {
      console.log(`You are missing the following content keys from your country configuration package:\n
  ${chalk.white(missingKeys.join('\n'))}\n
  Translate the keys and add them to this file:
  ${chalk.white(`${COUNTRY_CONFIG_PATH}/src/translations/client.csv`)}`)
    }

    if (write) {
      console.log(
        `${chalk.yellow('Warning ⚠️:')} ${chalk.white(
          'The --write command is experimental and only adds new translations for English.'
        )}`
      )

      // This is just to ensure that all languages stay in the CVS file
      const emptyLanguages = Object.fromEntries(
        knownLanguages.map((lang) => [lang, ''])
      )

      const defaultsToBeAdded = missingKeys.map(
        (key): CSVRow => ({
          id: key,
          description: reactIntlDescriptions[key],
          ...emptyLanguages,
          en:
            messagesParsedFromApp
              .find(({ id }) => id === key)
              ?.defaultMessage?.toString() || ''
        })
      )

      const allIds = Array.from(
        new Set(
          defaultsToBeAdded
            .map(({ id }) => id)
            .concat(translations.map(({ id }) => id))
        )
      )

      const allTranslations = allIds.map((id) => {
        const existingTranslation = translations.find(
          (translation) => translation.id === id
        )

        return (
          existingTranslation ||
          defaultsToBeAdded.find((translation) => translation.id === id)!
        )
      })

      await writeTranslations(sortBy(allTranslations, (row) => row.id))

      console.log(`
${chalk.green('Added')} ${missingKeys.length} key(s). The non-English copy is still yours to write.`)

      // The rows are in the file, so there is nothing left to fail on. Exiting
      // non-zero here reads as a failed run and sends people running the very
      // same command a second time.
      return
    } else {
      console.log(`
${chalk.green('Tip 🪄')}: ${chalk.white(
        `If you want this command to add the missing English keys for you, run ${chalk.bold(
          'pnpm extract:translations --write'
        )} in ${chalk.bold(
          'packages/client'
        )}. Note that you still need to add non-English translations to the file.`
      )}`)
    }

    process.exit(1)
  }
}

extractMessages()
