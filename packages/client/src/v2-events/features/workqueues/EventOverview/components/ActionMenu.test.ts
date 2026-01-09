import { ActionType, tennisClubMembershipEvent } from '@opencrvs/commons/client'
import { sortActions } from './ActionMenu'
import { ActionMenuItem } from './useAllowedActionConfigurations'

describe('sortActions()', () => {
  it('should sort actions according to default action order if no action order is configured', () => {
    const availableActions = [
      { type: ActionType.ARCHIVE },
      { type: ActionType.UNASSIGN },
      { type: ActionType.REGISTER },
      { type: ActionType.CUSTOM, customActionType: 'MY_CUSTOM_ACTION' },
      { type: ActionType.REJECT },
      { type: ActionType.EDIT }
    ] as ActionMenuItem[]

    const sortedActions = sortActions(
      availableActions,
      tennisClubMembershipEvent
    )

    expect(sortedActions).toEqual([
      { type: ActionType.REGISTER },
      { type: ActionType.EDIT },
      { type: ActionType.REJECT },
      { type: ActionType.ARCHIVE },
      { type: ActionType.CUSTOM, customActionType: 'MY_CUSTOM_ACTION' },
      { type: ActionType.UNASSIGN }
    ])
  })

  it('should sort actions according to configured action order', () => {
    const availableActions = [
      { type: ActionType.UNASSIGN },
      { type: ActionType.REGISTER },
      { type: ActionType.ARCHIVE },
      { type: ActionType.CUSTOM, customActionType: 'MY_CUSTOM_ACTION' },
      { type: ActionType.REJECT },
      { type: ActionType.EDIT }
    ] as ActionMenuItem[]

    const sortedActions = sortActions(availableActions, {
      ...tennisClubMembershipEvent,
      actionOrder: [
        ActionType.UNASSIGN,
        'MY_CUSTOM_ACTION',
        ActionType.ARCHIVE,
        ActionType.REJECT,
        ActionType.EDIT,
        ActionType.REGISTER
      ]
    })

    expect(sortedActions).toEqual([
      { type: ActionType.UNASSIGN },
      { type: ActionType.CUSTOM, customActionType: 'MY_CUSTOM_ACTION' },
      { type: ActionType.ARCHIVE },
      { type: ActionType.REJECT },
      { type: ActionType.EDIT },
      { type: ActionType.REGISTER }
    ])
  })

  it('should sort successfully even if some actions are not in the action order', () => {
    const availableActions = [
      { type: ActionType.UNASSIGN },
      { type: ActionType.REGISTER },
      { type: ActionType.ARCHIVE },
      { type: ActionType.CUSTOM, customActionType: 'MY_CUSTOM_ACTION' },
      { type: ActionType.REJECT },
      { type: ActionType.EDIT }
    ] as ActionMenuItem[]

    const sortedActions = sortActions(availableActions, {
      ...tennisClubMembershipEvent,
      actionOrder: [
        ActionType.UNASSIGN,
        'MY_CUSTOM_ACTION',
        ActionType.ARCHIVE,
        ActionType.EDIT,
        ActionType.REGISTER
      ]
    })

    expect(sortedActions).toEqual([
      { type: ActionType.REJECT },
      { type: ActionType.UNASSIGN },
      { type: ActionType.CUSTOM, customActionType: 'MY_CUSTOM_ACTION' },
      { type: ActionType.ARCHIVE },
      { type: ActionType.EDIT },
      { type: ActionType.REGISTER }
    ])
  })
})
