import { expect, test } from '@playwright/test'
import { v4 as uuidv4 } from 'uuid'
import {
  createIntegrationContext,
  createRegisteredEvent,
  fetchClientAPI
} from './helpers'

test.describe('POST /api/events/events/{eventId}/correction/approve', () => {
  let clientToken: string
  let registrarToken: string
  let healthFacilityId: string

  test.beforeAll(async () => {
    const context = await createIntegrationContext()
    ;({ clientToken, registrarToken, healthFacilityId } = context)
  })

  test('HTTP 200 for correction approve with updated state', async () => {
    const eventId = await createRegisteredEvent(registrarToken)

    const requestResponse = await fetchClientAPI(
      `/api/events/events/${eventId}/correction/request`,
      'POST',
      clientToken,
      {
        eventId,
        transactionId: uuidv4(),
        type: 'REQUEST_CORRECTION',
        declaration: {},
        annotation: {},
        createdAtLocation: healthFacilityId
      }
    )

    expect(requestResponse.status).toBe(200)
    const requestBody = await requestResponse.json()
    const requestAction = requestBody.actions.find(
      (action: { type: string }) => action.type === 'REQUEST_CORRECTION'
    )

    if (!requestAction?.id) {
      throw new Error('Correction request action not found')
    }

    const response = await fetchClientAPI(
      `/api/events/events/${eventId}/correction/approve`,
      'POST',
      clientToken,
      {
        eventId,
        transactionId: uuidv4(),
        requestId: requestAction.id,
        type: 'APPROVE_CORRECTION',
        declaration: {},
        annotation: {},
        createdAtLocation: healthFacilityId
      }
    )

    expect(response.status).toBe(200)

    const getResponse = await fetchClientAPI(
      `/api/events/events/${eventId}`,
      'GET',
      clientToken
    )
    const getBody = await getResponse.json()

    const approveAction = getBody.actions.find(
      (action: { type: string }) => action.type === 'APPROVE_CORRECTION'
    )
    expect(approveAction).toBeDefined()
  })
})
