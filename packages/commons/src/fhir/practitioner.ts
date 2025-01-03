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
import {
  Bundle,
  Resource,
  WithStrictExtensions,
  WithUUID,
  SavedReference
} from '.'

export type OpenCRVSPractitionerName = Omit<fhir3.HumanName, 'use'> & {
  use: string
}

export type PractitionerRole = Omit<fhir3.PractitionerRole, 'location'> & {
  location: [SavedReference]
}
export type PractitionerRoleHistory = PractitionerRole

export type Practitioner = WithStrictExtensions<
  Omit<fhir3.Practitioner, 'name' | 'telecom'> & {
    name: Array<OpenCRVSPractitionerName>
    telecom: Array<fhir3.ContactPoint>
  }
>

export type SavedPractitioner = WithUUID<Practitioner>

export function isPractitioner<T extends Resource>(
  resource: T
): resource is T & Practitioner {
  return resource.resourceType === 'Practitioner'
}
export function isPractitionerRole<T extends Resource>(
  resource: T
): resource is T & PractitionerRole {
  return resource.resourceType === 'PractitionerRole'
}

export function isPractitionerRoleOrPractitionerRoleHistory<T extends Resource>(
  resource: T
): resource is (T & PractitionerRoleHistory) | (T & PractitionerRole) {
  return ['PractitionerRoleHistory', 'PractitionerRole'].includes(
    resource.resourceType
  )
}

export function getPractitioner(id: string, bundle: Bundle) {
  const practitioner = bundle.entry
    .map(({ resource }) => resource)
    .filter(isPractitioner)
    .find((resource) => resource.id === id)

  if (!practitioner) {
    throw new Error(`Practitioner ${id} not found in bundle`)
  }
  return practitioner
}

export function getPractitionerContactDetails(practitioner: Practitioner) {
  const msisdn = practitioner.telecom.find((t) => t.system === 'phone')?.value
  const email = practitioner.telecom.find((t) => t.system === 'email')?.value

  if (msisdn && email) {
    return { msisdn, email }
  }

  if (msisdn) {
    return { msisdn }
  }

  if (email) {
    return { email }
  }

  throw new Error('No contact details found for practitioner')
}

export const getUserRoleFromHistory = (
  practitionerRoleHistory: PractitionerRoleHistory[],
  lastModified: string
) => {
  const practitionerRoleHistorySorted = practitionerRoleHistory.sort((a, b) => {
    if (a.meta?.lastUpdated === b.meta?.lastUpdated) {
      return 0
    }
    if (a.meta?.lastUpdated === undefined) {
      return 1
    }
    if (b.meta?.lastUpdated === undefined) {
      return -1
    }
    return (
      new Date(b.meta?.lastUpdated).valueOf() -
      new Date(a.meta?.lastUpdated).valueOf()
    )
  })

  const result = practitionerRoleHistorySorted.find(
    (it) =>
      it?.meta?.lastUpdated &&
      lastModified &&
      it?.meta?.lastUpdated <= lastModified!
  )

  const targetCode = result?.code?.find((element) => {
    return element.coding?.[0].system === 'http://opencrvs.org/specs/roles'
  })

  const role = targetCode?.coding?.[0].code
  return role
}
