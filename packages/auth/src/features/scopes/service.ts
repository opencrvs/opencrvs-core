import { COUNTRY_CONFIG_URL } from '@auth/constants'
import { fetchJSON, joinURL, logger, Roles } from '@opencrvs/commons'
import {
  DEFAULT_CORE_ROLE_SCOPES,
  Scope
} from '@opencrvs/commons/authentication'

export async function getUserRoleScopeMapping() {
  const roles = await fetchJSON<Roles>(joinURL(COUNTRY_CONFIG_URL, '/roles'))

  logger.info(
    'Country config implements the new /roles response format. Custom scopes apply'
  )

  const userRoleMappings = roles.reduce<Record<string, Scope[]>>(
    (acc, { id, scopes }) => {
      acc[id] = scopes
      return acc
    },
    {}
  )

  return {
    ...DEFAULT_CORE_ROLE_SCOPES,
    ...userRoleMappings
  }
}
