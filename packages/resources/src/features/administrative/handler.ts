import * as Hapi from 'hapi'
import { getLocationData } from './service'
import { logger } from 'src/logger'

export default async function administrativeStructureHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const divisions = await getLocationData('division')

  return { divisions }
}
