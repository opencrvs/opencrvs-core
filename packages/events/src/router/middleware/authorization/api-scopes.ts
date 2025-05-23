import { ActionType, ConfigurableScope } from '@opencrvs/commons'

// TODO CIHAN: this should be in events backend probably?
type ScopeOptionMatcher = { input?: string } | { event?: string }

// TODO CIHAN: write comment here
export type ConfigurableScopeWithMatcher = {
  scope: ConfigurableScope
  optionMatchers: { [key: string]: ScopeOptionMatcher }
}

export const ACTION_ALLOWED_CONFIGURABLE_SCOPES = {
  [ActionType.READ]: [],
  [ActionType.CREATE]: [
    { scope: 'notify-event', optionMatchers: { event: { event: 'foobar' } } }
  ],
  [ActionType.NOTIFY]: [
    { scope: 'notify-event', optionMatchers: { event: { event: 'foobar' } } }
  ],
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
} satisfies Record<ActionType, ConfigurableScopeWithMatcher[]>
