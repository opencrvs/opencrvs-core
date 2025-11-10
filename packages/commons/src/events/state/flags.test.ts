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
import { Action } from '../ActionDocument'
import { ActionType } from '../ActionType'
import { EventConfig } from '../EventConfig'
import { field } from '../field'
import { FieldType } from '../FieldType'
import { PageTypes } from '../PageConfig'
import { resolveCustomFlagsFromActions } from './flags'

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T

const eventConfig: DeepPartial<EventConfig> = {
  actions: [
    {
      type: ActionType.DECLARE,
      flags: [
        {
          id: 'too-large-number-flag',
          operation: 'add',
          conditional: field('number-field').isGreaterThan(100)
        }
      ]
    }
  ],
  declaration: {
    label: { id: '', defaultMessage: '', description: '' },
    pages: [
      {
        id: 'first-page',
        type: PageTypes.enum.FORM,
        title: { id: '', defaultMessage: '', description: '' },
        fields: [{ id: 'number-field', type: FieldType.NUMBER }]
      }
    ]
  }
}

describe('resolveCustomFlagsFromActions()', () => {
  test('should add flag when conditional is met', () => {
    const actions: DeepPartial<Action>[] = [
      { type: ActionType.DECLARE, declaration: { 'number-field': 101 } }
    ]

    // @ts-expect-error - allow partial actions and event config
    const flags = resolveCustomFlagsFromActions(actions, eventConfig)

    expect(flags).toEqual(['too-large-number-flag'])
  })

  test('should not add flag when conditional is not met', () => {
    const actions: DeepPartial<Action>[] = [
      { type: ActionType.DECLARE, declaration: { 'number-field': 99 } }
    ]

    // @ts-expect-error - allow partial actions and event config
    const flags = resolveCustomFlagsFromActions(actions, eventConfig)

    expect(flags).toEqual([])
  })

  test('should not add flag when action does not have a flag config', () => {
    const actions: DeepPartial<Action>[] = [
      { type: ActionType.REGISTER, declaration: { 'number-field': 101 } }
    ]

    // @ts-expect-error - allow partial actions and event config
    const flags = resolveCustomFlagsFromActions(actions, eventConfig)

    expect(flags).toEqual([])
  })

  test.todo(
    'flag conditional can refer to fields in previous declaration',
    () => {
      const actions: DeepPartial<Action>[] = [
        { type: ActionType.DECLARE, declaration: { 'number-field': 101 } },
        { type: ActionType.REGISTER, declaration: { 'number-field': 99 } }
      ]

      // @ts-expect-error - allow partial actions and event config
      const flags = resolveCustomFlagsFromActions(actions, eventConfig)

      expect(flags).toEqual([])
    }
  )
})
