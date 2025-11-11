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
import { ActionStatus } from '../ActionDocument'
import { ActionType } from '../ActionType'
import { EventConfig } from '../EventConfig'
import { EventDocument } from '../EventDocument'
import { field } from '../field'
import { FieldType } from '../FieldType'
import { PageTypes } from '../PageConfig'
import { resolveEventCustomFlags } from './flags'
import { subDays, formatISO } from 'date-fns'
import { not, user } from '../../conditionals/conditionals'

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
        },
        {
          id: 'executed-by-admin-flag',
          operation: 'add',
          conditional: user.hasRole('ADMIN')
        }
      ]
    },
    {
      type: ActionType.REGISTER,
      flags: [
        {
          id: 'too-small-number-flag',
          operation: 'add',
          conditional: field('number-field').isLessThan(10)
        },
        {
          id: 'executed-by-admin-flag',
          operation: 'remove',
          conditional: not(user.hasRole('ADMIN'))
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

const now = new Date()

describe('resolveEventCustomFlags()', () => {
  test('should add flag when conditional is met', () => {
    const event: DeepPartial<EventDocument> = {
      actions: [
        {
          type: ActionType.DECLARE,
          declaration: { 'number-field': 101 },
          createdAt: formatISO(now),
          status: ActionStatus.Accepted
        }
      ]
    }

    // @ts-expect-error - allow partial actions and event config
    const flags = resolveEventCustomFlags(event, eventConfig)
    expect(flags).toEqual(['too-large-number-flag'])
  })

  test('should not add flag when conditional is not met', () => {
    const event: DeepPartial<EventDocument> = {
      actions: [
        {
          type: ActionType.DECLARE,
          declaration: { 'number-field': 99 },
          createdAt: formatISO(now),
          status: ActionStatus.Accepted
        }
      ]
    }

    // @ts-expect-error - allow partial actions and event config
    const flags = resolveEventCustomFlags(event, eventConfig)
    expect(flags).toEqual([])
  })

  test('should not add flag when action does not have a flag config', () => {
    const event: DeepPartial<EventDocument> = {
      actions: [
        {
          type: ActionType.PRINT_CERTIFICATE,
          declaration: { 'number-field': 101 },
          createdAt: formatISO(now),
          status: ActionStatus.Accepted
        }
      ]
    }

    // @ts-expect-error - allow partial actions and event config
    const flags = resolveEventCustomFlags(event, eventConfig)
    expect(flags).toEqual([])
  })

  test('flag conditional can refer to fields in previous declaration', () => {
    const event: DeepPartial<EventDocument> = {
      actions: [
        {
          type: ActionType.DECLARE,
          declaration: { 'number-field': 4 },
          createdAt: formatISO(subDays(now, 1)),
          status: ActionStatus.Accepted
        },
        {
          type: ActionType.REGISTER,
          declaration: {},
          createdAt: formatISO(now),
          status: ActionStatus.Accepted
        }
      ]
    }

    // @ts-expect-error - allow partial actions and event config
    const flags = resolveEventCustomFlags(event, eventConfig)
    expect(flags).toEqual(['too-small-number-flag'])
  })

  test('should ignore actions that are not accepted', () => {
    const event: DeepPartial<EventDocument> = {
      actions: [
        {
          type: ActionType.DECLARE,
          declaration: { 'number-field': 101 },
          createdAt: formatISO(now),
          status: ActionStatus.Requested
        }
      ]
    }

    // @ts-expect-error - allow partial actions and event config
    const flags = resolveEventCustomFlags(event, eventConfig)
    expect(flags).toEqual([])
  })

  test('should resolve flag conditional which refers to user role', () => {
    const event: DeepPartial<EventDocument> = {
      actions: [
        {
          type: ActionType.DECLARE,
          declaration: {},
          createdAt: formatISO(now),
          status: ActionStatus.Accepted,
          createdByRole: 'ADMIN'
        }
      ]
    }

    // @ts-expect-error - allow partial actions and event config
    const flags = resolveEventCustomFlags(event, eventConfig)
    expect(flags).toEqual(['executed-by-admin-flag'])
  })

  test('should add and remove flags', () => {
    const event: DeepPartial<EventDocument> = {
      actions: [
        {
          type: ActionType.DECLARE,
          declaration: {},
          createdAt: formatISO(now),
          status: ActionStatus.Accepted,
          createdByRole: 'ADMIN'
        },
        {
          type: ActionType.REGISTER,
          declaration: {},
          createdAt: formatISO(now),
          status: ActionStatus.Accepted,
          createdByRole: 'USER'
        }
      ]
    }

    // @ts-expect-error - allow partial actions and event config
    const flags = resolveEventCustomFlags(event, eventConfig)
    expect(flags).toEqual([])
  })

  test('should not remove flag if removal conditional is not met', () => {
    const event: DeepPartial<EventDocument> = {
      actions: [
        {
          type: ActionType.DECLARE,
          declaration: {},
          createdAt: formatISO(now),
          status: ActionStatus.Accepted,
          createdByRole: 'ADMIN'
        },
        {
          type: ActionType.REGISTER,
          declaration: {},
          createdAt: formatISO(now),
          status: ActionStatus.Accepted,
          createdByRole: 'ADMIN'
        }
      ]
    }

    // @ts-expect-error - allow partial actions and event config
    const flags = resolveEventCustomFlags(event, eventConfig)
    expect(flags).toEqual(['executed-by-admin-flag'])
  })
})
