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
import { addNotifyConfig } from './add-notify-config'

/** A stand-in for the published toolkit, resolved like any `node_modules` package. */
const TOOLKIT_EVENTS_TYPES = `
export declare const ActionType: {
  readonly READ: 'READ'
  readonly NOTIFY: 'NOTIFY'
  readonly DECLARE: 'DECLARE'
}
export type EventConfig = { id: string }
export declare function defineConfig(config: unknown): EventConfig
export declare function toNotificationForm<T>(declaration: T): T
export declare function toNotificationReview<T>(review: T): T
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

  const changes = addNotifyConfig(sourceFile)

  return { changes, text: sourceFile.getFullText() }
}

describe('addNotifyConfig', () => {
  vi.spyOn(console, 'log').mockImplementation(() => undefined)
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

  beforeEach(() => {
    warn.mockClear()
  })

  it('adds the notification form and review made from the DECLARE action after the NOTIFY label', () => {
    const { changes, text } =
      rewrite(`import { ActionType, defineConfig } from '@opencrvs/toolkit/events'

export const birthEvent = defineConfig({
  id: 'birth',
  actions: [
    {
      type: ActionType.NOTIFY,
      label: 'Notify',
      form: NOTIFY_DIALOG
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

    expect(changes).toBe(1)
    expect(text)
      .toBe(`import { ActionType, defineConfig, toNotificationForm, toNotificationReview } from '@opencrvs/toolkit/events'

export const birthEvent = defineConfig({
  id: 'birth',
  actions: [
    {
      type: ActionType.NOTIFY,
      label: 'Notify',
      notificationForm: toNotificationForm(BIRTH_DECLARATION_FORM),
      review: toNotificationReview(BIRTH_REVIEW),
      form: NOTIFY_DIALOG
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

  it('adds a comma after the label when it is the last property', () => {
    const { text } =
      rewrite(`import { ActionType, defineConfig } from '@opencrvs/toolkit/events'

export const birthEvent = defineConfig({
  id: 'birth',
  actions: [
    {
      type: ActionType.NOTIFY,
      label: 'Notify'
    },
    {
      type: ActionType.DECLARE,
      declaration: BIRTH_DECLARATION_FORM,
      review: BIRTH_REVIEW
    }
  ]
})
`)

    expect(text).toContain(`    {
      type: ActionType.NOTIFY,
      label: 'Notify',
      notificationForm: toNotificationForm(BIRTH_DECLARATION_FORM),
      review: toNotificationReview(BIRTH_REVIEW)
    },`)
  })

  it('adds the properties inline to a NOTIFY action written on one line', () => {
    const { text } =
      rewrite(`import { defineConfig } from '@opencrvs/toolkit/events'

export const birthEvent = defineConfig({
  id: 'birth',
  actions: [
    { type: 'NOTIFY', label: 'Notify' },
    { type: 'DECLARE', declaration: BIRTH_DECLARATION_FORM, review: BIRTH_REVIEW }
  ]
})
`)

    expect(text).toContain(
      "{ type: 'NOTIFY', label: 'Notify', notificationForm: toNotificationForm(BIRTH_DECLARATION_FORM), review: toNotificationReview(BIRTH_REVIEW) }"
    )
  })

  it('only adds what is missing, and imports only the helper it uses', () => {
    const { changes, text } =
      rewrite(`import { ActionType, defineConfig } from '@opencrvs/toolkit/events'

export const birthEvent = defineConfig({
  id: 'birth',
  actions: [
    {
      type: ActionType.NOTIFY,
      label: 'Notify',
      notificationForm: BIRTH_NOTIFICATION_FORM
    },
    {
      type: ActionType.DECLARE,
      declaration: BIRTH_DECLARATION_FORM,
      review: BIRTH_REVIEW
    }
  ]
})
`)

    expect(changes).toBe(1)
    expect(text).toContain(
      "import { ActionType, defineConfig, toNotificationReview } from '@opencrvs/toolkit/events'"
    )
    expect(text).toContain(`      label: 'Notify',
      review: toNotificationReview(BIRTH_REVIEW),
      notificationForm: BIRTH_NOTIFICATION_FORM`)
  })

  it('leaves a NOTIFY action that already has both unchanged', () => {
    const source = `import { ActionType, defineConfig } from '@opencrvs/toolkit/events'

export const birthEvent = defineConfig({
  id: 'birth',
  actions: [
    {
      type: ActionType.NOTIFY,
      notificationForm: BIRTH_NOTIFICATION_FORM,
      review: BIRTH_NOTIFY_REVIEW
    },
    {
      type: ActionType.DECLARE,
      declaration: BIRTH_DECLARATION_FORM,
      review: BIRTH_REVIEW
    }
  ]
})
`
    const { changes, text } = rewrite(source)

    expect(changes).toBe(0)
    expect(text).toBe(source)
    expect(warn).not.toHaveBeenCalled()
  })

  it('copies a top-level declaration not yet moved onto the DECLARE action', () => {
    const { text } =
      rewrite(`import { ActionType, defineConfig } from '@opencrvs/toolkit/events'

export const birthEvent = defineConfig({
  id: 'birth',
  declaration: BIRTH_DECLARATION_FORM,
  actions: [
    {
      type: ActionType.NOTIFY,
      label: 'Notify'
    },
    {
      type: ActionType.DECLARE,
      review: BIRTH_REVIEW
    }
  ]
})
`)

    expect(text).toContain(
      'notificationForm: toNotificationForm(BIRTH_DECLARATION_FORM)'
    )
  })

  it('uses the local name of a helper the file imports under an alias', () => {
    const { text } = rewrite(`import {
  ActionType,
  defineConfig,
  toNotificationForm as notificationFormOf,
  toNotificationReview as notificationReviewOf
} from '@opencrvs/toolkit/events'

export const birthEvent = defineConfig({
  id: 'birth',
  actions: [
    {
      type: ActionType.NOTIFY,
      label: 'Notify'
    },
    {
      type: ActionType.DECLARE,
      declaration: BIRTH_DECLARATION_FORM,
      review: BIRTH_REVIEW
    }
  ]
})
`)

    expect(text).toContain(
      'notificationForm: notificationFormOf(BIRTH_DECLARATION_FORM)'
    )
    expect(text).toContain('review: notificationReviewOf(BIRTH_REVIEW)')
    expect(text).not.toContain('  toNotificationForm,')
  })

  it('logs an event without a NOTIFY action, and changes nothing', () => {
    const source = `import { ActionType, defineConfig } from '@opencrvs/toolkit/events'

export const birthEvent = defineConfig({
  id: 'birth',
  actions: [
    {
      type: ActionType.DECLARE,
      declaration: BIRTH_DECLARATION_FORM,
      review: BIRTH_REVIEW
    }
  ]
})
`
    const { changes, text } = rewrite(source)

    expect(changes).toBe(0)
    expect(text).toBe(source)
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('No NOTIFY action')
    )
  })

  it('skips a property whose DECLARE source is not given as a name', () => {
    const { text } =
      rewrite(`import { ActionType, defineConfig } from '@opencrvs/toolkit/events'

export const birthEvent = defineConfig({
  id: 'birth',
  actions: [
    {
      type: ActionType.NOTIFY,
      label: 'Notify'
    },
    {
      type: ActionType.DECLARE,
      declaration: BIRTH_DECLARATION_FORM,
      review: { title: 'Review', fields: [] }
    }
  ]
})
`)

    expect(text).toContain(
      'notificationForm: toNotificationForm(BIRTH_DECLARATION_FORM)'
    )
    expect(text).not.toContain('toNotificationReview')
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(
        "the DECLARE action's `review` is not given as a name"
      )
    )
  })

  it('skips a NOTIFY action not written inline', () => {
    const source = `import { ActionType, defineConfig } from '@opencrvs/toolkit/events'

export const birthEvent = defineConfig({
  id: 'birth',
  actions: [
    NOTIFY_ACTION,
    {
      type: ActionType.DECLARE,
      declaration: BIRTH_DECLARATION_FORM,
      review: BIRTH_REVIEW
    }
  ]
})
`
    const { changes, text } = rewrite(source)

    expect(changes).toBe(0)
    expect(text).toBe(source)
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('could not find exactly one NOTIFY action')
    )
  })
})
