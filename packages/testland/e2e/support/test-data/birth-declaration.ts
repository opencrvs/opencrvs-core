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
import { GATEWAY_HOST } from '@e2e/support/constants'
import { faker } from '@faker-js/faker'
import {
  getLocations,
  getIdByName,
  getAdministrativeAreas
} from '@e2e/support/birth/helpers'
import { createClient } from '@opencrvs/toolkit/api'
import {
  ActionDocument,
  ActionStatus,
  ActionType,
  ActionUpdate,
  AddressType
} from '@opencrvs/toolkit/events'
import { getSignatureFile, uploadFile } from './utils'
import { dateToIsoDateString, randomPastDate } from '@e2e/support/helpers'

type InformantRelation = 'MOTHER' | 'BROTHER'

function getInformantDetails(
  informantRelation: InformantRelation,
  village?: string
) {
  if (informantRelation === 'MOTHER') {
    return {
      'informant.relation': informantRelation,
      'informant.email': 'mothers@email.com'
    }
  }

  return {
    'informant.relation': informantRelation,
    'informant.email': 'brothers@email.com',
    'informant.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'informant.address': {
      country: 'FAR',
      administrativeArea: village,
      addressType: AddressType.DOMESTIC
    },
    'informant.dob': '2008-09-12',
    'informant.nationality': 'FAR',
    'informant.idType': 'NATIONAL_ID',
    'informant.nid': faker.string.numeric(10)
  }
}

export async function getPlaceOfBirth(
  type: 'PRIVATE_HOME' | 'HEALTH_FACILITY',
  token: string,
  name?: string
) {
  if (type === 'HEALTH_FACILITY') {
    const locations = await getLocations('HEALTH_FACILITY', token)
    const locationId = getIdByName(locations, name ?? 'Klow Village Hospital')

    return {
      'child.placeOfBirth': 'HEALTH_FACILITY',
      'child.birthLocation': locationId,
      'child.birthLocationId': locationId
    }
  }

  if (type === 'PRIVATE_HOME') {
    const administrativeAreas = await getAdministrativeAreas(token)

    const village = getIdByName(administrativeAreas, 'Klow')

    return {
      'child.placeOfBirth': 'PRIVATE_HOME',
      'child.birthLocation.privateHome': {
        country: 'FAR',
        addressType: AddressType.DOMESTIC,
        administrativeArea: village
      },
      'child.birthLocationId': village
    }
  }

  throw new Error('Invalid place of birth type')
}

export async function getDeclaration({
  informantRelation = 'MOTHER',
  partialDeclaration = {},
  placeOfBirthType = 'PRIVATE_HOME',
  token
}: {
  informantRelation?: InformantRelation
  partialDeclaration?: Record<string, any>
  placeOfBirthType?: 'PRIVATE_HOME' | 'HEALTH_FACILITY'
  token: string
}) {
  const administrativeAreas = await getAdministrativeAreas(token)

  const village = getIdByName(administrativeAreas, 'Klow')

  /**
   * NOTE: This will inevitably result to duplicate detected, unless we introduce more randomness.
   */
  const mockDeclaration = {
    'father.detailsNotAvailable': true,
    // Only include 'father.reason' if partialDeclaration doesn't have 'father.detailsNotAvailable'
    ...(!('father.detailsNotAvailable' in partialDeclaration)
      ? { 'father.reason': 'Father is missing.' }
      : {}),
    'mother.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'mother.dob': dateToIsoDateString(
      faker.date
        // DOB must be at least 18 years after mother.dob to pass validation
        // Upper bound ensures the record appears on the first page of search results
        .between({ from: '1995-09-12', to: '2000-11-28' })
    ),
    'mother.nationality': 'FAR',
    'mother.idType': 'NATIONAL_ID',
    'mother.nid': faker.string.numeric(10),
    'mother.address': {
      country: 'FAR',
      addressType: AddressType.DOMESTIC,
      administrativeArea: village
    },
    'child.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'child.gender': 'female',
    'child.dob': randomPastDate(14),
    ...(await getPlaceOfBirth(placeOfBirthType, token)),
    ...getInformantDetails(informantRelation, village)
  }

  // 💡 Merge overriden fields
  return {
    ...mockDeclaration,
    ...partialDeclaration
  }
}

export type Declaration = Awaited<ReturnType<typeof getDeclaration>>

export interface CreateDeclarationResponse {
  eventId: string
  declaration: Declaration
  trackingId?: string
  registrationNumber?: string
}

