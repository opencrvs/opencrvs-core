import * as Hapi from 'hapi'
import * as fs from 'fs'
import { internal } from 'boom'
import { ADMIN_STRUCTURE_SOURCE } from '../../constants'

export default async function administrativeStructureHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  let divisions
  try {
    divisions = await JSON.parse(
      fs.readFileSync(
        `${ADMIN_STRUCTURE_SOURCE}locations/divisions.json`,
        'utf8'
      )
    )
  } catch (err) {
    return internal(err)
  }

  return { divisions }
}
