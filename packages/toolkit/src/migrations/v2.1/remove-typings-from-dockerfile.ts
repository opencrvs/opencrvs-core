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
 * Codemod: stop the country config's Dockerfile copying `typings/` into the
 * image.
 *
 * A v2.0 Tiltfile sends `typings/` to the image build, and the Dockerfile ends
 * with `COPY typings ./typings`. The Tiltfile that `upgrade-tilt` installs does
 * not send it, and starts a yarn country config with `start:prod`, which runs
 * `ts-node --transpile-only` and so never reads a declaration file. The
 * Dockerfile left behind then fails under Tilt, on its last step:
 *
 *   ERROR IN: [runner 6/6] COPY typings ./typings
 *
 * This step removes that instruction. `typings/` itself stays in the country
 * config, where `tsconfig.json` still includes it when type-checking.
 *
 * Only a `COPY` that reads nothing but `typings` is removed. One that mixes it
 * with other sources, or that is spread over several lines, is reported for the
 * country to edit by hand. Anything already absent is left alone.
 */

import { existsSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'

const DOCKERFILE = 'Dockerfile'

/** `typings`, `./typings`, `typings/`, or anything under it. */
const TYPINGS_PATH = /^(?:\.\/)?typings(?:\/.*)?$/

/** A line ending in a backslash carries on into the next one. */
const continues = (line: string) =>
  !/^\s*#/.test(line) && /\\[ \t]*\r?\n?$/.test(line)

/**
 * What a line copies out of the build context, destination left out. Empty for
 * anything but `COPY` and `ADD`, and for `--from`, which reads from another
 * stage rather than from the build context.
 */
function contextSources(line: string, continued: boolean) {
  const [instruction, ...args] = line.split(/[\s"',[\]]+/).filter(Boolean)

  if (
    !/^(?:COPY|ADD)$/i.test(instruction) ||
    args.some((arg) => arg.startsWith('--from'))
  ) {
    return []
  }

  const paths = args.filter((arg) => arg !== '\\' && !arg.startsWith('--'))

  // The destination is the last path, which a line that carries on has not
  // reached yet: everything on it is a source.
  return continued ? paths : paths.slice(0, -1)
}

/**
 * The Dockerfile without its instructions that copy only from `typings/`, and
 * the ones that copy from it but could not be taken out safely.
 */
export function removeTypingsCopy(dockerfile: string) {
  const kept: string[] = []
  const removed: string[] = []
  const unresolved: string[] = []
  let previousCarriesOn = false

  // Each line keeps its own terminator, so the ones left are written back as
  // they were, whether LF or CRLF.
  const lines = dockerfile.match(/[^\n]*\n|[^\n]+$/g) ?? []

  for (const line of lines) {
    const startsInstruction = !previousCarriesOn
    const carriesOn = continues(line)
    previousCarriesOn = carriesOn

    const sources = startsInstruction ? contextSources(line, carriesOn) : []

    if (!sources.some((source) => TYPINGS_PATH.test(source))) {
      kept.push(line)
    } else if (sources.length === 1 && !carriesOn) {
      removed.push(line.trim())
    } else {
      kept.push(line)
      unresolved.push(line.trim())
    }
  }

  return { contents: kept.join(''), removed, unresolved }
}

export function removeTypingsFromDockerfile(cwd: string) {
  const dockerfilePath = path.join(cwd, DOCKERFILE)
  if (!existsSync(dockerfilePath)) return

  const { contents, removed, unresolved } = removeTypingsCopy(
    readFileSync(dockerfilePath, 'utf8')
  )

  if (removed.length === 0 && unresolved.length === 0) return

  console.log('\nUpdating the Dockerfile...\n')

  if (removed.length > 0) {
    writeFileSync(dockerfilePath, contents)
  }

  for (const instruction of removed) {
    console.log(
      `  ✓ ${DOCKERFILE}: removed '${instruction}', the Tiltfile no longer sends typings/ to the image build`
    )
  }

  for (const instruction of unresolved) {
    console.warn(
      `  ⚠️  ${DOCKERFILE} still copies from typings/ ('${instruction}'), which the Tiltfile no longer sends to the image build; remove it by hand`
    )
  }
}

async function main() {
  removeTypingsFromDockerfile(process.cwd())
}

export { main }
