import * as fs from 'fs'
import { ADMIN_STRUCTURE_SOURCE } from 'src/constants'

export interface ILocation {
  id: string
  name: string
  nameBn: string
  physicalType: string
  jurisdictionType: string
  type: string
  partOf: string
}

export interface ILocationDataResponse {
  data: ILocation[]
}

export async function getLocations(): Promise<ILocationDataResponse> {
  const locations = JSON.parse(
    fs.readFileSync(`${ADMIN_STRUCTURE_SOURCE}locations.json`).toString()
  )

  return locations
}
