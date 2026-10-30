import { EventConfig } from '../client'
import { Role, Roles } from './Role'

function validateEventIds(role: Role, eventConfigs: EventConfig[]) {
  // TODO CIHAN:
  return ['TEST ERROR: Found invalid event id in role ' + role.id]
}

function validateNoNotifyAndDeclare(role: Role) {}

function validateRole(role: Role, eventConfigs: EventConfig[]) {
  return [
    validateEventIds(role, eventConfigs),
    validateNoNotifyAndDeclare(role)
  ]
}

/**
 * Validates roles, to ensure roles fill certain application requirements.
 *
 * @param roles Array of roles in object format.
 * @param eventConfigs Array of event configurations, which are needed to run validations for scopes.
 * @throws Error if roles are invalid.
 */
export function validateRoles(roles: Roles, eventConfigs: EventConfig[]) {
  const validationErrors: string[] = []

  // TODO CIHAN:
  const validationErrors2 = roles.flatMap((role) =>
    validateRole(role, eventConfigs)
  )

  console.log(validationErrors2)

  if (validationErrors.length) {
    throw new Error(`Invalid roles:\n${validationErrors.join(', ')}`)
  }
}
