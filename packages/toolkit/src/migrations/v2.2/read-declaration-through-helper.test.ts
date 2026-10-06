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
import { describe, expect, it, vi } from 'vitest'
import { Project, ts } from 'ts-morph'
import { rewriteDeclarationReads } from './read-declaration-through-helper'

/** A stand-in for the published toolkit, resolved like any `node_modules` package. */
const TOOLKIT_EVENTS_TYPES = `
export type DeclarationFormConfig = { label: string; pages: Array<{ fields: Array<{ id: string; analytics?: boolean }> }> }
export type EventConfig = { id: string; actions: Array<{ type: string }> }
export type EventState = Record<string, unknown>
export type EventDocument = { declaration: EventState }
export declare function getDeclaration(config: EventConfig): DeclarationFormConfig
`

function rewrite(source: string) {
  const project = new Project({
    useInMemoryFileSystem: true,
    compilerOptions: {
      strict: true,
      moduleResolution: ts.ModuleResolutionKind.Node10
    }
  })
  project.createSourceFile(
    '/node_modules/@opencrvs/toolkit/events/index.d.ts',
    TOOLKIT_EVENTS_TYPES
  )
  const sourceFile = project.createSourceFile('/src/analytics.ts', source)

  const changes = rewriteDeclarationReads(sourceFile)

  return { changes, text: sourceFile.getFullText() }
}

describe('rewriteDeclarationReads', () => {
  vi.spyOn(console, 'log').mockImplementation(() => undefined)
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

  it('rewrites a declaration read on an EventConfig and adds the import', () => {
    const { changes, text } =
      rewrite(`import { EventConfig } from '@opencrvs/toolkit/events'

export function analyticsFields(eventConfig: EventConfig) {
  return eventConfig.declaration.pages.flatMap((page) => page.fields)
}
`)

    expect(changes).toBe(1)
    expect(text).toContain(
      'return getDeclaration(eventConfig).pages.flatMap((page) => page.fields)'
    )
    expect(text).toContain(
      "import { EventConfig, getDeclaration } from '@opencrvs/toolkit/events'"
    )
  })

  it('keeps a multi-line toolkit import multi-line', () => {
    const { text } = rewrite(`import {
  EventConfig,
  EventState
} from '@opencrvs/toolkit/events'

export function pages(state: EventState, eventConfig: EventConfig) {
  return eventConfig.declaration.pages
}
`)

    expect(text).toContain(`import {
  EventConfig,
  EventState,
  getDeclaration
} from '@opencrvs/toolkit/events'`)
  })

  it('leaves record data with a declaration property alone', () => {
    const { changes, text } =
      rewrite(`import { EventDocument } from '@opencrvs/toolkit/events'

export function childName(event: EventDocument) {
  return event.declaration['child.name']
}
`)

    expect(changes).toBe(0)
    expect(text).toContain("return event.declaration['child.name']")
    expect(text).not.toContain('getDeclaration')
  })

  it('leaves an EventConfig type declared by the country config alone', () => {
    const { changes } =
      rewrite(`type EventConfig = { declaration: { pages: [] } }

export function pages(eventConfig: EventConfig) {
  return eventConfig.declaration.pages
}
`)

    expect(changes).toBe(0)
  })

  it('rewrites reads on a nullable EventConfig once it has been narrowed', () => {
    const { changes, text } =
      rewrite(`import { EventConfig } from '@opencrvs/toolkit/events'

export function pages(eventConfig: EventConfig | undefined) {
  if (!eventConfig) {
    return []
  }
  return eventConfig.declaration.pages
}
`)

    expect(changes).toBe(1)
    expect(text).toContain('return getDeclaration(eventConfig).pages')
  })

  it('adds a value import when the file only imports toolkit types', () => {
    const { text } =
      rewrite(`import type { EventConfig as Config } from '@opencrvs/toolkit/events'

export const label = (config: Config) => config.declaration.label
`)

    expect(text).toContain('getDeclaration(config).label')
    expect(text).toContain(
      "import type { EventConfig as Config } from '@opencrvs/toolkit/events'"
    )
    expect(text).toContain(
      "import { getDeclaration } from '@opencrvs/toolkit/events'"
    )
  })

  it('skips optional chains and assignments, and warns about them', () => {
    warn.mockClear()

    const { changes, text } =
      rewrite(`import { EventConfig } from '@opencrvs/toolkit/events'

export function touch(eventConfig: EventConfig | undefined, other: EventConfig) {
  const pages = eventConfig?.declaration.pages
  // @ts-expect-error the property no longer exists
  other.declaration = undefined
  return pages
}
`)

    expect(changes).toBe(0)
    expect(text).toContain('eventConfig?.declaration.pages')
    expect(warn).toHaveBeenCalledTimes(2)
  })

  it('warns about destructuring declaration from an EventConfig', () => {
    warn.mockClear()

    rewrite(`import { EventConfig } from '@opencrvs/toolkit/events'

export function pages(eventConfig: EventConfig) {
  // @ts-expect-error the property no longer exists
  const { declaration } = eventConfig
  return declaration
}
`)

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Destructures `declaration` from an EventConfig')
    )
  })

  it('is idempotent', () => {
    const source = `import { EventConfig } from '@opencrvs/toolkit/events'

export function analyticsFields(eventConfig: EventConfig) {
  return eventConfig.declaration.pages
}
`
    const once = rewrite(source)
    const twice = rewrite(once.text)

    expect(twice.changes).toBe(0)
    expect(twice.text).toBe(once.text)
  })
})
