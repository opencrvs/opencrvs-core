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
import { Request, ResponseToolkit } from '@hapi/hapi'
import { getDefaultLanguage } from '@notification/i18n/utils'
import {
  findCompositionSection,
  findExtension,
  findResourceFromBundleById,
  getComposition,
  getResourceFromBundleById,
  getStatusFromTask,
  getTaskFromSavedBundle,
  getTrackingId,
  InProgressRecord,
  Location,
  Patient,
  RelatedPerson,
  resourceIdentifierToUUID,
  SavedRelatedPerson
} from '@opencrvs/commons/types'
import { sendNotification } from '@notification/features/sms/utils'
import { messageKeys } from '@notification/i18n/messages'
import { badRequest as boomBadRequest } from '@hapi/boom'

function badRequest(record: InProgressRecord, message: string): never {
  const task = getTaskFromSavedBundle(record)
  const taskStatus = getStatusFromTask(task)
  throw boomBadRequest(`${message} in ${taskStatus} record`)
}

function getOfficeName(record: InProgressRecord) {
  const task = getTaskFromSavedBundle(record)
  const officeExtension = findExtension(
    'http://opencrvs.org/specs/extension/regLastOffice',
    task.extension
  )
  return officeExtension?.valueString
}

function getInformantName(record: InProgressRecord) {
  const composition = getComposition(record)
  const informantSection = findCompositionSection(
    'informant-details',
    composition
  )
  if (!informantSection) {
    return null
  }
  const informantRelation: Partial<SavedRelatedPerson> =
    getResourceFromBundleById<RelatedPerson>(
      record,
      resourceIdentifierToUUID(informantSection.entry[0].reference)
    )
  if (!informantRelation.patient?.reference) {
    return null
  }
  const informant = findResourceFromBundleById<Patient>(
    record,
    resourceIdentifierToUUID(informantRelation.patient.reference)
  )
  const name = informant?.name?.find(({ use }) => use === 'en')
  if (!name) {
    return null
  }
  return [name.given?.join(' '), name.family.join(' ')].join(' ').trim()
}

function getRegistrationLocation(record: InProgressRecord) {
  const task = getTaskFromSavedBundle(record)
  const locationExtension = findExtension(
    'http://opencrvs.org/specs/extension/regLastLocation',
    task.extension
  )
  if (!locationExtension) {
    badRequest(record, 'no last registration office found')
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

function getContactPhoneNo(record: InProgressRecord) {
  const task = getTaskFromSavedBundle(record)
  const phoneNumberExtension = findExtension(
    'http://opencrvs.org/specs/extension/contact-person-phone-number',
    task.extension
  )
  return phoneNumberExtension?.valueString
}

function getContactEmail(record: InProgressRecord) {
  const task = getTaskFromSavedBundle(record)
  const emailExtension = findExtension(
    'http://opencrvs.org/specs/extension/contact-person-email',
    task.extension
  )
  return emailExtension?.valueString
}

export async function birthInProgressNotification(
  req: Request,
  h: ResponseToolkit
) {
  const inProgressRecord = req.payload as InProgressRecord
  await sendNotification(
    req,
    {
      sms: messageKeys.birthInProgressNotification,
      email: messageKeys.birthInProgressNotification
    },
    {
      sms: getContactPhoneNo(inProgressRecord),
      email: getContactEmail(inProgressRecord)
    },
    'informant',
    {
      trackingId: getTrackingId(inProgressRecord),
      crvsOffice: getOfficeName(inProgressRecord),
      registrationLocation: getRegistrationLocation(inProgressRecord),
      informantName: getInformantName(inProgressRecord)
    }
  )
  return h.response().code(200)
}

export async function deathInProgressNotification(
  req: Request,
  h: ResponseToolkit
) {
  const inProgressRecord = req.payload as InProgressRecord
  await sendNotification(
    req,
    {
      sms: messageKeys.birthInProgressNotification,
      email: messageKeys.birthInProgressNotification
    },
    {
      sms: getContactPhoneNo(inProgressRecord),
      email: getContactEmail(inProgressRecord)
    },
    'informant',
    {
      trackingId: getTrackingId(inProgressRecord),
      crvsOffice: getOfficeName(inProgressRecord),
      registrationLocation: getRegistrationLocation(inProgressRecord),
      informantName: getInformantName(inProgressRecord)
    }
  )
  return h.response().code(200)
}
