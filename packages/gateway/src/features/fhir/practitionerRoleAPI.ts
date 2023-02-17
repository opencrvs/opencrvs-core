import { FHIR_URL } from '@gateway/constants'
import { RequestOptions, RESTDataSource } from 'apollo-datasource-rest'

export default class PractitionerRoleAPI extends RESTDataSource {
  count: number
  constructor() {
    super()
    this.baseURL = `${FHIR_URL}/PractitionerRole`
  }

  protected willSendRequest(request: RequestOptions): void | Promise<void> {
    const { dataSources, ...authHeader } = this.context
    const headerKeys = Object.keys(authHeader)
    for (const each of headerKeys) {
      request.headers.set(each, authHeader[each])
    }
    request.headers.set('Content-Type', 'application/fhir+json')
  }

  async getPractitionerRoleByPractitionerId(practitionerId: string) {
    return this.get(`?practitioner=${practitionerId}`).then((res) => res.body)
  }

  async getPractionerRoleHistory(id: string) {
    return this.get(`/${id}/_history`).then((res) => res.body)
  }
}
