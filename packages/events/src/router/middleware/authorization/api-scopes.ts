import { ActionType, ConfigurableScopeType } from '@opencrvs/commons'

// TODO CIHAN: move?
export const ACTION_ALLOWED_CONFIGURABLE_SCOPES = {
  [ActionType.READ]: [],
  [ActionType.CREATE]: ['notify.event'],
  [ActionType.NOTIFY]: ['notify.event'],
  [ActionType.DECLARE]: [],
  [ActionType.DELETE]: [],
  [ActionType.VALIDATE]: [],
  [ActionType.REGISTER]: [],
  [ActionType.PRINT_CERTIFICATE]: [],
  [ActionType.REQUEST_CORRECTION]: [],
  [ActionType.REJECT_CORRECTION]: [],
  [ActionType.APPROVE_CORRECTION]: [],
  [ActionType.MARKED_AS_DUPLICATE]: [],
  [ActionType.ARCHIVE]: [],
  [ActionType.REJECT]: [],
  [ActionType.ASSIGN]: [],
  [ActionType.UNASSIGN]: [],
  [ActionType.DETECT_DUPLICATE]: []
} satisfies Record<ActionType, ConfigurableScopeType[]>
