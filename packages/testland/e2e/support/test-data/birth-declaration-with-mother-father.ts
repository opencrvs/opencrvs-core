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
import { subYears, format } from 'date-fns'

type InformantRelation = 'MOTHER' | 'BROTHER'

function getInformantDetails(informantRelation: InformantRelation) {
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
    'informant.dob': '2008-09-12',
    'informant.nationality': 'FAR',
    'informant.idType': 'NATIONAL_ID',
    'informant.nid': faker.string.numeric(10)
  }
}

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
        administrativeArea: village,
        streetLevelDetails: { town: 'Dhaka' }
      },
      'child.birthLocationId': village
    }
  }

  throw new Error('Invalid place of birth type')
}

async function getDeclaration({
  informantRelation = 'MOTHER',
  partialDeclaration = {},
  placeOfBirthType = 'PRIVATE_HOME',
  token
}: {
  informantRelation?: InformantRelation
  partialDeclaration?: any
  placeOfBirthType?: 'PRIVATE_HOME' | 'HEALTH_FACILITY'
  token: string
}) {
  const administrativeAreas = await getAdministrativeAreas(token)
  const province = getIdByName(administrativeAreas, 'Central')
  const district = getIdByName(administrativeAreas, 'Ibombo')
  const village = getIdByName(administrativeAreas, 'Klow')

  if (!province || !district || !village) {
    throw new Error('Province, district or village not found')
  }

  const mockDeclaration = {
    'father.detailsNotAvailable': true,
    // Add default reason if: (a) user didn’t specify 'father.detailsNotAvailable', or (b) specified it but forgot the reason
    ...(!('father.detailsNotAvailable' in partialDeclaration) ||
    (partialDeclaration['father.detailsNotAvailable'] === true &&
      !('father.reason' in partialDeclaration))
      ? { 'father.reason': 'Father is missing.' }
      : {}),
    'mother.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'mother.dob': '1995-09-12',
    'mother.dobUnknown': false,
    'mother.nationality': 'FAR',
    'mother.idType': 'NATIONAL_ID',
    'mother.educationalAttainment': 'NO_SCHOOLING',
    'mother.maritalStatus': 'MARRIED',
    'mother.nid': faker.string.numeric(10),
    'mother.address': {
      country: 'FAR',
      administrativeArea: village,
      addressType: AddressType.DOMESTIC
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
    ...getInformantDetails(informantRelation)
  }

  // 💡 Merge overriden fields
  return {
    ...mockDeclaration,
    ...('father.detailsNotAvailable' in partialDeclaration &&
      !partialDeclaration['father.detailsNotAvailable'] && {
        'father.detailsNotAvailable': false,
        'father.name': {
          firstname: faker.person.firstName('male'),
          surname: faker.person.lastName('male')
        },
        'father.dob': format(subYears(new Date(), 30), 'yyyy-MM-dd'),
        'father.idType': 'NATIONAL_ID',
        'father.nid': faker.string.numeric(10),
        'father.nationality': 'FAR',
        'father.maritalStatus': 'SINGLE',
        'father.educationalAttainment': 'NONE',
        'father.occupation': 'Unemployed',
        ...(partialDeclaration['father.addressSameAs'] === 'NO' && {
          'father.address': {
            country: 'FAR',
            addressType: 'DOMESTIC' as const,
            province,
            district,
            village,
            urbanOrRural: 'URBAN' as const
          }
        })
      }),
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

  const filename = await uploadFile(getSignatureFile(), token)

  const annotation = {
    'review.comment': 'My comment',
    'review.signature': filename
  }
  const declareRes = await client.event.actions.declare.request.mutate({
    eventId: eventId,
    transactionId: uuidv4(),
    declaration,
    annotation,
    keepAssignment: action !== ActionType.DECLARE
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
      declaration: declareAction?.declaration as Declaration,
      trackingId: declareRes?.trackingId as string
    }
  }

  const registerRes = await client.event.actions.register.request.mutate({
    eventId: eventId,
    transactionId: uuidv4(),
    declaration,
    annotation
  })

  const registerAction = registerRes.actions.find(
    (action: ActionDocument) =>
      action.type === 'REGISTER' && action.status === 'Accepted'
  )

  const registerRequestAction = registerRes.actions.find(
    (action: ActionDocument) =>
      action.type === 'REGISTER' && action.status === 'Requested'
  )

  const trackingId = registerRes?.trackingId as string
  const registrationNumber = registerAction?.registrationNumber as string

  return {
    eventId,
    declaration: registerRequestAction?.declaration as Declaration,
    trackingId,
    registrationNumber
  }
}
