import { FHIR_URL } from '@gateway/constants'
import { HTTPDataSource } from 'apollo-datasource-http'
import { Pool } from 'undici'

export default class PractitionerRoleAPI extends HTTPDataSource {
  count: number
  constructor(baseURL: string, pool: Pool) {
    super(baseURL, {
      pool
    })
    this.count = 0
  }

  getPractitionerRoleByPractitionerId(practitionerId: string) {
    const { dataSources, ...authHeader } = this.context
    return this.get(`/fhir/PractitionerRole?practitioner=${practitionerId}`, {
      headers: { 'Content-Type': 'application/fhir+json', ...authHeader }
    })
  }

  getPractionerRoleHistory(id: string) {
    const { dataSources, ...authHeader } = this.context
    return this.get(`/fhir/PractitionerRole/${id}/_history`, {
      headers: { 'Content-Type': 'application/fhir+json', ...authHeader }
    })
  }

  static createNewInstance() {
    const baseURL = FHIR_URL.split('/fhir')[0]
    const pool = new Pool(baseURL)
    return new PractitionerRoleAPI(baseURL, pool)
  }
}
