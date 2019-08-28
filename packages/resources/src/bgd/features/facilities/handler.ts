import { getFacilities } from '@resources/bgd/features/facilities/service/service'

export async function facilitiesHandler() {
  return getFacilities()
}
