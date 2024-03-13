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
  Task,
  WithStrictExtensions,
  findExtension,
  WithUUID
} from '.'

export type OpenCRVSPractitionerName = Omit<fhir3.HumanName, 'use'> & {
  use: string
}

export type PractitionerRole = fhir3.PractitionerRole
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

export function isPractitionerRoleHistory<T extends Resource>(
  resource: T
): resource is T & PractitionerRoleHistory {
  return resource.resourceType === 'PractitionerRoleHistory'
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

export function getPractitionerIdFromTask(task: Task) {
  const extension = findExtension(
    'http://opencrvs.org/specs/extension/regLastUser',
    task.extension
  )
  if (!extension) {
    throw new Error('No practitioner found in task')
  }
  return extension.valueReference.reference.split('/')[1]
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
