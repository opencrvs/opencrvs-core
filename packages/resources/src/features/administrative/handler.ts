import * as Hapi from 'hapi'
import * as fs from 'fs'
import * as Joi from 'joi'
import { ADMIN_STRUCTURE_SOURCE } from '../../constants'

interface IRequestPayload {
  divisionType: string
}

export default async function administrativeStructureHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { divisionType } = request.payload as IRequestPayload

  return fs.readFileSync(`${ADMIN_STRUCTURE_SOURCE}${divisionType}.json`)
}

export const requestSchema = Joi.object({
  divisionType: Joi.string()
})
