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
import { parse as parseYaml } from 'yaml'
import type { Bindings } from './bindings.ts'
import { parseWith } from './parsers.ts'
import { readContainer, readPath, type FilePath } from './templateScan.ts'

// Template -> variable -> where it sits in the rendered file (src/generated/file-paths.json).
export type ScannedPaths = Record<string, Record<string, FilePath[]>>

// One source's opinion about a form value. Merging candidates is the next step.
export interface Candidate {
  source: 'github' | 'file'
  // Where it came from, for messages: a variable name or a file path.
  origin: string
  value: unknown
}

const present = (value: unknown) => value !== undefined && value !== null && value !== ''

// Reads form values out of an environment's rendered files, following the file targets of the bindings.
export function readFileCandidates(
  files: Record<string, string>,
  bindings: Bindings,
  scanned: ScannedPaths
): Record<string, Candidate[]> {
  const documents = new Map<string, unknown>()
  const result: Record<string, Candidate[]> = {}

  for (const [question, binding] of Object.entries(bindings.bindings)) {
    for (const target of binding.targets) {
      if (target.source !== 'file') continue
      const file = bindings.files[target.template]
      const paths = scanned[target.template]?.[target.var]
      if (!file || !paths?.length || files[file] === undefined) continue

      if (!documents.has(file)) documents.set(file, parseYaml(files[file]!))
      const document = documents.get(file)

      let raw: unknown
      if (target.collect === 'container') {
        raw = readContainer(document, paths[0]!)
      } else {
        const values = paths.flatMap((path) => readPath(document, path)).filter(present)
        raw = paths.some((path) => path.segments.includes('*')) ? values : values[0]
      }

      const value = parseWith(target.parse, raw)
      if (value === undefined) continue
      ;(result[question] ??= []).push({ source: 'file', origin: file, value })
    }
  }
  return result
}
