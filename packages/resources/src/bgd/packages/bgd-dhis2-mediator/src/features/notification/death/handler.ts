import * as Hapi from 'hapi'
import {
  createPersonEntry,
  createDeathEncounterEntry,
  createBundle
} from '@search/features/fhir/service'
import {
  fetchLocationByIdentifier,
  postBundle
} from '@search/features/fhir/utils'

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
  const notification = request.payload as IDeathNotification

  const child = createPersonEntry(
    notification.deceased.nid || null,
    notification.deceased.first_names_en || null,
    notification.deceased.last_name_en,
    null,
    notification.deceased.sex || 'unknown',
    null,
    notification.deceased.date_birth
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
    null,
    notification.father.first_names_en || null,
    notification.father.last_name_en,
    notification.permanent_address,
    'male',
    notification.phone_number,
    null
  )

  const locationId = notification.union_death_ocurred.id
  const location = await fetchLocationByIdentifier(locationId)

  const encounter = createDeathEncounterEntry(
    `Location/${location.id}`,
    child.fullUrl
  )

  const entries: fhir.BundleEntry[] = []
  entries.push(child)
  entries.push(mother)
  entries.push(father)
  entries.push(encounter)

  const bundle = createBundle(entries)

  await postBundle(bundle)

  return h.response().code(201)
}
