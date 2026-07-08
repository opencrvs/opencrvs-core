import { expect, test } from '@playwright/test'
import { v4 as uuidv4 } from 'uuid'
import { faker } from '@faker-js/faker'
import {
  createIntegrationContext,
  createRegisteredEvent,
  fetchClientAPI
} from './helpers'

test.describe('POST /api/events/events/{eventId}/correction/reject', () => {
  let clientToken: string
  let registrarToken: string
  let healthFacilityId: string

  test.beforeAll(async () => {
    const context = await createIntegrationContext()
    clientToken = context.clientToken
    registrarToken = context.registrarToken
    healthFacilityId = context.healthFacilityId
  })

  test('HTTP 200 for correction reject with updated state', async () => {
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
      `/api/events/events/${eventId}/correction/reject`,
      'POST',
      clientToken,
      {
        eventId,
        transactionId: uuidv4(),
        requestId: requestAction.id,
        type: 'REJECT_CORRECTION',
        content: {
          reason: faker.lorem.sentence()
        },
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

    const rejectAction = getBody.actions.find(
      (action: { type: string }) => action.type === 'REJECT_CORRECTION'
    )
    expect(rejectAction).toBeDefined()
  })
})
