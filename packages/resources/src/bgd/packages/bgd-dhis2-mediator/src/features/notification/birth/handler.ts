import * as Hapi from 'hapi'
import {
  createPersonEntry,
  createBirthEncounterEntry,
  createBundle,
  createTaskEntry,
  createComposition,
  IIncomingAddress
} from '@search/features/fhir/service'
import { postBundle, fetchUnionByFullBBSCode } from '@search/features/fhir/api'

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

  const locationId = notification.union_birth_ocurred.id
  const location = await fetchUnionByFullBBSCode(
    locationId,
    request.headers.authorization
  )

  if (!location) {
    throw new Error('Could not find union by full BBS code')
  }

  const encounter = createBirthEncounterEntry(
    `Location/${location.id}`,
    child.fullUrl
  )

  const composition = createComposition(
    'BIRTH',
    child.fullUrl,
    mother.fullUrl,
    father.fullUrl,
    encounter.fullUrl
  )
  const task = createTaskEntry(composition.fullUrl, 'BIRTH')

  const entries: fhir.BundleEntry[] = []
  entries.push(composition)
  entries.push(task)
  entries.push(child)
  entries.push(mother)
  entries.push(father)
  entries.push(encounter)

  const bundle = createBundle(entries)

  await postBundle(bundle, request.headers.authorization)

  return h.response().code(201)
}
