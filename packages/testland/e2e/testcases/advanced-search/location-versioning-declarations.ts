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
import { GATEWAY_HOST } from '../../constants'
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

/**
 * Registered at an office that is active when created but later inactivated;
 * born at a health facility that later becomes inactive; residential address
 * stays on an always-active administrative area.
 */
export async function createBirthDeclaredWithInactiveOfficeAndFacility(
  clientToken: string
) {
  const [offices, facilities] = await Promise.all([
    getLocations('CRVS_OFFICE', clientToken),
    getLocations('HEALTH_FACILITY', clientToken)
  ])
  const officeId = getIdByName(offices, 'Old Central Registration Office')
  const facilityId = getIdByName(facilities, 'Old Central Maternity Hospital')

  const declaration = await getBirthDeclaration({
    token: clientToken,
    placeOfBirthType: 'HEALTH_FACILITY',
    partialDeclaration: {
      'child.birthLocation': facilityId,
      'child.birthLocationId': facilityId
    }
  })

  return createBirthDeclaration(
    clientToken,
    declaration,
    ActionType.DECLARE,
    undefined,
    officeId
  )
}

/**
 * Registered at the same inactive office as
 * `createBirthDeclaredWithInactiveOfficeAndFacility`; place of death and
 * residential/other address both point at the same inactive administrative
 * area — used to confirm that unit is included in the place-of-death facet
 * but excluded from the residential/other-address facet, despite being the
 * identical location.
 */
export async function createDeathDeclaredWithSharedInactiveAddress(
  clientToken: string
) {
  const [offices, administrativeAreas] = await Promise.all([
    getLocations('CRVS_OFFICE', clientToken),
    getAdministrativeAreas(clientToken)
  ])
  const officeId = getIdByName(offices, 'Old Central Registration Office')
  const klowNorthOldId = getIdByName(administrativeAreas, 'Klow-north (old)')

  const inactiveAdminAreaAddress = {
    country: 'FAR',
    addressType: AddressType.DOMESTIC,
    administrativeArea: klowNorthOldId
  }

  return createDeathDeclaration(
    clientToken,
    {
      'eventDetails.placeOfDeath': 'OTHER',
      'eventDetails.deathLocationOther': inactiveAdminAreaAddress,
      'eventDetails.deathLocationId': klowNorthOldId,
      'deceased.address': inactiveAdminAreaAddress
    },
    ActionType.DECLARE,
    undefined,
    officeId
  )
}

/**
 * Registered (full REGISTER flow) at an office that is active when created
 * but inactivated much later; residential address stays on an always-active
 * administrative area.
 */
export async function createBirthRegisteredWithInactiveOffice(
  clientToken: string
) {
  const offices = await getLocations('CRVS_OFFICE', clientToken)
  const officeId = getIdByName(offices, 'Old Ibombo Registration Office')

  return createBirthDeclaration(
    clientToken,
    undefined,
    ActionType.REGISTER,
    'PRIVATE_HOME',
    officeId
  )
}

/**
 * Registered (full REGISTER flow) at the same inactive office as
 * `createBirthRegisteredWithInactiveOffice`; place of death is a health
 * facility that becomes inactive on the same date as the office; residential
 * address stays on an always-active administrative area.
 */
export async function createDeathRegisteredWithInactiveOfficeAndFacility(
  clientToken: string
) {
  const [offices, facilities] = await Promise.all([
    getLocations('CRVS_OFFICE', clientToken),
    getLocations('HEALTH_FACILITY', clientToken)
  ])
  const officeId = getIdByName(offices, 'Old Ibombo Registration Office')
  const facilityId = getIdByName(facilities, 'Old Ibombo Community Clinic')

  return createDeathDeclaration(
    clientToken,
    {
      'eventDetails.placeOfDeath': 'HEALTH_FACILITY',
      'eventDetails.deathLocation': facilityId,
      'eventDetails.deathLocationId': facilityId
    },
    ActionType.REGISTER,
    undefined,
    officeId
  )
}

/**
 * Notified with an active office; the child's own "other" address field
 * points at an inactive administrative area — used to confirm that field is
 * excluded from the residential/other-address facet even when the office is
 * active, mirroring the same inactive admin unit used in
 * `createDeathDeclaredWithSharedInactiveAddress`.
 */
export async function createBirthNotifiedWithInactiveOtherAddress(
  clientToken: string
) {
  const [offices, administrativeAreas] = await Promise.all([
    getLocations('CRVS_OFFICE', clientToken),
    getAdministrativeAreas(clientToken)
  ])
  const officeId = getIdByName(offices, 'Ibombo District Office')
  const klowNorthOldId = getIdByName(administrativeAreas, 'Klow-north (old)')

  const declaration = await getBirthDeclaration({
    token: clientToken,
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
    clientToken,
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
 */
export async function createDeathArchivedControlRecord(clientToken: string) {
  const [offices, facilities, administrativeAreas] = await Promise.all([
    getLocations('CRVS_OFFICE', clientToken),
    getLocations('HEALTH_FACILITY', clientToken),
    getAdministrativeAreas(clientToken)
  ])
  const officeId = getIdByName(offices, 'Isamba District Office')
  const facilityId = getIdByName(facilities, 'Isamba District Hospital')
  const mbulaId = getIdByName(administrativeAreas, 'Mbula')

  const { eventId } = await createDeathDeclaration(
    clientToken,
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
    ActionType.DECLARE,
    undefined,
    officeId
  )

  const client = createClient(GATEWAY_HOST + '/events', `Bearer ${clientToken}`)
  await client.event.actions.archive.request.mutate({
    eventId,
    transactionId: uuidv4(),
    declaration: {},
    annotation: {},
    content: { reason: 'Regression control record — nothing inactive' }
  })

  return eventId
}
