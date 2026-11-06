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
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import * as esbuild from 'esbuild'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { CUSTOM_FIELD_EXTERNALS_GLOBAL } from '@opencrvs/commons/events'
import { customFieldBuildOptions } from '.'

let directory: string

function writeFiles(files: Record<string, string>) {
  for (const [name, contents] of Object.entries(files)) {
    fs.writeFileSync(path.join(directory, name), contents)
  }
}

async function build(entry: string) {
  const result = await esbuild.build({
    ...customFieldBuildOptions({
      entryPoints: [path.join(directory, entry)],
      outdir: path.join(directory, 'out'),
      minify: false
    }),
    // CommonJS, so that the test can run the bundle without a module loader
    format: 'cjs',
    write: false,
    logLevel: 'silent'
  })
  return result.outputFiles[0].text
}

/** Runs a bundle like the browser does, after the client shared its modules */
function run(code: string) {
  const module = { exports: {} as { default: () => Record<string, unknown> } }
  new Function('module', 'exports', code)(module, module.exports)
  return module.exports.default()
}

describe('customFieldBuildOptions', () => {
  beforeAll(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), 'custom-field-build-'))
    writeFiles({
      // Like many npm packages, this one uses React when the module loads
      'library.js': `
        import React from 'react'
        export const LabelContext = React.createContext('default')
        export function Label({ text }) {
          return React.createElement('span', null, text)
        }
      `,
      'field.tsx': `
        import { useState } from 'react'
        import { Label } from './library'

        function Input() {
          const [text] = useState('from hook')
          return <Label text={text} />
        }

        export default function () {
          return { Input, Output: Input }
        }
      `,
      'unsupported.tsx': `
        import { createRoot } from 'react-dom/client'
        export default function () {
          return { Input: createRoot, Output: createRoot }
        }
      `
    })
  })

  afterAll(() => {
    fs.rmSync(directory, { recursive: true, force: true })
    delete (globalThis as Record<string, unknown>)[
      CUSTOM_FIELD_EXTERNALS_GLOBAL
    ]
  })

  it('makes the module and its dependencies use the React of the client', async () => {
    const code = await build('field.tsx')
    const react = {
      createContext: vi.fn(() => ({})),
      createElement: vi.fn(),
      useState: vi.fn((value: unknown) => [value])
    }
    const jsxRuntime = { jsx: vi.fn(), jsxs: vi.fn(), Fragment: 'Fragment' }
    Object.assign(globalThis, {
      [CUSTOM_FIELD_EXTERNALS_GLOBAL]: {
        react,
        'react/jsx-runtime': jsxRuntime,
        'react-dom': {}
      }
    })

    const field = run(code)
    expect(react.createContext).toHaveBeenCalledWith('default')
    ;(field.Input as () => unknown)()
    expect(react.useState).toHaveBeenCalledWith('from hook')
    expect(jsxRuntime.jsx).toHaveBeenCalledWith(expect.any(Function), {
      text: 'from hook'
    })
  })

  it('does not bundle a copy of React', async () => {
    const code = await build('field.tsx')

    expect(code).toContain(CUSTOM_FIELD_EXTERNALS_GLOBAL)
    expect(code).not.toContain('react.production')
    expect(code).not.toContain('react.development')
  })

  it('fails the build for a React module that the client does not share', async () => {
    await expect(build('unsupported.tsx')).rejects.toThrow(
      'does not share "react-dom/client"'
    )
  })

  it('tells the developer to load the module through the client', async () => {
    const code = await build('field.tsx')
    delete (globalThis as Record<string, unknown>)[
      CUSTOM_FIELD_EXTERNALS_GLOBAL
    ]

    expect(() => run(code)).toThrow(
      'Load this custom field module through the OpenCRVS client'
    )
  })
})
