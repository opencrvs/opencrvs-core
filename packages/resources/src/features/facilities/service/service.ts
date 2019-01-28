import * as fs from 'fs'
import { FACILITIES_SOURCE } from 'src/constants'

export interface ILocation {
  id: string
  name: string
  nameBn: string
  physicalType: string
  type: string
  partOf: string
}

export interface ILocationDataResponse {
  data: ILocation[]
}

export async function getFacilities(): Promise<ILocationDataResponse> {
  const locations = JSON.parse(
    fs.readFileSync(`${FACILITIES_SOURCE}locations.json`).toString()
  )

  return locations
}
