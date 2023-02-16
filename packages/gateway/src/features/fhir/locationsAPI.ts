import { FHIR_URL } from '@gateway/constants'
import { HTTPDataSource } from 'apollo-datasource-http'
import { Pool } from 'undici'

export default class LocationsAPI extends HTTPDataSource {
  constructor(baseURL: string, pool: Pool) {
    super(baseURL, {
      pool
    })
  }

  getLocation(id: string) {
    const { dataSources, ...authHeader } = this.context
    return this.get(`/fhir/Location/${id}`, {
      headers: { 'Content-Type': 'application/fhir+json', ...authHeader }
    })
  }

  static createNewInstance() {
    const baseURL = FHIR_URL.split('/fhir')[0]
    const pool = new Pool(baseURL)
    return new LocationsAPI(baseURL, pool)
  }
}
