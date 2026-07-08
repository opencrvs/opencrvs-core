import { expect, Page, test } from '@playwright/test'
import { v4 as uuidv4 } from 'uuid'
import { faker } from '@faker-js/faker'
import {
  createIntegrationContext,
  createRegisteredEvent,
  fetchClientAPI
} from './helpers'
import { CREDENTIALS, GATEWAY_HOST } from '../../constants'
import { login } from '../../helpers'
import { createClient } from '@opencrvs/toolkit/api'
import { selectAction, type } from '../../utils'

test.describe
  .serial('POST /api/events/events/{eventId}/correction/request', () => {
  let clientToken: string
  let registrarToken: string
  let healthFacilityId: string
  let clientName: string
  let eventId: string
  let page: Page

  test.beforeAll(async () => {
    const context = await createIntegrationContext()
    clientToken = context.clientToken
    registrarToken = context.registrarToken
    healthFacilityId = context.healthFacilityId
    clientName = context.clientName
  })

  test('HTTP 200 for correction request', async () => {
    eventId = await createRegisteredEvent(registrarToken)
    console.log('Event ID:', eventId)

    const response = await fetchClientAPI(
      `/api/events/events/${eventId}/correction/request`,
      'POST',
      clientToken,
      {
        eventId,
        transactionId: uuidv4(),
        type: 'REQUEST_CORRECTION',
        declaration: {
          'child.name': {
            firstname: faker.person.firstName(),
            surname: faker.person.lastName()
          }
        },
        annotation: {},
        createdAtLocation: healthFacilityId
      }
    )

    const body = await response.json()
    expect(response.status).toBe(200)
    const requestAction = body.actions.find(
      (action: { type: string }) => action.type === 'REQUEST_CORRECTION'
    )
    expect(requestAction).toBeDefined()
  })

  test('Correction review has submitter name as system client', async ({
    browser
  }) => {
    page = await browser.newPage()
    await login(page, CREDENTIALS.REGISTRAR)

    const client = createClient(
      GATEWAY_HOST + '/events',
      `Bearer ${registrarToken}`
    )

    const eventDocument = await client.event.get.query({
      eventId
    })
    const { trackingId } = eventDocument

    await type(page, '#searchText', trackingId)
    await page.locator('#searchIconButton').click()
    await page.getByRole('button', { name: 'Read' }).click()

    await selectAction(page, 'Assign')
    await page.getByRole('button', { name: 'Assign', exact: true }).click()

    await selectAction(page, 'Review correction request')
    await expect(page.getByText('Submitter' + clientName)).toBeVisible()
  })
})
