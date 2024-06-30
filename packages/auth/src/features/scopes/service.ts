import { COUNTRY_CONFIG_URL } from '@auth/constants'
import { fetchJSON, joinURL, logger } from '@opencrvs/commons'
import {
  DEFAULT_CORE_ROLE_SCOPES,
  Scope,
  CoreUserRole
} from '@opencrvs/commons/authentication'

type NewRolesResponseFormat = Array<{
  id: string
  systemRole: CoreUserRole
  labels: Array<{ language: string; label: string }>
  scopes: Scope[]
}>

function isOpenCRVS1_7FormatWithScopes(
  response: Record<string, any> | NewRolesResponseFormat
): response is NewRolesResponseFormat {
  return Array.isArray(response)
}

export async function getUserRoleScopeMapping() {
  const scopes = await fetchJSON<
    NewRolesResponseFormat | typeof DEFAULT_CORE_ROLE_SCOPES
  >(joinURL(COUNTRY_CONFIG_URL, '/roles'))

  if (!isOpenCRVS1_7FormatWithScopes(scopes)) {
    logger.error('Country config implements the old /roles response format')
    throw new Error('Old /roles response format. Check logs for more info')
  }
  logger.info(
    'Country config implements the new /roles response format. Custom scopes apply'
  )

  const userRoleMappings = scopes.reduce<Record<string, Scope[]>>(
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
