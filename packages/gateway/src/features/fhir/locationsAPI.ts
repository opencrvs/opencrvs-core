import { FHIR_URL } from '@gateway/constants'
import { RequestOptions, RESTDataSource } from 'apollo-datasource-rest'

export default class LocationsAPI extends RESTDataSource {
  constructor() {
    super()
    this.baseURL = `${FHIR_URL}/Location`
  }

  protected willSendRequest(request: RequestOptions): void | Promise<void> {
    const { dataSources, ...authHeader } = this.context
    const headerKeys = Object.keys(authHeader)
    for (const each of headerKeys) {
      request.headers.set(each, authHeader[each])
    }
    request.headers.set('Content-Type', 'application/fhir+json')
  }

  getLocation(id: string) {
    return this.get(`/${id}`).then((res) => res.body)
  }
}
