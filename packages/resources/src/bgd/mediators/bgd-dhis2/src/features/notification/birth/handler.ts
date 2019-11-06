/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import * as Hapi from 'hapi'
import {
  createPersonEntry,
  createBirthEncounterEntry,
  createBundle,
  createTaskEntry,
  createComposition,
  IIncomingAddress
} from '@bgd-dhis2-mediator/features/fhir/service'
import {
  postBundle,
  fetchUnionByFullBBSCode,
  fetchFacilityByHRISId
} from '@bgd-dhis2-mediator/features/fhir/api'
import {
  RUN_AS_MEDIATOR,
  MEDIATOR_URN,
  FHIR_URL
} from '@bgd-dhis2-mediator/constants'

export interface IBirthNotification {
  child: {
    first_names_en?: [string]
    last_name_en: string
    first_names_bn?: [string]
    last_name_bn: string
    sex?: 'male' | 'female' | 'unknown'
  }
  father: {
    first_names_en?: [string]
    last_name_en: string
    first_names_bn?: [string]
    last_name_bn: string
    nid?: string
  }
  mother: {
    first_names_en?: [string]
    last_name_en: string
    first_names_bn?: [string]
    last_name_bn: string
    nid?: string
  }
  permanent_address: IIncomingAddress
  phone_number: string
  date_birth: string
  place_of_birth?: {
    id: string
    name: string
  }
  union_birth_ocurred: {
    id: string
    name: string
  }
}

export async function birthNotificationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const notification = JSON.parse(
    request.payload as string
  ) as IBirthNotification

  const child = await createPersonEntry(
    null,
    notification.child.first_names_en || null,
    notification.child.last_name_en,
    null,
    notification.child.sex || 'unknown',
    null,
    notification.date_birth,
    request.headers.authorization
  )
  const mother = await createPersonEntry(
    notification.mother.nid || null,
    notification.mother.first_names_en || null,
    notification.mother.last_name_en,
    notification.permanent_address,
    'female',
    notification.phone_number,
    null,
    request.headers.authorization
  )
  const father = await createPersonEntry(
    notification.father.nid || null,
    notification.father.first_names_en || null,
    notification.father.last_name_en,
    notification.permanent_address,
    'male',
    notification.phone_number,
    null,
    request.headers.authorization
  )
  if (!notification.place_of_birth) {
    throw new Error('Could not find any place of birth')
  }
  const placeOfBirthFacilityLocation = await fetchFacilityByHRISId(
    notification.place_of_birth.id,
    request.headers.authorization
  )
  if (!placeOfBirthFacilityLocation) {
    throw new Error('Could not find facility by HRIS ID')
  }

  const encounter = createBirthEncounterEntry(
    `Location/${placeOfBirthFacilityLocation.id}`,
    child.fullUrl
  )

  const composition = createComposition(
    'BIRTH',
    child.fullUrl,
    mother.fullUrl,
    father.fullUrl,
    encounter.fullUrl
  )

  const lastRegLocId = notification.union_birth_ocurred.id
  const lastRegLocation = await fetchUnionByFullBBSCode(
    lastRegLocId,
    request.headers.authorization
  )

  if (!lastRegLocation) {
    throw new Error('Could not find last registered union by full BBS code')
  }

  const task = await createTaskEntry(
    composition.fullUrl,
    lastRegLocation,
    'BIRTH',
    request.headers.authorization
  )
  // Contact type is always passing MOTHER
  // as based on the type both mother last name and phone number is required
  // TODO: may need to change it based on the available data from dhis2
  assignBirthContactPoint(task.resource, 'MOTHER', notification.phone_number)

  const entries: fhir.BundleEntry[] = []
  entries.push(composition)
  entries.push(task)
  entries.push(child)
  entries.push(mother)
  entries.push(father)
  entries.push(encounter)

  const bundle = createBundle(entries)

  const startTime = new Date().toISOString()
  await postBundle(bundle, request.headers.authorization)
  const endTime = new Date().toISOString()

  if (RUN_AS_MEDIATOR) {
    return h
      .response({
        'x-mediator-urn': MEDIATOR_URN,
        status: 'Successful',
        response: { status: 201 },
        orchestrations: [
          {
            name: 'Submit converted birth bundle',
            request: {
              path: FHIR_URL,
              method: 'POST',
              timestamp: startTime,
              body: JSON.stringify(bundle)
            },
            response: { status: 200, timestamp: endTime }
          }
        ]
      })
      .code(201)
      .header('Content-Type', 'application/json+openhim')
  }

  return h.response().code(201)
}

function assignBirthContactPoint(
  task: fhir.Task,
  contact: string,
  number: string
) {
  if (!task.extension) {
    task.extension = []
  }
  task.extension.push({
    url: 'http://opencrvs.org/specs/extension/contact-person',
    valueString: contact
  })
  task.extension.push({
    url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
    valueString: number
  })
}
