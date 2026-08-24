/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { expect, Page, test } from '@playwright/test'
import { v4 as uuidv4 } from 'uuid'
import { addDays, format, subDays } from 'date-fns'
import { faker } from '@faker-js/faker'
import decode from 'jwt-decode'
import {
  drawSignature,
  fetchUserLocationHierarchy,
  formatName,
  login,
  triggerDeclarationAction,
  switchEventTab,
  validateActionMenuButton
} from '../../helpers'
import { ensureAssignedToUser, expectInUrl, selectAction } from '../../utils'
import {
  getAdministrativeAreas,
  getIdByName,
  formatV2ChildName,
  REQUIRED_VALIDATION_ERROR
} from '../birth/helpers'
import { getDeclaration } from '../test-data/birth-declaration'
import {
  openRecordByTitle,
  printAndExpectPopup,
  selectRequesterType
} from '../print-certificate/birth/helpers'
import {
  createIntegrationContext,
  EVENT_TYPE,
  fetchClientAPI,
  NON_EXISTING_UUID
} from './helpers'

import { CREDENTIALS } from '../../constants'

test.describe('POST /api/events/events/{eventId}/notify', () => {
  let clientToken: string
  let systemAdminToken: string
  let clientName: string
  let healthFacilityId: string

  test.beforeAll(async () => {
    const context = await createIntegrationContext()
    clientToken = context.clientToken
    systemAdminToken = context.systemAdminToken
    clientName = context.clientName
    healthFacilityId = context.healthFacilityId
  })

  test('HTTP 401 when invalid token is used', async () => {
    const response = await fetchClientAPI(
      `/api/events/events/${NON_EXISTING_UUID}/notify`,
      'POST',
      'foobar'
    )
    expect(response.status).toBe(401)
  })

  test('HTTP 403 when user is missing scope', async () => {
    const response = await fetchClientAPI(
      `/api/events/events/${NON_EXISTING_UUID}/notify`,
      'POST',
      systemAdminToken
    )
    expect(response.status).toBe(403)
  })

  test('HTTP 400 with missing payload', async () => {
    const createEventResponse = await fetchClientAPI(
      '/api/events/events',
      'POST',
      clientToken,
      {
        type: EVENT_TYPE,
        transactionId: uuidv4(),
        createdAtLocation: healthFacilityId
      }
    )
    const event = await createEventResponse.json()
    const response = await fetchClientAPI(
      `/api/events/events/${event.id}/notify`,
      'POST',
      clientToken
    )

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.message).toBe('Input validation failed')
  })

  test('HTTP 400 with invalid payload', async () => {
    const createEventResponse = await fetchClientAPI(
      '/api/events/events',
      'POST',
      clientToken,
      {
        type: EVENT_TYPE,
        transactionId: uuidv4(),
        createdAtLocation: healthFacilityId
      }
    )

    const event = await createEventResponse.json()

    const response = await fetchClientAPI(
      `/api/events/events/${event.id}/notify`,
      'POST',
      clientToken,
      {
        type: 'foobar'
      }
    )

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.message).toBe('Input validation failed')
  })

  test('HTTP 400 with payload containing declaration with unexpected fields', async () => {
    const createEventResponse = await fetchClientAPI(
      '/api/events/events',
      'POST',
      clientToken,
      {
        type: EVENT_TYPE,
        transactionId: uuidv4(),
        createdAtLocation: healthFacilityId
      }
    )

    const createEventResponseBody = await createEventResponse.json()
    const eventId = createEventResponseBody.id

    const fakeSurname = faker.person.lastName()
    const response = await fetchClientAPI(
      `/api/events/events/${eventId}/notify`,
      'POST',
      clientToken,
      {
        eventId,
        transactionId: uuidv4(),
        type: 'NOTIFY',
        declaration: {
          'foo.bar': 'this should cause an error',
          'child.name': { surname: fakeSurname },
          'child.dob': format(subDays(new Date(), 1), 'yyyy-MM-dd')
        },
        annotation: {}
      }
    )

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.message).toBe(
      '[{"message":"Unexpected field","id":"foo.bar","value":"this should cause an error"}]'
    )
  })

  test('HTTP 200 with payload containing declaration with half filled names', async ({
    page
  }) => {
    const token = await login(page)
    const { sub } = decode<{ sub: string }>(token)
    const location = await fetchUserLocationHierarchy(sub, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const createEventResponse = await fetchClientAPI(
      '/api/events/events',
      'POST',
      clientToken,
      {
        type: EVENT_TYPE,
        transactionId: uuidv4(),
        createdAtLocation: location[location.length - 1]
      }
    )

    const createEventResponseBody = await createEventResponse.json()
    const eventId = createEventResponseBody.id

    const fakeSurname = faker.person.lastName()

    const response = await fetchClientAPI(
      `/api/events/events/${eventId}/notify`,
      'POST',
      clientToken,
      {
        eventId,
        transactionId: uuidv4(),
        type: 'NOTIFY',
        createdAtLocation: location[location.length - 1],
        declaration: {
          'child.name': { surname: fakeSurname },
          'child.dob': format(addDays(new Date(), 10), 'yyyy-MM-dd')
        },
        annotation: {}
      }
    )

    expect(response.status).toBe(200)
  })

  test('HTTP 400 with payload containing declaration with values of wrong type', async () => {
    const createEventResponse = await fetchClientAPI(
      '/api/events/events',
      'POST',
      clientToken,
      {
        type: EVENT_TYPE,
        transactionId: uuidv4(),
        createdAtLocation: healthFacilityId
      }
    )

    const createEventResponseBody = await createEventResponse.json()
    const eventId = createEventResponseBody.id

    const response = await fetchClientAPI(
      `/api/events/events/${eventId}/notify`,
      'POST',
      clientToken,
      {
        eventId,
        transactionId: uuidv4(),
        type: 'NOTIFY',
        declaration: {
          'child.name': { surname: 12345 }
        },
        annotation: {}
      }
    )

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.message).toBe(
      '[{"message":"Invalid input","id":"child.name","value":{"surname":12345}}]'
    )
  })

  test('HTTP 200 when direct-notifying an event', async () => {
    const response = await fetchClientAPI(
      '/api/events/events/notify',
      'POST',
      clientToken,
      {
        transactionId: uuidv4(),
        type: 'NOTIFY',
        createdAtLocation: healthFacilityId,
        eventType: 'birth',
        declaration: {
          'child.name': {
            firstname: faker.person.firstName(),
            surname: faker.person.lastName()
          },
          'child.dob': format(subDays(new Date(), 1), 'yyyy-MM-dd')
        },
        annotation: {}
      }
    )
    expect(response.status).toBe(200)
  })

  test('HTTP 400 when trying to notify an event without createdAtLocation', async () => {
    const createEventResponse = await fetchClientAPI(
      '/api/events/events',
      'POST',
      clientToken,
      {
        type: EVENT_TYPE,
        transactionId: uuidv4(),
        createdAtLocation: healthFacilityId
      }
    )

    const createEventResponseBody = await createEventResponse.json()
    const eventId = createEventResponseBody.id

    const childName = {
      firstNames: faker.person.firstName(),
      familyName: faker.person.lastName()
    }

    const response = await fetchClientAPI(
      `/api/events/events/${eventId}/notify`,
      'POST',
      clientToken,
      {
        eventId,
        transactionId: uuidv4(),
        type: 'NOTIFY',
        declaration: {
          'child.name': {
            firstname: childName.firstNames,
            surname: childName.familyName
          },
          'child.dob': format(subDays(new Date(), 1), 'yyyy-MM-dd')
        },
        annotation: {}
      }
    )

    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.message).toBe(
      'createdAtLocation is required and must be a valid location id'
    )
  })

  test('HTTP 400 when trying to notify an event with an invalid createdAtLocation', async () => {
    const createEventResponse = await fetchClientAPI(
      '/api/events/events',
      'POST',
      clientToken,
      {
        type: EVENT_TYPE,
        transactionId: uuidv4(),
        createdAtLocation: healthFacilityId
      }
    )

    const createEventResponseBody = await createEventResponse.json()
    const eventId = createEventResponseBody.id

    const childName = {
      firstNames: faker.person.firstName(),
      familyName: faker.person.lastName()
    }

    const response = await fetchClientAPI(
      `/api/events/events/${eventId}/notify`,
      'POST',
      clientToken,
      {
        eventId,
        transactionId: uuidv4(),
        type: 'NOTIFY',
        declaration: {
          'child.name': {
            firstname: childName.firstNames,
            surname: childName.familyName
          },
          'child.dob': format(subDays(new Date(), 1), 'yyyy-MM-dd')
        },
        annotation: {},
        createdAtLocation: 'invalid-location-id'
      }
    )

    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.message).toBe('Input validation failed')
  })

  test('HTTP 400 when trying to notify an event with a non-office createdAtLocation', async () => {
    const createEventResponse = await fetchClientAPI(
      '/api/events/events',
      'POST',
      clientToken,
      {
        type: EVENT_TYPE,
        transactionId: uuidv4(),
        createdAtLocation: healthFacilityId
      }
    )

    const createEventResponseBody = await createEventResponse.json()
    const eventId = createEventResponseBody.id

    const childName = {
      firstNames: faker.person.firstName(),
      familyName: faker.person.lastName()
    }

    const administrativeAreas = await getAdministrativeAreas(clientToken)
    const centralId = getIdByName(administrativeAreas, 'Central')

    const response = await fetchClientAPI(
      `/api/events/events/${eventId}/notify`,
      'POST',
      clientToken,
      {
        eventId,
        transactionId: uuidv4(),
        type: 'NOTIFY',
        declaration: {
          'child.name': {
            firstname: childName.firstNames,
            surname: childName.familyName
          },
          'child.dob': format(subDays(new Date(), 1), 'yyyy-MM-dd')
        },
        annotation: {},
        createdAtLocation: centralId
      }
    )

    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.message).toBe('createdAtLocation must be a valid location id')
  })

  test('HTTP 200 with valid payload', async ({ page }) => {
    const createEventResponse = await fetchClientAPI(
      '/api/events/events',
      'POST',
      clientToken,
      {
        type: EVENT_TYPE,
        transactionId: uuidv4(),
        createdAtLocation: healthFacilityId
      }
    )

    expect(createEventResponse.status).toBe(200)

    const createEventResponseBody = await createEventResponse.json()
    const eventId = createEventResponseBody.id

    const childName = {
      firstNames: faker.person.firstName(),
      familyName: faker.person.lastName()
    }

    const token = await login(page)
    const { sub } = decode<{ sub: string }>(token)

    const location = await fetchUserLocationHierarchy(sub, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const locationId = location[location.length - 1]

    const response = await fetchClientAPI(
      `/api/events/events/${eventId}/notify`,
      'POST',
      clientToken,
      {
        eventId,
        transactionId: uuidv4(),
        type: 'NOTIFY',
        declaration: {
          'child.name': {
            firstname: childName.firstNames,
            surname: childName.familyName
          },
          'child.dob': format(subDays(new Date(), 1), 'yyyy-MM-dd'),
          'child.placeOfBirth': 'Health Institution',
          'child.birthLocation': locationId,
          'child.birthLocationId': locationId
        },
        annotation: {},
        createdAtLocation: locationId
      }
    )

    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.type).toBe(EVENT_TYPE)
    expect(body.actions.length).toBe(3)
    expect(body.actions[0].type).toBe('CREATE')
    expect(body.actions[1].type).toBe('NOTIFY')
    expect(body.actions[1].status).toBe('Requested')
    expect(body.actions[2].type).toBe('NOTIFY')
    expect(body.actions[2].status).toBe('Accepted')

    await page.getByRole('button', { name: 'Notifications' }).click()

    await openRecordByTitle(page, formatName(childName))

    await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)

    await page.getByRole('button', { name: 'Audit' }).click()

    await expect(page.locator('#row_0')).toContainText('Notified')
    await expect(page.locator('#row_0')).toContainText(clientName)
    await expect(page.locator('#row_0')).toContainText('Health integration')

    await page.getByText('Notified').click()
    const modal = await page.getByTestId('event-history-modal')
    await expect(modal).toContainText('Notified')
    await expect(modal).toContainText(clientName)

    await page.locator('#close-dialog').click()

    await page.getByRole('button', { name: 'Record', exact: true }).click()
    await expect(page.getByTestId('child.name-value')).toHaveText(
      formatName(childName)
    )
  })

  test('API is idempotent', async () => {
    const createEventResponse = await fetchClientAPI(
      '/api/events/events',
      'POST',
      clientToken,
      {
        type: EVENT_TYPE,
        transactionId: uuidv4(),
        createdAtLocation: healthFacilityId
      }
    )

    const createEventResponseBody = await createEventResponse.json()
    const eventId = createEventResponseBody.id

    const childName = {
      firstNames: faker.person.firstName(),
      familyName: faker.person.lastName()
    }

    const requestBody = {
      eventId,
      transactionId: uuidv4(),
      type: 'NOTIFY',
      declaration: {
        'child.name': {
          firstname: childName.firstNames,
          surname: childName.familyName
        },
        'child.dob': format(subDays(new Date(), 1), 'yyyy-MM-dd')
      },
      annotation: {},
      createdAtLocation: healthFacilityId
    }

    const response1 = await fetchClientAPI(
      `/api/events/events/${eventId}/notify`,
      'POST',
      clientToken,
      requestBody
    )

    const response2 = await fetchClientAPI(
      `/api/events/events/${eventId}/notify`,
      'POST',
      clientToken,
      requestBody
    )

    const body1 = await response1.json()
    const body2 = await response2.json()

    expect(response1.status).toBe(200)
    expect(response2.status).toBe(200)
    expect(body1).toEqual(body2)
  })

  test.describe
    .serial('Registrar can register and print an event notified via integration', async () => {
    const childName = {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    }

    let token: string
    let page: Page
    let eventId: string

    test.beforeAll(async ({ browser }) => {
      page = await browser.newPage()
    })

    test.afterAll(async () => {
      await page.close()
    })

    test('Login', async () => {
      token = await login(page)
    })

    test('Notify an event via integration', async () => {
      const createEventResponse = await fetchClientAPI(
        '/api/events/events',
        'POST',
        clientToken,
        {
          type: EVENT_TYPE,
          transactionId: uuidv4(),
          createdAtLocation: healthFacilityId
        }
      )

      const createEventResponseBody = await createEventResponse.json()
      eventId = createEventResponseBody.id
      const { sub } = decode<{ sub: string }>(token)

      const location = await fetchUserLocationHierarchy(sub, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const locationId = location[location.length - 1]

      const declaration = {
        ...(await getDeclaration({ token })),
        'child.name': childName,
        'child.dob': undefined,
        'child.birthLocation': locationId,
        'child.birthLocationId': locationId,
        'child.placeOfBirth': 'HEALTH_FACILITY'
      }
      const response = await fetchClientAPI(
        `/api/events/events/${eventId}/notify`,
        'POST',
        clientToken,
        {
          eventId,
          transactionId: uuidv4(),
          type: 'NOTIFY',
          declaration,
          annotation: {},
          createdAtLocation: location[location.length - 1]
        }
      )
      expect(response.status).toBe(200)
    })

    test("Navigate to event via 'Notifications' -workqueue", async () => {
      await page.getByRole('button', { name: 'Notifications' }).click()
      await openRecordByTitle(
        page,
        formatV2ChildName({ 'child.name': childName })
      )
    })

    test('Edit event', async () => {
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
      await selectAction(page, 'Edit')

      await expect(page.getByTestId('child.name-value')).toHaveText(
        formatV2ChildName({ 'child.name': childName })
      )

      await expect(page.getByTestId('child.dob-value')).toHaveText(
        REQUIRED_VALIDATION_ERROR
      )

      await validateActionMenuButton(page, 'Register with edits', false)
    })

    test('Fill missing child dob field', async () => {
      await page.getByTestId('change-button-child.dob').click()

      const yesterday = new Date()
      yesterday.setDate(new Date().getDate() - 1)
      const [yyyy, mm, dd] = yesterday.toISOString().split('T')[0].split('-')

      await page.getByPlaceholder('dd').fill(dd)
      await page.getByPlaceholder('mm').fill(mm)
      await page.getByPlaceholder('yyyy').fill(yyyy)
    })

    const newChildName = {
      firstname: childName.firstname,
      surname: `Laurila-${childName.surname}`
    }

    test('Change child surname', async () => {
      await page.getByTestId('text__surname').fill(newChildName.surname)
      await page.getByRole('button', { name: 'Go to review' }).click()

      await expect(page.getByTestId('child.dob-value')).not.toHaveText(
        REQUIRED_VALIDATION_ERROR
      )
    })

    test('Fill comment & signature', async () => {
      await page.locator('#review____comment').fill(faker.lorem.sentence())
      await page.getByRole('button', { name: 'Sign', exact: true }).click()
      await drawSignature(page, 'review____signature_canvas_element', false)
      await page
        .locator('#review____signature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()
    })

    test('Register event', async () => {
      await triggerDeclarationAction(page, 'Register with edits')
    })

    test("Navigate to event via 'Pending certification' -workqueue", async () => {
      await page.getByRole('button', { name: 'Pending certification' }).click()
      await openRecordByTitle(
        page,
        formatV2ChildName({ 'child.name': newChildName })
      )
    })

    test('Print certificate', async () => {
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
      await selectAction(page, 'Print')
      await selectRequesterType(page, 'Print and issue to Informant (Mother)')
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Verified' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()

      await expect(page.locator('#print')).toContainText(
        formatV2ChildName({ 'child.name': newChildName })
      )

      await expect(page.locator('#print')).toContainText(
        'Ibombo District Office'
      )

      await expect(page.locator('#print')).toContainText(
        'Ibombo, Central, Farajaland'
      )

      await printAndExpectPopup(page)

      await expectInUrl(page, `/workqueue/pending-certification`)
    })
  })

  test.describe
    .serial('Registrar can reject an event notified via integration', async () => {
    const childName = {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    }

    let token: string
    let page: Page
    let eventId: string

    test.beforeAll(async ({ browser }) => {
      page = await browser.newPage()
    })

    test.afterAll(async () => {
      await page.close()
    })

    test('Login', async () => {
      token = await login(page)
    })

    let trackingId: string

    test('Notify event an event via integration', async () => {
      const createEventResponse = await fetchClientAPI(
        '/api/events/events',
        'POST',
        clientToken,
        {
          type: EVENT_TYPE,
          transactionId: uuidv4(),
          createdAtLocation: healthFacilityId
        }
      )

      const createEventResponseBody = await createEventResponse.json()
      eventId = createEventResponseBody.id
      const { sub } = decode<{ sub: string }>(token)

      const location = await fetchUserLocationHierarchy(sub, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const locationId = location[location.length - 1]

      const declaration = {
        ...(await getDeclaration({ token })),
        'child.name': childName,
        'child.dob': undefined,
        'child.birthLocation': locationId,
        'child.birthLocationId': locationId,
        'child.placeOfBirth': 'HEALTH_FACILITY'
      }

      const res = await fetchClientAPI(
        `/api/events/events/${eventId}/notify`,
        'POST',
        clientToken,
        {
          eventId,
          transactionId: uuidv4(),
          type: 'NOTIFY',
          declaration,
          annotation: {},
          createdAtLocation: locationId
        }
      )

      trackingId = (await res.json()).trackingId
    })

    test("Navigate to event via 'Notifications' -workqueue", async () => {
      await page.getByRole('button', { name: 'Notifications' }).click()
      await openRecordByTitle(
        page,
        formatV2ChildName({ 'child.name': childName })
      )
    })

    test('Reject event', async () => {
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
      await selectAction(page, 'Reject')
      await page.getByTestId('reject-reason').fill(faker.lorem.sentence())
      await page.getByRole('button', { name: 'Send For Update' }).click()
    })

    test('Navigate to event via search', async () => {
      await page.getByRole('button', { name: 'Search' }).click()
      await page.getByPlaceholder('Search').fill(trackingId)
      await page.getByRole('button', { name: 'Search' }).click()

      await openRecordByTitle(
        page,
        formatV2ChildName({ 'child.name': childName })
      )
    })

    test('Audit event', async () => {
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)

      await switchEventTab(page, 'Audit')

      await expect(page.locator('#row_0')).toContainText('Notified')
      await expect(page.locator('#row_0')).toContainText(clientName)
      await expect(page.locator('#row_3')).toContainText('Rejected')
    })
  })
})
