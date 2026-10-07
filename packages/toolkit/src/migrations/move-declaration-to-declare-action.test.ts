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
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Project, ts } from 'ts-morph'
import { moveDeclarationToDeclareAction } from './move-declaration-to-declare-action'

/** A stand-in for the published toolkit, resolved like any `node_modules` package. */
const TOOLKIT_EVENTS_TYPES = `
export declare const ActionType: {
  readonly READ: 'READ'
  readonly DECLARE: 'DECLARE'
  readonly REGISTER: 'REGISTER'
}
export type EventConfig = { id: string }
export declare function defineConfig(config: unknown): EventConfig
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
  const sourceFile = project.createSourceFile('/src/events/birth.ts', source)

  const changes = moveDeclarationToDeclareAction(sourceFile)

  return { changes, text: sourceFile.getFullText() }
}

describe('moveDeclarationToDeclareAction', () => {
  vi.spyOn(console, 'log').mockImplementation(() => undefined)
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

  beforeEach(() => {
    warn.mockClear()
  })

  it('moves a top-level declaration after the label of the DECLARE action', () => {
    const { changes, text } =
      rewrite(`import { ActionType, defineConfig } from '@opencrvs/toolkit/events'

export const birthEvent = defineConfig({
  id: 'birth',
  declaration: BIRTH_DECLARATION_FORM,
  label: 'Birth',
  actions: [
    {
      type: ActionType.READ,
      label: 'Read',
      review: BIRTH_REVIEW
    },
    {
      type: ActionType.DECLARE,
      label: 'Declare',
      review: BIRTH_REVIEW
    }
  ]
})
`)

    expect(changes).toBe(1)
    expect(text)
      .toBe(`import { ActionType, defineConfig } from '@opencrvs/toolkit/events'

export const birthEvent = defineConfig({
  id: 'birth',
  label: 'Birth',
  actions: [
    {
      type: ActionType.READ,
      label: 'Read',
      review: BIRTH_REVIEW
    },
    {
      type: ActionType.DECLARE,
      label: 'Declare',
      declaration: BIRTH_DECLARATION_FORM,
      review: BIRTH_REVIEW
    }
  ]
})
`)
    expect(warn).not.toHaveBeenCalled()
  })

  it('finds a DECLARE action whose type is a string literal', () => {
    const { changes, text } =
      rewrite(`import { defineConfig } from '@opencrvs/toolkit/events'

export const birthEvent = defineConfig({
  id: 'birth',
  declaration: BIRTH_DECLARATION_FORM,
  actions: [{ type: 'DECLARE', label: 'Declare' }]
})
`)

    expect(changes).toBe(1)
    expect(text).toContain(
      "{ type: 'DECLARE', label: 'Declare', declaration: BIRTH_DECLARATION_FORM }"
    )
  })

  it('inserts after type when the DECLARE action has no label', () => {
    const { text } =
      rewrite(`import { ActionType, defineConfig } from '@opencrvs/toolkit/events'

export const birthEvent = defineConfig({
  id: 'birth',
  declaration: BIRTH_DECLARATION_FORM,
  actions: [
    {
      type: ActionType.DECLARE,
      review: BIRTH_REVIEW
    }
  ]
})
`)

    expect(text).toContain(`    {
      type: ActionType.DECLARE,
      declaration: BIRTH_DECLARATION_FORM,
      review: BIRTH_REVIEW
    }`)
  })

  it('moves a shorthand declaration as written', () => {
    const { changes, text } =
      rewrite(`import { ActionType, defineConfig } from '@opencrvs/toolkit/events'

const declaration = BIRTH_DECLARATION_FORM

export const birthEvent = defineConfig({
  id: 'birth',
  declaration,
  actions: [{ type: ActionType.DECLARE, label: 'Declare' }]
})
`)

    expect(changes).toBe(1)
    expect(text).toContain(
      "actions: [{ type: ActionType.DECLARE, label: 'Declare', declaration }]"
    )
  })

  it('moves a declaration given last, dropping the comma before it', () => {
    const { text } =
      rewrite(`import { ActionType, defineConfig } from '@opencrvs/toolkit/events'

export const birthEvent = defineConfig({
  id: 'birth',
  actions: [{ type: ActionType.DECLARE, label: 'Declare' }],
  declaration: BIRTH_DECLARATION_FORM
})
`)

    expect(text).toContain(`defineConfig({
  id: 'birth',
  actions: [{ type: ActionType.DECLARE, label: 'Declare', declaration: BIRTH_DECLARATION_FORM }]
})`)
  })

  it('moves a multi-line declaration with its comment, re-indented', () => {
    const { text } =
      rewrite(`import { ActionType, defineConfig } from '@opencrvs/toolkit/events'

export const birthEvent = defineConfig({
  id: 'birth',
  /** The birth declaration form */
  declaration: {
    label: 'Birth',
    pages: []
  },
  actions: [
    {
      type: ActionType.DECLARE,
      label: 'Declare'
    }
  ]
})
`)

    expect(text).toContain(`defineConfig({
  id: 'birth',
  actions: [
    {
      type: ActionType.DECLARE,
      label: 'Declare',
      /** The birth declaration form */
      declaration: {
        label: 'Birth',
        pages: []
      }
    }
  ]
})`)
  })

  it('moves the declarations of every config in the file', () => {
    const { changes, text } =
      rewrite(`import { ActionType, defineConfig } from '@opencrvs/toolkit/events'

export const birthEvent = defineConfig({
  id: 'birth',
  declaration: BIRTH_DECLARATION_FORM,
  actions: [{ type: ActionType.DECLARE, label: 'Declare' }]
})

