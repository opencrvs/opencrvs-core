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

async function getPlaceOfBirth(
  type: 'PRIVATE_HOME' | 'HEALTH_FACILITY',
  token: string
) {
  if (type === 'HEALTH_FACILITY') {
    const locations = await getLocations('HEALTH_FACILITY', token)
    const locationId = getIdByName(locations, 'Klow Village Hospital')

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

function generateCustomPhoneNumber() {
  // Starts with 0
  // Second digit is 7 or 9
  // Followed by 8 digits (0-9)
  const secondDigit = Math.random() < 0.5 ? '7' : '9'
  let rest = ''
  for (let i = 0; i < 8; i++) {
    rest += Math.floor(Math.random() * 10)
  }
  return `0${secondDigit}${rest}`
}

async function getDeclaration({
  partialDeclaration = {},
  placeOfBirthType = 'PRIVATE_HOME',
  token
}: {
  partialDeclaration?: Record<string, any>
  placeOfBirthType?: 'PRIVATE_HOME' | 'HEALTH_FACILITY'
  token: string
}) {
  const administrativeAreas = await getAdministrativeAreas(token)
  const district = getIdByName(administrativeAreas, 'Ibombo')
  const village = getIdByName(administrativeAreas, 'Klow')

  if (!district || !village) {
    throw new Error('District or village not found')
  }

  const mockDeclaration = {
    'mother.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'mother.dob': '1995-09-12',
    'mother.nationality': 'FAR',
    'mother.idType': 'NATIONAL_ID',
    'mother.nid': faker.string.numeric(10),
    'mother.address': {
      country: 'FAR',
      addressType: AddressType.DOMESTIC,
      administrativeArea: village,
      streetLevelDetails: { town: 'Dhaka' }
    },
    'father.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'father.dob': '1995-09-12',
    'father.nationality': 'FAR',
    'father.idType': 'NATIONAL_ID',
    'father.nid': faker.string.numeric(10),
    'father.addressSameAs': 'NO',
    'father.address': {
      country: 'FAR',
      addressType: AddressType.DOMESTIC,
      administrativeArea: village,
      streetLevelDetails: { town: 'Dhaka' }
    },
    'child.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'child.gender': 'female',
    'child.dob': new Date(Date.now() - 60 * 60 * 24 * 1000)
      .toISOString()
      .split('T')[0], // yesterday
    ...(await getPlaceOfBirth(placeOfBirthType, token)),
    'informant.relation': 'BROTHER',
    'informant.email': 'brothers@email.com',
    'informant.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'informant.dob': '2008-09-12',
    'informant.nationality': 'FAR',
    'informant.idType': 'NATIONAL_ID',
    'informant.phoneNo': generateCustomPhoneNumber(),
    'informant.nid': faker.string.numeric(10),
    'informant.address': {
      country: 'FAR',
      administrativeArea: village,
      addressType: AddressType.DOMESTIC
    }
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
  trackingId: string
  declaration: Declaration
}

export async function createDeclaration(
  token: string,
  dec?: Partial<ActionUpdate>,
  action: ActionType = ActionType.REGISTER,
  placeOfBirthType?: 'PRIVATE_HOME' | 'HEALTH_FACILITY'
): Promise<CreateDeclarationResponse> {
  const declaration = await getDeclaration({
    partialDeclaration: dec,
    placeOfBirthType,
    token
  })

  const client = createClient(GATEWAY_HOST + '/events', `Bearer ${token}`)

  const createResponse = await client.event.create.mutate({
    type: 'birth',
    transactionId: uuidv4()
  })
  const eventId = createResponse.id as string
  const trackingId = createResponse.trackingId

  const file = await uploadFile(getSignatureFile(), token)

  const annotation = {
    'review.comment': 'My comment',
    'review.signature': file
  }

  const declareRes = await client.event.actions.declare.request.mutate({
    eventId: eventId,
    transactionId: uuidv4(),
    declaration,
    annotation,
    keepAssignment: true
  })

  if (action === ActionType.DECLARE) {
    const declareAction = declareRes.actions.find(
      (action) => action.type === 'DECLARE'
    )

    if (!declareAction || !('declaration' in declareAction)) {
      throw new Error('Declaration info not found in action')
    }

    return {
      eventId,
      trackingId,
      declaration: declareAction?.declaration as Declaration
    }
  }

  const registerRes = await client.event.actions.register.request.mutate({
    eventId: eventId,
    transactionId: uuidv4(),
    declaration,
    annotation
  })

  const registerAction = registerRes.actions.find(
    (action: ActionDocument) => action.type === 'REGISTER'
  )

  return {
    eventId,
    trackingId,
    declaration: registerAction?.declaration as Declaration
  }
}

export const getChildNameFromRecord = (record: CreateDeclarationResponse) => {
  return `${record.declaration['child.name'].firstname} ${record.declaration['child.name'].surname}`
}
