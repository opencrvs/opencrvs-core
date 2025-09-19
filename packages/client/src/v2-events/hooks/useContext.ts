import { UserContext } from '@opencrvs/commons/client'
import { getToken, getTokenPayload } from '@client/utils/authUtils'
import { useLocations } from './useLocations'

export function useContext(): UserContext {
  const token = getToken()
  const tokenPayload = getTokenPayload(token)

  const { getLocations } = useLocations()
  const [locations] = getLocations.useSuspenseQuery()

  const adminStructureLocations = locations.filter(
    (location) => location.locationType === 'ADMIN_STRUCTURE'
  )

  return { user: tokenPayload ?? undefined, locations: adminStructureLocations }
}
