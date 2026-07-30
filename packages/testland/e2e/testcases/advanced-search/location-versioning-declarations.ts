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
import { v4 as uuidv4 } from 'uuid'
import { Page } from '@playwright/test'
import { faker } from '@faker-js/faker'
import { createClient } from '@opencrvs/toolkit/api'
import { ActionType, AddressType } from '@opencrvs/toolkit/events'
import { CREDENTIALS, GATEWAY_HOST } from '../../constants'
import {
  getAuthTokens,
  getClientToken,
  getToken,
  loginWithNewUser,
  NEW_USER_PASSWORD
} from '../../helpers'
import {
  getIdByName,
  getLocations,
  getAdministrativeAreas
} from '../birth/helpers'
import {
  createDeclaration as createBirthDeclaration,
  getDeclaration as getBirthDeclaration
} from '../test-data/birth-declaration'
import { createDeclaration as createDeathDeclaration } from '../test-data/death-declaration'

function getUserIdFromToken(token: string) {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).sub
}

/**
 * NOTIFY is the one action a system/integration token is actually allowed to
 * perform (unlike DECLARE/REGISTER/ARCHIVE, which are user-only) — so this
 * client is scoped to just that, letting `createdAtLocation` be set
 * explicitly instead of resolving from a seeded user's own office.
 */
async function getNotifyOnlySystemClientToken() {
  const systemAdminToken = await getToken(CREDENTIALS.NATIONAL_SYSTEM_ADMIN)

  const integrationClient = createClient(
    `${GATEWAY_HOST}/events`,
    `Bearer ${systemAdminToken}`
  )
  const integration = await integrationClient.integrations.create.mutate({
    name: `Notify-only client ${uuidv4()}`,
    scopes: [
      'type=record.create',
      'type=record.search',
      'type=record.read',
      'type=record.notify&event=birth'
    ]
  })

  return getClientToken(integration.clientId, integration.clientSecret)
}

/**
 * Registers a birth and a death record at a freshly-created, active office,
 * then inactivates that office via the API — simulating the real lifecycle
 * (active when registered, inactivated afterward) rather than seeding a user
 * permanently pinned to an already-inactive office. Whether the system
 * allows a user whose own office is *already* inactive to act at all is a
 * separate, unconfirmed restriction — this avoids depending on it.
 */
export async function registerDeclarationsThenDeactivateOffice(page: Page) {
  const adminToken = await getToken(CREDENTIALS.NATIONAL_SYSTEM_ADMIN)
  const client = createClient(GATEWAY_HOST + '/events', `Bearer ${adminToken}`)

  const administrativeAreas = await getAdministrativeAreas(adminToken)
  const centralId = getIdByName(administrativeAreas, 'Central')

  const officeName = `Test Registration Office ${faker.string.alphanumeric(6)}`
  const office = await client.locations.create.mutate({
    name: officeName,
    locationType: 'CRVS_OFFICE',
    administrativeAreaId: centralId
  })

  const name = {
    firstname: faker.person.firstName(),
    surname: `${faker.person.lastName()}${faker.string.alphanumeric(6)}`
  }
  const username = `${name.firstname[0]}.${name.surname}`
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, '')

  await client.user.create.mutate({
    name,
    role: 'LOCAL_REGISTRAR',
    primaryOfficeId: office.id,
    mobile: `07${faker.string.numeric(8)}`,
    email: faker.internet.email(),
    fullHonorificName: `${name.firstname} ${name.surname}`,
    device: 'web',
    data: {}
  })

  await loginWithNewUser(page, username)
  const { token: registrarToken } = await getAuthTokens(
    username,
    NEW_USER_PASSWORD
  )

  const birth = await createBirthDeclaration(
    registrarToken,
    undefined,
    ActionType.REGISTER,
    'PRIVATE_HOME'
  )
  const death = await createDeathDeclaration(registrarToken)

  const [initialVersion] = office.versions
  await client.locations.update.mutate({
    id: office.id,
    name: officeName,
    status: 'inactive',
    lastVersionId: initialVersion.versionId
  })

  return { officeName, birth, death }
}

/**
 * Notified with an active office; the child's own "other" address field
 * points at an inactive administrative area — used to confirm that field is
 * excluded from the residential/other-address facet even when the office is
 * active, mirroring the same inactive admin unit used in
 * `createDeathRegisteredWithInactiveAddress`.
 */
export async function createBirthNotifiedInactiveAddress() {
  const token = await getNotifyOnlySystemClientToken()

  const [offices, administrativeAreas] = await Promise.all([
    getLocations('CRVS_OFFICE', token),
    getAdministrativeAreas(token)
  ])
  const officeId = getIdByName(offices, 'Ibombo District Office')
  const klowNorthOldId = getIdByName(administrativeAreas, 'Klow-north (old)')

  const declaration = await getBirthDeclaration({
    token,
    partialDeclaration: {
      'mother.nid': null,
      'mother.dob': null,
      'child.placeOfBirth': 'OTHER',
      'child.birthLocation.privateHome': null,
      'child.birthLocation.other': {
        country: 'FAR',
        addressType: AddressType.DOMESTIC,
        administrativeArea: klowNorthOldId
      },
      'child.birthLocationId': klowNorthOldId
    }
  })

  return createBirthDeclaration(
    token,
    declaration,
    ActionType.NOTIFY,
    undefined,
    officeId
  )
}

/**
 * Control record: fully active office, facility, and residential address —
 * archived, with no inactive location anywhere. Confirms normal search is
 * unaffected by inactive-location handling elsewhere.
 *
 * DECLARE releases the declaring user's assignment (`keepAssignment: false`
 * for a DECLARE action), so the record is re-assigned to the same user
 * before ARCHIVE, which requires assignment.
 */
export async function createDeathArchivedControlRecord() {
  const token = await getToken(CREDENTIALS.REGISTRAR_ISAMBA)

  const [facilities, administrativeAreas] = await Promise.all([
    getLocations('HEALTH_FACILITY', token),
    getAdministrativeAreas(token)
  ])
  const facilityId = getIdByName(facilities, 'Isamba District Hospital')
  const mbulaId = getIdByName(administrativeAreas, 'Mbula')

  const { eventId } = await createDeathDeclaration(
    token,
    {
      'eventDetails.placeOfDeath': 'HEALTH_FACILITY',
      'eventDetails.deathLocation': facilityId,
      'eventDetails.deathLocationId': facilityId,
      'deceased.address': {
        country: 'FAR',
        addressType: AddressType.DOMESTIC,
        administrativeArea: mbulaId
      }
    },
    ActionType.DECLARE
  )

  const client = createClient(GATEWAY_HOST + '/events', `Bearer ${token}`)

  await client.event.actions.assignment.assign.mutate({
    eventId,
    transactionId: uuidv4(),
    type: ActionType.ASSIGN,
    assignedTo: getUserIdFromToken(token)
  })

  await client.event.actions.archive.request.mutate({
    eventId,
    transactionId: uuidv4(),
    declaration: {},
    annotation: {},
    content: { reason: 'Regression control record — nothing inactive' }
  })

  return eventId
}
