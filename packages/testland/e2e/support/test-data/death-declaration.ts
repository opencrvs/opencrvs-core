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
  ActionType,
  ActionUpdate,
  AddressType
} from '@opencrvs/toolkit/events'
import { getSignatureFile, uploadFile } from './utils'
import { omitBy } from 'lodash'

type PlaceOfDeathType = 'DECEASED_USUAL_RESIDENCE' | 'OTHER' | 'HEALTH_FACILITY'

async function getPlaceOfDeath(
  type: PlaceOfDeathType,
  token: string,
  village: string
) {
  if (type === 'HEALTH_FACILITY') {
    const locations = await getLocations('HEALTH_FACILITY', token)
    const locationId = getIdByName(locations, 'Klow Village Hospital')

    return {
      'eventDetails.deathLocation': locationId,
      'eventDetails.deathLocationId': locationId
    }
  }

  if (type === 'DECEASED_USUAL_RESIDENCE') {
    return {
      'eventDetails.deathLocationId': village
    }
  }

  if (type === 'OTHER') {
    return {
      'eventDetails.deathLocationOther': {
        country: 'FAR',
        addressType: AddressType.DOMESTIC,
        administrativeArea: village
      },
      'eventDetails.deathLocationId': village
    }
  }

  throw new Error('Invalid place of death type')
}

async function getDeclaration({
  partialDeclaration = {},
  placeOfDeathType: placeOfDeathType = 'OTHER',
  token
}: {
  partialDeclaration?:
    | ((_: Record<string, any>) => Record<string, any>)
    | Record<string, any>
  placeOfDeathType?: PlaceOfDeathType
  token: string
}) {
  const administrativeAreas = await getAdministrativeAreas(token)
  const village = getIdByName(administrativeAreas, 'Klow')

  const mockDeclaration = {
    'spouse.dob': '1975-02-18',
    'spouse.age': undefined,
    'spouse.nid': faker.string.numeric(10),
    'spouse.name': {
      firstname: faker.person.firstName('female'),
      surname: faker.person.lastName('female')
    },
    'deceased.dob': '1950-04-21',
    'deceased.nid': faker.string.numeric(10),
    'deceased.name': {
      firstname: faker.person.firstName('male'),
      surname: faker.person.lastName('male')
    },
    'spouse.idType': 'NATIONAL_ID',
    'deceased.gender': 'male',
    'deceased.idType': 'NATIONAL_ID',
    'informant.email': faker.internet.email(),
    'eventDetails.date': new Date(Date.now() - 60 * 60 * 24 * 1000)
      .toISOString()
      .split('T')[0], // yesterday
    'informant.relation': 'SPOUSE',
    'spouse.nationality': 'FAR',
    'deceased.nationality': 'FAR',
    'spouse.addressSameAs': 'YES',
    'deceased.maritalStatus': 'MARRIED',
    'deceased.address': {
      country: 'FAR',
      addressType: AddressType.DOMESTIC,
      administrativeArea: village
    },
    'eventDetails.placeOfDeath': placeOfDeathType,
    'eventDetails.mannerOfDeath': 'MANNER_NATURAL',
    'deceased.numberOfDependants': 3,
    'eventDetails.sourceCauseDeath': 'PHYSICIAN',
    'eventDetails.causeOfDeathEstablished': true,
    ...(await getPlaceOfDeath(placeOfDeathType, token, village))
  }

  const overrides =
    typeof partialDeclaration === 'function'
      ? partialDeclaration(mockDeclaration)
      : partialDeclaration

  // 💡 Merge overriden fields, clear payload
  return omitBy(
    {
      ...mockDeclaration,
      ...overrides
    },
    (d) => d === undefined
  ) as typeof mockDeclaration
}

export type Declaration = Awaited<ReturnType<typeof getDeclaration>>

export interface CreateDeclarationResponse {
  eventId: string
  declaration: Declaration
}

export async function createDeclaration(
  token: string,
  dec?: ((_: ActionUpdate) => Partial<ActionUpdate>) | Partial<ActionUpdate>,
  action: ActionType = ActionType.REGISTER,
  placeOfDeathType?: PlaceOfDeathType,
  /**
   * Only honored for a system/integration token — the server resolves it
   * from the user's own `primaryOfficeId` for a normal user token, ignoring
   * this value entirely (see `buildAction`/`createEvent` in
   * packages/events/src/service/events/events.ts).
   */
  createdAtLocation?: string
): Promise<CreateDeclarationResponse> {
  const declaration = await getDeclaration({
    partialDeclaration: dec,
    placeOfDeathType: placeOfDeathType,
    token
  })

  const client = createClient(GATEWAY_HOST + '/events', `Bearer ${token}`)

  const createResponse = await client.event.create.mutate({
    type: 'death',
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
    eventId: eventId,
    transactionId: uuidv4(),
    declaration,
    annotation,
    keepAssignment: action !== ActionType.DECLARE,
    createdAtLocation
  })

  if (action === ActionType.DECLARE) {
    const declareAction = declareRes.actions.find(
      (action) => action.type === 'DECLARE'
    )

    if (!declareAction || !('declaration' in declareAction)) {
      throw new Error('Declaration info not found in action')
    }

    return { eventId, declaration: declareAction?.declaration as Declaration }
  }

  const registerRes = await client.event.actions.register.request.mutate({
    eventId: eventId,
    transactionId: uuidv4(),
    declaration,
    annotation,
    createdAtLocation
  })

  const registerAction = registerRes.actions.find(
    (action: ActionDocument) => action.type === 'REGISTER'
  )

  return { eventId, declaration: registerAction?.declaration as Declaration }
}
