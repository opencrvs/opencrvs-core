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
import { moveSupportingCopyToDialogCopy } from './move-supporting-copy-to-dialog-copy'

/** A stand-in for the published toolkit, resolved like any `node_modules` package. */
const TOOLKIT_EVENTS_TYPES = `
export declare const ActionType: {
  readonly NOTIFY: 'NOTIFY'
  readonly DECLARE: 'DECLARE'
  readonly EDIT: 'EDIT'
  readonly REGISTER: 'REGISTER'
  readonly PRINT_CERTIFICATE: 'PRINT_CERTIFICATE'
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

  const changes = moveSupportingCopyToDialogCopy(sourceFile)

  return { changes, text: sourceFile.getFullText() }
}

describe('moveSupportingCopyToDialogCopy', () => {
  vi.spyOn(console, 'log').mockImplementation(() => undefined)
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

  beforeEach(() => {
    warn.mockClear()
  })

  it('renames `supportingCopy` to `dialogCopy` on an action that opens one dialog, keeping its value and comments', () => {
    const { changes, text } =
      rewrite(`import { ActionType } from '@opencrvs/toolkit/events'

export const register = {
  type: ActionType.REGISTER,
  label: REGISTER_LABEL,
  // Shown above the register form
  supportingCopy: {
    id: 'event.birth.action.register.supportingCopy',
    defaultMessage: 'Registering creates a record.',
    description: 'Copy of the register dialog'
  },
  form: REGISTER_FORM
}
`)

    expect(changes).toBe(1)
    expect(text).toBe(`import { ActionType } from '@opencrvs/toolkit/events'

export const register = {
  type: ActionType.REGISTER,
  label: REGISTER_LABEL,
  // Shown above the register form
  dialogCopy: {
    id: 'event.birth.action.register.supportingCopy',
    defaultMessage: 'Registering creates a record.',
    description: 'Copy of the register dialog'
  },
  form: REGISTER_FORM
}
`)
    expect(warn).not.toHaveBeenCalled()
  })

  it('renames a shorthand `supportingCopy` and keeps the name of its value', () => {
    const { text } = rewrite(`
const action = { type: 'REGISTER', label, supportingCopy }
`)

    expect(text).toBe(`
const action = { type: 'REGISTER', label, dialogCopy: supportingCopy }
`)
    expect(warn).not.toHaveBeenCalled()
  })

  it('removes `supportingCopy` of the actions where no dialog showed it', () => {
    const { changes, text } =
      rewrite(`import { ActionType } from '@opencrvs/toolkit/events'

const actions = [
  {
    type: ActionType.EDIT,
    label: EDIT_LABEL,
    // Never shown
    supportingCopy: EDIT_COPY,
    dialogCopy: EDIT_DIALOG_COPY
  },
  { type: ActionType.PRINT_CERTIFICATE, label: PRINT_LABEL, supportingCopy: PRINT_COPY }
]
`)

    expect(changes).toBe(2)
    expect(text).toBe(`import { ActionType } from '@opencrvs/toolkit/events'

const actions = [
  {
    type: ActionType.EDIT,
    label: EDIT_LABEL,
    dialogCopy: EDIT_DIALOG_COPY
  },
  { type: ActionType.PRINT_CERTIFICATE, label: PRINT_LABEL }
]
`)
  })

  describe('`dialogCopy.notify` of the DECLARE action', () => {
    it('moves it to `dialogCopy` of the NOTIFY action, after its label', () => {
      const { changes, text } =
        rewrite(`import { ActionType, defineConfig } from '@opencrvs/toolkit/events'

export const birthEvent = defineConfig({
  id: 'birth',
  actions: [
    {
      type: ActionType.DECLARE,
      label: DECLARE_LABEL,
      dialogCopy: {
        notify: {
          id: 'event.birth.action.declare.notify.copy',
          defaultMessage: 'You are about to notify.',
          description: 'Copy of the notify dialog'
        },
        declare: DECLARE_COPY,
        register: REGISTER_COPY
      }
    },
    {
      type: ActionType.NOTIFY,
      label: NOTIFY_LABEL,
      notificationForm: NOTIFICATION_FORM
    }
  ]
})
`)

      expect(changes).toBe(1)
      expect(text)
        .toBe(`import { ActionType, defineConfig } from '@opencrvs/toolkit/events'

