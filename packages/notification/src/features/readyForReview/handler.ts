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
  getComposition,
  getResourceFromBundleById,
  getTaskFromSavedBundle,
  getTrackingId,
  ReadyForReviewRecord,
  Location,
  Patient,
  resourceIdentifierToUUID,
  urlReferenceToUUID,
  getStatusFromTask,
  RelatedPerson
} from '@opencrvs/commons/types'
import { sendNotification } from '@notification/features/sms/utils'
import { messageKeys } from '@notification/i18n/messages'

function error(record: ReadyForReviewRecord, message: string): never {
  const task = getTaskFromSavedBundle(record)
  const taskStatus = getStatusFromTask(task)
  throw new Error(`${message} in ${taskStatus} record`)
}

function getOfficeName(record: ReadyForReviewRecord) {
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

function getInformantName(record: ReadyForReviewRecord) {
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

function getDeceasedName(record: ReadyForReviewRecord) {
  const composition = getComposition(record)
  const deceasedSection = findCompositionSection(
    'deceased-details',
    composition
  )
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

function getRegistrationLocation(record: ReadyForReviewRecord) {
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

function getContactPhoneNo(record: ReadyForReviewRecord) {
  const task = getTaskFromSavedBundle(record)
  const phoneNumberExtension = findExtension(
    'http://opencrvs.org/specs/extension/contact-person-phone-number',
    task.extension
  )
  return phoneNumberExtension?.valueString
}

function getContactEmail(record: ReadyForReviewRecord) {
  const task = getTaskFromSavedBundle(record)
  const emailExtension = findExtension(
    'http://opencrvs.org/specs/extension/contact-person-email',
    task.extension
  )
  return emailExtension?.valueString
}

export async function birthReadyForReviewNotification(
  req: Request,
  h: ResponseToolkit
) {
  const readyForReviewRecord = req.payload as ReadyForReviewRecord
  await sendNotification(
    req,
    {
      sms: messageKeys.birthInProgressNotification,
      email: messageKeys.birthInProgressNotification
    },
    {
      sms: getContactPhoneNo(readyForReviewRecord),
      email: getContactEmail(readyForReviewRecord)
    },
    'informant',
    {
      trackingId: getTrackingId(readyForReviewRecord),
      crvsOffice: getOfficeName(readyForReviewRecord),
      registrationLocation: getRegistrationLocation(readyForReviewRecord),
      informantName: getInformantName(readyForReviewRecord)
    }
  )
  return h.response().code(200)
}

export async function deathReadyForReviewNotification(
  req: Request,
  h: ResponseToolkit
) {
  const readyForReviewRecord = req.payload as ReadyForReviewRecord
  await sendNotification(
    req,
    {
      sms: messageKeys.birthInProgressNotification,
      email: messageKeys.birthInProgressNotification
    },
    {
      sms: getContactPhoneNo(readyForReviewRecord),
      email: getContactEmail(readyForReviewRecord)
    },
    'informant',
    {
      trackingId: getTrackingId(readyForReviewRecord),
      crvsOffice: getOfficeName(readyForReviewRecord),
      registrationLocation: getRegistrationLocation(readyForReviewRecord),
      name: getDeceasedName(readyForReviewRecord),
      informantName: getInformantName(readyForReviewRecord)
    }
  )
  return h.response().code(200)
}
