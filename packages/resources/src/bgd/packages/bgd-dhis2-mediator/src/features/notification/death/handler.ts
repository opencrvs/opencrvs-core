import * as Hapi from 'hapi'
import {
  createPersonEntry,
  createDeathEncounterEntry,
  createBundle,
  createComposition,
  createTaskEntry,
  IIncomingAddress
} from '@search/features/fhir/service'
import { postBundle, fetchUnionByFullBBSCode } from '@search/features/fhir/api'

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

  await postBundle(bundle, request.headers.authorization)

  return h.response().code(201)
}
