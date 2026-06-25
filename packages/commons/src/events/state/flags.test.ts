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

import { Action, ActionStatus } from '../ActionDocument'
import { ActionType } from '../ActionType'
import { EventConfig } from '../EventConfig'
import { EventDocument } from '../EventDocument'
import { field } from '../field'
import { FieldType } from '../FieldType'
import { PageTypes } from '../PageConfig'
import {
  findPendingCorrectionAction,
  getEventFlags,
  resolveEventCustomFlags
} from './flags'
import { InherentFlags } from '../Flag'
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
    },
    {
      type: ActionType.PRINT_CERTIFICATE,
      flags: [
        {
          id: 'pending-certified-copy-issuance',
          operation: 'add',
          conditional: field('text-field').isEqualTo('ADD_FLAG_IN_PRINT')
        }
      ]
    },
    {
      type: ActionType.CUSTOM,
      customActionType: 'ADD_FLAG_ALWAYS',
      flags: [
        {
          id: 'always-added-flag',
          operation: 'add'
        }
      ]
    },
    {
      type: ActionType.CUSTOM,
      customActionType: 'FOOBAR',
      flags: []
    },
    {
      type: ActionType.CUSTOM,
      customActionType: 'VALIDATE_DECLARATION',
      flags: [{ id: InherentFlags.REJECTED, operation: 'remove' }]
    },
    {
      type: ActionType.CUSTOM,
      customActionType: 'COMPLETE_NOTIFICATION',
      flags: [{ id: InherentFlags.INCOMPLETE, operation: 'remove' }]
    },
    { type: ActionType.PRINT_CERTIFICATE, flags: [] }
  ],
  declaration: {
    label: { id: '', defaultMessage: '', description: '' },
    pages: [
      {
        id: 'first-page',
        type: PageTypes.enum.FORM,
        title: { id: '', defaultMessage: '', description: '' },
        fields: [
          { id: 'number-field', type: FieldType.NUMBER },
          { id: 'text-field', type: FieldType.TEXT }
        ]
      }
    ]
  }
}

const now = new Date()

