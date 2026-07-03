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
import { ActionConfig } from './ActionConfig'
import { ActionType } from './ActionType'

const label = {
  defaultMessage: 'Test action',
  description: 'Test action label',
  id: 'events.actionConfig.test.label'
}

describe('DuplicateDetectedConfig', () => {
  it('accepts a config with flags', () => {
    const res = ActionConfig.safeParse({
      type: ActionType.DUPLICATE_DETECTED,
      flags: [{ id: 'custom-duplicate-flag', operation: 'add' }]
    })

    expect(res.success).toBe(true)
  })

  it('defaults flags to an empty array when omitted', () => {
    const res = ActionConfig.safeParse({
      type: ActionType.DUPLICATE_DETECTED
    })

    expect(res.success).toBe(true)
    if (res.success && res.data.type === ActionType.DUPLICATE_DETECTED) {
      expect(res.data.flags).toEqual([])
    }
  })

  it('strips unsupported fields like label, since it is never rendered', () => {
    const res = ActionConfig.safeParse({
      type: ActionType.DUPLICATE_DETECTED,
      flags: [],
      label
    })

    expect(res.success).toBe(true)
    expect(res.data).not.toHaveProperty('label')
  })

  it('requires a type', () => {
    const res = ActionConfig.safeParse({
      flags: []
    })

    expect(res.success).toBe(false)
  })
})

describe.each([
  ActionType.ASSIGN,
  ActionType.UNASSIGN,
  ActionType.DELETE,
  ActionType.APPROVE_CORRECTION,
  ActionType.REJECT_CORRECTION,
  ActionType.MARK_AS_DUPLICATE,
  ActionType.MARK_AS_NOT_DUPLICATE
])('%s action config', (type) => {
  it('accepts label, flags, icon and conditionals', () => {
    const res = ActionConfig.safeParse({
      type,
      label,
      icon: 'Trash',
      flags: [{ id: 'custom-flag', operation: 'add' }],
      conditionals: [{ type: 'SHOW', conditional: true }]
    })

    expect(res.success).toBe(true)
  })

  it('accepts a minimal config with only a label', () => {
    const res = ActionConfig.safeParse({ type, label })

    expect(res.success).toBe(true)
  })

  it('requires a label', () => {
    const res = ActionConfig.safeParse({ type })

    expect(res.success).toBe(false)
  })
})
