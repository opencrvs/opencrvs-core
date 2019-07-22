import { Events } from '@workflow/features/events/handler'
import { USER_SCOPE } from '@workflow/utils/authUtils'

function getEventToScopeMap() {
  return {
    [Events.BIRTH_IN_PROGRESS_DEC]: [USER_SCOPE.DECLARE],
    [Events.BIRTH_NEW_DEC]: [USER_SCOPE.DECLARE, USER_SCOPE.REGISTER],
    [Events.BIRTH_NEW_REG]: [USER_SCOPE.REGISTER],
    [Events.BIRTH_UPDATE_DEC]: [],
    [Events.BIRTH_MARK_REG]: [USER_SCOPE.REGISTER],
    [Events.BIRTH_MARK_VALID]: [USER_SCOPE.VALIDATE],
    [Events.BIRTH_MARK_CERT]: [USER_SCOPE.CERTIFY],
    [Events.BIRTH_MARK_VOID]: [
      USER_SCOPE.DECLARE,
      USER_SCOPE.REGISTER,
      USER_SCOPE.CERTIFY
    ],
    [Events.DEATH_IN_PROGRESS_DEC]: [USER_SCOPE.DECLARE],
    [Events.DEATH_NEW_DEC]: [USER_SCOPE.DECLARE, USER_SCOPE.REGISTER],
    [Events.DEATH_NEW_REG]: [USER_SCOPE.REGISTER],
    [Events.DEATH_UPDATE_DEC]: [],
    [Events.DEATH_MARK_REG]: [USER_SCOPE.REGISTER],
    [Events.DEATH_MARK_VALID]: [USER_SCOPE.VALIDATE],
    [Events.DEATH_MARK_CERT]: [USER_SCOPE.CERTIFY],
    [Events.DEATH_MARK_VOID]: [
      USER_SCOPE.DECLARE,
      USER_SCOPE.REGISTER,
      USER_SCOPE.CERTIFY
    ]
  }
}

export function isUserAuthorized(
  scopes: string[] | undefined,
  event: Events
): boolean {
  if (!scopes) {
    return false
  }
  const eventToScopeMap = getEventToScopeMap()

  return scopes.some(
    scope =>
      eventToScopeMap[event] &&
      (eventToScopeMap[event] as string[]).includes(scope)
  )
}