describe('resolveEventCustomFlags()', () => {
  test('should always add flag which does not have a conditional', () => {
    const event: DeepPartial<EventDocument> = {
      actions: [
        {
          type: ActionType.CUSTOM,
          customActionType: 'ADD_FLAG_ALWAYS',
          declaration: {},
          createdAt: formatISO(now),
          status: ActionStatus.Accepted
        }
      ]
    }

    // @ts-expect-error - allow partial actions and event config
    const flags = resolveEventCustomFlags(event, eventConfig)
    expect(flags).toEqual(['always-added-flag'])
  })

  test('should not add flag for custom action type which does not have a flag config', () => {
    const event: DeepPartial<EventDocument> = {
      actions: [
        {
          type: ActionType.CUSTOM,
          customActionType: 'FOOBAR',
          declaration: {},
          createdAt: formatISO(now),
          status: ActionStatus.Accepted
        }
      ]
    }

    // @ts-expect-error - allow partial actions and event config
    const flags = resolveEventCustomFlags(event, eventConfig)
    expect(flags).toEqual([])
  })

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

  test('should add flag when conditional is met for Print Certificate action', () => {
    const event: DeepPartial<EventDocument> = {
      actions: [
        {
          type: ActionType.PRINT_CERTIFICATE,
          declaration: {},
          annotation: { 'text-field': 'ADD_FLAG_IN_PRINT' },
          createdAt: formatISO(now),
          status: ActionStatus.Accepted
        }
      ]
    }

    // @ts-expect-error - allow partial actions and event config
    const flags = resolveEventCustomFlags(event, eventConfig)
    expect(flags).toEqual(['pending-certified-copy-issuance'])
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

describe('findPendingCorrectionAction()', () => {
  const a = (type: ActionType, status: ActionStatus = ActionStatus.Accepted) =>
    ({ type, status }) as Action

  test('returns undefined for empty actions', () => {
    expect(findPendingCorrectionAction([])).toBeUndefined()
  })

  test('returns the request when it is the last write action', () => {
    const req = a(ActionType.REQUEST_CORRECTION)
    expect(findPendingCorrectionAction([req])).toBe(req)
  })

  test('returns the request when followed by non-correction actions', () => {
    const req = a(ActionType.REQUEST_CORRECTION)
    expect(findPendingCorrectionAction([req, a(ActionType.CUSTOM)])).toBe(req)
  })

  test('returns undefined when the request has been approved', () => {
    expect(
      findPendingCorrectionAction([
        a(ActionType.REQUEST_CORRECTION),
        a(ActionType.APPROVE_CORRECTION)
      ])
    ).toBeUndefined()
  })

  test('returns undefined when the request has been rejected', () => {
    expect(
      findPendingCorrectionAction([
        a(ActionType.REQUEST_CORRECTION),
        a(ActionType.REJECT_CORRECTION)
      ])
    ).toBeUndefined()
  })

  test('returns the second request after a completed correction cycle', () => {
    const secondReq = a(ActionType.REQUEST_CORRECTION)
    expect(
      findPendingCorrectionAction([
        a(ActionType.REQUEST_CORRECTION),
        a(ActionType.APPROVE_CORRECTION),
        secondReq,
        a(ActionType.CUSTOM)
      ])
    ).toBe(secondReq)
  })
})

describe('getEventFlags() – rejected flag', () => {
  const getFlagsFor = (types: ActionType[]) => {
    const event = {
      actions: types.map((type, idx) => ({
        type,
        declaration: {},
        createdAt: formatISO(subDays(now, types.length - idx)),
        status: ActionStatus.Accepted
      }))
    }

    // @ts-expect-error - allow partial event document and event config
    return getEventFlags(event, eventConfig)
  }

  test('is not present for a fresh declaration', () => {
    expect(getFlagsFor([ActionType.DECLARE])).not.toContain(
      InherentFlags.REJECTED
    )
  })

  test('is present after a REJECT', () => {
    expect(getFlagsFor([ActionType.DECLARE, ActionType.REJECT])).toContain(
      InherentFlags.REJECTED
    )
  })

  test('is cleared when the record is re-declared after REJECT', () => {
    expect(
      getFlagsFor([ActionType.DECLARE, ActionType.REJECT, ActionType.DECLARE])
    ).not.toContain(InherentFlags.REJECTED)
  })

  test('is cleared when the record is edited after REJECT', () => {
    expect(
      getFlagsFor([ActionType.DECLARE, ActionType.REJECT, ActionType.EDIT])
    ).not.toContain(InherentFlags.REJECTED)
  })

  test('is cleared when the record is notified after REJECT', () => {
    expect(
      getFlagsFor([ActionType.NOTIFY, ActionType.REJECT, ActionType.NOTIFY])
    ).not.toContain(InherentFlags.REJECTED)
  })

  test('is cleared when the record is registered after REJECT', () => {
    expect(
      getFlagsFor([ActionType.DECLARE, ActionType.REJECT, ActionType.REGISTER])
    ).not.toContain(InherentFlags.REJECTED)
  })

  test('persists when REJECT is followed by actions that do not reset declaration state', () => {
    expect(
      getFlagsFor([
        ActionType.DECLARE,
        ActionType.REJECT,
        ActionType.CUSTOM,
        ActionType.READ,
        ActionType.ASSIGN
      ])
    ).toContain(InherentFlags.REJECTED)
  })

  test('is present again after a second REJECT in the same record lifecycle', () => {
    expect(
      getFlagsFor([
        ActionType.DECLARE,
        ActionType.REJECT,
        ActionType.DECLARE,
        ActionType.REJECT
      ])
    ).toContain(InherentFlags.REJECTED)
  })

  test('is cleared by a custom action whose config removes the REJECTED flag', () => {
    const event: DeepPartial<EventDocument> = {
      actions: [
        {
          type: ActionType.DECLARE,
          declaration: {},
          createdAt: formatISO(subDays(now, 3)),
          status: ActionStatus.Accepted
        },
        {
          type: ActionType.REJECT,
          declaration: {},
          createdAt: formatISO(subDays(now, 2)),
          status: ActionStatus.Accepted
        },
        {
          type: ActionType.CUSTOM,
          customActionType: 'VALIDATE_DECLARATION',
          declaration: {},
          createdAt: formatISO(subDays(now, 1)),
          status: ActionStatus.Accepted
        }
      ]
    }

    // @ts-expect-error - allow partial event document and event config
    expect(getEventFlags(event, eventConfig)).not.toContain(
      InherentFlags.REJECTED
    )
  })

  test('is present again when a REJECT follows the flag-removing custom action', () => {
    const event: DeepPartial<EventDocument> = {
      actions: [
        {
          type: ActionType.DECLARE,
          declaration: {},
          createdAt: formatISO(subDays(now, 4)),
          status: ActionStatus.Accepted
        },
        {
          type: ActionType.REJECT,
          declaration: {},
          createdAt: formatISO(subDays(now, 3)),
          status: ActionStatus.Accepted
        },
        {
          type: ActionType.CUSTOM,
          customActionType: 'VALIDATE_DECLARATION',
          declaration: {},
          createdAt: formatISO(subDays(now, 2)),
          status: ActionStatus.Accepted
        },
        {
          type: ActionType.REJECT,
          declaration: {},
          createdAt: formatISO(subDays(now, 1)),
          status: ActionStatus.Accepted
        }
      ]
    }

    // @ts-expect-error - allow partial event document and event config
    expect(getEventFlags(event, eventConfig)).toContain(InherentFlags.REJECTED)
  })

  test('only considers accepted actions when computing the rejected flag', () => {
    const event: DeepPartial<EventDocument> = {
      actions: [
        {
          type: ActionType.DECLARE,
          declaration: {},
          createdAt: formatISO(subDays(now, 1)),
          status: ActionStatus.Accepted
        },
        {
          type: ActionType.REJECT,
          declaration: {},
          createdAt: formatISO(now),
          status: ActionStatus.Requested
        }
      ]
    }

    // @ts-expect-error - allow partial event document and event config
    expect(getEventFlags(event, eventConfig)).not.toContain(
      InherentFlags.REJECTED
    )
  })
})

describe('getEventFlags() – any inherent flag is clearable by action config', () => {
  test('INCOMPLETE is present for a notified record', () => {
    const event: DeepPartial<EventDocument> = {
      actions: [
        {
          type: ActionType.NOTIFY,
          declaration: {},
          createdAt: formatISO(now),
          status: ActionStatus.Accepted
        }
      ]
    }

    // @ts-expect-error - allow partial event document and event config
    expect(getEventFlags(event, eventConfig)).toContain(InherentFlags.INCOMPLETE)
  })

  test('INCOMPLETE is cleared by a custom action whose config removes it', () => {
    const event: DeepPartial<EventDocument> = {
      actions: [
        {
          type: ActionType.NOTIFY,
          declaration: {},
          createdAt: formatISO(subDays(now, 1)),
          status: ActionStatus.Accepted
        },
        {
          type: ActionType.CUSTOM,
          customActionType: 'COMPLETE_NOTIFICATION',
          declaration: {},
          createdAt: formatISO(now),
          status: ActionStatus.Accepted
        }
      ]
    }

    // @ts-expect-error - allow partial event document and event config
    expect(getEventFlags(event, eventConfig)).not.toContain(
      InherentFlags.INCOMPLETE
    )
  })
})
