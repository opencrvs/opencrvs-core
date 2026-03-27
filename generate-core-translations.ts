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
 * Extracts all MessageDescriptor objects from the client and login packages
 * and writes them to a single core-en.json file.
 *
 * This file is consumed by the @opencrvs/toolkit package and published with it,
 * so country configurations can validate their translations against a known core version.
 *
 * Usage (run from repo root):
 *   yarn generate:core-translations
 */

/* eslint-disable no-console */
import * as fs from 'fs'
import * as path from 'path'
import ts from 'typescript'
import { MessageDescriptor } from 'react-intl'

const PACKAGES_DIR = path.resolve(__dirname, 'packages')
const PACKAGES_TO_SCAN = ['client', 'login']
const OUTPUT_PATH = path.resolve(PACKAGES_DIR, 'toolkit/dist/core-en.json')

function findSourceFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  const results: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (['node_modules', 'tests', '__tests__'].includes(entry.name)) continue
      results.push(...findSourceFiles(path.join(dir, entry.name)))
    } else if (
      /\.(ts|tsx)$/.test(entry.name) &&
      !/\.(test|spec|stories)\.(ts|tsx)$/.test(entry.name)
    ) {
      results.push(path.join(dir, entry.name))
    }
  }
  return results
}

function extractMessageDescriptors(
  _filePath: string,
  sourceCode: string
): MessageDescriptor[] {
  const sourceFile = ts.createSourceFile(
    'temp.ts',
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  )
  const matches: MessageDescriptor[] = []

  function visit(node: ts.Node) {
    if (!ts.isObjectLiteralExpression(node)) {
      ts.forEachChild(node, visit)
      return
    }

    const idProp = node.properties.find(
      (p) => ts.isPropertyAssignment(p) && p.name.getText() === 'id'
    )
    const defaultMessageProp = node.properties.find(
      (p) =>
        ts.isPropertyAssignment(p) && p.name.getText() === 'defaultMessage'
    )

    if (!(idProp && defaultMessageProp)) {
      ts.forEachChild(node, visit)
      return
    }

    const objectText = node.getText(sourceFile)
    try {
      // eslint-disable-next-line no-new-func
      matches.push(new Function(`return (${objectText});`)())
    } catch {
      // Dynamic message identifier – skip
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return matches
}

type MessageEntry = { defaultMessage: string; description: string }

function extractFromDirectory(dir: string): Record<string, MessageEntry> {
  const messages: Record<string, MessageEntry> = {}
  for (const file of findSourceFiles(dir)) {
    const contents = fs.readFileSync(file, 'utf8')
    for (const { id, defaultMessage, description } of extractMessageDescriptors(
      file,
      contents
    )) {
      if (id)
        messages[id as string] = {
          defaultMessage: defaultMessage?.toString() ?? '',
          description: description?.toString() ?? ''
        }
    }
  }
  return messages
}

async function main() {
  const allMessages: Record<string, MessageEntry> = {}

  for (const pkg of PACKAGES_TO_SCAN) {
    const srcDir = path.join(PACKAGES_DIR, pkg, 'src')
    console.log(`Scanning ${srcDir}...`)
    Object.assign(allMessages, extractFromDirectory(srcDir))
  }

  const sorted = Object.fromEntries(
    Object.entries(allMessages).sort(([a], [b]) => a.localeCompare(b))
  )

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true })
  await fs.promises.writeFile(OUTPUT_PATH, JSON.stringify(sorted, null, 2))
  console.log(
    `Written ${Object.keys(sorted).length} keys → ${OUTPUT_PATH}`
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
