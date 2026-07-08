import { format } from 'date-fns'
import { createClient } from '@opencrvs/toolkit/api'
import { CLIENT_URL, CREDENTIALS, GATEWAY_HOST } from '../../constants'
import { getClientToken, getToken } from '../../helpers'
import { createDeclaration } from '../test-data/birth-declaration'
import { getLocations } from '../birth/helpers'

export const EVENT_TYPE = 'birth'
export const NON_EXISTING_UUID = 'b3ca0644-ffc4-461f-afe0-5fb84bedfcfd'
export const INTEGRATION_SCOPES = [
  'type=record.create',
  'type=record.search',
  'type=record.notify&event=birth',
  'type=record.read',
  'type=record.correct&event=birth',
  'record.registration-request-correction[event=birth]',
  'record.confirm-registration[event=birth]',
  'record.reject-registration[event=birth]'
]

export async function fetchClientAPI(
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  token: string,
  body: object = {}
) {
  const url = new URL(`${CLIENT_URL}${path}`)

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }

  const options: {
    method: string
    headers: Record<string, string>
    body?: string
  } = {
    method,
    headers
  }

  if (method !== 'GET' && method !== 'DELETE') {
    options.body = JSON.stringify(body)
  }

  return fetch(url, options)
}

export type IntegrationContext = {
  clientToken: string
  systemAdminToken: string
  registrarToken: string
  clientName: string
  clientId: string
  healthFacilityId: string
}

export async function createIntegrationContext(): Promise<IntegrationContext> {
  const systemAdminToken = await getToken(CREDENTIALS.NATIONAL_SYSTEM_ADMIN)
  const registrarToken = await getToken(CREDENTIALS.REGISTRAR)

  const name = `Health integration ${format(new Date(), 'dd.MM. HH:mm:ss')}`

  const integrationClient = createClient(
    `${GATEWAY_HOST}/events`,
    `Bearer ${systemAdminToken}`
  )
  const integration = await integrationClient.integrations.create.mutate({
    name,
    scopes: INTEGRATION_SCOPES
  })

  const clientToken = await getClientToken(
    integration.clientId,
    integration.clientSecret
  )

  const healthFacilities = await getLocations('HEALTH_FACILITY', clientToken)

  if (!healthFacilities[0].id) {
    throw new Error('No health facility found')
  }

  return {
    clientToken,
    systemAdminToken,
    registrarToken,
    clientName: name,
    clientId: integration.clientId,
    healthFacilityId: healthFacilities[0].id
  }
}

export async function createRegisteredEvent(registrarToken: string) {
  const { eventId } = await createDeclaration(registrarToken)
  return eventId
}
