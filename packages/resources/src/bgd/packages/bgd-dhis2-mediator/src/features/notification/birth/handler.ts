import * as Hapi from 'hapi'
import {
  createPersonEntry,
  createBirthEncounterEntry,
  createBundle,
  createTaskEntry,
  createComposition
} from '@search/features/fhir/service'
import {
  postBundle,
  fetchLocationByFullBBSCode
} from '@search/features/fhir/api'

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
  permanent_address: {
    division?: {
      id: string
      name: string
    }
    district?: {
      id: string
      name: string
    }
    upazila?: {
      id: string
      name: string
    }
    city_corporation?: {
      id: string
      name: string
    }
    municipality?: {
      id: string
      name: string
    }
    ward?: {
      id: string
      name: string
    }
    union: {
      id: string
      name: string
    }
  }
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

  const child = createPersonEntry(
    null,
    notification.child.first_names_en || null,
    notification.child.last_name_en,
    null,
    notification.child.sex || 'unknown',
    null,
    notification.date_birth
  )
  const mother = createPersonEntry(
    notification.mother.nid || null,
    notification.mother.first_names_en || null,
    notification.mother.last_name_en,
    notification.permanent_address,
    'female',
    notification.phone_number,
    null
  )
  const father = createPersonEntry(
    notification.father.nid || null,
    notification.father.first_names_en || null,
    notification.father.last_name_en,
    notification.permanent_address,
    'male',
    notification.phone_number,
    null
  )

  const locationId = notification.union_birth_ocurred.id
  const location = await fetchLocationByFullBBSCode(
    locationId,
    request.headers.authorization
  )

  const encounter = createBirthEncounterEntry(
    `Location/${location.id}`,
    child.fullUrl
  )

  const composition = createComposition(
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
