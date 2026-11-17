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

/**
 * Declaration with only the fields of the birth notification form (see
 * `src/events/birth/forms/notificationForm.ts`), all required ones filled in.
 * NOTIFY rejects any field outside that form. The optional `child.birthLocationId` is left
 * out, so the record's place of event stays the notifier's office.
 * Hospital officials, the only notifiers, can only choose a health facility as the place of birth.
 */
export async function getNotificationDeclaration({
  token,
  facility,
  partialDeclaration = {}
}: {
  token: string
  facility?: string
  partialDeclaration?: Record<string, any>
}) {
  const { 'child.birthLocationId': _, ...placeOfBirth } = await getPlaceOfBirth(
    'HEALTH_FACILITY',
    token,
    facility
  )

  return {
    'child.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'child.gender': 'female',
    // Late registrations can not be notified
    'child.dob': randomPastDate(14),
    'child.birthType': 'SINGLE',
    'child.attendantAtBirth': 'PHYSICIAN',
    ...placeOfBirth,
    'mother.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'mother.dob': dateToIsoDateString(
      // Must be at least 18 years before child.dob
      faker.date.between({ from: '1995-09-12', to: '2000-11-28' })
    ),
    ...partialDeclaration
  }
}

/** Annotation of the NOTIFY action: the birth notify review has no fields, only the dialog's comment. */
export const NOTIFY_ANNOTATION = { comments: 'My comment' }

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
    (action === ActionType.NOTIFY
      ? await getNotificationDeclaration({ token })
      : await getDeclaration({ placeOfBirthType, token }))

  const client = createClient(GATEWAY_HOST + '/events', `Bearer ${token}`)

  const createResponse = await client.event.create.mutate({
    type: 'birth',
    transactionId: uuidv4(),
    createdAtLocation
  })

  const eventId = createResponse.id as string

  if (action === ActionType.NOTIFY) {
    const notifyRes = await client.event.actions.notify.request.mutate({
      eventId: eventId,
      transactionId: uuidv4(),
      declaration,
      annotation: NOTIFY_ANNOTATION,
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

  const filename = await uploadFile(getSignatureFile(), token)

  const annotation = {
    'review.comment': 'My comment',
    'review.signature': filename
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

  // Mirror the UI "not a duplicate" flow: if declare flagged a potential
  // duplicate, dismiss it so the record can continue to register.
  const duplicateDetected = declareRes.actions.find(
    (action) =>
      action.type === ActionType.DUPLICATE_DETECTED &&
      action.status === ActionStatus.Accepted
  )
  if (duplicateDetected) {
    await client.event.actions.assignment.assign.mutate({
      eventId,
      type: 'ASSIGN',
      assignedTo: duplicateDetected.createdBy,
      transactionId: uuidv4(),
      declaration: {},
      annotation: {},
      keepAssignment: true
    })
    await client.event.actions.duplicate.markNotDuplicate.mutate({
      eventId,
      transactionId: uuidv4(),
      declaration: {},
      keepAssignment: true
    })
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
