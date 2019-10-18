import * as Hapi from 'hapi'

export const statuses = {
  PENDING: 'pending',
  ACTIVE: 'active',
  DISABLED: 'disabled'
}

export const roleScopeMapping = {
  // TODO remove 'demo' from these for production
  FIELD_AGENT: ['declare', 'demo'],
  REGISTRATION_AGENT: ['validate', 'demo'],
  LOCAL_REGISTRAR: ['register', 'performance', 'certify', 'demo'],
  LOCAL_SYSTEM_ADMIN: ['sysadmin', 'demo'],
  NATIONAL_SYSTEM_ADMIN: ['sysadmin', 'demo'],
  PERFORMANCE_OVERSIGHT: ['performance', 'demo'],
  PERFORMANCE_MANAGEMENT: ['performance', 'demo'],
  API_USER: ['declare', 'api']
}

export const hasScope = (request: Hapi.Request, scope: string): boolean => {
  if (
    !request.auth ||
    !request.auth.credentials ||
    !request.auth.credentials.scope
  ) {
    return false
  }
  return request.auth.credentials.scope.includes(scope)
}

export function hasDemoScope(request: Hapi.Request): boolean {
  return hasScope(request, 'demo')
}