export const birthEvent = defineConfig({
  id: 'birth',
  actions: [
    {
      type: ActionType.DECLARE,
      label: DECLARE_LABEL,
      dialogCopy: {
        declare: DECLARE_COPY,
        register: REGISTER_COPY
      }
    },
    {
      type: ActionType.NOTIFY,
      label: NOTIFY_LABEL,
      dialogCopy: {
        id: 'event.birth.action.declare.notify.copy',
        defaultMessage: 'You are about to notify.',
        description: 'Copy of the notify dialog'
      },
      notificationForm: NOTIFICATION_FORM
    }
  ]
})
`)
      expect(warn).not.toHaveBeenCalled()
    })

    it('removes it when the NOTIFY action has copy of its own, which the notify dialog shows', () => {
      const { changes, text } = rewrite(`
const actions = [
  {
    type: 'DECLARE',
    dialogCopy: { notify: DECLARE_NOTIFY_COPY, declare: DECLARE_COPY }
  },
  { type: 'NOTIFY', label: NOTIFY_LABEL, supportingCopy: NOTIFY_COPY }
]
`)

      expect(changes).toBe(2)
      expect(text).toBe(`
const actions = [
  {
    type: 'DECLARE',
    dialogCopy: { declare: DECLARE_COPY }
  },
  { type: 'NOTIFY', label: NOTIFY_LABEL, dialogCopy: NOTIFY_COPY }
]
`)
    })

    it('removes it when the event has no NOTIFY action', () => {
      const { text } = rewrite(`
const actions = [
  {
    type: 'DECLARE',
    dialogCopy: {
      notify: DECLARE_NOTIFY_COPY,
      declare: DECLARE_COPY
    }
  },
  { type: 'REGISTER', label: REGISTER_LABEL }
]
`)

      expect(text).toBe(`
const actions = [
  {
    type: 'DECLARE',
    dialogCopy: {
      declare: DECLARE_COPY
    }
  },
  { type: 'REGISTER', label: REGISTER_LABEL }
]
`)
    })

    it('logs and keeps it when the NOTIFY action is not written inline', () => {
      const source = `
const actions = [
  { type: 'DECLARE', dialogCopy: { notify: DECLARE_NOTIFY_COPY } },
  notifyAction
]
`
      const { changes, text } = rewrite(source)

      expect(changes).toBe(0)
      expect(text).toBe(source)
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining(
          'Skipped: could not find exactly one NOTIFY action written as an object literal next to the DECLARE action.'
        )
      )
    })

    it('logs and keeps it when `dialogCopy` is not written inline', () => {
      const source = `
const actions = [{ type: 'DECLARE', dialogCopy: DECLARE_DIALOG_COPY }]
`
      const { text } = rewrite(source)

      expect(text).toBe(source)
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining(
          'Skipped: `dialogCopy` of the DECLARE action is not written inline.'
        )
      )
    })
  })

  it('logs and keeps an action that has both `supportingCopy` and `dialogCopy`', () => {
    const source = `
const action = { type: 'REGISTER', supportingCopy: COPY, dialogCopy: OTHER_COPY }
`
    const { changes, text } = rewrite(source)

    expect(changes).toBe(0)
    expect(text).toBe(source)
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(
        'Skipped: the REGISTER action has both `supportingCopy` and `dialogCopy`.'
      )
    )
  })

  it('logs and keeps `supportingCopy` on an action whose type it cannot read', () => {
    const source = `
const action = { type: actionType, supportingCopy: COPY }
`
    const { text } = rewrite(source)

    expect(text).toBe(source)
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Skipped: could not read the action type.')
    )
  })

  it('logs every other reference to `supportingCopy`, and not the name of a variable', () => {
    const source = `
const supportingCopy = COPY
const action = { ...registerAction, supportingCopy }
const copy = registerAction.supportingCopy
`
    const { text } = rewrite(source)

    expect(text).toBe(source)
    expect(warn).toHaveBeenCalledTimes(2)
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(
        'birth.ts:3] Skipped: `supportingCopy` is not on an action written as an object literal. Change it to `dialogCopy` by hand.'
      )
    )
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(
        'birth.ts:4] Skipped: `supportingCopy` is not on an action written as an object literal. Change it to `dialogCopy` by hand.'
      )
    )
  })

  it('is idempotent', () => {
    const { text } = rewrite(`
const actions = [
  { type: 'DECLARE', dialogCopy: { notify: DECLARE_NOTIFY_COPY } },
  { type: 'NOTIFY', label: NOTIFY_LABEL },
  { type: 'REGISTER', supportingCopy: REGISTER_COPY }
]
`)

    expect(rewrite(text)).toMatchObject({ changes: 0, text })
  })
})
