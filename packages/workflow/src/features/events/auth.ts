import { Events } from '@workflow/features/events/handler'

const enum Scopes {
  DECLARE = 'declare',
  REGISTER = 'register',
  CERTIFY = 'certify'
}

function getEventToScopeMap() {
  return {
    [Events.BIRTH_NEW_DEC]: [Scopes.DECLARE, Scopes.REGISTER],
    [Events.BIRTH_NEW_REG]: [Scopes.REGISTER],
    [Events.BIRTH_UPDATE_DEC]: [],
    [Events.BIRTH_MARK_REG]: [Scopes.REGISTER],
    [Events.BIRTH_MARK_CERT]: [Scopes.CERTIFY],
    [Events.BIRTH_MARK_VOID]: [Scopes.DECLARE, Scopes.REGISTER, Scopes.CERTIFY],
    [Events.DEATH_NEW_DEC]: [Scopes.DECLARE, Scopes.REGISTER],
    [Events.DEATH_NEW_REG]: [Scopes.REGISTER],
    [Events.DEATH_UPDATE_DEC]: [],
    [Events.DEATH_MARK_REG]: [Scopes.REGISTER],
    [Events.DEATH_MARK_CERT]: [Scopes.CERTIFY],
    [Events.DEATH_MARK_VOID]: [Scopes.DECLARE, Scopes.REGISTER, Scopes.CERTIFY]
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
