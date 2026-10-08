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
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'fs'
import { tmpdir } from 'os'
import path from 'path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  removeTypingsCopy,
  removeTypingsFromDockerfile
} from './remove-typings-from-dockerfile'

/** The Dockerfile of opencrvs-countryconfig v2.0.4, the stock v2.0 country config. */
const V2_0_DOCKERFILE = `FROM node:22.22.3-alpine AS deps
WORKDIR /usr/src/app
ENV NPM_CONFIG_LOGLEVEL=warn

# Install dependencies, including devDependencies (nodemon) needed for local
# hot-reloading via Tilt.
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM node:22-alpine AS runner
WORKDIR /usr/src/app
ENV NPM_CONFIG_LOGLEVEL=warn

# Copy dependencies from deps stage
COPY --from=deps /usr/src/app/node_modules ./node_modules

# Copy application files
COPY package.json yarn.lock tsconfig.json ./
COPY src ./src
COPY typings ./typings

EXPOSE 3040

CMD ["yarn", "start:prod"]
`

describe('removeTypingsCopy', () => {
  it('removes the typings copy of a v2.0 Dockerfile and nothing else', () => {
    const { contents, removed, unresolved } = removeTypingsCopy(V2_0_DOCKERFILE)

    expect(contents).toBe(
      V2_0_DOCKERFILE.replace('COPY typings ./typings\n', '')
    )
    expect(removed).toEqual(['COPY typings ./typings'])
    expect(unresolved).toEqual([])
  })

  it.each([
    'COPY ./typings ./typings',
    'COPY typings/ ./typings/',
    'COPY typings /usr/src/app/typings',
    'COPY typings/*.d.ts ./typings/',
    'COPY --chown=node:node typings ./typings',
    'COPY ["typings", "./typings"]',
    'ADD typings ./typings',
    'copy typings ./typings',
    '  COPY   typings\t./typings  '
  ])('removes %j', (instruction) => {
    const { contents } = removeTypingsCopy(
      `COPY src ./src\n${instruction}\nEXPOSE 3040\n`
    )

    expect(contents).toBe('COPY src ./src\nEXPOSE 3040\n')
  })

  it('writes the lines it keeps back as they were', () => {
    expect(
      removeTypingsCopy(
        'COPY src ./src\r\nCOPY typings ./typings\r\nEXPOSE 3040\r\n'
      ).contents
    ).toBe('COPY src ./src\r\nEXPOSE 3040\r\n')
  })

  it.each([
    ['at the end of the file', 'COPY src ./src\nCOPY typings ./typings\n'],
    ['without a final newline', 'COPY src ./src\nCOPY typings ./typings']
  ])('removes a typings copy %s', (_description, dockerfile) => {
    expect(removeTypingsCopy(dockerfile).contents).toBe('COPY src ./src\n')
  })

  it('removes a Dockerfile that is nothing but the typings copy', () => {
    expect(removeTypingsCopy('COPY typings ./typings\n').contents).toBe('')
  })

  it.each([
    'COPY src ./src',
    'COPY typings-extra ./typings-extra',
    'COPY mytypings ./typings',
    'COPY src ./typings',
    'COPY --from=deps /usr/src/app/typings ./typings',
    'COPY --from=typings typings ./typings',
    'RUN ls typings',
    'ENV TYPINGS_DIR=typings',
    '# COPY typings ./typings'
  ])('leaves %j alone', (line) => {
    const dockerfile = `${line}\n`

    expect(removeTypingsCopy(dockerfile)).toEqual({
      contents: dockerfile,
      removed: [],
      unresolved: []
    })
  })

  it('reports a copy that mixes typings with other sources instead of editing it', () => {
    const dockerfile = 'COPY src typings ./\n'

    expect(removeTypingsCopy(dockerfile)).toEqual({
      contents: dockerfile,
      removed: [],
      unresolved: ['COPY src typings ./']
    })
  })

  it('reports a typings copy spread over several lines instead of editing it', () => {
    const dockerfile = 'COPY typings \\\n  ./typings\n'

    expect(removeTypingsCopy(dockerfile)).toEqual({
      contents: dockerfile,
      removed: [],
      unresolved: ['COPY typings \\']
    })
  })

  it('does not report a multi-line COPY that only has typings as its destination', () => {
    const dockerfile = 'COPY src \\\n  ./typings\n'

    expect(removeTypingsCopy(dockerfile)).toEqual({
      contents: dockerfile,
      removed: [],
      unresolved: []
    })
  })

  it('does not take the continuation of another instruction for a COPY', () => {
    const dockerfile = 'RUN echo hello && \\\n  COPY typings ./typings\n'

    expect(removeTypingsCopy(dockerfile)).toEqual({
      contents: dockerfile,
      removed: [],
      unresolved: []
    })
  })

  it('does not let a comment ending in a backslash swallow the next line', () => {
    expect(
      removeTypingsCopy('# copy the types \\\nCOPY typings ./typings\n')
    ).toEqual({
      contents: '# copy the types \\\n',
      removed: ['COPY typings ./typings'],
      unresolved: []
    })
  })
})

