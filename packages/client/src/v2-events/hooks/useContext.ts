import { UserContext } from '@opencrvs/commons/client'
import { getToken, getTokenPayload } from '@client/utils/authUtils'
import {
  useLocations,
  useSuspenseAdminLeafLevelLocations
} from './useLocations'

export function useContext(): UserContext {
  const token = getToken()
  const tokenPayload = getTokenPayload(token)

  const locationIds = useSuspenseAdminLeafLevelLocations()

  return {
    user: tokenPayload ?? undefined,
    leafAdminStructureLocationIds: locationIds
  }
}
