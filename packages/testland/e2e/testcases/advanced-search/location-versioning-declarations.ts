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
import { createClient } from '@opencrvs/toolkit/api'
import { ActionType, AddressType } from '@opencrvs/toolkit/events'
import { CREDENTIALS, GATEWAY_HOST } from '../../constants'
import { getToken } from '../../helpers'
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
 * Registered (as a registrar seeded specifically at that office) at an office
 * that is active when created but later inactivated; born at a health
 * facility that later becomes inactive; residential address stays on an
 * always-active administrative area.
 */
export async function createBirthRegisteredWithInactiveOfficeAndFacility() {
  const token = await getToken(CREDENTIALS.REGISTRAR_OLD_CENTRAL_OFFICE)

  const facilities = await getLocations('HEALTH_FACILITY', token)
  const facilityId = getIdByName(facilities, 'Old Central Maternity Hospital')

  const declaration = await getBirthDeclaration({
    token,
    placeOfBirthType: 'HEALTH_FACILITY',
    partialDeclaration: {
      'child.birthLocation': facilityId,
      'child.birthLocationId': facilityId
    }
  })

  return createBirthDeclaration(token, declaration, ActionType.REGISTER)
}

/**
 * Registered at the same office (and by the same registrar) as
 * `createBirthRegisteredWithInactiveOfficeAndFacility`; place of death and
 * residential/other address both point at the same inactive administrative
 * area — used to confirm that unit is included in the place-of-death facet
 * but excluded from the residential/other-address facet, despite being the
 * identical location.
 */
export async function createDeathRegisteredWithInactiveAddress() {
  const token = await getToken(CREDENTIALS.REGISTRAR_OLD_CENTRAL_OFFICE)

  const administrativeAreas = await getAdministrativeAreas(token)
  const klowNorthOldId = getIdByName(administrativeAreas, 'Klow-north (old)')

  const inactiveAdminAreaAddress = {
    country: 'FAR',
    addressType: AddressType.DOMESTIC,
    administrativeArea: klowNorthOldId
  }

  return createDeathDeclaration(
    token,
    {
      'eventDetails.placeOfDeath': 'OTHER',
      'eventDetails.deathLocationOther': inactiveAdminAreaAddress,
      'eventDetails.deathLocationId': klowNorthOldId,
      'deceased.address': inactiveAdminAreaAddress
    },
    ActionType.REGISTER
  )
}

/**
 * Registered (full REGISTER flow, as a registrar seeded specifically at that
 * office) at an office that is active when created but inactivated much
 * later; residential address stays on an always-active administrative area.
 */
export async function createBirthRegisteredWithInactiveOffice() {
  const token = await getToken(CREDENTIALS.REGISTRAR_OLD_IBOMBO_OFFICE)

  return createBirthDeclaration(
    token,
    undefined,
    ActionType.REGISTER,
    'PRIVATE_HOME'
  )
}

/**
 * Registered at the same office (and by the same registrar) as
 * `createBirthRegisteredWithInactiveOffice`; place of death is a health
 * facility that becomes inactive on the same date as the office; residential
 * address stays on an always-active administrative area.
 */
export async function createDeathRegisteredWithInactiveOfficeAndFacility() {
  const token = await getToken(CREDENTIALS.REGISTRAR_OLD_IBOMBO_OFFICE)

  const facilities = await getLocations('HEALTH_FACILITY', token)
  const facilityId = getIdByName(facilities, 'Old Ibombo Community Clinic')

  return createDeathDeclaration(
    token,
    {
      'eventDetails.placeOfDeath': 'HEALTH_FACILITY',
      'eventDetails.deathLocation': facilityId,
      'eventDetails.deathLocationId': facilityId
    },
    ActionType.REGISTER
  )
}

/**
 * Notified with an active office; the child's own "other" address field
 * points at an inactive administrative area — used to confirm that field is
 * excluded from the residential/other-address facet even when the office is
 * active, mirroring the same inactive admin unit used in
 * `createDeathRegisteredWithInactiveAddress`.
 */
export async function createBirthNotifiedWithInactiveOtherAddress() {
  const token = await getToken(CREDENTIALS.REGISTRAR)

  const administrativeAreas = await getAdministrativeAreas(token)
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

  return createBirthDeclaration(token, declaration, ActionType.NOTIFY)
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