export async function createDeclaration(
  token: string,
  dec?: ActionUpdate,
  action: ActionType = ActionType.REGISTER,
  placeOfBirthType?: 'PRIVATE_HOME' | 'HEALTH_FACILITY',
  /**
   * Only honored for a system/integration token — the server resolves it
   * from the user's own `primaryOfficeId` for a normal user token, ignoring
   * this value entirely (see `buildAction`/`createEvent` in
   * packages/events/src/service/events/events.ts).
   */
  createdAtLocation?: string
): Promise<CreateDeclarationResponse> {
  const declaration =
    dec ??
    (await getDeclaration({
      placeOfBirthType,
      token,
      partialDeclaration:
        action === ActionType.NOTIFY
          ? // Drop arbitrary fields not needed for notify action
            { 'mother.nid': null, 'mother.dob': null }
          : undefined
    }))

  const client = createClient(GATEWAY_HOST + '/events', `Bearer ${token}`)

  const createResponse = await client.event.create.mutate({
    type: 'birth',
    transactionId: uuidv4(),
    createdAtLocation
  })

  const eventId = createResponse.id as string

  const filename = await uploadFile(getSignatureFile(), token)

  const annotation = {
    'review.comment': 'My comment',
    'review.signature': filename
  }

  if (action === ActionType.NOTIFY) {
    const notifyRes = await client.event.actions.notify.request.mutate({
      eventId: eventId,
      transactionId: uuidv4(),
      declaration,
      annotation,
      createdAtLocation
    })

    const declareAction = notifyRes.actions.find(
      (action: ActionDocument) => action.type === ActionType.NOTIFY
    )

    if (!declareAction || !('declaration' in declareAction)) {
      throw new Error('Declaration info not found in action')
    }

    return {
      eventId,
      declaration: declareAction?.declaration as Declaration
    }
  }

  const declareRes = await client.event.actions.declare.request.mutate({
    eventId,
    transactionId: uuidv4(),
    declaration,
    annotation,
    keepAssignment: action !== ActionType.DECLARE,
    createdAtLocation
  })

  if (action === ActionType.DECLARE) {
    const declareAction = declareRes.actions.find(
      (action) => action.type === ActionType.DECLARE
    )

    if (!declareAction || !('declaration' in declareAction)) {
      throw new Error('Declaration info not found in action')
    }

    return {
      eventId,
      declaration: declareAction?.declaration as Declaration,
      trackingId: declareRes.trackingId
    }
  }

  const registerRes = await client.event.actions.register.request.mutate({
    eventId,
    transactionId: uuidv4(),
    declaration,
    annotation,
    createdAtLocation
  })

  const registerActionRequested = registerRes.actions.find(
    (action: ActionDocument) =>
      action.type === ActionType.REGISTER &&
      action.status === ActionStatus.Requested
  )
  const registerActionAccepted = registerRes.actions.find(
    (action: ActionDocument) =>
      action.type === ActionType.REGISTER &&
      action.status === ActionStatus.Accepted
  )

  const trackingId = registerRes?.trackingId as string
  const registrationNumber =
    registerActionAccepted?.registrationNumber as string

  return {
    eventId,
    declaration: registerActionRequested?.declaration as Declaration,
    trackingId,
    registrationNumber
  }
}

/**
 * Notifies and then declares the same event as the same user, so that
 * `legalStatuses.NOTIFIED.createdBy` is set to the caller. Roles scoped by
 * `notifiedBy`/`notifiedIn` (e.g. Hospital Official) need this to retain
 * `record.read`/`record.edit` access to a record they later declare.
 */
export async function notifyAndDeclare(
  token: string,
  placeOfBirthType?: 'PRIVATE_HOME' | 'HEALTH_FACILITY'
): Promise<CreateDeclarationResponse> {
  const declaration = await getDeclaration({ placeOfBirthType, token })

  const client = createClient(GATEWAY_HOST + '/events', `Bearer ${token}`)

  const createResponse = await client.event.create.mutate({
    type: 'birth',
    transactionId: uuidv4()
  })

  const eventId = createResponse.id as string

  const filename = await uploadFile(getSignatureFile(), token)

  const annotation = {
    'review.comment': 'My comment',
    'review.signature': filename
  }

  await client.event.actions.notify.request.mutate({
    eventId,
    transactionId: uuidv4(),
    declaration,
    annotation,
    keepAssignment: true
  })

  // A NOTIFIED event only allows DECLARE once an EDIT action is the latest
  // accepted action (sets the EDIT_IN_PROGRESS flag, which unlocks DECLARE).
  await client.event.actions.edit.request.mutate({
    eventId,
    transactionId: uuidv4(),
    declaration,
    annotation,
    keepAssignmentIfAccepted: true
  })

  const declareRes = await client.event.actions.declare.request.mutate({
    eventId,
    transactionId: uuidv4(),
    declaration,
    annotation
  })

  const declareAction = declareRes.actions.find(
    (action) => action.type === ActionType.DECLARE
  )

  if (!declareAction || !('declaration' in declareAction)) {
    throw new Error('Declaration info not found in action')
  }

  return {
    eventId,
    declaration: declareAction.declaration as Declaration,
    trackingId: declareRes.trackingId
  }
}
