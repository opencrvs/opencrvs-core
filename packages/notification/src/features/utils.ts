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

import { getDefaultLanguage } from '@notification/i18n/utils'
import {
  findCompositionSection,
  findExtension,
  getComposition,
  getResourceFromBundleById,
  getStatusFromTask,
  getTaskFromSavedBundle,
  Location,
  Patient,
  ReadyForReviewRecord,
  RegisteredRecord,
  RelatedPerson,
  resourceIdentifierToUUID,
  urlReferenceToUUID
} from '@opencrvs/commons/types'
import { badRequest as boomBadRequest } from '@hapi/boom'

export function getContactPhoneNo(
  record: ReadyForReviewRecord | RegisteredRecord
) {
  const task = getTaskFromSavedBundle(record)
  const phoneNumberExtension = findExtension(
    'http://opencrvs.org/specs/extension/contact-person-phone-number',
    task.extension
  )
  return phoneNumberExtension?.valueString
}

export function getContactEmail(
  record: ReadyForReviewRecord | RegisteredRecord
) {
  const task = getTaskFromSavedBundle(record)
  const emailExtension = findExtension(
    'http://opencrvs.org/specs/extension/contact-person-email',
    task.extension
  )
  return emailExtension?.valueString
}

function error(
  record: ReadyForReviewRecord | RegisteredRecord,
  message: string
): never {
  const task = getTaskFromSavedBundle(record)
  const taskStatus = getStatusFromTask(task)
  throw boomBadRequest(`${message} in ${taskStatus} record`)
}

export function getOfficeName(record: ReadyForReviewRecord | RegisteredRecord) {
  const task = getTaskFromSavedBundle(record)
  const officeExtension = findExtension(
    'http://opencrvs.org/specs/extension/regLastOffice',
    task.extension
  )
  if (!officeExtension?.valueString) {
    error(record, 'Office extension not found')
  }
  return officeExtension.valueString
}

export function getInformantName(
  record: ReadyForReviewRecord | RegisteredRecord
) {
  const composition = getComposition(record)
  const informantSection = findCompositionSection(
    'informant-details',
    composition
  )
  if (!informantSection) {
    error(record, 'informant section not found')
  }
  const informantRelation = getResourceFromBundleById<RelatedPerson>(
    record,
    urlReferenceToUUID(informantSection.entry[0].reference)
  )
  const informant = getResourceFromBundleById<Patient>(
    record,
    urlReferenceToUUID(informantRelation.patient.reference)
  )
  const name = informant.name.find(({ use }) => use === 'en')
  if (!name) {
    error(record, 'name not found in informant patient resource')
  }
  return [name.given?.join(' '), name.family.join(' ')].join(' ').trim()
}

export function getDeclarationName(
  record: ReadyForReviewRecord | RegisteredRecord,
  compositionCode: 'deceased-details' | 'child-details'
) {
  const composition = getComposition(record)
  const deceasedSection = findCompositionSection(compositionCode, composition)
  if (!deceasedSection) {
    error(record, 'deceased section not found')
  }
  const deceased = getResourceFromBundleById<Patient>(
    record,
    urlReferenceToUUID(deceasedSection.entry[0].reference)
  )
  const name = deceased.name.find(({ use }) => use === 'en')
  if (!name) {
    error(record, 'name not found in deceased patient resource')
  }
  return [name.given?.join(' '), name.family.join(' ')].join(' ').trim()
}

export function getRegistrationLocation(
  record: ReadyForReviewRecord | RegisteredRecord
) {
  const task = getTaskFromSavedBundle(record)
  const locationExtension = findExtension(
    'http://opencrvs.org/specs/extension/regLastLocation',
    task.extension
  )
  if (!locationExtension) {
    error(record, 'No last registration office found')
  }
  const location = getResourceFromBundleById<Location>(
    record,
    resourceIdentifierToUUID(locationExtension.valueReference.reference)
  )
  const language = getDefaultLanguage()
  return (
    (language === 'en'
      ? location.name
      : location.alias?.[0] ?? location.name) ?? ''
  )
}

export function getRegistrationNumber(record: RegisteredRecord): string {
  const taskEntryResource = getTaskFromSavedBundle(record)
  const identiferWithRn = taskEntryResource.identifier.find((obj) =>
    obj.system.endsWith('registration-number')
  )
  if (!identiferWithRn)
    throw new Error('Could not find registration number in bundle')
  return identiferWithRn.value
}
