import * as Hapi from 'hapi'
import {
  createPersonEntry,
  createDeathEncounterEntry,
  createBundle,
  createComposition,
  createTaskEntry,
  IIncomingAddress
} from '@bgd-dhis2-mediator/features/fhir/service'
import {
  postBundle,
  fetchUnionByFullBBSCode
} from '@bgd-dhis2-mediator/features/fhir/api'
import {
  RUN_AS_MEDIATOR,
  MEDIATOR_URN,
  FHIR_URL
} from '@bgd-dhis2-mediator/constants'

export interface IDeathNotification {
  deceased: {
    first_names_en?: [string]
    last_name_en: string
    first_names_bn?: [string]
    last_name_bn: string
    sex?: 'male' | 'female' | 'unknown'
    nid?: string
    nid_spouse?: string
    date_birth: string
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
  death_date: string
  cause_death_a_immediate?: string
  place_of_death?: {
    id: string
    name: string
  }
  union_death_ocurred: {
    id: string
    name: string
  }
}

export async function deathNotificationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const notification = JSON.parse(
    request.payload as string
  ) as IDeathNotification

  const deceased = await createPersonEntry(
    notification.deceased.nid || null,
    notification.deceased.first_names_en || null,
    notification.deceased.last_name_en,
    null,
    notification.deceased.sex || 'unknown',
    null,
    notification.deceased.date_birth,
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
    null,
    notification.father.first_names_en || null,
    notification.father.last_name_en,
    notification.permanent_address,
    'male',
    notification.phone_number,
    null,
    request.headers.authorization
  )

  const locationId = notification.union_death_ocurred.id
  const location = await fetchUnionByFullBBSCode(
    locationId,
    request.headers.authorization
  )

  if (!location) {
    throw new Error('Could not find union by full BBS code')
  }

  const encounter = createDeathEncounterEntry(
    `Location/${location.id}`,
    deceased.fullUrl
  )

  const composition = createComposition(
    'DEATH',
    deceased.fullUrl,
    mother.fullUrl,
    father.fullUrl,
    encounter.fullUrl
  )
  const task = createTaskEntry(composition.fullUrl, 'DEATH')

  const entries: fhir.BundleEntry[] = []
  entries.push(composition)
  entries.push(task)
  entries.push(deceased)
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
