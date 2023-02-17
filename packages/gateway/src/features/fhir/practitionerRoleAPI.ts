import { HTTPDataSource } from 'apollo-datasource-http'
import { Pool } from 'undici'

export default class PractitionerRoleAPI extends HTTPDataSource {
  count: number
  constructor(baseURL: string, pool: Pool) {
    super(baseURL, {
      pool
    })
  }

  async getPractitionerRoleByPractitionerId(practitionerId: string) {
    const { dataSources, ...authHeader } = this.context
    return this.get(`/fhir/PractitionerRole?practitioner=${practitionerId}`, {
      headers: { 'Content-Type': 'application/fhir+json', ...authHeader }
    }).then((res) => res.body)
  }

  async getPractionerRoleHistory(id: string) {
    const { dataSources, ...authHeader } = this.context
    return this.get(`/fhir/PractitionerRole/${id}/_history`, {
      headers: { 'Content-Type': 'application/fhir+json', ...authHeader }
    }).then((res) => res.body)
  }
}