export const deathEvent = defineConfig({
  id: 'death',
  declaration: DEATH_DECLARATION_FORM,
  actions: [{ type: ActionType.DECLARE, label: 'Declare' }]
})
`)

    expect(changes).toBe(2)
    expect(text).toContain(
      "actions: [{ type: ActionType.DECLARE, label: 'Declare', declaration: BIRTH_DECLARATION_FORM }]"
    )
    expect(text).toContain(
      "actions: [{ type: ActionType.DECLARE, label: 'Declare', declaration: DEATH_DECLARATION_FORM }]"
    )
  })

  it('follows an aliased defineConfig import', () => {
    const { changes } =
      rewrite(`import { ActionType, defineConfig as define } from '@opencrvs/toolkit/events'

export const birthEvent = define({
  id: 'birth',
  declaration: BIRTH_DECLARATION_FORM,
  actions: [{ type: ActionType.DECLARE, label: 'Declare' }]
})
`)

    expect(changes).toBe(1)
  })

  it('is idempotent', () => {
    const source = `import { ActionType, defineConfig } from '@opencrvs/toolkit/events'

export const birthEvent = defineConfig({
  id: 'birth',
  actions: [
    {
      type: ActionType.DECLARE,
      label: 'Declare',
      declaration: BIRTH_DECLARATION_FORM
    }
  ]
})
`

    const { changes, text } = rewrite(source)

    expect(changes).toBe(0)
    expect(text).toBe(source)
    expect(warn).not.toHaveBeenCalled()
  })

  it('leaves a defineConfig declared by the country config alone', () => {
    const source = `function defineConfig(config: unknown) {
  return config
}

export const birthEvent = defineConfig({
  id: 'birth',
  declaration: BIRTH_DECLARATION_FORM,
  actions: [{ type: 'DECLARE', label: 'Declare' }]
})
`

    const { changes, text } = rewrite(source)

    expect(changes).toBe(0)
    expect(text).toBe(source)
  })

  it('warns and skips when the DECLARE action already has a declaration', () => {
    const source = `import { ActionType, defineConfig } from '@opencrvs/toolkit/events'

export const birthEvent = defineConfig({
  id: 'birth',
  declaration: BIRTH_DECLARATION_FORM,
  actions: [
    {
      type: ActionType.DECLARE,
      declaration: OTHER_DECLARATION_FORM
    }
  ]
})
`

    const { changes, text } = rewrite(source)

    expect(changes).toBe(0)
    expect(text).toBe(source)
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('set both at the top level and on the DECLARE')
    )
  })

  it('warns and skips when actions is not an array literal', () => {
    const source = `import { defineConfig } from '@opencrvs/toolkit/events'

export const birthEvent = defineConfig({
  id: 'birth',
  declaration: BIRTH_DECLARATION_FORM,
  actions: BIRTH_ACTIONS
})
`

    const { changes, text } = rewrite(source)

    expect(changes).toBe(0)
    expect(text).toBe(source)
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('`actions` is not an array literal')
    )
  })

  it('warns and skips when an action is not written inline', () => {
    const source = `import { ActionType, defineConfig } from '@opencrvs/toolkit/events'

export const birthEvent = defineConfig({
  id: 'birth',
  declaration: BIRTH_DECLARATION_FORM,
  actions: [
    { type: ActionType.DECLARE, label: 'Declare' },
    ...SHARED_ACTIONS
  ]
})
`

    const { changes, text } = rewrite(source)

    expect(changes).toBe(0)
    expect(text).toBe(source)
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('could not find exactly one DECLARE action')
    )
  })

  it('moves past an action not written inline whose type is another action', () => {
    const { changes, text } =
      rewrite(`import { ActionType, defineConfig } from '@opencrvs/toolkit/events'

const registerAction = { type: ActionType.REGISTER, label: 'Register' }
const sharedActions = [registerAction]

export const birthEvent = defineConfig({
  id: 'birth',
  declaration: BIRTH_DECLARATION_FORM,
  actions: [
    { type: ActionType.DECLARE, label: 'Declare' },
    registerAction,
    ...sharedActions
  ]
})
`)

    expect(changes).toBe(1)
    expect(text).toContain(
      "{ type: ActionType.DECLARE, label: 'Declare', declaration: BIRTH_DECLARATION_FORM }"
    )
    expect(warn).not.toHaveBeenCalled()
  })

  it('warns and skips when an action not written inline may be DECLARE', () => {
    const source = `import { ActionType, defineConfig } from '@opencrvs/toolkit/events'

const declareAction: { type: string; label: string } = {
  type: ActionType.DECLARE,
  label: 'Declare'
}

export const birthEvent = defineConfig({
  id: 'birth',
  declaration: BIRTH_DECLARATION_FORM,
  actions: [declareAction, { type: ActionType.REGISTER, label: 'Register' }]
})
`

    const { changes, text } = rewrite(source)

    expect(changes).toBe(0)
    expect(text).toBe(source)
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('could not find exactly one DECLARE action')
    )
  })

  it('warns and skips when there is no DECLARE action', () => {
    const { changes } =
      rewrite(`import { ActionType, defineConfig } from '@opencrvs/toolkit/events'

export const birthEvent = defineConfig({
  id: 'birth',
  declaration: BIRTH_DECLARATION_FORM,
  actions: [{ type: ActionType.REGISTER, label: 'Register' }]
})
`)

    expect(changes).toBe(0)
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('could not find exactly one DECLARE action')
    )
  })
})