describe('removeTypingsFromDockerfile', () => {
  let cwd: string

  const read = (file: string) => readFileSync(path.join(cwd, file), 'utf8')
  const write = (file: string, contents: string) => {
    mkdirSync(path.dirname(path.join(cwd, file)), { recursive: true })
    writeFileSync(path.join(cwd, file), contents)
  }

  beforeEach(() => {
    cwd = mkdtempSync(path.join(tmpdir(), 'remove-typings-from-dockerfile-'))
    vi.spyOn(console, 'log').mockImplementation(() => undefined)
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  })

  afterEach(() => {
    rmSync(cwd, { recursive: true, force: true })
    vi.restoreAllMocks()
  })

  it('upgrades a v2.0 country config and keeps its typings directory', () => {
    write('Dockerfile', V2_0_DOCKERFILE)
    write('typings/short-uid.d.ts', "declare module 'short-uid'\n")

    removeTypingsFromDockerfile(cwd)

    expect(read('Dockerfile')).toBe(
      V2_0_DOCKERFILE.replace('COPY typings ./typings\n', '')
    )
    expect(read('typings/short-uid.d.ts')).toBe("declare module 'short-uid'\n")
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("removed 'COPY typings ./typings'")
    )
  })

  it('does nothing when there is no Dockerfile', () => {
    expect(() => removeTypingsFromDockerfile(cwd)).not.toThrow()

    expect(existsSync(path.join(cwd, 'Dockerfile'))).toBe(false)
    expect(console.log).not.toHaveBeenCalled()
  })

  it('leaves a Dockerfile that never copied typings alone', () => {
    const dockerfile = V2_0_DOCKERFILE.replace('COPY typings ./typings\n', '')
    write('Dockerfile', dockerfile)

    removeTypingsFromDockerfile(cwd)

    expect(read('Dockerfile')).toBe(dockerfile)
    expect(console.log).not.toHaveBeenCalled()
  })

  it('changes nothing when run a second time', () => {
    write('Dockerfile', V2_0_DOCKERFILE)
    removeTypingsFromDockerfile(cwd)
    const upgraded = read('Dockerfile')
    vi.mocked(console.log).mockClear()

    removeTypingsFromDockerfile(cwd)

    expect(read('Dockerfile')).toBe(upgraded)
    expect(console.log).not.toHaveBeenCalled()
    expect(console.warn).not.toHaveBeenCalled()
  })

  it('warns about a typings copy it cannot remove and leaves the Dockerfile as it was', () => {
    const dockerfile = 'COPY src typings ./\n'
    write('Dockerfile', dockerfile)

    removeTypingsFromDockerfile(cwd)

    expect(read('Dockerfile')).toBe(dockerfile)
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("'COPY src typings ./'")
    )
  })

  it('removes what it can and warns about the rest', () => {
    write('Dockerfile', 'COPY typings ./typings\nCOPY src typings ./\n')

    removeTypingsFromDockerfile(cwd)

    expect(read('Dockerfile')).toBe('COPY src typings ./\n')
    expect(console.warn).toHaveBeenCalledTimes(1)
  })
})
